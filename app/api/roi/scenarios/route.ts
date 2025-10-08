import type { RoiAssumptions, RoiResults } from '@/lib/roi/calculations';
import { NextResponse } from 'next/server';
import { getAuthContext, getTeamMembership, SCENARIO_EDITOR_ROLES } from './utils';

interface ScenarioPayload {
    name: string;
    description?: string;
    audienceLabel?: string;
    assumptions: RoiAssumptions;
    results: RoiResults;
    isFavorite?: boolean;
    lastUsedAt?: string;
}

export async function GET() {
    const authContext = await getAuthContext();

    if (!authContext.ok) {
        return authContext.response;
    }

    const { supabase, organization } = authContext;

    const { data, error } = await supabase
        .from('roi_scenarios')
        .select(
            'id, organization, user_id, name, description, audience_label, assumptions, results, is_favorite, last_used_at, created_at, updated_at'
        )
        .eq('organization', organization)
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching ROI scenarios:', error);
        return NextResponse.json({ error: 'Failed to load ROI scenarios' }, { status: 500 });
    }

    return NextResponse.json({ scenarios: data ?? [] });
}

export async function POST(request: Request) {
    const authContext = await getAuthContext();

    if (!authContext.ok) {
        return authContext.response;
    }

    const { supabase, user, organization } = authContext;
    const membershipResult = await getTeamMembership(supabase, user.id, organization);

    if (!membershipResult.ok) {
        return membershipResult.response;
    }

    const { membership } = membershipResult;

    if (!SCENARIO_EDITOR_ROLES.has((membership.role || '').toLowerCase())) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    let payload: ScenarioPayload;

    try {
        payload = await request.json();
    } catch (error) {
        console.error('Invalid ROI scenario payload:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!payload?.name || typeof payload.name !== 'string' || !payload.name.trim()) {
        return NextResponse.json({ error: 'Scenario name is required' }, { status: 400 });
    }

    if (!payload.assumptions || !payload.results) {
        return NextResponse.json({ error: 'Scenario assumptions and results are required' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const { data: scenario, error: insertError } = await supabase
        .from('roi_scenarios')
        .insert({
            organization,
            user_id: user.id,
            name: payload.name.trim(),
            description: payload.description?.trim() || null,
            audience_label: payload.audienceLabel?.trim() || null,
            assumptions: payload.assumptions,
            results: payload.results,
            is_favorite: Boolean(payload.isFavorite),
            last_used_at: payload.lastUsedAt ?? timestamp,
            created_at: timestamp,
            updated_at: timestamp,
        })
        .select()
        .single();

    if (insertError) {
        console.error('Error saving ROI scenario:', insertError);

        if (typeof insertError.code === 'string' && insertError.code === '23505') {
            return NextResponse.json({ error: 'A scenario with this name already exists.' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to save ROI scenario' }, { status: 500 });
    }

    try {
        await supabase.from('team_activity').insert({
            team_member_id: membership.id,
            action_type: 'roi_scenario_saved',
            action_details: {
                scenario_id: scenario.id,
                name: scenario.name,
                audience_label: scenario.audience_label,
                action: 'create',
            },
            entity_type: 'roi_scenario',
            entity_id: scenario.id,
        });
    } catch (activityError) {
        console.warn('Unable to record ROI scenario activity:', activityError);
    }

    return NextResponse.json({ scenario });
}
