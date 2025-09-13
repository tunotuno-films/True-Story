import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { AuthFormData } from '../types/auth';
import { 
  formatBirthDate,
  generateYears,
  generateMonths,
  generateDays,
  checkMemberExists
} from '../utils/authUtils';

interface GoogleAuthFormProps {
  onAuthSuccess: (email: string, name?: string) => void;
}

const GoogleAuthForm: React.FC<GoogleAuthFormProps> = ({ onAuthSuccess }) => {
  const [showAdditionalInfoForm, setShowAdditionalInfoForm] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isCheckingMember, setIsCheckingMember] = useState(false);
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

  // Google認証処理
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          const isGoogleAuth = user.app_metadata?.provider === 'google';
          
          if (isGoogleAuth) {
            setIsCheckingMember(true);
            
            try {
              const existingMember = await checkMemberExists(user.id);
              
              if (!existingMember) {
                // 会員情報がない場合は追加情報入力フォームを表示
                setGoogleUser(user);
                setFormData(prev => ({
                  ...prev,
                  email: user.email || '',
                  nickname: ''
                }));
                setShowAdditionalInfoForm(true);
              } else {
                // 既存会員の場合はログイン完了
                const userName = existingMember.nickname || `${existingMember.last_name} ${existingMember.first_name}`;
                onAuthSuccess(user.email || '', userName);
              }
              
              setIsCheckingMember(false);
            } catch (error) {
              console.error('Member check error:', error);
              // エラー時は追加情報入力フォームを表示
              setGoogleUser(user);
              setFormData(prev => ({
                ...prev,
                email: user.email || '',
                nickname: ''
              }));
              setShowAdditionalInfoForm(true);
              setIsCheckingMember(false);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Google authentication error:', error);
      alert('Google認証エラーが発生しました');
    }
  };

  if (isCheckingMember) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">認証確認中...</h2>
          <p className="text-neutral-300">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  if (showAdditionalInfoForm) {
    const handleAdditionalInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!googleUser?.email) {
        console.error("Google user data is missing.");
        return;
      }

      try {
        const { data: memberData, error: memberError } = await supabase
          .rpc('generate_member_id')
          .single();

        if (memberError) throw memberError;

        const birthDate = formatBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay);

        const { error: insertError } = await supabase
          .from('individual_members')
          .insert({
            member_id: memberData,
            auth_user_id: googleUser.id,
            last_name: formData.lastName,
            first_name: formData.firstName,
            birth_date: birthDate,
            gender: formData.gender,
            email: googleUser.email,
            phone_number: formData.phoneNumber,
            nickname: formData.nickname,
          });

        if (insertError) throw insertError;

        const userName = formData.nickname || `${formData.lastName} ${formData.firstName}`;
        setShowAdditionalInfoForm(false);
        setGoogleUser(null);
        onAuthSuccess(googleUser.email, userName);
      } catch (error) {
        console.error('Error saving additional user info:', error);
        alert('追加情報の保存でエラーが発生しました: ' + (error as Error).message);
      }
    };

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
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
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
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
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
                value={formData.birthYear}
                onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value, birthDay: '' }))}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">年</option>
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
              
              <select
                value={formData.birthMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, birthMonth: e.target.value, birthDay: '' }))}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white focus:border-green-500 focus:outline-none"
                required
              >
                <option value="">月</option>
                {generateMonths().map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
              
              <select
                value={formData.birthDay}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDay: e.target.value }))}
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
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
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
              value={formData.phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                const filteredValue = value.replace(/[^\d-]/g, '');
                setFormData(prev => ({ ...prev, phoneNumber: filteredValue }));
              }}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="090-1234-5678"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-3 rounded-md text-base transition duration-200"
          >
            登録を完了する
          </button>
        </form>
      </div>
    );
  }

  // デフォルトの表示（Google認証ボタン）
  return (
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
    </div>
  );
};

export default GoogleAuthForm;
