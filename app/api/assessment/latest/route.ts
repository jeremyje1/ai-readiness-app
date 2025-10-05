import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/assessment/latest
 * Fetches the most recent assessment for the authenticated user
 */
export async function GET() {
    try {
        const supabase = await createClient();

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('📊 Fetching latest assessment for user:', user.id);

        // Fetch the most recent assessment
        const { data: assessment, error: assessmentError } = await supabase
            .from('streamlined_assessment_responses')
            .select('*')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (assessmentError) {
            console.error('Database error fetching assessment:', assessmentError);
            return NextResponse.json(
                { error: 'Failed to fetch assessment' },
                { status: 500 }
            );
        }

        if (!assessment) {
            console.log('⚠️ No assessment found for user');
            return NextResponse.json(
                { error: 'No assessment found' },
                { status: 404 }
            );
        }

        console.log('✅ Assessment found:', assessment.id);

        return NextResponse.json({
            success: true,
            assessment: {
                id: assessment.id,
                responses: assessment.responses,
                scores: assessment.scores,
                readiness_level: assessment.readiness_level,
                ai_roadmap: assessment.ai_roadmap,
                completed_at: assessment.completed_at,
                created_at: assessment.created_at
            }
        });

    } catch (error: any) {
        console.error('Error in /api/assessment/latest:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
