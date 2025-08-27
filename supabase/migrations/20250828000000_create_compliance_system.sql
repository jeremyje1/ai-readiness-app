-- Compliance System Database Schema
-- Implements role-based team management and compliance tracking
-- Based on existing core-data-models.ts and user requirements

-- ============================================================================
-- TEAM MANAGEMENT EXTENSIONS
-- ============================================================================

-- Extend user_payments table to include role and department information
ALTER TABLE public.user_payments 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'contributor', 'reviewer', 'viewer')),
ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Create teams table for organizational structure
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID NOT NULL, -- References organization from user context
    name VARCHAR(255) NOT NULL,
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('k12', 'highered', 'both')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table with role-based permissions
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'contributor', 'reviewer', 'viewer')),
    permissions JSONB DEFAULT '{"view": true}', -- Granular permissions per user
    workload_capacity INTEGER DEFAULT 15, -- Max concurrent tasks
    current_workload INTEGER DEFAULT 0,
    department VARCHAR(100),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, user_id)
);

-- ============================================================================
-- COMPLIANCE FRAMEWORK SYSTEM
-- ============================================================================

-- Create frameworks table (extends existing FrameworkMapping concept)
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- FERPA, GLBA, COPPA, etc.
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('k12', 'highered', 'both')),
    description TEXT,
    regulatory_body VARCHAR(255),
    is_federal BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    review_cycle_months INTEGER DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create controls table for specific compliance requirements
CREATE TABLE IF NOT EXISTS public.framework_controls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    framework_id UUID REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., "FERPA-01", "GLBA-3.1"
    title VARCHAR(500) NOT NULL,
    description TEXT,
    complexity_weight DECIMAL(3,2) DEFAULT 1.0, -- For workload calculation
    is_required BOOLEAN DEFAULT true,
    impact_areas TEXT[] DEFAULT '{}',
    typical_evidence TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE TRACKING SYSTEM
-- ============================================================================

-- Create compliance tracking table (main tracking entity)
CREATE TABLE IF NOT EXISTS public.compliance_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID NOT NULL, -- Organization identifier
    control_id UUID REFERENCES public.framework_controls(id) ON DELETE CASCADE,
    
    -- Assignment and ownership
    assigned_to UUID REFERENCES auth.users(id),
    department VARCHAR(100),
    
    -- Status and priority
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review_needed', 'completed', 'flagged', 'overdue')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    
    -- Timeline and progress
    due_date DATE NOT NULL,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Actions and notes
    notes TEXT,
    last_action TEXT,
    next_action TEXT,
    
    -- Dependencies and relationships
    dependencies UUID[] DEFAULT '{}', -- Array of other tracking IDs
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- EVIDENCE AND FINDINGS SYSTEM
-- ============================================================================

-- Create evidence table (extends existing Assessment concept)
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_id UUID REFERENCES public.compliance_tracking(id) ON DELETE CASCADE,
    
    -- Evidence details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('document', 'policy', 'assessment', 'training', 'system', 'process')),
    
    -- File and reference information
    file_url TEXT,
    document_id UUID, -- Reference to existing Document entity if applicable
    external_reference TEXT,
    
    -- Metadata
    uploaded_by UUID REFERENCES auth.users(id),
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    expires_at DATE,
    is_current BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- Create findings table for compliance issues and gaps
