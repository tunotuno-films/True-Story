import React from 'react';
import { ChevronDown } from 'lucide-react';

const BG_IMAGE_URL = import.meta.env.VITE_BG_IMAGE_URL;
if (!BG_IMAGE_URL) {
  throw new Error('VITE_BG_IMAGE_URL is a required environment variable and was not provided.');
}

const Title: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="w-full flex flex-col justify-end items-start relative text-white -mt-28 h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
    >
      {/* 黒いオーバーレイ */}
      {/* <div className="absolute inset-0 bg-black/70 z-0" /> */}
      <div className="relative z-10 p-6 md:p-12 w-full">
        <h2 className="font-noto text-lg md:text-3xl font-bold text-shadow mb-2 md:mb-4">
          これは、あなたの物語かもしれない。
        </h2>
        <h1 className="font-noto text-4xl md:text-8xl font-black text-shadow tracking-wider">
          True Story
        </h1>
        <p className="font-noto text-xl md:text-4xl font-bold text-shadow mt-1 md:mt-2">
          【実話の物語】
        </p>
        
        <div className="mt-4 md:mt-8">
          <div className="text-xs md:text-sm text-shadow font-bold">
            運営：True Story【実話の物語】製作委員会
          </div>
        </div>

        <button
          onClick={() => scrollToSection('truestory')}
          className="btn-cta inline-block mt-6 md:mt-12 mb-8 md:mb-0 bg-white text-black font-bold font-noto py-3 md:py-4 px-8 md:px-12 rounded-full text-base md:text-lg shadow-lg"
        >
          実話募集中！
        </button>
        <p className="font-noto mt-2 md:mt-4 text-xs md:text-sm">募集期間: 2025.09.15 - 2025.10.31</p>
      </div>
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-white" />
      </div>
    </header>
  );
};

export default Title;