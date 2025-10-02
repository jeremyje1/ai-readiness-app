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
      console.error(`User not found for ID ${data.user_id}:`, userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log what email we're dealing with
    console.log(`Setting password for user ${data.user_id}:`);
    console.log(`- Token email: ${data.email}`);
    console.log(`- User email in Supabase: ${userData.user.email}`);

    // Update user password
    const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password });
    if (pwError) {
      console.error('Password update error:', pwError);
      return NextResponse.json({ error: 'Failed to set password: ' + pwError.message }, { status: 500 });
    }

    await supabaseAdmin.from('auth_password_setup_tokens').update({ used_at: new Date().toISOString() }).eq('id', data.id);

    // Return the user's actual email from Supabase auth
    // This ensures we're using the correct email that can actually log in
    const returnEmail = userData.user.email || data.email;
    console.log(`Password set successfully, returning email: ${returnEmail}`);

    return NextResponse.json({ success: true, email: returnEmail });
  } catch (e: any) {
    console.error('Password setup error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
