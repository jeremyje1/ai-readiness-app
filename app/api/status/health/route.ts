import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = { timestamp: new Date().toISOString() };
  // Supabase anon health
  try {
    const { data, error } = await supabase.auth.getSession();
    results.supabaseAuth = error ? { ok: false, error: error.message } : { ok: true };
  } catch (e:any) {
    results.supabaseAuth = { ok: false, error: e.message };
  }
  return NextResponse.json(results);
}
