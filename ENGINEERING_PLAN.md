# Engineering Plan - AI Blueprint Platform Features

Version: 1.0.0  
Date: August 25, 2025  
Author: Staff Software Engineer + Delivery Architect

## Executive Summary

This plan details the implementation of critical platform features to deliver on marketing promises and provide tangible client value through automated document processing, approval workflows, vendor vetting, executive dashboards, and policy update monitoring.

---

## Feature #2: Assessment 2.0 - Document Processing Pipeline

### Problem Statement
Marketing claims "Upload Policy → Instant Analysis" but no document processing exists. Clients need to upload their policies and receive gap analysis, redlined drafts, and implementation plans.

### User Stories
- As an administrator, I upload institution policies and receive automated gap analysis
- As a compliance officer, I get redlined policy drafts aligned with frameworks  
- As an executive, I download a complete artifact pack for board presentation

### Non-Goals
- OCR for scanned documents (v2 feature)
- Multi-language support (v2 feature)
- Real-time collaborative editing

### Data Model
```typescript
// New tables needed
interface DocumentUpload {
  id: string;
  userId: string;
  institutionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageUrl: string;
  status: 'uploaded' | 'scanning' | 'processing' | 'complete' | 'failed';
  piiDetected: boolean;
  piiRedactedUrl?: string;
  createdAt: Date;
  processedAt?: Date;
}

interface ProcessingResult {
  id: string;
  uploadId: string;
  extractedText: string;
  entities: JsonValue; // Named entities found
  frameworks: string[]; // Applicable frameworks
  gaps: GapAnalysis[];
  redlines: PolicyRedline[];
  artifacts: GeneratedArtifact[];
}

interface GapAnalysis {
  id: string;
  section: string;
  requirement: string;
  currentState: string;
  gap: string;
  risk: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
}

interface PolicyRedline {
  id: string;
  section: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
  framework: string;
}

interface GeneratedArtifact {
  id: string;
  type: 'gap-analysis' | 'policy-draft' | 'board-deck' | 'implementation-plan';
  format: 'pdf' | 'docx' | 'pptx' | 'xlsx';
  title: string;
  storageUrl: string;
  signedUrl?: string;
  expiresAt?: Date;
}
```

### API Routes
```typescript
// POST /api/assessment-2/upload
// Handles file upload with virus scanning
{
  file: File,
  institutionId: string,
  documentType: 'policy' | 'handbook' | 'contract'
}

// GET /api/assessment-2/status/:uploadId
// Returns processing status and progress

// POST /api/assessment-2/process/:uploadId
// Triggers async processing pipeline

// GET /api/assessment-2/results/:uploadId
// Returns complete analysis with artifacts

// POST /api/assessment-2/artifacts/generate
// Generates specific artifact types
{
  uploadId: string,
  artifactType: string,
  options: { format: string, template?: string }
}

// GET /api/assessment-2/artifacts/:artifactId/download
// Returns signed download URL
```

### Background Jobs
```typescript
interface DocumentProcessingJob {
  queue: 'document-processing';
  
  stages: [
    'virus-scan',
    'pii-detection', 
    'text-extraction',
    'entity-recognition',
    'framework-mapping',
    'gap-analysis',
    'redline-generation',
    'artifact-creation'
  ];
  
  retryPolicy: {
    attempts: 3,
    backoff: 'exponential',
    maxDelay: 300000 // 5 min
  };
}
```

### Privacy & Security
- PII scanner runs before any LLM processing
- De-identified text stored separately from originals
- Original documents encrypted at rest
- Audit log for all document access
- 30-day retention with client consent

### Feature Flags
- `assessment-2-enabled`: Master toggle
- `assessment-2-pii-scanner`: Enable PII detection
- `assessment-2-auto-redline`: Enable AI redlining
- `assessment-2-artifact-generation`: Enable downloads

---

## Feature #3: Approvals Workflow

### Problem Statement  
Enterprise clients need formal approval processes for AI policies with audit trails, version control, and e-signatures.

### User Stories
- As a policy owner, I assign approvers and track decisions
- As an approver, I review, comment, and sign off on policies
- As an auditor, I see complete approval history

### Data Model
```typescript
interface ApprovalWorkflow {
  id: string;
  documentId: string;
  ownerId: string;
  title: string;
  description: string;
  status: 'draft' | 'in-review' | 'approved' | 'rejected' | 'expired';
  version: number;
  deadline?: Date;
  createdAt: Date;
  completedAt?: Date;
}

interface ApprovalRequest {
  id: string;
  workflowId: string;
  approverId: string;
  role: string; // 'reviewer' | 'approver' | 'final-approver'
  status: 'pending' | 'approved' | 'rejected' | 'abstained';
  comments?: string;
  decidedAt?: Date;
  signature?: ESignature;
  order: number; // For sequential approvals
}

interface ESignature {
  id: string;
  signerId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  certificateId?: string; // For verified signatures
}

interface ApprovalComment {
  id: string;
  workflowId: string;
  userId: string;
  text: string;
  attachments?: string[];
  createdAt: Date;
  parentId?: string; // For threaded discussions
}
```

