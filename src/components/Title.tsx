import React from 'react';
import { ChevronDown } from 'lucide-react';

const Title: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const staff = [
    '鈴木太郎', '佐藤花子', '高橋健太', '田中美咲', '渡辺一郎',
    '伊藤さくら', '山本大輔', '中村あやか', '小林直樹', '加藤ゆり'
  ];

  return (
    <header className="hero-bg h-screen w-full flex flex-col justify-end items-start relative text-white -mt-28">
      <div className="relative z-10 p-8 md:p-12 w-full">
        <h2 className="font-noto text-xl md:text-3xl font-bold text-shadow mb-4">
          これは、あなたの物語かもしれない。
        </h2>
        <h1 className="font-noto text-5xl md:text-8xl font-black text-shadow tracking-wider">
          True Story
        </h1>
        <p className="font-noto text-2xl md:text-4xl font-bold text-shadow mt-2">
          【実話の物語】
        </p>
        
        <div className="mt-8">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-shadow">
            <span className="font-bold">制作:</span>
            {staff.map((name, index) => (
              <span key={index}>{name}</span>
            ))}
          </div>
        </div>

        <button
          onClick={() => scrollToSection('crowdfunding')}
          className="btn-cta inline-block mt-12 bg-white text-black font-bold font-noto py-4 px-12 rounded-full text-lg shadow-lg"
        >
          クラウドファンディングで応援する
        </button>
        <p className="font-noto mt-4 text-sm">受付期間: 2025.08.10 - 2025.09.30</p>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white" />
      </div>
    </header>
  );
};

export default Title;