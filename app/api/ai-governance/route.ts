import { NextRequest, NextResponse } from 'next/server'
import { UploadsService } from '../../../lib/uploads-service'
import { PolicyEngine } from '../../../lib/policy-engine'
import { FrameworkMapper } from '../../../lib/framework-mapper'
import { DashboardService } from '../../../lib/dashboard-service'
import { VendorVettingSystem } from '../../../lib/vendor-vetting-system'

// Main API route for AI Governance Platform
// Integrates: Uploads, Policy Engine, Framework Mapper, Dashboards, Vendor Vetting

const uploadsService = new UploadsService()
const policyEngine = new PolicyEngine()
const frameworkMapper = new FrameworkMapper()
const dashboardService = new DashboardService()
const vendorVetting = new VendorVettingSystem()

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()
    
    // Log every decision for compliance
    console.log(`[AUDIT] API action: ${action}`, params)

    switch (action) {
      // =====================================
      // DOCUMENT UPLOAD & PROCESSING
      // =====================================
      case 'upload_document':
        return await handleDocumentUpload(params)
      
      case 'process_document':
        return await handleDocumentProcessing(params)
      
      case 'get_document_analysis':
        return await handleDocumentAnalysis(params)

      // =====================================
      // POLICY GENERATION & MANAGEMENT
      // =====================================
      case 'generate_policy':
        return await handlePolicyGeneration(params)
      
      case 'update_policy':
        return await handlePolicyUpdate(params)
      
      case 'approve_policy':
        return await handlePolicyApproval(params)
      
      case 'get_policy_redlines':
        return await handlePolicyRedlines(params)

      // =====================================
      // FRAMEWORK MAPPING & COMPLIANCE
      // =====================================
      case 'map_to_frameworks':
        return await handleFrameworkMapping(params)
      
      case 'get_compliance_gaps':
        return await handleComplianceGaps(params)
      
      case 'update_framework_mappings':
        return await handleFrameworkUpdate(params)

      // =====================================
      // VENDOR VETTING & APPROVAL
      // =====================================
      case 'submit_vendor_intake':
        return await handleVendorIntake(params)
      
      case 'get_vendor_risk_assessment':
        return await handleVendorRisk(params)
      
      case 'approve_vendor_tool':
        return await handleVendorApproval(params)
      
      case 'get_approved_tools':
        return await handleApprovedTools(params)

      // =====================================
      // DASHBOARD & ANALYTICS
      // =====================================
      case 'get_dashboard_metrics':
        return await handleDashboardMetrics(params)
      
      case 'get_compliance_report':
        return await handleComplianceReport(params)
      
      case 'get_audit_trail':
        return await handleAuditTrail(params)

      // =====================================
      // AUTOMATION & INTEGRATION
      // =====================================
      case 'auto_update_policies':
        return await handleAutoUpdate(params)
      
      case 'generate_board_package':
        return await handleBoardPackage(params)

      default:
        return NextResponse.json(
          { error: 'Unknown action', action },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[API ERROR]', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        // Add "Not Legal Advice" banner to all error responses
        legalDisclaimer: 'This system provides automated assistance only. Consult qualified legal counsel for compliance guidance.'
      },
      { status: 500 }
    )
  }
}

// =====================================
// DOCUMENT PROCESSING HANDLERS
// =====================================

async function handleDocumentUpload(params: any) {
  const { file, orgId, uploadedBy, documentType } = params
  
  // Validate required parameters
  if (!file || !orgId || !uploadedBy || !documentType) {
    return NextResponse.json(
      { error: 'Missing required parameters: file, orgId, uploadedBy, documentType' },
      { status: 400 }
    )
  }

  // Process the uploaded document
  const document = await uploadsService.processUpload(file, orgId, uploadedBy, documentType)
  
  return NextResponse.json({
    success: true,
    document,
    message: 'Document uploaded and processed successfully',
    legalDisclaimer: 'Document analysis is automated and should be reviewed by qualified personnel.'
  })
}

async function handleDocumentProcessing(params: any) {
  const { documentId, orgId } = params
  
  // This would fetch the document from database and run additional processing
  // For now, return mock processing status
  
  return NextResponse.json({
    success: true,
    processingStatus: 'completed',
    piiFlags: 3,
    frameworkMappings: 5,
    complianceGaps: 2,
    message: 'Document processing completed'
  })
}

async function handleDocumentAnalysis(params: any) {
  const { documentId, orgId } = params
  
  // Mock document for framework mapping
  const mockDocument = {
    id: documentId,
    orgId,
    extractedText: 'This policy addresses student privacy, FERPA compliance, and AI governance requirements...',
    // ... other document properties would be fetched from database
  } as any

  const mappingResult = await frameworkMapper.mapDocumentToFrameworks(mockDocument)
  
  return NextResponse.json({
    success: true,
    analysis: mappingResult,
    legalDisclaimer: 'Framework mapping is automated. Legal review required for compliance validation.'
  })
}

