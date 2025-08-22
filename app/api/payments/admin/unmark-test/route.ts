import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Admin endpoint: unmark test payment rows for a given email so they count as real access
// Usage: POST /api/payments/admin/unmark-test { email: "foo@example.com" }
// Auth: header x-admin-token must match ADMIN_GRANT_TOKEN env

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_GRANT_TOKEN) {
    return NextResponse.json({ error: 'ADMIN_GRANT_TOKEN not configured' }, { status: 500 });
  }
  const token = req.headers.get('x-admin-token');
  if (token !== process.env.ADMIN_GRANT_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'supabase admin unavailable' }, { status: 500 });
  }
  try {
    const body = await req.json().catch(()=>({}));
    const emailRaw = body.email || body.userEmail || '';
    const email = String(emailRaw).toLowerCase().trim();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const { data: rows, error: selErr } = await supabaseAdmin
      .from('user_payments')
      .select('id,is_test')
      .eq('email', email);
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
    if (!rows || rows.length === 0) return NextResponse.json({ ok: true, updated: 0, message: 'no rows for email' });

    const testIds = rows.filter(r=>r.is_test).map(r=>r.id);
    if (testIds.length === 0) return NextResponse.json({ ok: true, updated: 0, message: 'no test rows to update' });

    const { error: updErr } = await supabaseAdmin
      .from('user_payments')
      .update({ is_test: false })
      .in('id', testIds);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, updated: testIds.length, clearedIds: testIds });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'unexpected_error' }, { status: 500 });
  }
}
