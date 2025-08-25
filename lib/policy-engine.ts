import { Policy, PolicyDiff, PolicyApproval, PolicySource, FrameworkControl } from '../types/core-data-models'

// Policy Engine - Template library + clause selector + redline diff (versioned)
export class PolicyEngine {
  private readonly policyTemplates: Map<string, PolicyTemplate> = new Map()
  private readonly clauseLibrary: Map<string, PolicyClause> = new Map()
  private readonly approvalWorkflows: Map<string, ApprovalWorkflow> = new Map()

  constructor() {
    this.initializeTemplateLibrary()
    this.initializeClauseLibrary()
    this.initializeApprovalWorkflows()
  }

  /**
   * Generate a new policy from a template with selected clauses
   */
  async generatePolicy(request: PolicyGenerationRequest): Promise<Policy> {
    const template = this.policyTemplates.get(request.templateId)
    if (!template) {
      throw new Error(`Template ${request.templateId} not found`)
    }

    // Select appropriate clauses based on organization profile
    const selectedClauses = await this.selectClauses(template, request)
    
    // Generate policy content
    const policyContent = await this.assemblePolicyContent(template, selectedClauses, request)
    
    // Create policy document
    const policy: Policy = {
      id: this.generateId(),
      orgId: request.orgId,
      templateId: request.templateId,
      title: this.interpolateTemplate(template.title, request.orgProfile),
      description: template.description,
      status: 'draft',
      jurisdiction: request.jurisdiction || ['federal'],
      policyContent,
      fillableFields: this.extractFillableFields(policyContent, request.orgProfile),
      complianceFrameworks: template.complianceFrameworks,
      stateRequirements: await this.identifyStateRequirements(request.jurisdiction || []),
      diffs: [],
      approvalTrail: [],
      riskLevel: template.riskLevel,
      implementationComplexity: template.implementationComplexity,
      autoUpdateEnabled: request.autoUpdateEnabled || false,
      lastFrameworkSync: new Date().toISOString(),
      sourceReferences: template.sourceReferences,
      responsibleParty: request.responsibleParty || 'Privacy Officer',
      reviewCycle: template.reviewCycle || 12,
      nextReviewDate: this.calculateNextReviewDate(template.reviewCycle || 12),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: request.createdBy,
      updated_by: request.createdBy
    }

    // Initialize approval workflow
    if (request.initiateApproval) {
      await this.initiateApprovalWorkflow(policy)
    }

    return policy
  }

  /**
   * Generate redlined differences between policy versions
   */
  async generateRedlines(
    originalPolicy: Policy, 
    updatedContent: string, 
    changeReason: string,
    updatedBy: string
  ): Promise<PolicyDiff[]> {
    const diffs: PolicyDiff[] = []
    
    // Parse both versions into structured sections
    const originalSections = this.parsePolicyIntoSections(originalPolicy.policyContent)
    const updatedSections = this.parsePolicyIntoSections(updatedContent)
    
    // Generate section-by-section differences
    const allSectionIds = new Set([
      ...originalSections.map(s => s.id),
      ...updatedSections.map(s => s.id)
    ])
    
    for (const sectionId of allSectionIds) {
      const originalSection = originalSections.find(s => s.id === sectionId)
      const updatedSection = updatedSections.find(s => s.id === sectionId)
      
      if (!originalSection && updatedSection) {
        // New section added
        const diff: PolicyDiff = {
          id: this.generateId(),
          version: this.incrementVersion('1.0'), // Would get from policy versions
          changeDate: new Date().toISOString(),
          changeType: 'addition',
          section: sectionId,
          originalText: '',
          newText: updatedSection.content,
          rationale: changeReason,
          sourceJustification: 'New requirement added',
          approvalRequired: this.requiresApproval(sectionId, 'addition'),
          approvedBy: undefined,
          approvedAt: undefined
        }
        diffs.push(diff)
        
      } else if (originalSection && !updatedSection) {
        // Section deleted
        const diff: PolicyDiff = {
          id: this.generateId(),
          version: this.incrementVersion('1.0'), // Would get from policy versions
          changeDate: new Date().toISOString(),
          changeType: 'deletion',
          section: sectionId,
          originalText: originalSection.content,
          newText: '',
          rationale: changeReason,
          sourceJustification: 'Requirement removed or superseded',
          approvalRequired: this.requiresApproval(sectionId, 'deletion'),
          approvedBy: undefined,
          approvedAt: undefined
        }
        diffs.push(diff)
        
      } else if (originalSection && updatedSection && originalSection.content !== updatedSection.content) {
        // Section modified
        const diff: PolicyDiff = {
          id: this.generateId(),
          version: this.incrementVersion('1.0'), // Would get from policy versions
          changeDate: new Date().toISOString(),
          changeType: 'modification',
          section: sectionId,
          originalText: originalSection.content,
          newText: updatedSection.content,
          rationale: changeReason,
          sourceJustification: this.determineSourceJustification(originalSection, updatedSection),
          approvalRequired: this.requiresApproval(sectionId, 'modification'),
          approvedBy: undefined,
          approvedAt: undefined
        }
        diffs.push(diff)
      }
    }
    
    return diffs
  }

