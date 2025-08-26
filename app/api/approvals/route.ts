/**
 * API Route: Create Approval
 * POST /api/approvals
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/lib/services/approval'
import { CreateApprovalRequest } from '@/lib/types/approval'

interface CreateApprovalApiRequest {
  subjectType: 'policy' | 'artifact'
  subjectId: string
  subjectTitle?: string
  subjectVersion?: string
  approvers: Array<{
    userId: string
    role: string
    isRequired: boolean
  }>
  dueDate?: string
  comment?: string
  metadata?: Record<string, any>
}

interface CreateApprovalResponse {
  success: boolean
  data?: {
    approval: any
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateApprovalResponse>> {
  try {
    const body: CreateApprovalApiRequest = await request.json()

    // Validate request
    if (!body.subjectType || !body.subjectId || !body.approvers || body.approvers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: subjectType, subjectId, and approvers are required'
      }, { status: 400 })
    }

    // Validate subject type
    if (!['policy', 'artifact'].includes(body.subjectType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid subjectType. Must be "policy" or "artifact"'
      }, { status: 400 })
    }

    // Validate approvers
    for (const approver of body.approvers) {
      if (!approver.userId || !approver.role) {
        return NextResponse.json({
          success: false,
          error: 'Each approver must have userId and role'
        }, { status: 400 })
      }
    }

    // Get user info from headers or auth (simplified for demo)
    const userId = request.headers.get('x-user-id') || 'demo-user'
    const userName = request.headers.get('x-user-name') || 'Demo User'
    const userEmail = request.headers.get('x-user-email') || 'demo@example.com'

    console.log('Creating approval for:', {
      subjectType: body.subjectType,
      subjectId: body.subjectId,
      approverCount: body.approvers.length,
      createdBy: userId
    })

    // Create approval request
    const approvalRequest: CreateApprovalRequest = {
      subjectType: body.subjectType,
      subjectId: body.subjectId,
      subjectTitle: body.subjectTitle,
      subjectVersion: body.subjectVersion,
      approvers: body.approvers,
      dueDate: body.dueDate,
      comment: body.comment,
      metadata: body.metadata
    }

    const approvalService = new ApprovalService()
    const approval = await approvalService.createApproval(
      approvalRequest,
      userId,
      { name: userName, email: userEmail }
    )

    return NextResponse.json({
      success: true,
      data: {
        approval
      }
    })

  } catch (error) {
    console.error('Approval creation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const subjectType = searchParams.get('subjectType')
    const overdue = searchParams.get('overdue') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('Fetching approvals with filters:', {
      userId,
      status,
      subjectType,
      overdue,
      limit,
      offset
    })

    const approvalService = new ApprovalService()
    const result = await approvalService.getApprovals({
      userId: userId || undefined,
      status: status as any,
      subjectType: subjectType || undefined,
      overdue,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Approval fetch error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
