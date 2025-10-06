import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('institution_name, subscription_status')
            .eq('user_id', user.id)
            .single();

        // Check if premium user
        if (profile?.subscription_status !== 'active') {
            return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
        }

        // Get blueprint progress
        const { data: blueprints } = await supabase
            .from('blueprints')
            .select('id, status, generated_at')
            .eq('user_id', user.id)
            .order('generated_at', { ascending: false })
            .limit(1);

        // Calculate mock progress (in production, this would track real implementation)
        const daysSinceBlueprint = blueprints?.[0]?.generated_at
            ? Math.floor((Date.now() - new Date(blueprints[0].generated_at).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        const blueprintProgress = Math.min(Math.floor(daysSinceBlueprint * 2.5), 75); // Mock progress

        // Get team activity (mock data for now)
        const teamActivity = {
            totalMembers: 8,
            activeToday: 3,
            recentActions: [
                { action: 'Blueprint updated', user: 'Sarah Chen', time: '2 hours ago' },
                { action: 'Policy downloaded', user: 'Michael Roberts', time: '1 day ago' },
                { action: 'Task completed', user: 'Lisa Wang', time: '3 hours ago' }
            ]
        };

        // Upcoming events
        const upcomingEvents = [
            {
                id: 1,
                title: 'Monthly Strategy Call',
                type: 'one-on-one',
                date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
                duration: 30
            },
            {
                id: 2,
                title: 'AI Office Hours',
                type: 'group',
                date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
                duration: 60
            }
        ];

        // ROI Calculations (mock data - in production, calculate from actual metrics)
        const roiMetrics = {
            timeSaved: 320, // hours/month
            costReduction: 42000, // $/month
            satisfactionScore: 4.6,
            projectedAnnualROI: 1200000
        };

        return NextResponse.json({
            userName: user.user_metadata?.name || user.email?.split('@')[0] || 'Leader',
            institutionName: profile?.institution_name || 'Your Institution',
            blueprintProgress,
            teamActivity,
            upcomingEvents,
            roiMetrics,
            subscription: {
                status: 'active',
                tier: 'premium',
                monthlyValue: 199
            }
        });

    } catch (error) {
        console.error('Error fetching premium metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard metrics' },
            { status: 500 }
        );
    }
}