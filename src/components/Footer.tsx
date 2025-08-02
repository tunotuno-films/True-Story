import React from 'react';

interface FooterProps {
  onShowPrivacyPolicy: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowPrivacyPolicy }) => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 py-8">
      <div className="container mx-auto px-6 text-center">
        <div className="mb-4">
          <button onClick={onShowPrivacyPolicy} className="hover:text-white transition-colors duration-300">
            個人情報の取り扱いについて
          </button>
        </div>
        <p>&copy; {new Date().getFullYear()} True Story Project. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;