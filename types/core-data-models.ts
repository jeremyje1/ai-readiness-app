// Core Data Models for AI Governance Platform
// Implements the technical specification with key modules and guardrails

export interface BaseEntity {
  id: string
  orgId: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

// ============================================================================
// DOCUMENT MANAGEMENT & UPLOADS SERVICE
// ============================================================================

export interface Document extends BaseEntity {
  name: string
  type: 'policy' | 'contract' | 'handbook' | 'board_minutes' | 'vendor_agreement' | 'training_material'
  originalFilename: string
  fileSize: number
  mimeType: string
  
  // Security & Compliance
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'failed'
  virusScanTimestamp?: string
  fileHash: string // SHA-256 hash for integrity
  
  // Content Processing
  piiFlags: PIIFlag[]
  extractedText: string
  ocrStatus: 'pending' | 'completed' | 'failed'
  ocrConfidence: number
  
  // Classification & Mapping
  sections: DocumentSection[]
  frameworkTags: FrameworkTag[]
  stateTags: StateTag[]
  
  // Indexing
  vectorIndexId?: string
  searchKeywords: string[]
  
  // Versioning
  versions: DocumentVersion[]
  currentVersion: string
  parentDocumentId?: string // For redlined versions
  
  // Access Control
  accessLevel: 'public' | 'internal' | 'restricted' | 'confidential'
  authorizedRoles: string[]
  
  // Processing Status
  processingStatus: 'uploaded' | 'scanning' | 'processing' | 'completed' | 'failed'
  processingErrors?: string[]
}

export interface PIIFlag {
  id: string
  documentId: string
  detectionType: 'ssn' | 'email' | 'phone' | 'address' | 'student_id' | 'employee_id' | 'financial'
  location: {
    page: number
    line: number
    startChar: number
    endChar: number
  }
  confidence: number
  redactionRequired: boolean
  complianceRisk: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: string
}

export interface DocumentSection {
  id: string
  documentId: string
  sectionNumber: string
  title: string
  content: string
  classification: string
  riskLevel: 'low' | 'medium' | 'high'
  complianceFrameworks: string[]
}

export interface DocumentVersion {
  version: string
  uploadedAt: string
  uploadedBy: string
  changeDescription: string
  filePath: string
  isActive: boolean
}

export interface FrameworkTag {
  framework: 'NIST_AI_RMF' | 'FERPA' | 'COPPA' | 'PPRA' | 'ISO_27001' | 'SOC2'
  controlId: string
  controlTitle: string
  mappingConfidence: number
  requiresAction: boolean
  gapIdentified: boolean
}

export interface StateTag {
  state: string
  regulation: string
  section: string
  requirement: string
  complianceStatus: 'compliant' | 'gap' | 'review_needed' | 'not_applicable'
  lastReviewed: string
}

// ============================================================================
// POLICY ENGINE & TEMPLATE LIBRARY
// ============================================================================

export interface Policy extends BaseEntity {
  templateId: string
  title: string
  description: string
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  jurisdiction: string[] // State codes or 'federal'
  
  // Content
  policyContent: string
  fillableFields: Record<string, string>
  
  // Compliance Mapping
  complianceFrameworks: string[]
  stateRequirements: string[]
  
  // Versioning & Changes
  diffs: PolicyDiff[]
  approvalTrail: PolicyApproval[]
  
  // Implementation
  effectiveDate?: string
  reviewCycle: number // months
  nextReviewDate: string
  responsibleParty: string
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  implementationComplexity: 'simple' | 'moderate' | 'complex'
  
  // Auto-updates
  autoUpdateEnabled: boolean
  lastFrameworkSync: string
  sourceReferences: PolicySource[]
}

export interface PolicyDiff {
  id: string
  version: string
  changeDate: string
  changeType: 'addition' | 'deletion' | 'modification' | 'framework_update'
  section: string
  originalText: string
  newText: string
  rationale: string
  sourceJustification: string
  approvalRequired: boolean
  approvedBy?: string
  approvedAt?: string
}

export interface PolicyApproval {
  id: string
  policyId: string
  approverRole: 'superintendent' | 'provost' | 'counsel' | 'cio' | 'cto' | 'academic_lead' | 'privacy_officer'
  approverName: string
  approverEmail: string
  action: 'approve' | 'reject' | 'request_changes'
  comments: string
  digitalSignature: string
  signedAt: string
  ipAddress: string
  
