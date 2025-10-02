/**
 * Supabase Client for Browser/Client Components
 */

import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL || '',
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  return client;
}
