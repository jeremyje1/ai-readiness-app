/**
 * Policy Engine Demo
 * Demonstration of how to use the Policy Engine system
 * @version 1.0.0
 */

import { ClauseSelector } from './clause-selector'
import { PolicyRenderer } from './policy-renderer'
import { PolicyDiffer } from './policy-differ'
import { ClauseSelectionInput, PolicyRenderOptions } from './types'

/**
 * Example: Generate a K-12 AI Policy
 */
export async function generateK12Policy() {
  console.log('🏫 Generating K-12 AI Policy...')
  
  // Step 1: Define policy requirements
  const input: ClauseSelectionInput = {
    audience: 'k12',
    riskProfile: 'high',
    toolUseMode: 'restricted',
    state: 'CA',
    customTags: ['privacy', 'student-safety']
  }

  // Step 2: Select appropriate clauses
  const clauseSelector = new ClauseSelector()
  const selectedClauses = await clauseSelector.selectClauses(input)
  
  console.log(`✅ Selected ${selectedClauses.length} clauses:`)
  selectedClauses.forEach(clause => {
    console.log(`   - ${clause.title} (Priority: ${clause.priority})`)
    console.log(`     Reason: ${clause.reason}`)
  })

  // Step 3: Render policy documents
  const policyRenderer = new PolicyRenderer()
  
  // Generate HTML for preview
  const htmlContent = await policyRenderer.renderPolicyHtml(
    'k12_comprehensive',
    selectedClauses.map(c => c.id),
    'Sample Elementary School District'
  )
  
  // Generate DOCX for distribution
  const renderOptions: PolicyRenderOptions = {
    templateId: 'k12_comprehensive',
    selectedClauses: selectedClauses.map(c => c.id),
    format: 'docx',
    headerFooter: {
      organizationName: 'Sample Elementary School District',
      effectiveDate: '2024-01-01',
      version: '1.0.0'
    }
  }
  
  const docxBuffer = await policyRenderer.renderPolicyDocx(renderOptions)
  
  console.log(`📄 Generated HTML (${htmlContent.length} characters)`)
  console.log(`📎 Generated DOCX (${docxBuffer.length} bytes)`)
  
  return {
    selectedClauses,
    htmlContent,
    docxBuffer
  }
}

/**
 * Example: Generate Higher Education AI Policy
 */
export async function generateHigherEdPolicy() {
  console.log('🎓 Generating Higher Education AI Policy...')
  
  const input: ClauseSelectionInput = {
    audience: 'highered',
    riskProfile: 'medium',
    toolUseMode: 'permitted',
    jurisdiction: 'federal',
    customTags: ['research', 'academic-freedom']
  }

  const clauseSelector = new ClauseSelector()
  const selectedClauses = await clauseSelector.selectClauses(input)
  
  console.log(`✅ Selected ${selectedClauses.length} clauses for higher education`)
  
  const policyRenderer = new PolicyRenderer()
  const htmlContent = await policyRenderer.renderPolicyHtml(
    'highered_flexible',
    selectedClauses.map(c => c.id),
    'State University System'
  )
  
  console.log(`📄 Generated Higher Ed HTML (${htmlContent.length} characters)`)
  
  return {
    selectedClauses,
    htmlContent
  }
}

/**
 * Example: Compare Two Policies
 */
