/**
 * Compliance Status API
 * Returns compliance tracking items with computed status and workload
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ComplianceFilters {
  audience?: 'k12' | 'highered'
  status?: string
  priority?: string
  assignedTo?: string
  department?: string
  riskLevel?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const audience = searchParams.get('audience') as 'k12' | 'highered'
    
    if (!orgId || !audience) {
      return NextResponse.json(
        { error: 'orgId and audience are required' },
        { status: 400 }
      )
    }

    // Build filters
    const filters: ComplianceFilters = { audience }
    if (searchParams.get('status')) filters.status = searchParams.get('status')!
    if (searchParams.get('priority')) filters.priority = searchParams.get('priority')!
    if (searchParams.get('assignedTo')) filters.assignedTo = searchParams.get('assignedTo')!
    if (searchParams.get('department')) filters.department = searchParams.get('department')!
    if (searchParams.get('riskLevel')) filters.riskLevel = searchParams.get('riskLevel')!

    // Get compliance tracking items with related data
    let query = supabase
      .from('compliance_tracking')
      .select(`
        *,
        framework_controls!inner (
          id,
          code,
          title,
          description,
          complexity_weight,
          impact_areas,
          compliance_frameworks!inner (
            name,
            audience,
            regulatory_body
          )
        ),
        compliance_evidence (
          id,
          title,
          evidence_type,
          is_current,
          expires_at
        ),
        compliance_findings (
          id,
          severity,
          status,
          finding_type
        )
      `)
      .eq('org_id', orgId)

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.priority) query = query.eq('priority', filters.priority)
    if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
    if (filters.department) query = query.eq('department', filters.department)
    if (filters.riskLevel) query = query.eq('risk_level', filters.riskLevel)

    // Filter by audience
    query = query.eq('framework_controls.compliance_frameworks.audience', audience)

    const { data: trackingItems, error } = await query

    if (error) {
      console.error('Error fetching compliance items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match frontend interface
    const complianceItems = trackingItems?.map(item => {
      const control = item.framework_controls
      const framework = control.compliance_frameworks
      const evidence = item.compliance_evidence || []
      const findings = item.compliance_findings || []

      // Calculate computed status based on user-provided logic
      const computedStatus = computeComplianceStatus(item, evidence, findings)
      
      // Calculate days until due
      const dueDate = new Date(item.due_date)
      const today = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: item.id,
        type: getComplianceType(framework.name),
        title: control.title,
        description: control.description,
        status: computedStatus,
        priority: item.priority,
        dueDate: item.due_date,
        assignedTo: item.assigned_to || 'Unassigned',
        department: item.department || 'General',
        lastAction: item.last_action || 'Item created',
        nextAction: item.next_action || 'Begin compliance activities',
        daysUntilDue,
        completionPercentage: item.completion_percentage || 0,
        riskLevel: item.risk_level,
        impactArea: control.impact_areas || [],
        regulatoryFramework: [framework.name],
        notes: item.notes || '',
        createdDate: item.created_at.split('T')[0],
        updatedDate: item.updated_at.split('T')[0],
        
        // Extended data for enhanced UI
        frameworkCode: control.code,
        complexityWeight: control.complexity_weight,
        evidenceCount: evidence.filter((e: any) => e.is_current).length,
        findingsCount: findings.filter((f: any) => f.status === 'open').length,
        hasExpiredEvidence: evidence.some((e: any) => e.expires_at && new Date(e.expires_at) < today),
        highSeverityFindings: findings.filter((f: any) => f.severity === 'high' || f.severity === 'critical').length
      }
    }) || []

    // Calculate summary metrics
    const metrics = {
      totalItems: complianceItems.length,
      overdue: complianceItems.filter(item => item.daysUntilDue < 0).length,
      dueSoon: complianceItems.filter(item => item.daysUntilDue >= 0 && item.daysUntilDue <= 30).length,
      inProgress: complianceItems.filter(item => item.status === 'in_progress').length,
      completed: complianceItems.filter(item => item.status === 'completed').length,
      highRiskItems: complianceItems.filter(item => item.riskLevel === 'high').length,
      criticalItems: complianceItems.filter(item => item.priority === 'critical').length,
      complianceScore: Math.round(
        ((complianceItems.filter(item => item.status === 'completed').length + 
          complianceItems.filter(item => item.status === 'in_progress' && item.completionPercentage > 70).length) 
          / complianceItems.length) * 100
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        items: complianceItems,
        metrics
      },
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in compliance status API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance status' },
      { status: 500 }
    )
  }
}

/**
 * Compute compliance status based on user-provided logic
 */
function computeComplianceStatus(
  tracking: any,
  evidence: any[],
  findings: any[]
): string {
  // if open_findings_high > 0 => 'At Risk'
  const highFindings = findings.filter((f: any) => 
    f.status === 'open' && (f.severity === 'high' || f.severity === 'critical')
  )
  if (highFindings.length > 0) return 'flagged' // Map to existing status

  // else if evidence_stale > allowed => 'Needs Update'
  const today = new Date()
  const staleEvidence = evidence.filter((e: any) => 
    e.expires_at && new Date(e.expires_at) < today
  )
  if (staleEvidence.length > 0) return 'review_needed'

  // else if control_coverage < threshold => 'Partial'
  const coverageThreshold = 0.8 // 80% as specified
  const currentEvidence = evidence.filter((e: any) => e.is_current).length
  const requiredEvidence = 3 // Assume 3 pieces of evidence needed per control
  const coverage = currentEvidence / requiredEvidence
  
  if (coverage < coverageThreshold) return 'pending'

  // else 'Compliant' 
  if (tracking.completion_percentage >= 100) return 'completed'
  if (tracking.completion_percentage > 0) return 'in_progress'
  
  return tracking.status || 'pending'
}

/**
 * Map framework names to compliance item types
 */
function getComplianceType(frameworkName: string): string {
  const typeMapping: Record<string, string> = {
    'FERPA': 'legal',
    'COPPA': 'legal', 
    'HIPAA': 'legal',
    'GLBA Safeguards': 'legal',
    'Title IX': 'policy',
    'IDEA': 'policy',
    'Section 508': 'certification',
    'NIST CSF': 'audit',
    'NIST 800-53': 'audit',
    'NIST 800-171': 'audit',
    'State Privacy Laws': 'legal',
    'PCI DSS': 'certification',
    'CIPA': 'policy',
    'PPRA': 'legal',
    'Clery Act': 'legal',
    'SACSCOC': 'audit',
    'Middle States': 'audit',
    'WASC': 'audit',
    'HLC': 'audit'
  }
  
  return typeMapping[frameworkName] || 'policy'
}