import { useState } from 'react';
import Header from './components/Header';
import Title from './components/Title';
import Introduction from './components/Introduction';
import Message from './components/Message';
import TrueStory from './components/TrueStory';
import Artist from './components/Artist';
import News from './components/News';
import Crowdfunding from './components/Project';
import Contact from './components/Contact';
import SponsorSection from './components/SponsorSection';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import Seo from './components/Seo';

function App() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const seoKeywords = "True Story,実話の物語,truestory,ストーリー,実話,物語,トゥルーストーリー,ミュージックビデオ,MV,music Video,短編作品,ショートフィルム,クラウドファンディング,クラファン,キャンプファイヤー,CAMPFIRE,シンガー,シンガーソングライター,アーティスト,歌い手,シンガー募集,アーティスト募集,役者募集,演者募集,女優,俳優,支援,寄付,インフルエンサー,TikToker,Instagramer,YouTuber,カメラマン,映像クリエイター,映像ディレクター,動画クリエイター,照明,音声,映画";

  return (
    <div className="bg-black">
      <Seo
        title="誰かの実話を、一本の映像作品に"
        description="Hiroki Andoの新曲「True Story」のMV制作プロジェクト。ファンから寄せられた実話をもとに、心に響く物語を映像化します。あなたの支援が、この物語に命を吹き込みます。"
        keywords={seoKeywords}
        url="https://your-website-url.com" // あなたのウェブサイトのURLに置き換えてください
      />
      
      <div>
        <Header />
        <Title />
        <main>
          <SponsorSection />
          <News />
          <Introduction />
          <Message />
          <TrueStory />
          <Artist onShowPrivacyPolicy={openPrivacyPolicy} />
          <Crowdfunding />
          <Contact onShowPrivacyPolicy={openPrivacyPolicy} />
        </main>
        <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      </div>

      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
}

export default App;