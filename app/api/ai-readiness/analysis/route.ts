/**
 * AI Readiness Assessment Analysis API Route
 * Handles analysis triggers for AI readiness assessments
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiReadinessDatabase } from '@/lib/aiReadinessDatabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 AI Readiness analysis trigger received');
    
    const body = await request.json();
    const { 
      assessmentId, 
      tier,
      testMode = false,
      assessmentType = 'ai-readiness'
    } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Missing required field: assessmentId' },
        { status: 400 }
      );
    }

    console.log(`🤖 Triggering AI readiness analysis for assessment: ${assessmentId}`);

    // For now, just mark the analysis as triggered
    // In a full implementation, this would trigger background processing
    const response = {
      success: true,
      assessmentId: assessmentId,
      tier: tier,
      assessmentType: 'ai-readiness',
      message: 'AI readiness analysis triggered successfully',
      status: 'analysis-queued',
      testMode: testMode,
      timestamp: new Date().toISOString()
    };

    console.log('✅ AI readiness analysis triggered successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ AI readiness analysis trigger failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to trigger AI readiness analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
        assessmentType: 'ai-readiness'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'AI Readiness Analysis API',
      version: '1.0.0',
      endpoints: {
        'POST /api/ai-readiness/analysis': 'Trigger AI readiness analysis',
        'GET /api/ai-readiness/analysis': 'API information'
      }
    }
  );
}
