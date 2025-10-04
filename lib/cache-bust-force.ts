// FORCE CACHE BUST - This file exists solely to break chunk generation
// Generated: October 4, 2025 1:08 PM
// Build ID: ${process.env.VERCEL_GIT_COMMIT_SHA || 'local'}

export const FORCE_CACHE_BUST = {
    version: 'v5-nuclear-option',
    timestamp: Date.now(),
    random: Math.random(),
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || `local-${Date.now()}`,
    deployment: process.env.VERCEL_URL || 'local',

    // Add a massive object to force chunk size changes
    data: Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}-${Date.now()}-${Math.random()}`,
        value: `This is cache bust item ${i} generated at ${new Date().toISOString()}`,
        hash: Math.random().toString(36).substring(2, 15),
        nested: {
            level1: {
                level2: {
                    level3: `Deep nested value ${i}`,
                    timestamp: Date.now() + i,
                    random: Math.random()
                }
            }
        }
    })),

    // Add functions that will be included in the bundle
    getBuildInfo: () => ({
        version: FORCE_CACHE_BUST.version,
        timestamp: FORCE_CACHE_BUST.timestamp,
        env: process.env.NODE_ENV
    }),

    verifyNewBuild: () => {
        console.log('🚀 CACHE BUST VERIFICATION:', {
            version: FORCE_CACHE_BUST.version,
            timestamp: new Date(FORCE_CACHE_BUST.timestamp).toISOString(),
            buildId: FORCE_CACHE_BUST.buildId
        });
    }
};

// Export a function that must be called from components
export function initializeCacheBust() {
    if (typeof window !== 'undefined') {
        (window as any).__CACHE_BUST__ = FORCE_CACHE_BUST;
        console.log('✅ Cache bust initialized:', FORCE_CACHE_BUST.version);
    }
}

// Add a large comment block to increase file size
/*
 * CACHE BUST DOCUMENTATION
 * =======================
 * This file is a nuclear option to force Next.js to generate new chunk hashes.
 * It adds significant content that MUST change the chunk generation algorithm.
 * 
 * The problem we're solving:
 * - Next.js 14.0.4 appears to have deterministic chunk generation
 * - Even with significant code changes, chunks maintain the same hash
 * - This prevents users from getting updated code
 * 
 * This file adds:
 * 1. Large data structures
 * 2. Random values generated at build time
 * 3. Functions that will be included in bundles
 * 4. Significant file size to affect chunk splitting
 * 
 * Generated at: ${new Date().toISOString()}
 * Build: ${Date.now()}
 */