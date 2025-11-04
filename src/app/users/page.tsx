"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Building } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PrivacyPolicy from '../../components/PrivacyPolicy';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { robustSignOut, checkMemberExists } from '../../utils/authUtils';

const MyPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const handleSignOut = async () => {
    console.log('handleSignOutがUser.tsxから呼び出されました。');
    await robustSignOut();
    router.push('/'); // サインアウト後はトップページへ
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      setIsLoading(true);

      if (authLoading) {
        console.log('User.tsx: AuthContextがまだ読み込まれています。待機中...');
        return; // AuthContextがロードされるまで待機
      }

      // Supabaseの認証コールバックURLのハッシュを処理
      try {
        if (
          typeof window !== 'undefined' &&
          window.location.hash &&
          (window.location.hash.includes('access_token') ||
            window.location.hash.includes('error') ||
            window.location.hash.includes('provider_token'))
        ) {
          console.log('User.tsx: URLハッシュから認証コールバックを処理中です。');
          // Supabase-js v2 does not expose getSessionFromUrl; use getSession to obtain the current session instead
          await supabase.auth.getSession(); // これによりセッションが処理される
          // URLのハッシュを消してクリーンにする
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
      } catch (e) {
        console.error('User.tsx: Error handling auth callback hash:', e);
      }

      // セッションが確立された後にlocalStorageをチェック
      const pendingSubmission = localStorage.getItem('pendingStorySubmission');
      if (pendingSubmission && session?.user) { // セッションがあることも確認
        // 個人会員情報が登録済みかチェック
        const existingMember = await checkMemberExists(session.user.id);
        if (existingMember && existingMember.user_type === 'individual') { // user_type を確認
          localStorage.removeItem('pendingStorySubmission');
          router.push('/#truestoryform');
          return;
        } else {
          // 個人会員情報が未登録の場合は、追加情報フォームへリダイレクト
          router.push(`/users/member/${session.user.id}`);
          return;
        }
      }

      if (session?.user) {
        console.log('User.tsx: セッションユーザーが見つかりました。', session.user.id);
        const currentUser = session.user;

        // 個人会員情報をチェック
        const { data: individualMember } = await supabase
          .from('individual_members')
          .select('*')
          .eq('auth_user_id', currentUser.id)
          .limit(1)
          .maybeSingle();

        if (individualMember) {
          console.log('User.tsx: 個人会員が見つかりました。/users/member/にリダイレクトします。', individualMember.auth_user_id);
          router.push(`/users/member/${individualMember.auth_user_id}`);
          return;
        }

        // スポンサー会員情報をチェック
        const { data: sponsorMember } = await supabase
          .from('sponsor_members')
          .select('*')
          .eq('auth_user_id', currentUser.id)
          .limit(1)
          .maybeSingle();

        if (sponsorMember) {
          console.log('User.tsx: スポンサー会員が見つかりました。/users/sponsor/にリダイレクトします。', currentUser.id);
          router.push(`/users/sponsor/${currentUser.id}`);
          return;
        }

        // どちらの会員でもない場合
        console.log('User.tsx: どの会員タイプにも一致しませんでした。');
        setIsLoading(false);
      } else {
        console.log('User.tsx: セッションユーザーが見つかりません。');
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [session, authLoading, router]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-neutral-300 mt-4">認証情報を確認中...</p>
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 gradient-text">
            メンバーシップ
          </h1>
          <p className="text-neutral-300 mb-12 max-w-2xl mx-auto">
            True Story【実話の物語】のメンバーシップにご参加ください。
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 個人会員 */}
            <Link href="/users/member" className="card-link-wrapper">
              <div className="card-base bg-neutral-900 border border-neutral-700 rounded-lg p-8 h-full flex flex-col items-center justify-center transition-all duration-300 hover:border-emerald-500 hover:shadow-lg">
                <Users className="w-16 h-16 mb-4 text-emerald-400" />
                <h2 className="text-2xl font-bold mb-2 text-white">個人会員</h2>
                <p className="text-neutral-400">
                  実話を投稿したり、プロジェクトに参加できます。
                </p>
              </div>
            </Link>

            {/* スポンサー会員 */}
            <Link href="/users/sponsor" className="card-link-wrapper">
              <div className="card-base bg-neutral-900 border border-neutral-700 rounded-lg p-8 h-full flex flex-col items-center justify-center transition-all duration-300 hover:border-sky-500 hover:shadow-lg">
                <Building className="w-16 h-16 mb-4 text-sky-400" />
                <h2 className="text-2xl font-bold mb-2 text-white">スポンサー会員</h2>
                <p className="text-neutral-400">
                  プロジェクトを支援し、特典を受け取れます。
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
};

export default MyPage;
