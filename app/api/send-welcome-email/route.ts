import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    service: 'welcome-email',
    postmark_configured: !!process.env.POSTMARK_API_TOKEN,
    ts: Date.now(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, implementationType, subscriptionTier, billingPeriod, loginPassword, isNewAccount, institutionId } = await request.json()

    const postmarkToken = process.env.POSTMARK_API_TOKEN || ''
    if (!postmarkToken) {
      console.error('POSTMARK_API_TOKEN missing; aborting welcome email send')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    // Handle unified pricing structure
    const isUnifiedService = implementationType === 'complete' || subscriptionTier === 'complete'
    const planName = isUnifiedService ? 'Complete AI Implementation Service' : 
                     (subscriptionTier === 'essentials' || subscriptionTier === 'basic' ? 'Essentials' : 'Professional')
    
    const baseUrl = (process.env.NEXTAUTH_URL || 'https://aireadiness.northpathstrategies.org').replace(/\/$/, '')
    const implementationPath = isUnifiedService
      ? (implementationType === 'highered' ? 'highered-implementation' : implementationType === 'k12' ? 'k12-implementation' : 'ai-readiness')
      : (implementationType === 'highered' ? 'highered-implementation' : 'k12-implementation')
    const deepLink = institutionId ? `${baseUrl}/${implementationPath}?institutionId=${encodeURIComponent(institutionId)}`
                                   : `${baseUrl}/${implementationPath}`
    
  const fromEmail = process.env.FROM_EMAIL || 'info@northpathstrategies.org'
  const replyTo = process.env.REPLY_TO_EMAIL || 'info@northpathstrategies.org'
  const messageStream = process.env.POSTMARK_MESSAGE_STREAM || 'outbound'

  const HtmlBody = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to AI Blueprint!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your 7-day free trial has started</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Congratulations! Your AI Blueprint ${isUnifiedService ? 'Complete Implementation' : (implementationType === 'highered' ? 'Higher Education' : 'K-12')} trial has been activated.
            </p>
            
            ${isUnifiedService ? `
            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h4 style="margin-top: 0; color: #0c4a6e; font-size: 16px;">🤖 Fully Autonomous Implementation</h4>
              <p style="margin: 0; color: #075985; font-size: 14px;">
                This service is completely AI-powered and requires no human intervention. All analysis, reporting, and implementation guidance is automated.
              </p>
            </div>
            ` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333;">Your Trial Details:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Plan:</strong> ${planName}</li>
                <li><strong>Trial Period:</strong> 7 days (ends on ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})</li>
                <li><strong>Full Access:</strong> All features unlocked during trial</li>
                ${billingPeriod ? `<li><strong>Billing:</strong> ${billingPeriod === 'yearly' ? 'Annual ($999.99/year)' : 'Monthly ($99.99/month)'}</li>` : ''}
                <li><strong>No Charge:</strong> Your card won't be charged until trial ends</li>
              </ul>
            </div>
            
            ${isNewAccount && loginPassword ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">🔐 Your Login Credentials</h3>
              <p style="color: #92400e; font-size: 14px; margin-bottom: 10px;">
                We've created your account. Use these credentials to access your dashboard:
              </p>
              <div style="background: white; padding: 15px; border-radius: 5px; font-family: monospace;">
                <p style="margin: 5px 0; color: #1f2937;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0; color: #1f2937;"><strong>Password:</strong> ${loginPassword}</p>
              </div>
              <p style="color: #92400e; font-size: 12px; margin-top: 10px; margin-bottom: 0;">
                ⚠️ Please change your password after your first login for security.
              </p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${deepLink}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                ${isNewAccount ? 'Sign In to Your Dashboard' : 'Access Your Dashboard'}
              </a>
            </div>
            
            <h3 style="color: #333;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>🚀 AI begins generating your implementation plan immediately</li>
              <li>📊 All reports and policies are created autonomously</li>
              <li>📧 You'll receive progress updates via email</li>
              <li>💳 Billing starts after your 7-day trial (cancel anytime)</li>
              ${isUnifiedService ? '<li>🤝 Optional human consultation available for additional fee</li>' : ''}
            </ul>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0066cc; font-weight: bold;">
                📧 Save this email - it contains your access information!
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Questions? Reply to this email or contact us at <a href="mailto:info@northpathstrategies.org" style="color: #667eea;">info@northpathstrategies.org</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              North Path Strategies<br>
              AI Blueprint Implementation Services<br>
              <a href="mailto:info@northpathstrategies.org" style="color: #999;">info@northpathstrategies.org</a>
            </p>
          </div>
        </div>
      `

    // Send email using Postmark API
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkToken,
      },
      body: JSON.stringify({
        From: fromEmail,
        To: email,
        ReplyTo: replyTo,
        Subject: 'Welcome to AI Blueprint - Your 7-Day Free Trial Started! 🎉',
        HtmlBody,
        MessageStream: messageStream,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Postmark API error:', response.status, errorData)
      throw new Error(`Postmark API error: ${response.status}`)
    }

    console.log('Welcome email sent via Postmark:', email)

    // Optional admin notification
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      try {
        await fetch('https://api.postmarkapp.com/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': postmarkToken,
          },
          body: JSON.stringify({
            From: fromEmail,
            To: process.env.ADMIN_NOTIFICATION_EMAIL,
            Subject: 'New Trial Activated',
            HtmlBody: `<p>New trial started for <strong>${email}</strong><br/>Type: ${implementationType || 'n/a'}<br/>Billing: ${billingPeriod || 'n/a'}</p>`,
            MessageStream: messageStream,
          }),
        })
      } catch (e) {
        console.warn('Admin notification email failed', e)
      }
    }

    return NextResponse.json({ success: true, message: 'Welcome email sent successfully' })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
