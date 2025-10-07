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
        const startDate = url.searchParams.get('start') || new Date().toISOString();
        const endDate = url.searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const eventType = url.searchParams.get('type');

        // Get user's team membership
        const { data: membership } = await supabase
            .from('team_members')
            .select('id, institution_id')
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'No team membership found' }, { status: 404 });
        }

        // Build query for calendar events
        let eventsQuery = supabase
            .from('calendar_events')
            .select(`
                *,
                host:team_members!calendar_events_host_id_fkey(id, full_name, email, avatar_url),
                rsvps:event_rsvps(
                    *,
                    team_member:team_members(id, full_name, email, avatar_url)
                )
            `)
            .eq('institution_id', membership.institution_id)
            .gte('start_time', startDate)
            .lte('start_time', endDate)
            .order('start_time', { ascending: true });

        if (eventType) {
            eventsQuery = eventsQuery.eq('event_type', eventType);
        }

        const { data: events, error: eventsError } = await eventsQuery;

        if (eventsError) {
            console.error('Error fetching calendar events:', eventsError);
            return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
        }

        // Get user's RSVPs
        const userRsvps = events?.map(event => {
            const userRsvp = event.rsvps?.find((r: any) => r.team_member_id === membership.id);
            return {
                ...event,
                user_rsvp_status: userRsvp?.response || 'not_invited'
            };
        }) || [];

        // Group events by date
        const eventsByDate: Record<string, any[]> = {};
        userRsvps.forEach(event => {
            const dateKey = new Date(event.start_time).toISOString().split('T')[0];
            if (!eventsByDate[dateKey]) {
                eventsByDate[dateKey] = [];
            }
            eventsByDate[dateKey].push(event);
        });

        return NextResponse.json({
            events: userRsvps,
            eventsByDate,
            upcomingCount: userRsvps.filter(e => new Date(e.start_time) > new Date()).length
        });

    } catch (error) {
        console.error('Error in calendar API:', error);
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
        const {
            title,
            description,
            event_type,
            start_time,
            end_time,
            location,
            meeting_url,
            attendee_ids = [],
            max_attendees,
            is_recurring,
            recurrence_rule
        } = body;

        // Get user's team membership
        const { data: membership } = await supabase
            .from('team_members')
            .select('id, institution_id')
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'No team membership found' }, { status: 404 });
        }

        // Create event
        const { data: event, error: eventError } = await supabase
            .from('calendar_events')
            .insert({
                institution_id: membership.institution_id,
                title,
                description,
                event_type,
                start_time,
                end_time,
                location,
                meeting_url,
                host_id: membership.id,
                attendee_ids,
                max_attendees,
                is_recurring,
                recurrence_rule
            })
            .select()
            .single();

        if (eventError) {
            console.error('Error creating event:', eventError);
            return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
        }

        // Create RSVPs for attendees
        if (attendee_ids.length > 0) {
            const rsvps = attendee_ids.map((attendee_id: string) => ({
                event_id: event.id,
                team_member_id: attendee_id,
                response: 'pending'
            }));

            await supabase
                .from('event_rsvps')
                .insert(rsvps);
        }

        // Log activity
        await supabase
            .from('team_activity')
            .insert({
                team_member_id: membership.id,
                action_type: 'event_created',
                action_details: { event_title: title, event_type },
                entity_type: 'event',
                entity_id: event.id
            });

        return NextResponse.json(event);

    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// RSVP to an event
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { eventId, response } = body; // response: 'accepted', 'declined', 'maybe'

        // Get user's team membership
        const { data: membership } = await supabase
            .from('team_members')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'No team membership found' }, { status: 404 });
        }

        // Update or create RSVP
        const { data: rsvp, error: rsvpError } = await supabase
            .from('event_rsvps')
            .upsert({
                event_id: eventId,
                team_member_id: membership.id,
                response,
                responded_at: new Date().toISOString()
            }, {
                onConflict: 'event_id,team_member_id'
            })
            .select()
            .single();

        if (rsvpError) {
            console.error('Error updating RSVP:', rsvpError);
            return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 });
        }

        return NextResponse.json(rsvp);

    } catch (error) {
        console.error('Error updating RSVP:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}