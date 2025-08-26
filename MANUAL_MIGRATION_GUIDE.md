# 🚀 Manual Migration Application Guide

Since automated connection is having issues, here's the **fastest and most reliable** method using the Supabase Dashboard:

## Step 1: First Migration (Currently Open in Editor)

**✅ Apply `020_assessment_2_enhanced.sql`**

1. Copy **ALL 275+ lines** from your currently open file
2. Paste into Supabase SQL Editor (already open in your browser)
3. Click **"Run"**

This migration creates:
- `documents` table (with PII detection)
- `assessments` table (with 6 scoring algorithms)
- `artifacts` table (PDF/DOCX/PPTX generation)
- `document_sections` table
- `pii_detections` table
- `framework_scores` table
- `assessment_metrics` table
- All Row Level Security policies

---

## Step 2: Approval System

**✅ Apply `025_approval_system.sql`**

```sql
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

-- Approval history/audit trail
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    comment TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_approval_history_approval FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_history_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_by ON approvals(created_by);
CREATE INDEX IF NOT EXISTS idx_approvals_subject ON approvals(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_approvals_due_date ON approvals(due_date);

CREATE INDEX IF NOT EXISTS idx_approval_approvers_approval ON approval_approvers(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_approvers_user ON approval_approvers(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_approvers_status ON approval_approvers(has_approved, is_required);

CREATE INDEX IF NOT EXISTS idx_approval_history_approval ON approval_history(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_user ON approval_history(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_created ON approval_history(created_at DESC);

-- Row Level Security
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approvals
CREATE POLICY "Users can view approvals they created or are assigned to approve" ON approvals
    FOR SELECT USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM approval_approvers aa 
            WHERE aa.approval_id = approvals.id 
            AND aa.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create approvals" ON approvals
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Approval creators can update their approvals" ON approvals
    FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for approval_approvers
CREATE POLICY "Users can view approver records for approvals they can see" ON approval_approvers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approvals a 
            WHERE a.id = approval_approvers.approval_id 
            AND (
                a.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM approval_approvers aa2 
                    WHERE aa2.approval_id = a.id 
                    AND aa2.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Approval creators can insert approvers" ON approval_approvers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM approvals a 
            WHERE a.id = approval_approvers.approval_id 
            AND a.created_by = auth.uid()
        )
    );

CREATE POLICY "Approvers can update their own approver records" ON approval_approvers
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for approval_history
CREATE POLICY "Users can view history for approvals they can see" ON approval_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approvals a 
            WHERE a.id = approval_history.approval_id 
            AND (
                a.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM approval_approvers aa 
                    WHERE aa.approval_id = a.id 
                    AND aa.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can insert history entries" ON approval_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to update approval status based on approver decisions
CREATE OR REPLACE FUNCTION update_approval_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the approval status based on approver decisions
    UPDATE approvals 
    SET 
        status = CASE
            WHEN EXISTS (
                SELECT 1 FROM approval_approvers aa 
                WHERE aa.approval_id = NEW.approval_id 
                AND aa.is_required = true 
                AND aa.decision = 'rejected'
            ) THEN 'rejected'
            WHEN EXISTS (
                SELECT 1 FROM approval_approvers aa 
                WHERE aa.approval_id = NEW.approval_id 
                AND aa.is_required = true 
                AND aa.decision = 'changes_requested'
            ) THEN 'changes_requested'
            WHEN NOT EXISTS (
                SELECT 1 FROM approval_approvers aa 
                WHERE aa.approval_id = NEW.approval_id 
                AND aa.is_required = true 
                AND (aa.decision IS NULL OR aa.decision != 'approved')
            ) THEN 'approved'
            ELSE status
        END,
        updated_at = NOW(),
        completed_at = CASE
            WHEN NOT EXISTS (
                SELECT 1 FROM approval_approvers aa 
                WHERE aa.approval_id = NEW.approval_id 
                AND aa.is_required = true 
                AND (aa.decision IS NULL OR aa.decision = 'pending')
            ) THEN NOW()
            ELSE completed_at
        END
    WHERE id = NEW.approval_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update approval status
CREATE TRIGGER trigger_update_approval_status
    AFTER UPDATE OF decision ON approval_approvers
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_status();

-- Function to automatically create history entries
CREATE OR REPLACE FUNCTION create_approval_history_entry()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.decision IS DISTINCT FROM NEW.decision THEN
        INSERT INTO approval_history (
            approval_id, 
            user_id, 
            user_name, 
            user_email, 
            action, 
            comment,
            metadata
        ) VALUES (
            NEW.approval_id,
            NEW.user_id,
            NEW.user_name,
            NEW.user_email,
            CASE 
                WHEN NEW.decision = 'approved' THEN 'approved'
                WHEN NEW.decision = 'rejected' THEN 'rejected'
                WHEN NEW.decision = 'changes_requested' THEN 'requested_changes'
                ELSE 'updated'
            END,
            NEW.comment,
            jsonb_build_object('decision', NEW.decision)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create history entries
CREATE TRIGGER trigger_create_approval_history
    AFTER UPDATE ON approval_approvers
    FOR EACH ROW
    EXECUTE FUNCTION create_approval_history_entry();
```

---

## Step 3: Continue with Next Migrations

After applying the first two, let me know and I'll provide the remaining migrations:
- `026_policy_updates_system.sql`
- `026_vendor_intake_system.sql` 
- `20240820_vendor_vetting_system.sql`

## ✅ Progress Tracking

- [ ] **Step 1**: Apply `020_assessment_2_enhanced.sql` (Assessment 2.0 core)
- [ ] **Step 2**: Apply `025_approval_system.sql` (Approval workflows)
- [ ] **Step 3**: Apply remaining 3 migrations

**Start with Step 1** using the SQL already open in your editor, then let me know when ready for Step 2!
