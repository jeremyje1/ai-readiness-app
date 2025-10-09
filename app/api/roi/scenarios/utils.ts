import { getOrganizationForUser, hasPremiumAccess } from '@/lib/payments/access';
import { resolveServerUser } from '@/lib/supabase/resolve-user';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const SCENARIO_EDITOR_ROLES = new Set(['owner', 'admin', 'editor', 'member']);

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type AuthContextResult =
    | {
        ok: true;
        supabase: SupabaseServerClient;
        user: User;
        organization: string;
    }
    | {
        ok: false;
        response: NextResponse;
    };

export type TeamMembership = {
    id: string;
    role: string | null;
};

export async function getAuthContext(request?: NextRequest): Promise<AuthContextResult> {
    const supabase = await createClient();
    const { user, error } = await resolveServerUser(supabase, request);

    if (!user) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    const {
        organization: organizationFromPayment,
        payment,
        subscriptionStatus,
        subscriptionTier,
        trialEndsAt,
    } = await getOrganizationForUser(supabase, user.id);

    const hasAccess = hasPremiumAccess(
        payment,
        subscriptionStatus,
        subscriptionTier,
        trialEndsAt,
        user.created_at
    );

    if (!hasAccess) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Active subscription required' }, { status: 403 }),
        };
    }

    const organization =
        organizationFromPayment ||
        user.user_metadata?.organization ||
        (user.email ? user.email.split('@')[1] : null) ||
        `premium-${user.id.slice(0, 8)}`;

    return { ok: true, supabase, user, organization };
}

export async function getTeamMembership(
    supabase: SupabaseServerClient,
    userId: string,
    organization: string
): Promise<{ ok: true; membership: TeamMembership } | { ok: false; response: NextResponse }> {
    const { data, error } = await supabase
        .from('team_members')
        .select('id, role')
        .eq('user_id', userId)
        .eq('organization', organization)
        .maybeSingle();

    if (error) {
        console.error('Error loading team membership:', error);
        return {
            ok: false,
            response: NextResponse.json({ error: 'Failed to resolve membership' }, { status: 500 }),
        };
    }

    if (!data) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Team membership not found' }, { status: 403 }),
        };
    }

    return { ok: true, membership: data };
}
