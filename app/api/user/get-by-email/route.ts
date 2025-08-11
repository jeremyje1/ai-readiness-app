import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/user-management'
import { getAllHigherEdInstitutions, getAllK12Schools } from '@/lib/implementation-bootstrap'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Get user account
    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find associated institution
    const higherEdInstitutions = getAllHigherEdInstitutions()
    const k12Schools = getAllK12Schools()
    
    const userInstitution = higherEdInstitutions.find(inst => inst.contactEmail === email) || 
                           k12Schools.find(school => school.contactEmail === email)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      },
      institution: userInstitution ? {
        id: userInstitution.id,
        type: userInstitution.type,
        name: userInstitution.name
      } : null
    })
  } catch (error) {
    console.error('Error getting user data:', error)
    return NextResponse.json({ error: 'Failed to get user data' }, { status: 500 })
  }
}
