import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Building } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { robustSignOut, checkMemberExists } from '../utils/authUtils';

const MyPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const handleSignOut = async () => {
    console.log('handleSignOutがUser.tsxから呼び出されました。');
    await robustSignOut();
    navigate('/'); // サインアウト後はトップページへ
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
          navigate('/#truestoryform');
          return;
        } else {
          // 個人会員情報が未登録の場合は、追加情報フォームへリダイレクト
          navigate(`/users/member/${session.user.id}`);
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
          navigate(`/users/member/${individualMember.auth_user_id}`);
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
          navigate(`/users/sponsor/${currentUser.id}`);
          return;
        }

        // 新規登録ユーザーの場合、会員情報入力フォームへリダイレクト
        if (!individualMember && !sponsorMember) {
          console.log('User.tsx: 新規ユーザーが検出されました。会員登録フォームにリダイレクトします。');
          navigate(`/users/member/${currentUser.id}`); // ここを修正
          return;
        }

        console.log('User.tsx: セッションユーザーが見つかりましたが、会員タイプがありません。タイプ選択を表示します。');
        setIsLoading(false);
      } else {
        console.log('User.tsx: セッションユーザーが見つかりませんでした。タイプ選択を表示します。');
        setIsLoading(false);
      }
    };

    handleAuthCallback();

    // 認証状態の変更を監視（ログイン/ログアウト時）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
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
              to="/users/"
              className="w-full p-4 text-left bg-neutral-700 border border-neutral-600 rounded-md hover:bg-neutral-600 transition duration-200 flex items-center gap-3"
            >
              <Building className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-bold text-white">スポンサーシップ</h3>
                <p className="text-sm text-neutral-400">coming soon</p>
              </div>
            </Link>
          </div>

          {/* 強制ログアウトボタンを追加 */}
          <div className="absolute bottom-8 right-8">
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300 text-sm"
            >
              ボタンが反応しない場合はこちらをクリックして下さい。
            </button>
          </div>
        </div>
      </main>
      
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
};

export default MyPage;
