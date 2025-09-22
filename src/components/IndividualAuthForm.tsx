import React, { useState, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { AuthFormData, AuthFormProps } from '../types/auth';
import {
  generateYears,
  generateMonths,
  generateDays,
  formatBirthDate,
  calculatePasswordStrength,
  handleGoogleAuth, // 追加
  checkMemberExists, // 追加
  robustSignOut // 追加
} from '../utils/authUtils';
import { useNavigate } from 'react-router-dom'; // 追加
import LoginErrorModal from './LoginErrorModal'; // 追加

// 新しいメンバーIDを生成する関数
const generateNewMemberId = async () => {
  // 1. 'TS2025'で始まるIDの中から、最後に登録されたものを降順で取得する
  const { data, error } = await supabase
    .from('member_ids_view')
    .select('member_id')
    .like('member_id', 'TS2025%')
    .order('member_id', { ascending: false })
    .limit(1)
    .maybeSingle(); // テーブルが空の場合もエラーにしない

  if (error) {
    console.error('Error fetching latest member_id:', error);
    // エラーの場合はフォールバックとしてランダムなIDを生成
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TS_ERR${timestamp}${random}`;
  }

  let newIdNumber = 1;
  if (data && data.member_id) {
    // IDの数字部分を抽出して、次の番号を計算
    const lastIdNumber = parseInt(data.member_id.substring(6), 10);
    if (!isNaN(lastIdNumber)) {
      newIdNumber = lastIdNumber + 1;
    }
  }

  // 2. 新しいIDを生成 (TS2025 + 4桁の連番)
  const paddedId = String(newIdNumber).padStart(4, '0');
  return `TS2025${paddedId}`;
};

const IndividualAuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);
  const [formData, setFormData] = useState<AuthFormData>({
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
  const [googleUser, setGoogleUser] = useState<any>(null); // 追加
  const [isCheckingMember, setIsCheckingMember] = useState(false); // 追加
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false); // 追加
  const [loginErrorMessage, setLoginErrorMessage] = useState(''); // 追加
  const navigate = useNavigate(); // 追加

  const passwordStrength = calculatePasswordStrength(formData.password || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      const filteredValue = value.replace(/[^\w@.-]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'password') {
      const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'phoneNumber') {
      const filteredValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Google認証処理 (AuthFormから移植)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('IndividualAuthForm - 認証状態の変更:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          const isGoogleAuth = user.app_metadata?.provider === 'google';
          
          if (isGoogleAuth) {
            console.log('IndividualAuthForm - Google認証が検出されました。', user.id);
            setIsCheckingMember(true);
            
            const timeout = setTimeout(async () => {
              console.log('Member check timeout - ユーザーをログアウトします。');
              try {
                await supabase.auth.signOut();
                setIsCheckingMember(false);
                setShowAdditionalInfo(false);
                setGoogleUser(null);
                navigate('/users'); // タイムアウト時はユーザータイプ選択に戻る
              } catch (error) {
                console.error('Timeout logout error:', error);
              }
            }, 5000);

            try {
              const existingMember = await checkMemberExists(user.id);
              clearTimeout(timeout);

              console.log('IndividualAuthForm - メンバー確認結果:', existingMember);

              if (!existingMember) {
                console.log('IndividualAuthForm - 既存のメンバーが見つかりませんでした。追加情報フォームを表示します。');
                setGoogleUser(user);
                setFormData(prev => ({
                  ...prev,
                  email: user.email || '',
                  nickname: user.user_metadata?.full_name || user.user_metadata?.name || ''
                }));
                setShowAdditionalInfo(true);
                setIsCheckingMember(false);
              } else if (existingMember.user_type === 'individual') {
                console.log('IndividualAuthForm - 既存の個人メンバーが見つかりました。ログインを続行します。');
                const userName = existingMember.nickname || `${existingMember.last_name} ${existingMember.first_name}`;
                setIsCheckingMember(false);
                onAuthSuccess(user.email || '', userName, user.id);
              } else {
                // Google認証でログインしたが、個人会員ではない場合
                console.log('IndividualAuthForm - Google認証ユーザーは個人会員ではありません。/usersにリダイレクトします。');
                await robustSignOut(); // ログアウトしてユーザータイプ選択に戻す
                navigate('/users');
              }
            } catch (error) {
              clearTimeout(timeout);
              console.error('Member check error:', error);
              setGoogleUser(user);
              setFormData(prev => ({
                ...prev,
                email: user.email || '',
                nickname: ''
              }));
              setShowAdditionalInfo(true);
              setIsCheckingMember(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setShowAdditionalInfo(false);
          setGoogleUser(null);
          setIsCheckingMember(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthSuccess, navigate]);

  // 初回ロード時の現在セッションチェックも追加 (AuthFormから移植)
  useEffect(() => {
    const checkCurrentSession = async () => {
      try {
        if (
          typeof window !== 'undefined' &&
          window.location.hash &&
          (window.location.hash.includes('access_token') ||
            window.location.hash.includes('error') ||
            window.location.hash.includes('provider_token'))
        ) {
          console.log('IndividualAuthForm - URLハッシュからの認証コールバック処理中...');
          try {
            const { error } = await supabase.auth.getSession();
            if (error) {
              console.warn('getSession error:', error);
            }
          } catch (e) {
            console.error('Error calling getSession:', e);
          }
          try {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          } catch (e) {
            console.warn('Failed to replace history state', e);
          }
        }
      } catch (e) {
        console.error('Error handling auth callback hash:', e);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        const isGoogleAuth = user.app_metadata?.provider === 'google';
        
        if (isGoogleAuth) {
          console.log('IndividualAuthForm - 既存のGoogleセッションが見つかりました:', user.id);
          setIsCheckingMember(true);
          
          const existingMember = await checkMemberExists(user.id);
          
          if (!existingMember) {
            console.log('IndividualAuthForm - 既存のGoogleセッションにメンバー記録が見つかりませんでした。追加情報フォームを表示します。');
            setGoogleUser(user);
            setFormData(prev => ({
              ...prev,
              email: user.email || '',
              nickname: user.user_metadata?.full_name || user.user_metadata?.name || ''
            }));
            setShowAdditionalInfo(true);
          } else if (existingMember.user_type === 'individual') {
            console.log('IndividualAuthForm - 既存の個人メンバーが見つかりました。ログインを続行します。');
            const userName = existingMember.nickname || `${existingMember.last_name} ${existingMember.first_name}`;
            onAuthSuccess(user.email || '', userName, user.id);
            setIsCheckingMember(false); // Ensure loading state is cleared
            return; // Important: Exit after calling onAuthSuccess
          } else {
            console.log('IndividualAuthForm - Google認証ユーザーは個人会員ではありません。/usersにリダイレクトします。');
            await robustSignOut();
            navigate('/users');
          }
          
          setIsCheckingMember(false);
        }
      }
    };

    checkCurrentSession();
  }, [onAuthSuccess, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password || '',
        });

        if (error) throw error;
        const user = data?.user;
        if (!user) {
          setLoginErrorMessage('ログインに失敗しました。');
          setShowLoginErrorModal(true);
          return;
        }

        // 1. Check if the user is an individual member
        const { data: individualMember, error: individualError } = await supabase
            .from('individual_members')
            .select('*')
            .eq('auth_user_id', user.id)
            .maybeSingle();

        if (individualError) throw individualError;

        if (individualMember) {
            // Login success
            const pendingSubmission = localStorage.getItem('pendingStorySubmission');
            if (pendingSubmission) {
              localStorage.removeItem('pendingStorySubmission');
              navigate('/#truestoryform');
            } else {
              const userName = individualMember.nickname ||
                  `${individualMember.last_name || ''} ${individualMember.first_name || ''}`.trim() ||
                  user.user_metadata?.full_name ||
                  user.email || '';
              onAuthSuccess(user.email || '', userName, user.id);
            }
            return;
        }

        // 2. If not an individual member, check if they are a sponsor member
        const { data: sponsorMember, error: sponsorError } = await supabase
            .from('sponsor_members')
            .select('id')
            .eq('auth_user_id', user.id)
            .maybeSingle();

        if (sponsorError) throw sponsorError;

        if (sponsorMember) {
            // User is a sponsor, show error and sign out
            setLoginErrorMessage('このアカウントはスポンサーアカウントです。個人会員としてログインするには、個人アカウントをご利用ください。');
            setShowLoginErrorModal(true);
            await supabase.auth.signOut();
            return;
        }
        
        // 3. If user exists in neither table, proceed to additional info form
        // This case handles users who have completed email verification but not yet created a member profile.
        setAuthenticatedUser(user);
        setFormData(prev => ({
            ...prev,
            email: user.email || '',
            lastName: user.user_metadata?.last_name || '',
            firstName: user.user_metadata?.first_name || '',
            nickname: user.user_metadata?.nickname || ''
        }));
        setShowAdditionalInfo(true);
        return;
      } else { // signup
        // Check for duplicate email in both tables
        const { data: existingIndividual, error: individualError } = await supabase
          .from('individual_members')
          .select('email')
          .eq('email', formData.email)
          .maybeSingle();

        if (individualError) {
          throw new Error('メールアドレスの確認中にエラーが発生しました。');
        }

        const { data: existingSponsor, error: sponsorError } = await supabase
          .from('sponsor_members')
          .select('email')
          .eq('email', formData.email)
          .maybeSingle();

        if (sponsorError) {
          throw new Error('メールアドレスの確認中にエラーが発生しました。');
        }

        if (existingIndividual || existingSponsor) {
          setLoginErrorMessage('このメールアドレスはすでに登録されています。');
          setShowLoginErrorModal(true);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password || '',
          options: {
            data: {
              last_name: formData.lastName,
              first_name: formData.firstName,
              nickname: formData.nickname,
              full_name: `${formData.lastName || ''} ${formData.firstName || ''}`.trim(),
            },
          },
        });

        if (error) throw error;

        const user = data?.user;
        
        if (!user) {
          setLoginErrorMessage('ユーザー登録に失敗しました。');
          setShowLoginErrorModal(true);
          return;
        }
        
        if (!user.email_confirmed_at) {
          setShowEmailConfirmModal(true);
          return;
        }

        // Start retry loop for member insertion
        const maxAttempts = 5;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const memberId = await generateNewMemberId();

            const { error: insertError } = await supabase.from('individual_members').insert({
              member_id: memberId,
              auth_user_id: user.id,
              last_name: formData.lastName,
              first_name: formData.firstName,
              birth_date: formatBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay),
              gender: formData.gender,
              email: formData.email,
              phone_number: formData.phoneNumber,
              nickname: formData.nickname,
            });

            if (insertError) {
              if (insertError.code === '23505' && attempt < maxAttempts) {
                console.warn(`Attempt ${attempt}: Duplicate member_id ${memberId}. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
                continue; // Go to next attempt
              }
              throw insertError;
            }

            // --- SUCCESS ---
            const userName = formData.nickname || `${formData.lastName || ''} ${formData.firstName || ''}`.trim();
            onAuthSuccess(formData.email, userName, user.id);
            return; // Exit function on success

          } catch (err) {
            console.error(`Attempt ${attempt} failed during signup:`, err);
            if (attempt >= maxAttempts) {
              throw err; // Rethrow the last error to be caught by the outer catch block
            }
          }
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setLoginErrorMessage('認証中にエラーが発生しました: ' + ((err as Error).message || String(err)));
      setShowLoginErrorModal(true);
    }
  };

  const handleAdditionalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (!googleUser && !authenticatedUser) {
          throw new Error('認証されたユーザー情報が見つかりません。');
        }
        const targetUser = googleUser || authenticatedUser;

        const birthDate = formatBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay);
        const memberId = await generateNewMemberId();

        const { error: insertError } = await supabase.from('individual_members').insert({
          member_id: memberId,
          auth_user_id: targetUser.id,
          last_name: formData.lastName,
          first_name: formData.firstName,
          birth_date: birthDate,
          gender: formData.gender,
          email: targetUser.email,
          phone_number: formData.phoneNumber,
          nickname: formData.nickname,
        });

        if (insertError) {
          if (insertError.code === '23505' && attempt < maxAttempts) {
            console.warn(`Attempt ${attempt}: Duplicate member_id ${memberId}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
            continue; // Go to next attempt
          }
          throw insertError;
        }

        // --- SUCCESS ---
        const userName = formData.nickname || `${formData.lastName || ''} ${formData.firstName || ''}`.trim();
        setShowAdditionalInfo(false);
        setGoogleUser(null);
        setAuthenticatedUser(null);

        const pendingSubmission = localStorage.getItem('pendingStorySubmission');
        if (pendingSubmission) {
          localStorage.removeItem('pendingStorySubmission');
          navigate('/#truestoryform');
        } else {
          onAuthSuccess(targetUser.email, userName, targetUser.id);
        }
        return; // Exit function on success

      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err);
        if (attempt >= maxAttempts) {
          // If all attempts fail, show a final error
          setLoginErrorMessage('メンバーの登録に失敗しました。時間をおいて再度お試しください。');
          setShowLoginErrorModal(true);
        }
      }
    }
  };

  const handleCancelGoogleAuth = async () => {
    await robustSignOut();
    setShowAdditionalInfo(false);
    setGoogleUser(null);
    navigate('/users');
  };

  const closeEmailConfirmModal = () => {
    setShowEmailConfirmModal(false);
    setFormData({
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
    setAuthMode('signin');
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

  if (showEmailConfirmModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-neutral-800 rounded-lg p-8 max-w-md mx-4 relative">
          <button
            onClick={closeEmailConfirmModal}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <div className="mb-4">
              <Mail className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-white mb-4">
              確認メールを送信しました
            </h2>
            <p className="text-neutral-300 mb-6">
              {formData.email} に確認メールを送信しました。<br />
              メール内のリンクをクリックしてアカウントを有効化してから、再度ログインしてください。
            </p>
            <div className="space-y-3">
              <button
                onClick={closeEmailConfirmModal}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                ログイン画面に戻る
              </button>
              <p className="text-xs text-neutral-400">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAdditionalInfo) {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">追加情報の入力</h3>
          <p className="text-neutral-300 text-sm">
            ログインが完了しました。会員登録を完了するために、以下の情報を入力してください。
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
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
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
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
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
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="たろう"
            />
            <p className="text-xs text-neutral-400 mt-2">サイト上で表示される名前です</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">年</option>
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
              
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">月</option>
                {generateMonths().map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
              
              <select
                name="birthDay"
                value={formData.birthDay}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
                disabled={!formData.birthYear || !formData.birthMonth}
              >
                <option value="">日</option>
                {generateDays(formData.birthYear, formData.birthMonth).map(day => (
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
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
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
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="09012345678"
              pattern="[0-9]*"
              inputMode="numeric"
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Googleログインボタンをメールフォームの上に移動 */}
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

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
          required
          placeholder="example@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          パスワード <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
          required
          minLength={6}
          placeholder="英数字6文字以上"
        />
        
        {formData.password && authMode === 'signup' && (
          <div className="mt-3">
            <div className="flex w-full h-2 bg-neutral-600 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  passwordStrength.strength === 0 ? 'w-1/3 bg-red-500' : 
                  passwordStrength.strength === 1 ? 'w-2/3 bg-yellow-500' : 
                  'w-full bg-green-500'
                }`} 
              />
            </div>
            <p className="text-xs text-neutral-300 mt-2">
              {passwordStrength.message}
            </p>
          </div>
        )}
      </div>

      {authMode === 'signup' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                苗字 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
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
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
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
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="たろう"
            />
            <p className="text-xs text-neutral-400 mt-2">サイト上で表示される名前です</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">年</option>
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
              
              <select
                name="birthMonth"
                value={formData.birthMonth}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">月</option>
                {generateMonths().map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
              
              <select
                name="birthDay"
                value={formData.birthDay}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
                disabled={!formData.birthYear || !formData.birthMonth}
              >
                <option value="">日</option>
                {generateDays(formData.birthYear, formData.birthMonth).map(day => (
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
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
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
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="09012345678"
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-3 rounded-md flex items-center justify-center gap-2 text-base transition duration-200"
      >
        <Mail size={18} />
        {authMode === 'signin' ? 'ログイン' : '登録する'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          {authMode === 'signin' ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
        </button>
      </div>

      <LoginErrorModal
        isOpen={showLoginErrorModal}
        onClose={() => setShowLoginErrorModal(false)}
        message={loginErrorMessage}
        onConfirm={() => setShowLoginErrorModal(false)}
      />
    </form>
  );
};

export default IndividualAuthForm;
