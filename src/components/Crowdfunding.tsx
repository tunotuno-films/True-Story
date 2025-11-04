import React from 'react';
import Link from 'next/link';

const Crowdfunding: React.FC = () => {

  return (
    <section id="crowdfunding" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h2 className="section-title text-4xl md:text-5xl mb-4 gradient-text">CROWDFUNDING</h2>
        <p className="font-noto text-lg mb-12">クラウドファンディング期間：2026年3月1日〜2026年4月14日（予定）</p>
        <div className="max-w-4xl mx-auto text-left bg-neutral-800/60 p-8 md:p-12 rounded-lg border border-neutral-700 shadow-sm">
          <p className="font-noto text-base leading-relaxed text-neutral-300 mb-8">
            リターン内容や実際の開始時期などは、当サイトにてお知らせいたします。
          </p>
          <p className="font-noto text-base leading-relaxed text-neutral-300 mb-8">
            以下から、メンバーシップへの登録（無料）をお願いいたします。
          </p>
        </div>
        <Link
          href="/users"
          className="btn-cta inline-block mt-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold font-noto py-4 px-12 rounded-full text-lg shadow-lg"
        >
          メンバーシップへの登録（無料）
        </Link>
      </div>
    </section>
  );
};

export default Crowdfunding;