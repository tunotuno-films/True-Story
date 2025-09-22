import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { robustSignOut } from '../utils/authUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import SponsorAuthForm from '../components/SponsorAuthForm';

interface User {
  email: string;
  name?: string;
  userType?: 'individual' | 'sponsor';
  memberData?: any;
}

const SponsorPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMinimalLoader, setShowMinimalLoader] = useState(false);
  const navigate = useNavigate();
  const isSigningOut = useRef(false);
  const { id: urlId } = useParams<{ id: string }>();

  useEffect(() => {
    let minimalLoaderTimeout: NodeJS.Timeout;
    let hasCompletedCheck = false;

    minimalLoaderTimeout = setTimeout(() => {
      if (!hasCompletedCheck) {
        setShowMinimalLoader(true);
      }
    }, 500);

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const currentUser = session.user;

          // URLにIDがあり、セッションユーザーのIDと一致しない場合はリダイレクト
          if (urlId && currentUser.id !== urlId) {
            console.log('URL IDがセッションユーザーのIDと一致しません。リダイレクトします。');
            navigate('/users');
            return;
          }
          
          const { data: sponsorMember } = await supabase
            .from('sponsor_members')
            .select('*')
            .eq('auth_user_id', currentUser.id)
            .single();

          if (sponsorMember) {
            const userName = `${sponsorMember.last_name} ${sponsorMember.first_name}`;
            setUser({
              email: currentUser.email || '',
              name: userName,
              userType: 'sponsor',
              memberData: sponsorMember
            });
          } else {
            // スポンサー会員でない場合は通常のマイページにリダイレクト
            navigate('/users');
            return;
          }
        } else {
          // 未ログインの場合
          setUser(null);
        }
        
        hasCompletedCheck = true;
        clearTimeout(minimalLoaderTimeout);
        setIsLoading(false);
        setShowMinimalLoader(false);
      } catch (error) {
        console.error('Session check error:', error);
        hasCompletedCheck = true;
        clearTimeout(minimalLoaderTimeout);
        setUser(null);
        setIsLoading(false);
        navigate('/users');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            navigate(`/users/sponsor/${session.user.id}`);
          } else {
            checkSession();
          }
        }
        if (event === 'SIGNED_OUT') {
          if (isSigningOut.current) {
            isSigningOut.current = false;
            return;
          }
          setUser(null);
          navigate('/users/sponsor');
        }
      }
    );

    return () => {
      clearTimeout(minimalLoaderTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, urlId]);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const handleSignOut = async () => {
    isSigningOut.current = true;
    await robustSignOut();
    setUser(null);
    navigate('/');
  };

  const handleAuthSuccess = (email: string, name?: string, userId?: string) => {
    // use email and name in a no-op to avoid "declared but its value is never read" error
    void email;
    void name;

    if (userId) {
      navigate(`/users/sponsor/${userId}`);
    } else {
      // 認証後にIDが取得できない場合はページをリロードして再チェック
      window.location.reload();
    }
  };

  if (isLoading && !showMinimalLoader) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">スポンサーページ</h1>
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
            <h1 className="text-4xl font-bold font-noto mb-8">スポンサーページ</h1>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold font-noto mb-6">スポンサーシップ</h1>
              <p className="text-neutral-300">ログインまたは新規登録</p>
              <div className="mt-4">
                <Link to="/users" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  アカウントの種類選択に戻る
                </Link>
              </div>
            </div>
            <SponsorAuthForm onAuthSuccess={handleAuthSuccess} />
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
        {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-noto mb-8">スポンサーシップ マイページ</h1>
        </div>
          
        {user && (
          <div>
            <div className="text-center mb-8">
              <p className="text-lg mb-2">
                ようこそ、{user.name}さん
                <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">企業</span>
              </p>
              <p className="text-neutral-400">{user.email}</p>
              <p className="text-sm my-4">マイページは順次アップデート予定です。</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">スポンサーシップ情報</h3>
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

export default SponsorPage;
