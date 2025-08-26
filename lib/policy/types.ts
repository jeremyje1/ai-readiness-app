/**
 * Policy Engine Types
 * Core data structures for policy template and clause management
 * @version 1.0.0
 */

export type Audience = 'k12' | 'highered'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ToolUseMode = 'prohibited' | 'restricted' | 'permitted' | 'encouraged'

export interface PolicyClause {
  id: string
  title: string
  body: string
  tags: string[]
  riskLevel: RiskLevel
  audience?: Audience[]
  jurisdictions?: string[]
  toolUseModes?: ToolUseMode[]
  dependencies?: string[] // Other clause IDs that must be included
  conflicts?: string[] // Clause IDs that cannot be included together
  metadata: {
    version: number
    createdAt: string
    updatedAt: string
    author: string
    source?: string
    legalReview?: boolean
  }
}

export interface PolicyTemplate {
  id: string
  name: string
  description: string
  jurisdiction: string
  audience: Audience
  clauses: string[] // Array of clause IDs
  version: number
  metadata: {
    createdAt: string
    updatedAt: string
    author: string
    approvedBy?: string
    approvalDate?: string
    effectiveDate?: string
    reviewDate?: string
    status: 'draft' | 'approved' | 'active' | 'archived'
  }
}

export interface ClauseSelectionInput {
  audience: Audience
  state?: string
  jurisdiction?: string
  riskProfile: RiskLevel
  toolUseMode: ToolUseMode
  customTags?: string[]
  excludeClauses?: string[]
  includeClauses?: string[]
}

export interface SelectedClause extends PolicyClause {
  selected: boolean
  reason: string
  priority: number
}

export interface PolicyDiff {
  id: string
  type: 'addition' | 'deletion' | 'modification'
  clauseId?: string
  oldText?: string
  newText?: string
  position: number
  description: string
}

export interface RedlineChange {
  id: string
  type: 'insert' | 'delete' | 'format'
  text: string
  position: {
    paragraph: number
    sentence: number
    word: number
  }
  author: string
  timestamp: string
  comment?: string
}

export interface GeneratedPolicy {
  id: string
  templateId: string
  selectedClauses: SelectedClause[]
  document: {
    title: string
    content: string
    wordCount: number
    pageCount: number
  }
  trackedChanges: RedlineChange[]
  metadata: {
    generatedAt: string
    userId: string
    organizationId: string
    parameters: ClauseSelectionInput
  }
}

export interface PolicyRenderOptions {
  templateId: string
  selectedClauses: string[]
  trackedChanges?: boolean
  format?: 'docx' | 'pdf' | 'html'
  headerFooter?: {
    organizationName?: string
    logoUrl?: string
    effectiveDate?: string
    version?: string
  }
  styling?: {
    font?: string
    fontSize?: number
    margin?: number
    spacing?: number
  }
}
