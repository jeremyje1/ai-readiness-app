-- Policy Updates System Migration
-- Handles framework version monitoring and automated redline generation
-- Migration: 026_policy_updates_system

-- Framework metadata tracking
CREATE TABLE IF NOT EXISTS framework_metadata (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    source_url TEXT,
    checksum VARCHAR(64),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'draft')),
    changelog JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Framework changes tracking
CREATE TABLE IF NOT EXISTS framework_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('major', 'minor', 'patch', 'hotfix')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_sections TEXT[] DEFAULT '{}',
    impact_level VARCHAR(20) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
    effective_date TIMESTAMP WITH TIME ZONE,
    requires_redline BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_framework_changes_framework FOREIGN KEY (framework_id) REFERENCES framework_metadata(id) ON DELETE CASCADE
);

-- Policy redline packs for automated updates
CREATE TABLE IF NOT EXISTS policy_redline_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id VARCHAR(100) NOT NULL,
    original_version VARCHAR(50) NOT NULL,
    updated_version VARCHAR(50) NOT NULL,
    framework_change_id UUID NOT NULL,
    changes JSONB NOT NULL DEFAULT '[]',
    approvers TEXT[] DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'sent_for_approval', 'approved', 'rejected')),
    generated_by VARCHAR(20) DEFAULT 'system' CHECK (generated_by IN ('system', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    CONSTRAINT fk_redline_packs_change FOREIGN KEY (framework_change_id) REFERENCES framework_changes(id) ON DELETE CASCADE
);

-- Framework monitoring configuration
CREATE TABLE IF NOT EXISTS framework_monitoring_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id VARCHAR(100) NOT NULL,
    check_interval INTEGER DEFAULT 60, -- minutes
    enabled BOOLEAN DEFAULT true,
    auto_generate_redlines BOOLEAN DEFAULT true,
    notify_approvers BOOLEAN DEFAULT true,
    impact_threshold VARCHAR(20) DEFAULT 'medium' CHECK (impact_threshold IN ('low', 'medium', 'high', 'critical')),
    approvers TEXT[] DEFAULT '{}',
    last_checked TIMESTAMP WITH TIME ZONE,
    next_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_monitoring_config_framework FOREIGN KEY (framework_id) REFERENCES framework_metadata(id) ON DELETE CASCADE,
    UNIQUE(framework_id)
);

-- Policy update notifications
CREATE TABLE IF NOT EXISTS policy_update_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(30) NOT NULL CHECK (type IN ('redline_generated', 'approval_required', 'framework_updated')),
    recipient_id VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    policy_id VARCHAR(100),
    redline_pack_id UUID,
    framework_change_id UUID,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_policy_notifications_redline FOREIGN KEY (redline_pack_id) REFERENCES policy_redline_packs(id) ON DELETE CASCADE,
    CONSTRAINT fk_policy_notifications_change FOREIGN KEY (framework_change_id) REFERENCES framework_changes(id) ON DELETE CASCADE
);

