import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Test endpoint that mimics the exact auth flow of payments/status
// GET /api/debug/auth-test?debug=1

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debugParam = url.searchParams.get('debug') === '1';
  
  // Exact same auth logic as payments/status
  let { data: { session }, error: sessionError } = await supabase.auth.getSession();
  let accessToken: string | null = null;
  
  const qpToken = url.searchParams.get('token') || url.searchParams.get('access_token');
  if (qpToken) {
    accessToken = qpToken;
  }

  if (!session) {
    const rawCookies = request.headers.get('cookie') || '';
    if (rawCookies) {
      for (const part of rawCookies.split(/;\s*/)) {
        const [k, v] = part.split('=');
        if (k === 'sb-access-token' && v) {
          accessToken = decodeURIComponent(v);
          break;
        }
      }
    }
  }

  if (!session) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!accessToken && authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7).trim();
    }
    if (!accessToken) {
      accessToken = request.headers.get('x-supabase-access-token');
    }
    
    if (accessToken) {
      if (accessToken.length > 800) {
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession({ refresh_token: accessToken });
        if (!refreshErr && refreshed?.session?.access_token) {
          accessToken = refreshed.session.access_token;
        }
      }
      
      const { data: userResult, error: userErr } = await supabase.auth.getUser(accessToken);
      if (userErr) {
        return NextResponse.json({ 
          phase: 'auth-error-get-user',
          error: userErr.message,
          accessTokenLength: accessToken.length,
          accessTokenPreview: accessToken.slice(0, 12) + '...' + accessToken.slice(-8)
        });
      }
      
      if (userResult?.user) {
        session = { 
          user: userResult.user, 
          access_token: accessToken, 
          token_type: 'bearer', 
          expires_in: 0, 
          expires_at: 0, 
          refresh_token: '' 
        } as any;
      }
    }
  }

  if (!session?.user) {
    return NextResponse.json({
      phase: 'auth-missing',
      hasAuthHeader: Boolean(request.headers.get('authorization')),
      hasCookie: Boolean(request.headers.get('cookie')),
      hasTokenParam: Boolean(qpToken)
    });
  }

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase() || null;
  
  // Same client selection logic
  let authedClient: any = null;
  if (accessToken && !supabaseAdmin) {
    try {
      authedClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });
    } catch (e: any) {
      return NextResponse.json({ error: 'authed client creation failed', message: e.message });
    }
  }
  
  const queryClient = accessToken && (supabaseAdmin || authedClient) ? (supabaseAdmin || authedClient) : supabase;
  const clientType = supabaseAdmin ? 'service-role' : authedClient ? 'authed-access-token' : 'anon';
  
  // Test the exact same query
  const excludeTest = process.env.EXCLUDE_TEST_PAYMENTS === 'true';
  const baseUserQuery = queryClient
    .from('user_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('access_granted', true);
  if (excludeTest) baseUserQuery.eq('is_test', false);
  
  const { data: byUser, error: byUserErr } = await baseUserQuery
    .order('created_at', { ascending: false })
    .limit(1);

  return NextResponse.json({
    phase: 'success',
    userId,
    userEmail,
    clientType,
    hasSupabaseAdmin: Boolean(supabaseAdmin),
    excludeTest,
    byUserCount: byUser?.length || 0,
    byUserError: byUserErr?.message,
    foundRow: byUser?.[0] ? {
      id: byUser[0].id,
      user_id: byUser[0].user_id,
      email: byUser[0].email,
      tier: byUser[0].tier,
      access_granted: byUser[0].access_granted,
      is_test: byUser[0].is_test
    } : null
  });
}
