/**
 * Audience-Aware Analytics Service
 * Tracks events with audience context and segmentation
 */

import { Audience } from '../audience/deriveAudience';

export interface AnalyticsEvent {
  event: string;
  audience: Audience;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
  sessionId?: string;
}

export interface AudienceSegmentation {
  audience: Audience;
  organizationType: string;
  userRole?: string;
  institutionSize?: 'small' | 'medium' | 'large';
  location?: string;
}

/**
 * Analytics service with audience awareness
 */
export class AudienceAnalytics {
  private isEnabled: boolean;
  private debugMode: boolean;
  
  constructor(options: { enabled?: boolean; debug?: boolean } = {}) {
    this.isEnabled = options.enabled ?? typeof window !== 'undefined';
    this.debugMode = options.debug ?? false;
  }

  /**
   * Track an event with audience context
   */
  public track(event: string, properties: Record<string, any> = {}, audience: Audience, userId?: string) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      audience,
      userId,
      properties: {
        ...properties,
        audience_type: audience,
        platform: 'ai-blueprint',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    };

    // Send to Google Analytics
    this.sendToGA(analyticsEvent);
    
    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(analyticsEvent);

    if (this.debugMode) {
      console.log('Analytics Event:', analyticsEvent);
    }
  }

  /**
   * Track audience-specific dashboard events
   */
  public trackDashboardView(audience: Audience, userId?: string, additionalProperties?: Record<string, any>) {
    this.track('dashboard_view', {
      page: 'dashboard',
      audience_segment: this.getAudienceSegment(audience),
      ...additionalProperties
    }, audience, userId);
  }

  /**
   * Track assessment events
   */
  public trackAssessmentEvent(
    eventType: 'started' | 'question_answered' | 'section_completed' | 'completed' | 'abandoned',
    audience: Audience,
    userId?: string,
    properties?: {
      assessmentId?: string;
      sectionId?: string;
      questionId?: string;
      score?: number;
      timeSpent?: number;
    }
  ) {
    this.track(`assessment_${eventType}`, {
      assessment_type: `${audience}_readiness`,
      ...properties
    }, audience, userId);
  }

  /**
   * Track resource engagement
   */
  public trackResourceEvent(
    eventType: 'viewed' | 'downloaded' | 'shared' | 'bookmarked',
    resourceId: string,
    resourceType: string,
    audience: Audience,
    userId?: string
  ) {
    this.track(`resource_${eventType}`, {
      resource_id: resourceId,
      resource_type: resourceType,
      resource_audience: audience,
      category: this.getCategoryForResource(resourceType)
    }, audience, userId);
  }

  /**
   * Track navigation and user flow
   */
  public trackNavigation(
    fromPage: string,
    toPage: string,
    audience: Audience,
    userId?: string
  ) {
    this.track('page_navigation', {
      from_page: fromPage,
      to_page: toPage,
      navigation_type: this.getNavigationType(fromPage, toPage)
    }, audience, userId);
  }

  /**
   * Track audience-specific feature usage
   */
  public trackFeatureUsage(
    feature: string,
    action: 'accessed' | 'completed' | 'abandoned',
    audience: Audience,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    this.track(`feature_${action}`, {
      feature_name: feature,
      feature_category: this.getCategoryForFeature(feature),
      audience_context: this.getAudienceContext(audience),
      ...metadata
    }, audience, userId);
  }

  /**
   * Track conversion events
   */
  public trackConversion(
    conversionType: 'assessment_completed' | 'resource_downloaded' | 'account_created' | 'subscription_upgraded',
    value: number,
    audience: Audience,
    userId?: string,
    properties?: Record<string, any>
  ) {
    this.track('conversion', {
      conversion_type: conversionType,
      conversion_value: value,
      currency: 'USD',
      funnel_stage: this.getFunnelStage(conversionType),
      ...properties
    }, audience, userId);
  }

  /**
   * Track errors with audience context
   */
  public trackError(
    error: Error | string,
    context: string,
    audience: Audience,
    userId?: string,
    additionalData?: Record<string, any>
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.track('error_occurred', {
      error_message: errorMessage,
      error_context: context,
      error_stack: errorStack,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...additionalData
    }, audience, userId);
  }

  /**
   * Send event to Google Analytics
   */
  private sendToGA(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, {
        audience: event.audience,
        user_id: event.userId,
        custom_map: {
          audience_type: event.audience
        },
        ...event.properties
      });
    }
  }

  /**
   * Send event to custom analytics endpoint
   */
  private async sendToCustomAnalytics(event: AnalyticsEvent) {
    try {
      if (typeof window !== 'undefined') {
        // Use navigator.sendBeacon for better reliability
        const data = JSON.stringify(event);
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/events', data);
        } else {
          // Fallback to fetch
          fetch('/api/analytics/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true
          }).catch(err => {
            if (this.debugMode) {
              console.warn('Analytics request failed:', err);
            }
          });
        }
      }
    } catch (error) {
      if (this.debugMode) {
        console.warn('Failed to send custom analytics:', error);
      }
    }
  }

  /**
   * Get audience segment information
   */
  private getAudienceSegment(audience: Audience): string {
    return audience === 'k12' ? 'K12_District' : 'Higher_Education';
  }

  /**
   * Get audience context for events
   */
  private getAudienceContext(audience: Audience): Record<string, any> {
    return {
      segment: this.getAudienceSegment(audience),
      terminology: audience === 'k12' ? 'district_focused' : 'institutional_focused',
      use_cases: audience === 'k12' ? ['student_safety', 'curriculum', 'admin'] : ['research', 'academics', 'governance']
    };
  }

  /**
   * Get category for resource type
   */
  private getCategoryForResource(resourceType: string): string {
    const categories: Record<string, string> = {
      template: 'Templates',
      policy: 'Policies',
      guide: 'Guides',
      curriculum: 'Curriculum',
      webinar: 'Training',
      checklist: 'Checklists'
    };
    return categories[resourceType] || 'Other';
  }

  /**
   * Get category for feature
   */
  private getCategoryForFeature(feature: string): string {
    const categories: Record<string, string> = {
      assessment: 'Assessment',
      dashboard: 'Dashboard',
      resources: 'Resources',
      community: 'Community',
      training: 'Training',
      policy: 'Policy'
    };
    return categories[feature] || 'Other';
  }

  /**
   * Get navigation type
   */
  private getNavigationType(from: string, to: string): string {
    if (from === 'home' && to === 'assessment') return 'cta_click';
    if (from === 'dashboard' && to === 'assessment') return 'dashboard_action';
    if (to === 'resources') return 'resource_browse';
    return 'standard_navigation';
  }

  /**
   * Get funnel stage for conversion
   */
  private getFunnelStage(conversionType: string): string {
    const stages: Record<string, string> = {
      'assessment_completed': 'evaluation',
      'resource_downloaded': 'engagement',
      'account_created': 'acquisition',
      'subscription_upgraded': 'monetization'
    };
    return stages[conversionType] || 'other';
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Enable/disable analytics
   */
  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Enable/disable debug mode
   */
  public setDebugMode(debug: boolean) {
    this.debugMode = debug;
  }
}

