import { BlueprintService } from '@/lib/blueprint/blueprint-service';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
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
        const scope: 'full' | 'phase' = body.scope === 'phase' ? 'phase' : 'full';
        const phaseNumber = body.phaseNumber;

        const { data: blueprint, error: blueprintError } = await supabase
            .from('blueprints')
            .select('id, user_id, goals_id, assessment_id')
            .eq('id', id)
            .single();

        if (blueprintError || !blueprint) {
            return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
        }

        if (blueprint.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!blueprint.goals_id || !blueprint.assessment_id) {
            return NextResponse.json({ error: 'Blueprint is missing required context for regeneration' }, { status: 400 });
        }

        const [{ data: goals, error: goalsError }, { data: assessment, error: assessmentError }] = await Promise.all([
            supabase
                .from('blueprint_goals')
                .select('*')
                .eq('id', blueprint.goals_id)
                .eq('user_id', user.id)
                .single(),
            supabase
                .from('streamlined_assessment_responses')
                .select('*')
                .eq('id', blueprint.assessment_id)
                .eq('user_id', user.id)
                .single()
        ]);

        if (goalsError || !goals) {
            return NextResponse.json({ error: 'Goals not found' }, { status: 404 });
        }

        if (assessmentError || !assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const blueprintService = new BlueprintService(supabase);

        if (scope === 'phase') {
            if (typeof phaseNumber !== 'number') {
                return NextResponse.json({ error: 'phaseNumber is required to regenerate a phase' }, { status: 400 });
            }

            await blueprintService.regeneratePhase(
                id,
                phaseNumber,
                goals,
                assessment,
                user.id
            );

            return NextResponse.json({
                status: 'updated',
                scope: 'phase',
                phaseNumber,
                message: `Phase ${phaseNumber} regenerated successfully`
            });
        }

        await blueprintService.updateBlueprintStatus(id, 'generating', user.id);

        blueprintService.generateBlueprint(
            id,
            goals,
            assessment,
            user.id
        ).catch(async (error: Error) => {
            console.error('Blueprint regeneration failed:', error);
            await supabase
                .from('blueprints')
                .update({ status: 'draft' })
                .eq('id', id);
        });

        return NextResponse.json({
            status: 'generating',
            scope: 'full',
            message: 'Blueprint regeneration started. This may take a few minutes.'
        }, { status: 202 });
    } catch (error) {
        console.error('Error in POST /api/blueprint/[id]/regenerate:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
