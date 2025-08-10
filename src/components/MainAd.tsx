import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SponsorAd {
  ad_url_1?: string;
  ad_url_2?: string;
  ad_link_1?: string;
  ad_link_2?: string;
}

// Vimeo埋め込みURL生成
const getVimeoEmbedUrl = (input?: string) => {
  if (!input) return '';
  // iframeタグからsrc属性を抽出
  const srcMatch = input.match(/src="([^"]+)"/);
  if (srcMatch) return srcMatch[1];
  // 直接URLの場合
  const urlMatch = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return urlMatch
    ? `https://player.vimeo.com/video/${urlMatch[1]}?autoplay=1&loop=1&muted=1&background=1`
    : '';
};

// 画像かどうか判定
const isImageUrl = (url?: string) => {
  if (!url) return false;
  // 拡張: SupabaseストレージURLも画像として判定
  return (
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
    url.startsWith('data:image') ||
    url.includes('/storage/v1/object/')
  );
};

const MainAd: React.FC = () => {
  const [adUrls, setAdUrls] = useState<SponsorAd>({});

  useEffect(() => {
    const fetchAdUrls = async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('ad_url_1, ad_url_2, ad_link_1, ad_link_2')
        .eq('type', 'main')
        .single();
      if (!error && data) {
        setAdUrls(data as SponsorAd);
      }
    };
    fetchAdUrls();
  }, []);

  const adData = [
    { url: adUrls.ad_url_1, link: adUrls.ad_link_1 },
    { url: adUrls.ad_url_2, link: adUrls.ad_link_2 }
  ];

  return (
    <section id="main-ad" className="py-12 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-0 justify-center items-center">
        {adData.map((ad, idx) =>
          ad.url ? (
            <div
              key={idx}
              className="w-full flex justify-center items-center"
              style={{ minWidth: 0 }}
            >
              <div className="w-full">
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                  <a
                    href={ad.link || ad.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {isImageUrl(ad.url) ? (
                      <img
                        src={ad.url}
                        alt={`main-ad-img-${idx}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <iframe
                        src={getVimeoEmbedUrl(ad.url)}
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        frameBorder={0}
                        className="w-full h-full"
                        title={`main-ad-${idx}`}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </a>
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>
    </section>
  );
};

export default MainAd;
