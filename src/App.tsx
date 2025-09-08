import { useState } from 'react';
import Header from './components/Header';
import Title from './components/Title';
import Introduction from './components/Introduction';
import Message from './components/Message';
import TrueStory from './components/TrueStory';
import Artist from './components/Artist';
import News from './components/News';
import MainAd from './components/MainAd';
import Crowdfunding from './components/Project';
import Contact from './components/Contact';
import SponsorSection from './components/Sponsor';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import Seo from './components/Seo';
import CountdownTimer from './components/CountdownTimer';
import { seoKeywords } from './constants';
import GoldAd from './components/GoldAd';
import { Analytics } from '@vercel/analytics/react';
import Schedule from './components/Schedule';

function App() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  return (
    <div className="bg-black">
      <Seo
        title="True Story【実話の物語】| これは、あなたの物語かもしれない。"
        description="実話を基に楽曲制作・映像制作を行うTrue Story【実話の物語】。誰かの実話で、誰かが歌い、誰かが演じます。決まったマニュアルはありません。"
        keywords={seoKeywords}
        url={import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173'}
      />
      
      <Header />
      <Title />
      <main>
        <News />
        <MainAd />
        <Introduction />
        <Message />
        <Schedule />
        <GoldAd />
        <TrueStory onShowPrivacyPolicy={openPrivacyPolicy} />
        <Artist onShowPrivacyPolicy={openPrivacyPolicy} />
        <Crowdfunding />
        <SponsorSection />
        <Contact onShowPrivacyPolicy={openPrivacyPolicy} />
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />

      <CountdownTimer />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
      <Analytics />
    </div>
  );
}

export default App;