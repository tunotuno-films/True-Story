import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import { seoKeywords } from '../constants';
import PrivacyPolicy from '../components/PrivacyPolicy';

const About: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  return (
    <div className="bg-black text-white font-noto">
      <Seo
        title="このプロジェクトについて | True Story【実話の物語】"
        description="True Story【実話の物語】は、そんな時代にこそ「人が生きてきた本当の物語」に光を当てるプロジェクトです。"
        keywords={typeof seoKeywords === 'string' ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : seoKeywords}
        url={`${import.meta.env.VITE_APP_BASE_URL}/about`}
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
          </div>
        </div>
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
};

export default About;
