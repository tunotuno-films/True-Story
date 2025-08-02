import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Vote {
  message: string | null;
  voter_name: string | null;
}

const Header: React.FC = () => {
  const [latestVotes, setLatestVotes] = useState<Vote[]>([]);
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

  const navItems = [
    { id: 'introduction', label: 'INTRODUCTION' },
    { id: 'message', label: 'MESSAGE' },
    { id: 'truestory', label: 'TRUE STORY' },
    { id: 'artist', label: 'ARTIST' },
    { id: 'news', label: 'NEWS' },
    { id: 'crowdfunding', label: 'PROJECT' },
  ];

  return (
    <>
      <nav className="bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* 左端のタイトル */}
            <div className="text-white font-noto text-xl font-bold">
              True Story
            </div>
            
            {/* 右端のメニュー */}
            <div className="flex items-center space-x-4 md:space-x-8">
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
          </div>
        </div>
      </nav>
      
      {/* 応援メッセージセクション - 固定表示 */}
      <div className="bg-gray-800/30 backdrop-blur-sm sticky top-16 z-40 py-2 overflow-hidden">
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
    </>
  );
};

export default Header;