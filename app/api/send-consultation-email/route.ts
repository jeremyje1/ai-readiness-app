import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

export async function POST(request: NextRequest) {
  try {
    const { email, name, serviceName, serviceType } = await request.json()

    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

    const consultationEmail = {
      to: email,
      from: 'info@northpathstrategies.org',
      subject: `Thank you for your ${serviceName} purchase! 🎉`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Purchase Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your consultation service is ready</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name || 'there'}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for purchasing <strong>${serviceName}</strong>! We're excited to provide you with expert guidance for your AI implementation.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #333;">What happens next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                ${serviceType === 'expert_consultation_call' ? `
                  <li>📅 Our team will contact you within 24 hours to schedule your session</li>
                  <li>📋 We'll send you a brief pre-consultation questionnaire</li>
                  <li>💬 Your 60-minute strategy session will be conducted via video call</li>
                  <li>📄 You'll receive a detailed follow-up report within 48 hours</li>
                ` : serviceType === 'implementation_support_package' ? `
                  <li>🤝 Your dedicated consultant will reach out within 24 hours</li>
                  <li>📋 We'll assess your current implementation status</li>
                  <li>📅 Weekly progress reviews will be scheduled</li>
                  <li>📧 You'll have priority email support throughout the month</li>
                ` : `
                  <li>📋 Send us your current AI policies within 48 hours</li>
                  <li>🔍 Our experts will conduct a thorough review</li>
                  <li>📝 You'll receive detailed recommendations and revised policies</li>
                  <li>💬 A follow-up call will be scheduled to discuss changes</li>
                `}
              </ul>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0066cc; font-weight: bold;">
                📧 Keep this email for your records and reference
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin-bottom: 15px;">Questions about your consultation?</p>
              <a href="mailto:info@northpathstrategies.org" 
                 style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Contact Our Team
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              North Path Strategies<br>
              AI Implementation Consultation Services<br>
              <a href="mailto:info@northpathstrategies.org" style="color: #999;">info@northpathstrategies.org</a>
            </p>
          </div>
        </div>
      `
    }

    await sgMail.send(consultationEmail)

    return NextResponse.json({ success: true, message: 'Consultation confirmation email sent successfully' })
  } catch (error) {
    console.error('Failed to send consultation confirmation email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
