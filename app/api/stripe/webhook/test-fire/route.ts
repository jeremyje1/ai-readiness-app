import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Secure internal endpoint to simulate a successful Stripe checkout.session.completed
// POST /api/stripe/webhook/test-fire
// Headers: Authorization: Bearer <ADMIN_GRANT_TOKEN>
// Body JSON: { email, tier, name?, organization? }
// Provisioning logic mirrors real webhook (simplified)

const PRICES: Record<string, number> = {
  'higher-ed-ai-pulse-check': 2000,
  'ai-readiness-comprehensive': 4995,
  'ai-transformation-blueprint': 24500,
  'enterprise-partnership': 75000,
  'custom-enterprise': 24500
};

interface Body { email: string; tier: string; name?: string; organization?: string; }

export async function POST(req: NextRequest) {
  if (process.env.ADMIN_DEBUG_ENDPOINTS_ENABLED !== 'true') {
    return NextResponse.json({ error: 'disabled' }, { status: 404 });
  }
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token || token !== process.env.ADMIN_GRANT_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'admin_unavailable' }, { status: 500 });
  }
  let body: Body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }
  const email = body.email?.toLowerCase();
  const { tier } = body;
  if (!email || !tier) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  if (!(tier in PRICES)) return NextResponse.json({ error: 'unknown_tier' }, { status: 400 });
  try {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    let user = list?.users?.find((u: any) => u.email?.toLowerCase() === email) || null;
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
    const { data: existing } = await supabaseAdmin
      .from('user_payments')
      .select('id')
      .eq('user_id', userId)
      .eq('tier', tier)
      .eq('access_granted', true)
      .limit(1);
    if (!existing || existing.length === 0) {
      await supabaseAdmin.from('user_payments').insert({
        user_id: userId,
        email,
        name: body.name || user.user_metadata?.name || 'Customer',
        organization: body.organization || user.user_metadata?.organization || null,
        tier,
        stripe_customer_id: 'test-fire',
        stripe_session_id: 'test-fire-' + Date.now(),
        payment_amount: PRICES[tier],
        payment_status: 'completed',
        access_granted: true,
        created_at: new Date().toISOString()
      });
    }
    return NextResponse.json({ success: true, email, tier });
  } catch (e: any) {
    return NextResponse.json({ error: 'provision_failed', message: e.message }, { status: 500 });
  }
}

export async function GET() { return NextResponse.json({ service: 'stripe-webhook-test-fire', ok: true }); }
export const dynamic = 'force-dynamic';
