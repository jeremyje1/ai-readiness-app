# Compliance Watchlist System - Implementation Plan

## Current System Analysis

### ✅ Existing Infrastructure 
- **Database**: Supabase with comprehensive `core-data-models.ts` including Vendor, Policy, Assessment, and Framework entities
- **Assessment System**: Active assessment progress tracking with audience-aware (K12/HigherEd) functionality
- **User Management**: Basic user authentication with payment tiers and organization tracking
- **Vendor System**: Existing vendor vetting and approval workflow
- **API Structure**: REST endpoints for vendors, assessments, and dashboard metrics

### 🔄 Required Extensions

Based on the user requirements, we need to extend the existing system with:

## 1. Database Schema Extensions

### Team Management Tables

```sql
-- Extend user_payments table to include role information
ALTER TABLE public.user_payments ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer';
ALTER TABLE public.user_payments ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID NOT NULL, -- References organization from user context
    name VARCHAR(255) NOT NULL,
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('k12', 'highered', 'both')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table with role-based permissions
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'contributor', 'reviewer', 'viewer')),
    permissions JSONB DEFAULT '{}', -- Granular permissions per user
    workload_capacity INTEGER DEFAULT 15, -- Max concurrent tasks
    current_workload INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(team_id, user_id)
);
```

### Compliance Framework Tables

```sql
-- Create frameworks table (extends existing FrameworkMapping concept)
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- FERPA, GLBA, COPPA, etc.
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('k12', 'highered', 'both')),
    description TEXT,
    regulatory_body VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create controls table
CREATE TABLE IF NOT EXISTS public.framework_controls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    framework_id UUID REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g., "FERPA-01", "GLBA-3.1"
    title VARCHAR(500) NOT NULL,
    description TEXT,
    complexity_weight DECIMAL(3,2) DEFAULT 1.0, -- For workload calculation
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create compliance tracking table
CREATE TABLE IF NOT EXISTS public.compliance_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_id UUID NOT NULL,
    control_id UUID REFERENCES public.framework_controls(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review_needed', 'completed', 'flagged', 'overdue')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    due_date DATE NOT NULL,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    notes TEXT,
    last_action TEXT,
    next_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Evidence and Findings Tables

```sql
-- Create evidence table (extends existing Assessment concept)
CREATE TABLE IF NOT EXISTS public.compliance_evidence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_id UUID REFERENCES public.compliance_tracking(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('document', 'policy', 'assessment', 'training', 'system')),
    file_url TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    expires_at DATE,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create findings table
CREATE TABLE IF NOT EXISTS public.compliance_findings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_id UUID REFERENCES public.compliance_tracking(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    finding_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    remediation TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted')),
    identified_by UUID REFERENCES auth.users(id),
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);
```

## 2. API Endpoints Implementation

### Team Management APIs

```typescript
// app/api/compliance/teams/route.ts
export async function GET(request: NextRequest) {
  // Get teams for organization with member details and workload
}

export async function POST(request: NextRequest) {
  // Create new team and assign members
}

// app/api/compliance/teams/[id]/members/route.ts
export async function POST(request: NextRequest) {
  // Add team member with role
}

export async function PATCH(request: NextRequest) {
  // Update member role or workload capacity
}
```

### Compliance Status APIs

```typescript
// app/api/compliance/status/route.ts
export async function GET(request: NextRequest) {
  // Get compliance status with workload calculation:
  // status = computeControlStatus(control, findings, evidence, vendors)
  // workload = calculateWorkload(assignments, complexity, findings, deadlines)
}

// app/api/compliance/frameworks/route.ts  
export async function GET(request: NextRequest) {
  // Get frameworks and controls filtered by audience (K12/HigherEd)
}

// app/api/compliance/tracking/route.ts
export async function POST(request: NextRequest) {
  // Create or update compliance tracking item
  // Auto-calculate workload impact
}

export async function PATCH(request: NextRequest) {
  // Bulk update status, reassign, etc.
}
```

### Integration APIs

```typescript
// app/api/compliance/sync/assessments/route.ts
export async function POST(request: NextRequest) {
  // Sync assessment results to compliance tracking
  // Map assessment domains to framework controls
}

// app/api/compliance/sync/vendors/route.ts  
export async function POST(request: NextRequest) {
  // Sync vendor risk status to affected compliance controls
}
```

## 3. Enhanced Compliance Watchlist Component

### Data Integration Layer

```typescript
// lib/hooks/useComplianceData.ts
export function useComplianceData(orgId: string, audience: string) {
  // Fetch real compliance items from API
  // Calculate workloads using provided formula
  // Integrate with assessment results
  // Handle team assignments
}

