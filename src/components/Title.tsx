import React from 'react';
import { ChevronDown } from 'lucide-react';

const Title: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="hero-bg h-screen w-full flex flex-col justify-center items-center relative text-white -mt-20">
      <div className="relative z-10 text-center p-4">
        <h2 className="font-noto text-xl md:text-3xl font-bold text-shadow mb-4">
          これは、あなたの物語かもしれない。
        </h2>
        <h1 className="font-noto text-5xl md:text-8xl font-black text-shadow tracking-wider">
          True Story
        </h1>
        <p className="font-noto text-2xl md:text-4xl font-bold text-shadow mt-2">
          【実話の物語】
        </p>
        
        <button
          onClick={() => scrollToSection('crowdfunding')}
          className="btn-cta inline-block mt-12 bg-white text-black font-bold font-noto py-4 px-12 rounded-full text-lg shadow-lg"
        >
          クラウドファンディングで応援する
        </button>
        <p className="font-noto mt-4 text-sm">受付期間: 2025.08.10 - 2025.09.30</p>
      </div>
      <div className="absolute bottom-8 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white" />
      </div>
    </header>
  );
};

export default Title;