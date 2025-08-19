/**
 * AI Readiness Dashboard Data API
 * Provides comprehensive dashboard data for completed assessments
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiReadinessDatabase } from '@/lib/aiReadinessDatabase';

// This route depends on request URL search params; force dynamic to avoid build-time static generation errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Fetching dashboard data for assessment:', assessmentId);

    // Try to fetch from database
    let assessmentData = null;
    if (aiReadinessDatabase.isAvailable()) {
      try {
        assessmentData = await aiReadinessDatabase.getAssessment(assessmentId);
        console.log('✅ Retrieved assessment from database');
      } catch (dbError) {
        console.warn('⚠️  Database not available, using mock data:', dbError);
      }
    }

    // If no database data, provide comprehensive mock data for demo
    if (!assessmentData) {
      console.log('📊 Providing comprehensive mock dashboard data');
      
      const mockData = {
        assessmentId: assessmentId,
        institutionName: 'Sample Educational Institution',
        userEmail: 'admin@institution.edu',
        userName: 'Assessment Administrator',
        tier: 'Team Plan ($995/month)',
        overallScore: 74,
        maturityLevel: 'Developing',
        domainScores: {
          strategy: { 
            score: 78, 
            percentage: 78, 
            maturityLevel: 'Advanced',
            description: 'Strong strategic AI vision and leadership commitment'
          },
          governance: { 
            score: 65, 
            percentage: 65, 
            maturityLevel: 'Developing',
            description: 'Governance frameworks need enhancement and formal structure'
          },
          pedagogy: { 
            score: 70, 
            percentage: 70, 
            maturityLevel: 'Developing',
            description: 'Faculty AI integration shows promise but needs systematic approach'
          },
          infrastructure: { 
            score: 82, 
            percentage: 82, 
            maturityLevel: 'Advanced',
            description: 'Technology infrastructure well-positioned for AI implementation'
          },
          culture: { 
            score: 68, 
            percentage: 68, 
            maturityLevel: 'Developing',
            description: 'Cultural readiness emerging but requires change management focus'
          },
          compliance: { 
            score: 75, 
            percentage: 75, 
            maturityLevel: 'Advanced',
            description: 'Strong compliance foundation with data privacy and security'
          },
          integrity: { 
            score: 71, 
            percentage: 71, 
            maturityLevel: 'Developing',
            description: 'Academic integrity policies need AI-specific guidelines'
          },
          mission: { 
            score: 76, 
            percentage: 76, 
            maturityLevel: 'Advanced',
            description: 'AI initiatives well-aligned with institutional mission and values'
          }
        },
        recommendations: [
          {
            id: 'rec-governance-1',
            priority: 'High',
            title: 'Establish AI Governance Committee',
            description: 'Create a formal AI governance committee with representatives from academic affairs, IT, legal, and faculty to oversee AI policy development and implementation.',
            category: 'Governance',
            estimatedEffort: '2-4 weeks',
            impact: 'High',
            resources: ['AI Governance Framework Template', 'Committee Charter Template']
          },
          {
            id: 'rec-training-1',
            priority: 'High',
            title: 'Launch Faculty AI Literacy Program',
            description: 'Implement comprehensive AI training program for faculty covering pedagogical applications, ethical considerations, and tool integration.',
            category: 'Professional Development',
            estimatedEffort: '6-8 weeks',
            impact: 'High',
            resources: ['Faculty Training Modules', 'AI Tool Integration Guides']
          },
          {
            id: 'rec-policy-1',
            priority: 'High',
            title: 'Develop Student AI Usage Guidelines',
            description: 'Create clear, comprehensive guidelines for students on acceptable AI use in academic work, including citation requirements and prohibited uses.',
            category: 'Academic Integrity',
            estimatedEffort: '3-4 weeks',
            impact: 'High',
            resources: ['Student AI Policy Template', 'Academic Integrity Framework']
          },
          {
            id: 'rec-security-1',
            priority: 'Medium',
            title: 'Conduct AI Security Risk Assessment',
            description: 'Perform comprehensive security assessment of AI tools and platforms to identify vulnerabilities and establish security protocols.',
            category: 'Technology Security',
            estimatedEffort: '4-6 weeks',
            impact: 'Medium',
            resources: ['Security Assessment Checklist', 'AI Security Best Practices']
          },
          {
            id: 'rec-culture-1',
            priority: 'Medium',
            title: 'Establish AI Innovation Community',
            description: 'Create forums and communities for faculty and staff to share AI experiences, best practices, and collaborative projects.',
            category: 'Cultural Development',
            estimatedEffort: '2-3 weeks',
            impact: 'Medium',
            resources: ['Community Building Guide', 'Innovation Sharing Platform']
          },
          {
            id: 'rec-benchmark-1',
            priority: 'Low',
            title: 'Implement Peer Institution Benchmarking',
            description: 'Establish regular benchmarking against peer institutions to track progress and identify emerging best practices.',
            category: 'Strategic Planning',
            estimatedEffort: '4-5 weeks',
            impact: 'Low',
            resources: ['Benchmarking Framework', 'Peer Analysis Tools']
          }
        ],
        strengths: [
          'Strong technology infrastructure foundation ready for AI integration',
          'Committed leadership support and strategic vision for AI adoption',
          'Active faculty interest and engagement in AI tool exploration',
          'Robust data security and privacy policies already established',
          'Clear institutional mission alignment with AI enhancement goals',
          'Adequate financial resources allocated for technology initiatives'
        ],
        gaps: [
          'Lack of formal AI governance framework and oversight structure',
          'Limited systematic faculty training on AI tools and pedagogy',
          'Unclear student guidelines for AI use in academic work',
          'Insufficient cross-departmental coordination on AI initiatives',
          'Need for enhanced change management and cultural readiness',
          'Missing AI-specific risk assessment and mitigation strategies'
        ],
        submittedAt: new Date().toISOString(),
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        documentsUploaded: 0,
        maxDocuments: 10,
        implementationPriority: [
          { phase: 'Immediate (0-30 days)', items: ['AI Governance Committee', 'Faculty Training Launch', 'Student Guidelines'] },
          { phase: 'Short-term (30-90 days)', items: ['Security Assessment', 'Policy Implementation', 'Pilot Programs'] },
          { phase: 'Medium-term (90-180 days)', items: ['Full Training Rollout', 'Cultural Development', 'Benchmarking Setup'] }
        ],
        availableResources: [
          { category: 'Policy Templates', count: 12, description: 'Ready-to-customize AI policy frameworks' },
          { category: 'Training Materials', count: 8, description: 'Faculty and staff professional development modules' },
          { category: 'Implementation Guides', count: 6, description: 'Step-by-step implementation playbooks' },
          { category: 'Assessment Tools', count: 4, description: 'Progress tracking and evaluation instruments' }
        ]
      };

      return NextResponse.json({
        success: true,
        data: mockData,
        message: 'Dashboard data retrieved successfully',
        isDemo: true
      });
    }

    // If we have real database data, format it for the dashboard
    const dashboardData = {
      assessmentId: assessmentData.id,
      institutionName: assessmentData.institution_name || 'Your Institution',
      userEmail: assessmentData.contact_email || 'user@institution.edu',
      userName: assessmentData.contact_name || 'Assessment User',
      tier: assessmentData.tier || 'Team Plan',
      overallScore: assessmentData.ai_readiness_score || 0,
      maturityLevel: getMaturityLevel(assessmentData.ai_readiness_score || 0),
      domainScores: assessmentData.domain_scores || {},
      recommendations: generateRecommendations(assessmentData),
      strengths: extractStrengths(assessmentData),
      gaps: extractGaps(assessmentData),
      submittedAt: assessmentData.created_at,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      documentsUploaded: 0,
      maxDocuments: 10
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Dashboard data retrieval failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getMaturityLevel(score: number): string {
  if (score >= 85) return 'Leading';
  if (score >= 70) return 'Advanced';
  if (score >= 55) return 'Developing';
  if (score >= 40) return 'Emerging';
  return 'Beginning';
}

function generateRecommendations(assessmentData: any): any[] {
  // Generate recommendations based on assessment scores
  const recommendations: any[] = [];
  const domainScores = assessmentData.domain_scores || {};
  
  // Add recommendations based on low-scoring domains
  Object.entries(domainScores).forEach(([domain, scoreData]: [string, any]) => {
    if (scoreData.percentage < 70) {
      recommendations.push({
        id: `rec-${domain}-1`,
        priority: scoreData.percentage < 50 ? 'High' : 'Medium',
        title: `Improve ${domain.charAt(0).toUpperCase() + domain.slice(1)} Capabilities`,
        description: `Focus on enhancing ${domain} to improve overall AI readiness.`,
        category: domain.charAt(0).toUpperCase() + domain.slice(1)
      });
    }
  });

  return recommendations;
}

function extractStrengths(assessmentData: any): string[] {
  const strengths: string[] = [];
  const domainScores = assessmentData.domain_scores || {};
  
  Object.entries(domainScores).forEach(([domain, scoreData]: [string, any]) => {
    if (scoreData.percentage >= 75) {
      strengths.push(`Strong ${domain} foundation with ${scoreData.percentage}% readiness`);
    }
  });

  return strengths.length > 0 ? strengths : [
    'Commitment to AI exploration and development',
    'Institutional interest in technology advancement'
  ];
}

function extractGaps(assessmentData: any): string[] {
  const gaps: string[] = [];
  const domainScores = assessmentData.domain_scores || {};
  
  Object.entries(domainScores).forEach(([domain, scoreData]: [string, any]) => {
    if (scoreData.percentage < 60) {
      gaps.push(`${domain.charAt(0).toUpperCase() + domain.slice(1)} development needed (${scoreData.percentage}% ready)`);
    }
  });

  return gaps.length > 0 ? gaps : [
    'General AI readiness development opportunities identified'
  ];
}
