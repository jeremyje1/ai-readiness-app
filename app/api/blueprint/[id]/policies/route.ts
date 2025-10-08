import { createClient } from '@/lib/supabase/server';
import type { BlueprintPolicyRecommendation, BlueprintPolicyStatus } from '@/types/blueprint';
import { NextResponse } from 'next/server';

const normalizePolicies = (policies: any): BlueprintPolicyRecommendation[] => {
    if (!Array.isArray(policies)) return [];
    return policies as BlueprintPolicyRecommendation[];
};

const ensureOwnership = (userId: string, ownerId?: string) => {
    if (!ownerId || ownerId !== userId) {
        throw new Error('UNAUTHORIZED');
    }
};

const bumpStatus = (status: BlueprintPolicyStatus): BlueprintPolicyStatus => {
    if (status === 'recommended') return 'in_progress';
    return status;
};

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { templateId, clauseId, body: updatedBody, note } = body ?? {};

        if (!templateId || !clauseId || typeof updatedBody !== 'string') {
            return NextResponse.json({ error: 'templateId, clauseId, and body are required' }, { status: 400 });
        }

        const { data: blueprint, error } = await supabase
            .from('blueprints')
            .select('user_id, recommended_policies')
            .eq('id', id)
            .single();

        if (error || !blueprint) {
            return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
        }

        try {
            ensureOwnership(user.id, blueprint.user_id);
        } catch {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const policyData = normalizePolicies(blueprint.recommended_policies);
        const templateIndex = policyData.findIndex((template) => template.templateId === templateId);

        if (templateIndex === -1) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        const template = policyData[templateIndex];
        const clauseIndex = template.clauses.findIndex((clause) => clause.clauseId === clauseId);

        if (clauseIndex === -1) {
            return NextResponse.json({ error: 'Clause not found' }, { status: 404 });
        }

        const clause = template.clauses[clauseIndex];
        const now = new Date().toISOString();
        const nextVersion = (clause.currentVersion ?? clause.metadata.sourceVersion ?? 1) + 1;

        clause.currentVersion = nextVersion;
        clause.currentBody = updatedBody;
        clause.lastEditedAt = now;
        clause.lastEditedBy = user.id;
        clause.revisions = [
            ...(clause.revisions || []),
            {
                version: nextVersion,
                body: updatedBody,
                updatedAt: now,
                updatedBy: user.id,
                note: note || 'Edited inline'
            }
        ];

        template.status = bumpStatus(template.status);
        template.lastEditedAt = now;
        template.lastEditedBy = user.id;

        const { error: updateError } = await supabase
            .from('blueprints')
            .update({
                recommended_policies: policyData,
                last_updated: now
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating policy clause:', updateError);
            return NextResponse.json({ error: 'Failed to update policy clause' }, { status: 500 });
        }

        return NextResponse.json({ policies: policyData });
    } catch (error) {
        console.error('Error updating blueprint policy clause:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, templateId, clauseId, version, status, note } = body ?? {};

        if (!templateId) {
            return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
        }

        const { data: blueprint, error } = await supabase
            .from('blueprints')
            .select('user_id, recommended_policies')
            .eq('id', id)
            .single();

        if (error || !blueprint) {
            return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
        }

        try {
            ensureOwnership(user.id, blueprint.user_id);
        } catch {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const policyData = normalizePolicies(blueprint.recommended_policies);
        const templateIndex = policyData.findIndex((template) => template.templateId === templateId);

        if (templateIndex === -1) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        const template = policyData[templateIndex];

        if (action === 'status') {
            if (!status || !['recommended', 'in_progress', 'ready_for_review', 'approved'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
            }

            template.status = status as BlueprintPolicyStatus;
            template.lastEditedAt = new Date().toISOString();
            template.lastEditedBy = user.id;
        } else if (action === 'revert') {
            if (!clauseId || typeof version !== 'number') {
                return NextResponse.json({ error: 'clauseId and version are required to revert' }, { status: 400 });
            }

            const clauseIndex = template.clauses.findIndex((clause) => clause.clauseId === clauseId);
            if (clauseIndex === -1) {
                return NextResponse.json({ error: 'Clause not found' }, { status: 404 });
            }

            const clause = template.clauses[clauseIndex];
            const targetRevision = (clause.revisions || []).find((revision) => revision.version === version);

            if (!targetRevision) {
                return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
            }

            const now = new Date().toISOString();
            const nextVersion = (clause.currentVersion ?? clause.metadata.sourceVersion ?? 1) + 1;

            clause.currentVersion = nextVersion;
            clause.currentBody = targetRevision.body;
            clause.lastEditedAt = now;
            clause.lastEditedBy = user.id;
            clause.revisions = [
                ...(clause.revisions || []),
                {
                    version: nextVersion,
                    body: targetRevision.body,
                    updatedAt: now,
                    updatedBy: user.id,
                    note: note ? `Reverted to version ${version} - ${note}` : `Reverted to version ${version}`
                }
            ];

            template.status = bumpStatus(template.status);
            template.lastEditedAt = now;
            template.lastEditedBy = user.id;
        } else {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }

        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('blueprints')
            .update({
                recommended_policies: policyData,
                last_updated: now
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating blueprint policy state:', updateError);
            return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
        }

        return NextResponse.json({ policies: policyData });
    } catch (error) {
        console.error('Error applying blueprint policy action:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
