-- Create analytics_events table for audience-aware event tracking
-- This table stores analytics events with audience context

CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    audience TEXT NOT NULL CHECK (audience IN ('k12', 'highered')),
    user_id TEXT,
    session_id TEXT,
    properties JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_audience ON analytics_events(audience);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_audience_timestamp ON analytics_events(audience, timestamp);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_audience_timestamp 
    ON analytics_events(event_name, audience, timestamp DESC);

-- Create GIN index for properties JSON queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- Add RLS policies for security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service accounts and admins can access all events
CREATE POLICY "Service accounts can access all analytics events" ON analytics_events
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Policy: Users can only access their own events (if user_id is set)
CREATE POLICY "Users can access their own analytics events" ON analytics_events
    FOR SELECT USING (
        user_id IS NULL OR user_id = auth.uid()::text
    );

-- Policy: Allow insertions for analytics collection (with proper validation)
CREATE POLICY "Allow analytics event insertion" ON analytics_events
    FOR INSERT WITH CHECK (
        -- Basic validation: event_name and audience must be provided
        event_name IS NOT NULL AND 
        audience IS NOT NULL AND 
        timestamp IS NOT NULL
    );

-- Create materialized view for common analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_summary AS
SELECT 
    audience,
    event_name,
    DATE(timestamp) as event_date,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
    COUNT(DISTINCT session_id) FILTER (WHERE session_id IS NOT NULL) as unique_sessions,
    MIN(timestamp) as first_event,
    MAX(timestamp) as last_event
FROM analytics_events
GROUP BY audience, event_name, DATE(timestamp);

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_summary_unique 
    ON analytics_summary(audience, event_name, event_date);

-- Create function to refresh analytics summary
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_summary;
END;
$$;

-- Create function to clean up old analytics events (optional - for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE analytics_events IS 'Stores audience-aware analytics events for tracking user behavior and feature usage';
COMMENT ON COLUMN analytics_events.event_name IS 'Name of the analytics event (e.g., dashboard_view, assessment_started)';
COMMENT ON COLUMN analytics_events.audience IS 'Audience type: k12 for K-12 districts, highered for higher education';
COMMENT ON COLUMN analytics_events.user_id IS 'User ID if the event is associated with an authenticated user';
COMMENT ON COLUMN analytics_events.session_id IS 'Session ID for tracking user sessions across events';
COMMENT ON COLUMN analytics_events.properties IS 'Additional event properties stored as JSON';
COMMENT ON COLUMN analytics_events.timestamp IS 'Client-side timestamp when the event occurred';
COMMENT ON COLUMN analytics_events.ip_address IS 'IP address of the client (for security and fraud detection)';
COMMENT ON COLUMN analytics_events.user_agent IS 'User agent string (for device/browser analytics)';
COMMENT ON COLUMN analytics_events.referer IS 'HTTP referer header (for traffic source analytics)';

COMMENT ON MATERIALIZED VIEW analytics_summary IS 'Materialized view providing daily aggregated analytics data by audience and event type';
COMMENT ON FUNCTION refresh_analytics_summary() IS 'Function to refresh the analytics summary materialized view';
COMMENT ON FUNCTION cleanup_old_analytics_events(INTEGER) IS 'Function to clean up analytics events older than specified retention period';