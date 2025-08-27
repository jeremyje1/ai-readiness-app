-- Create tables for community and expert session management
-- Supports community join requests and expert session bookings

-- Community join requests table
CREATE TABLE IF NOT EXISTS community_join_requests (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    audience TEXT NOT NULL CHECK (audience IN ('k12', 'highered')),
    user_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'joined', 'rejected', 'expired')),
    slack_invite_sent BOOLEAN DEFAULT FALSE,
    slack_invite_sent_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expert session bookings table
CREATE TABLE IF NOT EXISTS expert_session_bookings (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    audience TEXT NOT NULL CHECK (audience IN ('k12', 'highered')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    booking_method TEXT DEFAULT 'calendly' CHECK (booking_method IN ('calendly', 'direct', 'fallback')),
    calendly_event_uuid TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    price_paid DECIMAL(10,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'free' CHECK (payment_status IN ('free', 'pending', 'paid', 'refunded')),
    notes TEXT,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comments TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community events table (for tracking event registrations)
CREATE TABLE IF NOT EXISTS community_event_registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT NOT NULL,
    user_id TEXT,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    audience TEXT NOT NULL CHECK (audience IN ('k12', 'highered')),
    registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'no_show', 'cancelled')),
    registration_source TEXT DEFAULT 'community_hub',
    attended_at TIMESTAMP WITH TIME ZONE,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comments TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_join_requests_email ON community_join_requests(email);
CREATE INDEX IF NOT EXISTS idx_community_join_requests_audience ON community_join_requests(audience);
CREATE INDEX IF NOT EXISTS idx_community_join_requests_status ON community_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_community_join_requests_created_at ON community_join_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_expert_session_bookings_session_id ON expert_session_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_expert_session_bookings_user_id ON expert_session_bookings(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expert_session_bookings_email ON expert_session_bookings(email);
CREATE INDEX IF NOT EXISTS idx_expert_session_bookings_audience ON expert_session_bookings(audience);
CREATE INDEX IF NOT EXISTS idx_expert_session_bookings_status ON expert_session_bookings(status);
CREATE INDEX IF NOT EXISTS idx_expert_session_bookings_scheduled_at ON expert_session_bookings(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_community_event_registrations_event_id ON community_event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_community_event_registrations_user_id ON community_event_registrations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_event_registrations_email ON community_event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_community_event_registrations_audience ON community_event_registrations(audience);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_community_join_requests_updated_at 
    BEFORE UPDATE ON community_join_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expert_session_bookings_updated_at 
    BEFORE UPDATE ON expert_session_bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_event_registrations_updated_at 
    BEFORE UPDATE ON community_event_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for security
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies for community_join_requests
CREATE POLICY "Users can view their own join requests" ON community_join_requests
    FOR SELECT USING (
        user_id IS NULL OR user_id = auth.uid()::text
    );

CREATE POLICY "Anyone can create join requests" ON community_join_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service accounts can manage all join requests" ON community_join_requests
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Policies for expert_session_bookings
CREATE POLICY "Users can view their own bookings" ON expert_session_bookings
    FOR SELECT USING (
        user_id IS NULL OR user_id = auth.uid()::text
    );

CREATE POLICY "Anyone can create bookings" ON expert_session_bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own bookings" ON expert_session_bookings
    FOR UPDATE USING (
        user_id IS NULL OR user_id = auth.uid()::text
    );

CREATE POLICY "Service accounts can manage all bookings" ON expert_session_bookings
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Policies for community_event_registrations
CREATE POLICY "Users can view their own event registrations" ON community_event_registrations
    FOR SELECT USING (
        user_id IS NULL OR user_id = auth.uid()::text
    );

CREATE POLICY "Anyone can create event registrations" ON community_event_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service accounts can manage all event registrations" ON community_event_registrations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- Create functions for analytics and reporting
CREATE OR REPLACE FUNCTION get_community_stats(target_audience TEXT DEFAULT NULL)
RETURNS TABLE(
    total_join_requests BIGINT,
    pending_requests BIGINT,
    successful_joins BIGINT,
    join_rate NUMERIC,
    requests_by_audience JSONB,
    recent_activity JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_join_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
        COUNT(*) FILTER (WHERE status = 'joined') as successful_joins,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'joined')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as join_rate,
        jsonb_build_object(
            'k12', COUNT(*) FILTER (WHERE audience = 'k12'),
            'highered', COUNT(*) FILTER (WHERE audience = 'highered')
        ) as requests_by_audience,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'email', email,
                    'name', name,
                    'audience', audience,
                    'status', status,
                    'created_at', created_at
                )
                ORDER BY created_at DESC
            )
            FROM community_join_requests 
            WHERE (target_audience IS NULL OR audience = target_audience)
            AND created_at >= NOW() - INTERVAL '7 days'
            LIMIT 10
        ) as recent_activity
    FROM community_join_requests
    WHERE target_audience IS NULL OR audience = target_audience;
END;
$$;

CREATE OR REPLACE FUNCTION get_expert_session_stats(target_audience TEXT DEFAULT NULL)
RETURNS TABLE(
    total_bookings BIGINT,
    confirmed_bookings BIGINT,
    completed_sessions BIGINT,
    total_revenue NUMERIC,
    average_rating NUMERIC,
    bookings_by_audience JSONB,
    popular_sessions JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
        COALESCE(SUM(price_paid), 0) as total_revenue,
        ROUND(AVG(feedback_rating), 2) as average_rating,
        jsonb_build_object(
            'k12', COUNT(*) FILTER (WHERE audience = 'k12'),
            'highered', COUNT(*) FILTER (WHERE audience = 'highered')
        ) as bookings_by_audience,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'session_id', session_id,
                    'booking_count', booking_count,
                    'average_rating', average_rating
                )
            )
            FROM (
                SELECT 
                    session_id,
                    COUNT(*) as booking_count,
                    ROUND(AVG(feedback_rating), 2) as average_rating
                FROM expert_session_bookings
                WHERE (target_audience IS NULL OR audience = target_audience)
                GROUP BY session_id
                ORDER BY COUNT(*) DESC
                LIMIT 5
            ) popular
        ) as popular_sessions
    FROM expert_session_bookings
    WHERE target_audience IS NULL OR audience = target_audience;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE community_join_requests IS 'Tracks requests to join the Slack community with invite status';
COMMENT ON TABLE expert_session_bookings IS 'Manages expert consultation session bookings and payments';
COMMENT ON TABLE community_event_registrations IS 'Tracks registrations for community events and webinars';

COMMENT ON COLUMN community_join_requests.slack_invite_sent IS 'Whether a Slack invitation has been sent';
COMMENT ON COLUMN expert_session_bookings.calendly_event_uuid IS 'UUID from Calendly webhook for event tracking';
COMMENT ON COLUMN expert_session_bookings.price_paid IS 'Amount paid for the session (0 for free sessions)';

COMMENT ON FUNCTION get_community_stats(TEXT) IS 'Returns comprehensive community join statistics by audience';
COMMENT ON FUNCTION get_expert_session_stats(TEXT) IS 'Returns expert session booking and performance statistics';