// =====================================
// POLICY MANAGEMENT HANDLERS
// =====================================

async function handlePolicyGeneration(params: any) {
  const { templateId, orgId, orgProfile, createdBy, jurisdiction, autoUpdateEnabled } = params
  
  const policyRequest = {
    templateId,
    orgId,
    orgProfile,
    createdBy,
    jurisdiction,
    autoUpdateEnabled,
    initiateApproval: true
  }
  
  const policy = await policyEngine.generatePolicy(policyRequest)
  
  return NextResponse.json({
    success: true,
    policy,
    message: 'Policy generated successfully and routed for approval',
    legalDisclaimer: 'Generated policies require legal review before implementation. This is NOT legal advice.'
  })
}

async function handlePolicyUpdate(params: any) {
  const { policyId, updatedContent, changeReason, updatedBy } = params
  
  // Mock original policy - would fetch from database
  const originalPolicy = {
    id: policyId,
    policyContent: 'Original policy content...',
    // ... other properties
  } as any
  
  const redlines = await policyEngine.generateRedlines(
    originalPolicy,
    updatedContent,
    changeReason,
    updatedBy
  )
  
  return NextResponse.json({
    success: true,
    redlines,
    message: 'Policy redlines generated',
    legalDisclaimer: 'Policy changes require legal review and approval before implementation.'
  })
}

async function handlePolicyApproval(params: any) {
  const { policyId, approvalId, action, comments, approverEmail, digitalSignature, ipAddress } = params
  
  const approval = await policyEngine.processApproval(
    policyId,
    approvalId,
    action,
    comments,
    approverEmail,
    digitalSignature,
    ipAddress
  )
  
  return NextResponse.json({
    success: true,
    approval,
    message: 'Approval processed successfully'
  })
}

async function handlePolicyRedlines(params: any) {
  const { policyId } = params
  
  // Mock redlines - would fetch from database
  const redlines = [
    {
      id: 'diff-1',
      section: 'Privacy Requirements',
      changeType: 'modification',
      originalText: 'Data collection is permitted...',
      newText: 'Data collection requires parental consent for users under 13...',
      rationale: 'COPPA compliance requirement'
    }
  ]
  
  return NextResponse.json({
    success: true,
    redlines,
    legalDisclaimer: 'Redlines show suggested changes only. Legal review required for implementation.'
  })
}

// =====================================
// FRAMEWORK MAPPING HANDLERS
// =====================================

async function handleFrameworkMapping(params: any) {
  const { documentId, orgId } = params
  
  // Mock document for mapping
  const mockDocument = {
    id: documentId,
    orgId,
    extractedText: 'Sample policy content with privacy, security, and AI governance requirements...',
  } as any
  
  const mappingResult = await frameworkMapper.mapDocumentToFrameworks(mockDocument)
  
  return NextResponse.json({
    success: true,
    mapping: mappingResult,
    message: 'Framework mapping completed',
    legalDisclaimer: 'Automated mapping should be validated by compliance professionals.'
  })
}

async function handleComplianceGaps(params: any) {
  const { orgId } = params
  
  // Mock compliance gaps analysis
  const gaps = [
    {
      framework: 'NIST AI RMF',
      controlId: 'GOVERN-1.1',
      priority: 'high',
      description: 'Missing legal compliance documentation',
      recommendations: ['Develop legal compliance matrix', 'Engage legal counsel']
    },
    {
      framework: 'COPPA',
      controlId: 'COPPA-312.5',
      priority: 'critical',
      description: 'No parental consent process for under-13 users',
      recommendations: ['Implement age verification', 'Create consent workflow']
    }
  ]
  
  return NextResponse.json({
    success: true,
    gaps,
    legalDisclaimer: 'Gap analysis is automated. Professional compliance review required.'
  })
}

async function handleFrameworkUpdate(params: any) {
  const { framework, updates } = params
  
  // Mock framework auto-update
  const updateResults = await policyEngine.autoUpdatePoliciesFromFramework({
    framework,
    version: '2.0',
    description: 'Updated NIST AI RMF requirements',
    affectedControls: ['GOVERN-1.1', 'MAP-1.1'],
    changeDate: new Date().toISOString()
  })
  
  return NextResponse.json({
    success: true,
    updateResults,
    message: 'Framework updates processed',
    legalDisclaimer: 'Automated updates require legal review before implementation.'
  })
}

// =====================================
// VENDOR VETTING HANDLERS
// =====================================

async function handleVendorIntake(params: any) {
  const { intakeForm } = params
  
  const result = await vendorVetting.submitIntakeForm(intakeForm)
  
  return NextResponse.json({
    success: true,
    result,
    message: 'Vendor intake form submitted for automated review'
  })
}

