import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('stardynamics1124*')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '30d';

    // Mock data - in production, this would query your database
    const mockStats = {
      '7d': {
        totalAssessments: 47,
        completedAssessments: 38,
        activeUsers: 23,
        revenue: 157500, // Higher Ed AI revenue
        conversionRate: 80.8,
        avgCompletionTime: 35,
        topTier: 'AI Transformation Blueprint™',
        growthRate: 18.2
      },
      '30d': {
        totalAssessments: 347,
        completedAssessments: 285,
        activeUsers: 198,
        revenue: 1756209, // Higher revenue reflecting AI Blueprint pricing
        conversionRate: 82.1,
        avgCompletionTime: 38,
        topTier: 'AI Transformation Blueprint™',
        growthRate: 34.7
      },
      '90d': {
        totalAssessments: 892,
        completedAssessments: 734,
        activeUsers: 487,
        revenue: 4285750, // Quarterly AI Blueprint revenue
        conversionRate: 82.3,
        avgCompletionTime: 41,
        topTier: 'AI Transformation Blueprint™',
        growthRate: 28.9
      }
    };

    const stats = mockStats[timeframe as keyof typeof mockStats] || mockStats['30d'];

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
