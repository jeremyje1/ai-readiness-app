import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Test basic connection
        const startTime = Date.now();

        // Try to get session (should work even without auth)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        const elapsed = Date.now() - startTime;

        // Test database connection with a simple query to a known table
        let dbTest = null;
        try {
            // Try user_payments table which should exist based on the migration files
            const { data, error } = await supabase
                .from('user_payments')
                .select('count')
                .limit(0); // Don't return any data, just test connection

            dbTest = {
                success: !error,
                error: error?.message,
                table: 'user_payments',
                elapsed: Date.now() - startTime - elapsed
            };
        } catch (dbError: any) {
            dbTest = {
                success: false,
                error: dbError.message,
                table: 'user_payments',
                elapsed: Date.now() - startTime - elapsed
            };
        }

        return NextResponse.json({
            success: true,
            supabase: {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                connectionTest: {
                    elapsed: elapsed,
                    hasSession: !!sessionData?.session,
                    error: sessionError?.message
                },
                databaseTest: dbTest
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                isProduction: process.env.NODE_ENV === 'production',
                authDebug: process.env.NEXT_PUBLIC_AUTH_DEBUG
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}