  // Comment Thread
  commentThread: ApprovalComment[]
  
  // Requirements
  requiredApprovals: string[] // List of required approver roles
  currentApprovals: string[] // List of completed approver roles
  isComplete: boolean
}

export interface ApprovalComment {
  id: string
  authorRole: string
  authorName: string
  comment: string
  timestamp: string
  isResolved: boolean
  responseToId?: string
}

export interface PolicySource {
  framework: string
  documentTitle: string
  section: string
  url: string
  lastChecked: string
  changeDetected: boolean
}

// ============================================================================
// FRAMEWORK MAPPER & COMPLIANCE ENGINE
// ============================================================================

export interface FrameworkMapping {
  id: string
  sourceFramework: 'NIST_AI_RMF' | 'ED_GUIDANCE' | 'STATE_REGULATION'
  targetControl: FrameworkControl
  extractionRules: ExtractionRule[]
  mappingConfidence: number
  lastUpdated: string
  
  // Auto-update Configuration
  monitoringEnabled: boolean
  updateFrequency: 'daily' | 'weekly' | 'monthly'
  alertThreshold: number
}

export interface FrameworkControl {
  id: string
  framework: string
  controlNumber: string
  title: string
  description: string
  requirements: string[]
  evidence: string[]
  testProcedures: string[]
  
  // Implementation Guidance
  implementationNotes: string
  riskIfNotImplemented: string
  typicalEvidence: string[]
  
  // Mappings to Other Frameworks
  crossReferences: FrameworkCrossReference[]
}

export interface ExtractionRule {
  id: string
  ruleType: 'keyword' | 'pattern' | 'semantic' | 'section_header'
  pattern: string
  weight: number
  context: string[]
  exclusions: string[]
}

export interface FrameworkCrossReference {
  targetFramework: string
  targetControl: string
  mappingType: 'equivalent' | 'related' | 'supportive'
  notes: string
}

// ============================================================================
// AI READINESS ASSESSMENT ENGINE
// ============================================================================

export interface Assessment extends BaseEntity {
  assessmentType: 'ai_readiness' | 'policy_gap' | 'vendor_risk' | 'compliance_audit'
  institutionType: 'K12' | 'HigherEd' | 'Healthcare' | 'Government'
  
  // Scoring Algorithms (Patent-pending AIRIX™, AIRS™, AICS™, AIMS™, AIPS™, AIBS™)
  scores: AssessmentScores
  
  // Recommendations Engine
  recommendations: AssessmentRecommendation[]
  prioritizedActions: PrioritizedAction[]
  
  // Evidence Collection
  evidence: AssessmentEvidence[]
  documentReferences: string[] // Document IDs
  
  // Team Collaboration
  teamId?: string
  collaborators: string[]
  
  // Status Tracking
  completionStatus: 'in_progress' | 'completed' | 'under_review' | 'approved'
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  
  // Benchmarking (AIBS™)
  benchmarkData?: BenchmarkData
  peerComparison?: PeerComparison
}

export interface AssessmentScores {
  // AIRIX™ - AI Readiness Index
  airix: {
    overall: number
    governance: number
    technology: number
    training: number
    compliance: number
  }
  
  // AIRS™ - AI Risk Score
  airs: {
    overall: number
    privacy: number
    security: number
    bias: number
    transparency: number
  }
  
  // AICS™ - AI Compliance Score
  aics: {
    overall: number
    ferpa: number
    coppa: number
    nist: number
    state: number
  }
  
  // AIMS™ - AI Maturity Score
  aims: {
    overall: number
    strategy: number
    implementation: number
    monitoring: number
    optimization: number
  }
  