CREATE TABLE IF NOT EXISTS public.compliance_findings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_id UUID REFERENCES public.compliance_tracking(id) ON DELETE CASCADE,
    
    -- Finding details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    finding_type VARCHAR(50) NOT NULL CHECK (finding_type IN ('gap', 'risk', 'non_compliance', 'improvement')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Resolution
    remediation TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted', 'deferred')),
    
    -- Assignment and tracking
    identified_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    
    -- Timeline
    target_resolution_date DATE,
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- POLICY CONTROL MAPPINGS
-- ============================================================================

-- Create policy-control mappings (bridges existing Policy entities with Controls)
CREATE TABLE IF NOT EXISTS public.policy_control_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    control_id UUID REFERENCES public.framework_controls(id) ON DELETE CASCADE,
    policy_title VARCHAR(500) NOT NULL, -- Reference to existing policy system
    policy_url TEXT,
    mapping_strength VARCHAR(20) DEFAULT 'full' CHECK (mapping_strength IN ('full', 'partial', 'related')),
    coverage_percentage INTEGER DEFAULT 100 CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
    mapped_by UUID REFERENCES auth.users(id),
    mapped_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VENDOR CONTROL DEPENDENCIES
-- ============================================================================

-- Create vendor-control dependencies (links existing Vendor system to Controls)
CREATE TABLE IF NOT EXISTS public.vendor_control_dependencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    control_id UUID REFERENCES public.framework_controls(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL, -- Reference to existing vendor system
    dependency_type VARCHAR(50) NOT NULL CHECK (dependency_type IN ('required', 'supporting', 'alternative')),
    risk_impact VARCHAR(20) DEFAULT 'medium' CHECK (risk_impact IN ('low', 'medium', 'high', 'critical')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_org_audience ON public.teams(org_id, audience);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members(is_active);

-- Framework indexes
CREATE INDEX IF NOT EXISTS idx_frameworks_audience ON public.compliance_frameworks(audience, is_active);
CREATE INDEX IF NOT EXISTS idx_controls_framework ON public.framework_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_controls_code ON public.framework_controls(code);

-- Tracking indexes
CREATE INDEX IF NOT EXISTS idx_tracking_org_status ON public.compliance_tracking(org_id, status);
CREATE INDEX IF NOT EXISTS idx_tracking_assigned_to ON public.compliance_tracking(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tracking_due_date ON public.compliance_tracking(due_date);
CREATE INDEX IF NOT EXISTS idx_tracking_priority ON public.compliance_tracking(priority);
CREATE INDEX IF NOT EXISTS idx_tracking_control ON public.compliance_tracking(control_id);

-- Evidence and findings indexes
CREATE INDEX IF NOT EXISTS idx_evidence_tracking ON public.compliance_evidence(tracking_id);
CREATE INDEX IF NOT EXISTS idx_evidence_current ON public.compliance_evidence(is_current, expires_at);
CREATE INDEX IF NOT EXISTS idx_findings_tracking ON public.compliance_findings(tracking_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON public.compliance_findings(status, severity);

-- Mapping indexes
CREATE INDEX IF NOT EXISTS idx_policy_mappings_control ON public.policy_control_mappings(control_id);
CREATE INDEX IF NOT EXISTS idx_vendor_dependencies_control ON public.vendor_control_dependencies(control_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framework_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_control_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_control_dependencies ENABLE ROW LEVEL SECURITY;

-- Teams RLS policies
CREATE POLICY "Users can view teams they belong to" ON public.teams
    FOR SELECT USING (
        id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "Team admins can manage their teams" ON public.teams
    FOR ALL USING (
        id IN (SELECT team_id FROM public.team_members 
               WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
    );

-- Team members RLS policies  
CREATE POLICY "Users can view team memberships" ON public.team_members
    FOR SELECT USING (user_id = auth.uid() OR team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND is_active = true
    ));

CREATE POLICY "Team admins can manage memberships" ON public.team_members
    FOR ALL USING (
        team_id IN (SELECT team_id FROM public.team_members 
                   WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
    );

-- Frameworks RLS policies (public read, admin write)
CREATE POLICY "Anyone can view active frameworks" ON public.compliance_frameworks
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage frameworks" ON public.compliance_frameworks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.team_members 
                WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true)
    );

-- Controls RLS policies
CREATE POLICY "Users can view framework controls" ON public.framework_controls
    FOR SELECT USING (
        framework_id IN (SELECT id FROM public.compliance_frameworks WHERE is_active = true)
    );

CREATE POLICY "Admins can manage controls" ON public.framework_controls
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.team_members 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
    );

-- Tracking RLS policies (organization-based)
CREATE POLICY "Users can view org compliance tracking" ON public.compliance_tracking
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM public.team_members tm 
                  JOIN public.teams t ON tm.team_id = t.id 
                  WHERE tm.user_id = auth.uid() AND tm.is_active = true)
    );

CREATE POLICY "Contributors can edit assigned items" ON public.compliance_tracking
    FOR UPDATE USING (
        assigned_to = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.team_members 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
    );

CREATE POLICY "Managers can create tracking items" ON public.compliance_tracking
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.team_members 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
    );

-- Evidence and findings RLS (inherit from tracking)
CREATE POLICY "Users can view evidence for accessible tracking" ON public.compliance_evidence
    FOR SELECT USING (
        tracking_id IN (SELECT id FROM public.compliance_tracking WHERE 
            org_id IN (SELECT org_id FROM public.team_members tm 
                      JOIN public.teams t ON tm.team_id = t.id 
                      WHERE tm.user_id = auth.uid() AND tm.is_active = true))
    );

CREATE POLICY "Users can view findings for accessible tracking" ON public.compliance_findings
    FOR SELECT USING (
        tracking_id IN (SELECT id FROM public.compliance_tracking WHERE 
            org_id IN (SELECT org_id FROM public.team_members tm 
                      JOIN public.teams t ON tm.team_id = t.id 
                      WHERE tm.user_id = auth.uid() AND tm.is_active = true))
    );

-- Mappings RLS policies
CREATE POLICY "Users can view policy mappings" ON public.policy_control_mappings
    FOR SELECT USING (true); -- Public read for mappings

CREATE POLICY "Managers can manage policy mappings" ON public.policy_control_mappings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.team_members 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
    );

CREATE POLICY "Users can view vendor dependencies" ON public.vendor_control_dependencies
    FOR SELECT USING (true); -- Public read for dependencies

CREATE POLICY "Managers can manage vendor dependencies" ON public.vendor_control_dependencies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.team_members 
                WHERE user_id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true)
    );

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Updated timestamp triggers
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frameworks_updated_at
    BEFORE UPDATE ON public.compliance_frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracking_updated_at
    BEFORE UPDATE ON public.compliance_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Workload calculation trigger function
