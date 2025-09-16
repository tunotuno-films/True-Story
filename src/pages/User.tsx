import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Building } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const MyPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      setIsLoading(true);
      console.log('User.tsx: handleAuthCallback triggered. authLoading:', authLoading, 'session:', session);

      if (authLoading) {
        console.log('User.tsx: AuthContext still loading. Waiting...');
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
          console.log('User.tsx: Processing auth callback from URL hash.');
          // Supabase-js v2 does not expose getSessionFromUrl; use getSession to obtain the current session instead
          await supabase.auth.getSession(); // これによりセッションが処理される
          // URLのハッシュを消してクリーンにする
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
      } catch (e) {
        console.error('User.tsx: Error handling auth callback hash:', e);
      }

      if (session?.user) {
        console.log('User.tsx: Session user found.', session.user.id);
        const currentUser = session.user;

        // 個人会員情報をチェック
        const { data: individualMember } = await supabase
          .from('individual_members')
          .select('*')
          .eq('auth_user_id', currentUser.id)
          .single();

        if (individualMember) {
          console.log('User.tsx: Individual member found. Redirecting to /users/member/', individualMember.member_id);
          navigate(`/users/member/${individualMember.member_id}`);
          return;
        }

        // スポンサー会員情報をチェック
        const { data: sponsorMember } = await supabase
          .from('sponsor_members')
          .select('*')
          .eq('auth_user_id', currentUser.id)
          .single();

        if (sponsorMember) {
          console.log('User.tsx: Sponsor member found. Redirecting to /users/sponsor/', currentUser.id);
          navigate(`/users/sponsor/${currentUser.id}`);
          return;
        }

        console.log('User.tsx: Session user found, but no member type. Displaying type selection.');
        setIsLoading(false);
      } else {
        console.log('User.tsx: No session user found. Displaying type selection.');
        setIsLoading(false);
      }
    };

    handleAuthCallback();

    // 認証状態の変更を監視（ログイン/ログアウト時）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('User.tsx: Auth state change listener:', event, 'currentSession:', currentSession);
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // ログインイベント発生時、再度ハンドラを実行してリダイレクト
          handleAuthCallback();
        } else if (event === 'SIGNED_OUT') {
          // ログアウト時はタイプ選択画面を表示
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [session, authLoading, navigate]);

  if (isLoading) {
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
    <div className="min-h-screen bg-neutral-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
          <p className="text-neutral-300">アカウントの種類を選択してください</p>
        </div>
          
        <div className="max-w-md mx-auto p-8">
          <div className="space-y-4 mb-6">
            <Link
              to="/users/member"
              className="w-full p-4 text-left bg-neutral-700 border border-neutral-600 rounded-md hover:bg-neutral-600 transition duration-200 flex items-center gap-3"
            >
              <Users className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-bold text-white">メンバーシップ</h3>
                <p className="text-sm text-neutral-400">個人ユーザーの方はこちら</p>
              </div>
            </Link>

            <Link
              to="/users/sponsor"
              className="w-full p-4 text-left bg-neutral-700 border border-neutral-600 rounded-md hover:bg-neutral-600 transition duration-200 flex items-center gap-3"
            >
              <Building className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-bold text-white">スポンサーシップ</h3>
                <p className="text-sm text-neutral-400">企業・団体の方はこちら</p>
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
