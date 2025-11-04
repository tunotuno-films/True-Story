"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { robustSignOut, checkMemberExists } from '../../../utils/authUtils';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import PrivacyPolicy from '../../../components/PrivacyPolicy';
import IndividualAuthForm from '../../../components/IndividualAuthForm';
import { useAuth } from '../../../contexts/AuthContext';

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
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
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
        console.log('auth_user_id に対応する個人会員が見つかりませんでした:', authUserId);
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
        console.error('投票履歴の取得中にエラーが発生しました:', error);
        return;
      }

      setVoteHistory(votes || []);
    } catch (error) {
      console.error('fetchVoteHistory でエラーが発生しました:', error);
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

      const { data: fileData, error: fileError } = await supabase.storage
        .from('stories')
        .download(storyData.file_path);

      if (fileError) {
        console.error('Error downloading story file:', fileError);
        setSubmittedStory(null);
        return;
      }

      const content = await fileData.text();
      setSubmittedStory({
        content: content,
        submitted_at: storyData.created_at,
      });
    } catch (error) {
      console.error('fetchSubmittedStory でエラーが発生しました:', error);
    } finally {
      setIsLoadingStory(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      if (authLoading) {
        console.log('個人会員ページ: AuthContextの読み込みを待っています...');
        return;
      }

      console.log('個人会員ページ: 初期化を開始します。');
      setIsLoading(true);

      const currentUser = session?.user;

      if (!currentUser) {
        console.log('個人会員ページ: ユーザーがログインしていません。');
        setIsLoading(false);
        return;
      }

      if (userId && currentUser.id !== userId) {
        console.warn(`警告: URLのID (${userId}) とセッションのID (${currentUser.id}) が一致しません。`);
        await robustSignOut();
        router.push('/users/member');
        return;
      }

      try {
        const member = await checkMemberExists(currentUser.id);

        if (member && member.user_type === 'individual') {
          const userData: User = {
            email: currentUser.email || '',
            name: member.nickname || `${member.last_name} ${member.first_name}`,
            userType: 'individual',
            memberData: member,
          };
          setUser(userData);
          setSubtitle('マイページ');
          await fetchVoteHistory(currentUser.id);
          await fetchSubmittedStory(currentUser.id);
        } else if (member && member.user_type === 'sponsor') {
          console.log('スポンサー会員が個人ページにアクセスしました。リダイレクトします。');
          router.push(`/users/sponsor/${currentUser.id}`);
        } else {
          console.log('会員情報が見つかりません。サインアウトします。');
          await robustSignOut();
          router.push('/users/member');
        }
      } catch (error) {
        console.error('ページ初期化中にエラー:', error);
        await robustSignOut();
        router.push('/users/member');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [session, authLoading, userId, router]);

  const handleSignOut = async () => {
    if (isSigningOut.current) return;
    isSigningOut.current = true;
    console.log('サインアウト処理を開始します。');
    setShowMinimalLoader(true);
    try {
      await robustSignOut();
      setUser(null);
      setSubtitle('ログインまたは新規登録');
      router.push('/users/member');
    } catch (error) {
      console.error('サインアウト中にエラーが発生しました:', error);
    } finally {
      setShowMinimalLoader(false);
      isSigningOut.current = false;
      console.log('サインアウト処理が完了しました。');
    }
  };

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const handleAuthSuccess = (authedUser: { id: string; [key: string]: any }, userType: 'individual' | 'sponsor') => {
    console.log('認証成功:', authedUser.id, userType);
    if (userType === 'individual') {
      router.push(`/users/member/${authedUser.id}`);
    } else {
      console.warn('個人会員ページで予期しないユーザータイプを受け取りました:', userType);
      router.push('/users');
    }
  };

  // ローディング状態の表示
  if (isLoading || authLoading) { // 修正
    console.log('Rendering: 読み込み状態です。', { isLoading, authLoading, sessionExists: !!session?.user, userExists: !!user });
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
    console.log('Rendering: ログインしていません。ログインフォームを表示します。');
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold font-noto mb-6">メンバーシップ</h1>
              <p className="text-neutral-300">{subtitle}</p>
              <div className="mt-4">
                <Link href="/users" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
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
    console.log('Rendering: Google認証ユーザー、個々のメンバーデータがありません。追加情報フォームを表示中です。');
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
              <p className="text-sm my-4">マイページは順次アップデート予定です。</p>
              <p className="text-neutral-400">メンバーシップID: <span className="text-lg font-bold text-indigo-400 tracking-wide">{user.memberData.member_id}</span></p>
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

export default IndividualMyPage;
