# Vercel Build Cache Issue - October 4, 2025

## Problem
Vercel is persistently restoring build cache despite:
- `rm -rf .next` in installCommand
- `DISABLE_BUILD_CACHE: "1"` environment variable
- Multiple deployment attempts

## Evidence
Same chunk hashes across 8+ deployments:
- `chunks/938-77fee557f7a878ac.js` - unchanged
- `chunks/webpack-58242171a2eefe9a.js` - unchanged

Build logs show:
```
Restored build cache from previous deployment (2h5TqSNrkV7FVpvpi3CG3LEZW3kH)
```

## Root Cause
Vercel's build cache restoration happens BEFORE the installCommand runs,
so `rm -rf .next` cannot delete the restored cache.

## Solution Required
**Manual cache purge in Vercel Dashboard:**
1. Go to: https://vercel.com/jeremyje1/ai-readiness-app/settings/data-cache
2. Click "Clear Build Cache"
3. Re-deploy

OR use Vercel CLI:
```bash
vercel env pull
vercel build --force
```

## Workaround Applied
Modified app/layout.tsx with unique code to force new chunks.
This should work if manual cache clear is performed.

## Files Modified
- vercel.json: Added DISABLE_BUILD_CACHE env var
- next.config.js: Removed broken webpack config
- app/layout.tsx: Added cache bust marker
