"use client";

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import About from '@/pages/About';
import Seo from '@/components/Seo';
import { seoKeywords } from '../../constants';
import PrivacyPolicy from '../../components/PrivacyPolicy';

const pastEvents = [
  {
    id: 2,
    title: "貴女",
    date: "2023年03月",
    theme: "青春×ジェンダー",
    winner: "山田 花子",
    storyTitle: "屋根裏の宝物",
    youtubeUrl: "https://www.youtube.com/embed/csPUmFAp584?si=kyneQK9XCRUZZL35",
    description: "第2回目の開催となった今回は「秘密」をテーマに、参加者それぞれの心に秘めた物語が語られました。優勝作品「屋根裏の宝物」は、幼少期の思い出と家族の絆を描いた感動的なストーリーでした。",
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
    theme: "始まり",
    winner: "佐藤 太郎",
    storyTitle: "最初の一歩",
    youtubeUrl: "https://www.youtube.com/embed/rLNvit2_p3Y?si=NP8jTLRTGSi8cGwZ",
    description: "記念すべき第1回目の開催。「始まり」をテーマに、新しい挑戦や人生の転機となった出来事について語られました。優勝作品「最初の一歩」は、夢を追いかけ始めた若者の勇気ある決断を描いた作品です。",
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

const AboutPage = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  return (
    <div className="bg-black text-white font-noto">
      <Seo
        title="このプロジェクトについて | True Story【実話の物語】"
        description="True Story【実話の物語】は、そんな時代にこそ「人が生きてきた本当の物語」に光を当てるプロジェクトです。"
        keywords={typeof seoKeywords === 'string' ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : seoKeywords}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/about`}
      />
      <Header />
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
              True Story【実話の物語】をやる理由
            </h1>

            {/* プロジェクト概要 */}
            <section className="mb-24">
              <div className="space-y-8 text-lg leading-relaxed text-neutral-200">
                <p>
                  テクノロジーの進化によって、誰もが手軽に情報を発信し、“感性と表現の領域”までもが、AIなどに置き換えられてしまう時代になりました。
                </p>
                <p>
                  その一方で、SNSフェイクニュースや匿名の言葉があふれ、真実と虚構の境界が曖昧になり、人と人との心の距離が広がっているようにも感じます。
                </p>
                <p>
                  <strong className="text-white">True Story【実話の物語】</strong>は、そんな時代にこそ「人が生きてきた本当の物語」に光を当てるプロジェクトです。
                </p>
                <p>
                  誰かの実体験をもとに、音楽と映像を通して“真実の記録”として残す。AIでは再現できない、人の心にしか生み出せないあたたかさや、痛み、希望を表現していきます。
                </p>
                <p>
                  世の中には、まだ知られていないけれど、きっと誰かの背中を押す力を持ったストーリーがたくさんあります。その一つひとつを「実話」として掘り起こし、誰かが詩にし、アーティストやクリエイターが作品として形にしていく。そこに生まれる共感や対話こそが、次の誰かを救うきっかけになると信じています。
                </p>
                <p>
                  出所のわからない情報に流されるのではなく、“人が創り、人が伝える”という原点に立ち返る。私たちは、そんな想いを共有してくださるすべての方々とともに、「真実の声が響く社会」を創り続けていきます。
                </p>
              </div>
            </section>

            {/* 代表メッセージ */}
            <section>
              {/* 翔馬さん */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16">
                <div className="md:w-1/3">
                  <img
                    src="https://npxqbgysjxykcykaiutm.supabase.co/storage/v1/object/sign/img/shoma.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xOGQ3YjhmZS03YWM0LTQyYWQtOGQyNS03YzU3Y2NjNjExNzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvc2hvbWEuanBnIiwiaWF0IjoxNzU1OTY3ODQ5LCJleHAiOjQ4NzgwMzE4NDl9.xs2gvkKeEU7hEU4Rh-qKyTrLHIUc7Dkq4d8yfW6dX4s"
                    alt="翔馬-Shoma"
                    className="rounded-full shadow-lg w-48 h-48 md:w-64 md:h-64 mx-auto object-cover"
                  />
                  <p className="font-noto font-bold text-lg text-center mt-4">翔馬-Shoma</p>
                </div>
                <div className="md:w-2/3 bg-neutral-900 p-6 rounded-lg">
                  <p className="font-noto text-base leading-loose text-neutral-300">
                    SNSで言うとフェイクニュースが当たり前のように出回っている。そのフェイクニュースで知らない人同士がぶつかっている。その情報の親和性をあたらめて認識してもらう。
                    <br /><br />
                    音楽も映像もAIで誰でも作れる時代になったが、実際に人が体験したストーリーを人が制作する。人間味がある、人ならではの良さ、あたたかさ、フェイクニュースではない本当の実話と記憶、人間の真偽。
                  </p>
                </div>
              </div>

              {/* 安藤さん */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12 mb-24">
                <div className="md:w-1/3">
                  <img
                    src="https://npxqbgysjxykcykaiutm.supabase.co/storage/v1/object/sign/img/00_hiroki%20ando.JPEG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xOGQ3YjhmZS03YWM0LTQyYWQtOGQyNS03YzU3Y2NjNjExNzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvMDBfaGlyb2tpIGFuZG8uSlBFRyIsImlhdCI6MTc1NDI4NjI1MCwiZXhwIjo0ODc2MzUwMjUwfQ.pXSJY60xvZ3dxQxFWt1VHHT5SaKfGS7-rTS12JlCj1c"
                    alt="Hiroki Ando"
                    className="rounded-full shadow-lg w-48 h-48 md:w-64 md:h-64 mx-auto object-cover"
                  />
                  <p className="font-noto font-bold text-lg text-center mt-4">Hiroki Ando</p>
                </div>
                <div className="md:w-2/3 bg-neutral-900 p-6 rounded-lg">
                  <p className="font-noto text-base leading-loose text-neutral-300">
                    世の中に埋もれているが、表に出した方がいいストーリー（そのストーリーで誰かが救われる）がある。その誰かの実話を誰かが詩にして、True Story【実話の物語】が制作する。
                    <br /><br />
                    共感もあれば、別の意見も出てくるだろうし、その意見で救われる人も中にはいるはず。ネットやSNSなど誰の情報なのかわからないものを信じるのではなく、人が１から創り上げたものに意味がある。（FACTは出所不明な情報ではなく、全てが記録として残っているTrue Story【実話の物語】にある。）
                  </p>
                </div>
              </div>
            </section>

            {/* 仲間募集 */}
            <section className="text-center border-t border-neutral-700 pt-16">
              <h3 className="text-3xl font-bold text-white mb-4">仲間を探しています！</h3>
              <p className="text-lg leading-relaxed text-neutral-300 max-w-2xl mx-auto">
                誰かを救いたい。誰かにメッセージを届けたい。実話を届けることで応援していくことが、このプロジェクトの目的です。この想いに共感し、共に歩んでくれる仲間を私たちは探しています。
              </p>
            </section>

            {/* 過去の開催履歴 */}
            <section className="mt-24 border-t border-neutral-700 pt-16">
              <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
                開催履歴
              </h2>
              <p className="text-center text-neutral-400 mb-16">Past Events Timeline</p>
              
              {/* タイムライン */}
              <div className="relative">
                {/* 左側の縦線 (PC表示のみ) */}
                <div className="hidden md:block absolute left-0 md:left-[60px] w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
                
                {pastEvents.map((event, index) => (
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

                            <div className="aspect-video rounded-lg overflow-hidden shadow-lg border border-neutral-800">
                              <iframe width="560" height="315" src="https://www.youtube.com/embed/csPUmFAp584?si=nNiPj6m1mS38p2UD" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
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
                                      e.currentTarget.src = 'https://via.placeholder.com/400x400/1a1a1a/4ade80?text=Coming+Soon';
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
            </section>
          </div>
        </div>
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
};

export default AboutPage;
