import React from 'react';

interface Sponsor {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  type: 'top' | 'bottom';
}

// --- スポンサーデータ (実際の情報に置き換えてください) ---
const sponsorImageUrl = 'https://npxqbgysjxykcykaiutm.supabase.co/storage/v1/object/sign/img/sponsor.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xOGQ3YjhmZS03YWM0LTQyYWQtOGQyNS03YzU3Y2NjNjExNzciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvc3BvbnNvci5wbmciLCJpYXQiOjE3NTQyODM1MzgsImV4cCI6NDg3NjM0NzUzOH0.TERXqJTDjhcBKojgnCoxvfPwz-k4xFQNh0OyR7Vw9Vg';
const sponsorWebsiteUrl = 'https://luminostudio.net/';

const sponsors: Sponsor[] = [
  // Top row sponsors
  { name: 'Sponsor 1', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'top' },
  { name: 'Sponsor 2', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'top' },
  { name: 'Sponsor 3', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'top' },
  { name: 'Sponsor 4', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'top' },
  { name: 'Sponsor 5', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'top' },
  { name: 'Sponsor 6', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'top' },
  // Bottom row sponsors
  { name: 'Sponsor 7', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'bottom' },
  { name: 'Sponsor 8', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'bottom' },
  { name: 'Sponsor 9', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'bottom' },
  { name: 'Sponsor 10', logoUrl: sponsorImageUrl, websiteUrl: sponsorWebsiteUrl, type: 'bottom' },
];
// --------------------

const topSponsors = sponsors.filter(s => s.type === 'top');
const bottomSponsors = sponsors.filter(s => s.type === 'bottom');

const SponsorSection: React.FC = () => {
  return (
    <section id="sponsors" className="py-6 bg-neutral-900 border-y-2 border-neutral-800">
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          {topSponsors.map((sponsor, index) => (
            <a
              key={index}
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-16 transition-transform duration-300 hover:scale-105"
            >
              <img
                src={sponsor.logoUrl}
                alt={sponsor.name}
                className="h-full w-auto rounded-md"
              />
            </a>
          ))}
        </div>
        {/* Bottom Row */}
        {bottomSponsors.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            {bottomSponsors.map((sponsor, index) => (
              <a
                key={index}
                href={sponsor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-12 transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="h-full w-auto rounded-md"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SponsorSection;
