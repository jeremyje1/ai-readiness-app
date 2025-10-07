import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Get relevant cookies
        const authCookies = cookieStore.getAll().filter(c =>
            c.name.includes('sb-') ||
            c.name.includes('supabase') ||
            c.name.includes('auth')
        ).map(c => ({
            name: c.name,
            exists: !!c.value,
            length: c.value?.length || 0
        }));

        return NextResponse.json({
            authenticated: !!user,
            userId: user?.id || null,
            email: user?.email || null,
            authError: authError?.message || null,
            cookies: authCookies,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            type: 'auth_debug_error'
        }, { status: 500 });
    }
}