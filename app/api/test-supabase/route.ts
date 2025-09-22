import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    console.log('[Test Supabase] Starting connectivity test...');
    console.log('[Test Supabase] URL:', SUPABASE_URL);

    try {
        // Test 1: Health check
        const healthResponse = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
            }
        });

        const healthStatus = healthResponse.status;
        const healthText = await healthResponse.text();

        console.log('[Test Supabase] Health check status:', healthStatus);
        console.log('[Test Supabase] Health response:', healthText);

        // Test 2: Try a simple database query
        const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/institutions?select=count&limit=1`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'count=exact'
            }
        });

        const dbStatus = dbResponse.status;
        const dbText = await dbResponse.text();

        console.log('[Test Supabase] DB query status:', dbStatus);
        console.log('[Test Supabase] DB response:', dbText);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            tests: {
                health: {
                    status: healthStatus,
                    response: healthText
                },
                database: {
                    status: dbStatus,
                    response: dbText
                }
            },
            environment: {
                url: SUPABASE_URL,
                hasAnonKey: !!SUPABASE_ANON_KEY
            }
        });

    } catch (error: any) {
        console.error('[Test Supabase] Error:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}