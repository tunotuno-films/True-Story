import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

interface GoldSponsor {
  id: number;
  name: string;
  ad_url_1?: string;
  website_url?: string;
}

const GoldAd: React.FC = () => {
  const [sponsors, setSponsors] = useState<GoldSponsor[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGoldSponsors = async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('id, name, ad_url_1, website_url')
        .eq('type', 'gold')
        .order('id', { ascending: true });
      if (error) {
        console.error('Error fetching gold sponsors:', error);
      } else if (data) {
        setSponsors((data as GoldSponsor[]).slice(0, 5));
      }
    };
    fetchGoldSponsors();
  }, []);

  // ループ用に配列を5倍に増やす
  const loopSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    <section id="gold-ad" className="py-8 bg-neutral-900">
      <div className="w-full">
        {/* PC/スマホ共通: 横スクロール */}
        <div className="overflow-x-auto scrollbar-hide w-full" style={{ WebkitOverflowScrolling: 'touch', marginLeft: 0, marginRight: 0 }}>
          <div
            ref={scrollRef}
            className="flex items-center gap-8 animate-gold-scroll"
            style={{
              minWidth: 'min-content',
              width: 'max-content',
              animation: sponsors.length > 1 ? 'gold-scroll 20s linear infinite' : undefined,
            }}
          >
            {loopSponsors.map((sponsor, idx) => (
              <a
                key={`${sponsor.id}-${idx}`}
                href={sponsor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                style={{ flex: '0 0 auto' }}
              >
                {sponsor.ad_url_1 && (
                  <img
                    src={sponsor.ad_url_1}
                    alt={sponsor.name}
                    className="h-48 w-auto object-contain"
                    style={{ maxHeight: '192px', maxWidth: '480px' }}
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes gold-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-20%); }
          }
          .animate-gold-scroll {
            /* ...existing code... */
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <style>
        {`
          /* ゆっくりスクロール: 40秒 */
          .animate-gold-scroll {
            animation-duration: 40s !important;
          }
        `}
      </style>
    </section>
  );
};

export default GoldAd;
