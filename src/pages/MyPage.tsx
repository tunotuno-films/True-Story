import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import AuthForm from '../components/AuthForm';

interface User {
  email: string;
  name?: string;
  userType?: 'individual' | 'sponsor';
  memberData?: any;
}

const MyPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMinimalLoader, setShowMinimalLoader] = useState(false);

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

    // 初回ロード時にセッションチェック
    const checkSession = async () => {
      try {
        // 3秒タイムアウト（保険）
        loadingTimeout = setTimeout(() => {
          if (!hasCompletedCheck) {
            console.log('Loading timeout - forcing user selection');
            setIsLoading(false);
            setShowMinimalLoader(false);
            setUser(null);
            hasCompletedCheck = true;
          }
        }, 3000);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          
          // 両方のテーブルをチェック
          const { data: individualMember } = await supabase
            .from('individual_members')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

          if (individualMember) {
            // 個人ユーザーは専用ページにリダイレクト
            window.location.href = '/mypage/individual';
            return;
          } else {
            const { data: sponsorMember } = await supabase
              .from('sponsor_members')
              .select('*')
              .eq('auth_user_id', user.id)
              .single();

            if (sponsorMember) {
              // スポンサーは専用ページにリダイレクト
              window.location.href = '/mypage/sponsor';
              return;
            }
          }
          // 新規ユーザーや未完了の場合はそのままユーザータイプ選択画面を表示
        }
        
        // セッションチェック完了
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
        setIsLoading(false);
        setShowMinimalLoader(false);
      }
    };

    checkSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('MyPage - Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          
          // 両方のテーブルをチェック
          const { data: individualMember } = await supabase
            .from('individual_members')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

          if (individualMember) {
            console.log('MyPage - Individual member found, redirecting');
            window.location.href = '/mypage/individual';
            return;
          } else {
            const { data: sponsorMember } = await supabase
              .from('sponsor_members')
              .select('*')
              .eq('auth_user_id', user.id)
              .single();

            if (sponsorMember) {
              console.log('MyPage - Sponsor member found, redirecting');
              window.location.href = '/mypage/sponsor';
              return;
            } else {
              console.log('MyPage - No member found, will show AuthForm');
              // 会員情報がない場合はAuthFormで追加情報フォーム表示されるため、ローディングを解除
              hasCompletedCheck = true;
              clearTimeout(loadingTimeout);
              clearTimeout(minimalLoaderTimeout);
              setIsLoading(false);
              setShowMinimalLoader(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(minimalLoaderTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const handleAuthSuccess = (email: string, name?: string) => {
    console.log('MyPage - handleAuthSuccess called with:', email, name);
    
    const fetchLatestMemberInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // 両方のテーブルをチェック
          const { data: individualMember } = await supabase
            .from('individual_members')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (individualMember) {
            // 個人ユーザーの場合は専用ページにリダイレクト
            window.location.href = '/mypage/individual';
            return;
          } else {
            const { data: sponsorMember } = await supabase
              .from('sponsor_members')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .single();

            if (sponsorMember) {
              // スポンサーの場合は専用ページにリダイレクト
              window.location.href = '/mypage/sponsor';
              return;
            }
          }

          // どちらのテーブルにもない場合はフォールバック
          setUser({ email, name });
        } else {
          setUser({ email, name });
        }
      } catch (error) {
        console.error('Failed to fetch latest member info:', error);
        setUser({ email, name });
      }
    };

    fetchLatestMemberInfo();
  };

  // 最初の500ms以内はローディング表示しない
  if (isLoading && !showMinimalLoader) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
            {/* ローディング表示なし */}
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      </div>
    );
  }

  // 500ms以降のローディング表示
  if (isLoading && showMinimalLoader) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
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
          <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
        </div>
          
        {user ? (
          <div className="text-center">
            <p className="text-lg mb-4">ようこそ、{user.name}さん</p>
            <p className="text-neutral-400 mb-8">{user.email}</p>
            <p className="text-neutral-300">リダイレクト中...</p>
          </div>
        ) : (
          <AuthForm onAuthSuccess={handleAuthSuccess} initialMode="signup" />
        )}
      </main>
      
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
};

export default MyPage;