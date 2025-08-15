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

function App() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  return (
    <div className="bg-black">
      <Seo
        title="True Story【実話の物語】"
        description="寄せられた実話をもとに、心に響く物語を映像化します。あなたの支援が、この物語に命を吹き込みます。"
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