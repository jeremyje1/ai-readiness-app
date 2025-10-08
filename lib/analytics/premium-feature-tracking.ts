"use client";

import { createClient } from '@/lib/supabase/browser-client';

export type PremiumFeature =
    | 'premium_dashboard'
    | 'ai_trends_report'
    | 'policy_library'
    | 'team_workspace'
    | 'expert_sessions'
    | 'progress_tracker'
    | 'roi_calculator'
    | 'team_invite';

export type FeatureAction =
    | 'view'
    | 'interact'
    | 'download'
    | 'share'
    | 'export'
    | 'invite'
    | 'schedule';

interface TrackingEvent {
    userId: string;
    feature: PremiumFeature;
    action: FeatureAction;
    metadata?: Record<string, any>;
    timestamp?: string;
}

export class PremiumFeatureTracker {
    private static instance: PremiumFeatureTracker;
    private supabase = createClient();
    private eventQueue: TrackingEvent[] = [];
    private flushInterval: ReturnType<typeof setInterval> | null = null;

    private constructor() {
        // Flush events every 30 seconds
        this.flushInterval = setInterval(() => {
            this.flushEvents();
        }, 30000);
    }

    static getInstance(): PremiumFeatureTracker {
        if (!PremiumFeatureTracker.instance) {
            PremiumFeatureTracker.instance = new PremiumFeatureTracker();
        }
        return PremiumFeatureTracker.instance;
    }

    async track(event: TrackingEvent) {
        // Add timestamp
        const eventWithTimestamp = {
            ...event,
            timestamp: new Date().toISOString()
        };

        // Add to queue
        this.eventQueue.push(eventWithTimestamp);

        // Flush if queue is getting large
        if (this.eventQueue.length >= 10) {
            await this.flushEvents();
        }
    }

    private async flushEvents() {
        if (this.eventQueue.length === 0) return;

        const eventsToFlush = [...this.eventQueue];
        this.eventQueue = [];

        try {
            // Batch insert events
            const { error } = await this.supabase
                .from('premium_feature_usage')
                .insert(
                    eventsToFlush.map(event => ({
                        user_id: event.userId,
                        feature: event.feature,
                        action: event.action,
                        metadata: event.metadata || {},
                        timestamp: event.timestamp
                    }))
                );

            if (error) {
                console.error('Failed to track premium features:', error);
                // Re-add events to queue on failure
                this.eventQueue.unshift(...eventsToFlush);
            }
        } catch (error) {
            console.error('Error flushing events:', error);
            // Re-add events to queue on failure
            this.eventQueue.unshift(...eventsToFlush);
        }
    }

    // Clean up on unmount
    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
        // Flush remaining events
        this.flushEvents();
    }
}

// Convenience tracking functions
export const trackPremiumFeature = async (
    feature: PremiumFeature,
    action: FeatureAction,
    metadata?: Record<string, any>
) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const tracker = PremiumFeatureTracker.getInstance();
        await tracker.track({
            userId: user.id,
            feature,
            action,
            metadata
        });
    }
};

// Analytics query functions
export async function getPremiumFeatureUsage(userId?: string) {
    const supabase = createClient();

    let query = supabase
        .from('premium_feature_usage')
        .select('*')
        .order('timestamp', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching usage data:', error);
        return [];
    }

    return data || [];
}

export async function getFeatureEngagementMetrics() {
    const supabase = createClient();

    // Get usage counts by feature
    const { data: featureCounts } = await supabase
        .from('premium_feature_usage')
        .select('feature')
        .order('timestamp', { ascending: false })
        .limit(1000);

    // Calculate engagement metrics
    const engagement: Record<PremiumFeature, number> = {
        premium_dashboard: 0,
        ai_trends_report: 0,
        policy_library: 0,
        team_workspace: 0,
        expert_sessions: 0,
        progress_tracker: 0,
        roi_calculator: 0,
        team_invite: 0
    };

    if (featureCounts) {
        featureCounts.forEach((record: { feature: string }) => {
            if (record.feature in engagement) {
                engagement[record.feature as PremiumFeature]++;
            }
        });
    }

    return engagement;
}

export async function getMostEngagedUsers() {
    const supabase = createClient();

    // Get user engagement counts
    const { data } = await supabase
        .from('premium_feature_usage')
        .select('user_id')
        .order('timestamp', { ascending: false })
        .limit(500);

    if (!data) return [];

    // Count engagements per user
    const userCounts: Record<string, number> = {};
    data.forEach((record: { user_id: string }) => {
        userCounts[record.user_id] = (userCounts[record.user_id] || 0) + 1;
    });

    // Sort by engagement
    return Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
}

// React hooks for tracking
export function useTrackPremiumFeature() {
    return {
        trackView: (feature: PremiumFeature, metadata?: Record<string, any>) =>
            trackPremiumFeature(feature, 'view', metadata),

        trackInteraction: (feature: PremiumFeature, metadata?: Record<string, any>) =>
            trackPremiumFeature(feature, 'interact', metadata),

        trackDownload: (feature: PremiumFeature, metadata?: Record<string, any>) =>
            trackPremiumFeature(feature, 'download', metadata),

        trackShare: (feature: PremiumFeature, metadata?: Record<string, any>) =>
            trackPremiumFeature(feature, 'share', metadata),

        trackExport: (feature: PremiumFeature, metadata?: Record<string, any>) =>
            trackPremiumFeature(feature, 'export', metadata),

        trackInvite: (feature: PremiumFeature, metadata?: Record<string, any>) =>
            trackPremiumFeature(feature, 'invite', metadata),

        trackSchedule: (feature: PremiumFeature, metadata?: Record<string, any>) =>
            trackPremiumFeature(feature, 'schedule', metadata),
    };
}