# Demo Loop Issue - Root Cause & Fix Plan

## 🔴 Current Problems

### 1. **Incorrect Supabase SSR Implementation in `/api/demo/login`**
- ❌ Using `createClient` from `@supabase/supabase-js` (wrong!)
- ❌ Manually setting auth cookies (`sb-access-token`, `sb-refresh-token`)
- ✅ Should use `createServerClient` from `@supabase/ssr` with cookie handlers

### 2. **Session State Inconsistency**
The loop pattern in logs shows:
```
/get-started (redirect) → /demo → /api/demo/login → /dashboard/personalized → [LOOP]
```

This happens because:
- Manual cookie setting breaks Supabase SSR auth flow
- Server-side `getSession()` doesn't see the manually-set cookies properly
- Dashboard redirects back when no valid session detected

### 3. **Missing Database Setup**
According to the guide, we need to ensure:
- Demo organization exists in `organizations` table
- Demo user profile exists in `user_profiles` or `users` table  
- Proper RLS policies allow demo user access
- Demo user has `onboarding_completed = true` to skip onboarding

## ✅ Solution Plan

### Step 1: Fix `/api/demo/login/route.ts`
**Change from:** `@supabase/supabase-js` client
**Change to:** `@supabase/ssr` with proper cookie handling

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  
  // ✅ CORRECT: Use SSR client for cookie management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role to bypass RLS
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          cookieStore.set({ name, value, ...options })
        },
        remove: (name, options) => {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )

  // Sign in with demo credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD
  })

  // Supabase SSR handles auth cookies automatically ✅
  // Just set demo-specific cookies
  const response = NextResponse.json({ 
    success: true,
    redirectUrl: '/dashboard/personalized?demo=true&tour=start'
  })

  response.cookies.set('demo-mode', 'true', {
    httpOnly: false,
    maxAge: 30 * 60,
    path: '/',
    sameSite: 'lax'
  })

  return response
}
```

### Step 2: Ensure Demo User Database Setup
Need to verify in Supabase:

1. **Demo user exists** with email `demo@educationaiblueprint.com`
2. **Demo organization exists** 
3. **User profile exists** with:
   - `onboarding_completed = true`
   - `role = 'admin'` or appropriate role
   - Linked to demo organization

### Step 3: Verify RLS Policies
Check that demo user can:
- Read from all necessary tables
- Write to assessment/response tables (if needed for demo)
- Access organization data

### Step 4: Remove `/get-started` Redirect (Optional)
Either:
- **Option A:** Keep it as simple client-side redirect to `/demo`
- **Option B:** Remove it entirely and update marketing links to point directly to `/demo`
- **Option C:** Make it a landing page with "Try Demo" button

### Step 5: Add Server-Side Protection to Dashboard
In `/dashboard/personalized/page.tsx`, ensure proper redirect:

```typescript
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // No loop - just redirect to demo or login
    redirect('/demo')
  }

  // Continue with dashboard rendering...
}
```

## 🧪 Testing Checklist

After implementing fixes:

- [ ] Visit `/demo` - should auto-login and redirect to dashboard
- [ ] Dashboard should load without loops
- [ ] DemoBanner should show 30-minute countdown
- [ ] Can interact with platform features
- [ ] After 30 minutes, session expires properly
- [ ] "Create Real Account" CTA works
- [ ] No "🔐 No session" errors in console

## 📝 Key Takeaways

1. **Never manually set Supabase auth cookies** - let SSR client handle it
2. **Always use `createServerClient` from `@supabase/ssr`** in API routes
3. **Demo user MUST exist in database** with proper profile/org setup
4. **Keep redirect logic simple** - avoid server-side redirects that check sessions in intermediate pages
