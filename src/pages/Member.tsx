import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { robustSignOut } from '../utils/authUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import IndividualAuthForm from '../components/IndividualAuthForm';
import { useAuth } from '../contexts/AuthContext';

interface User {
  email: string;
  name?: string;
  userType?: 'individual' | 'sponsor';
  memberData?: any;
}

const IndividualMyPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMinimalLoader, setShowMinimalLoader] = useState(false);
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isSigningOut = useRef(false);
  const { session, loading: authLoading } = useAuth();

  // 投票履歴を取得する関数
  const fetchVoteHistory = async (authUserId: string) => {
    setIsLoadingVotes(true);
    try {
      const { data: member, error: memberError } = await supabase
        .from('individual_members')
        .select('phone_number')
        .eq('auth_user_id', authUserId)
        .single();

      if (memberError || !member) {
        console.log('Individual member not found for auth_user_id:', authUserId);
        setVoteHistory([]);
        return;
      }

      const { data: votes, error } = await supabase
        .from('votes')
        .select(`
          id,
          artist_id,
          message,
          created_at,
          artists (
            id,
            name,
            image_url
          )
        `)
        .eq('phone_number', member.phone_number)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vote history:', error);
        return;
      }

      setVoteHistory(votes || []);
    } catch (error) {
      console.error('Error in fetchVoteHistory:', error);
    } finally {
      setIsLoadingVotes(false);
    }
  };

  useEffect(() => {
    console.log('Member.tsx useEffect triggered. authLoading:', authLoading, 'session:', session, 'userId from params:', userId);

    if (authLoading) {
      console.log('AuthContext is still loading. Returning.');
      return; // AuthContextの初期ロード中は待機
    }

    let loadingTimeout: NodeJS.Timeout;
    let minimalLoaderTimeout: NodeJS.Timeout;
    let hasCompletedCheck = false;

    minimalLoaderTimeout = setTimeout(() => {
      if (!hasCompletedCheck) {
        setShowMinimalLoader(true);
      }
    }, 500);

    const checkUserStatus = async () => {
      console.log('checkUserStatus started. Current session:', session, 'userId:', userId);
      try {
        loadingTimeout = setTimeout(() => {
          if (!hasCompletedCheck) {
            console.log('Loading timeout - forcing login form or redirect.');
            setIsLoading(false);
            setShowMinimalLoader(false);
            setUser(null); // Ensure login form is shown if timeout occurs and not logged in
          }
        }, 3000); // 3秒でタイムアウト

        if (!session?.user) {
          console.log('checkUserStatus: No session user found. Showing login form.');
          setUser(null); // ユーザー情報をクリア
          setIsLoading(false);
          setShowMinimalLoader(false);
        } else {
          const currentUser = session.user;
          console.log('checkUserStatus: Session user found.', currentUser.id);

          // URLの userId が存在しない、または現在のユーザーIDと一致しない場合
          if (!userId || userId !== currentUser.id) {
            console.log('checkUserStatus: URL userId missing or mismatch. Redirecting to own page.', { currentUserId: currentUser.id, urlUserId: userId });
            navigate(`/users/member/${currentUser.id}`);
            return; // リダイレクト後にこのuseEffectの実行を停止
          }
          
          console.log('checkUserStatus: URL userId matches session user. Fetching individual member data.');
          // 個人会員情報をチェック
          const { data: individualMember } = await supabase
            .from('individual_members')
            .select('*')
            .eq('auth_user_id', currentUser.id)
            .single();

          if (individualMember) {
            console.log('checkUserStatus: Individual member data found.', individualMember);
            const userName = individualMember.nickname || `${individualMember.last_name} ${individualMember.first_name}`;
            setUser({
              email: currentUser.email || '',
              name: userName,
              userType: 'individual',
              memberData: individualMember
            });
            await fetchVoteHistory(currentUser.id);
          } else {
            console.log('checkUserStatus: Authenticated but not an individual member. Redirecting to user type selection.');
            navigate('/users');
            return; // リダイレクト後にこのuseEffectの実行を停止
          }
        }
        
        hasCompletedCheck = true;
        clearTimeout(loadingTimeout);
        clearTimeout(minimalLoaderTimeout);
        setIsLoading(false);
        setShowMinimalLoader(false);
      } catch (error) {
        console.error('checkUserStatus: Session check error:', error);
        hasCompletedCheck = true;
        clearTimeout(loadingTimeout);
        clearTimeout(minimalLoaderTimeout);
        setIsLoading(false);
        setShowMinimalLoader(false);
        setUser(null); // エラー時もログインフォームを表示
      }
    };

    checkUserStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('IndividualMyPage - Auth state change listener:', event, 'currentSession:', currentSession);
        if (event === 'SIGNED_OUT') {
          console.log('Auth state change: SIGNED_OUT.');
          if (isSigningOut.current) {
            isSigningOut.current = false;
            return;
          }
          setUser(null);
          setIsLoading(false);
          setShowMinimalLoader(false);
        } else if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log('Auth state change: SIGNED_IN.', currentSession.user.id);
          // 通常のログイン時は自分のページにリダイレクト
          navigate(`/users/member/${currentSession.user.id}`);
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      clearTimeout(minimalLoaderTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, session, authLoading, userId]);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const handleSignOut = async () => {
    console.log('handleSignOut called.');
    isSigningOut.current = true;
    await robustSignOut();
    navigate('/'); // サインアウト後はトップページへ
  };

  const handleAuthSuccess = async (authUserId?: string) => {
    console.log('IndividualMyPage - handleAuthSuccess called. authUserId:', authUserId);
    const pendingSubmission = localStorage.getItem('pendingStorySubmission');
    if (pendingSubmission) {
      localStorage.removeItem('pendingStorySubmission');
      navigate('/#truestory');
      return;
    }

    if (authUserId) {
      console.log('handleAuthSuccess: Navigating to user ID page.', authUserId);
      navigate(`/users/member/${authUserId}`);
    } else {
      console.log('handleAuthSuccess: authUserId is missing. Re-checking session.');
      const { data: { session: newSession } } = await supabase.auth.getSession();
      if (newSession?.user) {
        console.log('handleAuthSuccess: New session found. Navigating to user ID page.', newSession.user.id);
        navigate(`/users/member/${newSession.user.id}`);
      } else {
        console.log('handleAuthSuccess: No session found after auth success. Showing login form.');
        setUser(null);
        setIsLoading(false);
        setShowMinimalLoader(false);
      }
    }
  };

  // ローディング状態の表示
  if (isLoading || authLoading) {
    console.log('Rendering: Loading state.', { isLoading, authLoading });
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
            {showMinimalLoader && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            )}
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      </div>
    );
  }

  // 未ログインの場合、ログインフォームを表示
  if (!session?.user) {
    console.log('Rendering: Not logged in. Showing login form.');
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold font-noto mb-6">メンバーシップ</h1>
              <p className="text-neutral-300">メンバーとしてログインまたは新規登録</p>
              <div className="mt-4">
                <Link to="/users" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  アカウントの種類選択に戻る
                </Link>
              </div>
            </div>
            <IndividualAuthForm onAuthSuccess={handleAuthSuccess} />
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
        {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
      </div>
    );
  }

  // ログイン済みだがユーザー情報がまだロードされていない場合（リダイレクト後など）
  if (session?.user && !user) {
    console.log('Rendering: Logged in but user data not loaded yet.');
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-neutral-300 mt-4">ユーザー情報を読み込み中...</p>
          </div>
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      </div>
    );
  }

  // ログイン済みでユーザー情報がロードされている場合、マイページコンテンツを表示
  console.log('Rendering: User data loaded. Showing member content.', user);
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
        </div>
          
        {user && (
          <div>
            <div className="text-center mb-8">
              <p className="text-lg mb-2">ようこそ、{user.name}さん</p>
              <p className="text-neutral-400">{user.email}</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-neutral-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-green-400">メンバーシップ情報</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-neutral-400">お名前</p>
                    <p className="font-medium">{user.memberData.last_name} {user.memberData.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">ニックネーム</p>
                    <p className="font-medium">{user.memberData.nickname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">電話番号</p>
                    <p className="font-medium">{user.memberData.phone_number}</p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">投票状況</h3>
                
                {isLoadingVotes ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-neutral-400">読み込み中...</p>
                  </div>
                ) : voteHistory.length > 0 ? (
                  <div>
                    <div className="mb-4 p-3 bg-neutral-700 rounded-lg">
                      <p className="text-sm text-neutral-400">総投票回数</p>
                      <p className="text-2xl font-bold text-blue-400">{voteHistory.length}回</p>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      <h4 className="text-sm font-medium text-neutral-300 border-b border-neutral-600 pb-2">投票履歴</h4>
                      {voteHistory.map((vote) => (
                        <div key={vote.id} className="bg-neutral-700 rounded-lg p-3">
                          <div className="flex items-center gap-3 mb-2">
                            {vote.artists?.image_url && (
                              <img 
                                src={vote.artists.image_url} 
                                alt={vote.artists.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-white">{vote.artists?.name || '不明なアーティスト'}</p>
                              <p className="text-xs text-neutral-400">
                                {new Date(vote.created_at).toLocaleDateString('ja-JP', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          {vote.message && (
                            <div className="mt-2 p-2 bg-neutral-600 rounded text-sm">
                              <p className="text-neutral-300">"{vote.message}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-400 mb-2">まだ投票していません</p>
                    <p className="text-sm text-neutral-500">アーティストページから投票してみましょう！</p>
                  </div>
                )}
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

export { IndividualMyPage };
