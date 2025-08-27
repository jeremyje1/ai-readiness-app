/**
 * Metrics Events API Route
 * Handles incoming metric events and updates dashboard metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MetricEvent, DashboardMetrics } from '@/lib/metrics/events';
import { getAudienceCookie } from '@/lib/audience/cookie';

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json() as { events: MetricEvent[] };

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'No events provided' }, { status: 400 });
    }

    // Add server-side metadata
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const enrichedEvents = events.map(event => ({
      ...event,
      metadata: {
        ...event.metadata,
        ip: clientIP,
        server_timestamp: new Date().toISOString()
      }
    }));

    // Store events in database
    const { error: insertError } = await supabase
      .from('analytics_events')
      .insert(enrichedEvents.map(event => ({
        id: event.id,
        user_id: event.userId,
        session_id: event.sessionId,
        audience: event.audience,
        event_type: event.eventType,
        timestamp: event.timestamp,
        data: event.data,
        source: event.source,
        metadata: event.metadata
      })));

    if (insertError) {
      console.error('Failed to insert metric events:', insertError);
      return NextResponse.json({ error: 'Failed to store events' }, { status: 500 });
    }

    // Process events for immediate dashboard updates
    await processEventsForDashboard(enrichedEvents);

    console.log(`✅ Processed ${events.length} metric events`);

    return NextResponse.json({ 
      success: true, 
      processed: events.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Metrics events API error:', error);
    return NextResponse.json(
      { error: 'Failed to process events' },
      { status: 500 }
    );
  }
}

/**
 * Process events for immediate dashboard updates
 */
async function processEventsForDashboard(events: MetricEvent[]): Promise<void> {
  const userUpdates = new Map<string, {
    templatesUsed?: number;
    expertSessionsBooked?: number;
    communityJoined?: boolean;
    resourcesDownloaded?: number;
    assessmentProgress?: number;
  }>();

  // Aggregate events by user
  for (const event of events) {
    if (!event.userId) continue;

    const updates = userUpdates.get(event.userId) || {};

    switch (event.eventType) {
      case 'resource_downloaded':
        if (event.data.resourceType === 'template') {
          updates.templatesUsed = (updates.templatesUsed || 0) + 1;
        }
        updates.resourcesDownloaded = (updates.resourcesDownloaded || 0) + 1;
        break;

      case 'expert_session_booked':
        updates.expertSessionsBooked = (updates.expertSessionsBooked || 0) + 1;
        break;

      case 'community_join_completed':
        updates.communityJoined = true;
        break;

      case 'assessment_answered':
        if (event.data.progressPercent) {
          updates.assessmentProgress = Math.max(
            updates.assessmentProgress || 0,
            event.data.progressPercent
          );
        }
        break;
    }

    userUpdates.set(event.userId, updates);
  }

  // Update dashboard metrics for each user
  for (const [userId, updates] of userUpdates.entries()) {
    await updateUserDashboardMetrics(userId, updates);
  }
}

/**
 * Update dashboard metrics for a user
 */
async function updateUserDashboardMetrics(
  userId: string, 
  updates: Record<string, any>
): Promise<void> {
  try {
    // Get current metrics
    const { data: currentMetrics, error: fetchError } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Failed to fetch current metrics:', fetchError);
      return;
    }

    const now = new Date().toISOString();
    const newMetrics = {
      user_id: userId,
      assessment_progress: updates.assessmentProgress ?? currentMetrics?.assessment_progress ?? 0,
      templates_used: (currentMetrics?.templates_used ?? 0) + (updates.templatesUsed ?? 0),
      expert_sessions_booked: (currentMetrics?.expert_sessions_booked ?? 0) + (updates.expertSessionsBooked ?? 0),
      community_joined: updates.communityJoined ?? currentMetrics?.community_joined ?? false,
      resources_downloaded: (currentMetrics?.resources_downloaded ?? 0) + (updates.resourcesDownloaded ?? 0),
      last_activity_date: now,
      last_updated: now
    };

    // Upsert metrics
    const { error: upsertError } = await supabase
      .from('dashboard_metrics')
      .upsert(newMetrics, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Failed to update dashboard metrics:', upsertError);
    } else {
      console.log(`✅ Updated dashboard metrics for user ${userId}:`, updates);
    }

  } catch (error) {
    console.error('Error updating dashboard metrics:', error);
  }
}