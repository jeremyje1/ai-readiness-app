/**
 * API Route: Approval Decision
 * PATCH /api/approvals/[id]/decision
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/lib/services/approval'
import { ApprovalDecisionRequest } from '@/lib/types/approval'

interface DecisionParams {
  params: {
    id: string
  }
}

interface DecisionApiRequest {
  decision: 'approved' | 'rejected' | 'changes_requested'
  comment?: string
  eSignature?: {
    signed: boolean
    ipAddress?: string
    userAgent?: string
  }
}

interface DecisionResponse {
  success: boolean
  data?: {
    approval: any
  }
  error?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: DecisionParams
): Promise<NextResponse<DecisionResponse>> {
  try {
    const { id } = params
    const body: DecisionApiRequest = await request.json()

    console.log(`Making decision for approval ${id}:`, {
      decision: body.decision,
      hasComment: !!body.comment,
      eSignature: body.eSignature
    })

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Approval ID is required'
      }, { status: 400 })
    }

    // Validate decision
    if (!body.decision || !['approved', 'rejected', 'changes_requested'].includes(body.decision)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid decision. Must be "approved", "rejected", or "changes_requested"'
      }, { status: 400 })
    }

    // Get user info from headers or auth (simplified for demo)
    const userId = request.headers.get('x-user-id') || 'demo-user'
    const userName = request.headers.get('x-user-name') || 'Demo User'
    const userEmail = request.headers.get('x-user-email') || 'demo@example.com'
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const decisionRequest: ApprovalDecisionRequest = {
      decision: body.decision,
      comment: body.comment,
      eSignature: body.eSignature ? {
        signed: body.eSignature.signed,
        ipAddress: body.eSignature.ipAddress || ipAddress,
        userAgent: body.eSignature.userAgent || userAgent
      } : undefined
    }

    const approvalService = new ApprovalService()
    
    // First check if approval exists and user is authorized
    try {
      await approvalService.getApprovalById(id)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Approval not found'
      }, { status: 404 })
    }

    const approval = await approvalService.makeDecision(
      id,
      userId,
      decisionRequest,
      { name: userName, email: userEmail }
    )

    return NextResponse.json({
      success: true,
      data: {
        approval
      }
    })

  } catch (error) {
    console.error('Decision error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: DecisionParams
): Promise<NextResponse> {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Approval ID is required'
      }, { status: 400 })
    }

    const approvalService = new ApprovalService()
    const approval = await approvalService.getApprovalById(id)

    return NextResponse.json({
      success: true,
      data: {
        approval
      }
    })

  } catch (error) {
    console.error('Approval fetch error:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: 'Approval not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
