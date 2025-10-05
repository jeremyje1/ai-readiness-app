import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET: List all blueprints for the authenticated user
export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabase
            .from('blueprints')
            .select(`
        id,
        title,
        version,
        status,
        approval_status,
        generated_at,
        last_updated,
        maturity_level,
        total_budget,
        timeline_preference,
        is_public,
        share_token,
        blueprint_goals!inner (
          primary_goals,
          timeline_preference,
          budget_range
        ),
        assessments!inner (
          id,
          completed_at
        ),
        organizations (
          id,
          name
        ),
        blueprint_progress (
          overall_progress,
          is_on_track
        )
      `, { count: 'exact' })
            .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
            .order('generated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        const { data: blueprints, error, count } = await query;

        if (error) {
            console.error('Error fetching blueprints:', error);
            return NextResponse.json({ error: 'Failed to fetch blueprints' }, { status: 500 });
        }

        return NextResponse.json({
            blueprints: blueprints || [],
            total: count || 0,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error in GET /api/blueprint:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}