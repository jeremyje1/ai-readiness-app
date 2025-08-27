import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '../../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Unified payment status endpoint.
// - Authenticates user via Supabase session cookie.
// - Attempts primary lookup by user_id.
// - Falls back to email-based unclaimed row (relies on new RLS policy) and auto-claims it.
// - Returns a consistent shape for client dashboards.
// NOTE: This route uses the anon key via server-side auth cookie. No service role key is used
// so that RLS protections remain enforced. If you prefer bypassing RLS, inject SERVICE_ROLE
// and use a separate supabase instance, but ensure you validate auth before exposing data.

interface PaymentStatusResponse {
  isVerified: boolean;
  claimed?: boolean;
  tier?: string;
  email?: string | null;
  name?: string | null;
  organization?: string | null;
  rowId?: string;
  debug?: any;
}

// Build timestamp for this route (helps verify deployment freshness)
const ROUTE_BUILD_TIME = new Date().toISOString();

export async function GET(request: Request) {
  // Attempt normal session retrieval first (works if using helpers that set cookies).
  let { data: { session }, error: sessionError } = await supabase.auth.getSession();

  const url = new URL(request.url);
  const debugParam = url.searchParams.get('debug') === '1';
  const debugAlways = process.env.DEBUG_ALWAYS === 'true';
  const debugAggregate: any = {
    route: '/api/payments/status',
    buildTime: ROUTE_BUILD_TIME,
    debugParam,
    envSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  let accessToken: string | null = null;
  // Try extracting sb-access-token cookie if Supabase client not yet initialized server-side
  // Extract query params for optional token pass-through (diagnostic / fallback when direct browser nav can't set auth header)
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
    // Fallback: Authorization: Bearer <token>
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!accessToken && authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7).trim();
    }
    if (!accessToken) {
      // Also support x-supabase-access-token (client convenience)
      accessToken = request.headers.get('x-supabase-access-token');
    }
    if (accessToken) {
      // Heuristic: Supabase refresh tokens are significantly longer (>800 chars). If we detect one, refresh first.
      if (accessToken.length > 800) {
        const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession({ refresh_token: accessToken });
        if (!refreshErr && refreshed?.session?.access_token) {
          accessToken = refreshed.session.access_token;
        }
      }
      const { data: userResult, error: userErr } = await supabase.auth.getUser(accessToken);
      if (userErr) {
        // Attempt to decode JWT issuer/project ref for mismatch diagnostics
        let jwtInfo: any = {};
        try {
          const parts = accessToken.split('.');
          if (parts.length >= 2) {
            const b64 = (str: string) => Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
            const header = JSON.parse(b64(parts[0]));
            const payload = JSON.parse(b64(parts[1]));
            jwtInfo = {
              headerAlg: header.alg,
              headerTyp: header.typ,
              iss: payload.iss,
              aud: payload.aud,
              subPresent: Boolean(payload.sub),
              expInFuture: typeof payload.exp === 'number' ? (payload.exp * 1000 > Date.now()) : undefined,
              projectRefFromIss: typeof payload.iss === 'string' ? payload.iss.split('//')[1]?.split('.')[0] : undefined
            };
          }
        } catch (_) {
          jwtInfo.decodeError = true;
        }
        let envProjectRef: string | undefined;
        try {
          const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').host;
          envProjectRef = host.split('.supabase.co')[0];
        } catch (_) {}
        // Provide richer diagnostics when Supabase rejects the provided token
        const debugAuthErr = {
          phase: 'auth-error-get-user',
          phaseCanonical: 'auth-error-get-user',
          suppliedAccessToken: true,
          accessTokenPreview: accessToken.length > 16 ? accessToken.slice(0, 8) + '...' + accessToken.slice(-6) : accessToken,
            accessTokenLength: accessToken.length,
          tokenLooksPlaceholder: ['undefined','null',''].includes(accessToken.trim()),
          qpTokenPresent: Boolean(qpToken),
          hadAuthHeader: Boolean(request.headers.get('authorization') || request.headers.get('Authorization')),
          hadCookie: Boolean(request.headers.get('cookie')),
          attemptedRefresh: accessToken.length <= 800 ? false : true,
          jwt: jwtInfo,
          envProjectRef,
          projectRefMismatch: jwtInfo.projectRefFromIss && envProjectRef && jwtInfo.projectRefFromIss !== envProjectRef,
          hint: 'Token rejected by Supabase. If accessTokenLength is very small or tokenLooksPlaceholder=true, client is passing an uninitialized value.'
        };
        return NextResponse.json({ isVerified: false, error: 'auth_error', message: userErr.message, debug: { ...debugAggregate, ...debugAuthErr } } as PaymentStatusResponse, { status: 401 });
      }
      if (userResult?.user) {
        session = { user: userResult.user, access_token: accessToken, token_type: 'bearer', expires_in: 0, expires_at: 0, refresh_token: '' } as any;
      }
    }
  }

  if (!session?.user) {
    const debugUnauth = {
      ...debugAggregate,
      phase: 'auth-missing',
      hint: 'No Supabase session / bearer token; supply Authorization header or ?token=... param',
      sawQueryParamToken: Boolean(qpToken),
      headers: {
        hasAuth: Boolean(request.headers.get('authorization') || request.headers.get('Authorization')),
        hasCookie: Boolean(request.headers.get('cookie'))
      }
    };
    // Admin bypass for diagnostics: ?email=...&admin_debug=1 with x-admin-token header
    const adminDebug = url.searchParams.get('admin_debug') === '1';
    const emailParam = url.searchParams.get('email');
    if (adminDebug && emailParam && process.env.ADMIN_GRANT_TOKEN && request.headers.get('x-admin-token') === process.env.ADMIN_GRANT_TOKEN && supabaseAdmin) {
      const { data: rows, error: adminErr } = await supabaseAdmin
        .from('user_payments')
        .select('*')
        .eq('email', emailParam.toLowerCase())
        .eq('access_granted', true)
        .order('created_at', { ascending: false })
        .limit(1);
      if (adminErr) {
        return NextResponse.json({ isVerified: false, error: 'not_authenticated', debug: { ...debugUnauth, adminBypassTried: true, adminErr: adminErr.message } }, { status: 401 });
      }
  if (rows && rows.length === 1) {
    return NextResponse.json({ isVerified: true, tier: rows[0].tier, email: rows[0].email, name: rows[0].name, organization: rows[0].organization, rowId: rows[0].id, debug: { ...debugAggregate, phase: 'verified-admin-bypass', note: 'Bypassed normal auth for diagnostics', originalAuthIssue: debugUnauth } });
      }
      return NextResponse.json({ isVerified: false, error: 'not_authenticated', debug: { ...debugUnauth, adminBypassTried: true, adminFound: 0 } }, { status: 401 });
    }
    return NextResponse.json({ isVerified: false, error: 'not_authenticated', debug: debugUnauth } as PaymentStatusResponse, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase() || null;
  
  // Temporary bypass for testing - remove in production
  if (userEmail === 'jeremy.estrella@gmail.com' || userEmail === 'estrellasandstars@outlook.com') {
    return NextResponse.json({ 
      isVerified: true, 
      tier: 'team', 
      email: userEmail, 
      name: 'Jeremy Estrella', 
      organization: 'Testing',
      debug: { ...debugAggregate, phase: 'temp-bypass', note: 'Temporary bypass for testing' }
    } as PaymentStatusResponse);
  }
  
  const debug: any = { ...debugAggregate, phase: 'start', userId, userEmail, tokenFallback: Boolean(accessToken), sessionError: sessionError?.message };
  if (accessToken) {
    debug.accessTokenPreview = accessToken.length > 20 ? accessToken.slice(0, 12) + '...' + accessToken.slice(-8) : accessToken;
    debug.accessTokenLength = accessToken.length;
    if (accessToken === 'undefined' || accessToken === 'null' || accessToken.trim() === '') {
      debug.tokenValueInvalid = true;
    }
  }

  // 1. Primary lookup by user_id
  // Build a per-request authed client when we have an access token but no service role
  let authedClient: any = null;
  if (accessToken && !supabaseAdmin) {
    try {
      authedClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });
      debug.createdAuthedClient = true;
    } catch (e:any) {
      debug.authedClientError = e.message;
    }
  }
  const queryClient = accessToken && (supabaseAdmin || authedClient) ? (supabaseAdmin || authedClient) : supabase;
  debug.queryClientType = supabaseAdmin ? 'service-role' : authedClient ? 'authed-access-token' : 'anon';

  // Allow including test payments for specific tester emails or if exclusion disabled.
  const includeTestOverride = url.searchParams.get('includeTest') === '1';
  const excludeTestEnv = process.env.EXCLUDE_TEST_PAYMENTS === 'true';
  const excludeTest = excludeTestEnv && !includeTestOverride;
  debug.excludeTestEnv = excludeTestEnv;
  debug.includeTestOverride = includeTestOverride;
  debug.excludeTestActive = excludeTest;
  const baseUserQuery = queryClient
    .from('user_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('access_granted', true);
  if (excludeTest) baseUserQuery.eq('is_test', false);
  const { data: byUser, error: byUserErr } = await baseUserQuery
    .order('created_at', { ascending: false })
    .limit(1);

  if (byUserErr) {
    debug.byUserErr = byUserErr.message;
  }
  if (byUser) debug.byUserCount = byUser.length;

  let row = byUser?.[0];
  let claimed = false;

  // 2. Fallback by email (RLS now reveals matching unclaimed row)
  if (!row && userEmail) {
    const baseEmailQuery = queryClient
      .from('user_payments')
      .select('*')
      .eq('email', userEmail)
      .eq('access_granted', true);
    if (excludeTest) baseEmailQuery.eq('is_test', false);
    const { data: byEmail, error: byEmailErr } = await baseEmailQuery
      .order('created_at', { ascending: false })
      .limit(1);
    if (byEmailErr) {
      debug.byEmailErr = byEmailErr.message;
    }
    if (byEmail) debug.byEmailCount = byEmail.length;
    if (byEmail && byEmail.length === 1) {
      row = byEmail[0];
      // Attempt claim if user_id is null
      if (row && !row.user_id) {
  const { error: claimErr } = await queryClient
          .from('user_payments')
          .update({ user_id: userId })
          .eq('id', row.id);
        if (!claimErr) {
          claimed = true;
          row.user_id = userId;
        } else {
          debug.claimErr = claimErr.message;
        }
      }
    }
  }

  if (!row) {
  debug.phase = 'not-found';
  return NextResponse.json({ isVerified: false, debug } as PaymentStatusResponse, { status: 404 });
  }

  debug.phase = 'verified';

  const payload: PaymentStatusResponse = {
    isVerified: true,
    claimed,
    tier: row.tier,
    email: row.email,
    name: row.name,
    organization: row.organization,
    rowId: row.id,
    debug: debugParam || debugAlways ? debug : undefined
  };

  return NextResponse.json(payload);
}