/**
 * Global analytics instance
 */
let analyticsInstance: AudienceAnalytics | null = null;

/**
 * Get or create analytics instance
 */
export function getAnalytics(): AudienceAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = new AudienceAnalytics({
      enabled: typeof window !== 'undefined',
      debug: process.env.NODE_ENV === 'development'
    });
  }
  return analyticsInstance;
}

/**
 * Convenience function to track events
 */
export function trackEvent(
  event: string, 
  properties: Record<string, any>, 
  audience: Audience, 
  userId?: string
) {
  getAnalytics().track(event, properties, audience, userId);
}

/**
 * React hook for analytics
 */
export function useAudienceAnalytics(audience: Audience, userId?: string) {
  const analytics = getAnalytics();

  return {
    track: (event: string, properties?: Record<string, any>) => 
      analytics.track(event, properties || {}, audience, userId),
    
    trackDashboardView: (properties?: Record<string, any>) =>
      analytics.trackDashboardView(audience, userId, properties),
    
    trackAssessment: (eventType: 'started' | 'question_answered' | 'section_completed' | 'completed' | 'abandoned', properties?: any) =>
      analytics.trackAssessmentEvent(eventType, audience, userId, properties),
    
    trackResource: (eventType: 'viewed' | 'downloaded' | 'shared' | 'bookmarked', resourceId: string, resourceType: string) =>
      analytics.trackResourceEvent(eventType, resourceId, resourceType, audience, userId),
    
    trackNavigation: (fromPage: string, toPage: string) =>
      analytics.trackNavigation(fromPage, toPage, audience, userId),
    
    trackFeature: (feature: string, action: 'accessed' | 'completed' | 'abandoned', metadata?: Record<string, any>) =>
      analytics.trackFeatureUsage(feature, action, audience, userId, metadata),
    
    trackConversion: (conversionType: string, value: number, properties?: Record<string, any>) =>
      analytics.trackConversion(conversionType as any, value, audience, userId, properties),
    
    trackError: (error: Error | string, context: string, additionalData?: Record<string, any>) =>
      analytics.trackError(error, context, audience, userId, additionalData)
  };
}