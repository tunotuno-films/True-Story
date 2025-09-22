import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { robustSignOut, checkMemberExists } from '../utils/authUtils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import IndividualAuthForm from '../components/IndividualAuthForm';
import TrueStory from '../components/TrueStory'; // Import TrueStory component
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
  const [submittedStory, setSubmittedStory] = useState<{ content: string; submitted_at: string; } | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const isSigningOut = useRef(false);
  const { session, loading: authLoading } = useAuth();
  const [subtitle, setSubtitle] = useState('ログインまたは新規登録');

  useEffect(() => {
    const pendingSubmission = localStorage.getItem('pendingStorySubmission');
    if (pendingSubmission) {
      setSubtitle('ログインまたは新規登録して物語の送信を完了する');
    }
  }, []);

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

  const fetchSubmittedStory = async (authUserId: string) => {
    setIsLoadingStory(true);
    try {
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('file_path, created_at')
        .eq('user_id', authUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (storyError || !storyData) {
        if (storyError && storyError.code !== 'PGRST116') { // 'PGRST116' means no rows found
          console.error('Error fetching story metadata:', storyError);
        }
        setSubmittedStory(null);
        return;
      }

      const { data: blobData, error: downloadError } = await supabase.storage
        .from('stories')
        .download(storyData.file_path);

      if (downloadError) {
        console.error('Error downloading story content:', downloadError);
        setSubmittedStory(null);
        return;
      }

      const storyContent = await blobData.text();
      setSubmittedStory({ content: storyContent, submitted_at: storyData.created_at });

    } catch (error) {
      console.error('Error in fetchSubmittedStory:', error);
    } finally {
      setIsLoadingStory(false);
    }
  };

  useEffect(() => {
    console.log('Member.tsx useEffect triggered. authLoading:', authLoading, 'session:', session, 'userId from params:', userId);

    if (authLoading) {
      console.log('AuthContext is still loading. Returning.');
      return; // AuthContextの初期ロード中は待機
    }

    // ここで isLoading を false に設定する条件を追加
    if (session?.user && userId) { // session があり、かつ userId が URL に含まれている場合
      setIsLoading(false);
      setShowMinimalLoader(false);
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
            setIsLoading(false); // 追加
            setShowMinimalLoader(false); // 追加
            navigate(`/users/member/${currentUser.id}`);
            return; // リダイレクト後にこのuseEffectの実行を停止
          }
          
          console.log('checkUserStatus: URL userId matches session user. Fetching individual member data.');
          // 個人会員情報をチェック
          const { data: individualMember } = await supabase
            .from('individual_members')
            .select('*')
            .eq('auth_user_id', currentUser.id)
            .maybeSingle(); // Changed from .single() to .maybeSingle()

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
            await fetchSubmittedStory(currentUser.id);
          } else {
            const isGoogleAuth = currentUser.app_metadata?.provider === 'google';
            if (isGoogleAuth) {
              console.log('checkUserStatus: Authenticated via Google, but not an individual member. Allowing IndividualAuthForm to render.');
              // Do NOT set user to null here. Let the rendering logic below handle it.
              setIsLoading(false);
              setShowMinimalLoader(false);
              // Do not return here, allow rendering of TrueStory form
            } else {
              console.log('checkUserStatus: Authenticated but not an individual member (not Google Auth). Redirecting to user type selection.');
              setIsLoading(false); // 追加
              setShowMinimalLoader(false); // 追加
              navigate('/users');
              return; // リダイレクト後にこのuseEffectの実行を停止
            }
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
      if (authUserId) {
        const existingMember = await checkMemberExists(authUserId);
        if (existingMember && existingMember.user_type === 'individual') { // user_type を確認
          localStorage.removeItem('pendingStorySubmission');
          navigate('/#truestoryform');
          return;
        }
      }
      // 個人会員情報が未登録の場合は、追加情報フォームを表示し続ける
      return; // pendingSubmission があるが個人会員でない場合はここで処理を終了し、追加情報フォームを表示
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
  if (isLoading || authLoading) { // 修正
    console.log('Rendering: Loading state.', { isLoading, authLoading, sessionExists: !!session?.user, userExists: !!user });
    return (
      <div className="min-h-screen bg-neutral-900 text-white relative">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
            {showMinimalLoader && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            )}
            <p className="text-neutral-300 mt-4">ユーザー情報を読み込み中...</p>
          </div>
        </main>
        {/* 強制ログアウトボタン */}
        <div className="absolute bottom-32 right-20">
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300 text-sm"
          >
            強制ログアウト
          </button>
        </div>
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
              <p className="text-neutral-300">{subtitle}</p>
              <div className="mt-4">
                <Link to="/users" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  アカウントの種類選択に戻る
                </Link>
              </div>
              <div className="mt-8 text-left text-neutral-300 border-t border-neutral-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">特典</h3>
                  <ul className="space-y-2 list-disc list-inside text-sm text-neutral-400 pb-6 border-b border-neutral-700">
                    <li>最新情報や進捗情報の通知</li>
                    <li>過去の投稿や投票のログ表示</li>
                    <li>メンバーシップのみの限定情報やコンテンツ</li>
                    <li>出演者やアーティストからの特別メッセージ</li>
                    <li>メールマガジンの配信 (仮)</li>
                  </ul>
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

  // Google Authで認証済みだが、個人会員情報が未登録の場合、追加情報フォームを表示
  if (session?.user && !user && session.user.app_metadata?.provider === 'google') {
    console.log('Rendering: Google Auth user, no individual member data. Showing additional info form.');
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-noto mb-8">個人会員登録</h1>
            <p className="text-neutral-300">追加情報を入力してください</p>
          </div>
          <IndividualAuthForm onAuthSuccess={handleAuthSuccess} />
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
        {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
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
          <h1 className="text-4xl font-bold font-noto mb-8">メンバーシップ マイページ</h1>
        </div>
          
        {user && (
          <div>
            <div className="text-center mb-8">
              <p className="text-lg mb-2">ようこそ、{user.name}さん
                <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">個人</span>
              </p>
              <p className="text-neutral-400">{user.email}</p>
              <p className="text-sm my-4">マイページは順次アップデート予定です。</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-green-400">メンバーシップ情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">お名前</p>
                    <p className="font-medium">{user.memberData.last_name} {user.memberData.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">ニックネーム</p>
                    <p className="font-medium">{user.memberData.nickname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">メールアドレス</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">電話番号</p>
                    <p className="font-medium">{user.memberData.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">生年月日</p>
                    <p className="font-medium">{user.memberData.birth_date ? new Date(user.memberData.birth_date).toLocaleDateString('ja-JP') : '未設定'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">性別</p>
                    <p className="font-medium">{user.memberData.gender || '未設定'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-purple-400">あなたが投稿した実話</h3>
                {isLoadingStory ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-neutral-400">読み込み中...</p>
                  </div>
                ) : submittedStory ? (
                  <div>
                    <p className="text-xs text-neutral-400 mb-2">
                      投稿日時: {new Date(submittedStory.submitted_at).toLocaleString('ja-JP')}
                    </p>
                    <div className="bg-neutral-900 p-4 rounded-md max-h-60 overflow-y-auto">
                      <p className="text-neutral-200 whitespace-pre-wrap">{submittedStory.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-400 mb-2">まだ実話が投稿されていません</p>
                    <p className="text-sm text-neutral-500">トップページからあなたの物語を投稿してみましょう！</p>
                  </div>
                )}
              </div>

              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">アーティストの投票履歴</h3>
                
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
                    <p className="text-neutral-400 mb-2">coming soon</p>
                    {/* <p className="text-neutral-400 mb-2">まだ投票していません</p>
                    <p className="text-sm text-neutral-500">アーティストページから投票してみましょう！</p> */}
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


export default IndividualMyPage;
