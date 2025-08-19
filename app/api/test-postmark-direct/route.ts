import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'postmark';

export async function POST(request: NextRequest) {
  try {
    const postmarkToken = process.env.POSTMARK_API_TOKEN;
    
    if (!postmarkToken) {
      return NextResponse.json({
        success: false,
        error: 'No Postmark token found'
      });
    }

    const client = new Client(postmarkToken);
    
    const { email } = await request.json();
    
    const result = await client.sendEmail({
      From: 'info@northpathstrategies.org',
      To: email || 'test@example.com',
      Subject: 'Direct Postmark Test',
      HtmlBody: '<p>This is a direct test of Postmark API</p>',
      MessageStream: 'outbound'
    });

    console.log('✅ Direct Postmark test successful:', result);

    return NextResponse.json({
      success: true,
      messageId: result.MessageID,
      to: result.To,
      submittedAt: result.SubmittedAt
    });

  } catch (error) {
    console.error('❌ Direct Postmark test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      errorCode: (error as any).code,
      details: error
    }, { status: 500 });
  }
}
