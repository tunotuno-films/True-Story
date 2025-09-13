import React from 'react';
import { Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

// 追加: Threads 用の簡易 SVG アイコン
const ThreadsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8.5 11.5c1-2 3-3 5-3 1.5 0 2.8 0.6 3.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 14.5c0 .8-1 1.6-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const socialLinks = [
  { id: 'x', href: 'https://x.com/truestory_2023', label: 'X', icon: Twitter },
  { id: 'threads', href: 'https://www.threads.net/@truestory_2023', label: 'Threads', icon: ThreadsIcon },
  { id: 'instagram', href: 'https://www.instagram.com/truestory_2023/', label: 'Instagram', icon: Instagram },
  { id: 'facebook', href: 'https://www.facebook.com/people/Truestoryproject/100086524538968/', label: 'Facebook', icon: Facebook },
  { id: 'youtube', href: 'https://www.youtube.com/@truestoryt2023', label: 'YouTube', icon: Youtube },
];

const SocialLinks: React.FC = () => {
  return (
    // モバイル: 右下に固定。デスクトップ(md以上): 右中央に縦配置
    <div className="fixed right-4 bottom-4 md:right-4 md:top-1/2 md:bottom-auto transform md:-translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {/* 上側の装飾ライン（デスクトップでは長め、モバイルでは短め） */}
      <div className="hidden md:block w-px h-16 bg-white/10" />
      {socialLinks.map((s) => {
        const Icon = s.icon;
        return (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-neutral-900/80 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700/80 hover:scale-105 transition transform"
          >
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        );
      })}
      {/* 下側の装飾ライン */}
      <div className="w-px h-12 md:h-16 bg-white/10 mt-2" />
    </div>
  );
};

export default SocialLinks;