  // AIPS™ - AI Policy Score
  aips: {
    overall: number
    coverage: number
    quality: number
    implementation: number
    enforcement: number
  }
  
  // AIBS™ - AI Benchmark Score
  aibs?: {
    overall: number
    percentileRank: number
    peerGroup: string
    industryAverage: number
  }
}

export interface AssessmentRecommendation {
  id: string
  category: 'immediate' | 'short_term' | 'long_term'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImpact: string
  implementationEffort: 'low' | 'medium' | 'high'
  estimatedCost: string
  timeframe: string
  dependencies: string[]
  successMetrics: string[]
  
  // Auto-generated Implementation
  implementationPlan?: ImplementationPlan
  requiredPolicies?: string[]
  trainingModules?: string[]
}

export interface PrioritizedAction {
  id: string
  action: string
  rationale: string
  urgency: number
  impact: number
  effort: number
  riskIfNotDone: string
  deadline: string
  assignedTo?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
}

export interface AssessmentEvidence {
  id: string
  evidenceType: 'document' | 'policy' | 'process' | 'training' | 'system'
  title: string
  description: string
  strength: 'weak' | 'moderate' | 'strong'
  documentId?: string
  uploadedAt: string
}

export interface BenchmarkData {
  peerGroup: string
  sampleSize: number
  anonymizedData: Record<string, number>
  industryAverages: Record<string, number>
  topPerformers: Record<string, number>
  generatedAt: string
}

export interface PeerComparison {
  rank: number
  percentile: number
  strongAreas: string[]
  improvementAreas: string[]
  similarOrganizations: AnonymizedPeer[]
}

export interface AnonymizedPeer {
  id: string // Anonymized
  size: string
  type: string
  region: string
  scoreProfile: Record<string, number>
}

// ============================================================================
// VENDOR VETTING & APPROVAL SYSTEM
// ============================================================================

export interface Vendor extends BaseEntity {
  vendorName: string
  contactInfo: VendorContact
  
  // Tool Portfolio
  toolInfo: VendorTool[]
  
  // Risk Assessment
  riskFlags: VendorRiskFlag[]
  overallRiskScore: number
  trustLevel: 'unverified' | 'basic' | 'verified' | 'premium'
  
  // Decision Status
  decision: 'approved' | 'conditional' | 'rejected' | 'under_review'
  decisionRationale: string
  decisionDate: string
  decisionBy: string
  
  // Mitigation & Monitoring
  mitigations: RiskMitigation[]
  complianceMonitoring: ComplianceCheck[]
  
  // Contract & Legal
  contractStatus: 'none' | 'draft' | 'under_review' | 'executed'
  dpaRequired: boolean
  dpaStatus: 'none' | 'draft' | 'executed'
  
  // Usage Tracking
  approvedUsers: string[]
  usageRestrictions: string[]
  activeDeployments: number
  lastUsageReview: string
}

export interface VendorTool {
  id: string
  toolName: string
  description: string
  category: string
  targetUsers: string[]
  gradeLevel: string[]
  subjectAreas: string[]
  
  // Technical Details
  hostingLocation: string
  dataProcessing: DataProcessingInfo
  security: SecurityInfo
  
  // AI-Specific
  aiCapabilities: AICapability[]
  modelProvider: string
  trainingDataSources: string[]
  biasTestingResults?: BiasTestResult[]
  
  // Compliance
  ferpaCompliant: boolean
  coppaCompliant: boolean
  ppraCompliant: boolean
  certifications: string[]
  
