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
        destination: '/ai-readiness/start',
        permanent: false,
      },
      {
        source: '/',
        destination: '/ai-readiness/start',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
