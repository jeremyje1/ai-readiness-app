/**
 * Dynamic Community Events API Route
 * Provides live, regularly updated community events and activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';
import { contentManager } from '@/lib/community/content-manager';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters
    let audience = getAudienceCookie(request) || searchParams.get('audience') as Audience;
    if (!isValidAudience(audience)) {
      audience = 'k12';
    }
    
    const limit = parseInt(searchParams.get('limit') || '5');
    const userId = searchParams.get('userId');
    const includeRecordings = searchParams.get('recordings') === 'true';

    // Get user tier for access control
    const userTier = await getUserTier(userId || undefined);

    // Get upcoming events from content manager
    const upcomingEvents = contentManager.getUpcomingEvents(audience, userTier, limit);

    // Get past events with recordings if requested
    let pastEventsWithRecordings: any[] = [];
    if (includeRecordings) {
      pastEventsWithRecordings = getPastEventsWithRecordings(audience, userTier, 3);
    }

    // Track event views for analytics
    if (userId && upcomingEvents.length > 0) {
      trackEventViews(userId, audience, upcomingEvents.map(e => e.id));
    }

    // Add registration status for user
    const enrichedEvents = await Promise.all(
      upcomingEvents.map(async (event) => ({
        ...event,
        isRegistered: userId ? await checkRegistrationStatus(userId, event.id) : false,
        canRegister: event.currentParticipants < (event.maxParticipants || 999),
        spotsRemaining: event.maxParticipants ? event.maxParticipants - event.currentParticipants : null,
        hostPhotoUrl: event.host.photo || generateHostAvatar(event.host.name),
        materials: event.materials.filter(m => m.type !== 'recording'), // Hide recordings for upcoming events
        hasRecording: false // Will be true after event completes
      }))
    );

    const response = {
      success: true,
      events: enrichedEvents,
      pastEvents: pastEventsWithRecordings,
      total: enrichedEvents.length,
      audience,
      userTier,
      hasMoreEvents: upcomingEvents.length === limit,
      nextEventDate: enrichedEvents[0]?.date || null,
      stats: {
        totalUpcoming: upcomingEvents.length,
        availableSpots: upcomingEvents.reduce((sum, e) => sum + (e.maxParticipants ? e.maxParticipants - e.currentParticipants : 0), 0),
        averageRating: 4.6, // Could calculate from actual ratings
        completionRate: 0.89 // Could calculate from attendance data
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch events',
        events: []
      },
      { status: 500 }
    );
  }
}

/**
 * Handle event registrations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, eventId, userId, registrationData } = body;

    if (!userId || !eventId) {
      return NextResponse.json(
        { success: false, error: 'userId and eventId are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'register':
        const registrationResult = await registerForEvent(userId, eventId, registrationData);
        return NextResponse.json(registrationResult);

      case 'unregister':
        const unregisterResult = await unregisterFromEvent(userId, eventId);
        return NextResponse.json(unregisterResult);

      case 'reminder':
        await setEventReminder(userId, eventId);
        return NextResponse.json({ success: true, message: 'Reminder set' });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Event registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}

/**
 * Get user's subscription tier for event access
 */
async function getUserTier(userId?: string): Promise<'basic' | 'comprehensive' | 'enterprise'> {
  if (!userId) return 'basic';
  
  try {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return subscription?.tier || 'basic';
  } catch (error) {
    console.warn('Could not fetch user tier:', error);
    return 'basic';
  }
}

/**
 * Get past events with available recordings
 */
function getPastEventsWithRecordings(
  audience: Audience, 
  userTier: 'basic' | 'comprehensive' | 'enterprise',
  limit: number
) {
  const now = new Date();
  const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // In a real implementation, this would query a database
  // For now, generate some sample past events
  const pastEvents = [
    {
      id: `past_${audience}_policy_workshop`,
      title: audience === 'k12' ? 'District AI Policy Development' : 'Institutional AI Ethics Policy',
      description: 'Workshop recording and materials from our recent policy development session.',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      type: 'workshop' as const,
      audience,
      host: {
        name: 'Dr. Sarah Chen',
        title: 'Policy Development Expert',
        bio: 'Expert in education AI policy development.'
      },
      recordingAvailable: true,
      materials: [
        {
          title: 'Workshop Recording',
          url: `/api/events/recording/${audience}_policy_workshop`,
          type: 'recording' as const
        },
        {
          title: 'Policy Templates',
          url: `/resources/events/policy_templates.pdf`,
          type: 'resources' as const
        }
      ],
      attendeeCount: 45,
      rating: 4.8,
      canAccess: hasRecordingAccess(userTier)
    }
  ].slice(0, limit);

  return pastEvents;
}

/**
 * Check if user has access to event recordings
 */
function hasRecordingAccess(tier: 'basic' | 'comprehensive' | 'enterprise'): boolean {
  return tier === 'comprehensive' || tier === 'enterprise';
}

/**
 * Track event views for analytics
 */
async function trackEventViews(userId: string, audience: Audience, eventIds: string[]): Promise<void> {
  try {
    const viewData = eventIds.map(eventId => ({
      user_id: userId,
      event_id: eventId,
      audience,
      viewed_at: new Date().toISOString(),
      view_type: 'event_list'
    }));

    await supabase
      .from('event_views')
      .upsert(viewData, { 
        onConflict: 'user_id,event_id,view_type',
        ignoreDuplicates: true 
      });

  } catch (error) {
    console.warn('Failed to track event views:', error);
  }
}

/**
 * Check if user is registered for an event
 */
async function checkRegistrationStatus(userId: string, eventId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('status', 'registered')
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Register user for an event
 */
async function registerForEvent(userId: string, eventId: string, registrationData: any) {
  try {
    // Check if already registered
    const isRegistered = await checkRegistrationStatus(userId, eventId);
    if (isRegistered) {
      return { success: false, error: 'Already registered for this event' };
    }

    // Insert registration
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        user_id: userId,
        event_id: eventId,
        registered_at: new Date().toISOString(),
        status: 'registered',
        registration_data: registrationData
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send confirmation email
    // TODO: Add to calendar
    
    return { 
      success: true, 
      message: 'Successfully registered for event',
      registrationId: data.id
    };

  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to register for event' };
  }
}

/**
 * Unregister user from an event
 */
async function unregisterFromEvent(userId: string, eventId: string) {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('status', 'registered');

    if (error) throw error;

    return { success: true, message: 'Successfully unregistered from event' };

  } catch (error) {
    console.error('Unregistration error:', error);
    return { success: false, error: 'Failed to unregister from event' };
  }
}

/**
 * Set event reminder for user
 */
async function setEventReminder(userId: string, eventId: string): Promise<void> {
  try {
    await supabase
      .from('event_reminders')
      .upsert({
        user_id: userId,
        event_id: eventId,
        reminder_set_at: new Date().toISOString(),
        reminder_type: 'email_24h'
      }, { onConflict: 'user_id,event_id' });

  } catch (error) {
    console.warn('Failed to set event reminder:', error);
  }
}

/**
 * Generate avatar URL for event hosts
 */
function generateHostAvatar(name: string): string {
  const initials = name.split(' ').map(n => n[0]).join('');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff&size=128&bold=true`;
}