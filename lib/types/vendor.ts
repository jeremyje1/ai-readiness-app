/**
 * Vendor Intake System Types
 * Types for vendor assessment, risk evaluation, and compliance tracking
 * @version 1.0.0
 */

export type VendorStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'conditional'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ComplianceFlag = 'FERPA' | 'COPPA' | 'PPRA' | 'GDPR' | 'CCPA' | 'SOX' | 'HIPAA'
export type DataFlow = 'inbound' | 'outbound' | 'bidirectional' | 'none'
export type HostingRegion = 'us' | 'eu' | 'apac' | 'global' | 'unknown'
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'microsoft' | 'aws' | 'custom' | 'none'

export interface VendorDataFlow {
  type: DataFlow
  dataTypes: string[]
  frequency: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'on-demand'
  volume: 'low' | 'medium' | 'high'
  encryption: boolean
  retention: string // e.g., "30 days", "1 year", "indefinite"
}

export interface RiskFlag {
  type: ComplianceFlag
  severity: RiskLevel
  description: string
  regulation: string
  impact: string
  triggered: boolean
  mitigationRequired: boolean
}

export interface Mitigation {
  id: string
  riskFlag: ComplianceFlag
  title: string
  description: string
  type: 'technical' | 'procedural' | 'contractual' | 'policy'
  status: 'pending' | 'implemented' | 'verified'
  assignee?: string
  dueDate?: string
  evidence?: string
  notes?: string
}

export interface VendorAssessment {
  // Basic Information
  basicInfo: {
    name: string
    url: string
    description: string
    category: string
    contactEmail: string
    contactName: string
    businessJustification: string
  }

  // Data Handling
  dataHandling: {
    storesPII: boolean
    piiTypes: string[]
    trainsOnUserData: boolean
    dataFlows: VendorDataFlow[]
    dataRetention: string
    dataLocation: HostingRegion[]
    encryptionAtRest: boolean
    encryptionInTransit: boolean
  }

  // AI/ML Specific
  aiCapabilities: {
    isAIService: boolean
    modelProvider: ModelProvider
    customModels: boolean
    trainsOnUserData: boolean
    trainingDataSources: string[]
    biasAuditing: boolean
    explainabilityFeatures: boolean
  }

  // Age & Student Data
  studentData: {
    handlesStudentData: boolean
    ageGate: boolean
    minimumAge: number
    parentalConsent: boolean
    educationalPurpose: boolean
    directoryInformation: boolean
  }

  // Compliance & Security
  compliance: {
    certifications: string[]
    auditReports: boolean
    privacyPolicy: boolean
    termsOfService: boolean
    dataProcessingAgreement: boolean
    subprocessors: string[]
    incidentResponse: boolean
  }

  // Technical Integration
  technical: {
    authenticationMethod: string[]
    ssoSupported: boolean
    apiDocumentation: boolean
    webhooks: boolean
    rateLimit: string
    uptime: string
    supportLevel: string
  }
}

export interface Vendor {
  id: string
  status: VendorStatus
  assessment: VendorAssessment
  riskFlags: RiskFlag[]
  riskScore: number
  riskLevel: RiskLevel
  decision?: {
    outcome: VendorStatus
    reason: string
    conditions: string[]
    approver: string
    approvedAt: string
    validUntil?: string
  }
  mitigations: Mitigation[]
  
  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
  reviewedBy?: string
  reviewedAt?: string
  
  // Integration Status
  catalogEntry?: {
    approved: boolean
    category: string
    description: string
    tags: string[]
    usage: string
    restrictions: string[]
  }
}

export interface CreateVendorRequest {
  assessment: VendorAssessment
  requestedBy: string
  urgency: 'low' | 'medium' | 'high'
  expectedLaunchDate?: string
  notes?: string
}

export interface VendorDecisionRequest {
  outcome: VendorStatus
  reason: string
  conditions?: string[]
  mitigations?: Omit<Mitigation, 'id'>[]
  addToCatalog?: boolean
  catalogMetadata?: Vendor['catalogEntry']
}

export interface DecisionBrief {
  vendorId: string
  vendorName: string
  generatedAt: string
  generatedBy: string
  
  summary: {
    recommendation: VendorStatus
    riskLevel: RiskLevel
    riskScore: number
    keyRisks: string[]
    primaryMitigations: string[]
  }
  
  assessment: {
    dataHandling: {
      storesPII: boolean
      piiTypes: string[]
      trainsOnUserData: boolean
      dataLocation: string
      retention: string
    }
    compliance: {
      flaggedRegulations: ComplianceFlag[]
      missingCertifications: string[]
      requiredActions: string[]
    }
    aiRisks: {
      biasRisk: RiskLevel
      privacyRisk: RiskLevel
      transparencyRisk: RiskLevel
      recommendations: string[]
    }
  }
  
  mitigations: Mitigation[]
  conditions: string[]
  monitoring: {
    reviewFrequency: string
    keyMetrics: string[]
    escalationTriggers: string[]
  }
  
  approvals: {
    requiredApprovers: string[]
    currentStatus: string
    nextSteps: string[]
  }
}

export interface VendorQuestionnaire {
  sections: {
    basicInfo: QuestionnaireSection
    dataHandling: QuestionnaireSection
    aiCapabilities: QuestionnaireSection
    studentData: QuestionnaireSection
    compliance: QuestionnaireSection
    technical: QuestionnaireSection
  }
}

export interface QuestionnaireSection {
  title: string
  description: string
  questions: Question[]
  conditionalLogic?: ConditionalRule[]
}

export interface Question {
  id: string
  type: 'text' | 'textarea' | 'boolean' | 'select' | 'multiselect' | 'number' | 'date' | 'url' | 'email'
  label: string
  description?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  defaultValue?: any
  placeholder?: string
  helpText?: string
  riskWeight?: number
  complianceFlags?: ComplianceFlag[]
}

export interface ConditionalRule {
  condition: {
    questionId: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: any
  }
  action: {
    type: 'show' | 'hide' | 'require' | 'flag_risk'
    target: string[]
    riskFlag?: ComplianceFlag
    message?: string
  }
}

export interface RiskEngineResult {
  totalScore: number
  riskLevel: RiskLevel
  flags: RiskFlag[]
  recommendations: string[]
  requiredMitigations: Mitigation[]
  autoApproval: boolean
  escalationRequired: boolean
}
