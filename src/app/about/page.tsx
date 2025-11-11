"use client";

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Seo from '@/components/Seo';
import { seoKeywords } from '../../constants';
import PrivacyPolicy from '../../components/PrivacyPolicy';
import Message from '@/components/Message';
import ProjectOverview from '@/components/about/ProjectOverview';
import Recruitment from '@/components/about/Recruitment';
import PastWorks from '@/components/about/PastWorks';
import Contact from '@/components/Contact'

const AboutPage = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  return (
    <div className="bg-[#40848E] text-white font-noto">
      <Seo
        title="このプロジェクトについて | True Story【実話の物語】"
        description="True Story【実話の物語】は、そんな時代にこそ「人が生きてきた本当の物語」に光を当てるプロジェクトです。"
        keywords={typeof seoKeywords === 'string' ? seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : seoKeywords}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/about`}
      />
      <Header />
      <main className="pb-32">
        <ProjectOverview />
        <Message />
        <Recruitment />
        <PastWorks />
        <Contact onShowPrivacyPolicy={openPrivacyPolicy} />  
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    
    </div>
  );
};

export default AboutPage;