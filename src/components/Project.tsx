import React from 'react';

const Project: React.FC = () => {
  const plans = [
    {
      price: '¥3,000プラン:',
      details: 'MVエンドロールへのお名前掲載（小）'
    },
    {
      price: '¥10,000プラン:',
      details: 'お名前掲載（中）＋限定デジタルフォトブック'
    },
    {
      price: '¥30,000プラン:',
      details: 'お名前掲載（大）＋限定Tシャツ＋サイン入りポストカード'
    },
    {
      price: '¥100,000プラン:',
      details: '上記全て＋MV撮影現場へのご招待（オンライン見学も可）'
    }
  ];

  return (
    <section id="crowdfunding" className="py-20 md:py-32 bg-black">
      <div className="container mx-auto px-6 md:px-12 text-center">
        <h2 className="section-title text-4xl md:text-5xl mb-4 gradient-text">PROJECT</h2>
        <p className="font-noto text-lg mb-12">プロジェクト詳細とリターンについて</p>
        <div className="max-w-4xl mx-auto text-left bg-neutral-900 p-8 md:p-12 rounded-lg">
          <h3 className="font-noto text-2xl font-bold mb-6">皆様からの支援で実現できること</h3>
          <p className="font-noto text-base leading-relaxed text-neutral-300 mb-8">
            皆様からいただいた支援金は、ミュージックビデオの制作に関わる全ての費用に充当させていただきます。具体的には、撮影機材費、スタジオ・ロケーション費、キャスト・スタッフへの人件費、編集・CG制作費などです。目標金額を達成することで、楽曲の世界観を妥協なく表現することが可能になります。
          </p>
          <h3 className="font-noto text-2xl font-bold mb-6">リターン（返礼品）について</h3>
          <p className="font-noto text-base leading-relaxed text-neutral-300 mb-8">
            ご支援いただいた皆様には、感謝の気持ちを込めて様々なリターンをご用意しました。
          </p>
          <ul className="list-disc list-inside space-y-4 font-noto text-neutral-300">
            {plans.map((plan, index) => (
              <li key={index}>
                <span className="font-bold text-white">{plan.price}</span> {plan.details}
              </li>
            ))}
          </ul>
        </div>
        <a
          href="#link-to-crowdfunding-site"
          className="btn-cta inline-block mt-12 bg-white text-black font-bold font-noto py-4 px-12 rounded-full text-lg shadow-lg"
        >
          プロジェクトページで詳細を見る
        </a>
      </div>
    </section>
  );
};

export default Project;