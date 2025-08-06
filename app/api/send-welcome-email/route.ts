import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

export async function POST(request: NextRequest) {
  try {
    const { email, name, implementationType, subscriptionTier } = await request.json()

    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

    const welcomeEmail = {
      to: email,
      from: 'info@northpathstrategies.org',
      subject: 'Welcome to AI Blueprint - Your 7-Day Free Trial Started! 🎉',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to AI Blueprint!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your 7-day free trial has started</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Congratulations! Your AI Blueprint ${implementationType === 'highered' ? 'Higher Education' : 'K-12'} implementation trial has been activated.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333;">Your Trial Details:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Plan:</strong> ${subscriptionTier === 'essentials' || subscriptionTier === 'basic' ? 'Essentials' : 'Professional'}</li>
                <li><strong>Trial Period:</strong> 7 days (ends on ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()})</li>
                <li><strong>Full Access:</strong> All features unlocked during trial</li>
                <li><strong>No Charge:</strong> Your card won't be charged until trial ends</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'https://aireadiness.northpathstrategies.org'}/${implementationType === 'highered' ? 'highered-implementation' : 'k12-implementation'}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            
            <h3 style="color: #333;">What happens next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>🚀 AI begins generating your implementation plan immediately</li>
              <li>📊 All reports and policies are created autonomously</li>
              <li>📧 You'll receive progress updates via email</li>
              <li>💳 Billing starts after your 7-day trial (cancel anytime)</li>
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
    }

    await sgMail.send(welcomeEmail)

    return NextResponse.json({ success: true, message: 'Welcome email sent successfully' })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