### API Routes
```typescript
// POST /api/approvals/workflows
// Create new approval workflow

// GET /api/approvals/workflows/:id
// Get workflow with current status

// POST /api/approvals/workflows/:id/assign
// Assign approvers with roles and order

// POST /api/approvals/workflows/:id/submit
// Submit for approval (locks document)

// POST /api/approvals/requests/:id/decision
// Record approval decision with optional comment

// POST /api/approvals/requests/:id/sign
// Add e-signature to decision

// GET /api/approvals/workflows/:id/history
// Full audit trail with all versions

// POST /api/approvals/workflows/:id/remind
// Send reminder to pending approvers
```

### Background Jobs
- Deadline monitoring and escalation
- Email notifications for assignments
- Reminder emails for pending approvals
- Workflow completion notifications

### Access Control
- Only workflow owner can assign approvers
- Approvers see only their assigned items
- Comments visible to all participants
- Audit trail restricted to admins

---

## Feature #4: Vendor Vetting System

### Problem Statement
Institutions need to evaluate AI vendors against compliance requirements and generate standardized decision briefs.

### User Stories
- As a procurement officer, I submit vendor information for vetting
- As a compliance team, we score vendors against our framework
- As an executive, I receive a one-page decision brief

### Data Model
```typescript
interface VendorSubmission {
  id: string;
  vendorName: string;
  vendorWebsite: string;
  productName: string;
  productCategory: string[];
  submitterId: string;
  status: 'intake' | 'reviewing' | 'scored' | 'approved' | 'rejected';
  intakeForm: JsonValue;
  documents: VendorDocument[];
  createdAt: Date;
}

interface VendorDocument {
  id: string;
  submissionId: string;
  type: 'privacy-policy' | 'terms' | 'security-cert' | 'soc2' | 'other';
  url: string;
  extractedText?: string;
  analysisResults?: JsonValue;
}

interface VendorRiskScore {
  id: string;
  submissionId: string;
  overallScore: number; // 0-100
  categories: {
    dataPrivacy: RiskCategory;
    security: RiskCategory;
    compliance: RiskCategory;
    aiEthics: RiskCategory;
    studentSafety: RiskCategory;
  };
  recommendations: string[];
  concerns: RiskConcern[];
}

interface RiskCategory {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  findings: string[];
}

interface DecisionBrief {
  id: string;
  submissionId: string;
  executiveSummary: string;
  recommendation: 'approve' | 'conditional' | 'reject';
  conditions?: string[];
  keyRisks: string[];
  mitigations: string[];
  alternativeVendors?: string[];
  generatedAt: Date;
  artifactUrl: string;
}
```

### API Routes
```typescript
// POST /api/vendors/submit
// Initial vendor submission

// POST /api/vendors/:id/documents
// Upload vendor documents

// POST /api/vendors/:id/analyze
// Trigger risk analysis

// GET /api/vendors/:id/score
// Get risk scoring results

// POST /api/vendors/:id/decision-brief
// Generate executive decision brief

// GET /api/vendors/library
// Browse pre-vetted vendors
```

### Risk Scoring Algorithm
1. Extract key terms from vendor documents
2. Check against compliance requirements
3. Score each risk category
4. Apply institutional weights
5. Generate recommendations

---

## Feature #5: Executive Dashboards

### Problem Statement
Leadership needs real-time visibility into AI readiness, adoption metrics, and compliance status.

### User Stories
- As an executive, I see overall AI readiness scores
- As a department head, I track adoption in my area
- As compliance, I monitor policy adherence

### Data Model
```typescript
interface DashboardMetric {
  id: string;
  institutionId: string;
  type: 'readiness' | 'adoption' | 'compliance' | 'risk';
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  period: 'daily' | 'weekly' | 'monthly';
  dimensions: JsonValue; // Breakdowns by dept, role, etc
  calculatedAt: Date;
}

interface ReadinessScore {
  overall: number;
  categories: {
    leadership: number;
    infrastructure: number;
    dataGovernance: number;
    academic: number;
    community: number;
  };
  maturityLevel: 1 | 2 | 3 | 4 | 5;
  lastAssessmentDate: Date;
}

interface AdoptionTelemetry {
  id: string;
  eventType: string;
  userId: string;
  metadata: JsonValue;
  timestamp: Date;
  processed: boolean;
}

interface BenchmarkComparison {
  id: string;
  institutionId: string;
  peerGroup: string;
  quarter: string;
  metrics: {
    [key: string]: {
      value: number;
      percentile: number;
      peerAverage: number;
    };
  };
}
```

### API Routes
```typescript
// GET /api/dashboards/executive
// Executive summary with all key metrics

// GET /api/dashboards/readiness
// Detailed readiness scores and trends

// GET /api/dashboards/adoption
// Usage analytics and adoption rates

// GET /api/dashboards/compliance
// Policy adherence and audit status

// GET /api/dashboards/benchmark
// Peer comparison data (anonymized)

// POST /api/telemetry/track
// Collect usage events
```

