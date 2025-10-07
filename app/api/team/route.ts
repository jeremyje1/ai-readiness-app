import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's institution from their team membership
        const { data: membership } = await supabase
            .from('team_members')
            .select('institution_id')
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'No team membership found' }, { status: 404 });
        }

        // Get all team members for the institution
        const { data: teamMembers, error: teamError } = await supabase
            .from('team_members')
            .select('*')
            .eq('institution_id', membership.institution_id)
            .eq('status', 'active')
            .order('joined_at', { ascending: true });

        if (teamError) {
            console.error('Error fetching team members:', teamError);
            return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
        }

        // Get recent activity for the team
        const { data: recentActivity, error: activityError } = await supabase
            .from('team_activity')
            .select(`
                *,
                team_member:team_members(full_name, email, avatar_url)
            `)
            .in('team_member_id', teamMembers?.map(m => m.id) || [])
            .order('created_at', { ascending: false })
            .limit(10);

        if (activityError) {
            console.error('Error fetching team activity:', activityError);
        }

        return NextResponse.json({
            teamMembers: teamMembers || [],
            recentActivity: recentActivity || [],
            stats: {
                totalMembers: teamMembers?.length || 0,
                activeToday: teamMembers?.filter(m => {
                    const lastActive = new Date(m.last_active_at);
                    const today = new Date();
                    return lastActive.toDateString() === today.toDateString();
                }).length || 0
            }
        });

    } catch (error) {
        console.error('Error in team API:', error);
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
        const { email, full_name, role = 'member', department } = body;

        // Check if user is admin
        const { data: adminCheck } = await supabase
            .from('team_members')
            .select('role, institution_id')
            .eq('user_id', user.id)
            .single();

        if (!adminCheck || !['owner', 'admin'].includes(adminCheck.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Add new team member
        const { data: newMember, error: insertError } = await supabase
            .from('team_members')
            .insert({
                email,
                full_name,
                role,
                department,
                institution_id: adminCheck.institution_id,
                status: 'pending'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error adding team member:', insertError);
            return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
        }

        // Log activity
        await supabase
            .from('team_activity')
            .insert({
                team_member_id: adminCheck.institution_id,
                action_type: 'team_member_added',
                action_details: { added_member: email, added_by: user.email }
            });

        return NextResponse.json(newMember);

    } catch (error) {
        console.error('Error adding team member:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}