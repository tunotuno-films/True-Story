import { useState } from 'react';
import Header from './components/Header';
import Title from './components/Title';
import Introduction from './components/Introduction';
import Message from './components/Message';
import TrueStorySection from './components/TrueStorySection';
import Artist from './components/Artist';
import News from './components/News';
import Crowdfunding from './components/Project';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';

function App() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  return (
    <div className="bg-black">
      <Header />
      <Title />
      <main>
        <Introduction />
        <Message />
        <TrueStorySection />
        <Artist onShowPrivacyPolicy={openPrivacyPolicy} />
        <News />
        <Crowdfunding />
      </main>
      <Footer onShowPrivacyPolicy={openPrivacyPolicy} />
      {showPrivacyPolicy && <PrivacyPolicy onClose={closePrivacyPolicy} />}
    </div>
  );
}

export default App;