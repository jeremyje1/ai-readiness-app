import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

// Prevent static optimization and restrict to development / explicitly enabled environments
export const dynamic = 'force-dynamic';

// Set ENABLE_DEBUG_EMAILS=true in env to allow this endpoint outside of development
const ALLOWED = process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG_EMAILS === 'true';

export async function GET(request: NextRequest) {
  if (!ALLOWED) {
    return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 });
  }
  try {
    // Check environment variables
    const envCheck = {
      POSTMARK_API_TOKEN: !!process.env.POSTMARK_API_TOKEN,
      POSTMARK_SERVER_TOKEN: !!process.env.POSTMARK_SERVER_TOKEN,
      FROM_EMAIL: process.env.FROM_EMAIL,
      POSTMARK_FROM_EMAIL: process.env.POSTMARK_FROM_EMAIL,
      REPLY_TO_EMAIL: process.env.REPLY_TO_EMAIL,
      POSTMARK_REPLY_TO: process.env.POSTMARK_REPLY_TO,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL
    };

    console.log('🔧 Environment check:', envCheck);

    // Try to send a simple test email
    const testResult = await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Debug Test Email',
      htmlBody: '<p>This is a debug test email</p>'
    });

    return NextResponse.json({
      success: true,
      environment: envCheck,
      emailTestResult: testResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
