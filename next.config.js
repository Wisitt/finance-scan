/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // สำหรับรูปโปรไฟล์จาก Google
  },
  async headers() {
    return [
      {
        // ใช้กับทุก route
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https://lh3.googleusercontent.com;
              connect-src 'self' https://accounts.google.com https://*.supabase.co https://storage.googleapis.com;
              frame-src 'self' https://accounts.google.com;
              worker-src 'self' blob:;
              font-src 'self';
              media-src 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;