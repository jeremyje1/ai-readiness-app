import { NextRequest, NextResponse } from 'next/server'
import { createUserAccount } from '@/lib/user-management'
import { createPlaceholderHigherEdInstitution, createPlaceholderK12School } from '@/lib/implementation-bootstrap'

export async function POST(request: NextRequest) {
  try {
    const { email, implementationType, sessionId } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Create user account
    const subscription = {
      status: 'trialing' as const,
      plan: 'monthly',
      trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now
    }
    
    const userAccount = createUserAccount(email, subscription)
    console.log('Manual user account created:', userAccount)

    // Create placeholder implementation based on type
    let institutionId: string | undefined
    try {
      if (implementationType === 'highered') {
        institutionId = createPlaceholderHigherEdInstitution(email).id
      } else if (implementationType === 'k12') {
        institutionId = createPlaceholderK12School(email).id
      }
    } catch (e) {
      console.warn('Failed to bootstrap placeholder implementation:', e)
    }

    // Send welcome email
    const baseUrl = (process.env.NEXTAUTH_URL || 'https://aireadiness.northpathstrategies.org').replace(/\/$/, '')
    const emailResponse = await fetch(`${baseUrl}/api/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        billingPeriod: 'monthly',
        loginPassword: userAccount.password,
        isNewAccount: true,
        implementationType,
        institutionId,
        name: email.split('@')[0]
      })
    })

    const emailResult = await emailResponse.json()
    
    return NextResponse.json({ 
      success: true, 
      message: 'User account created and welcome email sent',
      userId: userAccount.userId,
      institutionId,
      emailSent: emailResult.success,
      loginPassword: userAccount.password
    })
  } catch (error) {
    console.error('Manual user creation error:', error)
    return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
  }
}
