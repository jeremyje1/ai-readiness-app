/**
 * Email Test API - Test Postmark Integration
 * Use this to verify email functionality is working
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, name = 'Test User', type = 'welcome' } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 });
    }

    let result;
    
    // Determine the base URL from request or use custom domain
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = host ? `${protocol}://${host}` : 'https://aiblueprint.k12aiblueprint.com';
    
    // Get institutional context from middleware headers
    const institutionType = request.headers.get('x-institution-type') as 'K12' | 'HigherEd' | 'default' || 'default';
    const domainContext = request.headers.get('x-domain-context') || undefined;
    
    if (type === 'welcome') {
      // Test welcome email
      result = await emailService.sendWelcomeEmail({
        userEmail: email,
        userName: name,
        institutionName: 'Test Institution',
        userId: 'test-user-123',
        baseUrl: baseUrl,
        institutionType: institutionType,
        domainContext: domainContext
      });
    } else if (type === 'assessment') {
      // Test assessment notification
      result = await emailService.sendAssessmentNotification({
        userEmail: email,
        userName: name,
        institutionName: 'Test Institution',
        assessmentId: 'test-assessment-123',
        tier: 'comprehensive',
        overallScore: 85,
        maturityLevel: 'Developing',
        baseUrl: baseUrl,
        dashboardUrl: `${baseUrl}/ai-readiness/dashboard`,
        institutionType: institutionType,
        domainContext: domainContext
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid email type. Use "welcome" or "assessment"'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Test ${type} email sent successfully`,
      emailSent: result,
      details: {
        to: email,
        type: type,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email Test Endpoint',
    usage: {
      method: 'POST',
      body: {
        email: 'your-email@example.com',
        name: 'Your Name (optional)',
        type: 'welcome or assessment'
      }
    },
    examples: [
      {
        description: 'Test welcome email',
        curl: `curl -X POST https://ai-readiness-8dz0tnnw7-jeremys-projects-73929cad.vercel.app/api/test-email \\
  -H "Content-Type: application/json" \\
  -d '{"email":"your-email@example.com","name":"Test User","type":"welcome"}'`
      },
      {
        description: 'Test assessment email',
        curl: `curl -X POST https://ai-readiness-8dz0tnnw7-jeremys-projects-73929cad.vercel.app/api/test-email \\
  -H "Content-Type: application/json" \\
  -d '{"email":"your-email@example.com","name":"Test User","type":"assessment"}'`
      }
    ]
  });
}
