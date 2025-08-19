import { NextRequest, NextResponse } from 'next/server';
import { aiReadinessDatabase } from '@/lib/aiReadinessDatabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    const tier = searchParams.get('tier') || 'all';
    const action = searchParams.get('action');

    if (action === 'export') {
      return await exportAnalytics(range, tier);
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const analytics = await getEnhancedAnalytics(
      startDate.toISOString(), 
      endDate.toISOString(), 
      tier
    );

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getEnhancedAnalytics(startDate: string, endDate: string, tier: string) {
  // Get basic analytics from database
  const baseAnalytics = await aiReadinessDatabase.getAnalytics(startDate, endDate);
  
  // Mock enhanced analytics (replace with actual database queries)
  const enhancedAnalytics = {
    totalAssessments: baseAnalytics?.totalAssessments || 0,
    averageScore: baseAnalytics?.averageScore || 0,
    completionRate: baseAnalytics?.completionRate || 0,
    topRecommendations: baseAnalytics?.topRecommendations || [
      'Develop comprehensive AI governance framework',
      'Invest in faculty AI training and curriculum integration',
      'Upgrade technical infrastructure and data management',
      'Implement change management processes',
      'Establish regulatory compliance protocols'
    ],
    
    // Enhanced metrics
    tierDistribution: {
      'pulse-check': Math.floor(Math.random() * 50) + 10,
      'comprehensive': Math.floor(Math.random() * 30) + 20,
      'transformation': Math.floor(Math.random() * 20) + 5,
      'enterprise': Math.floor(Math.random() * 10) + 2
    },
    
    domainAverages: {
      'AI Strategy & Governance': Math.floor(Math.random() * 40) + 50,
      'Pedagogical Integration': Math.floor(Math.random() * 40) + 45,
      'Technology Infrastructure': Math.floor(Math.random() * 40) + 55,
      'Organizational Readiness': Math.floor(Math.random() * 40) + 48,
      'Compliance & Risk Management': Math.floor(Math.random() * 40) + 52
    },
    
    monthlyTrends: generateMonthlyTrends(),
    
    institutionTypes: {
      'Community College': Math.floor(Math.random() * 20) + 10,
      'Public University': Math.floor(Math.random() * 15) + 15,
      'Private University': Math.floor(Math.random() * 12) + 8,
      'Research Institution': Math.floor(Math.random() * 8) + 5
    },
    
    benchmarkData: {
      percentile: Math.floor(Math.random() * 40) + 55,
      peerAverage: Math.floor(Math.random() * 20) + 55,
      industryAverage: Math.floor(Math.random() * 15) + 60
    }
  };

  return enhancedAnalytics;
}

function generateMonthlyTrends() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    assessments: Math.floor(Math.random() * 20) + 5,
    avgScore: Math.floor(Math.random() * 40) + 50
  }));
}

async function exportAnalytics(range: string, tier: string) {
  // Get analytics data
  const endDate = new Date();
  const startDate = new Date();
  
  switch (range) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  const analytics = await getEnhancedAnalytics(
    startDate.toISOString(), 
    endDate.toISOString(), 
    tier
  );

  // Create CSV content
  const csvContent = [
    ['Metric', 'Value'],
    ['Total Assessments', analytics.totalAssessments],
    ['Average Score', `${analytics.averageScore}%`],
    ['Completion Rate', `${analytics.completionRate}%`],
    [''],
    ['Domain Averages'],
    ...Object.entries(analytics.domainAverages).map(([domain, score]) => [domain, `${score}%`]),
    [''],
    ['Tier Distribution'],
    ...Object.entries(analytics.tierDistribution).map(([tier, count]) => [tier, count]),
    [''],
    ['Top Recommendations'],
    ...analytics.topRecommendations.map((rec: string, i: number) => [`${i + 1}`, rec])
  ].map(row => row.join(',')).join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="ai-readiness-analytics-${range}.csv"`
    }
  });
}
