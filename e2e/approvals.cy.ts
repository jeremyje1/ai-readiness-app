/**
 * Approvals Workflow E2E Tests
 * Tests the artifact approval routing and decision-making workflow
 */

describe('Approvals Workflow', () => {
    beforeEach(() => {
        // Setup approval workflow mocks
        cy.intercept('GET', '**/api/approvals', { fixture: 'approval-dashboard.json' }).as('getApprovals')
        cy.intercept('POST', '**/api/approvals/*/start', {
            statusCode: 200,
            body: { id: 'approval-123', status: 'pending', stage: 1 }
        }).as('startApproval')

        cy.intercept('POST', '**/api/approvals/*/approve', {
            statusCode: 200,
            body: { id: 'approval-123', status: 'approved', stage: 2 }
        }).as('approveStage')

        cy.intercept('POST', '**/api/approvals/*/request-changes', {
            statusCode: 200,
            body: { id: 'approval-123', status: 'changes-requested', stage: 1 }
        }).as('requestChanges')
    })

    it('routes artifact through two approvers', () => {
        // Login as owner to start approval
        cy.loginAs('owner')

        // Create artifact for approval
        cy.createArtifactFixture().as('artifactId')

        // Navigate to approvals dashboard
        cy.visitAndWait('/approvals')
        cy.wait('@getApprovals')

        // Verify approvals dashboard loaded
        cy.contains('Approval Dashboard').should('be.visible')
        cy.getByTestId('pending-approvals').should('be.visible')

        // Start approval process
        cy.getByTestId('start-approval').click()
        cy.wait('@startApproval')

        // Verify approval started
        cy.contains('Approval Started').should('be.visible')
        cy.getByTestId('approval-status').should('contain', 'Pending Review')

        // First approver approves
        cy.getByTestId('approver-1-approve').click()
        cy.wait('@approveStage')

        // Verify moved to next stage
        cy.getByTestId('approval-stage').should('contain', 'Stage 2')
        cy.getByTestId('approver-2-section').should('be.visible')

        // Second approver requests changes
        cy.getByTestId('approver-2-request-changes').click()

        // Add comment for changes
        cy.getByTestId('change-comment').type('Please update section 3.2 with more specific requirements')
        cy.getByTestId('submit-changes').click()
        cy.wait('@requestChanges')

        // Verify changes requested status
        cy.contains('Changes requested').should('exist')
        cy.getByTestId('approval-status').should('contain', 'Changes Requested')
        cy.contains('Please update section 3.2').should('be.visible')
    })

    it('handles complete approval workflow', () => {
        cy.loginAs('owner')
        cy.createArtifactFixture().as('artifactId')

        // Mock complete approval
        cy.intercept('POST', '**/api/approvals/*/approve', {
            statusCode: 200,
            body: { id: 'approval-123', status: 'fully-approved', stage: 'complete' }
        }).as('finalApprove')

        cy.visitAndWait('/approvals')
        cy.getByTestId('start-approval').click()

        // First approver
        cy.getByTestId('approver-1-approve').click()

        // Second approver
        cy.getByTestId('approver-2-approve').click()
        cy.wait('@finalApprove')

        // Verify completion
        cy.contains('Fully Approved').should('be.visible')
        cy.getByTestId('download-approved-artifact').should('be.visible')
        cy.getByTestId('approval-certificate').should('be.visible')
    })

    it('shows approval history and audit trail', () => {
        cy.loginAs('admin')

        // Mock approval with history
        cy.intercept('GET', '**/api/approvals/approval-123/history', {
            statusCode: 200,
            body: {
                events: [
                    {
                        timestamp: '2025-08-26T10:00:00Z',
                        user: 'john.doe@school.edu',
                        action: 'started',
                        stage: 1
                    },
                    {
                        timestamp: '2025-08-26T11:00:00Z',
                        user: 'jane.smith@school.edu',
                        action: 'approved',
                        stage: 1
                    },
                    {
                        timestamp: '2025-08-26T12:00:00Z',
                        user: 'bob.wilson@school.edu',
                        action: 'requested_changes',
                        stage: 2,
                        comment: 'Need more details on compliance'
                    }
                ]
            }
        }).as('getHistory')

        cy.visitAndWait('/approvals/approval-123')
        cy.wait('@getHistory')

        // Verify audit trail
        cy.getByTestId('approval-history').should('be.visible')
        cy.contains('john.doe@school.edu').should('be.visible')
        cy.contains('started').should('be.visible')
        cy.contains('Need more details on compliance').should('be.visible')

        // Verify timestamps
        cy.getByTestId('event-timestamp').should('contain', '10:00 AM')
    })

    it('handles approval notifications', () => {
        cy.loginAs('owner')

        // Mock notification settings
        cy.intercept('GET', '**/api/notifications/settings', {
            statusCode: 200,
            body: { email: true, sms: false, slack: true }
        }).as('getNotificationSettings')

        cy.visitAndWait('/approvals')
        cy.getByTestId('start-approval').click()

        // Verify notification options
        cy.getByTestId('notification-settings').click()
        cy.wait('@getNotificationSettings')

        cy.getByTestId('email-notifications').should('be.checked')
        cy.getByTestId('slack-notifications').should('be.checked')
        cy.getByTestId('sms-notifications').should('not.be.checked')
    })

    it('supports bulk approval actions', () => {
        cy.loginAs('admin')

        // Mock multiple pending approvals
        cy.intercept('GET', '**/api/approvals', {
            statusCode: 200,
            body: {
                pending: [
                    { id: 'approval-1', title: 'Policy Update A', stage: 1 },
                    { id: 'approval-2', title: 'Policy Update B', stage: 1 },
                    { id: 'approval-3', title: 'Policy Update C', stage: 2 }
                ]
            }
        }).as('getBulkApprovals')

        cy.visitAndWait('/approvals')
        cy.wait('@getBulkApprovals')

        // Select multiple approvals
        cy.getByTestId('approval-1-checkbox').check()
        cy.getByTestId('approval-2-checkbox').check()

        // Bulk approve
        cy.getByTestId('bulk-approve').click()
        cy.getByTestId('bulk-confirm').click()

        // Verify bulk action
        cy.contains('2 approvals processed').should('be.visible')
    })

    it('enforces approval permissions and roles', () => {
        // Test as regular user (should not see admin functions)
        cy.loginAs('user')
        cy.visitAndWait('/approvals')

        // Should not see admin controls
        cy.getByTestId('bulk-approve').should('not.exist')
        cy.getByTestId('override-approval').should('not.exist')

        // Switch to admin
        cy.loginAs('admin')
        cy.visitAndWait('/approvals')

        // Should see admin controls
        cy.getByTestId('approval-settings').should('be.visible')
        cy.getByTestId('approval-reports').should('be.visible')
    })

    it('handles approval timeouts and escalation', () => {
        cy.loginAs('owner')

        // Mock overdue approval
        cy.intercept('GET', '**/api/approvals', {
            statusCode: 200,
            body: {
                overdue: [
                    {
                        id: 'approval-456',
                        title: 'Overdue Policy Review',
                        daysOverdue: 3,
                        assignee: 'jane.smith@school.edu'
                    }
                ]
            }
        }).as('getOverdueApprovals')

        cy.visitAndWait('/approvals')
        cy.wait('@getOverdueApprovals')

        // Verify overdue indicators
        cy.getByTestId('overdue-approvals').should('be.visible')
        cy.contains('3 days overdue').should('be.visible')
        cy.getByTestId('escalate-approval').should('be.visible')

        // Test escalation
        cy.getByTestId('escalate-approval').click()
        cy.getByTestId('escalation-reason').type('Time-sensitive policy update needed for compliance')
        cy.getByTestId('submit-escalation').click()

        cy.contains('Escalation submitted').should('be.visible')
    })

    it('supports mobile-responsive approval interface', () => {
        // Test mobile viewport
        cy.viewport('iphone-6')
        cy.loginAs('admin')
        cy.visitAndWait('/approvals')

        // Verify mobile layout
        cy.getByTestId('mobile-menu-toggle').should('be.visible')
        cy.getByTestId('approval-card').should('have.css', 'width')

        // Test swipe actions (simulate with trigger)
        cy.getByTestId('approval-card').trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
        cy.getByTestId('approval-card').trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
        cy.getByTestId('approval-card').trigger('touchend')
        cy.getByTestId('quick-approve').should('be.visible')
        cy.getByTestId('quick-reject').should('be.visible')
    })
})
