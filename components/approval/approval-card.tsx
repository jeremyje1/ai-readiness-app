/**
 * Approval Card Component
 * Displays approval details with actions for approvers
 * @version 1.0.0
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CalendarIcon, CheckIcon, ClockIcon, MessageSquareIcon, XIcon, HistoryIcon } from 'lucide-react'
import { Approval, ApprovalStatus, ApprovalEvent } from '@/lib/types/approval'
import { formatDistanceToNow, format } from 'date-fns'

interface ApprovalCardProps {
  approval: Approval
  currentUserId: string
  onDecision?: (approvalId: string, decision: 'approved' | 'rejected', comment: string, esignConfirmed: boolean) => void
  onComment?: (approvalId: string, comment: string) => void
}

export function ApprovalCard({ approval, currentUserId, onDecision, onComment }: ApprovalCardProps) {
  const [showDecisionDialog, setShowDecisionDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showEventsDialog, setShowEventsDialog] = useState(false)
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved')
  const [comment, setComment] = useState('')
  const [newComment, setNewComment] = useState('')
  const [esignConfirmed, setEsignConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if current user can approve
  const userApprover = approval.approvers.find(a => a.userId === currentUserId)
  const canApprove = userApprover && !userApprover.hasApproved

  // Status styling
  const getStatusBadge = (status: ApprovalStatus) => {
    const variants: Record<ApprovalStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      changes_requested: 'bg-orange-100 text-orange-800'
    }
    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</Badge>
  }

  // Handle decision submission
  const handleDecisionSubmit = async () => {
    if (!onDecision || !comment.trim()) return

    setIsSubmitting(true)
    try {
      await onDecision(approval.id, decision, comment, esignConfirmed)
      setShowDecisionDialog(false)
      setComment('')
      setEsignConfirmed(false)
    } catch (error) {
      console.error('Failed to submit decision:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!onComment || !newComment.trim()) return

    try {
      await onComment(approval.id, newComment)
      setNewComment('')
      setShowCommentDialog(false)
    } catch (error) {
      console.error('Failed to submit comment:', error)
    }
  }

  // Format due date
  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const now = new Date()
    const isOverdue = date < now

    return (
      <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
        <CalendarIcon className="h-4 w-4" />
        <span>{format(date, 'MMM dd, yyyy')}</span>
        <span className="text-xs">
          ({isOverdue ? 'overdue by' : 'due in'} {formatDistanceToNow(date)})
        </span>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{approval.subjectTitle || `Approval ${approval.subjectId}`}</CardTitle>
            <p className="text-sm text-gray-600">{approval.subjectType} approval request</p>
          </div>
          {getStatusBadge(approval.status)}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Version {approval.subjectVersion || '1.0'}</span>
          <span>{approval.subjectType}</span>
          {approval.dueDate && formatDueDate(approval.dueDate)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Approvers List */}
        <div>
          <h4 className="text-sm font-medium mb-2">Approvers</h4>
          <div className="flex flex-wrap gap-2">
            {approval.approvers.map((approver, index) => (
              <div key={`${approver.userId}-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`/avatars/${approver.userId}.jpg`} />
                  <AvatarFallback className="text-xs">
                    {approver.userId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{approver.userName || approver.userId}</span>
                {approver.decision === 'approved' && <CheckIcon className="h-4 w-4 text-green-600" />}
                {approver.decision === 'rejected' && <XIcon className="h-4 w-4 text-red-600" />}
                {!approver.hasApproved && <ClockIcon className="h-4 w-4 text-yellow-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Approval Progress</span>
            <span>{approval.approvers.filter(a => a.hasApproved && a.decision === 'approved').length} / {approval.approvers.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(approval.approvers.filter(a => a.hasApproved && a.decision === 'approved').length / approval.approvers.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {canApprove && (
            <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
              <DialogTrigger asChild>
                <Button variant="default">Make Decision</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve or Reject</DialogTitle>
                  <DialogDescription>
                    Please provide your decision and comments for "{approval.subjectTitle || approval.subjectId}"
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={decision === 'approved' ? 'default' : 'outline'}
                      onClick={() => setDecision('approved')}
                      className="flex-1"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant={decision === 'rejected' ? 'destructive' : 'outline'}
                      onClick={() => setDecision('rejected')}
                      className="flex-1"
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                  
                  <Textarea
                    placeholder="Add your comments (required)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="esign"
                      checked={esignConfirmed}
                      onCheckedChange={(checked) => setEsignConfirmed(checked as boolean)}
                    />
                    <label htmlFor="esign" className="text-sm">
                      I confirm this decision with my electronic signature
                    </label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    onClick={handleDecisionSubmit}
                    disabled={!comment.trim() || !esignConfirmed || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Decision'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Comment</DialogTitle>
                <DialogDescription>
                  Add a comment to the approval discussion
                </DialogDescription>
              </DialogHeader>
              
              <Textarea
                placeholder="Your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
              />
              
              <DialogFooter>
                <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <HistoryIcon className="h-4 w-4 mr-2" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Approval History</DialogTitle>
                <DialogDescription>
                  Timeline of events for this approval
                </DialogDescription>
              </DialogHeader>
              
              <div className="max-h-96 overflow-y-auto space-y-3">
                {approval.events.map((event, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{event.action}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(event.timestamp))} ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.comment || 'No comment'}</p>
                      <span className="text-xs text-gray-500">by {event.whoName || event.who}</span>
                      {event.metadata && (
                        <pre className="text-xs text-gray-500 mt-1 bg-gray-100 p-2 rounded">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
