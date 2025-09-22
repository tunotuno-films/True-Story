import React from 'react';
import { faXTwitter, faFacebook, faThreads, faYoutube, faInstagram } from '@fortawesome/free-brands-svg-icons'; // X (Twitter)アイコン, Facebookアイコン, Youtubeアイコン, Instagramアイコン
// Font Awesomeのインポート
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';



type SocialLink = { id: string; href: string; label: string; faIcon: IconProp };

const socialLinks: SocialLink[] = [
  { id: 'x', href: 'https://x.com/truestory_2023', label: 'X', faIcon: faXTwitter },
  // ThreadsアイコンをFont Awesomeのコンポーネントに置き換える
  { id: 'threads', href: 'https://www.threads.net/@truestory_2023', label: 'Threads', faIcon: faThreads },
  { id: 'instagram', href: 'https://www.instagram.com/truestory_2023/', label: 'Instagram', faIcon: faInstagram },
  { id: 'facebook', href: 'https://www.facebook.com/people/Truestoryproject/100086524538968/', label: 'Facebook', faIcon: faFacebook },
  { id: 'youtube', href: 'https://www.youtube.com/@truestoryt2023', label: 'YouTube', faIcon: faYoutube },
];

const SocialLinks: React.FC = () => {
  return (
    <div className="fixed right-4 bottom-4 md:right-4 md:top-1/2 md:bottom-auto transform md:-translate-y-1/2 z-50 flex flex-col items-center gap-3">
      <div className="hidden md:block w-px h-16 bg-white/10" />
      {socialLinks.map((s) => {
        return (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-neutral-900/80 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700/80 hover:scale-105 transition transform"
          >
            <FontAwesomeIcon icon={s.faIcon} className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        );
      })}
      <div className="w-px h-12 md:h-16 bg-white/10 mt-2" />
    </div>
  );
};

export default SocialLinks;