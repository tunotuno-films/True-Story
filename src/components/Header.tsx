import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Menu, X } from 'lucide-react';
import CookieConsent from './CookieConsent';
import { useAuth } from '../contexts/AuthContext';

interface Vote {
  message: string | null;
  voter_name: string | null;
}

interface NavItem {
  id?: string;
  path?: string;
  label: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isLoggedIn = !!session;

  const [latestVotes, setLatestVotes] = useState<Vote[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);
  const [applyWillChange, setApplyWillChange] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const fetchLatestVotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('message, voter_name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching latest votes:', error);
    } else {
      setLatestVotes(data || []);
    }
  }, []);

  useEffect(() => {
    fetchLatestVotes();
  }, [fetchLatestVotes]);

  const handleAnimationIteration = () => {
    fetchLatestVotes();
  };

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== '/') {
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
    if (window.location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems: NavItem[] = [
    { path: '/about', label: 'ABOUT' },
    { id: 'truestoryform', label: 'TRUE STORY' },
    { id: 'artist', label: 'ARTIST' },
    { id: 'crowdfunding', label: 'CROWDFUNDING' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleMyPageClick = () => {
    navigate('/users');
  };

  // ログイン中はマイページへ遷移、未ログイン時はメンバーシップへ
  const handleAuthButtonClick = () => {
    if (isLoggedIn) {
      const userId = session?.user?.id;
      if (userId) {
        navigate(`/users/member/${userId}`);
        return;
      }
      // fallback: メンバーシップ画面へ（session が取れない場合）
      handleMyPageClick();
    } else {
      handleMyPageClick();
    }
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const el = animationRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setApplyWillChange(entry.isIntersecting && !prefersReducedMotion && latestVotes.length > 0);
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [latestVotes.length, prefersReducedMotion]);

  return (
    <>
      <header className="sticky top-0 z-50">
        <nav className="bg-black">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div
                className="text-white font-noto text-xl font-bold cursor-pointer"
                onClick={scrollToTop}
              >
                True Story【実話の物語】
              </div>
              
              <div className="hidden xl_custom:flex items-center space-x-4 md:space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else if (item.id) {
                        scrollToSection(item.id);
                      }
                    }}
                    className="text-neutral-300 hover:text-white transition duration-300 font-noto"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={handleAuthButtonClick}
                  className="text-white transition duration-300 font-noto px-2 py-1 border border-transparent hover:opacity-90"
                >
                  <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2 px-4 rounded">
                   {isLoggedIn ? 'マイページ' : 'メンバーシップ'}
                  </span>
                </button>
              </div>

              <div className="xl_custom:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
          </div>

          <div 
            className={`xl_custom:hidden bg-black/95 backdrop-blur-md absolute w-full z-40 shadow-lg border-t border-gray-700 transition-all duration-300 ease-in-out transform origin-top ${
              isMenuOpen 
                ? 'opacity-100 scale-y-100 translate-y-0' 
                : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="container mx-auto px-4 pb-4">
              {navItems.map((item, index) => (
                <div 
                  key={item.label}
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
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      } else if (item.id) {
                        handleMobileLinkClick(item.id);
                      }
                    }}
                    className="block w-full text-left py-4 px-4 text-neutral-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 font-noto rounded-md"
                  >
                    {item.label}
                  </button>
                  {index < navItems.length - 1 && (
                    <div className="border-b border-gray-700/50 mx-2"></div>
                  )}
                </div>
              ))}
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
                  onClick={() => {
                    handleAuthButtonClick();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-4 px-4 transition-all duration-300 font-noto mt-2"
                >
                  <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2 px-4 rounded">
                    {isLoggedIn ? 'マイページ' : 'メンバーシップ'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 py-2 overflow-hidden isolate">
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
                            {vote.voter_name || '匿名'}より
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
      <CookieConsent />
    </>
  );
};

export default Header;
