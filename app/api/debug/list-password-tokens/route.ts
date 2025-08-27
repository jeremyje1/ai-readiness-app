import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin unavailable' }, { status: 500 })
    const { data, error } = await supabaseAdmin.from('auth_password_setup_tokens')
      .select('id,email,created_at,used_at,expires_at')
      .order('created_at', { ascending: false })
      .limit(25)
    if (error) return NextResponse.json({ error: 'Query failed', details: error.message }, { status: 500 })
    return NextResponse.json({ tokens: data })
  } catch (e:any) {
    return NextResponse.json({ error: 'Server error', details: e.message }, { status: 500 })
  }
}
