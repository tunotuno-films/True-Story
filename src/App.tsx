import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Title from './components/Title';
import Introduction from './components/Introduction';
import Message from './components/Message';
import TrueStory from './components/TrueStory';
import Artist from './components/Artist';
import News from './components/News';
import MainAd from './components/MainAd';
import Crowdfunding from './components/Crowdfunding';
import Contact from './components/Contact';
import SponsorSection from './components/Sponsor';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import { default as MyPage } from './pages/User';
import SponsorPage from './pages/Sponsor';
import { IndividualMyPage } from './pages/Member';
import Seo from './components/Seo';
import CountdownTimer from './components/CountdownTimer';
import { seoKeywords } from './constants';
import GoldAd from './components/GoldAd';
import { Analytics } from '@vercel/analytics/react';
import SocialLinks from './components/SocialLinks';
import { AuthProvider } from './contexts/AuthContext'; // Assuming this is the sponsor registration form

// MainPageコンポーネントをApp関数の外に定義
const MainPage = ({ openPrivacyPolicy, closePrivacyPolicy, showPrivacyPolicy }: {
  openPrivacyPolicy: () => void;
  closePrivacyPolicy: () => void;
  showPrivacyPolicy: boolean;
}) => {
  // ハッシュが #truestoryform のときに該当要素へスクロールする（初回 & hashchange 対応）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getHeaderHeight = () => {
      const headerEl = document.querySelector('header') as HTMLElement | null;
      return headerEl?.offsetHeight || 80;
    };

    const scrollToElementWithOffset = (el: HTMLElement, smooth = true) => {
      const headerHeight = getHeaderHeight();
      const extraOffset = -800; // ここで「もっと下に見せる」分を増やせます（px）
      // 要素のページ上の位置を計算してヘッダー分＋追加余白分オフセット
      let top = window.pageYOffset + el.getBoundingClientRect().top - headerHeight - extraOffset;
      if (top < 0) top = 0; // 負のスクロールを防止
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    };

    // 要素がまだ存在しない場合に備えてリトライする
    const scrollIfTruestoryForm = () => {
      if (window.location.hash === '#truestoryform') {
        const tryScroll = (tries = 0) => {
          const el = document.getElementById('truestoryform');
          if (el) {
            scrollToElementWithOffset(el);
          } else if (tries < 8) {
            // 50ms 間隔で最大 8 回リトライ（合計約400ms）
            setTimeout(() => tryScroll(tries + 1), 50);
          }
        };
        tryScroll(0);
      }
    };

    // 初回チェック
    scrollIfTruestoryForm();
    // SPA 内でハッシュが変わった時にも対応
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
        {/* ここをアンカーターゲットにする */}
        <section id="truestory">
          <TrueStory />
        </section>
        <Artist onShowPrivacyPolicy={openPrivacyPolicy} />
        <Crowdfunding />
        <SponsorSection />
        <Contact onShowPrivacyPolicy={openPrivacyPolicy} />
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />

      {/* 右側に縦並びのSNSリンクを表示 */}
      <SocialLinks />

      <CountdownTimer />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  return (
    <Routes>
      <Route path="/" element={<MainPage openPrivacyPolicy={openPrivacyPolicy} closePrivacyPolicy={closePrivacyPolicy} showPrivacyPolicy={showPrivacyPolicy} />} />
      <Route path="/users" element={<MyPage />} />
      <Route path="/users/member" element={<IndividualMyPage />} />
      <Route path="/users/member/:userId" element={<IndividualMyPage />} />
      <Route path="/users/sponsor" element={<SponsorPage />} />
      <Route path="/users/sponsor/:id" element={<SponsorPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Analytics />
      </Router>
    </AuthProvider>
  );
}

export default App;
