import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  keywords: string;
  imageUrl?: string;
  url: string;
}

const Seo: React.FC<SeoProps> = ({ title, description, keywords, imageUrl, url }) => {
  const siteName = 'True Story【実話の物語】';
  const fullTitle = `${title} | ${siteName}`;
  const defaultImageUrl = 'https://npxqbgysjxykcykaiutm.supabase.co/storage/v1/object/sign/img/logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xOGQ3YjhmZS03YWM0LTQyYWQtOGQyNS03YzU3Y2NjNjExNzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvbG9nby5qcGVnIiwiaWF0IjoxNzU0MTM5OTMxLCJleHAiOjIwMzc5NjM5MzF9.K2LSo8QRE3kiuLkf5ct0Y0s0YTSrJlmPcEDjPJYHzFU'; // OGP用のデフォルト画像を配置してください

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl || defaultImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl || defaultImageUrl} />
    </Helmet>
  );
};

export default Seo;