  // Risk Scoring
  privacyRisk: number
  securityRisk: number
  complianceRisk: number
  pedagogicalRisk: number
  overallRisk: number
}

export interface VendorContact {
  primaryContact: string
  email: string
  phone: string
  address: string
  privacyOfficer: string
  securityContact: string
  supportContact: string
}

export interface VendorRiskFlag {
  flagType: 'privacy' | 'security' | 'compliance' | 'financial' | 'operational'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  evidence: string
  identifiedAt: string
  resolvedAt?: string
  mitigationRequired: boolean
}

export interface RiskMitigation {
  id: string
  riskType: string
  mitigationStrategy: string
  implementationDate: string
  effectivenessRating: number
  reviewDate: string
  responsible: string
}

export interface ComplianceCheck {
  framework: string
  checkDate: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_assessed'
  findings: string[]
  remediation: string[]
  nextReview: string
}

export interface DataProcessingInfo {
  dataCollected: string[]
  dataSharing: boolean
  dataRetention: string
  dataLocation: string[]
  encryptionAtRest: boolean
  encryptionInTransit: boolean
  accessControls: string[]
  deletionPolicy: string
}

export interface SecurityInfo {
  soc2Certified: boolean
  iso27001Certified: boolean
  penetrationTesting: boolean
  lastSecurityAudit: string
  incidentHistory: SecurityIncident[]
  vulnerabilityManagement: boolean
}

export interface SecurityIncident {
  date: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  affected: string
  resolved: boolean
  publicDisclosure: boolean
}

export interface AICapability {
  type: 'content_generation' | 'analysis' | 'prediction' | 'recommendation'
  description: string
  accuracy: number
  biasRisk: 'low' | 'medium' | 'high'
  explainability: 'none' | 'limited' | 'moderate' | 'high'
  humanOversight: boolean
}

export interface BiasTestResult {
  testType: string
  testDate: string
  demographic: string
  biasScore: number
  remediation: string
  retestDate?: string
}

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================

export interface DashboardMetrics {
  orgId: string
  lastUpdated: string
  
  // Readiness Metrics
  readinessScore: number
  readinessTrend: TrendData[]
  
  // Adoption Metrics
  adoptionScore: number
  adoptionMetrics: AdoptionMetrics
  
  // Risk Metrics
  riskScore: number
  riskBreakdown: RiskBreakdown
  
  // Approval Pipeline
  approvalsMetrics: ApprovalsMetrics
  
  // Funding & Value
  fundingMetrics: FundingMetrics
  
  // Monthly Value Delivered
  monthlyValue: MonthlyValueMetrics
}

export interface TrendData {
  date: string
  value: number
  change: number
}

export interface AdoptionMetrics {
  totalUsers: number
  activeUsers: number
  toolsDeployed: number
  trainingCompleted: number
  policiesImplemented: number
}

export interface RiskBreakdown {
  privacy: number
  security: number
  compliance: number
  operational: number
  unmitigatedRisks: number
}

export interface ApprovalsMetrics {
  pendingApprovals: number
  averageApprovalTime: number
  approvalsByRole: Record<string, number>
  bottlenecks: string[]
}

export interface FundingMetrics {
  monthlySubscription: number
  estimatedSavings: number
  roiPercentage: number
  costAvoidance: number
  valueRealized: number
}

export interface MonthlyValueMetrics {
  documentsProcessed: number
  policiesGenerated: number
  gapsIdentified: number
  risksAssessed: number
  hoursAutomated: number
  consultingCostAvoided: number
}

// ============================================================================
// IMPLEMENTATION PLANS & AUTOMATION
// ============================================================================

export interface ImplementationPlan {
  id: string
  title: string
  description: string
  organizationType: 'K12' | 'HigherEd'
  
  // Timeline
  phases: ImplementationPhase[]
  totalDuration: number
  estimatedCost: number
  
  // Resources
  requiredRoles: string[]
  requiredTraining: string[]
  requiredPolicies: string[]
  requiredTools: string[]
  
  // Success Metrics
  successCriteria: string[]
  milestones: Milestone[]
  riskFactors: string[]
  
  // Auto-generation Metadata
  generatedFrom: string // Assessment ID
  customizations: PlanCustomization[]
  lastUpdated: string
  approvalStatus: 'draft' | 'approved' | 'in_progress' | 'completed'
}

export interface ImplementationPhase {
  phaseNumber: number
  title: string
  description: string
  duration: number
  prerequisites: string[]
  deliverables: string[]
  tasks: ImplementationTask[]
  
