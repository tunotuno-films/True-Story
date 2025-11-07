import { createHash } from 'crypto';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://npxqbgysjxykcykaiutm.supabase.co https://www.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://t.co https://analytics.twitter.com https://placehold.co https://i.ytimg.com; frame-src 'self' https://www.youtube.com https://youtube.com; connect-src 'self' https://www.youtube.com https://npxqbgysjxykcykaiutm.supabase.co;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
