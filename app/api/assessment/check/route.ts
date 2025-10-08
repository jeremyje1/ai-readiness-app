import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has completed assessment
        const { data: assessment, error } = await supabase
            .from('streamlined_assessment_responses')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(); // Use maybeSingle instead of single to avoid 406 errors

        if (error) {
            console.error('Error checking assessment:', error);
            return NextResponse.json({ error: 'Failed to check assessment' }, { status: 500 });
        }

        return NextResponse.json({
            hasCompleted: !!assessment,
            assessment: assessment || null
        });

    } catch (error) {
        console.error('Assessment check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}