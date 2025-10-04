/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Temporarily disabled optimizeCss due to critters dependency issue
    // optimizeCss: true,
  },
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
  },
  // Generate unique build IDs to prevent cache issues
  generateBuildId: async () => {
    // Use git commit SHA or timestamp to ensure unique builds
    return process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`;
  },
  // Force webpack to generate new chunk hashes
  webpack: (config, { buildId }) => {
    // Add build ID to output filename to force new chunks
    config.output.filename = config.output.filename.replace('[name]', `[name]-${buildId}`);
    config.output.chunkFilename = config.output.chunkFilename.replace('[name]', `[name]-${buildId}`);
    return config;
  },
  // Disable static page optimization for get-started to force fresh rendering
  async headers() {
    return [
      {
        source: '/get-started',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
  // Removed automatic redirect to /ai-readiness - unified domain should handle its own routing
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
