import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: List all blueprints for the authenticated user
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query with simplified select to avoid join issues
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
        user_id,
        assessment_id,
        organization_id,
        goals_id
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    const { data: blueprints, error, count } = await query;

    if (error) {
      console.error('Error fetching blueprints:', {
        error,
        message: error.message,
        details: error.details,
        code: error.code,
        userId: user.id,
        status,
        limit,
        offset
      });
      return NextResponse.json({
        error: 'Failed to fetch blueprints',
        details: error.message
      }, { status: 500 });
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