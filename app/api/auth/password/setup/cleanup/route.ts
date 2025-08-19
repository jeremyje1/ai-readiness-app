import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// NOTE: Protect by requiring a header with a secret token or restrict via Vercel cron IP allowlisting.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Admin unavailable' }, { status: 500 });
  const auth = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { error } = await supabaseAdmin.rpc('delete_expired_password_tokens');
  if (error) return NextResponse.json({ error: 'Cleanup failed', details: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