  /**
   * Initiate approval workflow for a policy
   */
  async initiateApprovalWorkflow(policy: Policy): Promise<void> {
    const workflow = this.approvalWorkflows.get(policy.templateId)
    if (!workflow) {
      throw new Error(`No approval workflow defined for template ${policy.templateId}`)
    }

    // Create approval trail entries for each required approver
    const approvalTrail: PolicyApproval[] = workflow.requiredApprovers.map(approver => ({
      id: this.generateId(),
      policyId: policy.id,
      approverRole: approver.role as PolicyApproval['approverRole'],
      approverName: approver.name || '',
      approverEmail: approver.email || '',
      action: 'approve' as const,
      comments: '',
      digitalSignature: '',
      signedAt: '',
      ipAddress: '',
      commentThread: [],
      requiredApprovals: workflow.requiredApprovers.map(a => a.role),
      currentApprovals: [],
      isComplete: false
    }))

    policy.approvalTrail = approvalTrail
    policy.status = 'review'
    
    // Send notifications to approvers
    await this.sendApprovalNotifications(policy, workflow)
  }

  /**
   * Process an approval action
   */
  async processApproval(
    policyId: string,
    approvalId: string,
    action: 'approve' | 'reject' | 'request_changes',
    comments: string,
    approverEmail: string,
    digitalSignature: string,
    ipAddress: string
  ): Promise<PolicyApproval> {
    // Find and update the approval record
    // This would typically interact with a database
    
    const approval: PolicyApproval = {
      id: approvalId,
      policyId,
      approverRole: 'counsel', // Would be determined from context
      approverName: 'Legal Counsel',
      approverEmail,
      action,
      comments,
      digitalSignature,
      signedAt: new Date().toISOString(),
      ipAddress,
      commentThread: [],
      requiredApprovals: ['superintendent', 'counsel', 'cio'],
      currentApprovals: action === 'approve' ? ['counsel'] : [],
      isComplete: false
    }

    // Add comment to thread
    approval.commentThread.push({
      id: this.generateId(),
      authorRole: approval.approverRole,
      authorName: approval.approverName,
      comment: comments,
      timestamp: new Date().toISOString(),
      isResolved: false
    })

    // Check if all approvals are complete
    const allApprovals: PolicyApproval[] = [] // Would fetch from database
    const approvedCount = allApprovals.filter(a => a.action === 'approve').length
    approval.isComplete = approvedCount >= approval.requiredApprovals.length

    return approval
  }

  /**
   * Extract fillable fields from policy content
   */
  private extractFillableFields(content: string, orgProfile: OrganizationProfile): Record<string, string> {
    const fields: Record<string, string> = {}
    
    // Extract placeholder patterns and fill with org profile data
    const placeholderRegex = /\{\{([^}]+)\}\}/g
    let match
    
    while ((match = placeholderRegex.exec(content)) !== null) {
      const fieldName = match[1]
      if (fieldName === 'organization_name') {
        fields[fieldName] = orgProfile.organizationName
      } else if (fieldName === 'organization_type') {
        fields[fieldName] = orgProfile.organizationType
      }
    }
    
