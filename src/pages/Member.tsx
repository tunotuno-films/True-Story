import React, { useState, useEffect, useRef } from 'react';
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

const IndividualMyPage: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMinimalLoader, setShowMinimalLoader] = useState(false);
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);
  const navigate = useNavigate();
  const isSigningOut = useRef(false);

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
    let loadingTimeout: NodeJS.Timeout;
    let minimalLoaderTimeout: NodeJS.Timeout;
    let hasCompletedCheck = false;

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
            navigate('/users');
            hasCompletedCheck = true;
          }
        }, 3000);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          
          // 個人会員情報をチェック
          const { data: individualMember } = await supabase
            .from('individual_members')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

          if (individualMember) {
            const userName = individualMember.nickname || `${individualMember.last_name} ${individualMember.first_name}`;
            setUser({
              email: user.email || '',
              name: userName,
              userType: 'individual',
              memberData: individualMember
            });
            
            // 投票履歴を取得
            await fetchVoteHistory(user.id);
          } else {
            // 個人会員でない場合は通常のマイページにリダイレクト
            console.log('Not an individual member, redirecting to main mypage');
            navigate('/users');
            return;
          }
        } else {
          // 未ログインの場合は通常のマイページにリダイレクト
          navigate('/users');
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
        navigate('/users');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        // ローカルで signOut を開始した場合はこのリスナー側のナビゲーションを無視する
        if (event === 'SIGNED_OUT') {
          if (isSigningOut.current) {
            // フラグをリセットして早期終了（handleSignOut 側で navigate('/') を実行済み）
            isSigningOut.current = false;
            return;
          }
          navigate('/users');
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

  const handleSignOut = async () => {
    // 自前のサインアウトフロー中であることを示すフラグ
    isSigningOut.current = true;
    await robustSignOut();
    // SPA のナビゲーションを使用（ページ全体のリロードを避ける）
    navigate('/');
  };

  if (isLoading && !showMinimalLoader) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-noto mb-8">マイページ</h1>
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

export default IndividualMyPage;