// lib/services/ComplianceService.ts
export class ComplianceService {
  static async getComplianceItems(filters: ComplianceFilters): Promise<ComplianceItem[]> {
    // Replace mock data generation with real API calls
  }
  
  static calculateWorkload(assignments: Assignment[], user: User): number {
    // Implement the provided workload formula:
    // workload_hours = (num_controls_assigned * control_complexity_weight) + 
    //                  (num_policies_mapped * policy_complexity_weight) + 
    //                  (num_open_findings * finding_severity_weight) + 
    //                  (evidence_items_due_soon * rush_weight)
  }
  
  static computeComplianceStatus(control: Control, evidence: Evidence[], findings: Finding[]): ComplianceStatus {
    // Implement status logic:
    // if open_findings_high > 0 => 'At Risk'
    // else if control_coverage < threshold => 'Partial'  
    // else if evidence_stale > allowed => 'Needs Update'
    // else 'Compliant'
  }
}
```

### Component Updates

```typescript
// components/ComplianceWatchlistV2.tsx - Replace mock data sections:

// Replace generateTeamMembers() with:
const { data: teamMembers } = useTeamMembers(institution?.id, audience)

// Replace generateRealComplianceItems() with: 
const { data: complianceItems } = useComplianceItems(institution?.id, audience, filters)

// Add real team assignment functionality:
const assignToTeamMember = async (itemId: string, memberId: string) => {
  await ComplianceService.assignItem(itemId, memberId)
  // Recalculate workloads
  // Update UI
}
```

## 4. Permission System Implementation

### Role-Based Access Control

```typescript
// lib/permissions/CompliancePermissions.ts
export const COMPLIANCE_PERMISSIONS = {
  admin: ['view', 'edit', 'approve', 'assign', 'manage_users', 'manage_frameworks'],
  manager: ['view', 'edit', 'approve', 'assign', 'manage_frameworks_audience'],
  contributor: ['view', 'edit'],
  reviewer: ['view', 'approve_comments'], 
  viewer: ['view']
} as const;

export function hasPermission(userRole: string, action: string): boolean {
  return COMPLIANCE_PERMISSIONS[userRole]?.includes(action) ?? false;
}
```

## 5. Default Framework Configuration

### Audience-Specific Defaults

```typescript
// lib/config/ComplianceFrameworks.ts
export const DEFAULT_FRAMEWORKS = {
  highered: [
    { name: 'FERPA', controls: [...] },
    { name: 'GLBA Safeguards', controls: [...] },
    { name: 'Title IX', controls: [...] },
    { name: 'HIPAA', controls: [...] }, // conditional
    { name: 'NIST 800-53', controls: [...] },
    // Add accreditation frameworks per region
  ],
  k12: [
    { name: 'FERPA', controls: [...] },
    { name: 'COPPA', controls: [...] },
    { name: 'CIPA', controls: [...] },
    { name: 'Title IX', controls: [...] },
    { name: 'NIST CSF', controls: [...] },
  ]
};
```

## 6. Implementation Priority Order

### Phase 1: Core Infrastructure (Week 1-2)
1. ✅ Database schema creation and migrations
2. ✅ Basic API endpoints for teams and frameworks  
3. ✅ Permission system implementation
4. ✅ Default framework data seeding

### Phase 2: Data Integration (Week 2-3)
1. ✅ Replace mock data in ComplianceWatchlistV2
2. ✅ Implement workload calculation logic
3. ✅ Assessment results integration
4. ✅ Vendor risk integration  

### Phase 3: UI Enhancement (Week 3-4)
1. ✅ Team management interfaces
2. ✅ Framework configuration forms
3. ✅ Bulk operations implementation
4. ✅ Real-time status updates

### Phase 4: Advanced Features (Week 4+)
1. ✅ Custom frameworks support
2. ✅ Evidence upload and tracking
3. ✅ Automated compliance reporting
4. ✅ Escalation and notification system

## Implementation Commands

```bash
# 1. Create database migrations
supabase migration new compliance_team_management
supabase migration new compliance_frameworks  
supabase migration new compliance_tracking

# 2. Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# 3. Implement API endpoints
mkdir -p app/api/compliance/{teams,frameworks,tracking,status}

# 4. Update components
# Replace mock data with real API calls in ComplianceWatchlistV2.tsx

# 5. Add configuration
# Create default framework data and seed scripts
```

This implementation plan builds entirely on the existing system architecture while adding the specific role-based compliance management features requested. The system will be fully functional with real data instead of mock placeholders.