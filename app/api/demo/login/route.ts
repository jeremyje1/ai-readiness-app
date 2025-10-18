import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // Use service role to bypass RLS for demo user creation
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Demo credentials
        const demoEmail = 'demo@educationaiblueprint.com';
        const demoPassword = 'demo123456789';

        // Try to sign in first (user may already exist)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword
        });

        let session = signInData?.session;
        let userId = signInData?.user?.id;

        // If sign-in failed, create new demo user
        if (signInError || !session) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: demoEmail,
                password: demoPassword,
                options: {
                    emailRedirectTo: undefined, // No email confirmation for demo
                    data: {
                        first_name: 'Demo',
                        last_name: 'User',
                        role: 'Superintendent',
                        institution_type: 'K-12 District'
                    }
                }
            });

            if (signUpError) {
                console.error('Demo user signup error:', signUpError);
                return NextResponse.json(
                    { error: 'Failed to create demo user' },
                    { status: 500 }
                );
            }

            session = signUpData.session;
            userId = signUpData.user?.id;

            // Create demo organization
            if (userId) {
                await supabase.from('organizations').upsert({
                    id: userId,
                    name: 'Demo Education District',
                    institution_type: 'k12_district',
                    organization_size: '1000-5000'
                });

                // Create user profile with admin role
                await supabase.from('users').upsert({
                    id: userId,
                    email: demoEmail,
                    full_name: 'Demo User',
                    role: 'admin',
                    organization_id: userId,
                    onboarding_completed: true, // Skip onboarding
                    created_at: new Date().toISOString()
                });
            }
        }

        if (!session) {
            return NextResponse.json(
                { error: 'Failed to create demo session' },
                { status: 500 }
            );
        }

        // Calculate 30-minute expiry
        const expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes

        // Return success with session data and cookies
        const response = NextResponse.json({
            success: true,
            session,
            userId,
            redirectUrl: '/dashboard/personalized?demo=true&tour=start'
        });

        // Set demo cookies (30-minute expiry)
        response.cookies.set('demo-mode', 'true', {
            httpOnly: false, // Allow client-side access for banner
            maxAge: 30 * 60, // 30 minutes
            path: '/',
            sameSite: 'lax'
        });

        response.cookies.set('demo-expiry', expiryTime.toString(), {
            httpOnly: false,
            maxAge: 30 * 60,
            path: '/',
            sameSite: 'lax'
        });

        // Set Supabase auth cookies
        if (session.access_token) {
            response.cookies.set('sb-access-token', session.access_token, {
                httpOnly: true,
                maxAge: 30 * 60,
                path: '/',
                sameSite: 'lax'
            });
        }

        if (session.refresh_token) {
            response.cookies.set('sb-refresh-token', session.refresh_token, {
                httpOnly: true,
                maxAge: 30 * 60,
                path: '/',
                sameSite: 'lax'
            });
        }

        return response;
    } catch (error) {
        console.error('Demo login error:', error);
        return NextResponse.json(
            { error: 'Internal server error during demo login' },
            { status: 500 }
        );
    }
}
