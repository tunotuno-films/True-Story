import React, { useState } from 'react';
import { Building } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { AuthFormData, AuthFormProps } from '../types/auth';
import { calculatePasswordStrength } from '../utils/authUtils';

const SponsorAuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    lastName: '',
    firstName: '',
    companyName: '',
    companyAddress: '',
    department: '',
    position: '',
    contactPhone: '', // 担当者電話用の新しいフィールド
  });

  const passwordStrength = calculatePasswordStrength(formData.password);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      const filteredValue = value.replace(/[^\w@.-]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'password') {
      // 英数字のみ許可
      const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else if (name === 'contactPhone') {
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

        // sponsor_membersテーブルから情報を取得
        const { data: existingMember } = await supabase
          .from('sponsor_members')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        const userName = `${existingMember?.last_name || ''} ${existingMember?.first_name || ''}`.trim() ||
          user.user_metadata?.full_name ||
          user.email || '';

        onAuthSuccess(user.email || '', userName);

        // スポンサーログイン成功時は専用ページにリダイレクト
        window.location.href = '/mypage/sponsor';
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
              full_name: `${formData.lastName || ''} ${formData.firstName || ''}`.trim(),
            },
          },
        });

        if (error) throw error;

        const user = data?.user;
        if (!user) {
          alert('確認メールを送信しました。メールを確認してアカウントを有効化してください。');
          return;
        }

        // 認証状態の変更を待つ
        let insertAttempts = 0;
        const maxAttempts = 5;

        const attemptInsert = async (): Promise<void> => {
          try {
            insertAttempts++;
            
            // Generate member_id and insert into sponsor_members table
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const memberId = `SPO${timestamp}${random}`;

            const { data: insertData, error: insertError } = await supabase
              .from('sponsor_members')
              .insert([{
                member_id: memberId,
                auth_user_id: user.id,
                last_name: formData.lastName,
                first_name: formData.firstName,
                email: formData.email,
                company_name: formData.companyName,
                company_address: formData.companyAddress,
                department: formData.department,
                position: formData.position,
                contact_phone: formData.contactPhone,
              }])
              .select();

            if (insertError) {
              if (insertError.code === '42501' && insertAttempts < maxAttempts) {
                // RLSエラーの場合、1秒待ってリトライ
                console.log(`Insert attempt ${insertAttempts} failed, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return attemptInsert();
              } else {
                throw insertError;
              }
            }

            console.log('Successfully inserted sponsor member:', insertData);

            const userName = `${formData.lastName || ''} ${formData.firstName || ''}`.trim();
            onAuthSuccess(formData.email, userName);

            // スポンサー登録成功時は専用ページにリダイレクト
            window.location.href = '/mypage/sponsor';
          } catch (error) {
            if (insertAttempts >= maxAttempts) {
              throw new Error(`登録に失敗しました。${maxAttempts}回試行しましたが、セッションの確立ができませんでした。`);
            }
            throw error;
          }
        };

        await attemptInsert();
        return;
      }
    } catch (err) {
      console.error('Authentication error:', err);
      alert('認証中にエラーが発生しました: ' + ((err as Error).message || String(err)));
    }
  };

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
          placeholder="example@company.com"
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
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              会社名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="株式会社〇〇"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                担当者 苗字 <span className="text-red-500">*</span>
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
                担当者 名前 <span className="text-red-500">*</span>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                部署
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
                placeholder="営業部"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                役職
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
                placeholder="課長"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              担当者電話 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              required
              placeholder="0312345678"
              pattern="[0-9]*"
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              会社住所
            </label>
            <textarea
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleInputChange}
              className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-neutral-400 focus:border-green-500 focus:outline-none"
              rows={3}
              placeholder="〒000-0000 東京都〇〇区〇〇 1-2-3"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-3 rounded-md flex items-center justify-center gap-2 text-base transition duration-200"
      >
        <Building size={18} />
        {authMode === 'signin' ? 'ログイン' : '企業登録する'}
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

export default SponsorAuthForm;