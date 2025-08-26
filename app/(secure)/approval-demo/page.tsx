/**
 * Approval System Demo Page
 * Demonstrates the complete approval workflow
 * @version 1.0.0
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApprovalDashboard } from '@/components/approval/approval-dashboard'
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from 'lucide-react'

export default function ApprovalDemoPage() {
  const [currentUserId] = useState('demo-user-1')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const createDemoApproval = async () => {
    try {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({
          subjectType: 'policy',
          subjectId: 'demo-policy-' + Date.now(),
          subjectTitle: 'Demo Data Protection Policy',
          subjectVersion: '1.0',
          approvers: [
            { userId: 'approver-1', role: 'Security Lead', isRequired: true },
            { userId: 'approver-2', role: 'Legal Counsel', isRequired: true }
          ],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Please review this demo policy for approval.',
          metadata: {
            priority: 'medium',
            departmentId: 'demo',
            tags: ['demo', 'policy', 'data-protection']
          }
        })
      })

      if (response.ok) {
        alert('Demo approval created successfully!')
        window.location.reload()
      } else {
        alert('Failed to create demo approval')
      }
    } catch (error) {
      console.error('Error creating demo approval:', error)
      alert('Error creating demo approval')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval System Demo</h1>
          <p className="text-gray-600 mt-2">
            Complete approval workflow for policies and artifacts with e-signature support
          </p>
        </div>
        <Button onClick={createDemoApproval} className="bg-blue-600 hover:bg-blue-700">
          Create Demo Approval
        </Button>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Multi-Approver Workflow</h3>
                <p className="text-sm text-gray-600">Support for multiple approvers with required/optional roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircleIcon className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold">E-Signature Support</h3>
                <p className="text-sm text-gray-600">Digital signatures with IP and timestamp logging</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <InfoIcon className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Full Audit Trail</h3>
                <p className="text-sm text-gray-600">Complete history tracking and compliance logging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Approval Workflow</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Create approval requests for policies/artifacts</li>
                <li>• Assign multiple approvers with roles</li>
                <li>• Set due dates and priority levels</li>
                <li>• Track approval progress in real-time</li>
                <li>• Handle parallel or sequential approvals</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Decision & Comments</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Approve, reject, or request changes</li>
                <li>• Add comments and discussion threads</li>
                <li>• E-signature confirmation for decisions</li>
                <li>• Version history and change tracking</li>
                <li>• Email notifications (when configured)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Dashboard & Metrics</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Personal approval workload view</li>
                <li>• Pending, approved, rejected tabs</li>
                <li>• Overdue approval tracking</li>
                <li>• Performance metrics and trends</li>
                <li>• Searchable approval history</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Compliance & Audit</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Complete audit trail logging</li>
                <li>• IP address and device tracking</li>
                <li>• Immutable event history</li>
                <li>• Compliance reporting support</li>
                <li>• Regulatory approval workflows</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Reference */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Core Operations</h4>
              <div className="space-y-2 text-sm font-mono">
                <div><span className="text-green-600">POST</span> /api/approvals</div>
                <div><span className="text-blue-600">GET</span> /api/approvals</div>
                <div><span className="text-blue-600">GET</span> /api/approvals/dashboard</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Decision & Comments</h4>
              <div className="space-y-2 text-sm font-mono">
                <div><span className="text-yellow-600">PATCH</span> /api/approvals/:id/decision</div>
                <div><span className="text-green-600">POST</span> /api/approvals/:id/comments</div>
                <div><span className="text-blue-600">GET</span> /api/approvals/:id/comments</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Dashboard */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Live Approval Dashboard</h2>
        <ApprovalDashboard 
          currentUserId={currentUserId}
          className="w-full"
        />
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">1. Create Demo Approval</h4>
              <p className="text-sm text-gray-600">Click "Create Demo Approval" to generate a sample approval request</p>
            </div>
            
            <div>
              <h4 className="font-semibold">2. View in Dashboard</h4>
              <p className="text-sm text-gray-600">The approval will appear in the "Pending" tab below</p>
            </div>
            
            <div>
              <h4 className="font-semibold">3. Make Decisions</h4>
              <p className="text-sm text-gray-600">Click "Make Decision" to approve/reject with comments and e-signature</p>
            </div>
            
            <div>
              <h4 className="font-semibold">4. View History</h4>
              <p className="text-sm text-gray-600">Click "History" to see the complete approval timeline and events</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
