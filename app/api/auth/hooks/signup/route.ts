import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Supabase Auth Hook - Auto-setup new users
 * This endpoint should be configured in your Supabase project as a webhook
 * Project Settings -> Auth -> Webhooks -> User Signup Hook
 * 
 * Webhook URL: https://aiblueprint.educationaiblueprint.com/api/auth/hooks/signup
 * 
 * Automatically creates:
 * 1. User profile
 * 2. Institution (from email domain or metadata)
 * 3. Institution membership (admin role)
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user, type } = body;

        // Only process signup events
        if (type !== 'INSERT') {
            return NextResponse.json({ success: true });
        }

        console.log('[Auth Hook] 🚀 Processing signup for:', user.email);

        const supabase = await createClient();

        // Check if profile already exists
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('user_id, institution_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (existingProfile) {
            console.log('[Auth Hook] ✅ Profile already exists for:', user.email);
            return NextResponse.json({ success: true });
        }

        console.log('[Auth Hook] 📝 Creating complete user setup...');

        // 1. Create or find institution
        let institutionId: string | null = null;
        const orgName = user.user_metadata?.organization || user.email.split('@')[1]?.replace(/\./g, ' ') || 'My Institution';

        // Check if institution already exists
        const { data: existingInstitution } = await supabase
            .from('institutions')
            .select('id')
            .eq('name', orgName)
            .maybeSingle();

        if (existingInstitution) {
            institutionId = existingInstitution.id;
            console.log('[Auth Hook] 🏢 Using existing institution:', institutionId);
        } else {
            // Create new institution
            const slug = orgName.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') + '-' + Date.now();

            const { data: newInstitution, error: instError } = await supabase
                .from('institutions')
                .insert({
                    name: orgName,
                    slug: slug,
                    headcount: 500,
                    budget: 1000000,
                    org_type: user.user_metadata?.institution_type || 'K12',
                    created_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (instError) {
                console.error('[Auth Hook] ❌ Error creating institution:', instError);
            } else if (newInstitution) {
                institutionId = newInstitution.id;
                console.log('[Auth Hook] ✅ Created institution:', institutionId);
            }
        }

        // 2. Create user profile
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: user.id,
                email: user.email,
                full_name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                institution_id: institutionId,
                institution_name: orgName,
                institution_type: user.user_metadata?.institution_type || 'K12',
                job_title: user.user_metadata?.title || '',
                phone: user.user_metadata?.phone || '',
                subscription_tier: 'trial',
                subscription_status: 'trialing',
                trial_ends_at: trialEndDate.toISOString(),
                onboarding_completed: false
            });

        if (profileError) {
            console.error('[Auth Hook] ❌ Error creating profile:', profileError);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        console.log('[Auth Hook] ✅ Profile created');

        // 3. Create institution membership (if we have an institution)
        if (institutionId) {
            const { error: membershipError } = await supabase
                .from('institution_memberships')
                .insert({
                    user_id: user.id,
                    institution_id: institutionId,
                    role: 'admin',
                    active: true,
                    created_at: new Date().toISOString()
                });

            if (membershipError) {
                console.error('[Auth Hook] ❌ Error creating membership:', membershipError);
                // Don't fail the whole process if membership fails
            } else {
                console.log('[Auth Hook] ✅ Institution membership created');
            }
        }

        console.log('[Auth Hook] 🎉 Complete setup finished for:', user.email);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Auth Hook] ❌ Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}