import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

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
    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    const checkout = await getStripe().checkout.sessions.retrieve(session_id);
    const email = checkout.customer_details?.email;
    if (!email) return NextResponse.json({ error: 'Email not found on session' }, { status: 400 });

    const userId = await findOrCreateUser(email, checkout.customer_details?.name || undefined);
    const token = await createPwToken(userId, email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const passwordSetupUrl = `${baseUrl}/auth/password/setup?token=${token}`;
    return NextResponse.json({ passwordSetupUrl, email });
  } catch (e:any) {
    console.error('post-checkout bootstrap error', e);
    return NextResponse.json({ error: 'bootstrap failed', details: e.message }, { status: 500 });
  }
}
