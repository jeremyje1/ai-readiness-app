import { NextResponse } from 'next/server'
import { clearAllUsers } from '@/lib/user-management'
import { clearAllInstitutions } from '@/lib/implementation-bootstrap'

// Clear all test data from the in-memory stores
export async function POST() {
  try {
    // Clear user accounts
    const userCount = clearAllUsers()
    
    // Clear institutions
    const institutionStats = clearAllInstitutions()
    
    return NextResponse.json({ 
      success: true, 
      message: 'All test data cleared successfully',
      cleared: {
        users: userCount,
        higherEdInstitutions: institutionStats.higherEdCount,
        k12Schools: institutionStats.k12Count,
        totalInstitutions: institutionStats.total
      }
    })
  } catch (error) {
    console.error('Error clearing test data:', error)
    return NextResponse.json({ error: 'Failed to clear test data' }, { status: 500 })
  }
}
