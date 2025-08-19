import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { aiReadinessDatabase } from '@/lib/aiReadinessDatabase';
import { AIReadinessBenchmarkEngine, type BenchmarkData } from '@/lib/ai-readiness-benchmarks';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const reportType = searchParams.get('type') || 'comprehensive';
    
    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    // Fetch assessment data
    const assessment = await aiReadinessDatabase.getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    switch (reportType) {
      case 'benchmark':
        return await generateBenchmarkReport(assessment);
      case 'executive':
        return await generateExecutiveReport(assessment);
      case 'detailed':
        return await generateDetailedReport(assessment);
      case 'trends':
        return await generateTrendsReport(assessment);
      default:
        return await generateComprehensiveReport(assessment);
    }

  } catch (error) {
    console.error('Advanced reporting error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateBenchmarkReport(assessment: any) {
  // Extract institution data for benchmarking
  const institutionData: BenchmarkData = {
    institutionSize: assessment.institution_size || 'medium',
    institutionType: assessment.institution_type || 'public-university',
    location: assessment.location || 'Unknown',
    studentCount: assessment.student_count
  };

  // Get domain scores
  const domainScores = assessment.domain_scores || {};
  
  // Generate benchmark analysis
  const benchmarkResults = AIReadinessBenchmarkEngine.generateBenchmarkAnalysis(
    domainScores,
    institutionData,
    assessment.tier || 'comprehensive'
  );

  // Generate peer comparison report
  const peerComparisonReport = AIReadinessBenchmarkEngine.generatePeerComparisonReport(
    institutionData,
    benchmarkResults
  );

  return NextResponse.json({
    reportType: 'benchmark',
    assessmentId: assessment.id,
    institutionName: assessment.institution_name,
    generatedAt: new Date().toISOString(),
    benchmarkResults,
    peerComparisonReport,
    summary: {
      overallPercentile: benchmarkResults.overallPercentile,
      strongestDomain: getBestPerformingDomain(benchmarkResults.domainPercentiles),
      improvementPriority: benchmarkResults.improvementAreas[0]?.domain || 'None identified',
      peerComparison: benchmarkResults.peerComparison.averageScore > assessment.ai_readiness_score ? 'Below Average' : 'Above Average'
    }
  });
}

async function generateExecutiveReport(assessment: any) {
  const executiveSummary = generateExecutiveSummary(assessment);
  const strategicRecommendations = generateStrategicRecommendations(assessment);
  const riskAssessment = generateRiskAssessment(assessment);
  const implementationTimeline = generateImplementationTimeline(assessment);

  return NextResponse.json({
    reportType: 'executive',
    assessmentId: assessment.id,
    institutionName: assessment.institution_name,
    generatedAt: new Date().toISOString(),
    executiveSummary,
    strategicRecommendations,
    riskAssessment,
    implementationTimeline,
    keyMetrics: {
      overallReadiness: assessment.ai_readiness_score || 0,
      maturityLevel: assessment.maturity_profile?.overall?.name || 'Unknown',
      criticalGaps: countCriticalGaps(assessment.domain_scores || {}),
      investmentRequired: estimateInvestment(assessment)
    }
  });
}

async function generateDetailedReport(assessment: any) {
  const domainAnalysis = generateDomainAnalysis(assessment.domain_scores || {});
  const questionAnalysis = generateQuestionAnalysis(assessment.responses || []);
  const documentAnalysis = assessment.ai_analysis?.document_insights || null;
  const recommendations = generateDetailedRecommendations(assessment);

  return NextResponse.json({
    reportType: 'detailed',
    assessmentId: assessment.id,
    institutionName: assessment.institution_name,
    generatedAt: new Date().toISOString(),
    domainAnalysis,
    questionAnalysis,
    documentAnalysis,
    recommendations,
    appendices: {
      rawScores: assessment.domain_scores,
      responsesSummary: summarizeResponses(assessment.responses || []),
      uploadedDocuments: assessment.ai_analysis?.uploaded_documents || []
    }
  });
}

async function generateTrendsReport(assessment: any) {
  // Get historical assessments for this institution
  const historicalAssessments = await aiReadinessDatabase.listAssessments();
  const institutionAssessments = historicalAssessments.filter(
    (a: any) => a.institution_name === assessment.institution_name
  ).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const trends = generateTrendAnalysis(institutionAssessments);
  const projections = generateProjections(institutionAssessments);

  return NextResponse.json({
    reportType: 'trends',
    assessmentId: assessment.id,
    institutionName: assessment.institution_name,
    generatedAt: new Date().toISOString(),
    trends,
    projections,
    historicalData: institutionAssessments.map((a: any) => ({
      id: a.id,
      date: a.created_at,
      score: a.ai_readiness_score,
      tier: a.tier
    }))
  });
}

async function generateComprehensiveReport(assessment: any) {
  const [benchmarkData, executiveData, detailedData, trendsData] = await Promise.all([
    generateBenchmarkReport(assessment).then(r => r.json()),
    generateExecutiveReport(assessment).then(r => r.json()),
    generateDetailedReport(assessment).then(r => r.json()),
    generateTrendsReport(assessment).then(r => r.json())
  ]);

  return NextResponse.json({
    reportType: 'comprehensive',
    assessmentId: assessment.id,
    institutionName: assessment.institution_name,
    generatedAt: new Date().toISOString(),
    sections: {
      executive: executiveData,
      benchmark: benchmarkData,
      detailed: detailedData,
      trends: trendsData
    },
    summary: {
      overallScore: assessment.ai_readiness_score || 0,
      maturityLevel: assessment.maturity_profile?.overall?.name || 'Unknown',
      benchmarkPercentile: benchmarkData.benchmarkResults?.overallPercentile || 0,
      keyStrengths: identifyKeyStrengths(assessment),
      priorityAreas: identifyPriorityAreas(assessment)
    }
  });
}

// Helper functions
function generateExecutiveSummary(assessment: any): string {
  const score = assessment.ai_readiness_score || 0;
  const maturityLevel = assessment.maturity_profile?.overall?.name || 'Unknown';
  
  return `Your institution has achieved an AI readiness score of ${score}%, placing you at the ${maturityLevel} maturity level. Based on comprehensive analysis of your organizational readiness, technology infrastructure, and strategic alignment, we have identified key opportunities for advancing your AI capabilities.`;
}

function generateStrategicRecommendations(assessment: any): string[] {
  const recommendations = assessment.ai_analysis?.recommendations || [];
  return recommendations.slice(0, 5).map((rec: any) => 
    typeof rec === 'string' ? rec : rec.title || rec.description || String(rec)
  );
}

function generateRiskAssessment(assessment: any): any {
  const domainScores = assessment.domain_scores || {};
  const risks: any[] = [];
  
  Object.entries(domainScores).forEach(([domain, score]: [string, any]) => {
    const domainScore = typeof score === 'object' ? score.percentage : score;
    if (domainScore < 40) {
      risks.push({
        domain,
        riskLevel: 'High',
        description: `Low readiness in ${domain} may impede AI implementation`,
        mitigation: `Prioritize investment in ${domain} capabilities`
      });
    }
  });
  
  return {
    overallRiskLevel: risks.length > 2 ? 'High' : risks.length > 0 ? 'Medium' : 'Low',
    identifiedRisks: risks,
    recommendations: risks.map(r => r.mitigation)
  };
}

function generateImplementationTimeline(assessment: any): any {
  return {
    phase1: {
      duration: '0-6 months',
      focus: 'Foundation Building',
      activities: ['AI governance framework', 'Infrastructure assessment', 'Staff training']
    },
    phase2: {
      duration: '6-12 months',
      focus: 'Pilot Implementation',
      activities: ['Pilot AI projects', 'Policy development', 'Faculty engagement']
    },
    phase3: {
      duration: '12-24 months',
      focus: 'Scaled Deployment',
      activities: ['Enterprise AI rollout', 'Integration with existing systems', 'Outcome measurement']
    }
  };
}

function generateDomainAnalysis(domainScores: Record<string, any>): any {
  return Object.entries(domainScores).map(([domain, score]) => ({
    domain,
    score: typeof score === 'object' ? score.percentage : score,
    maturityLevel: typeof score === 'object' ? score.maturityLevel : 'Unknown',
    analysis: `Current performance in ${domain} indicates ${typeof score === 'object' ? score.maturityLevel?.toLowerCase() : 'developing'} capabilities.`
  }));
}

function generateQuestionAnalysis(responses: any[]): any {
  const analysis = {
    totalQuestions: responses.length,
    averageResponse: responses.reduce((sum, r) => sum + (r.answer || 0), 0) / responses.length,
    strongAreas: responses.filter(r => r.answer >= 4).length,
    improvementAreas: responses.filter(r => r.answer <= 2).length
  };
  
  return analysis;
}

function generateDetailedRecommendations(assessment: any): any[] {
  const domainScores = assessment.domain_scores || {};
  const recommendations: any[] = [];
  
  Object.entries(domainScores).forEach(([domain, score]: [string, any]) => {
    const domainScore = typeof score === 'object' ? score.percentage : score;
    if (domainScore < 60) {
      recommendations.push({
        domain,
        priority: domainScore < 40 ? 'High' : 'Medium',
        recommendation: `Develop comprehensive ${domain} capabilities`,
        expectedImpact: 'Significant improvement in overall readiness',
        timeline: '3-6 months'
      });
    }
  });
  
  return recommendations;
}

function generateTrendAnalysis(assessments: any[]): any {
  if (assessments.length < 2) {
    return { message: 'Insufficient data for trend analysis' };
  }
  
  const scores = assessments.map(a => a.ai_readiness_score || 0);
  const trend = scores[scores.length - 1] - scores[0];
  
  return {
    direction: trend > 0 ? 'Improving' : trend < 0 ? 'Declining' : 'Stable',
    change: Math.abs(trend),
    assessmentCount: assessments.length,
    timespan: `${assessments[0].created_at} to ${assessments[assessments.length - 1].created_at}`
  };
}

function generateProjections(assessments: any[]): any {
  return {
    sixMonths: 'Projected 10-15% improvement with recommended actions',
    oneYear: 'Potential to reach advanced maturity level',
    confidence: assessments.length >= 3 ? 'High' : 'Medium'
  };
}

function getBestPerformingDomain(percentiles: Record<string, number>): string {
  let best = '';
  let highest = 0;
  
  Object.entries(percentiles).forEach(([domain, percentile]) => {
    if (percentile > highest) {
      highest = percentile;
      best = domain;
    }
  });
  
  return best || 'None identified';
}

function countCriticalGaps(domainScores: Record<string, any>): number {
  return Object.values(domainScores).filter(score => {
    const domainScore = typeof score === 'object' ? score.percentage : score;
    return domainScore < 40;
  }).length;
}

function estimateInvestment(assessment: any): string {
  const score = assessment.ai_readiness_score || 0;
  if (score < 40) return '$100K - $500K';
  if (score < 60) return '$50K - $200K';
  return '$25K - $100K';
}

function summarizeResponses(responses: any[]): any {
  return {
    total: responses.length,
    distribution: {
      stronglyAgree: responses.filter(r => r.answer === 5).length,
      agree: responses.filter(r => r.answer === 4).length,
      neutral: responses.filter(r => r.answer === 3).length,
      disagree: responses.filter(r => r.answer === 2).length,
      stronglyDisagree: responses.filter(r => r.answer === 1).length
    }
  };
}

function identifyKeyStrengths(assessment: any): string[] {
  const domainScores = assessment.domain_scores || {};
  return Object.entries(domainScores)
    .filter(([_, score]: [string, any]) => {
      const domainScore = typeof score === 'object' ? score.percentage : score;
      return domainScore >= 70;
    })
    .map(([domain]) => domain)
    .slice(0, 3);
}

function identifyPriorityAreas(assessment: any): string[] {
  const domainScores = assessment.domain_scores || {};
  return Object.entries(domainScores)
    .filter(([_, score]: [string, any]) => {
      const domainScore = typeof score === 'object' ? score.percentage : score;
      return domainScore < 50;
    })
    .map(([domain]) => domain)
    .slice(0, 3);
}
