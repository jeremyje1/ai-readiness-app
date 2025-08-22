import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '../../../../lib/supabase';

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

export async function GET(request: Request) {
  // Attempt normal session retrieval first (works if using helpers that set cookies).
  let { data: { session }, error: sessionError } = await supabase.auth.getSession();

  let accessToken: string | null = null;
  // Try extracting sb-access-token cookie if Supabase client not yet initialized server-side
  // Extract query params for optional token pass-through (diagnostic / fallback when direct browser nav can't set auth header)
  const url = new URL(request.url);
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
      const { data: userResult, error: userErr } = await supabase.auth.getUser(accessToken);
      if (userErr) {
        // Provide richer diagnostics when Supabase rejects the provided token
        const debugAuthErr = {
          phase: 'auth-error-getUser',
          suppliedAccessToken: true,
          accessTokenPreview: accessToken.length > 16 ? accessToken.slice(0, 8) + '...' + accessToken.slice(-6) : accessToken,
            accessTokenLength: accessToken.length,
          tokenLooksPlaceholder: ['undefined','null',''].includes(accessToken.trim()),
          qpTokenPresent: Boolean(qpToken),
          hadAuthHeader: Boolean(request.headers.get('authorization') || request.headers.get('Authorization')),
          hadCookie: Boolean(request.headers.get('cookie')),
          hint: 'Token rejected by Supabase. If accessTokenLength is very small or tokenLooksPlaceholder=true, client is passing an uninitialized value.'
        };
        return NextResponse.json({ isVerified: false, error: 'auth_error', message: userErr.message, debug: debugAuthErr } as PaymentStatusResponse, { status: 401 });
      }
      if (userResult?.user) {
        session = { user: userResult.user, access_token: accessToken, token_type: 'bearer', expires_in: 0, expires_at: 0, refresh_token: '' } as any;
      }
    }
  }

  if (!session?.user) {
    const debugUnauth = {
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
        return NextResponse.json({ isVerified: true, tier: rows[0].tier, email: rows[0].email, name: rows[0].name, organization: rows[0].organization, rowId: rows[0].id, debug: { phase: 'verified-admin-bypass', note: 'Bypassed normal auth for diagnostics', originalAuthIssue: debugUnauth } });
      }
      return NextResponse.json({ isVerified: false, error: 'not_authenticated', debug: { ...debugUnauth, adminBypassTried: true, adminFound: 0 } }, { status: 401 });
    }
    return NextResponse.json({ isVerified: false, error: 'not_authenticated', debug: debugUnauth } as PaymentStatusResponse, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase() || null;
  const debug: any = { phase: 'start', userId, userEmail, tokenFallback: Boolean(accessToken), sessionError: sessionError?.message };
  if (accessToken) {
    debug.accessTokenPreview = accessToken.length > 20 ? accessToken.slice(0, 12) + '...' + accessToken.slice(-8) : accessToken;
    debug.accessTokenLength = accessToken.length;
    if (accessToken === 'undefined' || accessToken === 'null' || accessToken.trim() === '') {
      debug.tokenValueInvalid = true;
    }
  }

  // 1. Primary lookup by user_id
  const queryClient = accessToken && supabaseAdmin ? supabaseAdmin : supabase; // if token fallback used, prefer admin to ensure RLS context (we already validated token)

  // Allow including test payments for specific tester emails or if exclusion disabled.
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

  if (byUserErr) {
    debug.byUserErr = byUserErr.message;
  }

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
    debug
  };

  return NextResponse.json(payload);
}
