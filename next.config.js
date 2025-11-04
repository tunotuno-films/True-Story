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
              "frame-ancestors 'self' https://www.youtube.com https://youtube.com; img-src 'self' data: https://npxqbgysjxykcykaiutm.supabase.co https://www.google.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://t.co https://analytics.twitter.com https://via.placeholder.com https://i.ytimg.com; connect-src 'self' https://www.youtube.com https://npxqbgysjxykcykaiutm.supabase.co;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