async function handleVendorRisk(params: any) {
  const { intakeFormId } = params
  
  // Mock risk assessment - would use actual vendor vetting methods
  const riskAssessment = {
    overallRiskScore: 65,
    riskLevel: 'Medium',
    coppaAssessment: { status: 'Compliant', concerns: [] },
    ferpaAssessment: { status: 'Review Required', concerns: ['Data retention unclear'] },
    recommendation: 'Conditional Approval'
  }
  
  return NextResponse.json({
    success: true,
    riskAssessment,
    legalDisclaimer: 'Risk assessment is automated. Legal and privacy review required for vendor approval.'
  })
}

async function handleVendorApproval(params: any) {
  const { vendorId, toolId, decision, approvedBy } = params
  
  // Mock approval decision - would use actual vendor vetting methods
  const approval = {
    id: 'approval-123',
    decision,
    approvedBy,
    approvedAt: new Date().toISOString(),
    conditions: decision === 'conditional' ? ['Quarterly compliance review required'] : [],
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  return NextResponse.json({
    success: true,
    approval,
    message: 'Vendor approval decision processed'
  })
}

async function handleApprovedTools(params: any) {
  const { orgId, filters } = params
  
  // Use existing searchApprovedTools method
  const tools = await vendorVetting.searchApprovedTools(filters || {})
  
  return NextResponse.json({
    success: true,
    tools,
    totalCount: tools.length,
    message: 'Approved tools catalog retrieved'
  })
}

// =====================================
// DASHBOARD HANDLERS
// =====================================

async function handleDashboardMetrics(params: any) {
  const { orgId } = params
  
  const metrics = await dashboardService.generateDashboardMetrics(orgId)
  
  return NextResponse.json({
    success: true,
    metrics,
    message: 'Dashboard metrics generated',
    legalDisclaimer: 'Metrics are for informational purposes only. Professional assessment recommended.'
  })
}

async function handleComplianceReport(params: any) {
  const { orgId } = params
  
  const report = await dashboardService.generateComplianceReport(orgId)
  
  return NextResponse.json({
    success: true,
    report,
    message: 'Compliance report generated'
    // Note: Legal disclaimer is included in the report itself
  })
}

async function handleAuditTrail(params: any) {
  const { orgId, startDate, endDate } = params
  
  const auditTrail = await dashboardService.getAuditTrail(orgId, startDate, endDate)
  
  return NextResponse.json({
    success: true,
    auditTrail,
    message: 'Audit trail retrieved'
  })
}

// =====================================
// AUTOMATION HANDLERS
// =====================================

async function handleAutoUpdate(params: any) {
  const { orgId, frameworkUpdates } = params
  
  // Process framework updates and auto-update policies
  const results = []
  
  for (const update of frameworkUpdates) {
    const updateResult = await policyEngine.autoUpdatePoliciesFromFramework(update)
    results.push(...updateResult)
  }
  
  return NextResponse.json({
    success: true,
    results,
    message: 'Auto-update processing completed',
    legalDisclaimer: 'Auto-updates require review and approval before implementation.'
  })
}

async function handleBoardPackage(params: any) {
  const { orgId, assessmentId } = params
  
  // Generate comprehensive board presentation package
  const metrics = await dashboardService.generateDashboardMetrics(orgId)
  const complianceReport = await dashboardService.generateComplianceReport(orgId)
  
  const boardPackage = {
    executiveSummary: {
      readinessScore: metrics.readinessScore,
      riskLevel: complianceReport.executiveSummary.riskLevel,
      complianceStatus: complianceReport.executiveSummary.complianceStatus,
      monthlyROI: metrics.fundingMetrics.roiPercentage
    },
    keyMetrics: {
      hoursAutomated: metrics.monthlyValue.hoursAutomated,
      costSavings: metrics.fundingMetrics.estimatedSavings,
      policiesGenerated: metrics.monthlyValue.policiesGenerated,
      gapsIdentified: metrics.monthlyValue.gapsIdentified
    },
    riskAssessment: metrics.riskBreakdown,
    recommendations: complianceReport.recommendations,
    nextSteps: complianceReport.nextSteps,
    appendices: {
      auditTrail: complianceReport.auditTrail.slice(0, 20),
      complianceFrameworks: complianceReport.detailedFindings.frameworkCompliance
    }
  }
  
  return NextResponse.json({
    success: true,
    boardPackage,
    message: 'Board presentation package generated',
    legalDisclaimer: 'Board package is for informational purposes. Decisions should involve qualified legal and compliance professionals.'
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  // Handle GET requests for read-only operations
  switch (action) {
    case 'health_check':
      return NextResponse.json({
        success: true,
        status: 'operational',
        modules: {
          uploads: 'active',
          policyEngine: 'active',
          frameworkMapper: 'active',
          dashboard: 'active',
          vendorVetting: 'active'
        },
        timestamp: new Date().toISOString()
      })
    
    default:
      return NextResponse.json(
        { error: 'Invalid GET action', action },
        { status: 400 }
      )
  }
}
