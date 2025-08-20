import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Debug endpoint: look up payment rows by email (admin protected)
// Usage: GET /api/payments/debug/lookup?email=foo@example.com with header x-admin-token: <ADMIN_GRANT_TOKEN>
// Returns matching rows from user_payments to help diagnose provisioning issues.

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_GRANT_TOKEN) {
    return NextResponse.json({ error: 'ADMIN_GRANT_TOKEN not configured' }, { status: 500 });
  }
  if (token !== process.env.ADMIN_GRANT_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'supabase admin unavailable' }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get('email') || '').toLowerCase();
  if (!email) {
    return NextResponse.json({ error: 'email query param required' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from('user_payments')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ email, rows: data, count: data?.length || 0 });
}