-- Policy update job execution logs
CREATE TABLE IF NOT EXISTS policy_update_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    frameworks_checked INTEGER DEFAULT 0,
    changes_detected INTEGER DEFAULT 0,
    redlines_generated INTEGER DEFAULT 0,
    notifications_sent INTEGER DEFAULT 0,
    errors TEXT[] DEFAULT '{}',
    processing_time INTEGER DEFAULT 0, -- milliseconds
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(job_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_framework_metadata_status ON framework_metadata(status);
CREATE INDEX IF NOT EXISTS idx_framework_metadata_updated ON framework_metadata(updated_at);

CREATE INDEX IF NOT EXISTS idx_framework_changes_framework_id ON framework_changes(framework_id);
CREATE INDEX IF NOT EXISTS idx_framework_changes_impact_level ON framework_changes(impact_level);
CREATE INDEX IF NOT EXISTS idx_framework_changes_effective_date ON framework_changes(effective_date);
CREATE INDEX IF NOT EXISTS idx_framework_changes_requires_redline ON framework_changes(requires_redline);

CREATE INDEX IF NOT EXISTS idx_redline_packs_policy_id ON policy_redline_packs(policy_id);
CREATE INDEX IF NOT EXISTS idx_redline_packs_status ON policy_redline_packs(status);
CREATE INDEX IF NOT EXISTS idx_redline_packs_framework_change ON policy_redline_packs(framework_change_id);
CREATE INDEX IF NOT EXISTS idx_redline_packs_generated_by ON policy_redline_packs(generated_by);
CREATE INDEX IF NOT EXISTS idx_redline_packs_created_at ON policy_redline_packs(created_at);

CREATE INDEX IF NOT EXISTS idx_monitoring_config_framework_id ON framework_monitoring_config(framework_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_config_enabled ON framework_monitoring_config(enabled);
CREATE INDEX IF NOT EXISTS idx_monitoring_config_next_check ON framework_monitoring_config(next_check);

CREATE INDEX IF NOT EXISTS idx_policy_notifications_recipient ON policy_update_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_policy_notifications_type ON policy_update_notifications(type);
CREATE INDEX IF NOT EXISTS idx_policy_notifications_sent ON policy_update_notifications(sent);
CREATE INDEX IF NOT EXISTS idx_policy_notifications_redline_pack ON policy_update_notifications(redline_pack_id);

CREATE INDEX IF NOT EXISTS idx_job_logs_executed_at ON policy_update_job_logs(executed_at);
CREATE INDEX IF NOT EXISTS idx_job_logs_success ON policy_update_job_logs(success);

-- Insert sample framework configurations
INSERT INTO framework_metadata (id, name, version, last_updated, source_url, status) VALUES
('ferpa-2024', 'Family Educational Rights and Privacy Act', '2024.1.0', '2024-01-15T00:00:00Z', 'https://studentprivacy.ed.gov/ferpa', 'active'),
('coppa-2024', 'Children''s Online Privacy Protection Act', '2024.1.0', '2024-01-15T00:00:00Z', 'https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule', 'active'),
('ppra-2024', 'Protection of Pupil Rights Amendment', '2024.1.0', '2024-01-15T00:00:00Z', 'https://studentprivacy.ed.gov/ppra', 'active'),
('nist-ai-rmf', 'NIST AI Risk Management Framework', '1.0', '2024-01-26T00:00:00Z', 'https://www.nist.gov/itl/ai-risk-management-framework', 'active'),
('gdpr-education', 'GDPR for Educational Institutions', '2024.1.0', '2024-01-15T00:00:00Z', 'https://gdpr.eu/', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample monitoring configurations
INSERT INTO framework_monitoring_config (framework_id, check_interval, enabled, auto_generate_redlines, notify_approvers, impact_threshold, approvers) VALUES
('ferpa-2024', 360, true, true, true, 'medium', ARRAY['legal-team', 'privacy-officer', 'superintendent']),
('coppa-2024', 360, true, true, true, 'medium', ARRAY['legal-team', 'privacy-officer']),
('ppra-2024', 720, true, true, true, 'high', ARRAY['legal-team', 'curriculum-director']),
('nist-ai-rmf', 1440, true, true, true, 'medium', ARRAY['cto', 'ai-governance-committee']),
('gdpr-education', 720, true, true, true, 'high', ARRAY['legal-team', 'privacy-officer', 'data-controller'])
ON CONFLICT (framework_id) DO NOTHING;

-- RLS policies (if using Supabase)
ALTER TABLE framework_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_redline_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_monitoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_update_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_update_job_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access to framework metadata for authenticated users
CREATE POLICY "Framework metadata is readable by authenticated users" ON framework_metadata
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow read access to framework changes for authenticated users
CREATE POLICY "Framework changes are readable by authenticated users" ON framework_changes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow system and admin users to manage redline packs
CREATE POLICY "System can manage redline packs" ON policy_redline_packs
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('system', 'admin') OR
        auth.uid()::text = ANY(approvers)
    );

-- Allow admin users to manage monitoring config
CREATE POLICY "Admins can manage monitoring config" ON framework_monitoring_config
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'system'));

-- Allow users to see their notifications
CREATE POLICY "Users can view their notifications" ON policy_update_notifications
    FOR SELECT USING (recipient_id = auth.uid()::text);

-- Allow system to create notifications
CREATE POLICY "System can create notifications" ON policy_update_notifications
    FOR INSERT WITH CHECK (true);

-- Allow system and admin users to view job logs
CREATE POLICY "Admins can view job logs" ON policy_update_job_logs
    FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'system'));
