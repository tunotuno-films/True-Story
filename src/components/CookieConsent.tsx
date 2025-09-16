import React, { useState, useEffect } from 'react';
import PrivacyPolicy from './PrivacyPolicy';

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'true' && consent !== 'false') {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowConsent(false);
  };

  const handleDecline = () => {
    // ユーザーが拒否したことを保存（将来的に非必須クッキーを読み込まないなどに利用）
    localStorage.setItem('cookie_consent', 'false');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm">
            当サイトでは、お客様の利便性向上やサイト改善のためにCookieを使用しています。
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
              onClick={handleAccept}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              aria-label="Cookieに同意する"
            >
              同意する
            </button>
            <button
              onClick={handleDecline}
              className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded"
              aria-label="Cookieを拒否する"
            >
              同意しない
            </button>
          </div>
        </div>
      </div>
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </>
  );
};

export default CookieConsent;
