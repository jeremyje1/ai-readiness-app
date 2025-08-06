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
        source: '/ai-readiness',
        destination: '/highered-implementation',
        permanent: false,
      },
      {
        source: '/',
        destination: '/highered-implementation',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
