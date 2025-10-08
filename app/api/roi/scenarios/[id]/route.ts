import type { RoiAssumptions, RoiResults } from '@/lib/roi/calculations';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext, getTeamMembership, SCENARIO_EDITOR_ROLES } from '../utils';

interface ScenarioUpdatePayload {
    name: string;
    description?: string | null;
    audienceLabel?: string | null;
    assumptions: RoiAssumptions;
    results: RoiResults;
    isFavorite?: boolean;
    lastUsedAt?: string | null;
}

interface ScenarioPatchPayload {
    name?: string;
    description?: string | null;
    audienceLabel?: string | null;
    assumptions?: RoiAssumptions;
    results?: RoiResults;
    isFavorite?: boolean;
    lastUsedAt?: string | null;
}

const UNIQUE_VIOLATION_CODE = '23505';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id: scenarioId } = await context.params;
    const authContext = await getAuthContext(request);

    if (!authContext.ok) {
        return authContext.response;
    }

    const { supabase, user, organization } = authContext;
    const membershipResult = await getTeamMembership(supabase, user.id, organization);

    if (!membershipResult.ok) {
        return membershipResult.response;
    }

    const role = (membershipResult.membership.role || '').toLowerCase();

    if (!SCENARIO_EDITOR_ROLES.has(role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    let payload: ScenarioUpdatePayload;

    try {
        payload = await request.json();
    } catch (error) {
        console.error('Invalid ROI scenario update payload:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!payload?.name || !payload.assumptions || !payload.results) {
        return NextResponse.json({ error: 'Scenario name, assumptions, and results are required' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const { data: scenario, error: updateError } = await supabase
        .from('roi_scenarios')
        .update({
            name: payload.name.trim(),
            description: payload.description?.trim() || null,
            audience_label: payload.audienceLabel?.trim() || null,
            assumptions: payload.assumptions,
            results: payload.results,
            is_favorite: Boolean(payload.isFavorite),
            last_used_at: payload.lastUsedAt ?? timestamp,
            updated_at: timestamp,
        })
        .eq('id', scenarioId)
        .eq('organization', organization)
        .select()
        .maybeSingle();

    if (updateError) {
        console.error('Error updating ROI scenario:', updateError);

        if (typeof updateError.code === 'string' && updateError.code === UNIQUE_VIOLATION_CODE) {
            return NextResponse.json({ error: 'A scenario with this name already exists.' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to update ROI scenario' }, { status: 500 });
    }

    if (!scenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    try {
        await supabase.from('team_activity').insert({
            team_member_id: membershipResult.membership.id,
            action_type: 'roi_scenario_saved',
            action_details: {
                scenario_id: scenario.id,
                name: scenario.name,
                audience_label: scenario.audience_label,
                action: 'update',
            },
            entity_type: 'roi_scenario',
            entity_id: scenario.id,
        });
    } catch (activityError) {
        console.warn('Unable to record ROI scenario update activity:', activityError);
    }

    return NextResponse.json({ scenario });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id: scenarioId } = await context.params;
    const authContext = await getAuthContext(request);

    if (!authContext.ok) {
        return authContext.response;
    }

    const { supabase, user, organization } = authContext;
    const membershipResult = await getTeamMembership(supabase, user.id, organization);

    if (!membershipResult.ok) {
        return membershipResult.response;
    }

    const role = (membershipResult.membership.role || '').toLowerCase();

    if (!SCENARIO_EDITOR_ROLES.has(role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    let payload: ScenarioPatchPayload;

    try {
        payload = await request.json();
    } catch (error) {
        console.error('Invalid ROI scenario patch payload:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    const timestamp = new Date().toISOString();

    if (typeof payload.name === 'string') {
        updates.name = payload.name.trim();
    }

    if (payload.description !== undefined) {
        updates.description = payload.description?.trim() || null;
    }

    if (payload.audienceLabel !== undefined) {
        updates.audience_label = payload.audienceLabel?.trim() || null;
    }

    if (payload.assumptions) {
        updates.assumptions = payload.assumptions;
    }

    if (payload.results) {
        updates.results = payload.results;
    }

    if (payload.isFavorite !== undefined) {
        updates.is_favorite = Boolean(payload.isFavorite);
    }

    if (payload.lastUsedAt !== undefined) {
        updates.last_used_at = payload.lastUsedAt ?? timestamp;
    }

    const shouldUpdateTimestamp = Object.keys(updates).some((key) => key !== 'last_used_at');

    if (shouldUpdateTimestamp) {
        updates.updated_at = timestamp;
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { data: scenario, error: patchError } = await supabase
        .from('roi_scenarios')
        .update(updates)
        .eq('id', scenarioId)
        .eq('organization', organization)
        .select()
        .maybeSingle();

    if (patchError) {
        console.error('Error patching ROI scenario:', patchError);

        if (typeof patchError.code === 'string' && patchError.code === UNIQUE_VIOLATION_CODE) {
            return NextResponse.json({ error: 'A scenario with this name already exists.' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to update ROI scenario' }, { status: 500 });
    }

    if (!scenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    return NextResponse.json({ scenario });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id: scenarioId } = await context.params;
    const authContext = await getAuthContext(request);

    if (!authContext.ok) {
        return authContext.response;
    }

    const { supabase, user, organization } = authContext;
    const membershipResult = await getTeamMembership(supabase, user.id, organization);

    if (!membershipResult.ok) {
        return membershipResult.response;
    }

    const role = (membershipResult.membership.role || '').toLowerCase();

    if (!SCENARIO_EDITOR_ROLES.has(role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: existing, error: fetchError } = await supabase
        .from('roi_scenarios')
        .select('id, name, audience_label')
        .eq('id', scenarioId)
        .eq('organization', organization)
        .maybeSingle();

    if (fetchError) {
        console.error('Error loading ROI scenario for deletion:', fetchError);
        return NextResponse.json({ error: 'Failed to delete ROI scenario' }, { status: 500 });
    }

    if (!existing) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
        .from('roi_scenarios')
        .delete()
        .eq('id', scenarioId)
        .eq('organization', organization);

    if (deleteError) {
        console.error('Error deleting ROI scenario:', deleteError);
        return NextResponse.json({ error: 'Failed to delete ROI scenario' }, { status: 500 });
    }

    try {
        await supabase.from('team_activity').insert({
            team_member_id: membershipResult.membership.id,
            action_type: 'roi_scenario_saved',
            action_details: {
                scenario_id: scenarioId,
                name: existing.name,
                audience_label: existing.audience_label,
                action: 'delete',
            },
            entity_type: 'roi_scenario',
            entity_id: scenarioId,
        });
    } catch (activityError) {
        console.warn('Unable to record ROI scenario deletion activity:', activityError);
    }

    return NextResponse.json({ success: true });
}
