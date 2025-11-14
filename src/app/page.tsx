"use client";

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Title from '../components/Title';
import Introduction from '../components/Introduction';
import TrueStory from '../components/TrueStory';
import Artist from '../components/Artist';
import News from '../components/News';
import MainAd from '../components/MainAd';
import Crowdfunding from '../components/Crowdfunding';
import Contact from '../components/Contact';
import SponsorSection from '../components/Sponsor';
import Footer from '../components/Footer';
import PrivacyPolicy from '../components/PrivacyPolicy';
import Seo from '../components/Seo';
import CountdownTimer from '../components/CountdownTimer';
import { seoKeywords } from '../constants';
import GoldAd from '../components/GoldAd';
import SocialLinks from '../components/SocialLinks';

export default function HomePage() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getHeaderHeight = () => {
      const headerEl = document.querySelector('header') as HTMLElement | null;
      return headerEl?.offsetHeight || 80;
    };

    const scrollToElementWithOffset = (el: HTMLElement, smooth = true) => {
      const headerHeight = getHeaderHeight();
      const extraOffset = -800;
      let top = window.pageYOffset + el.getBoundingClientRect().top - headerHeight - extraOffset;
      if (top < 0) top = 0;
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    };

    const scrollIfTruestoryForm = () => {
      if (window.location.hash === '#truestoryform') {
        const tryScroll = (tries = 0) => {
          const el = document.getElementById('truestoryform');
          if (el) {
            scrollToElementWithOffset(el);
          } else if (tries < 8) {
            setTimeout(() => tryScroll(tries + 1), 50);
          }
        };
        tryScroll(0);
      }
    };

    scrollIfTruestoryForm();
    window.addEventListener('hashchange', scrollIfTruestoryForm);

    return () => {
      window.removeEventListener('hashchange', scrollIfTruestoryForm);
    };
  }, []);

  return (
    <div className="bg-black">
      <Seo
        title="True Story【実話の物語】| これは、あなたの物語かもしれない。"
        description="実話を基に楽曲制作・映像制作を行うTrue Story【実話の物語】。誰かの実話で、誰かが歌い、誰かが演じます。決まったマニュアルはありません。"
        keywords={typeof seoKeywords === 'string' ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : seoKeywords}
        url={process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'}
      />
      
      <Header />
      <Title />
      <main>
        <News />
        <MainAd />
        <Introduction />
        <GoldAd />

        <section id="truestory">
          <TrueStory />
        </section>
        <Artist onShowPrivacyPolicy={openPrivacyPolicy} />
        <Crowdfunding />
        <SponsorSection />
        <Contact onShowPrivacyPolicy={openPrivacyPolicy} />
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />

      <SocialLinks />

      <CountdownTimer />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
}
