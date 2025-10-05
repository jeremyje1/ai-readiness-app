import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET: Get blueprint progress
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify access
        const { data: blueprint } = await supabase
            .from('blueprints')
            .select('user_id, shared_with')
            .eq('id', id)
            .single();

        if (!blueprint || (blueprint.user_id !== user.id && !blueprint.shared_with?.includes(user.id))) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get progress
        const { data: progress, error } = await supabase
            .from('blueprint_progress')
            .select('*')
            .eq('blueprint_id', id)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found is ok
            console.error('Error fetching progress:', error);
            return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
        }

        // If no progress record exists, calculate from tasks
        if (!progress) {
            const { data: tasks } = await supabase
                .from('blueprint_tasks')
                .select('status, completion_percentage')
                .eq('blueprint_id', id);

            const totalTasks = tasks?.length || 0;
            const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
            const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return NextResponse.json({
                blueprint_id: id,
                overall_progress: overallProgress,
                tasks_completed: completedTasks,
                tasks_total: totalTasks,
                is_on_track: true,
                last_updated: new Date().toISOString()
            });
        }

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Error in GET /api/blueprint/[id]/progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Update blueprint progress
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Verify ownership
        const { data: blueprint } = await supabase
            .from('blueprints')
            .select('user_id')
            .eq('id', id)
            .single();

        if (!blueprint || blueprint.user_id !== user.id) {
            return NextResponse.json({ error: 'Blueprint not found or unauthorized' }, { status: 404 });
        }

        // Calculate progress from tasks
        const { data: tasks } = await supabase
            .from('blueprint_tasks')
            .select('task_title, status, completion_percentage, estimated_hours, actual_hours')
            .eq('blueprint_id', id);

        const { data: phases } = await supabase
            .from('blueprint_phases')
            .select('id')
            .eq('blueprint_id', id);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;
        const blockedTasks = tasks?.filter(t => t.status === 'blocked').length || 0;

        // Calculate overall progress
        let overallProgress = 0;
        if (totalTasks > 0 && tasks) {
            const taskProgress = tasks.reduce((sum, task) => {
                return sum + (task.completion_percentage || 0);
            }, 0);
            overallProgress = Math.round(taskProgress / totalTasks);
        }

        // Calculate budget spent (simplified - would need actual spending data)
        const estimatedHours = tasks?.reduce((sum, task) => sum + (task.estimated_hours || 0), 0) || 0;
        const actualHours = tasks?.reduce((sum, task) => sum + (task.actual_hours || 0), 0) || 0;
        const effortRatio = estimatedHours > 0 ? actualHours / estimatedHours : 0;

        // Determine if on track
        const isOnTrack = blockedTasks === 0 && effortRatio <= 1.2;

        // Find blockers
        const blockers = tasks
            ?.filter(t => t.status === 'blocked')
            .map(t => `Task blocked: ${t.task_title}`) || [];

        const progressData = {
            blueprint_id: id,
            overall_progress: overallProgress,
            phases_completed: 0, // Would need to calculate based on phase completion
            tasks_completed: completedTasks,
            tasks_total: totalTasks,
            days_elapsed: 0, // Would calculate from blueprint start date
            is_on_track: isOnTrack,
            budget_spent: 0, // Would need actual financial data
            milestones_completed: 0, // Would need milestone tracking
            active_risks: 0, // Would need risk tracking
            open_issues: blockedTasks,
            blockers: blockers,
            last_updated: new Date().toISOString()
        };

        // Upsert progress record
        const { data: progress, error: upsertError } = await supabase
            .from('blueprint_progress')
            .upsert(progressData, { onConflict: 'blueprint_id' })
            .select()
            .single();

        if (upsertError) {
            console.error('Error updating progress:', upsertError);
            return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
        }

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Error in POST /api/blueprint/[id]/progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}