import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Supabase Auth Hook - Auto-confirm trial users
 * This endpoint should be configured in your Supabase project as a webhook
 * Project Settings -> Auth -> Webhooks -> User Signup Hook
 * 
 * Webhook URL: https://aiblueprint.educationaiblueprint.com/api/auth/hooks/signup
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user, type } = body;

        // Only process signup events
        if (type !== 'INSERT') {
            return NextResponse.json({ success: true });
        }

        console.log('[Auth Hook] Processing signup for:', user.email);

        // Auto-confirm trial users
        const supabase = createRouteHandlerClient({ cookies });

        // Update user metadata to mark as confirmed
        const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
            email_confirm: true,
            user_metadata: {
                ...user.user_metadata,
                confirmed_at: new Date().toISOString()
            }
        });

        if (confirmError) {
            console.error('[Auth Hook] Error confirming user:', confirmError);
        } else {
            console.log('[Auth Hook] User auto-confirmed:', user.email);
        }

        // Create user profile if it doesn't exist
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)  // FIXED: Changed from 'id' to 'user_id'
            .maybeSingle();

        if (!existingProfile) {
            console.log('[Auth Hook] Creating user profile for:', user.email);

            // Calculate trial end date (7 days from now)
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7);

            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    user_id: user.id,  // FIXED: Changed from 'id' to 'user_id'
                    email: user.email,
                    full_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    institution_name: user.user_metadata?.organization || '',
                    institution_type: user.user_metadata?.institution_type || 'K12',
                    job_title: user.user_metadata?.title || '',
                    phone: user.user_metadata?.phone || '',
                    subscription_tier: 'trial',
                    subscription_status: 'trialing',
                    trial_ends_at: trialEndDate.toISOString(),
                    onboarding_completed: false
                });

            if (profileError) {
                console.error('[Auth Hook] Error creating profile:', profileError);
            } else {
                console.log('[Auth Hook] Profile created successfully');
            }
        } else {
            console.log('[Auth Hook] Profile already exists');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Auth Hook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}