# Vercel Build Fix Guide

## Issue: Build failing with cached import error

The build is failing with:
```
Type error: Module '"@/lib/document-analysis"' has no exported member 'extractTextFromFile'.
```

## Root Cause
This appears to be a Vercel build cache issue. The import was already fixed in the code but Vercel is using a cached version of the dependency graph.

## Solution

### Option 1: Force Clean Build (Recommended)
1. Go to Vercel Dashboard
2. Go to Project Settings → Functions
3. Clear Build Cache
4. Redeploy

### Option 2: Environment Variable Trick
1. Add a dummy environment variable in Vercel:
   - Name: `CACHE_BUST`
   - Value: `2025-01-03-v1`
2. This forces Vercel to invalidate caches

### Option 3: Manual Cache Clear
1. In Vercel Dashboard, go to the deployment
2. Click "Redeploy" 
3. Check "Use different branch or commit"
4. Select the same commit but it will bypass cache

## Verification
The actual code is correct:
- `/app/api/documents/analyze/route.ts` only imports `analyzeDocument`
- No references to `extractTextFromFile` exist in the codebase
- The function `extractTextFromDocument` is correctly defined in `lib/document-analysis.ts`

## Prevention
- Always clear Vercel build cache when refactoring exports/imports
- Use versioned environment variables to force cache invalidation
- Consider using Vercel's "Force New Deployment" option for critical fixes