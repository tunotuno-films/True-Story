import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { AuthFormData, AuthFormProps } from '../types/auth';
import { 
  generateYears, 
  generateMonths, 
  generateDays, 
  formatBirthDate,
  calculatePasswordStrength
} from '../utils/authUtils';

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

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      const filteredValue = value.replace(/[^\w@.-]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'password') {
      // 英数字のみ許可
      const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'phoneNumber') {
      // 数字のみ許可
      const filteredValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        const user = data?.user;
        if (!user) {
          alert('ログインに失敗しました。');
          return;
        }

        // individual_membersテーブルから情報を取得
        const { data: existingMember, error: memberError } = await supabase
          .from('individual_members')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (memberError && memberError.code === 'PGRST116') {
          // 会員情報が存在しない場合、追加情報入力フォームを表示
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
        }

        if (memberError) throw memberError;

        const userName = existingMember?.nickname ||
          `${existingMember?.last_name || ''} ${existingMember?.first_name || ''}`.trim() ||
          user.user_metadata?.full_name ||
          user.email || '';

        onAuthSuccess(user.email || '', userName);

        // 個人ユーザーログイン成功時は専用ページにリダイレクト
        window.location.href = '/mypage/individual';
        return;
      } else {
        // signup
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
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
          alert('ユーザー登録に失敗しました。');
          return;
        }
        
        // 確認メール送信の成功を示すモーダルを表示
        if (!user.email_confirmed_at) {
          setShowEmailConfirmModal(true);
          return;
        }

        // メール認証が完了している場合のみデータベースに挿入
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const memberId = `IND${timestamp}${random}`;

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
          console.error('Insert error details:', insertError);
          throw insertError;
        }

        const userName = formData.nickname || `${formData.lastName || ''} ${formData.firstName || ''}`.trim();
        onAuthSuccess(formData.email, userName);

        // 個人ユーザー登録成功時は専用ページにリダイレクト
        window.location.href = '/mypage/individual';
        return;
      }
    } catch (err) {
      console.error('Authentication error:', err);
      alert('認証中にエラーが発生しました: ' + ((err as Error).message || String(err)));
    }
  };

  const handleAdditionalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!authenticatedUser) {
        throw new Error('認証されたユーザー情報が見つかりません。');
      }

      const birthDate = formatBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay);
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const memberId = `IND${timestamp}${random}`;

      const { error: insertError } = await supabase.from('individual_members').insert({
        member_id: memberId,
        auth_user_id: authenticatedUser.id,
        last_name: formData.lastName,
        first_name: formData.firstName,
        birth_date: birthDate,
        gender: formData.gender,
        email: formData.email,
        phone_number: formData.phoneNumber,
        nickname: formData.nickname,
      });

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      const userName = formData.nickname || `${formData.lastName || ''} ${formData.firstName || ''}`.trim();
      onAuthSuccess(formData.email, userName);

      // 個人ユーザー登録成功時は専用ページにリダイレクト
      window.location.href = '/mypage/individual';
    } catch (err) {
      console.error('Additional info submission error:', err);
      alert('追加情報の保存でエラーが発生しました: ' + ((err as Error).message || String(err)));
    }
  };

  const closeEmailConfirmModal = () => {
    setShowEmailConfirmModal(false);
    // フォームをリセット
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

  // メール確認モーダル
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
    </form>
  );
};

export default IndividualAuthForm;
