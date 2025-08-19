import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = rateLimit(`pwsetup|${ip}`, 5, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin client unavailable' }, { status: 500 });
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('auth_password_setup_tokens').select('*').eq('token', token).limit(1).maybeSingle();
    if (error || !data) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    if (data.used_at) return NextResponse.json({ error: 'Token already used' }, { status: 400 });
    if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 400 });

    // Update user password
    const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password });
    if (pwError) return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });

    await supabaseAdmin.from('auth_password_setup_tokens').update({ used_at: new Date().toISOString() }).eq('id', data.id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Password setup error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
