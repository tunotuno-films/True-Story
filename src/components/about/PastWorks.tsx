import React from 'react';

const pastEvents = [
  {
    id: 2,
    title: "貴女",
    date: "2023年03月",
    theme: "青春×ジェンダー",
    winner: "山田 花子",
    storyTitle: "屋根裏の宝物",
    youtubeUrl: "https://www.youtube.com/embed/csPUmFAp584?si=kyneQK9XCRUZZL35",
    description: "2作目は、「コロナ禍の青春とジェンダー」をテーマに、約40名の出演者やスタッフによって制作されました。MVや映画などで活躍中の女優・実倉萌笑、NHK「わんわんワンダーランド」レギュラー出演経歴のある俳優・けいいちろう、ダンサーとして多くのYouTuberに振り付け指導を行い、国内CMにも携わっているダンサー兼モデル・Yuukiの三人の主演による、純愛な青春が次第に同性愛へと変わっていく、True Story【実話の物語】にふさわしい泣ける物語となっている。シンガーは、今Z世代でも注目を集めている、浜野はるきが作詞を行い、起案者でもあり作編曲家の翔馬-Shoma-が作曲を行なった。",
    images: [
      "/img/event2-1.jpg",
      "/img/event2-2.jpg",
      "/img/event2-3.jpg",
      "/img/event2-4.jpg"
    ],
    highlights: [
      "参加者数: 15名",
      "観客動員数: 120名",
      "会場: 渋谷ライブハウス",
      "特別ゲスト: 作家 鈴木一郎"
    ]
  },
  {
    id: 1,
    title: "クリスマスの奇跡",
    date: "2022年12月",
    theme: "クリスマスの奇跡",
    winner: "佐藤 太郎",
    storyTitle: "最初の一歩",
    youtubeUrl: "https://www.youtube.com/embed/rLNvit2_p3Y?si=NP8jTLRTGSi8cGwZ",
    description: "記念すべき1作目は「クリスマスの奇跡」をテーマに、backnumberのクリスマスソングをシンガーソングライターのゆうけいがカバー。MVや映画などで活躍中の女優・実倉萌笑、NHK「わんわんワンダーランド」レギュラー出演経歴のある俳優・けいいちろうが、クリスマスで起こった奇跡の物語を演じます。",
    images: [
      "/img/event1-1.jpg",
      "/img/event1-2.jpg",
      "/img/event1-3.jpg"
    ],
    highlights: [
      "参加者数: 10名",
      "観客動員数: 80名",
      "会場: 下北沢カフェスペース",
      "初開催記念イベント"
    ]
  }
];

const PastWorks = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto border-t border-neutral-700 pt-16">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
            過去作品
          </h2>
          <p className="text-center text-neutral-400 mb-16">Past works</p>
          {/* タイムライン */}
          <div className="relative">
            {/* 左側の縦線 (PC表示のみ) */}
            <div className="hidden md:block absolute left-0 md:left-[60px] w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
            {pastEvents.map((event) => (
              <div key={event.id} className="mb-20 last:mb-0 relative">
                {/* タイムラインドット (PC表示のみ) */}
                <div className="hidden md:flex absolute left-0 md:left-[44px] w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full border-4 border-black shadow-lg z-10 items-center justify-center">
                  <span className="text-xs font-bold text-black">{event.id}</span>
                </div>
                {/* イベントカード */}
                <div className="md:flex items-start md:flex-row">
                  {/* 左側のスペース */}
                  <div className="hidden md:block md:w-[140px]"></div>
                  {/* カードコンテンツ */}
                  <div className="md:flex-1 md:pl-8">
                    <div className="bg-neutral-900 rounded-lg shadow-2xl p-8 border border-neutral-800 hover:border-emerald-500/50 transition-all duration-300">
                      {/* ヘッダー */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/30">
                            {event.date}
                          </span>
                          <span className="text-3xl font-bold text-neutral-600">#{event.id}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3">{event.title}</h3>
                        <p className="text-xl text-emerald-400">テーマ: 「{event.theme}」</p>
                      </div>
                      {/* 説明 */}
                      <p className="text-neutral-300 leading-relaxed mb-6 text-base">{event.description}</p>
                      {/* YouTube埋め込み */}
                      <div className="mb-6">
                        <div className="aspect-video rounded-lg overflow-hidden shadow-lg border border-neutral-800">
                          <iframe
                            width="100%"
                            height="100%"
                            src={event.youtubeUrl}
                            title={`${event.title} - イベント動画`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        </div>
                      </div>
                      {/* 画像ギャラリー */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-white flex items-center">
                          <span className="mr-2">📸</span> イベントギャラリー
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {event.images.map((image, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden shadow-md border border-neutral-800 hover:border-emerald-500/50 transition-all duration-300 group">
                              <img
                                src={image}
                                alt={`${event.title} - 写真 ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/400x400/1a1a1a/4ade80?text=Coming+Soon';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PastWorks;