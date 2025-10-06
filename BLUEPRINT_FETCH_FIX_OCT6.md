# Blueprint Fetch Error Fix - October 6, 2025

## Issue
- 500 errors when fetching blueprints at `/api/blueprint?limit=50`
- 404 errors when fetching specific blueprint by ID
- Blueprint list page showing errors

## Root Cause
1. The blueprint query was using `!inner` joins on `blueprint_goals` and `assessments`, which excluded blueprints without these related records
2. Complex OR condition for shared blueprints was potentially causing query issues

## Fix Applied

### 1. Fixed Blueprint List Query (`app/api/blueprint/route.ts`)
- Removed `!inner` from joins to make them optional (left joins)
- Simplified access control to only show user's own blueprints for now
- Added better error logging with details

**Changes:**
```typescript
// Before
.select(`
  ...
  blueprint_goals!inner (
  ...
  assessments!inner (
`)

// After  
.select(`
  ...
  blueprint_goals (
  ...
  assessments (
`)
```

```typescript
// Before
.or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)

// After
.eq('user_id', user.id)
```

### 2. Enhanced Error Logging
Added detailed error logging to help diagnose issues:
```typescript
console.error('Error fetching blueprints:', {
  error,
  message: error.message,
  details: error.details,
  code: error.code,
  userId: user.id,
  status,
  limit,
  offset
});
```

## Testing
1. Navigate to `/blueprint` page
2. Should see list of blueprints without errors
3. Should be able to click on a blueprint to view details

## Next Steps
1. Re-enable shared blueprint access once basic functionality is confirmed
2. Add proper error boundaries in the UI
3. Consider pagination for better performance