export async function comparePolicies() {
  console.log('🔍 Comparing Different Policy Approaches...')
  
  // Generate restrictive policy
  const restrictiveInput: ClauseSelectionInput = {
    audience: 'k12',
    riskProfile: 'high',
    toolUseMode: 'prohibited'
  }
  
  // Generate permissive policy
  const permissiveInput: ClauseSelectionInput = {
    audience: 'k12',
    riskProfile: 'low',
    toolUseMode: 'encouraged'
  }
  
  const clauseSelector = new ClauseSelector()
  const policyRenderer = new PolicyRenderer()
  
  const restrictiveClauses = await clauseSelector.selectClauses(restrictiveInput)
  const permissiveClauses = await clauseSelector.selectClauses(permissiveInput)
  
  const restrictivePolicy = await policyRenderer.renderPolicyHtml(
    'k12_comprehensive',
    restrictiveClauses.map(c => c.id),
    'Conservative School District'
  )
  
  const permissivePolicy = await policyRenderer.renderPolicyHtml(
    'k12_comprehensive',
    permissiveClauses.map(c => c.id),
    'Progressive School District'
  )
  
  // Compare the policies
  const policyDiffer = new PolicyDiffer()
  const diffs = policyDiffer.diffPolicies(restrictivePolicy, permissivePolicy)
  const redlineChanges = policyDiffer.generateRedlineChanges(
    restrictivePolicy,
    permissivePolicy,
    'Policy Comparison Tool'
  )
  
  console.log(`📊 Found ${diffs.length} differences between policies`)
  console.log(`   - ${diffs.filter(d => d.type === 'addition').length} additions`)
  console.log(`   - ${diffs.filter(d => d.type === 'deletion').length} deletions`)
  console.log(`   - ${diffs.filter(d => d.type === 'modification').length} modifications`)
  
  // Generate redline HTML
  const redlineHtml = policyDiffer.renderRedlineHtml(
    restrictivePolicy,
    redlineChanges,
    'Policy Comparison: Restrictive vs Permissive'
  )
  
  console.log(`📝 Generated redline comparison (${redlineHtml.length} characters)`)
  
  return {
    restrictivePolicy,
    permissivePolicy,
    diffs,
    redlineChanges,
    redlineHtml
  }
}

/**
 * Example: Search and Filter Clauses
 */
export async function exploreAvailableClauses() {
  console.log('🔎 Exploring Available Policy Clauses...')
  
  const clauseSelector = new ClauseSelector()
  
  // Get all K-12 clauses
  const k12Clauses = clauseSelector.getAvailableClauses('k12')
  console.log(`📚 Available K-12 clauses: ${k12Clauses.length}`)
  
  // Get privacy-related clauses
  const privacyClauses = clauseSelector.getAvailableClauses(undefined, ['privacy'])
  console.log(`🔒 Privacy clauses: ${privacyClauses.length}`)
  
  // Search for governance clauses
  const governanceClauses = clauseSelector.searchClauses('governance')
  console.log(`⚖️ Governance clauses: ${governanceClauses.length}`)
  
  // Get specific clause details
  const dataGovernanceClause = clauseSelector.getClauseById('data_governance')
  if (dataGovernanceClause) {
    console.log(`📋 Data Governance Clause:`)
    console.log(`   Title: ${dataGovernanceClause.title}`)
    console.log(`   Risk Level: ${dataGovernanceClause.riskLevel}`)
    console.log(`   Tags: ${dataGovernanceClause.tags.join(', ')}`)
    console.log(`   Audiences: ${dataGovernanceClause.audience?.join(', ') || 'All'}`)
  }
  
  return {
    k12Clauses,
    privacyClauses,
    governanceClauses,
    dataGovernanceClause
  }
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('🚀 Running Policy Engine Demonstrations...\n')
  
  try {
    // Demo 1: K-12 Policy Generation
    await generateK12Policy()
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Demo 2: Higher Education Policy Generation
    await generateHigherEdPolicy()
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Demo 3: Policy Comparison
    await comparePolicies()
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Demo 4: Clause Exploration
    await exploreAvailableClauses()
    console.log('\n' + '='.repeat(50) + '\n')
    
    console.log('✅ All demonstrations completed successfully!')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
    throw error
  }
}

/**
 * Usage Examples for API Integration
 */
export const apiExamples = {
  // Example API request for policy generation
  generatePolicyRequest: {
    method: 'POST',
    url: '/api/policies/generate',
    body: {
      input: {
        audience: 'k12',
        riskProfile: 'high',
        toolUseMode: 'restricted',
        state: 'TX',
        customTags: ['student-privacy', 'COPPA']
      },
      format: 'both',
      title: 'AI Usage Policy',
      institution: 'Texas Independent School District',
      userId: 'admin_user_123',
      organizationId: 'tisd_org',
      options: {
        includeMetadata: true,
        enableTracking: true,
        watermark: 'DRAFT - For Review Only'
      }
    }
  },
  
  // Example API request for downloading artifacts
  downloadRequest: {
    method: 'GET',
    url: '/api/artifacts/550e8400-e29b-41d4-a716-446655440000/download?format=docx'
  },
  
  // Example API request for listing policies
  listPoliciesRequest: {
    method: 'GET',
    url: '/api/policies/generate?institution=texas&audience=k12&limit=20'
  }
}

// Export convenience functions
export {
  ClauseSelector,
  PolicyRenderer,
  PolicyDiffer
}

// If running directly
if (require.main === module) {
  runAllDemos().catch(console.error)
}
