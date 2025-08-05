import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('stardynamics1124*')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock recent activity data
    const mockActivities = [
      {
        id: '1',
        type: 'assessment_completed',
        description: 'AI Transformation Blueprint™ completed by University of California',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        tier: 'ai-transformation-blueprint'
      },
      {
        id: '2',
        type: 'payment_processed',
        description: 'Payment processed for AI Readiness Comprehensive',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        value: 4995
      },
      {
        id: '3',
        type: 'user_registered',
        description: 'New user registered: MIT Administration',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '4',
        type: 'assessment_completed',
        description: 'Higher Ed AI Pulse Check completed by Stanford University',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        tier: 'higher-ed-ai-pulse-check'
      },
      {
        id: '5',
        type: 'payment_processed',
        description: 'AI Transformation Blueprint™ purchase',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        value: 24500
      },
      {
        id: '6',
        type: 'assessment_completed',
        description: 'AI Readiness Comprehensive completed by Harvard University',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        tier: 'ai-readiness-comprehensive'
      },
      {
        id: '7',
        type: 'user_registered',
        description: 'New user registered: Yale University IT',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      },
      {
        id: '8',
        type: 'payment_processed',
        description: 'Enterprise Partnership consultation booking',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        value: 24995 // Enterprise Partnership pricing
      },
      {
        id: '9',
        type: 'assessment_completed',
        description: 'AI Transformation Blueprint™ completed by Princeton',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        tier: 'ai-transformation-blueprint'
      },
      {
        id: '10',
        type: 'user_registered',
        description: 'New user registered: Columbia University Strategy',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
      }
    ];

    const activities = mockActivities.slice(0, limit);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard activity' },
      { status: 500 }
    );
  }
}
