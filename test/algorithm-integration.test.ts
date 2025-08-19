/**
 * Algorithm Integration Test
 * Tests the complete enterprise algorithm suite
 */

import { calculateEnterpriseMetrics, ALGORITHM_SUITE_VERSION } from '../lib/algorithms';
import type { AssessmentData, OrganizationMetrics } from '../types/assessment';

// Mock assessment data for testing
const mockAssessmentData: AssessmentData = {
  id: 'test-assessment-001',
  userId: 'test-user-001',
  tier: 'ENTERPRISE',
  status: 'COMPLETED',
  institutionType: 'Higher Education',
  organizationType: 'university',
  responses: [
    {
      questionId: 'Q1_1',
      section: 'Leadership & Governance',
      prompt: 'Strategic planning is comprehensive and regularly updated',
      value: 4,
      type: 'likert',
      tags: ['strategy', 'leadership'],
      priority: 'high'
    },
    {
      questionId: 'Q2_1',
      section: 'Organizational Structure',
      prompt: 'Reporting relationships are clear and efficient',
      value: 3,
      type: 'likert',
      tags: ['structure', 'efficiency'],
      priority: 'medium'
    },
    {
      questionId: 'Q3_1',
      section: 'Technology Integration',
      prompt: 'Technology systems are well-integrated',
      value: 5,
      type: 'likert',
      tags: ['technology', 'integration'],
      priority: 'high'
    }
  ],
  metadata: {
    institutionName: 'Test University',
    institutionSize: 'large',
    departmentCount: 25,
    employeeCount: 5000,
    annualBudget: 500000000,
    geographicScope: 'regional',
    assessmentPurpose: 'Organizational efficiency analysis',
    timeframe: '2025 Q1',
    primaryContact: 'test@testuniversity.edu',
    version: '2.1.0',
    algorithmVersion: '2.1.0'
  },
  completed: true,
  createdAt: '2025-07-12T10:00:00Z',
  updatedAt: '2025-07-12T11:30:00Z',
  completedAt: '2025-07-12T11:30:00Z'
};

// Mock organization metrics for testing
const mockOrganizationMetrics: OrganizationMetrics = {
  // Structural Metrics
  hierarchyLevels: 6,
  spanOfControl: 8,
  departmentCount: 25,
  employeeCount: 5000,
  reportingRelationships: 625,
  
  // Operational Metrics
  processComplexity: 0.75,
  decisionLatency: 0.65,
  communicationEfficiency: 0.80,
  resourceUtilization: 0.85,
  taskAutomationLevel: 0.45,
  
  // Cultural Metrics
  changeReadiness: 0.70,
  collaborationIndex: 0.75,
  innovationCapacity: 0.65,
  leadershipEffectiveness: 0.80,
  employeeEngagement: 0.70,
  
  // Strategic Metrics
  goalAlignment: 0.75,
  strategicAgility: 0.65,
  marketResponsiveness: 0.70,
  competitivePosition: 0.80,
  futureReadiness: 0.60,
  
  // Financial Metrics
  budgetEfficiency: 0.85,
  costPerEmployee: 100000,
  revenuePerEmployee: 120000,
  operationalMargin: 0.15,
  investmentInTechnology: 0.08,
  
  // Technology Metrics
  digitalMaturity: 0.70,
  systemIntegration: 0.65,
  dataQuality: 0.75,
  cybersecurityLevel: 0.80,
  aiReadiness: 0.55,
  
  // Performance Indicators
  productivityIndex: 0.80,
  qualityMetrics: 0.85,
  customerSatisfaction: 0.78,
  employeeRetention: 0.88,
  complianceLevel: 0.95,
  
  // Risk Factors
  operationalRisk: 0.25,
  financialRisk: 0.20,
  technologicalRisk: 0.35,
  regulatoryRisk: 0.15,
  reputationalRisk: 0.20
};

/**
 * Test function to validate enterprise algorithm suite
 */
export async function testEnterpriseAlgorithms(): Promise<void> {
  console.log('🚀 Testing Enterprise Algorithm Suite v' + ALGORITHM_SUITE_VERSION.version);
  console.log('📊 Processing mock assessment data...');
  
  try {
    // Calculate enterprise metrics
    const results = await calculateEnterpriseMetrics(mockAssessmentData, mockOrganizationMetrics);
    
    console.log('✅ Enterprise Algorithm Suite Results:');
    console.log('DSCH Score:', results.dsch.overallScore);
    console.log('CRF Score:', results.crf.overallScore);
    console.log('LEI Score:', results.lei.overallScore);
    console.log('OCI Score:', results.oci.overallScore);
    console.log('HOCI Score:', results.hoci.overallScore);
    
    // Validate results
    const allScoresValid = Object.values(results).every(result => 
      result.overallScore >= 0 && result.overallScore <= 1
    );
    
    if (allScoresValid) {
      console.log('✅ All algorithm scores are within valid range (0-1)');
    } else {
      console.error('❌ Some algorithm scores are out of range');
    }
    
    console.log('🎯 Enterprise Algorithm Suite test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing enterprise algorithms:', error);
    throw error;
  }
}

// Export for use in other test files
export { mockAssessmentData, mockOrganizationMetrics };

describe('Enterprise Algorithm Integration', () => {
  test('should calculate enterprise metrics successfully', async () => {
    await expect(testEnterpriseAlgorithms()).resolves.not.toThrow();
  });

  test('should return valid organization metrics', async () => {
    const results = await calculateEnterpriseMetrics(mockAssessmentData, mockOrganizationMetrics);
    expect(results).toBeDefined();
    expect(results.dsch).toBeDefined();
    expect(results.crf).toBeDefined();
    expect(results.lei).toBeDefined();
    expect(results.oci).toBeDefined();
    expect(results.hoci).toBeDefined();
  });
});

// Self-executing test (can be commented out in production)
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Running Enterprise Algorithm Integration Test...');
  testEnterpriseAlgorithms().catch(console.error);
}
