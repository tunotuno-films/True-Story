import React from 'react';

const Introduction: React.FC = () => {
  return (
    <section id="introduction" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h2 className="section-title text-4xl md:text-5xl mb-4 gradient-text">INTRODUCTION</h2>
        <p className="font-noto text-lg mb-12">はじめに</p>
        <h3 className="font-noto text-2xl md:text-4xl font-bold leading-relaxed mb-8 max-w-4xl mx-auto">
          誰かの心に眠る「実話」を、一本の映像作品に。
        </h3>
        <p className="font-noto text-base md:text-lg leading-loose max-w-3xl mx-auto text-neutral-300">
          私たちの誰もが、心の中に自分だけの物語を持っています。<br />
          喜び、悲しみ、後悔、そして感謝。言葉にできずに、あるいは伝える相手もいないまま、ひっそりと仕舞われている記憶。<br /><br />
          新曲「True Story」は、そんな誰かの実体験から生まれた楽曲です。<br />
          このプロジェクトは、その歌の世界観を、最高品質のミュージックビデオとして形にすることを目指しています。<br /><br />
          あなたの支援が、この物語に命を吹き込みます。
        </p>
      </div>
    </section>
  );
};

export default Introduction;