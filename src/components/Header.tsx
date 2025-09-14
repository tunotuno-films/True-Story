import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Menu, X } from 'lucide-react';

interface Vote {
  message: string | null;
  voter_name: string | null;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [latestVotes, setLatestVotes] = useState<Vote[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);
  const [applyWillChange, setApplyWillChange] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // 1) 追加: ログイン状態を管理
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 追加: ログアウト確認モーダルの開閉
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchLatestVotes = useCallback(async () => {
    console.log('Fetching latest votes...');
    const { data, error } = await supabase
      .from('votes')
      .select('message, voter_name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching latest votes:', error);
    } else {
      console.log('Fetched latest votes:', data);
      setLatestVotes(data || []);
    }
  }, []);

  useEffect(() => {
    fetchLatestVotes();
  }, [fetchLatestVotes]);

  // 2) 追加: Supabase 認証状態の初期チェックと監視
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // supabase-js v2 の getUser を想定
        const { data } = await supabase.auth.getUser();
        if (mounted) setIsLoggedIn(!!data?.user);
      } catch (e) {
        // noop
      }
    })();

    // onAuthStateChange の戻り値は v2 で { data: { subscription } }
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      mounted = false;
      // v2 の subscription を確実に解除
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // アニメーションが1周した時の処理
  const handleAnimationIteration = () => {
    console.log('Animation iteration ended, fetching new data...');
    fetchLatestVotes();
  };

  const scrollToSection = (sectionId: string) => {
    // ユーザー関連ページにいる場合はメインページに戻ってからスクロール
    if (window.location.pathname.startsWith('/users')) {
      navigate(`/#${sectionId}`);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleMobileLinkClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    if (window.location.pathname.startsWith('/users')) {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'truestory', label: 'TRUE STORY' },
    { id: 'artist', label: 'ARTIST' },
    { id: 'crowdfunding', label: 'CROWDFUNDING' },
    { id: 'contact', label: 'CONTACT' },
  ];

  // handleAuthButtonClick が呼ぶので先に定義
  const handleMyPageClick = () => {
    navigate('/users');
  };

  // 2) 変更: 認証ボタンの汎用ハンドラ（ログイン時はモーダルを開く）
  const handleAuthButtonClick = async () => {
    if (isLoggedIn) {
      setIsConfirmOpen(true);
    } else {
      handleMyPageClick();
    }
  };

  // 3) 追加: 実際のサインアウト処理（モーダルの確認ボタンから呼ぶ）
  const performSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setIsConfirmOpen(false);
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  // 4) 追加: モーダル表示中に Esc で閉じる
  useEffect(() => {
    if (!isConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsConfirmOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isConfirmOpen]);

  // reduce設定を監視
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // 表示中のみwill-changeを有効化
  useEffect(() => {
    const el = animationRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 要素が表示領域に入っていて、reduceでない、かつメッセージがある場合のみ有効化
        setApplyWillChange(entry.isIntersecting && !prefersReducedMotion && latestVotes.length > 0);
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [latestVotes.length, prefersReducedMotion]);

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 左端のタイトル */}
            <div
              className="text-white font-noto text-xl font-bold cursor-pointer"
              onClick={scrollToTop}
            >
              True Story【実話の物語】
            </div>
            
            {/* デスクトップ用メニュー (md以上で表示) */}
            <div className="hidden md:flex items-center space-x-4 md:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-neutral-300 hover:text-white transition duration-300 font-noto"
                >
                  {item.label}
                </button>
              ))}
              {/* 4) 変更: ボタンのラベルと onClick を切替 */}
              <button
                onClick={handleAuthButtonClick}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition duration-300 font-noto px-3 py-1 rounded-md border border-transparent hover:opacity-90"
              >
                {isLoggedIn ? 'ログアウト' : 'メンバーシップ'}
              </button>
            </div>

            {/* モバイル用ハンバーガーボタン (md未満で表示) */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* モバイル用メニューパネル */}
        <div 
          className={`md:hidden bg-black/95 backdrop-blur-md absolute w-full z-40 shadow-lg border-t border-gray-700 transition-all duration-300 ease-in-out transform origin-top ${
            isMenuOpen 
              ? 'opacity-100 scale-y-100 translate-y-0' 
              : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="container mx-auto px-4 pb-4">
            {navItems.map((item, index) => (
              <div 
                key={item.id}
                className={`transition-all duration-300 ease-in-out ${
                  isMenuOpen 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-2'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms' 
                }}
              >
                <button
                  onClick={() => handleMobileLinkClick(item.id)}
                  className="block w-full text-left py-4 px-2 text-neutral-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 font-noto rounded-md"
                >
                  {item.label}
                </button>
                {index < navItems.length - 1 && (
                  <div className="border-b border-gray-700/50 mx-2"></div>
                )}
              </div>
            ))}
            {/* モバイル用マイページボタン（ラベルと動作を切替） */}
            <div 
              className={`transition-all duration-300 ease-in-out ${
                isMenuOpen 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-2'
              }`}
              style={{ 
                transitionDelay: isMenuOpen ? `${navItems.length * 50}ms` : '0ms' 
              }}
            >
              <div className="border-b border-gray-700/50 mx-2"></div>
              <button
                onClick={async () => {
                  await handleAuthButtonClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-4 px-2 text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md transition-all duration-300 font-noto mt-2"
              >
                {isLoggedIn ? 'ログアウト' : 'メンバーシップ'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 確認モーダル（ログアウト） */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="logout-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsConfirmOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-neutral-800 w-[90%] max-w-md rounded-lg shadow-lg p-8 mx-4 text-white">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white text-2xl leading-none"
              aria-label="閉じる"
            >
              ×
            </button>

            <div className="text-center">
              <h2 id="logout-modal-title" className="text-2xl font-bold mb-3">
                ログアウトしますか？
              </h2>
              <p className="text-sm text-neutral-300 mb-6 md:whitespace-nowrap">
                メンバーシップにアクセスする場合は再度ログインが必要です。
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-6 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={performSignOut}
                  className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 応援メッセージセクション */}
      <div className="relative z-10 py-2 overflow-hidden isolate">
        {/* 背景レイヤー（内容と分離） */}
        <div
          className="absolute inset-0 bg-gray-800/30 backdrop-blur-sm pointer-events-none"
          aria-hidden="true"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        />
        <div className="container mx-auto px-6 md:px-12 relative">
          <div className="max-w-6xl mx-auto min-h-[44px]">
            {latestVotes.length > 0 && (
              <div
                ref={animationRef}
                className="flex animate-scroll-left whitespace-nowrap text-white transform-gpu"
                onAnimationIteration={handleAnimationIteration}
                style={{ willChange: applyWillChange ? 'transform' : undefined }}
              >
                {latestVotes
                  .filter(vote => vote.message && vote.message.trim() !== '')
                  .map((vote, index) => (
                    <div key={index} className="inline-flex items-center mx-8 flex-shrink-0">
                      <div className="text-left">
                        <p className="text-xs font-noto text-neutral-300">
                          {vote.voter_name || '匿名'} さん
                        </p>
                        <p className="text-sm font-noto">{vote.message}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;