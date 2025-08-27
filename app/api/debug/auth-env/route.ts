import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    // NEVER return secrets; only structural metadata
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null
    const serviceKeyPresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const trimmedUrl = url?.trim()
    let projectRef: string | null = null
    try {
        if (trimmedUrl) {
            const host = new URL(trimmedUrl).host
            if (host.endsWith('.supabase.co')) {
                projectRef = host.split('.supabase.co')[0]
            }
        }
    } catch (_) { }
    return NextResponse.json({
        supabaseUrlPresent: !!url,
        supabaseUrl: trimmedUrl,
        supabaseUrlEndsWithSupabase: !!trimmedUrl && /\.supabase\.co$/.test(new URL(trimmedUrl).host),
        anonKeyPresent: !!anonKey,
        anonKeyLength: anonKey?.length || 0,
        serviceKeyPresent,
        projectRef,
        projectRefLength: projectRef?.length || 0,
        timestamp: new Date().toISOString()
    })
}
