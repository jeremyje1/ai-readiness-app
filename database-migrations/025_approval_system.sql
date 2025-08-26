-- Migration: Approval System for Policies and Artifacts
-- Version: 1.0.0
-- Date: 2025-08-26

-- Approvals table - main approval records
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type VARCHAR(20) NOT NULL CHECK (subject_type IN ('policy', 'artifact')),
    subject_id VARCHAR(255) NOT NULL,
    subject_title TEXT,
    subject_version VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested', 'rejected')),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    
    -- Indexes
    CONSTRAINT fk_approvals_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Approval approvers - individual approvers for each approval
CREATE TABLE IF NOT EXISTS approval_approvers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    role VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT true,
    has_approved BOOLEAN NOT NULL DEFAULT false,
    approved_at TIMESTAMP WITH TIME ZONE,
    decision VARCHAR(20) CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
    comment TEXT,
    e_signature_signed BOOLEAN DEFAULT false,
    e_signature_signed_at TIMESTAMP WITH TIME ZONE,
    e_signature_ip_address INET,
    e_signature_user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_approval_approvers_approval FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_approvers_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate approvers
    UNIQUE(approval_id, user_id)
);

-- Approval events - audit trail of all approval actions
CREATE TABLE IF NOT EXISTS approval_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL,
    who UUID NOT NULL,
    who_name VARCHAR(255),
    who_email VARCHAR(255),
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'approved', 'rejected', 'requested_changes', 'reassigned', 'comment_added', 'due_date_updated')),
    comment TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT fk_approval_events_approval FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_events_who FOREIGN KEY (who) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Approval comments - separate comments/discussion thread
CREATE TABLE IF NOT EXISTS approval_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    comment TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    
    -- Constraints
    CONSTRAINT fk_approval_comments_approval FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_comments_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Approval notifications - system notifications for approvals
CREATE TABLE IF NOT EXISTS approval_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('approval_request', 'approval_reminder', 'approval_completed', 'approval_overdue', 'changes_requested')),
    approval_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_approval_notifications_approval FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Approval audit logs - detailed audit trail
CREATE TABLE IF NOT EXISTS approval_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Constraints
    CONSTRAINT fk_approval_audit_logs_approval FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_audit_logs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_approvals_subject ON approvals(subject_type, subject_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_created_by ON approvals(created_by);
CREATE INDEX idx_approvals_due_date ON approvals(due_date);
CREATE INDEX idx_approvals_created_at ON approvals(created_at);

CREATE INDEX idx_approval_approvers_approval_id ON approval_approvers(approval_id);
CREATE INDEX idx_approval_approvers_user_id ON approval_approvers(user_id);
CREATE INDEX idx_approval_approvers_has_approved ON approval_approvers(has_approved);
CREATE INDEX idx_approval_approvers_decision ON approval_approvers(decision);

CREATE INDEX idx_approval_events_approval_id ON approval_events(approval_id);
CREATE INDEX idx_approval_events_who ON approval_events(who);
CREATE INDEX idx_approval_events_action ON approval_events(action);
CREATE INDEX idx_approval_events_timestamp ON approval_events(timestamp);

CREATE INDEX idx_approval_comments_approval_id ON approval_comments(approval_id);
CREATE INDEX idx_approval_comments_user_id ON approval_comments(user_id);
CREATE INDEX idx_approval_comments_timestamp ON approval_comments(timestamp);

CREATE INDEX idx_approval_notifications_approval_id ON approval_notifications(approval_id);
CREATE INDEX idx_approval_notifications_recipient_id ON approval_notifications(recipient_id);
CREATE INDEX idx_approval_notifications_type ON approval_notifications(type);
CREATE INDEX idx_approval_notifications_sent ON approval_notifications(sent);

CREATE INDEX idx_approval_audit_logs_approval_id ON approval_audit_logs(approval_id);
CREATE INDEX idx_approval_audit_logs_user_id ON approval_audit_logs(user_id);
CREATE INDEX idx_approval_audit_logs_action ON approval_audit_logs(action);
CREATE INDEX idx_approval_audit_logs_timestamp ON approval_audit_logs(timestamp);

-- Views for common queries

-- Approval summary view
CREATE OR REPLACE VIEW approval_summary AS
SELECT 
    a.id,
    a.subject_type,
    a.subject_id,
    a.subject_title,
    a.status,
    a.created_at,
    a.due_date,
    a.completed_at,
    COUNT(aa.id) as approver_count,
    COUNT(CASE WHEN aa.decision = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN aa.decision = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN aa.decision = 'changes_requested' THEN 1 END) as changes_requested_count,
    COUNT(CASE WHEN aa.decision IS NULL THEN 1 END) as pending_count,
    CASE 
        WHEN a.due_date IS NOT NULL AND a.due_date < NOW() AND a.status = 'pending' 
        THEN true 
        ELSE false 
    END as is_overdue,
    EXTRACT(days FROM NOW() - a.created_at) as days_since_created,
    CASE 
        WHEN a.due_date IS NOT NULL 
        THEN EXTRACT(days FROM a.due_date - NOW()) 
        ELSE NULL 
    END as days_until_due
FROM approvals a
LEFT JOIN approval_approvers aa ON a.id = aa.approval_id
GROUP BY a.id, a.subject_type, a.subject_id, a.subject_title, a.status, a.created_at, a.due_date, a.completed_at;

-- Recent approval activity view
CREATE OR REPLACE VIEW recent_approval_activity AS
SELECT 
    ae.id,
    ae.approval_id,
    ae.who,
    ae.who_name,
    ae.who_email,
    ae.action,
    ae.comment,
    ae.timestamp,
    a.subject_type,
    a.subject_id,
    a.subject_title,
    a.status as approval_status
FROM approval_events ae
JOIN approvals a ON ae.approval_id = a.id
ORDER BY ae.timestamp DESC;

-- User approval workload view
CREATE OR REPLACE VIEW user_approval_workload AS
SELECT 
    aa.user_id,
    aa.user_name,
    aa.user_email,
    COUNT(*) as total_approvals,
    COUNT(CASE WHEN aa.decision IS NULL AND a.status = 'pending' THEN 1 END) as pending_approvals,
    COUNT(CASE WHEN aa.decision = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN aa.decision = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN aa.decision = 'changes_requested' THEN 1 END) as changes_requested_count,
    COUNT(CASE WHEN a.due_date < NOW() AND aa.decision IS NULL AND a.status = 'pending' THEN 1 END) as overdue_approvals
FROM approval_approvers aa
JOIN approvals a ON aa.approval_id = a.id
GROUP BY aa.user_id, aa.user_name, aa.user_email;

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_approval_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_approval_approvers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_approval_updated_at ON approvals;
CREATE TRIGGER trigger_update_approval_updated_at
    BEFORE UPDATE ON approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_updated_at();

DROP TRIGGER IF EXISTS trigger_update_approval_approvers_updated_at ON approval_approvers;
CREATE TRIGGER trigger_update_approval_approvers_updated_at
    BEFORE UPDATE ON approval_approvers
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_approvers_updated_at();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_audit_logs ENABLE ROW LEVEL SECURITY;

-- Approvals policies
CREATE POLICY "Users can view approvals they created or are approvers for" ON approvals
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() IN (SELECT user_id FROM approval_approvers WHERE approval_id = approvals.id)
    );

