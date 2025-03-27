/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: [

    ]
  },
  async headers() {
    return [
      {
        // ใช้กับทุก route
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [

            ].join('; ')
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;