import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const cookieStore = await cookies();

        // ✅ CORRECT: Use createServerClient from @supabase/ssr for proper cookie handling
        // This ensures Supabase auth cookies are managed correctly in SSR
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options });
                    }
                }
            }
        );

        // Demo credentials (must match your Supabase auth user)
        const demoEmail = 'demo@educationaiblueprint.com';
        const demoPassword = process.env.DEMO_PASSWORD || 'demo123456789';

        console.log('🔐 Attempting demo login for:', demoEmail);

        // Sign in with demo credentials
        // Supabase SSR will automatically handle auth cookie setting
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword
        });

        let session = signInData?.session;
        let userId = signInData?.user?.id;

        console.log('🔐 Sign in result:', {
            success: !!session,
            userId,
            error: signInError?.message
        });

        // If sign-in failed, attempt to create demo user
        if (signInError || !session) {
            console.log('⚠️ Sign in failed, attempting to create demo user...');

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
                console.error('❌ Demo user signup error:', signUpError);
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Failed to create demo user. Please ensure demo user exists in Supabase.',
                        details: signUpError.message
                    },
                    { status: 500 }
                );
            }

            session = signUpData.session;
            userId = signUpData.user?.id;

            console.log('✅ Demo user created:', userId);

            // Create demo organization and profile
            if (userId) {
                console.log('📊 Creating demo organization and profile...');

                try {
                    await supabase.from('organizations').upsert({
                        id: userId,
                        name: 'Demo Education District',
                        institution_type: 'k12_district',
                        organization_size: '1000-5000'
                    });

                    // Create user profile with admin role and onboarding completed
                    await supabase.from('users').upsert({
                        id: userId,
                        email: demoEmail,
                        full_name: 'Demo User',
                        role: 'admin',
                        organization_id: userId,
                        onboarding_completed: true, // Skip onboarding for demo
                        created_at: new Date().toISOString()
                    });

                    console.log('✅ Demo organization and profile created');
                } catch (dbError) {
                    console.error('⚠️ Error creating demo records:', dbError);
                    // Continue anyway - user might already have records
                }
            }
        }

        if (!session) {
            console.error('❌ No session after sign in/sign up');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to create demo session'
                },
                { status: 500 }
            );
        }

        console.log('✅ Demo session created successfully');

        // Calculate 30-minute expiry
        const expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes

        // Return success response
        // ✅ NOTE: Supabase SSR automatically handles auth cookies via createServerClient
        // We only need to set demo-specific cookies here
        const response = NextResponse.json({
            success: true,
            userId,
            redirectUrl: '/dashboard/personalized?demo=true&tour=start'
        });

        // Set demo-mode cookie (used by DemoBanner)
        response.cookies.set('demo-mode', 'true', {
            httpOnly: false, // Allow client-side access for DemoBanner countdown
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 60, // 30 minutes
            path: '/',
            sameSite: 'lax'
        });

        // Set demo-expiry cookie for countdown timer
        response.cookies.set('demo-expiry', expiryTime.toString(), {
            httpOnly: false, // Allow client-side access for countdown
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 60,
            path: '/',
            sameSite: 'lax'
        });

        console.log('🚀 Demo login complete, redirecting to:', '/dashboard/personalized?demo=true&tour=start');

        return response;
    } catch (error) {
        console.error('Demo login error:', error);
        return NextResponse.json(
            { error: 'Internal server error during demo login' },
            { status: 500 }
        );
    }
}
