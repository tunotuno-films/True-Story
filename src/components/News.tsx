import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import NewsModal from './NewsModal';

interface NewsItem {
  id: string;
  published_date: string;
  title: string;
  content: string;
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNews = useCallback(async () => {
    const { data, error } = await supabase
      .from('news')
      .select('id, published_date, title, content')
      .order('published_date', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
    } else {
      setNews(data || []);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleNewsClick = (item: NewsItem) => {
    setSelectedNews(item);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="news" className="py-20 md:py-32 bg-neutral-900">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">NEWS</h2>
          <p className="font-noto text-lg text-center mb-12">お知らせ</p>
          <div className="max-w-3xl mx-auto border-t border-neutral-700">
            {news.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNewsClick(item)}
                className="w-full text-left border-b border-neutral-700 py-6 flex flex-col md:flex-row md:items-center hover:bg-white/5 transition-colors"
              >
                <p className="text-neutral-400 md:mr-6 md:w-24 mb-2 md:mb-0 flex-shrink-0">
                  {new Date(item.published_date).toLocaleDateString()}
                </p>
                <p className="font-noto flex-1">{item.title}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
      <NewsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newsItem={selectedNews}
      />
    </>
  );
};

export default News;