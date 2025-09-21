import React, { useState, useEffect } from 'react';
import PrivacyPolicy from './PrivacyPolicy';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'dismissed') {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('cookie_consent', 'dismissed');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm">
            当サイトでは、ログイン機能などサービスの提供に必須のCookieを使用しています。サイトの利用を継続することで、これらのCookieの使用に同意したものとみなされます。
            詳細は
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="underline ml-1"
            >
              プライバシーポリシー
            </button>
            をご確認ください。
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDismiss}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              aria-label="閉じる"
            >
              OK
            </button>
          </div>
        </div>
      </div>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </>
  );
};

export default CookieConsent;
