import React from 'react';

const Message: React.FC = () => {
  return (
    <section id="message" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">MESSAGE</h2>
        <p className="font-noto text-lg text-center mb-12">アーティストからのメッセージ</p>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="md:w-1/3">
            <img
              src="https://npxqbgysjxykcykaiutm.supabase.co/storage/v1/object/sign/img/logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xOGQ3YjhmZS03YWM0LTQyYWQtOGQyNS03YzU3Y2NjNjExNzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvbG9nby5qcGVnIiwiaWF0IjoxNzU0MTM5OTMxLCJleHAiOjIwMzc5NjM5MzF9.K2LSo8QRE3kiuLkf5ct0Y0s0YTSrJlmPcEDjPJYHzFU"
              alt="アーティスト写真"
              className="rounded-full shadow-lg w-full max-w-sm mx-auto"
            />
          </div>
          <div className="md:w-2/3">
            <p className="font-noto text-base leading-loose text-neutral-300 mb-6">
              この曲が生まれたきっかけは、ファンの方からいただいた一通の手紙でした。そこには、これまで誰にも話せなかったという、切なくも美しい実話が綴られていました。読んだ瞬間、心が震え、気づけばメロディを口ずさんでいました。
            </p>
            <p className="font-noto text-base leading-loose text-neutral-300 mb-6">
              この物語は、手紙をくれたその人だけのものではない。きっと多くの人が共感できる、普遍的な何かがあるはずだと感じています。
            </p>
            <p className="font-noto text-base leading-loose text-neutral-300">
              だからこそ、このミュージックビデオは、僕たち制作者だけでなく、聴いてくれる皆さんと一緒に作り上げたい。あなたの力を貸してください。一緒に、忘れられない作品を作りましょう。
            </p>
            <p className="font-noto text-right mt-6 font-bold text-lg">Artist Name</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Message;