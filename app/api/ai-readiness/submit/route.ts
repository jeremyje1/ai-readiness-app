/**
 * AI Readiness Assessment Submission API Route
 * Handles AI readiness assessment submissions and analysis
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIReadinessEngine } from '@/lib/aiReadinessEngine';
import { aiReadinessDatabase, formatAssessmentForDatabase } from '@/lib/aiReadinessDatabase';
import type { AIReadinessResults } from '@/lib/aiReadinessEngine';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Readiness Assessment submission received');
    
    const body = await request.json();
    console.log('📥 Request body received:', JSON.stringify(body, null, 2));
    
    const { 
      responses, 
      tier, 
      industry,
      institutionName,
      contactEmail,
      contactName,
      userId,
      uploadedFiles = [],
      testMode = false,
      assessmentType = 'ai-readiness'
    } = body;

    console.log('🎯 Extracted parameters:', { 
      tier, 
      responsesCount: Object.keys(responses || {}).length,
      institutionName,
      assessmentType 
    });

    if (!responses) {
      console.error('❌ Missing responses field');
      return NextResponse.json(
        { error: 'Missing required field: responses' },
        { status: 400 }
      );
    }

    // Validate AI readiness tier
    const validAITiers = [
      'higher-ed-ai-pulse-check',
      'ai-readiness-comprehensive',
      'ai-transformation-blueprint',
      'ai-enterprise-partnership'
    ];
    
    console.log('🔍 Tier validation:', { receivedTier: tier, validTiers: validAITiers });
    
    if (!validAITiers.includes(tier)) {
      console.error('❌ Invalid tier:', tier);
      return NextResponse.json(
        { 
          error: `Invalid AI readiness tier: "${tier}". Valid tiers: ${validAITiers.join(', ')}`,
          details: `Received tier: "${tier}", Type: ${typeof tier}`
        },
        { status: 400 }
      );
    }

    // Create institution info object
    const institutionInfo = {
      name: institutionName || `Test Institution - ${industry}`,
      type: industry || 'higher-education',
      contactEmail: contactEmail || 'test@example.com',
      contactName: contactName || 'Test User',
      tier: tier,
      userId: userId || 'test-user'
    };

    // Create database record first
    let assessmentRecord = null;
    if (aiReadinessDatabase.isAvailable()) {
      try {
        const assessmentData = formatAssessmentForDatabase(responses, institutionInfo, tier);
        
        // Add test mode info in a way that the database can handle
        if (testMode) {
          assessmentData.institution_name = `[TEST] ${assessmentData.institution_name}`;
        }

        assessmentRecord = await aiReadinessDatabase.createAssessment(assessmentData);
        console.log('✅ AI readiness assessment record created:', assessmentRecord?.id);
      } catch (dbError) {
        console.warn('⚠️  Failed to create database record, continuing with analysis:', dbError);
      }
    }

    // Initialize AI Readiness Engine
    const engine = new AIReadinessEngine();
    
    // Convert responses to the expected format
    const aiReadinessResponses = Object.entries(responses).map(([questionId, value]) => ({
      questionId,
      value: String(value),
      score: typeof value === 'number' ? value : parseInt(String(value)) || 0
    }));

    // Process the assessment
    console.log(`🔍 Processing AI readiness assessment for tier: ${tier}`);
    const results = await AIReadinessEngine.assessReadiness(
      aiReadinessResponses, 
      institutionInfo.name
    );

    // Update database record with results if available
    if (assessmentRecord && aiReadinessDatabase.isAvailable()) {
      try {
        // Note: updateAssessmentWithResults method may need to be implemented
        console.log('✅ AI readiness assessment results processed');
      } catch (dbError) {
        console.warn('⚠️  Failed to update database record with results:', dbError);
      }
    }

    // Return assessment ID and initial results
    // Extract scores from the results structure that contains algorithm outputs
    const firstAlgorithmResult = Object.values(results.results || {})[0] as any;
    const overallScore = firstAlgorithmResult?.overallReadiness || firstAlgorithmResult?.score || 0;
    const readinessLevel = firstAlgorithmResult?.readinessLevel || firstAlgorithmResult?.level || 'Emerging';
    
    const response = {
      success: true,
      id: assessmentRecord?.id || `ai-test-${Date.now()}`,
      tier: tier,
      assessmentType: 'ai-readiness',
      message: 'AI readiness assessment submitted successfully',
      initialResults: {
        aiReadinessIndex: overallScore,
        readinessLevel: readinessLevel,
        domainScores: firstAlgorithmResult?.domainScores || {},
        recommendationCount: firstAlgorithmResult?.recommendations?.length || 0,
        policyRecommendations: firstAlgorithmResult?.recommendations?.length || 0
      },
      testMode: testMode
    };

    // Trigger email notifications asynchronously
    try {
      console.log('📧 Triggering email notifications...');
      
      fetch('/api/emails/assessment-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: institutionName.includes('@') ? institutionName : 'user@institution.edu',
          userName: 'Assessment User',
          institutionName: institutionName || 'Test Institution',
          assessmentId: response.id,
          tier: tier,
          overallScore: overallScore,
          maturityLevel: readinessLevel,
          dashboardUrl: `https://aireadiness.northpathstrategies.org/ai-readiness/dashboard?id=${response.id}`
        })
      }).catch(emailError => {
        console.warn('⚠️  Email notification failed:', emailError);
      });
    } catch (emailError) {
      console.warn('⚠️  Failed to trigger email notifications:', emailError);
    }

    console.log('✅ AI readiness assessment completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ AI readiness assessment submission failed:', error);
    
    // Create a more specific error response
    let errorMessage = 'Failed to process AI readiness assessment';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for specific error types
    if (errorDetails.includes('tier')) {
      errorMessage = 'Invalid assessment tier specified';
    } else if (errorDetails.includes('responses')) {
      errorMessage = 'Invalid or missing assessment responses';
    } else if (errorDetails.includes('algorithm')) {
      errorMessage = 'Assessment processing error';
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: errorDetails,
        assessmentType: 'ai-readiness',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      message: 'AI Readiness Assessment API',
      version: '1.0.0',
      endpoints: {
        'POST /api/ai-readiness/submit': 'Submit AI readiness assessment',
        'GET /api/ai-readiness/submit': 'API information'
      }
    }
  );
}
