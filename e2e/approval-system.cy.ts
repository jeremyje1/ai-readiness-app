/**
 * Cypress E2E Tests: Approval System
 * Tests the complete approval workflow with multiple approvers
 * @version 1.0.0
 */

describe('Approval System Workflow', () => {
  const testApproval = {
    subjectType: 'policy',
    subjectId: 'test-policy-001',
    subjectTitle: 'Test Data Privacy Policy',
    subjectVersion: '2.1',
    approvers: [
      { userId: 'approver1', role: 'Security Lead', isRequired: true },
      { userId: 'approver2', role: 'Legal Counsel', isRequired: true }
    ],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    comment: 'Please review the updated data privacy policy for compliance.',
    metadata: {
      priority: 'high',
      departmentId: 'legal',
      tags: ['privacy', 'compliance', 'gdpr']
    }
  }

  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth_user', JSON.stringify({ id: 'test-user', role: 'admin' }))
    })

    // Intercept API calls
    cy.intercept('POST', '/api/approvals', { fixture: 'approval-created.json' }).as('createApproval')
    cy.intercept('GET', '/api/approvals/dashboard', { fixture: 'approval-dashboard.json' }).as('getDashboard')
    cy.intercept('PATCH', '/api/approvals/*/decision', { fixture: 'approval-decision.json' }).as('makeDecision')
    cy.intercept('POST', '/api/approvals/*/comments', { fixture: 'approval-comment.json' }).as('addComment')

    // Visit the approval dashboard
    cy.visit('/admin/approvals')
  })

  it('should create a new approval request', () => {
    // Click create approval button
    cy.get('[data-testid="create-approval-btn"]').click()

    // Fill out the approval form
    cy.get('[data-testid="subject-type-select"]').select('policy')
    cy.get('[data-testid="subject-id-input"]').type(testApproval.subjectId)
    cy.get('[data-testid="subject-title-input"]').type(testApproval.subjectTitle)
    cy.get('[data-testid="subject-version-input"]').type(testApproval.subjectVersion)

    // Add approvers
    cy.get('[data-testid="add-approver-btn"]').click()
    cy.get('[data-testid="approver-0-userId"]').type(testApproval.approvers[0].userId)
    cy.get('[data-testid="approver-0-role"]').type(testApproval.approvers[0].role)
    cy.get('[data-testid="approver-0-required"]').check()

    cy.get('[data-testid="add-approver-btn"]').click()
    cy.get('[data-testid="approver-1-userId"]').type(testApproval.approvers[1].userId)
    cy.get('[data-testid="approver-1-role"]').type(testApproval.approvers[1].role)
    cy.get('[data-testid="approver-1-required"]').check()

    // Set due date
    cy.get('[data-testid="due-date-input"]').type(testApproval.dueDate.split('T')[0])

    // Add comment
    cy.get('[data-testid="approval-comment"]').type(testApproval.comment)

    // Submit the form
    cy.get('[data-testid="submit-approval-btn"]').click()

    // Verify API call was made
    cy.wait('@createApproval').then((interception) => {
      expect(interception.request.body).to.include({
        subjectType: testApproval.subjectType,
        subjectId: testApproval.subjectId,
        subjectTitle: testApproval.subjectTitle
      })
    })

    // Verify success message
    cy.get('[data-testid="success-message"]').should('contain', 'Approval request created successfully')
  })

  it('should display approval dashboard with pending requests', () => {
    cy.wait('@getDashboard')

    // Check dashboard metrics
    cy.get('[data-testid="pending-count"]').should('be.visible')
    cy.get('[data-testid="approved-count"]').should('be.visible')
    cy.get('[data-testid="rejected-count"]').should('be.visible')
    cy.get('[data-testid="overdue-count"]').should('be.visible')

    // Check tabs are present
    cy.get('[data-testid="pending-tab"]').should('be.visible')
    cy.get('[data-testid="approved-tab"]').should('be.visible')
    cy.get('[data-testid="rejected-tab"]').should('be.visible')
    cy.get('[data-testid="overdue-tab"]').should('be.visible')

    // Verify pending approvals are displayed
    cy.get('[data-testid="pending-tab"]').click()
    cy.get('[data-testid="approval-card"]').should('have.length.at.least', 1)
  })

  it('should allow first approver to approve with e-signature', () => {
    // Navigate to pending approvals
    cy.get('[data-testid="pending-tab"]').click()

    // Find the test approval card
    cy.get('[data-testid="approval-card"]').first().within(() => {
      // Verify approval details
      cy.contains(testApproval.subjectTitle).should('be.visible')
      cy.contains('Version ' + testApproval.subjectVersion).should('be.visible')

      // Click make decision button
      cy.get('[data-testid="make-decision-btn"]').click()
    })

    // In the decision dialog
    cy.get('[data-testid="decision-dialog"]').within(() => {
      // Select approve
      cy.get('[data-testid="approve-btn"]').click()

      // Add comment
      cy.get('[data-testid="decision-comment"]').type('Policy reviewed and approved. Meets all security requirements.')

      // Confirm e-signature
      cy.get('[data-testid="esign-checkbox"]').check()

      // Submit decision
      cy.get('[data-testid="submit-decision-btn"]').click()
    })

    // Verify API call
    cy.wait('@makeDecision').then((interception) => {
      expect(interception.request.body).to.include({
        decision: 'approved',
        comment: 'Policy reviewed and approved. Meets all security requirements.'
      })
      expect(interception.request.body.eSignature.signed).to.be.true
    })

    // Verify success
    cy.get('[data-testid="success-message"]').should('contain', 'Decision submitted successfully')
  })

  it('should allow second approver to reject with comments', () => {
    // Switch to second approver context
    cy.window().then((win) => {
      win.localStorage.setItem('auth_user', JSON.stringify({ id: 'approver2', role: 'legal' }))
    })

    // Refresh to update user context
    cy.reload()
    cy.wait('@getDashboard')

    // Navigate to pending approvals
    cy.get('[data-testid="pending-tab"]').click()

    // Find the test approval card
    cy.get('[data-testid="approval-card"]').first().within(() => {
      // Click make decision button
      cy.get('[data-testid="make-decision-btn"]').click()
    })

    // In the decision dialog
    cy.get('[data-testid="decision-dialog"]').within(() => {
      // Select reject
      cy.get('[data-testid="reject-btn"]').click()

      // Add comment explaining rejection
      cy.get('[data-testid="decision-comment"]').type('Policy language needs clarification on data retention periods. Please revise section 4.2.')

      // Confirm e-signature
      cy.get('[data-testid="esign-checkbox"]').check()

      // Submit decision
      cy.get('[data-testid="submit-decision-btn"]').click()
    })

    // Verify API call
    cy.wait('@makeDecision').then((interception) => {
      expect(interception.request.body).to.include({
        decision: 'rejected',
        comment: 'Policy language needs clarification on data retention periods. Please revise section 4.2.'
      })
    })
  })

  it('should show approval status in dashboard after decisions', () => {
    // Reload dashboard to see updated status
    cy.reload()
    cy.wait('@getDashboard')

    // Check that rejected count increased
    cy.get('[data-testid="rejected-count"]').should('contain', '1')

    // Navigate to rejected tab
    cy.get('[data-testid="rejected-tab"]').click()

    // Verify the approval appears in rejected list
    cy.get('[data-testid="approval-card"]').should('have.length.at.least', 1).first().within(() => {
      cy.contains(testApproval.subjectTitle).should('be.visible')
      cy.get('[data-testid="status-badge"]').should('contain', 'Rejected')
    })

    // Check approval progress
    cy.get('[data-testid="approval-card"]').first().within(() => {
      // Should show 1/2 approvers (one approved, one rejected)
      cy.get('[data-testid="approval-progress"]').should('contain', '1 / 2')
      
      // Should show progress bar with partial completion
      cy.get('[data-testid="progress-bar"]').should('be.visible')
    })
  })

  it('should display approval history timeline', () => {
    // Open approval history
    cy.get('[data-testid="approval-card"]').first().within(() => {
      cy.get('[data-testid="history-btn"]').click()
    })

    // In the history dialog
    cy.get('[data-testid="history-dialog"]').within(() => {
      // Should show creation event
      cy.contains('created').should('be.visible')
      
      // Should show approval event
      cy.contains('approved').should('be.visible')
      cy.contains('Policy reviewed and approved').should('be.visible')
      
      // Should show rejection event
      cy.contains('rejected').should('be.visible')
      cy.contains('data retention periods').should('be.visible')

      // Events should be in chronological order
      cy.get('[data-testid="history-event"]').should('have.length.at.least', 3)
    })
  })

  it('should handle comments and discussion threads', () => {
    // Add a comment to the approval
    cy.get('[data-testid="approval-card"]').first().within(() => {
      cy.get('[data-testid="add-comment-btn"]').click()
    })

    // In the comment dialog
    cy.get('[data-testid="comment-dialog"]').within(() => {
      cy.get('[data-testid="comment-input"]').type('Can we schedule a meeting to discuss the data retention requirements?')
      cy.get('[data-testid="submit-comment-btn"]').click()
    })

    // Verify API call
    cy.wait('@addComment').then((interception) => {
      expect(interception.request.body.comment).to.include('schedule a meeting')
    })

    // Verify comment appears in history
    cy.get('[data-testid="approval-card"]').first().within(() => {
      cy.get('[data-testid="history-btn"]').click()
    })

    cy.get('[data-testid="history-dialog"]').within(() => {
      cy.contains('schedule a meeting').should('be.visible')
    })
  })

  it('should show overdue approvals', () => {
    // Mock an overdue approval in the dashboard response
    cy.intercept('GET', '/api/approvals/dashboard', { fixture: 'approval-dashboard-overdue.json' }).as('getDashboardOverdue')
    
    cy.reload()
    cy.wait('@getDashboardOverdue')

    // Check overdue count
    cy.get('[data-testid="overdue-count"]').should('contain', '1')

    // Navigate to overdue tab
    cy.get('[data-testid="overdue-tab"]').click()

    // Verify overdue styling
    cy.get('[data-testid="approval-card"]').first().within(() => {
      cy.get('[data-testid="due-date"]').should('have.class', 'text-red-600')
      cy.contains('overdue').should('be.visible')
    })
  })

  it('should handle error states gracefully', () => {
    // Mock API error
    cy.intercept('PATCH', '/api/approvals/*/decision', { statusCode: 500, body: { error: 'Server error' } }).as('makeDecisionError')

    // Try to make a decision
    cy.get('[data-testid="pending-tab"]').click()
    cy.get('[data-testid="approval-card"]').first().within(() => {
      cy.get('[data-testid="make-decision-btn"]').click()
    })

    cy.get('[data-testid="decision-dialog"]').within(() => {
      cy.get('[data-testid="approve-btn"]').click()
      cy.get('[data-testid="decision-comment"]').type('Test comment')
      cy.get('[data-testid="esign-checkbox"]').check()
      cy.get('[data-testid="submit-decision-btn"]').click()
    })

    // Should show error message
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to submit decision')
  })
})

// Additional test for audit logging
describe('Approval System Audit Trail', () => {
  it('should log all approval activities with proper metadata', () => {
    // This test would verify that audit logs are created with:
    // - User ID and session info
    // - IP address and user agent
    // - Timestamp and action type
    // - Before/after state for decisions
    // - E-signature confirmation details

    cy.visit('/admin/audit-logs')

    // Filter by approval-related events
    cy.get('[data-testid="event-type-filter"]').select('approval')
    cy.get('[data-testid="apply-filter-btn"]').click()

    // Verify audit entries
    cy.get('[data-testid="audit-entry"]').should('have.length.at.least', 1).first().within(() => {
      cy.contains('approval_created').should('be.visible')
      cy.contains('test-user').should('be.visible')
      cy.get('[data-testid="audit-metadata"]').click()
    })

    // Check metadata details
    cy.get('[data-testid="audit-details-modal"]').within(() => {
      cy.contains('subjectId').should('be.visible')
      cy.contains('approvers').should('be.visible')
      cy.contains('ipAddress').should('be.visible')
      cy.contains('userAgent').should('be.visible')
    })
  })
})
