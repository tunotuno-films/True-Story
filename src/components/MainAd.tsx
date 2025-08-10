import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SponsorAd {
  ad_url_1?: string;
  ad_url_2?: string;
  ad_link_1?: string;
  ad_link_2?: string;
}

// Generate Vimeo embed URL
const getVimeoEmbedUrl = (input?: string) => {
  if (!input) return '';
  // Extract src attribute from iframe tag
  const srcMatch = input.match(/src="([^"]+)"/);
  if (srcMatch) return srcMatch[1];
  // If direct URL, extract video ID
  const urlMatch = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return urlMatch
    ? `https://player.vimeo.com/video/${urlMatch[1]}?autoplay=1&loop=1&muted=1&background=1`
    : '';
};

// Check if the URL is an image
const isImageUrl = (url?: string) => {
  if (!url) return false;
  // Also treat Supabase storage URLs as images
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
      if (error) {
        console.error('Error fetching main ad:', error);
      } else if (data) {
        setAdUrls(data as SponsorAd);
      }
    };
    fetchAdUrls();
  }, []);

  const adData = React.useMemo(() => [
    { url: adUrls.ad_url_1, link: adUrls.ad_link_1 },
    { url: adUrls.ad_url_2, link: adUrls.ad_link_2 }
  ], [adUrls]);

  return (
    <section id="main-ad" className="py-12 bg-neutral-900">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-0 justify-center items-center">
        {adData.map((ad, idx) =>
          ad.url ? (
            <div
              key={ad.url}
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
                        alt={`Sponsor ad ${idx + 1}`}
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
                        className="w-full h-full"
                        title={`main-ad-${idx}`}
                        style={{ pointerEvents: 'none', border: 0 }}
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