CREATE OR REPLACE FUNCTION update_team_member_workload()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current workload when tracking items are assigned/unassigned
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
        -- Update new assignee workload
        IF NEW.assigned_to IS NOT NULL THEN
            UPDATE public.team_members 
            SET current_workload = (
                SELECT COUNT(*) FROM public.compliance_tracking 
                WHERE assigned_to = NEW.assigned_to 
                AND status NOT IN ('completed', 'cancelled')
            )
            WHERE user_id = NEW.assigned_to;
        END IF;
        
        -- Update old assignee workload if changed
        IF TG_OP = 'UPDATE' AND OLD.assigned_to IS NOT NULL AND OLD.assigned_to != NEW.assigned_to THEN
            UPDATE public.team_members 
            SET current_workload = (
                SELECT COUNT(*) FROM public.compliance_tracking 
                WHERE assigned_to = OLD.assigned_to 
                AND status NOT IN ('completed', 'cancelled')
            )
            WHERE user_id = OLD.assigned_to;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply workload trigger
CREATE TRIGGER update_workload_on_assignment
    AFTER INSERT OR UPDATE OF assigned_to ON public.compliance_tracking
    FOR EACH ROW EXECUTE FUNCTION update_team_member_workload();

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.team_members TO authenticated;
GRANT SELECT ON public.compliance_frameworks TO authenticated;
GRANT SELECT ON public.framework_controls TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.compliance_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.compliance_evidence TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.compliance_findings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.policy_control_mappings TO authenticated;
GRANT SELECT ON public.vendor_control_dependencies TO authenticated;

-- Grant full permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.teams IS 'Organizational teams for compliance management';
COMMENT ON TABLE public.team_members IS 'Team membership with roles and workload tracking';
COMMENT ON TABLE public.compliance_frameworks IS 'Regulatory frameworks (FERPA, GLBA, etc.)';
COMMENT ON TABLE public.framework_controls IS 'Specific compliance controls within frameworks';
COMMENT ON TABLE public.compliance_tracking IS 'Main compliance tracking and assignment table';
COMMENT ON TABLE public.compliance_evidence IS 'Evidence supporting compliance activities';
COMMENT ON TABLE public.compliance_findings IS 'Compliance gaps and issues identified';
COMMENT ON TABLE public.policy_control_mappings IS 'Maps institutional policies to framework controls';
COMMENT ON TABLE public.vendor_control_dependencies IS 'Maps vendor relationships to compliance controls';

COMMENT ON COLUMN public.team_members.workload_capacity IS 'Maximum concurrent tasks this member can handle';
COMMENT ON COLUMN public.team_members.current_workload IS 'Current number of assigned tasks (auto-calculated)';
COMMENT ON COLUMN public.framework_controls.complexity_weight IS 'Weight for workload calculation (1.0 = baseline, 2.0 = double effort)';
COMMENT ON COLUMN public.compliance_tracking.completion_percentage IS 'Progress percentage (0-100)';
COMMENT ON COLUMN public.compliance_tracking.dependencies IS 'Array of other tracking item IDs that must complete first';