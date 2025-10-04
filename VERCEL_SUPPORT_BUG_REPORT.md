# Vercel Support Bug Report: Persistent Chunk Hashes Despite Code Changes

## Issue Summary
Next.js 14.0.4 application consistently generates identical chunk hashes (`938-77fee557f7a878ac.js`) across 15+ deployments despite significant code changes, preventing users from receiving updates.

## Environment
- Next.js: 14.0.4
- Vercel CLI: 48.2.0
- Deployment Platform: Vercel
- Project: ai-readiness-app (and ai-readiness-app-main)

## Evidence of the Issue

### 1. Identical Chunk Hashes Across All Deployments
Every deployment for the past 2 days shows:
```
chunks/938-77fee557f7a878ac.js        26.7 kB
chunks/webpack-58242171a2eefe9a.js    1.75 kB
```

### 2. Attempted Solutions That Failed

#### Cache Purge Attempts:
- ✅ Manual Vercel Dashboard cache purge (CDN + Data Cache)
- ✅ `--force` flag on deployments
- ✅ `DISABLE_BUILD_CACHE=1` environment variable
- ✅ `rm -rf .next` in installCommand
- ✅ Webpack config: `config.cache = false`
- ✅ Deleted `.vercel` directory and relinked
- ✅ Created entirely new Vercel project

#### Code Changes to Force New Chunks:
- ✅ Modified root layout.tsx multiple times
- ✅ Added significant code to lib/supabase/client.ts (40+ lines)
- ✅ Modified components/AuthNav.tsx with logging
- ✅ Created new 100+ line cache-bust module
- ✅ Updated package.json version

### 3. Build Logs Show Issue

Even with `--force` flag (skipping Vercel cache):
```
12:49:02.116 Skipping build cache, deployment was triggered without cache.
```

The chunks are STILL identical:
```
12:50:36.898   ├ chunks/938-77fee557f7a878ac.js        26.7 kB
```

### 4. New Project Same Issue
Created new Vercel project `ai-readiness-app-main`, but first deployment shows:
```
13:06:47.623 Restored build cache from previous deployment
13:08:18.815   ├ chunks/938-77fee557f7a878ac.js        26.7 kB
```

## Root Cause Analysis

This appears to be a Next.js 14.0.4 bug where:
1. Chunk hashing is overly deterministic
2. Content-based hashing isn't detecting significant code changes
3. The webpack chunking algorithm may be cached at a deeper level

## Impact
- Users receive stale JavaScript bundles
- Bug fixes don't reach production
- Authentication fixes remain cached
- Complete deployment pipeline is broken

## Requested Action
1. Investigate why Next.js 14.0.4 generates identical chunk hashes despite code changes
2. Provide method to force chunk regeneration
3. Fix the underlying deterministic hashing issue

## Reproduction Steps
1. Deploy Next.js 14.0.4 app to Vercel
2. Make significant code changes to any imported module
3. Deploy again (even with --force)
4. Observe identical chunk hashes in build output

## Workarounds Attempted
- Changed webpack config
- Added cache busting code
- Modified critical components
- Created new Vercel project
- All failed to generate new chunk hashes

Please advise on immediate solutions as this is blocking all production updates.