CREATE POLICY "Users can create approvals" ON approvals
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only creators can update approval metadata" ON approvals
    FOR UPDATE USING (auth.uid() = created_by);

-- Approval approvers policies
CREATE POLICY "Users can view approver info for their approvals" ON approval_approvers
    FOR SELECT USING (
        approval_id IN (
            SELECT id FROM approvals 
            WHERE created_by = auth.uid() OR 
                  id IN (SELECT approval_id FROM approval_approvers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Only approval creators can manage approvers" ON approval_approvers
    FOR ALL USING (
        approval_id IN (SELECT id FROM approvals WHERE created_by = auth.uid())
    );

-- Self-update policy for approvers making decisions
CREATE POLICY "Approvers can update their own decisions" ON approval_approvers
    FOR UPDATE USING (user_id = auth.uid());

-- Events, comments, notifications, and audit logs follow similar patterns
CREATE POLICY "Users can view events for their approvals" ON approval_events
    FOR SELECT USING (
        approval_id IN (
            SELECT id FROM approvals 
            WHERE created_by = auth.uid() OR 
                  id IN (SELECT approval_id FROM approval_approvers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can add events to their approvals" ON approval_events
    FOR INSERT WITH CHECK (
        who = auth.uid() AND
        approval_id IN (
            SELECT id FROM approvals 
            WHERE created_by = auth.uid() OR 
                  id IN (SELECT approval_id FROM approval_approvers WHERE user_id = auth.uid())
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view comments for their approvals" ON approval_comments
    FOR SELECT USING (
        approval_id IN (
            SELECT id FROM approvals 
            WHERE created_by = auth.uid() OR 
                  id IN (SELECT approval_id FROM approval_approvers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can add comments to their approvals" ON approval_comments
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        approval_id IN (
            SELECT id FROM approvals 
            WHERE created_by = auth.uid() OR 
                  id IN (SELECT approval_id FROM approval_approvers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can view their notifications" ON approval_notifications
    FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications" ON approval_notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view audit logs for their approvals" ON approval_audit_logs
    FOR SELECT USING (
        approval_id IN (
            SELECT id FROM approvals 
            WHERE created_by = auth.uid() OR 
                  id IN (SELECT approval_id FROM approval_approvers WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "System can create audit logs" ON approval_audit_logs
    FOR INSERT WITH CHECK (true);
