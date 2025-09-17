import React from 'react';
import { Helmet } from 'react-helmet-async';

// 環境変数から既定のOG画像を取得
const DEFAULT_OG_IMAGE = import.meta.env.VITE_OG_IMAGE_URL || '';

type SeoProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  image?: string; // ページ単位で上書き可能
};

const Seo: React.FC<SeoProps> = ({ title, description, keywords, url, image }) => {
  const ogImage = image || DEFAULT_OG_IMAGE;
  const siteName = 'True Story【実話の物語】';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords?.join(', ')} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title || 'True Story'} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title || 'True Story'} />
    </Helmet>
  );
};

export default Seo;
