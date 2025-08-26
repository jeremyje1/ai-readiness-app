/**
 * API Route: Approval Comments
 * POST /api/approvals/[id]/comments
 * GET /api/approvals/[id]/comments
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/lib/services/approval'

interface CommentParams {
  params: {
    id: string
  }
}

interface AddCommentRequest {
  comment: string
  isInternal?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: CommentParams
): Promise<NextResponse> {
  try {
    const { id } = params
    const body: AddCommentRequest = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Approval ID is required'
      }, { status: 400 })
    }

    if (!body.comment || body.comment.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Comment is required'
      }, { status: 400 })
    }

    // Get user info from headers
    const userId = request.headers.get('x-user-id') || 'demo-user'
    const userName = request.headers.get('x-user-name') || 'Demo User'
    const userEmail = request.headers.get('x-user-email') || 'demo@example.com'

    const approvalService = new ApprovalService()
    const comment = await approvalService.addComment(
      id,
      userId,
      body.comment.trim(),
      body.isInternal || false,
      { name: userName, email: userEmail }
    )

    return NextResponse.json({
      success: true,
      data: { comment }
    })

  } catch (error) {
    console.error('Add comment error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: CommentParams
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

    // Extract comments from approval events and dedicated comments
    const comments = [
      // Dedicated comments
      ...(approval.events || []).filter(event => event.action === 'comment_added'),
      // Decision comments
      ...(approval.events || []).filter(event => 
        ['approved', 'rejected', 'requested_changes'].includes(event.action) && event.comment
      )
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: { comments }
    })

  } catch (error) {
    console.error('Get comments error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
