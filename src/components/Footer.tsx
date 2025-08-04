import React from 'react';

interface FooterProps {
  onShowPrivacyPolicy: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowPrivacyPolicy }) => {
  return (
    <footer className="bg-black text-neutral-500 py-6 text-center text-xs">
      <div className="container mx-auto px-6">
        <button onClick={onShowPrivacyPolicy} className="hover:text-white transition-colors duration-300 mb-2">
          個人情報の取り扱いについて
        </button>
        <p>&copy; {new Date().getFullYear()} True Story Project. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;