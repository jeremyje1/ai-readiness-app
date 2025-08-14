import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/user-management'
import { createResetToken } from '@/lib/reset-tokens'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = getUserByEmail(email)
    if (!user) {
      // Do not reveal whether user exists
      return NextResponse.json({ success: true })
    }

    const token = createResetToken(email)

    const baseUrl = (process.env.NEXTAUTH_URL || 'https://aireadiness.northpathstrategies.org').replace(/\/$/, '')
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    const postmarkToken = process.env.POSTMARK_API_TOKEN
    if (postmarkToken) {
      try {
        const HtmlBody = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background: #667eea; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Password Reset</h1>
              </div>
              <div style="padding: 30px;">
                <p>You requested a password reset for your AI Blueprint account.</p>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                  If you didn't request this reset, you can safely ignore this email.
                </p>
              </div>
            </div>
          `

        const fromEmail = process.env.FROM_EMAIL || 'info@northpathstrategies.org'
        const messageStream = process.env.POSTMARK_MESSAGE_STREAM || 'outbound'

        const response = await fetch('https://api.postmarkapp.com/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Postmark-Server-Token': postmarkToken,
          },
          body: JSON.stringify({
            From: fromEmail,
            To: email,
            Subject: 'Password Reset Request',
            HtmlBody,
            MessageStream: messageStream,
          }),
        })

        if (!response.ok) {
          console.error('Postmark reset email failed:', response.status)
        }
      } catch (e) {
        console.error('Failed to send reset email', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Forgot password error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
