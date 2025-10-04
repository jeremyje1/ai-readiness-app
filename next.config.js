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
  // Force webpack to generate new chunk hashes by adding unique module ID
  webpack: (config, { buildId }) => {
    config.optimization.moduleIds = 'deterministic';
    config.optimization.chunkIds = 'deterministic';
    
    // Add a plugin to inject build timestamp into every chunk
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.compilation.tap('CacheBustPlugin', (compilation) => {
          compilation.hooks.afterOptimizeChunkAssets.tap('CacheBustPlugin', () => {
            // This forces webpack to see changed content
            const buildTimestamp = `/* BUILD_${Date.now()} */`;
            compilation.chunks.forEach((chunk) => {
              chunk.files.forEach((file) => {
                if (file.endsWith('.js')) {
                  const asset = compilation.assets[file];
                  const source = asset.source();
                  compilation.assets[file] = {
                    source: () => buildTimestamp + source,
                    size: () => buildTimestamp.length + source.length
                  };
                }
              });
            });
          });
        });
      }
    });
    
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
