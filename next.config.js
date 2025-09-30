/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Temporarily disabled optimizeCss due to critters dependency issue
    // optimizeCss: true,
  },
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
  },
  // Removed automatic redirect to /ai-readiness - unified domain should handle its own routing
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
