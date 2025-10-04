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
            .eq('id', user.id)
            .single();

        if (!existingProfile) {
            console.log('[Auth Hook] Creating user profile...');

            // Calculate trial end date (7 days from now)
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7);

            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    organization: user.user_metadata?.organization || '',
                    institution_type: user.user_metadata?.institution_type || 'K12',
                    title: user.user_metadata?.title || '',
                    phone: user.user_metadata?.phone || '',
                    subscription_tier: 'trial',
                    subscription_status: 'trialing',
                    trial_ends_at: trialEndDate.toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
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