import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
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

    const apiKey = process.env.SENDGRID_API_KEY
    if (apiKey) {
      try {
        sgMail.setApiKey(apiKey)
        await sgMail.send({
          to: email,
            from: 'info@northpathstrategies.org',
            subject: 'Password Reset Request',
            html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetLink}">${resetLink}</a></p>`
        })
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
