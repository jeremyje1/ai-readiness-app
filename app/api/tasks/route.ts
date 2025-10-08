import { getOrganizationForUser, hasActivePayment } from '@/lib/payments/access';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const blueprintId = url.searchParams.get('blueprintId');
        const phaseId = url.searchParams.get('phaseId');

        const { organization: organizationFromPayment, payment } = await getOrganizationForUser(supabase, user.id);

        if (!payment || !hasActivePayment(payment)) {
            return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
        }

        const organization =
            organizationFromPayment ||
            user.user_metadata?.organization ||
            (user.email ? user.email.split('@')[1] : null) ||
            `premium-${user.id.slice(0, 8)}`;

        // Get implementation phases
        let phasesQuery = supabase
            .from('implementation_phases')
            .select(`
                *,
                tasks:implementation_tasks(
                    *,
                    assigned_to:team_members(id, full_name, email, avatar_url),
                    comments:task_comments(count)
                )
            `)
            .eq('organization', organization)
            .order('phase_order', { ascending: true });

        if (blueprintId) {
            phasesQuery = phasesQuery.eq('blueprint_id', blueprintId);
        }

        const { data: phases, error: phasesError } = await phasesQuery;

        if (phasesError) {
            console.error('Error fetching phases:', phasesError);
            return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
        }

        // Calculate phase progress
        const phasesWithProgress = phases?.map(phase => {
            const tasks = phase.tasks || [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
                ...phase,
                progress,
                taskStats: {
                    total: totalTasks,
                    completed: completedTasks,
                    inProgress: tasks.filter((t: any) => t.status === 'in_progress').length,
                    blocked: tasks.filter((t: any) => t.status === 'blocked').length
                }
            };
        }) || [];

        return NextResponse.json({
            phases: phasesWithProgress,
            summary: {
                totalPhases: phasesWithProgress.length,
                completedPhases: phasesWithProgress.filter(p => p.status === 'completed').length,
                overallProgress: phasesWithProgress.reduce((sum, p) => sum + p.progress, 0) / (phasesWithProgress.length || 1)
            }
        });

    } catch (error) {
        console.error('Error in tasks API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { phase_id, task_title, description, assigned_to, priority, due_date } = body;

        const { organization: organizationFromPayment, payment } = await getOrganizationForUser(supabase, user.id);

        if (!payment || !hasActivePayment(payment)) {
            return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
        }

        const organization =
            organizationFromPayment ||
            user.user_metadata?.organization ||
            (user.email ? user.email.split('@')[1] : null) ||
            `premium-${user.id.slice(0, 8)}`;

        // Get user's team membership
        const { data: membership } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', user.id)
            .single();

        // Create task
        const { data: task, error: taskError } = await supabase
            .from('implementation_tasks')
            .insert({
                phase_id,
                organization,
                task_title,
                description,
                assigned_to,
                priority,
                due_date,
                status: 'todo'
            })
            .select()
            .single();

        if (taskError) {
            console.error('Error creating task:', taskError);
            return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
        }

        // Log activity
        if (membership) {
            await supabase
                .from('team_activity')
                .insert({
                    team_member_id: membership.id,
                    action_type: 'task_created',
                    action_details: { task_title },
                    entity_type: 'task',
                    entity_id: task.id
                });
        }

        return NextResponse.json(task);

    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { taskId, updates } = body;

        // Get user's team membership
        const { data: membership } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'No team membership found' }, { status: 404 });
        }

        // Update task
        const { data: task, error: updateError } = await supabase
            .from('implementation_tasks')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating task:', updateError);
            return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
        }

        // Log activity if status changed
        if (updates.status) {
            await supabase
                .from('team_activity')
                .insert({
                    team_member_id: membership.id,
                    action_type: `task_${updates.status}`,
                    action_details: { task_title: task.title },
                    entity_type: 'task',
                    entity_id: task.id
                });
        }

        return NextResponse.json(task);

    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}