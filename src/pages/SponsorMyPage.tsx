import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { robustSignOut } from '../utils/authUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';

interface User {
  email: string;
  name?: string;
  userType?: 'individual' | 'sponsor';
  memberData?: any;
}

const SponsorMyPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMinimalLoader, setShowMinimalLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;
    let minimalLoaderTimeout: NodeJS.Timeout;
    let hasCompletedCheck = false;

    // 500ms後に最小限のローダーを表示
    minimalLoaderTimeout = setTimeout(() => {
      if (!hasCompletedCheck) {
        setShowMinimalLoader(true);
      }
    }, 500);

    const checkSession = async () => {
      try {
        loadingTimeout = setTimeout(() => {
          if (!hasCompletedCheck) {
            console.log('Loading timeout - redirecting to main mypage');
            navigate('/mypage');
            hasCompletedCheck = true;
          }
        }, 3000);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          
          // スポンサー会員情報をチェック
          const { data: sponsorMember } = await supabase
            .from('sponsor_members')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

          if (sponsorMember) {
            const userName = `${sponsorMember.last_name} ${sponsorMember.first_name}`;
            setUser({
              email: user.email || '',
              name: userName,
              userType: 'sponsor',
              memberData: sponsorMember
            });
          } else {
            // スポンサー会員でない場合は通常のマイページにリダイレクト
            console.log('Not a sponsor member, redirecting to main mypage');
            navigate('/mypage');
            return;
          }
        } else {
          // 未ログインの場合は通常のマイページにリダイレクト
          navigate('/mypage');
          return;
        }
        
        hasCompletedCheck = true;
        clearTimeout(loadingTimeout);
        clearTimeout(minimalLoaderTimeout);
        setIsLoading(false);
        setShowMinimalLoader(false);
      } catch (error) {
        console.error('Session check error:', error);
        hasCompletedCheck = true;
        clearTimeout(loadingTimeout);
        clearTimeout(minimalLoaderTimeout);
        navigate('/mypage');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT') {
          navigate('/mypage');
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(minimalLoaderTimeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  // 注意:
  // サインアウト処理は IndividualMyPage や AuthForm などと重複しやすいため、
  // 共通ユーティリティ `robustSignOut` を使ってサーバ側の signOut が失敗した場合でも
  // クライアント側のセッション情報（localStorage）をクリアするようにしています。
  // 将来別の箇所でサインアウト処理を追加する場合は `robustSignOut` を再利用してください。
  const handleSignOut = async () => {
    await robustSignOut();
    window.location.href = '/';
  };

  if (isLoading && !showMinimalLoader) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">スポンサーマイページ</h1>
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      </div>
    );
  }

  if (isLoading && showMinimalLoader) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">スポンサーマイページ</h1>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
          <h1 className="text-4xl font-bold font-noto mb-8">スポンサーマイページ</h1>
        </div>
          
        {user && (
          <div>
            <div className="text-center mb-8">
              <p className="text-lg mb-2">
                ようこそ、{user.name}さん
                <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">企業</span>
              </p>
              <p className="text-neutral-400">{user.email}</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">スポンサー企業情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">会社名</p>
                    <p className="font-medium">{user.memberData.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">部署</p>
                    <p className="font-medium">{user.memberData.department || '未設定'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">役職</p>
                    <p className="font-medium">{user.memberData.position || '未設定'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">担当者</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">担当者電話</p>
                    <p className="font-medium">{user.memberData.contact_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">会社住所</p>
                    <p className="font-medium">{user.memberData.company_address || '未設定'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-green-400">スポンサー特典</h3>
                <ul className="space-y-2 text-neutral-300">
                  <li>• 優先的な作品情報の配信</li>
                  <li>• スポンサー限定イベントへの招待</li>
                  <li>• 作品への企業名掲載（プランによる）</li>
                  <li>• 制作進捗の定期報告</li>
                </ul>
              </div>

              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-purple-400">プロジェクト支援状況</h3>
                <p className="text-neutral-300">支援履歴や参加プロジェクトの情報を表示</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition duration-300"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
};

export default SponsorMyPage;