    return fields
  }
  async autoUpdatePoliciesFromFramework(frameworkUpdate: FrameworkUpdate): Promise<PolicyUpdateResult[]> {
    const results: PolicyUpdateResult[] = []
    
    // Find policies that reference the updated framework
    const affectedPolicies = await this.findPoliciesByFramework(frameworkUpdate.framework)
    
    for (const policy of affectedPolicies) {
      if (!policy.autoUpdateEnabled) {
        continue
      }
      
      try {
        // Generate updated policy content
        const updatedContent = await this.applyFrameworkUpdate(policy, frameworkUpdate)
        
        // Generate redlines
        const diffs = await this.generateRedlines(
          policy,
          updatedContent,
          `Framework update: ${frameworkUpdate.description}`,
          'system'
        )
        
        // Create new version if there are changes
        if (diffs.length > 0) {
          const result: PolicyUpdateResult = {
            policyId: policy.id,
            updateType: 'framework_sync',
            diffsGenerated: diffs.length,
            requiresApproval: diffs.some(d => d.approvalRequired),
            status: 'pending_review',
            updatedAt: new Date().toISOString()
          }
          
          results.push(result)
          
          // Trigger approval workflow if required
          if (result.requiresApproval) {
            await this.initiateApprovalWorkflow(policy)
          }
        }
        
      } catch (error) {
        results.push({
          policyId: policy.id,
          updateType: 'framework_sync',
          diffsGenerated: 0,
          requiresApproval: false,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          updatedAt: new Date().toISOString()
        })
      }
    }
    
    return results
  }

  /**
   * Select appropriate clauses based on organization profile
   */
  private async selectClauses(
    template: PolicyTemplate, 
    request: PolicyGenerationRequest
  ): Promise<PolicyClause[]> {
    const selectedClauses: PolicyClause[] = []
    
    for (const clauseId of template.availableClauses) {
      const clause = this.clauseLibrary.get(clauseId)
      if (!clause) continue
      
      // Evaluate clause selection rules
      const shouldInclude = this.evaluateClauseRules(clause, request.orgProfile)
      
      if (shouldInclude) {
        selectedClauses.push(clause)
      }
    }
    
    // Sort by priority and dependencies
    return this.sortClauses(selectedClauses)
  }

  /**
   * Assemble policy content from template and selected clauses
   */
  private async assemblePolicyContent(
    template: PolicyTemplate,
    clauses: PolicyClause[],
    request: PolicyGenerationRequest
  ): Promise<string> {
    let content = template.baseContent
    
    // Replace placeholders with clause content
    for (const clause of clauses) {
      const placeholder = `{{${clause.id}}}`
      const clauseContent = this.interpolateTemplate(clause.content, request.orgProfile)
      content = content.replace(placeholder, clauseContent)
    }
    
    // Replace organization-specific placeholders
    content = this.interpolateTemplate(content, request.orgProfile)
    
    // Add "Not Legal Advice" banner
    content = this.addLegalDisclaimer(content)
    
    return content
  }

  /**
   * Add legal disclaimer banner to all policy drafts
   */
  private addLegalDisclaimer(content: string): string {
    const disclaimer = `
**IMPORTANT LEGAL NOTICE**
This document is a policy template generated by automated systems and AI tools. 
It is NOT legal advice and should be reviewed by qualified legal counsel before 
implementation. The organization assumes full responsibility for compliance with 
applicable laws and regulations.

---

`
    return disclaimer + content
  }

  // Helper methods and initialization
  private initializeTemplateLibrary(): void {
    // AI Acceptable Use Policy Template
    this.policyTemplates.set('ai-acceptable-use', {
      id: 'ai-acceptable-use',
      title: '{{organization_name}} Artificial Intelligence Acceptable Use Policy',
      description: 'Comprehensive AI usage policy for educational institutions',
      baseContent: this.getAIAcceptableUseTemplate(),
      availableClauses: [
        'ai-definition-clause',
        'prohibited-uses-clause',
        'data-privacy-clause',
        'coppa-compliance-clause',
        'ferpa-compliance-clause',
        'monitoring-clause',
        'training-requirements-clause'
      ],
      complianceFrameworks: ['NIST AI RMF', 'FERPA', 'COPPA'],
      riskLevel: 'high',
      implementationComplexity: 'complex',
      reviewCycle: 12,
      sourceReferences: [
        {
          framework: 'NIST AI RMF',
          documentTitle: 'AI Risk Management Framework',
          section: 'GOVERN-1.1',
          url: 'https://www.nist.gov/itl/ai-risk-management-framework',
          lastChecked: new Date().toISOString(),
          changeDetected: false
        }
      ]
    })

    // Data Privacy Policy Template
    this.policyTemplates.set('data-privacy', {
      id: 'data-privacy',
      title: '{{organization_name}} Student Data Privacy Policy',
      description: 'FERPA/COPPA compliant data privacy policy',
      baseContent: this.getDataPrivacyTemplate(),
      availableClauses: [
        'ferpa-definition-clause',
        'coppa-definition-clause',
        'data-collection-clause',
        'consent-requirements-clause',
        'data-sharing-clause',
        'retention-clause',
        'breach-notification-clause'
      ],
      complianceFrameworks: ['FERPA', 'COPPA', 'PPRA'],
      riskLevel: 'high',
      implementationComplexity: 'moderate',
      reviewCycle: 12,
      sourceReferences: []
    })
  }

  private initializeClauseLibrary(): void {
    // AI Definition Clause
    this.clauseLibrary.set('ai-definition-clause', {
      id: 'ai-definition-clause',
      title: 'Artificial Intelligence Definition',
      content: `
For the purposes of this policy, "Artificial Intelligence" refers to computer systems 
that can perform tasks that typically require human intelligence, including but not 
limited to:
- Natural language processing and generation
- Image and video analysis
- Predictive analytics and recommendation systems
- Automated decision-making systems
- Machine learning algorithms
      `,
      category: 'definitions',
      priority: 1,
      applicableFrameworks: ['NIST AI RMF'],
      selectionRules: [
        { condition: 'organization_type', operator: 'in', value: ['K12', 'HigherEd'] }
      ],
      dependencies: []
    })

    // COPPA Compliance Clause
    this.clauseLibrary.set('coppa-compliance-clause', {
      id: 'coppa-compliance-clause',
      title: 'COPPA Compliance Requirements',
      content: `
## Children's Online Privacy Protection

When AI tools collect, use, or disclose personal information from children under 13:

1. **Verifiable Parental Consent**: Prior verifiable parental consent must be obtained
2. **Age Screening**: Tools must include age verification mechanisms
3. **Data Minimization**: Collect only information necessary for educational purposes
4. **No Behavioral Advertising**: Prohibited for children under 13
5. **Parental Rights**: Parents may review and delete child's information

{{#if_k12}}
All AI tools used with students under 13 must be pre-approved by the Privacy Officer 
and include COPPA compliance verification.
{{/if_k12}}
      `,
      category: 'compliance',
      priority: 2,
      applicableFrameworks: ['COPPA'],
      selectionRules: [
        { condition: 'organization_type', operator: 'equals', value: 'K12' },
        { condition: 'student_age_min', operator: 'less_than', value: 13 }
      ],
      dependencies: ['data-collection-clause']
    })
  }

  private initializeApprovalWorkflows(): void {
    // AI Policy Approval Workflow
    this.approvalWorkflows.set('ai-acceptable-use', {
      templateId: 'ai-acceptable-use',
      requiredApprovers: [
        { role: 'superintendent', required: true, order: 1 },
        { role: 'counsel', required: true, order: 2 },
        { role: 'cio', required: true, order: 3 },
        { role: 'privacy_officer', required: true, order: 4 }
      ],
      parallelApproval: false,
      escalationRules: [
        { condition: 'no_response_days > 5', action: 'escalate_to_superintendent' },
        { condition: 'rejection_count > 1', action: 'require_legal_review' }
      ],
      notifications: {
        newSubmission: true,
        approvalReceived: true,
        finalApproval: true,
        rejection: true
      }
    })
  }

  private evaluateClauseRules(clause: PolicyClause, orgProfile: OrganizationProfile): boolean {
    return clause.selectionRules.every(rule => {
      const profileValue = (orgProfile as any)[rule.condition]
      
      switch (rule.operator) {
        case 'equals':
          return profileValue === rule.value
        case 'in':
          return Array.isArray(rule.value) && rule.value.includes(profileValue)
        case 'less_than':
          return typeof profileValue === 'number' && profileValue < (rule.value as number)
        case 'greater_than':
          return typeof profileValue === 'number' && profileValue > (rule.value as number)
        default:
          return true
      }
    })
  }

  private interpolateTemplate(template: string, orgProfile: OrganizationProfile): string {
    let result = template
    
    // Replace organization placeholders
    result = result.replace(/\{\{organization_name\}\}/g, orgProfile.organizationName || '[Organization Name]')
    result = result.replace(/\{\{organization_type\}\}/g, orgProfile.organizationType || 'Educational Institution')
    
    // Handle conditional blocks
    if (orgProfile.organizationType === 'K12') {
      result = result.replace(/\{\{#if_k12\}\}([\s\S]*?)\{\{\/if_k12\}\}/g, '$1')
    } else {
      result = result.replace(/\{\{#if_k12\}\}([\s\S]*?)\{\{\/if_k12\}\}/g, '')
    }
    
    return result
  }

  private parsePolicyIntoSections(content: string): PolicySection[] {
    const sections: PolicySection[] = []
    const sectionRegex = /^##\s+(.+)$/gm
    let lastIndex = 0
    let match
    
    while ((match = sectionRegex.exec(content)) !== null) {
      if (lastIndex > 0) {
        const previousTitle = sections[sections.length - 1].title
        const sectionContent = content.substring(lastIndex, match.index).trim()
        sections[sections.length - 1].content = sectionContent
      }
      
      sections.push({
        id: this.slugify(match[1]),
        title: match[1],
        content: ''
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Handle last section
    if (sections.length > 0) {
      sections[sections.length - 1].content = content.substring(lastIndex).trim()
    }
    
    return sections
  }

  private generateId(): string {
    return `pol_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.')
    const minor = parseInt(parts[1] || '0') + 1
    return `${parts[0]}.${minor}`
  }

  private requiresApproval(sectionId: string, changeType: string): boolean {
    const highRiskSections = ['compliance', 'privacy', 'security', 'definitions']
    return highRiskSections.some(section => sectionId.includes(section)) || 
           changeType === 'deletion'
  }

  private determineSourceJustification(original: PolicySection, updated: PolicySection): string {
    // Simple heuristic - in production would use more sophisticated analysis
    if (updated.content.includes('NIST')) {
      return 'NIST AI RMF update'
    } else if (updated.content.includes('FERPA')) {
      return 'FERPA compliance update'
    } else if (updated.content.includes('COPPA')) {
      return 'COPPA compliance update'
    }
    return 'Best practice update'
  }

  private calculateNextReviewDate(reviewCycleMonths: number): string {
    const nextReview = new Date()
    nextReview.setMonth(nextReview.getMonth() + reviewCycleMonths)
    return nextReview.toISOString()
  }

  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  private sortClauses(clauses: PolicyClause[]): PolicyClause[] {
    return clauses.sort((a, b) => {
      // Sort by priority first
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      // Then by dependencies
      if (a.dependencies.includes(b.id)) return 1
      if (b.dependencies.includes(a.id)) return -1
      return 0
    })
  }

  // Template content methods
  private getAIAcceptableUseTemplate(): string {
    return `
# {{organization_name}} Artificial Intelligence Acceptable Use Policy

## Purpose
This policy establishes guidelines for the responsible use of Artificial Intelligence (AI) 
tools and technologies within {{organization_name}}.

## Definitions
{{ai-definition-clause}}

## Acceptable Uses
AI tools may be used for:
- Educational content creation and enhancement
- Administrative task automation
- Research and analysis support
- Accessibility improvements

## Prohibited Uses
{{prohibited-uses-clause}}

## Data Privacy and Protection
{{data-privacy-clause}}

## Compliance Requirements
{{coppa-compliance-clause}}
{{ferpa-compliance-clause}}

## Monitoring and Enforcement
{{monitoring-clause}}

## Training Requirements
{{training-requirements-clause}}

---
*This policy is subject to regular review and updates based on evolving technology and regulations.*
    `
  }

  private getDataPrivacyTemplate(): string {
    return `
# {{organization_name}} Student Data Privacy Policy

## Purpose
To ensure compliance with federal and state privacy laws regarding student data.

## Applicable Laws
{{ferpa-definition-clause}}
{{coppa-definition-clause}}

## Data Collection
{{data-collection-clause}}

## Consent Requirements
{{consent-requirements-clause}}

## Data Sharing and Disclosure
{{data-sharing-clause}}

## Data Retention
{{retention-clause}}

## Breach Notification
{{breach-notification-clause}}
    `
  }

  // Async methods that would typically interact with databases
  private async identifyStateRequirements(jurisdiction: string[]): Promise<string[]> {
    // Mock implementation - would query state regulation database
    return jurisdiction.filter(j => j !== 'federal')
  }

  private async sendApprovalNotifications(policy: Policy, workflow: ApprovalWorkflow): Promise<void> {
    // Mock implementation - would send actual notifications
    console.log(`Sending approval notifications for policy ${policy.id}`)
  }

  private async findPoliciesByFramework(framework: string): Promise<Policy[]> {
    // Mock implementation - would query database
    return []
  }

  private async applyFrameworkUpdate(policy: Policy, update: FrameworkUpdate): Promise<string> {
    // Mock implementation - would apply framework changes to policy content
    return policy.policyContent
  }
}

// Supporting interfaces
interface PolicyTemplate {
  id: string
  title: string
  description: string
  baseContent: string
  availableClauses: string[]
  complianceFrameworks: string[]
  riskLevel: 'low' | 'medium' | 'high'
  implementationComplexity: 'simple' | 'moderate' | 'complex'
  reviewCycle: number
  sourceReferences: PolicySource[]
}

interface PolicyClause {
  id: string
  title: string
  content: string
  category: string
  priority: number
  applicableFrameworks: string[]
  selectionRules: ClauseSelectionRule[]
  dependencies: string[]
}

interface ClauseSelectionRule {
  condition: string
  operator: 'equals' | 'in' | 'less_than' | 'greater_than'
  value: any
}

interface ApprovalWorkflow {
  templateId: string
  requiredApprovers: WorkflowApprover[]
  parallelApproval: boolean
  escalationRules: EscalationRule[]
  notifications: NotificationConfig
}

interface WorkflowApprover {
  role: string
  required: boolean
  order: number
  name?: string
  email?: string
}

interface EscalationRule {
  condition: string
  action: string
}

interface NotificationConfig {
  newSubmission: boolean
  approvalReceived: boolean
  finalApproval: boolean
  rejection: boolean
}

interface PolicyGenerationRequest {
  templateId: string
  orgId: string
  orgProfile: OrganizationProfile
  jurisdiction?: string[]
  createdBy: string
  responsibleParty?: string
  autoUpdateEnabled?: boolean
  initiateApproval?: boolean
}

interface OrganizationProfile {
  organizationName: string
  organizationType: 'K12' | 'HigherEd'
  studentAgeMin?: number
  studentAgeMax?: number
  state: string
  hasUnder13Students: boolean
  usesAITools: boolean
  hasPrivacyOfficer: boolean
}

interface PolicySection {
  id: string
  title: string
  content: string
}

interface FrameworkUpdate {
  framework: string
  version: string
  description: string
  affectedControls: string[]
  changeDate: string
}

interface PolicyUpdateResult {
  policyId: string
  updateType: 'framework_sync' | 'manual_update' | 'scheduled_review'
  diffsGenerated: number
  requiresApproval: boolean
  status: 'pending_review' | 'approved' | 'failed'
  error?: string
  updatedAt: string
}
