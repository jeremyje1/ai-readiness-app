import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Temporary debug endpoint to check if payment row exists (bypasses auth)
// GET /api/debug/test-row?email=jeremy.estrella@gmail.com

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.toLowerCase();
  
  if (!email) {
    return NextResponse.json({ error: 'email param required' });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'supabase admin unavailable' });
  }

  try {
    // Check for any rows with this email
    const { data: rows, error } = await supabaseAdmin
      .from('user_payments')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({
      email,
      found: rows?.length || 0,
      rows: rows?.map(row => ({
        id: row.id,
        user_id: row.user_id,
        email: row.email,
        tier: row.tier,
        access_granted: row.access_granted,
        is_test: row.is_test,
        created_at: row.created_at
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
