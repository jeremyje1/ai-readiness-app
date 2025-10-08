import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

export async function getAuthContext(): Promise<AuthContextResult> {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    const { data: payment, error: paymentError } = await supabase
        .from('user_payments')
        .select('organization')
        .eq('user_id', user.id)
        .eq('access_granted', true)
        .single();

    if (paymentError || !payment?.organization) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'No premium access found' }, { status: 404 }),
        };
    }

    return { ok: true, supabase, user, organization: payment.organization };
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
