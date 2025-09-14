import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Sponsor {
  id: number;
  name: string;
  logo_url: string;
  website_url?: string;
  type: 'main' | 'gold' | 'silver' | 'supporter';
  description?: string;
}

const sponsorGroups = [
  { title: 'メインスポンサー', type: 'main', size: 'lg' },
  { title: 'ゴールドスポンサー', type: 'gold', size: 'md' },
  { title: 'シルバースポンサー', type: 'silver', size: 'sm' },
  { title: 'サポータースポンサー', type: 'supporter', size: 'sm' },
] as const;

const sizeClasses = {
  lg: {
    grid: 'grid-cols-1',
    card: 'max-w-md mx-auto',
    logoContainer: 'h-56',
    logo: 'max-h-40',
    name: 'text-base',
  },
  md: {
    grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    card: '',
    logoContainer: 'h-36',
    logo: 'max-h-24',
    name: 'text-sm',
  },
  sm: {
    grid: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
    card: '',
    logoContainer: 'h-20',
    logo: 'max-h-12',
    name: 'text-xs',
  },
};

// 各スポンサータイプ専用カード
const MainSponsorCard: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => (
  <div className="flex flex-col md:flex-row items-center gap-8">
    <div className="flex-shrink-0 w-64 h-auto">
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className="w-full h-auto object-contain"
        />
      </a>
    </div>
    <div className="text-center md:text-left w-full max-w-64 mx-auto md:max-w-none md:mx-0">
      <h4 className="text-xl font-bold mb-2">{sponsor.name}</h4>
      {sponsor.description && (
        <p className="text-neutral-300 text-sm leading-relaxed">{sponsor.description}</p>
      )}
    </div>
  </div>
);

const GoldSponsorCard: React.FC<{ sponsor: Sponsor; styles: typeof sizeClasses['md'] }> = ({ sponsor, styles }) => (
  <div className={`block text-center ${styles.card}`}>
    <div className={`flex items-center justify-center ${styles.logoContainer} mb-1`}>
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={sponsor.logo_url}
          alt={sponsor.name}
          className={`w-auto object-contain ${styles.logo}`}
        />
      </a>
    </div>
    <p className={`font-noto ${styles.name} text-neutral-300`}>{sponsor.name}</p>
  </div>
);

const SilverSponsorCard: React.FC<{ sponsor: Sponsor; styles: typeof sizeClasses['sm'] }> = ({ sponsor, styles }) => (
  <a
    href={sponsor.website_url}
    target="_blank"
    rel="noopener noreferrer"
    className={`block text-center ${styles.card}`}
  >
    <div className={`flex items-center justify-center ${styles.logoContainer}`}>
      <img
        src={sponsor.logo_url}
        alt={sponsor.name}
        className={`w-auto object-contain ${styles.logo}`}
      />
    </div>
    {/* シルバーは名前表示なし */}
  </a>
);

const SupporterSponsorCard: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => (
  <a
    href={sponsor.website_url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-neutral-300 hover:text-white text-sm"
  >
    {sponsor.name}
  </a>
);

const Sponsor: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('type', { ascending: true })
        .order('id', { ascending: true });
      if (error) {
        console.error('Error fetching sponsors:', error);
        setError('スポンサー情報の取得に失敗しました。時間をおいて再度お試しください。');
      } else if (data) {
        setSponsors(data as Sponsor[]);
      }
      setLoading(false);
    };
    fetchSponsors();
  }, []);

  return (
    <section id="sponsors" className="py-20 md:py-32 bg-neutral-900 text-white">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
          SPONSOR
        </h2>
        <p className="font-noto text-lg text-center mb-20">ご協賛企業様</p>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="space-y-20">
            {sponsorGroups.map((group) => {
              const groupSponsors = sponsors.filter((s) => s.type === group.type);
              if (groupSponsors.length === 0) return null;
              const styles = sizeClasses[group.size];

              return (
                <div key={group.type}>
                  <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 tracking-widest">
                    {group.title.toUpperCase()}
                  </h3>
                  <div className="max-w-4xl mx-auto">
                    {group.type === 'main' ? (
                      <div className="space-y-6">
                        {groupSponsors.map((sponsor) => (
                          // 枠を無くし、背景をセクションと同色に合わせる
                          <div key={sponsor.id} className="bg-neutral-900 p-6 rounded-lg">
                            <MainSponsorCard sponsor={sponsor} />
                          </div>
                        ))}
                      </div>
                    ) : group.type === 'supporter' ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3 text-center max-w-64 mx-auto md:max-w-4xl md:mx-auto">
                        {groupSponsors.map((sponsor) => (
                          <div key={sponsor.id} className="bg-neutral-900 p-3 rounded-md">
                            <SupporterSponsorCard sponsor={sponsor} />
                          </div>
                        ))}
                      </div>
                    ) : group.type === 'gold' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-64 mx-auto md:max-w-4xl md:mx-auto">
                        {groupSponsors.map((sponsor) => (
                          <div key={sponsor.id} className="bg-neutral-900 p-4 rounded-lg">
                            <GoldSponsorCard sponsor={sponsor} styles={styles} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`grid ${styles.grid} gap-4 max-w-64 mx-auto md:max-w-4xl md:mx-auto`}>
                        {groupSponsors.map((sponsor) => (
                          <div key={sponsor.id} className="bg-neutral-900 p-3 rounded-md flex items-center justify-center">
                            <SilverSponsorCard sponsor={sponsor} styles={styles} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Sponsor;
