import { createBrowserClient } from '@supabase/ssr';

// CACHE BUST: Force new chunk generation - October 4, 2025 12:57 PM
// This is a critical fix to break Vercel's persistent cache issue
// Build ID: ${Date.now()} - ${Math.random()}
const CACHE_BUST_VERSION = 'v4-force-new-chunks-1759600700';
const BUILD_MARKER = `BUILD_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Log cache bust info in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log(`[CACHE BUST] Supabase Client Init: ${CACHE_BUST_VERSION} - ${BUILD_MARKER}`);
}

export function createClient() {
  // Force unique instance marker
  const instanceId = `${CACHE_BUST_VERSION}_${Date.now()}`;

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Add cache bust to auth storage key
        storage: {
          getItem: (key: string) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          },
        },
        storageKey: `sb-auth-token-${instanceId}`,
      }
    }
  );

  // Attach build marker to client instance for verification
  (client as any).__BUILD_MARKER__ = BUILD_MARKER;

  return client;
}
