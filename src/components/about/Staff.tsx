import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube, faInstagram, faXTwitter, faThreads } from '@fortawesome/free-brands-svg-icons';

const Message: React.FC = () => {
  return (
    <section id="message" className="py-20 md:py-32 bg-[#40848E]">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-12 gradient-text">スタッフ</h2>

        <div className="max-w-6xl mx-auto flex flex-wrap md:flex-row items-center justify-center gap-4 md:gap-8 mb-4">
          {/* 1人目 */}
          <div className="md:w-1/4 flex flex-col items-center justify-center">
            <img
              src=""
              alt="アーティスト写真"
              className="rounded-full shadow-lg w-32 h-32 object-cover"
            />
            <p className="text-center text-neutral-300 mb-4 font-noto">
              <span className="text-base font-semibold">角田悠綺</span><br />
              <span className="text-sm leading-snug">制作部</span><br />
              <span className="text-sm leading-snug whitespace-nowrap">（WEBエンジニア）</span>
            </p>
            <div className="flex items-center justify-center ">
              <a
                href="https://x.com/tunotuno_films"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5 align-middle" />
              </a>
              <a
                href="https://www.instagram.com/tunotuno_films/" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 align-middle" />
              </a>
            </div>
          </div>
          {/* 2人目 */}
          <div className="md:w-1/4 flex flex-col items-center justify-center">
            <img
              src=""
              alt="2人目アーティスト写真"
              className="rounded-full shadow-lg w-32 h-32 object-cover"
            />
            <p className="text-center text-neutral-300 mb-4 font-noto">
              <span className="text-base font-semibold">山崎詩雲</span><br />
              <span className="text-sm leading-snug">制作部、撮影部兼任</span><br />
              <span className="text-sm leading-snug whitespace-nowrap">（映像ディレクター）</span>
            </p>

            <div className="flex items-center justify-center ">
              <a
                href="https://www.youtube.com/@ShionYamazaki" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faYoutube} className="w-5 h-5 align-middle" />
              </a>
              <a
                href="https://www.instagram.com/shion._yamazaki/" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 align-middle" />
              </a>
            </div>
          </div>
          {/* 3人目 */}
          <div className="md:w-1/4 flex flex-col items-center justify-center">
            <img
              src=""
              alt="3人目アーティスト写真"
              className="rounded-full shadow-lg w-32 h-32 object-cover"
            />
            <p className="text-center text-neutral-300 mb-4 font-noto">
              <span className="text-base font-semibold">  Lily -リリィー-</span><br />
              <span className="text-sm leading-snug">制作部、衣装部兼任</span><br />
              <span className="text-sm leading-snug whitespace-nowrap">（映像クリエイター・衣装コーディネイター）</span>
            </p>
            <div className="flex items-center justify-center ">
              <a
                href="https://www.threads.com/@lily___films?xmt=AQF0j4hzts8DK9BCbehs9DGz34qn0251sGVgeFBm8BUBvwc" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faThreads} className="w-5 h-5 align-middle" />
              </a>
              <a
                href="https://www.instagram.com/lily___films/" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 align-middle" />
              </a>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default Message;