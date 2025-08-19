import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function authorized(req: NextRequest) {
  const headerSecret = req.headers.get('x-cron-secret');
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return headerSecret === secret;
}

async function runCleanup() {
  if (!supabaseAdmin) return { error: 'Admin unavailable' } as const;
  const { data, error } = await supabaseAdmin.rpc('delete_expired_password_tokens');
  if (error) return { error: 'Cleanup failed', details: error.message } as const;
  return { success: true, deleted: data ?? 0 } as const;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await runCleanup();
  const status = 'error' in result ? 500 : 200;
  return NextResponse.json(result, { status });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await runCleanup();
  const status = 'error' in result ? 500 : 200;
  return NextResponse.json(result, { status });
}
