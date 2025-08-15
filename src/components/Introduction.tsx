import React from 'react';

const Introduction: React.FC = () => {
  return (
    <section id="introduction" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">INTRODUCTION</h2>
        <p className="font-noto text-lg text-center mb-12">はじめに</p>
        <div className="max-w-4xl mx-auto">
          <h3 className="font-noto text-2xl md:text-4xl font-bold leading-relaxed mb-8">
            まだまだ知らない物語がそこにある。
          </h3>
          <p className="font-noto text-base md:text-lg leading-loose text-neutral-300">
            実話を基に楽曲制作・映像制作を行うTrue Story【実話の物語】は、2022年にスタートしました。<br />
            誰かの実話で、誰かが歌い、誰かが演じます。<br />
            決まったマニュアルはありません。<br />
            ０（スタート）状態から、多くの支援をいただき、制作関係者が100（完成）にします。<br />
            だからこそ、美しいストーリーが完成します。<br />
            2026年夏、どのような作品が出来上がるのかまだ誰も知りません。<br />
            私たちは挑戦します！
          </p>
        </div>
      </div>
    </section>
  );
};

export default Introduction;