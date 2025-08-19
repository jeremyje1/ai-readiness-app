import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { rateLimit, rateLimitAsync } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' });
  }
  return stripe!;
}

async function findOrCreateUser(email: string, name?: string) {
  if (!supabaseAdmin) throw new Error('Admin client unavailable');
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const existing = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing.id;
  const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { name: name || 'Customer', payment_verified: true } });
  if (error) throw error;
  return data.user.id;
}

async function createPwToken(userId: string, email: string) {
  if (!supabaseAdmin) throw new Error('Admin client unavailable');
  const token = crypto.randomBytes(24).toString('hex');
  const expires = new Date(Date.now() + 1000*60*60).toISOString();
  const { error } = await supabaseAdmin.from('auth_password_setup_tokens').insert({ user_id: userId, email, token, expires_at: expires });
  if (error) throw error;
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = await rateLimitAsync(`stripe_bootstrap|${ip}`, 5, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

    // Idempotency: check if we already processed this session recently (store minimal) via token table metadata (reuse existing token if <15m old)
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin unavailable' }, { status: 500 });

    const checkout = await getStripe().checkout.sessions.retrieve(session_id, { expand: ['payment_intent'] });
    const email = checkout.customer_details?.email;
    if (!email) return NextResponse.json({ error: 'Email not found on session' }, { status: 400 });

    // Basic payment / status validation
    const isPaid = checkout.payment_status === 'paid' || checkout.status === 'complete';
    if (!isPaid) return NextResponse.json({ error: 'Session not paid' }, { status: 402 });

    // Prevent abuse: limit per email per minute
  const rlEmail = await rateLimitAsync(`stripe_bootstrap_email|${email.toLowerCase()}`, 3, 60_000);
    if (!rlEmail.allowed) return NextResponse.json({ error: 'Email rate limit exceeded' }, { status: 429 });

    const userId = await findOrCreateUser(email, checkout.customer_details?.name || undefined);

    // Try to reuse an existing un-used token for this user created in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: existingTokens } = await supabaseAdmin.from('auth_password_setup_tokens')
      .select('token, created_at, used_at')
      .eq('user_id', userId)
      .is('used_at', null)
      .gt('created_at', fifteenMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1);
    let token: string;
    if (existingTokens && existingTokens.length === 1) {
      token = existingTokens[0].token;
    } else {
      token = await createPwToken(userId, email);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const passwordSetupUrl = `${baseUrl}/auth/password/setup?token=${token}`;
    return NextResponse.json({ passwordSetupUrl, email, reused: existingTokens?.length === 1 });
  } catch (e: any) {
    console.error('post-checkout bootstrap error', e);
    return NextResponse.json({ error: 'bootstrap failed', details: e.message }, { status: 500 });
  }
}
