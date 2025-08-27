/**
 * Metrics Events System
 * Handles event tracking and dashboard metrics updates
 */

import { Audience } from '../audience/deriveAudience';

export interface MetricEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  audience: Audience;
  eventType: MetricEventType;
  timestamp: string;
  data: Record<string, any>;
  source: 'web' | 'api' | 'system';
  metadata?: {
    userAgent?: string;
    referrer?: string;
    ip?: string;
  };
}

export type MetricEventType = 
  | 'assessment_started'
  | 'assessment_answered'
  | 'assessment_completed'
  | 'resource_downloaded'
  | 'resource_viewed'
  | 'expert_session_booked'
  | 'expert_session_attempted'
  | 'community_join_requested'
  | 'community_join_completed'
  | 'template_used'
  | 'dashboard_viewed'
  | 'user_registered'
  | 'subscription_started'
  | 'subscription_completed';

export interface DashboardMetrics {
  userId: string;
  audience: Audience;
  lastUpdated: string;
  metrics: {
    assessmentProgress: number;
    templatesUsed: number;
    expertSessionsBooked: number;
    communityJoined: boolean;
    resourcesDownloaded: number;
    lastActivityDate: string;
    completionScore?: number;
  };
  trends: {
    weeklyActivity: number;
    monthlyProgress: number;
    engagementScore: number;
  };
}

/**
 * Metrics Event Tracker
 */
export class MetricsTracker {
  private eventQueue: MetricEvent[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private readonly flushInterval = 5000; // 5 seconds
  private readonly maxQueueSize = 50;

  /**
   * Track a metrics event
   */
  public track(eventType: MetricEventType, data: Record<string, any>, options?: {
    userId?: string;
    sessionId?: string;
    audience?: Audience;
    immediate?: boolean;
  }): void {
    const event: MetricEvent = {
      id: this.generateEventId(),
      userId: options?.userId,
      sessionId: options?.sessionId,
      audience: options?.audience || 'k12',
      eventType,
      timestamp: new Date().toISOString(),
      data,
      source: 'web',
      metadata: this.getMetadata()
    };

    this.eventQueue.push(event);

    // Immediate flush or schedule batch flush
    if (options?.immediate || this.eventQueue.length >= this.maxQueueSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }

    console.log(`📊 Tracked event: ${eventType}`, { data, userId: options?.userId });
  }

  /**
   * Track assessment progress
   */
  public trackAssessmentProgress(data: {
    sessionId: string;
    questionId: string;
    sectionId: string;
    progressPercent: number;
    userId?: string;
    audience: Audience;
  }): void {
    this.track('assessment_answered', {
      questionId: data.questionId,
      sectionId: data.sectionId,
      progressPercent: data.progressPercent
    }, {
      userId: data.userId,
      sessionId: data.sessionId,
      audience: data.audience
    });
  }

  /**
   * Track resource download
   */
  public trackResourceDownload(data: {
    resourceId: string;
    resourceType: string;
    resourceTitle: string;
    userId?: string;
    audience: Audience;
  }): void {
    this.track('resource_downloaded', {
      resourceId: data.resourceId,
      resourceType: data.resourceType,
      resourceTitle: data.resourceTitle
    }, {
      userId: data.userId,
      audience: data.audience,
      immediate: true // Immediate update for template count
    });
  }

  /**
   * Track expert session booking
   */
  public trackExpertSession(data: {
    sessionType: string;
    calendlyUrl: string;
    success: boolean;
    userId?: string;
    audience: Audience;
  }): void {
    const eventType = data.success ? 'expert_session_booked' : 'expert_session_attempted';
    
    this.track(eventType, {
      sessionType: data.sessionType,
      calendlyUrl: data.calendlyUrl
    }, {
      userId: data.userId,
      audience: data.audience,
      immediate: true // Immediate update for session count
    });
  }

  /**
   * Track community join
   */
  public trackCommunityJoin(data: {
    platform: 'slack' | 'discord';
    success: boolean;
    userId?: string;
    audience: Audience;
  }): void {
    const eventType = data.success ? 'community_join_completed' : 'community_join_requested';
    
    this.track(eventType, {
      platform: data.platform
    }, {
      userId: data.userId,
      audience: data.audience,
      immediate: true
    });
  }

  /**
   * Flush events to server
   */
  private async flush(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Clear pending timeout
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    try {
      const response = await fetch('/api/metrics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Flushed ${events.length} metric events`);

    } catch (error) {
      console.error('❌ Failed to flush metric events:', error);
      // Re-queue events on failure (up to max queue size)
      this.eventQueue = [...events.slice(-this.maxQueueSize), ...this.eventQueue];
    }
  }

  /**
   * Schedule batch flush
   */
  private scheduleFlush(): void {
    if (this.flushTimeout) return;

    this.flushTimeout = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `evt_${timestamp}_${random}`;
  }

  /**
   * Get browser metadata
   */
  private getMetadata() {
    if (typeof window === 'undefined') return undefined;

    return {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      // IP will be added server-side
    };
  }

  /**
   * Force flush all pending events
   */
  public async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Clear all pending events
   */
  public clear(): void {
    this.eventQueue = [];
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
  }
}

/**
 * Global metrics tracker instance
 */
export const metricsTracker = new MetricsTracker();

/**
 * Convenience tracking functions
 */
export const trackAssessmentAnswer = metricsTracker.trackAssessmentProgress.bind(metricsTracker);
export const trackResourceDownload = metricsTracker.trackResourceDownload.bind(metricsTracker);
export const trackExpertSession = metricsTracker.trackExpertSession.bind(metricsTracker);
export const trackCommunityJoin = metricsTracker.trackCommunityJoin.bind(metricsTracker);

/**
 * React hook for metrics tracking
 */
export function useMetricsTracker() {
  return {
    track: metricsTracker.track.bind(metricsTracker),
    trackAssessmentAnswer,
    trackResourceDownload, 
    trackExpertSession,
    trackCommunityJoin,
    forceFlush: metricsTracker.forceFlush.bind(metricsTracker)
  };
}

/**
 * Server-side metrics aggregation
 */
export async function aggregateMetrics(userId: string): Promise<DashboardMetrics | null> {
  try {
    const response = await fetch(`/api/metrics/aggregate?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Failed to aggregate metrics:', error);
    return null;
  }
}

/**
 * Update dashboard metrics immediately
 */
export async function updateDashboardMetrics(
  userId: string,
  updates: Partial<DashboardMetrics['metrics']>
): Promise<boolean> {
  try {
    const response = await fetch('/api/metrics/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        updates,
        timestamp: new Date().toISOString()
      })
    });

    return response.ok;

  } catch (error) {
    console.error('Failed to update dashboard metrics:', error);
    return false;
  }
}