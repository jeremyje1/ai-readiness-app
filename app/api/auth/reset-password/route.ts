import { NextRequest, NextResponse } from 'next/server'
import { validateResetToken, consumeResetToken } from '@/lib/reset-tokens'
import { getUserByEmail } from '@/lib/user-management'

export async function POST(req: NextRequest) {
  try {
    const { email, token, newPassword } = await req.json()
    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!validateResetToken(email, token)) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const user: any = getUserByEmail(email)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    user.password = newPassword // In production hash password
    consumeResetToken(email)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Reset password error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
