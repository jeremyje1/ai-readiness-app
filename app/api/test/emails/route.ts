/**
 * Email Testing Endpoint
 * 
 * This endpoint allows testing all email templates in development mode.
 * It's disabled in production for security.
 * 
 * Usage:
 * GET /api/test/emails?email=your@email.com&template=all
 * 
 * Templates: all, welcome, assessment, blueprint, trial, reengagement
 */

import { emailTouchpoints } from '@/lib/email-touchpoints';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_EMAIL_TESTING !== 'true') {
    return NextResponse.json(
      { error: 'Email testing endpoint is disabled in production' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'test@example.com';
  const template = searchParams.get('template') || 'all';

  const testUser = {
    email,
    name: 'Test User',
    institutionName: 'Test University',
    institutionType: 'University' as const
  };

  const testAssessment = {
    id: 'test-assessment-123',
    completedAt: new Date().toISOString(),
    overallScore: 75,
    maturityLevel: 'Developing'
  };

  const testBlueprint = {
    id: 'test-blueprint-123',
    title: 'AI Implementation Blueprint for Test University',
    generatedAt: new Date().toISOString(),
    status: 'complete'
  };

  const testStats = {
    blueprintsCreated: 3,
    tasksCompleted: 5,
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    progressPercentage: 60
  };

  try {
    const results: any = {
      email,
      template,
      timestamp: new Date().toISOString(),
      sent: []
    };

    // Send based on template parameter
    if (template === 'all' || template === 'welcome') {
      const welcomeResult = await emailTouchpoints.sendWelcomeEmail(testUser, false);
      results.sent.push({ template: 'welcome', result: welcomeResult });
    }

    if (template === 'all' || template === 'welcome-with-password') {
      const welcomePasswordResult = await emailTouchpoints.sendWelcomeEmail(testUser, true);
      results.sent.push({ template: 'welcome-with-password', result: welcomePasswordResult });
    }

    if (template === 'all' || template === 'assessment-started') {
      const assessmentStartedResult = await emailTouchpoints.sendAssessmentStartedEmail(testUser);
      results.sent.push({ template: 'assessment-started', result: assessmentStartedResult });
    }

    if (template === 'all' || template === 'assessment-completed') {
      const assessmentCompletedResult = await emailTouchpoints.sendAssessmentCompletedEmail(
        testUser,
        testAssessment
      );
      results.sent.push({ template: 'assessment-completed', result: assessmentCompletedResult });
    }

    if (template === 'all' || template === 'blueprint') {
      const blueprintResult = await emailTouchpoints.sendBlueprintGeneratedEmail(
        testUser,
        testBlueprint
      );
      results.sent.push({ template: 'blueprint', result: blueprintResult });
    }

    if (template === 'all' || template === 'trial') {
      const trialResult = await emailTouchpoints.sendTrialEndingSoonEmail(testUser, 3);
      results.sent.push({ template: 'trial-ending', result: trialResult });
    }

    if (template === 'all' || template === 'progress') {
      const progressResult = await emailTouchpoints.sendWeeklyProgressEmail(testUser, testStats);
      results.sent.push({ template: 'weekly-progress', result: progressResult });
    }

    if (template === 'all' || template === 'reengagement') {
      const reengagementResult = await emailTouchpoints.sendReEngagementEmail(testUser, 7);
      results.sent.push({ template: 're-engagement', result: reengagementResult });
    }

    // Count successes
    const successCount = results.sent.filter((r: any) => r.result.success).length;
    const failureCount = results.sent.filter((r: any) => !r.result.success).length;

    return NextResponse.json({
      ...results,
      summary: {
        total: results.sent.length,
        success: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Email testing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test emails',
        details: error instanceof Error ? error.message : 'Unknown error',
        email,
        template
      },
      { status: 500 }
    );
  }
}

// Export metadata for Next.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
