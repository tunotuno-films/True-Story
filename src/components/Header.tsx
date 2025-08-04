import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Menu, X } from 'lucide-react';

interface Vote {
  message: string | null;
  voter_name: string | null;
}

const Header: React.FC = () => {
  const [latestVotes, setLatestVotes] = useState<Vote[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animationRef = useRef<HTMLDivElement>(null);

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

  // アニメーションが1周した時の処理
  const handleAnimationIteration = () => {
    console.log('Animation iteration ended, fetching new data...');
    fetchLatestVotes();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMobileLinkClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'introduction', label: 'INTRODUCTION' },
    { id: 'message', label: 'MESSAGE' },
    { id: 'truestory', label: 'TRUE STORY' },
    { id: 'artist', label: 'ARTIST' },
    { id: 'news', label: 'NEWS' },
    { id: 'crowdfunding', label: 'PROJECT' },
    { id: 'contact', label: 'CONTACT' },
  ];

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 左端のタイトル */}
            <div className="text-white font-noto text-xl font-bold">
              True Story
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
          </div>
        </div>
      </nav>
      
      {/* 応援メッセージセクション */}
      <div className="bg-gray-800/30 backdrop-blur-sm py-2 overflow-hidden relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            {latestVotes.length > 0 && (
              <div 
                ref={animationRef}
                className="flex animate-scroll-left whitespace-nowrap text-white"
                onAnimationIteration={handleAnimationIteration}
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