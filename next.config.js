// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dnjiduwaxzuclgaiyidq.supabase.co'],
  },
  reactStrictMode: true,
  eslint: {
    plugins: ["@typescript-eslint"],
  },
};

module.exports = nextConfig;
