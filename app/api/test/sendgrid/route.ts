import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to validate SendGrid configuration
 * Access: https://aiblueprint.educationaiblueprint.com/api/test/sendgrid
 */
export async function GET(request: NextRequest) {
  try {
    // Check if API key is set
    const apiKey = process.env.SENDGRID_API_KEY?.trim().replace(/^["']|["']$/g, '');
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'SENDGRID_API_KEY environment variable is not set',
        debug: {
          apiKeyPresent: false,
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'not set',
          toEmail: process.env.SENDGRID_TO_EMAIL || 'not set'
        }
      }, { status: 500 });
    }

    // Attempt to send a test email
    const testEmail = {
      personalizations: [{
        to: [{ 
          email: process.env.SENDGRID_TO_EMAIL || 'info@northpathstrategies.org',
          name: 'Test Recipient'
        }],
        subject: '✅ SendGrid Test Email - Education AI Blueprint'
      }],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@northpathstrategies.org',
        name: 'Education AI Blueprint - Test System'
      },
      content: [{
        type: 'text/html',
        value: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; }
    .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
    .success { color: #10b981; font-weight: bold; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>SendGrid Configuration Test</h2>
    </div>
    <div class="content">
      <p class="success">✅ SUCCESS! Your SendGrid API configuration is working correctly.</p>
      
      <h3>Configuration Details:</h3>
      <ul>
        <li><strong>API Key:</strong> Present and valid (${apiKey.substring(0, 10)}...)</li>
        <li><strong>From Email:</strong> ${process.env.SENDGRID_FROM_EMAIL || 'info@northpathstrategies.org'}</li>
        <li><strong>To Email:</strong> ${process.env.SENDGRID_TO_EMAIL || 'info@northpathstrategies.org'}</li>
        <li><strong>Test Time:</strong> ${new Date().toISOString()}</li>
      </ul>
      
      <h3>What This Means:</h3>
      <p>Your SendGrid integration is properly configured and emails can be sent successfully.</p>
      
      <h3>Next Steps:</h3>
      <ol>
        <li>Test demo assessment email flow</li>
        <li>Verify user results emails are delivered</li>
        <li>Verify sales notification emails are delivered</li>
      </ol>
      
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        This is an automated test email from the Education AI Blueprint platform.<br>
        Endpoint: <code>/api/test/sendgrid</code>
      </p>
    </div>
  </div>
</body>
</html>
        `
      }]
    };

    console.log('🧪 Testing SendGrid configuration...');
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey.length);
    console.log('From email:', process.env.SENDGRID_FROM_EMAIL);
    console.log('To email:', process.env.SENDGRID_TO_EMAIL);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testEmail)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SendGrid API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });

      return NextResponse.json({
        success: false,
        error: 'SendGrid API returned an error',
        debug: {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          apiKeyPresent: true,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 10),
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'not set',
          toEmail: process.env.SENDGRID_TO_EMAIL || 'not set'
        }
      }, { status: 500 });
    }

    console.log('✅ SendGrid test email sent successfully!');

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully! Check your inbox.',
      debug: {
        apiKeyPresent: true,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 10),
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'info@northpathstrategies.org',
        toEmail: process.env.SENDGRID_TO_EMAIL || 'info@northpathstrategies.org',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error testing SendGrid:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      debug: {
        errorMessage: error.message,
        errorStack: error.stack?.substring(0, 500)
      }
    }, { status: 500 });
  }
}
