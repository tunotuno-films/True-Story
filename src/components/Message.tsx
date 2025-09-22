import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Message: React.FC = () => {
  return (
    <section id="message" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">MESSAGE</h2>
        <p className="font-noto text-lg text-center mb-12">代表のメッセージ</p>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16">
          {/* 1人目 */}
          <div className="md:w-1/3">
            <img
              src="https://npxqbgysjxykcykaiutm.supabase.co/storage/v1/object/sign/img/00_hiroki%20ando.JPEG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xOGQ3YjhmZS03YWM0LTQyYWQtOGQyNS03YzU3Y2NjNjExNzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvMDBfaGlyb2tpIGFuZG8uSlBFRyIsImlhdCI6MTc1NDI4NjI1MCwiZXhwIjo0ODc2MzUwMjUwfQ.pXSJY60xvZ3dxQxFWt1VHHT5SaKfGS7-rTS12JlCj1c"
              alt="アーティスト写真"
              className="rounded-full shadow-lg w-64 md:w-full mx-auto aspect-square object-cover"
            />
          </div>
          <div className="md:w-2/3">
            <p className="font-noto text-base leading-loose text-neutral-300 mb-6">
              2022年のTrue Story【実話の物語】がスタートした当時、私はまだ大学生でした。映像制作が好きという気持ちだけで始めたこのプロジェクトは、多くの方に支えられて今に至ります。
            </p>
            <p className="font-noto text-base leading-loose text-neutral-300 mb-6">
              このTrue Story【実話の物語】は、その名の通り、実際にあった実話を基に制作します。決して同じストーリーは出てきません。
            </p>
            <p className="font-noto text-base leading-loose text-neutral-300">
              だからこそ、我々制作関係者だけではなく、音楽を聴いてくれる皆さんと、映像を観てくれる皆さんと一緒にストーリーを創りたいと思っています！
            </p>
            <div className="flex items-center justify-end mt-6">
              <a
                href="https://www.instagram.com/hiropon_films/" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 align-middle" />
              </a>
              <a
                href="https://www.youtube.com/@HIROPONFilms" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faYoutube} className="w-5 h-5 align-middle" />
              </a>
              <p className="font-noto font-bold text-lg leading-none">Hiroki Ando</p>
            </div>
          </div>
        </div>
        {/* 2人目 */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
          <div className="md:w-1/3">
            <img
              src="https://npxqbgysjxykcykaiutm.supabase.co/storage/v1/object/sign/img/shoma.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xOGQ3YjhmZS03YWM0LTQyYWQtOGQyNS03YzU3Y2NjNjExNzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvc2hvbWEuanBnIiwiaWF0IjoxNzU1OTY3ODQ5LCJleHAiOjQ4NzgwMzE4NDl9.xs2gvkKeEU7hEU4Rh-qKyTrLHIUc7Dkq4d8yfW6dX4s"
              alt="2人目アーティスト写真"
              className="rounded-full shadow-lg w-64 md:w-full mx-auto aspect-square object-cover"
            />
          </div>
          <div className="md:w-2/3">
            <p className="font-noto text-base leading-loose text-neutral-300 mb-6">
              日常で感じる喜び、悲しみ、憎しみ、怒り。
              <br />
              そんな気持ちを音に想いを込めて、物語とともにお届けしたいと思います。
              <br />
              皆さまの心に少しでも響いてもらえたら幸いです。
              <br />
              応援よろしくお願いいたします。
            </p>
            <div className="flex items-center justify-end mt-6">
              <a
                href="https://www.instagram.com/sho_m.pf/" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 align-middle" />
              </a>
              <a
                href="https://www.youtube.com/@ShomaPiano" // Placeholder link
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white hover:text-neutral-400 transition-colors mr-3"
              >
                <FontAwesomeIcon icon={faYoutube} className="w-5 h-5 align-middle" />
              </a>
              <p className="font-noto font-bold text-lg leading-none">翔馬-Shoma</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Message;