### Dashboard Components
- Readiness gauge chart
- Adoption funnel visualization  
- Compliance heatmap
- Trend sparklines
- Peer comparison radar
- Alert notifications

### Real-time Updates
- WebSocket connection for live metrics
- 5-minute cache for heavy queries
- Incremental updates for efficiency

---

## Feature #6: Monthly Update Watchers

### Problem Statement
Policies become outdated when frameworks change. Institutions need automatic monitoring and updates.

### User Stories
- As a compliance officer, I'm notified when frameworks change
- As a policy owner, I receive updated redlines automatically
- As an executive, I see which policies need review

### Data Model
```typescript
interface PolicyWatcher {
  id: string;
  institutionId: string;
  policyId: string;
  frameworks: string[]; // NIST, FERPA, etc
  enabled: boolean;
  lastChecked: Date;
  nextCheck: Date;
  notifyEmails: string[];
}

interface FrameworkUpdate {
  id: string;
  framework: string;
  version: string;
  publishedDate: Date;
  summary: string;
  changes: FrameworkChange[];
  detectedAt: Date;
}

interface FrameworkChange {
  section: string;
  type: 'added' | 'modified' | 'removed';
  oldText?: string;
  newText?: string;
  impact: 'high' | 'medium' | 'low';
}

interface PolicyUpdateAlert {
  id: string;
  watcherId: string;
  updateId: string;
  impactedSections: string[];
  suggestedRedlines: PolicyRedline[];
  status: 'pending' | 'reviewed' | 'applied' | 'dismissed';
  createdAt: Date;
}
```

### API Routes
```typescript
// POST /api/watchers/policies
// Enable watching for a policy

// GET /api/watchers/updates
// Check for framework updates

// POST /api/watchers/alerts/:id/review
// Mark alert as reviewed

// POST /api/watchers/alerts/:id/apply
// Apply suggested changes

// GET /api/watchers/calendar
// Upcoming review deadlines
```

### Background Jobs
```typescript
interface FrameworkMonitorJob {
  schedule: '0 6 * * *'; // Daily at 6 AM
  
  tasks: [
    'fetch-nist-updates',
    'fetch-ed-guidance',  
    'fetch-state-updates',
    'compare-versions',
    'generate-redlines',
    'send-notifications'
  ];
}
```

### Update Sources
- NIST AI RMF publications
- U.S. Dept of Education
- State education departments
- Accreditation bodies
- Industry associations

### Feature Flags
- `policy-watchers-enabled`: Master toggle
- `policy-watchers-auto-redline`: Auto-generate updates
- `policy-watchers-frameworks`: Which frameworks to monitor

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Database schema and migrations
- Core API structure
- Authentication/authorization
- Basic UI scaffolding

### Phase 2: Assessment 2.0 (Weeks 3-4)
- Document upload flow
- PII scanning integration
- Text extraction pipeline
- Basic gap analysis

### Phase 3: Artifacts & Approvals (Weeks 5-6)
- PDF/DOCX generation
- Approval workflow engine
- E-signature integration
- Version control

### Phase 4: Intelligence Layer (Weeks 7-8)
- Vendor risk scoring
- Executive dashboards
- Telemetry collection
- Benchmark calculations

### Phase 5: Automation (Weeks 9-10)
- Policy watchers
- Framework monitoring
- Auto-redlining
- Alert system

### Phase 6: Polish & Launch (Weeks 11-12)
- Performance optimization
- Security audit
- Documentation
- Launch preparation

---

## Success Metrics

1. **Technical Health**
   - Test coverage ≥ 80%
   - API response time < 200ms (p95)
   - Zero critical security findings
   - 99.9% uptime

2. **User Value**  
   - Document processing < 2 minutes
   - Artifact generation < 30 seconds
   - Dashboard load time < 1 second
   - Mobile responsive

3. **Business Impact**
   - 50% reduction in manual policy work
   - 90% approval workflow completion rate
   - 75% of institutions enable watchers
   - 4.5+ user satisfaction score

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM API rate limits | High | Implement caching and queuing |
| PII exposure | Critical | Scan before processing, audit logs |
| Document parsing failures | Medium | Fallback to manual review |
| Framework changes | Medium | Version all mappings |
| Scale bottlenecks | High | Design for horizontal scaling |

---

## Security Considerations

1. **Data Protection**
   - Encryption at rest and in transit
   - Row-level security in database
   - Signed URLs with expiration
   - PII tokenization

2. **Access Control**
   - Role-based permissions
   - API rate limiting
   - Session management
   - Audit logging

3. **Compliance**
   - FERPA compliance for student data
   - SOC 2 Type II preparation
   - GDPR data handling
   - Accessibility (WCAG 2.2 AA)

---

## Rollout Strategy

1. **Internal Testing** - 2 weeks with test data
2. **Beta Partners** - 5 institutions, 4 weeks
3. **Gradual Rollout** - 20% weekly increase
4. **General Availability** - All users
5. **Feature Flags** - Control feature exposure
6. **Monitoring** - Real-time dashboards
7. **Support** - Documentation and training

This plan ensures we deliver on marketing promises while maintaining quality, security, and scalability.
