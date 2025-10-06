# Blueprint Query Simplification Fix - October 6, 2025

## Issue
- `/api/blueprint?limit=50` returning 500 errors
- `/api/blueprint/[id]` returning 404 errors
- Complex nested joins causing query failures

## Root Cause
The Supabase queries were using complex nested joins that were failing when related records didn't exist or had permission issues.

## Changes Made

### 1. `/app/api/blueprint/route.ts`
- Simplified the SELECT query to fetch only direct fields
- Removed nested joins for:
  - `blueprint_goals`
  - `assessments`
  - `organizations`
  - `blueprint_progress`
- Now returns just the blueprint IDs (goals_id, assessment_id, organization_id)

### 2. `/app/api/blueprint/[id]/route.ts`
- Simplified initial blueprint fetch to avoid join failures
- Added separate queries to fetch related data:
  - Goals fetched separately if goals_id exists
  - Assessment fetched separately if assessment_id exists
  - Organization fetched separately if organization_id exists
- Each related fetch is optional and won't fail if missing

## Benefits
- Eliminates 500 errors from failed joins
- More reliable blueprint listing
- Graceful handling of missing related data
- Better error isolation

## Testing
After deployment:
1. Navigate to /dashboard/personalized
2. Click on "AI Implementation Blueprints" section
3. Verify blueprints list loads without 500 errors
4. Click on individual blueprints
5. Verify blueprint details load without 404 errors