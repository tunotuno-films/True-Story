import React from 'react';

const News: React.FC = () => {
  const newsItems = [
    {
      date: '2025.08.10',
      content: 'MV制作プロジェクト「True Story」クラウドファンディング開始！'
    },
    {
      date: '2025.08.05',
      content: '公式サイト、コンセプトムービーを公開しました。'
    },
    {
      date: '2025.08.01',
      content: '新曲「True Story」配信リリース決定。'
    }
  ];

  return (
    <section id="news" className="py-20 md:py-32 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">NEWS</h2>
        <p className="font-noto text-lg text-center mb-12">お知らせ</p>
        <div className="max-w-3xl mx-auto border-t border-neutral-700">
          {newsItems.map((item, index) => (
            <div key={index} className="border-b border-neutral-700 py-6 flex items-center">
              <p className="text-neutral-400 mr-6 w-24 flex-shrink-0">{item.date}</p>
              <p className="font-noto flex-1">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;