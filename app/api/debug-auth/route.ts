import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    console.log('[Debug Auth API] Starting authentication test...');
    
    try {
        const { email, password } = await request.json();
        
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }
        
        console.log(`[Debug Auth API] Testing auth for: ${email}`);
        
        // Create fresh client
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false,
                detectSessionInUrl: false,
                autoRefreshToken: false
            }
        });
        
        console.log('[Debug Auth API] Supabase client created');
        
        // Set a timeout for the auth call
        const authPromise = supabase.auth.signInWithPassword({ email, password });
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000);
        });
        
        console.log('[Debug Auth API] Calling signInWithPassword...');
        const startTime = Date.now();
        
        try {
            const result = await Promise.race([authPromise, timeoutPromise]) as any;
            const duration = Date.now() - startTime;
            
            console.log(`[Debug Auth API] Auth call completed in ${duration}ms`);
            
            if (result.error) {
                console.log('[Debug Auth API] Auth error:', result.error.message);
                return NextResponse.json({
                    success: false,
                    error: result.error.message,
                    duration,
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log('[Debug Auth API] Auth successful');
            return NextResponse.json({
                success: true,
                userId: result.data?.user?.id,
                email: result.data?.user?.email,
                hasSession: !!result.data?.session,
                duration,
                timestamp: new Date().toISOString()
            });
            
        } catch (timeoutError: any) {
            const duration = Date.now() - startTime;
            console.log(`[Debug Auth API] Auth timed out after ${duration}ms`);
            
            return NextResponse.json({
                success: false,
                error: 'Authentication timed out',
                duration,
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error: any) {
        console.error('[Debug Auth API] Unexpected error:', error);
        
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}