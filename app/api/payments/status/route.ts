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

export async function GET() {
  // Using the global supabase client (anon key). If more reliable server session
  // retrieval is needed, consider a dedicated server-side helper that rehydrates
  // the auth context from cookies. For now, rely on getSession which works in
  // App Route server context when cookies are forwarded automatically.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    return NextResponse.json({ isVerified: false, error: 'auth_error', message: sessionError.message } as PaymentStatusResponse, { status: 401 });
  }
  if (!session?.user) {
    return NextResponse.json({ isVerified: false, error: 'not_authenticated' } as PaymentStatusResponse, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email?.toLowerCase() || null;
  const debug: any = { phase: 'start', userId, userEmail };

  // 1. Primary lookup by user_id
  const { data: byUser, error: byUserErr } = await supabase
    .from('user_payments')
    .select('*')
    .eq('user_id', userId)
    .eq('access_granted', true)
    .eq('is_test', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (byUserErr) {
    debug.byUserErr = byUserErr.message;
  }

  let row = byUser?.[0];
  let claimed = false;

  // 2. Fallback by email (RLS now reveals matching unclaimed row)
  if (!row && userEmail) {
    const { data: byEmail, error: byEmailErr } = await supabase
      .from('user_payments')
      .select('*')
      .eq('email', userEmail)
      .eq('access_granted', true)
    .eq('is_test', false)
      .order('created_at', { ascending: false })
      .limit(1);
    if (byEmailErr) {
      debug.byEmailErr = byEmailErr.message;
    }
    if (byEmail && byEmail.length === 1) {
      row = byEmail[0];
      // Attempt claim if user_id is null
      if (row && !row.user_id) {
        const { error: claimErr } = await supabase
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