  // RACI Matrix
  responsible: string[]
  accountable: string[]
  consulted: string[]
  informed: string[]
}

export interface ImplementationTask {
  id: string
  title: string
  description: string
  estimatedHours: number
  dependencies: string[]
  assignedTo: string
  dueDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  automationLevel: number // 0-100% how much is automated
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string
  completionCriteria: string[]
  isCompleted: boolean
  completedDate?: string
}

export interface PlanCustomization {
  type: 'district_size' | 'region' | 'existing_systems' | 'risk_tolerance'
  value: string
  adjustments: string[]
}

// ============================================================================
// AUDIT TRAIL & COMPLIANCE LOGGING
// ============================================================================

export interface AuditTrailEntry {
  id: string
  timestamp: string
  
  // Actor Information
  userId: string
  userEmail: string
  userRole: string
  sessionId: string
  ipAddress: string
  userAgent: string
  
  // Action Details
  entityType: string
  entityId: string
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'download' | 'share'
  description: string
  
  // Data Changes
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  changeReason?: string
  
  // Context
  orgId: string
  relatedEntities: RelatedEntity[]
  
  // Compliance & Legal
  retentionDate: string
  legalHold: boolean
  complianceFlags: string[]
}

export interface RelatedEntity {
  entityType: string
  entityId: string
  relationship: string
}

// ============================================================================
// GUARDRAILS & SAFETY MECHANISMS
// ============================================================================

export interface PIIRedactionLog {
  id: string
  documentId: string
  originalText: string
  redactedText: string
  redactionMethod: 'automatic' | 'manual' | 'ai_assisted'
  confidence: number
  reviewRequired: boolean
  reviewedBy?: string
  reviewedAt?: string
  false_positive: boolean
}

export interface AIProcessingGuardrails {
  // PII Protection
  piiDetectionEnabled: boolean
  automaticRedaction: boolean
  humanReviewRequired: boolean
  
  // Data Minimization
  stripStudentData: boolean
  anonymizeBeforeProcessing: boolean
  dataRetentionPeriod: number
  
  // Model Safety
  inputSanitization: boolean
  outputValidation: boolean
  biasChecking: boolean
  
  // Logging & Monitoring
  logAllDecisions: boolean
  auditTrailEnabled: boolean
  alertThresholds: AlertThreshold[]
}

export interface AlertThreshold {
  metric: string
  threshold: number
  action: 'log' | 'alert' | 'block' | 'escalate'
  recipients: string[]
}

// ============================================================================
// LEGAL & COMPLIANCE SAFEGUARDS
// ============================================================================

export interface LegalSafeguard {
  id: string
  safeguardType: 'disclaimer' | 'review_requirement' | 'approval_gate' | 'retention_policy'
  description: string
  requiredFor: string[] // Entity types or actions
  isActive: boolean
  
  // Configuration
  displayText?: string
  requiresAcknowledgment: boolean
  routingRules?: RoutingRule[]
  retentionPeriod?: number
  
  created_at: string
  updated_at: string
}

export interface RoutingRule {
  condition: string
  route_to: string
  priority: number
  notification_template: string
}

// ============================================================================
// EXPORTS & MODULE ORGANIZATION
// ============================================================================

export type DocumentEntityTypes = 
  | Document 
  | PIIFlag 
  | DocumentSection 
  | DocumentVersion
  | FrameworkTag 
  | StateTag

export type PolicyEntityTypes = 
  | Policy 
  | PolicyDiff 
  | PolicyApproval 
  | ApprovalComment 
  | PolicySource

export type AssessmentEntityTypes = 
  | Assessment 
  | AssessmentScores 
  | AssessmentRecommendation 
  | PrioritizedAction 
  | AssessmentEvidence

export type VendorEntityTypes = 
  | Vendor 
  | VendorTool 
  | VendorRiskFlag 
  | RiskMitigation 
  | ComplianceCheck

export type AllEntityTypes = 
  | DocumentEntityTypes 
  | PolicyEntityTypes 
  | AssessmentEntityTypes 
  | VendorEntityTypes 
  | AuditTrailEntry 
  | ImplementationPlan
  | DashboardMetrics
