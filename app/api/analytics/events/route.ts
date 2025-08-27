/**
 * Analytics Events API
 * Receives and stores audience-aware analytics events
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidAudience } from '@/lib/audience/deriveAudience';

interface AnalyticsEvent {
  event: string;
  audience: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const event: AnalyticsEvent = await request.json();
    
    // Validate required fields
    if (!event.event || !event.audience) {
      return NextResponse.json(
        { error: 'Missing required fields: event, audience' },
        { status: 400 }
      );
    }

    // Validate audience
    if (!isValidAudience(event.audience)) {
      return NextResponse.json(
        { error: 'Invalid audience value' },
        { status: 400 }
      );
    }

    // Add server-side metadata
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      server_timestamp: new Date().toISOString(),
      ip_address: request.ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin')
    };

    // Store in database (optional - for detailed analytics)
    try {
      const { error: dbError } = await supabase
        .from('analytics_events')
        .insert({
          event_name: enrichedEvent.event,
          audience: enrichedEvent.audience,
          user_id: enrichedEvent.userId,
          session_id: enrichedEvent.sessionId,
          properties: enrichedEvent.properties || {},
          timestamp: enrichedEvent.timestamp,
          ip_address: enrichedEvent.ip_address,
          user_agent: enrichedEvent.user_agent,
          referer: enrichedEvent.referer
        });

      if (dbError && dbError.code !== '42P01') { // Ignore table not exists error
        console.warn('Failed to store analytics event in database:', dbError);
      }
    } catch (dbError) {
      // Don't fail the request if database storage fails
      console.warn('Analytics database storage error:', dbError);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', {
        event: enrichedEvent.event,
        audience: enrichedEvent.audience,
        userId: enrichedEvent.userId,
        properties: enrichedEvent.properties
      });
    }

    // Send to external analytics services if configured
    await Promise.allSettled([
      // Send to external services like Mixpanel, Amplitude, etc.
      sendToExternalServices(enrichedEvent)
    ]);

    return NextResponse.json({ 
      success: true,
      received: true,
      timestamp: enrichedEvent.server_timestamp
    });

  } catch (error) {
    console.error('Analytics events API error:', error);
    
    // Return success anyway - don't break user experience for analytics failures
    return NextResponse.json({ 
      success: true,
      received: false,
      error: 'Event processing failed but request acknowledged'
    });
  }
}

/**
 * Send events to external analytics services
 */
async function sendToExternalServices(event: any): Promise<void> {
  // Example: Send to Mixpanel
  if (process.env.MIXPANEL_TOKEN) {
    try {
      await fetch('https://api.mixpanel.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: event.event_name,
          properties: {
            ...event.properties,
            audience: event.audience,
            distinct_id: event.user_id || event.session_id,
            time: new Date(event.timestamp).getTime() / 1000
          }
        })
      });
    } catch (error) {
      console.warn('Failed to send to Mixpanel:', error);
    }
  }

  // Example: Send to custom webhook
  if (process.env.ANALYTICS_WEBHOOK_URL) {
    try {
      await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_WEBHOOK_SECRET}`
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send to analytics webhook:', error);
    }
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'analytics-events',
    timestamp: new Date().toISOString()
  });
}