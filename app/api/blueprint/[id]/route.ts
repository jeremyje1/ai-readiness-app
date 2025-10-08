import { createClient } from '@/lib/supabase/server';
import { BlueprintTask } from '@/types/blueprint';
import { NextResponse } from 'next/server';

// GET: Fetch a specific blueprint
export async function GET(
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

        // Fetch the blueprint first without joins
        const { data: blueprint, error } = await supabase
            .from('blueprints')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching blueprint:', error);
            return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
        }

        // Check if user has access (owner or shared with)
        const hasAccess = blueprint.user_id === user.id ||
            blueprint.shared_with?.includes(user.id) ||
            blueprint.is_public;

        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Fetch related data separately to avoid join issues
        // Fetch goals if exists
        if (blueprint.goals_id) {
            const { data: goals } = await supabase
                .from('blueprint_goals')
                .select('*')
                .eq('id', blueprint.goals_id)
                .single();
            if (goals) {
                blueprint.blueprint_goals = goals;
            }
        }

        // Fetch assessment if exists
        if (blueprint.assessment_id) {
            const { data: assessment } = await supabase
                .from('assessments')
                .select('id, completed_at')
                .eq('id', blueprint.assessment_id)
                .single();
            if (assessment) {
                blueprint.assessments = assessment;
            }
        }

        // Fetch organization if exists
        if (blueprint.organization_id) {
            const { data: organization } = await supabase
                .from('organizations')
                .select('id, name, domain')
                .eq('id', blueprint.organization_id)
                .single();
            if (organization) {
                blueprint.organizations = organization;
            }
        }

        // Fetch phases and tasks
        const { data: phases, error: phasesError } = await supabase
            .from('blueprint_phases')
            .select(`
        *,
        blueprint_tasks (*)
      `)
            .eq('blueprint_id', id)
            .order('phase_number');

        if (!phasesError && phases) {
            const priorityOrder: Record<string, number> = {
                critical: 0,
                high: 1,
                medium: 2,
                low: 3
            };

            blueprint.phases = phases.map((phase) => ({
                ...phase,
                objectives: Array.isArray(phase.objectives) ? phase.objectives : [],
                deliverables: Array.isArray(phase.deliverables) ? phase.deliverables : [],
                blueprint_tasks: ((phase.blueprint_tasks || []) as Partial<BlueprintTask>[])
                    .map((task) => ({
                        ...task,
                        assigned_to: task.assigned_to || [],
                        dependencies: task.dependencies || [],
                        blocks: task.blocks || [],
                        deliverables: task.deliverables || [],
                        resources_needed: task.resources_needed || []
                    }))
                    .sort((a, b) => {
                        const priorityComparison = (priorityOrder[a.priority || 'medium'] ?? 3) - (priorityOrder[b.priority || 'medium'] ?? 3);
                        if (priorityComparison !== 0) return priorityComparison;
                        return (a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER) -
                            (b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER);
                    })
            }));
        }

        // Fetch progress if exists
        const { data: progress } = await supabase
            .from('blueprint_progress')
            .select('*')
            .eq('blueprint_id', id)
            .single();

        if (progress) {
            blueprint.progress = progress;
        }

        return NextResponse.json(blueprint);
    } catch (error) {
        console.error('Error in GET /api/blueprint/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update a blueprint
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

        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
            .from('blueprints')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing || existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Blueprint not found or unauthorized' }, { status: 404 });
        }

        // Update the blueprint
        const { data: updatedBlueprint, error: updateError } = await supabase
            .from('blueprints')
            .update({
                ...body,
                last_updated: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating blueprint:', updateError);
            return NextResponse.json({ error: 'Failed to update blueprint' }, { status: 500 });
        }

        return NextResponse.json(updatedBlueprint);
    } catch (error) {
        console.error('Error in PUT /api/blueprint/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a blueprint
export async function DELETE(
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

        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
            .from('blueprints')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing || existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Blueprint not found or unauthorized' }, { status: 404 });
        }

        // Delete related data first (cascade should handle this, but being explicit)
        await supabase.from('blueprint_tasks').delete().eq('blueprint_id', id);
        await supabase.from('blueprint_phases').delete().eq('blueprint_id', id);
        await supabase.from('blueprint_progress').delete().eq('blueprint_id', id);
        await supabase.from('blueprint_comments').delete().eq('blueprint_id', id);

        // Delete the blueprint
        const { error: deleteError } = await supabase
            .from('blueprints')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting blueprint:', deleteError);
            return NextResponse.json({ error: 'Failed to delete blueprint' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Blueprint deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/blueprint/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}