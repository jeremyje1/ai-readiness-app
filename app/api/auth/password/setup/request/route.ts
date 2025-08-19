import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';
import { rateLimit, rateLimitAsync } from '@/lib/rate-limit';
import { emailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin unavailable' }, { status: 500 });
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rl = await rateLimitAsync(`pwsetupreq|${ip}`, 3, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Find user
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
    const user = userList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return NextResponse.json({ success: true }); // do not reveal

    // Create token
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 60*60*1000).toISOString();
    await supabaseAdmin.from('auth_password_setup_tokens').insert({ user_id: user.id, email, token, expires_at: expires });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const link = `${baseUrl}/auth/password/setup?token=${token}`;
    await emailService.sendEmail({
      to: email,
      subject: 'Password Setup',
      htmlBody: `<p>Set your password using the secure link (valid 1 hour): <a href="${link}">${link}</a></p>`
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Password setup request error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
