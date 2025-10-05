/**
 * Assessment Notification Email API
 * Sends email notifications when assessments are completed
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { 
      userEmail, 
      userName, 
      institutionName, 
      assessmentId, 
      tier, 
      overallScore, 
      maturityLevel,
      dashboardUrl 
    } = await request.json();

    // Validate required fields
    if (!userEmail || !userName || !institutionName || !assessmentId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userEmail, userName, institutionName, assessmentId'
      }, { status: 400 });
    }

    // Send assessment notification emails
    const result = await emailService.sendAssessmentNotification({
      userEmail,
      userName,
      institutionName,
      assessmentId,
      tier: tier || 'comprehensive',
      overallScore: overallScore || 0,
      maturityLevel: maturityLevel || 'Unknown',
      dashboardUrl: dashboardUrl || 'https://aiblueprint.educationaiblueprint.com/dashboard/personalized'
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment notification emails sent',
      emailsSent: {
        client: result.clientSent,
        admin: result.adminSent
      },
      details: {
        clientEmail: userEmail,
        adminEmail: process.env.ADMIN_EMAIL || 'info@northpathstrategies.org',
        assessmentId,
        institution: institutionName
      }
    });

  } catch (error) {
    console.error('Error sending assessment notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send assessment notification emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
