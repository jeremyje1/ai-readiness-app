/**
 * AI Readiness Assessment Submission API Route
 * Handles AI readiness assessment submissions and analysis
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 */

import { aiReadinessDatabase, formatAssessmentForDatabase } from '@/lib/aiReadinessDatabase';
import { AIReadinessEngine } from '@/lib/aiReadinessEngine';
import { calculateEnterpriseMetrics, persistEnterpriseMetrics } from '@/lib/algorithms';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Readiness Assessment submission received');

    const body = await request.json();
    console.log('📥 Request body received:', JSON.stringify(body, null, 2));

    const {
      responses,
      tier,
      mode, // New mode-based parameter
      industry,
      institutionName,
      contactEmail,
      contactName,
      userId,
      uploadedFiles = [],
      testMode = false,
      assessmentType = 'ai-readiness'
    } = body;

    // Support both old tier system and new mode system
    const assessmentMode = mode || 'quick';
    const assessmentTier = tier || (assessmentMode === 'comprehensive' ? 'ai-readiness-comprehensive' : 'higher-ed-ai-pulse-check');

    console.log('🎯 Extracted parameters:', {
      tier: assessmentTier,
      mode: assessmentMode,
      originalTier: tier,
      originalMode: mode,
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

    console.log('🔍 Tier validation:', { receivedTier: assessmentTier, validTiers: validAITiers });

    if (!validAITiers.includes(assessmentTier)) {
      console.error('❌ Invalid tier:', assessmentTier);
      return NextResponse.json(
        {
          error: `Invalid AI readiness tier: "${assessmentTier}". Valid tiers: ${validAITiers.join(', ')}`,
          details: `Received tier: "${assessmentTier}", Type: ${typeof assessmentTier}, Mode: "${assessmentMode}"`
        },
        { status: 400 }
      );
    }

    // Derive user id (prefer header, then body)
    const derivedUserId = request.headers.get('x-user-id') || userId || null;

    // Create institution info object
    const institutionInfo = {
      name: institutionName || `Test Institution - ${industry}`,
      type: industry || 'higher-education',
      contactEmail: contactEmail || 'test@example.com',
      contactName: contactName || 'Test User',
      tier: assessmentTier,
      mode: assessmentMode,
      userId: derivedUserId || 'test-user'
    };

    // Create database record first
    let assessmentRecord = null;
    if (aiReadinessDatabase.isAvailable()) {
      try {
        const assessmentData = formatAssessmentForDatabase(responses, institutionInfo, assessmentTier);

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
    console.log(`🔍 Processing AI readiness assessment for tier: ${assessmentTier}`);
    const results = await AIReadinessEngine.assessReadiness(
      aiReadinessResponses,
      institutionInfo.name
    );

    // Persist enterprise algorithm metrics (lightweight example using minimal org metrics subset)
    try {
      // Derive lightweight pseudo org metrics from response distribution as placeholders
      const numericScores = aiReadinessResponses.map(r => r.score).filter((n: any) => typeof n === 'number');
      const avg = numericScores.length ? numericScores.reduce((a: number, b: number) => a + b, 0) / numericScores.length : 0;
      const normalize = (v: number) => Math.min(1, Math.max(0, v / 5));
      const orgMetrics = {
        digitalMaturity: normalize(avg),
        systemIntegration: normalize(avg * 0.9),
        collaborationIndex: normalize(avg * 0.85),
        innovationCapacity: normalize(avg * 0.88),
        strategicAgility: normalize(avg * 0.8),
        leadershipEffectiveness: normalize(avg * 0.92),
        decisionLatency: 1 - normalize(avg * 0.75), // inverse style metric
        communicationEfficiency: normalize(avg * 0.9),
        employeeEngagement: normalize(avg * 0.87),
        changeReadiness: normalize(avg * 0.86),
        futureReadiness: normalize(avg * 0.83),
        processComplexity: 1 - normalize(avg * 0.7), // higher score -> lower complexity
        operationalRisk: 1 - normalize(avg * 0.65),
        technologicalRisk: 1 - normalize(avg * 0.6),
        cybersecurityLevel: normalize(avg * 0.9),
        resourceUtilization: normalize(avg * 0.88),
        taskAutomationLevel: normalize(avg * 0.5)
      };
      const enterpriseMetrics = await calculateEnterpriseMetrics({ responses: aiReadinessResponses }, orgMetrics);
      if (assessmentRecord?.id) {
        await persistEnterpriseMetrics(assessmentRecord.id, { ...enterpriseMetrics, meta: { ...enterpriseMetrics.meta, userId: derivedUserId || null } } as any);
      }
    } catch (algoPersistError) {
      console.warn('⚠️  Failed to persist enterprise algorithm metrics:', algoPersistError);
    }

    // Return assessment ID and initial results
    // Extract scores from the results structure that contains algorithm outputs
    const firstAlgorithmResult = Object.values(results.results || {})[0] as any;
    const overallScore = results.overallScore || firstAlgorithmResult?.overallReadiness || firstAlgorithmResult?.score || 0;
    const readinessLevel = results.maturityLevel || firstAlgorithmResult?.readinessLevel || firstAlgorithmResult?.level || 'Emerging';

    const response = {
      success: true,
      id: assessmentRecord?.id || `ai-test-${Date.now()}`,
      tier: assessmentTier,
      mode: assessmentMode,
      assessmentType: 'ai-readiness',
      message: 'AI readiness assessment submitted successfully',
      initialResults: {
        aiReadinessIndex: overallScore,
        readinessLevel: readinessLevel,
        domainScores: results.domainScores || firstAlgorithmResult?.domainScores || {},
        recommendationCount: (results.recommendations || firstAlgorithmResult?.recommendations || []).length,
        policyRecommendations: (results.recommendations || firstAlgorithmResult?.recommendations || []).length,
        algorithmResults: results.algorithmResults || {}
      },
      testMode: testMode
    };

    // Trigger email notifications asynchronously
    try {
      console.log('📧 Triggering email notifications...');

      // Use the email service directly instead of fetch
      const { emailService } = await import('@/lib/email-service');

      // Determine the base URL from request or use custom domain
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const baseUrl = host ? `${protocol}://${host}` : 'https://aiblueprint.k12aiblueprint.com';

      // Get institutional context from middleware headers
      const institutionType = request.headers.get('x-institution-type') as 'K12' | 'HigherEd' | 'default' || 'default';
      const domainContext = request.headers.get('x-domain-context') || undefined;

      const emailResult = await emailService.sendAssessmentNotification({
        userEmail: contactEmail || 'user@institution.edu',
        userName: contactName || 'Assessment User',
        institutionName: institutionName || 'Test Institution',
        assessmentId: response.id,
        tier: assessmentTier || 'comprehensive',
        overallScore: overallScore,
        maturityLevel: readinessLevel,
        baseUrl: baseUrl,
        dashboardUrl: `${baseUrl}/ai-readiness/results?id=${response.id}`,
        institutionType: institutionType,
        domainContext: domainContext
      });

      console.log('📧 Email notification result:', emailResult);

    } catch (emailError) {
      console.warn('⚠️  Failed to send email notifications:', emailError);
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
