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

    // Mock tier performance data
    const mockTierPerformance = {
      '7d': [
        {
          tier: 'AI Transformation Blueprint™',
          type: 'ai-readiness',
          completions: 3,
          revenue: 73500, // $24,500 × 3
          avgScore: 85.2,
          conversionRate: 100.0
        },
        {
          tier: 'AI Readiness Comprehensive',
          type: 'ai-readiness',
          completions: 8,
          revenue: 39960, // $4,995 × 8
          avgScore: 76.8,
          conversionRate: 88.9
        },
        {
          tier: 'Higher Ed AI Pulse Check',
          type: 'ai-readiness',
          completions: 15,
          revenue: 30000, // $2,000 × 15
          avgScore: 68.4,
          conversionRate: 83.3
        }
      ],
      '30d': [
        {
          tier: 'AI Transformation Blueprint™',
          type: 'ai-readiness',
          completions: 52,
          revenue: 1274000, // $24,500 × 52
          avgScore: 81.4,
          conversionRate: 91.2
        },
        {
          tier: 'AI Readiness Comprehensive',
          type: 'ai-readiness',
          completions: 78,
          revenue: 389610, // $4,995 × 78
          avgScore: 75.8,
          conversionRate: 85.4
        },
        {
          tier: 'Higher Ed AI Pulse Check',
          type: 'ai-readiness',
          completions: 124,
          revenue: 248000, // $2,000 × 124
          avgScore: 68.2,
          conversionRate: 78.9
        },
        {
          tier: 'Comprehensive Package',
          type: 'organizational',
          completions: 38,
          revenue: 9466,
          avgScore: 68.7,
          conversionRate: 75.4
        }
      ],
      '90d': [
        {
          tier: 'AI Transformation Blueprint™',
          type: 'ai-readiness',
          completions: 134,
          revenue: 3283000, // $24,500 × 134
          avgScore: 83.1,
          conversionRate: 92.5
        },
        {
          tier: 'AI Readiness Comprehensive',
          type: 'ai-readiness',
          completions: 189,
          revenue: 944055, // $4,995 × 189
          avgScore: 76.3,
          conversionRate: 86.8
        },
        {
          tier: 'Higher Ed AI Pulse Check',
          type: 'ai-readiness',
          completions: 298,
          revenue: 596000, // $2,000 × 298
          avgScore: 69.8,
          conversionRate: 81.2
        },
        {
          tier: 'Monthly Subscription',
          type: 'organizational',
          completions: 189,
          revenue: 18711,
          avgScore: 64.8,
          conversionRate: 73.7
        },
        {
          tier: 'Comprehensive Package',
          type: 'organizational',
          completions: 112,
          revenue: 27888,
          avgScore: 69.3,
          conversionRate: 76.8
        }
      ]
    };

    const tiers = mockTierPerformance[timeframe as keyof typeof mockTierPerformance] || mockTierPerformance['30d'];

    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('Tier performance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tier performance' },
      { status: 500 }
    );
  }
}
