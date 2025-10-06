import { createClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createClient();

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Get the user data
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.user_metadata?.subscription_status === 'trial') {
                // New trial user - redirect to dashboard
                return NextResponse.redirect(new URL('/dashboard/personalized?welcome=true', requestUrl.origin));
            } else {
                // Existing user - redirect to dashboard
                return NextResponse.redirect(new URL('/dashboard/personalized', requestUrl.origin));
            }
        }
    }

    // Auth failed - redirect to login with error
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin));
}