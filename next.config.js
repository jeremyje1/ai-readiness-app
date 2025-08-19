/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Temporarily disabled optimizeCss due to critters dependency issue
    // optimizeCss: true,
  },
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ai-readiness',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
