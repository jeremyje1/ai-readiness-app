import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: 'Email and password are required'
            }, { status: 400 });
        }

        console.log(`[Test Auth] Attempting login for: ${email}`);
        const startTime = Date.now();

        // Clear any existing session first
        await supabase.auth.signOut({ scope: 'local' });

        // Attempt authentication
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });

        const elapsed = Date.now() - startTime;
        console.log(`[Test Auth] Auth attempt completed in ${elapsed}ms`);

        if (error) {
            console.error('[Test Auth] Auth failed:', error);
            return NextResponse.json({
                success: false,
                error: error.message,
                code: error.status,
                elapsed: elapsed,
                timestamp: new Date().toISOString()
            });
        }

        // Success
        console.log('[Test Auth] Auth successful');
        return NextResponse.json({
            success: true,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                role: data.user?.role
            },
            session: {
                access_token: data.session?.access_token ? 'present' : 'missing',
                refresh_token: data.session?.refresh_token ? 'present' : 'missing',
                expires_at: data.session?.expires_at
            },
            elapsed: elapsed,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[Test Auth] Exception:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST method with { email, password } to test authentication',
        testCredentials: {
            email: 'test@aiblueprint.com',
            password: 'TestPassword123!'
        }
    });
}