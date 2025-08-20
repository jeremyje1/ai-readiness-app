import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Lightweight admin utility to manually grant payment access when a Stripe webhook failed
// SECURITY: Requires service role (supabaseAdmin) and a shared secret token ADMIN_GRANT_TOKEN.
// Invoke with: POST /api/payments/manual-grant  Authorization: Bearer <ADMIN_GRANT_TOKEN>
// Body: { email, tier, name?, organization? }
// Idempotent: if a matching access_granted row already exists for (user_id,tier) it is returned.

interface GrantBody {
  email: string;
  tier: string;
  name?: string;
  organization?: string;
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'admin_client_unavailable' }, { status: 500 });
  }
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || token !== process.env.ADMIN_GRANT_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: GrantBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const { tier } = body;
  if (!email || !tier) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  try {
    // Find or create auth user
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
    let user = usersList?.users?.find(u => u.email?.toLowerCase() === email);
    if (!user) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name: body.name, organization: body.organization }
      });
      if (createErr) throw createErr;
      user = created.user;
    }
    const userId = user.id;

    // Existing payment row?
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('user_payments')
      .select('*')
      .eq('user_id', userId)
      .eq('tier', tier)
      .eq('access_granted', true)
      .limit(1);
    if (existingErr) throw existingErr;
    if (existing && existing.length === 1) {
      return NextResponse.json({ created: false, row: existing[0] });
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('user_payments')
      .insert({
        user_id: userId,
        email,
        name: body.name || user.user_metadata?.name || 'Customer',
        organization: body.organization || user.user_metadata?.organization || null,
        tier,
        stripe_customer_id: 'manual',
        stripe_session_id: 'manual-' + Date.now(),
        payment_amount: 0,
        payment_status: 'completed',
        access_granted: true,
        created_at: new Date().toISOString()
      })
      .select('*')
      .limit(1);
    if (insertErr) throw insertErr;

    return NextResponse.json({ created: true, row: inserted?.[0] });
  } catch (e: any) {
    return NextResponse.json({ error: 'grant_failed', message: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ service: 'manual-grant', ok: true });
}
