/**
 * API Route: Approval Dashboard
 * GET /api/approvals/dashboard
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/lib/services/approval'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user info from headers
    const userId = request.headers.get('x-user-id') || 'demo-user'

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    console.log(`Fetching dashboard for user: ${userId}`)

    const approvalService = new ApprovalService()
    const dashboard = await approvalService.getDashboard(userId)

    return NextResponse.json({
      success: true,
      data: dashboard
    })

  } catch (error) {
    console.error('Dashboard fetch error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
