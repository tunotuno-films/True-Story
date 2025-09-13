import React, { useState, useEffect } from 'react';
import { Users, Building } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import IndividualAuthForm from './IndividualAuthForm';
import SponsorAuthForm from './SponsorAuthForm';
import type { AuthFormProps, AuthFormData } from '../types/auth';
import { handleGoogleAuth, checkMemberExists, generateYears, generateMonths, generateDays, robustSignOut } from '../utils/authUtils';

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'usertype' | 'individual' | 'sponsor' | 'signin'>('signin');
  const [showAdditionalInfoForm, setShowAdditionalInfoForm] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isCheckingMember, setIsCheckingMember] = useState(false);
  const [authFormData, setAuthFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    lastName: '',
    firstName: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    gender: '',
    phoneNumber: '',
    nickname: '',
  });

  useEffect(() => {
    if (initialMode === 'signin') {
      setMode('signin');
    } else {
      setMode('usertype');
    }
  }, [initialMode]);

  // Google認証処理
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthForm - Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          const isGoogleAuth = user.app_metadata?.provider === 'google';
          
          if (isGoogleAuth) {
            console.log('AuthForm - Google auth detected for user:', user.id);
            setIsCheckingMember(true);
            
            // 5秒後にタイムアウト処理
            const timeout = setTimeout(async () => {
              console.log('Member check timeout - logging out user');
              try {
                await supabase.auth.signOut();
                setIsCheckingMember(false);
                setShowAdditionalInfoForm(false);
                setGoogleUser(null);
                setMode('usertype'); // ユーザータイプ選択に戻る
              } catch (error) {
                console.error('Timeout logout error:', error);
              }
            }, 5000);

            try {
              const existingMember = await checkMemberExists(user.id);
              clearTimeout(timeout); // 成功時はタイムアウトをクリア
              
              console.log('AuthForm - Member check result:', existingMember);
              
              if (!existingMember) {
                console.log('AuthForm - No existing member found, showing additional info form');
                // 会員情報がない場合は追加情報入力フォームを表示
                setGoogleUser(user);
                setAuthFormData(prev => ({
                  ...prev,
                  email: user.email || '',
                  nickname: ''
                }));
                setShowAdditionalInfoForm(true);
                setIsCheckingMember(false);
              } else {
                console.log('AuthForm - Existing member found, proceeding with login');
                // 既存会員の場合はログイン完了
                const userName = existingMember.nickname || `${existingMember.last_name} ${existingMember.first_name}`;
                setIsCheckingMember(false);
                onAuthSuccess(user.email || '', userName);
              }
            } catch (error) {
              clearTimeout(timeout);
              console.error('Member check error:', error);
              // エラー時は追加情報入力フォームを表示（新規登録として扱う）
              console.log('AuthForm - Error occurred, showing additional info form');
              setGoogleUser(user);
              setAuthFormData(prev => ({
                ...prev,
                email: user.email || '',
                nickname: ''
              }));
              setShowAdditionalInfoForm(true);
              setIsCheckingMember(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setShowAdditionalInfoForm(false);
          setGoogleUser(null);
          setIsCheckingMember(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  // 初回ロード時の現在セッションチェックも追加
  useEffect(() => {
    const checkCurrentSession = async () => {
      // OAuth リダイレクトで付与されるハッシュがある場合、supabase に処理させる
      try {
        if (
          typeof window !== 'undefined' &&
          window.location.hash &&
          (window.location.hash.includes('access_token') ||
            window.location.hash.includes('error') ||
            window.location.hash.includes('provider_token'))
        ) {
          console.log('AuthForm - processing auth callback from URL hash');
          try {
            // supabase-js v2 does not expose getSessionFromUrl; use getSession to obtain the current session instead
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              console.warn('getSession error:', error);
            } else {
              console.log('getSession data:', data);
            }
          } catch (e) {
            console.error('Error calling getSession:', e);
          }
          // URLのハッシュを消してクリーンにする
          try {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          } catch (e) {
            console.warn('Failed to replace history state', e);
          }
        }
      } catch (e) {
        console.error('Error handling auth callback hash:', e);
      }

      // 既存のセッションチェック処理
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        const isGoogleAuth = user.app_metadata?.provider === 'google';
        
        if (isGoogleAuth) {
          console.log('AuthForm - Existing Google session found:', user.id);
          setIsCheckingMember(true);
          
          const existingMember = await checkMemberExists(user.id);
          
          if (!existingMember) {
            console.log('AuthForm - No member record for existing Google session');
            setGoogleUser(user);
            setAuthFormData(prev => ({
              ...prev,
              email: user.email || '',
              nickname: ''
            }));
            setShowAdditionalInfoForm(true);
          } else {
            console.log('AuthForm - Existing member for current session');
            const userName = existingMember.nickname || `${existingMember.last_name} ${existingMember.first_name}`;
            onAuthSuccess(user.email || '', userName);
          }
          
          setIsCheckingMember(false);
        }
      }
    };

    checkCurrentSession();
  }, [onAuthSuccess]);

  const handleAdditionalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (googleUser) {
        // member_idを直接生成（タイムスタンプ + ランダム値）
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const memberId = `IND${timestamp}${random}`;

        const birthDate = authFormData.birthYear && authFormData.birthMonth && authFormData.birthDay 
          ? `${authFormData.birthYear}-${authFormData.birthMonth.padStart(2, '0')}-${authFormData.birthDay.padStart(2, '0')}` 
          : '';

        const memberRecord = {
          member_id: memberId,
          auth_user_id: googleUser.id,
          last_name: authFormData.lastName,
          first_name: authFormData.firstName,
          birth_date: birthDate,
          gender: authFormData.gender,
          email: googleUser.email,
          phone_number: authFormData.phoneNumber,
          nickname: authFormData.nickname,
        };

        // より長い待機時間でセッション確立を待つ
        await new Promise(resolve => setTimeout(resolve, 2000));

        // セッション確立を確認
        let sessionAttempts = 0;
        let session = null;
        
        while (sessionAttempts < 10) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession && currentSession.user) {
            session = currentSession;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
          sessionAttempts++;
        }

        if (!session) {
          throw new Error('認証セッションの確立がタイムアウトしました。ページを再読み込みして再度お試しください。');
        }

        // individual_membersテーブルに挿入
        const { data, error: insertError } = await supabase
          .from('individual_members')
          .insert([memberRecord])
          .select();

        if (insertError) {
          console.error('Insert error details:', insertError);
          throw insertError;
        }

        console.log('Successfully inserted member:', data);

        // user_metadataも更新して一貫性を保つ
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            last_name: authFormData.lastName,
            first_name: authFormData.firstName,
            full_name: `${authFormData.lastName} ${authFormData.firstName}`,
            nickname: authFormData.nickname
          }
        });

        if (updateError) {
          console.error('User metadata update error:', updateError);
        }

        // 個人_members挿入成功後のリダイレクト
        const userName = authFormData.nickname || `${authFormData.lastName} ${authFormData.firstName}`;
        setShowAdditionalInfoForm(false);
        setGoogleUser(null);
        
        console.log('AuthForm - Additional info submitted, calling onAuthSuccess with member data');
        onAuthSuccess(googleUser.email, userName);
        // handleAuthSuccess 側で /users/member へリダイレクトされます
      }
    } catch (error) {
      console.error('Additional info submission error:', error);
      alert('追加情報の保存でエラーが発生しました: ' + (error as Error).message);
    }
  };

  const handleCancelGoogleAuth = async () => {
    await robustSignOut();
    setShowAdditionalInfoForm(false);
    setGoogleUser(null);
  };

  if (isCheckingMember) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">認証確認中...</h2>
          <p className="text-neutral-300 mb-6">しばらくお待ちください</p>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-neutral-400 mt-4">5秒以上かかる場合は自動的にリセットされます</p>
        </div>
      </div>
    );
  }

  if (showAdditionalInfoForm) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">追加情報の入力</h2>
          <p className="text-neutral-300 text-sm">
            Google認証が完了しました。会員登録を完了するために、以下の情報を入力してください。
          </p>
        </div>

        <form onSubmit={handleAdditionalInfoSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                苗字 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={authFormData.lastName}
                onChange={(e) => setAuthFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
                required
                placeholder="山田"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={authFormData.firstName}
                onChange={(e) => setAuthFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
                required
                placeholder="太郎"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              ニックネーム <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={authFormData.nickname}
              onChange={(e) => setAuthFormData(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="たろう"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={authFormData.birthYear}
                onChange={(e) => setAuthFormData(prev => ({ ...prev, birthYear: e.target.value, birthDay: '' }))}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">年</option>
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
              
              <select
                value={authFormData.birthMonth}
                onChange={(e) => setAuthFormData(prev => ({ ...prev, birthMonth: e.target.value, birthDay: '' }))}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">月</option>
                {generateMonths().map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
              
              <select
                value={authFormData.birthDay}
                onChange={(e) => setAuthFormData(prev => ({ ...prev, birthDay: e.target.value }))}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
                disabled={!authFormData.birthYear || !authFormData.birthMonth}
              >
                <option value="">日</option>
                {generateDays(authFormData.birthYear, authFormData.birthMonth).map(day => (
                  <option key={day} value={day}>{day}日</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              性別 <span className="text-red-500">*</span>
            </label>
            <select
              value={authFormData.gender}
              onChange={(e) => setAuthFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
              required
            >
              <option value="">選択してください</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              携帯電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={authFormData.phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                const filteredValue = value.replace(/[^\d-]/g, '');
                setAuthFormData(prev => ({ ...prev, phoneNumber: filteredValue }));
              }}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="090-1234-5678"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleCancelGoogleAuth}
              className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white px-5 py-3 rounded-md text-base transition duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-3 rounded-md text-base transition duration-200"
            >
              登録を完了する
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'usertype') {
    return (
      <div className="max-w-md mx-auto p-8">
        {/* <h2 className="text-2xl font-bold mb-6 text-center text-white">タイプを選択</h2> */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => {
              setMode('individual');
            }}
            className="w-full p-4 text-left bg-neutral-700 border border-neutral-600 rounded-md hover:bg-neutral-600 transition duration-200"
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-bold text-white">メンバーシップ</h3>
                <p className="text-sm text-neutral-400">個人ユーザーの方はこちら</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setMode('sponsor');
            }}
            className="w-full p-4 text-left bg-neutral-700 border border-neutral-600 rounded-md hover:bg-neutral-600 transition duration-200"
          >
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-bold text-white">スポンサーシップ</h3>
                <p className="text-sm text-neutral-400">企業・団体の方はこちら</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'individual') {
    return (
      <div className="max-w-md mx-auto p-8">
        <button
          onClick={() => setMode('usertype')}
          className="mb-4 text-blue-400 hover:text-blue-300 text-sm"
        >
          ← ユーザータイプ選択に戻る
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-white">メンバーシップ</h2>

        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 flex items-center justify-center gap-3 px-5 py-3 rounded-md transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-base">Googleでログイン</span>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-900 text-neutral-400">または</span>
            </div>
          </div>
        </div>

        <IndividualAuthForm onAuthSuccess={onAuthSuccess} />
      </div>
    );
  }

  if (mode === 'sponsor') {
    return (
      <div className="max-w-md mx-auto p-8">
        <button
          onClick={() => setMode('usertype')}
          className="mb-4 text-blue-400 hover:text-blue-300 text-sm"
        >
          ← ユーザータイプ選択に戻る
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-white">スポンサーシップ</h2>
        <SponsorAuthForm onAuthSuccess={onAuthSuccess} />
      </div>
    );
  }

  // signin mode
  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">ログイン</h2>
      
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 flex items-center justify-center gap-3 px-5 py-3 rounded-md transition duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-base">Googleで登録</span>
        </button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-neutral-900 text-neutral-400">または</span>
          </div>
        </div>
      </div>

      <IndividualAuthForm onAuthSuccess={onAuthSuccess} />
    </div>
  );
};

export default AuthForm;