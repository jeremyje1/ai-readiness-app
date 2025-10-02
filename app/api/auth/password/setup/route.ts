import { rateLimitAsync } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rl = await rateLimitAsync(`pwsetup|${ip}`, 5, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin client unavailable' }, { status: 500 });
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('auth_password_setup_tokens').select('*').eq('token', token).limit(1).maybeSingle();
    if (error || !data) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    if (data.used_at) return NextResponse.json({ error: 'Token already used' }, { status: 400 });
    if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 400 });

    // Get the user to verify email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user password
    const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password });
    if (pwError) {
      console.error('Password update error:', pwError);
      return NextResponse.json({ error: 'Failed to set password: ' + pwError.message }, { status: 500 });
    }

    await supabaseAdmin.from('auth_password_setup_tokens').update({ used_at: new Date().toISOString() }).eq('id', data.id);

    // Return the actual user email from Supabase, not the token
    // This ensures we're using the exact email the user should login with
    const userEmail = userData.user.email || data.email;
    console.log(`Password set for user ${data.user_id}, email: ${userEmail}`);

    return NextResponse.json({ success: true, email: userEmail });
  } catch (e: any) {
    console.error('Password setup error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
