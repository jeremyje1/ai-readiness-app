import { BlueprintGoals } from '@/types/blueprint';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET: Fetch user's blueprint goals
export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const assessmentId = searchParams.get('assessment_id');

        let query = supabase
            .from('blueprint_goals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (assessmentId) {
            query = query.eq('assessment_id', assessmentId);
        }

        const { data: goals, error } = await query;

        if (error) {
            console.error('Error fetching blueprint goals:', error);
            return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
        }

        return NextResponse.json(goals || []);
    } catch (error) {
        console.error('Error in GET /api/blueprint/goals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create new blueprint goals
export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            assessment_id,
            primary_goals,
            department_goals,
            learning_objectives,
            implementation_style,
            pilot_preference,
            training_capacity,
            timeline_preference,
            budget_range
        } = body;

        // Validate required fields
        if (!assessment_id || !primary_goals || primary_goals.length === 0) {
            return NextResponse.json(
                { error: 'Assessment ID and primary goals are required' },
                { status: 400 }
            );
        }

        // Create the goals record
        const goalsData: Partial<BlueprintGoals> = {
            user_id: user.id,
            assessment_id,
            primary_goals,
            department_goals: department_goals || [],
            learning_objectives: learning_objectives || [],
            implementation_style: implementation_style || 'moderate',
            pilot_preference: pilot_preference ?? true,
            training_capacity: training_capacity || 5,
            timeline_preference: timeline_preference || '6months',
            budget_range: budget_range || '50k-100k'
        };

        const { data: newGoals, error: insertError } = await supabase
            .from('blueprint_goals')
            .insert(goalsData)
            .select()
            .single();

        if (insertError) {
            console.error('Error creating blueprint goals:', insertError);
            return NextResponse.json({ error: 'Failed to create goals' }, { status: 500 });
        }

        return NextResponse.json(newGoals, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/blueprint/goals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT: Update existing blueprint goals
export async function PUT(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Goals ID is required' }, { status: 400 });
        }

        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
            .from('blueprint_goals')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing || existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Goals not found or unauthorized' }, { status: 404 });
        }

        // Update the goals
        const { data: updatedGoals, error: updateError } = await supabase
            .from('blueprint_goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating blueprint goals:', updateError);
            return NextResponse.json({ error: 'Failed to update goals' }, { status: 500 });
        }

        return NextResponse.json(updatedGoals);
    } catch (error) {
        console.error('Error in PUT /api/blueprint/goals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete blueprint goals
export async function DELETE(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Goals ID is required' }, { status: 400 });
        }

        // Verify ownership and check for existing blueprints
        const { data: goals, error: fetchError } = await supabase
            .from('blueprint_goals')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !goals || goals.user_id !== user.id) {
            return NextResponse.json({ error: 'Goals not found or unauthorized' }, { status: 404 });
        }

        // Check if there are any blueprints using these goals
        const { count: blueprintCount, error: countError } = await supabase
            .from('blueprints')
            .select('*', { count: 'exact', head: true })
            .eq('goals_id', id);

        if (!countError && blueprintCount && blueprintCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete goals that are used by existing blueprints' },
                { status: 400 }
            );
        }

        // Delete the goals
        const { error: deleteError } = await supabase
            .from('blueprint_goals')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting blueprint goals:', deleteError);
            return NextResponse.json({ error: 'Failed to delete goals' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Goals deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/blueprint/goals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}