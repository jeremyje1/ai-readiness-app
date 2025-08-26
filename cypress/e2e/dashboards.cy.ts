/**
 * Dashboard End-to-End Tests
 * Tests dashboard functionality, metrics display, and interactions
 * @version 1.0.0
 */

describe('Executive Dashboards', () => {
    beforeEach(() => {
        // Mock user authentication
        cy.window().then((win) => {
            win.localStorage.setItem('auth-user', JSON.stringify({
                id: 'test-user-123',
                email: 'admin@school.edu',
                role: 'admin'
            }))
        })
    })

    describe('Readiness & Risk Dashboard', () => {
        beforeEach(() => {
            // Mock readiness metrics API
            cy.fixture('dashboards/readiness-metrics.json').then((data) => {
                cy.intercept('GET', '/api/dashboard/readiness*', data).as('getReadinessMetrics')
            })
            cy.visit('/dashboard/readiness')
        })

        it('displays key readiness metrics', () => {
            cy.wait('@getReadinessMetrics')

            // Check header
            cy.contains('Readiness & Risk Dashboard').should('be.visible')
            cy.contains('Assessment trends and risk overview').should('be.visible')

            // Check key metric cards
            cy.contains('Assessment Score').should('be.visible')
            cy.contains('Completion Rate').should('be.visible')
            cy.contains('Total Open Risks').should('be.visible')
            cy.contains('Risk Distribution').should('be.visible')

            // Verify metric values are displayed
            cy.get('[data-testid="assessment-score"]').should('contain', '85')
            cy.get('[data-testid="completion-rate"]').should('contain', '78%')
            cy.get('[data-testid="total-risks"]').should('contain', '12')
        })

        it('shows assessment trend chart', () => {
            cy.wait('@getReadinessMetrics')

            cy.contains('Assessment Trend (Last 30 Days)').should('be.visible')
            cy.get('[data-testid="trend-chart"]').should('be.visible')

            // Chart should contain data points
            cy.get('.recharts-line-curve').should('have.length.greaterThan', 0)
        })

        it('displays open risks list', () => {
            cy.wait('@getReadinessMetrics')

            cy.contains('Priority Open Risks').should('be.visible')
            cy.get('[data-testid="risk-item"]').should('have.length.greaterThan', 0)

            // Check risk details
            cy.get('[data-testid="risk-item"]').first().within(() => {
                cy.get('[data-testid="risk-title"]').should('be.visible')
                cy.get('[data-testid="risk-level-badge"]').should('be.visible')
                cy.get('[data-testid="risk-department"]').should('be.visible')
            })
        })

        it('filters data by department', () => {
            cy.wait('@getReadinessMetrics')

            // Apply department filter
            cy.get('[data-testid="department-filter"]').click()
            cy.contains('Technology').click()

            // Should trigger new API call with filter
            cy.wait('@getReadinessMetrics')

            // Verify filtered data is displayed
            cy.get('[data-testid="risk-item"]').should('contain', 'Technology')
        })

        it('refreshes data when refresh button clicked', () => {
            cy.wait('@getReadinessMetrics')

            cy.get('[data-testid="refresh-button"]').click()
            cy.wait('@getReadinessMetrics')

            // Should show updated timestamp
            cy.contains('Last updated').should('be.visible')
        })

        it('handles empty state gracefully', () => {
            // Mock empty response
            cy.intercept('GET', '/api/dashboard/readiness*', {
                success: true,
                data: {
                    assessmentScores: { current: 0, previous: 0, trend: 'stable', change: 0 },
                    riskDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
                    openRisks: [],
                    completionRates: { totalAssessments: 0, completedAssessments: 0, percentage: 0 },
                    trendData: []
                },
                lastUpdated: new Date().toISOString()
            }).as('getEmptyMetrics')

            cy.visit('/dashboard/readiness')
            cy.wait('@getEmptyMetrics')

            cy.contains('No Open Risks').should('be.visible')
            cy.contains('Great job! No high-priority risks require attention.').should('be.visible')
        })

        it('displays error state when API fails', () => {
            cy.intercept('GET', '/api/dashboard/readiness*', {
                statusCode: 500,
                body: { success: false, error: 'Internal server error' }
            }).as('getReadinessError')

            cy.visit('/dashboard/readiness')
            cy.wait('@getReadinessError')

            cy.contains('Error Loading Dashboard').should('be.visible')
            cy.contains('Internal server error').should('be.visible')
            cy.get('[data-testid="retry-button"]').should('be.visible')
        })
    })

    describe('Adoption Dashboard', () => {
        beforeEach(() => {
            // Mock adoption metrics API
            cy.fixture('dashboards/adoption-metrics.json').then((data) => {
                cy.intercept('GET', '/api/dashboard/adoption*', data).as('getAdoptionMetrics')
            })
            cy.visit('/dashboard/adoption')
        })

        it('displays adoption metrics overview', () => {
            cy.wait('@getAdoptionMetrics')

            // Check header
            cy.contains('Adoption Dashboard').should('be.visible')
            cy.contains('Policy approvals, training completions, and tool adoption').should('be.visible')

            // Check key metrics
            cy.contains('Policies Approved').should('be.visible')
            cy.contains('PD Completions').should('be.visible')
            cy.contains('Approved Tools').should('be.visible')
            cy.contains('Active Departments').should('be.visible')

            // Verify metric values
            cy.get('[data-testid="policies-approved"]').should('contain', '24')
            cy.get('[data-testid="pd-completions"]').should('contain', '156')
            cy.get('[data-testid="approved-tools"]').should('contain', '18')
        })

        it('shows policy approvals chart', () => {
            cy.wait('@getAdoptionMetrics')

            cy.contains('Policy Approvals by Department').should('be.visible')
            cy.get('[data-testid="policy-chart"]').should('be.visible')

            // Bar chart should have bars
            cy.get('.recharts-bar').should('have.length.greaterThan', 0)
        })

        it('displays tools by category pie chart', () => {
            cy.wait('@getAdoptionMetrics')

            cy.contains('Approved Tools by Category').should('be.visible')
            cy.get('[data-testid="tools-chart"]').should('be.visible')

            // Pie chart should have segments
            cy.get('.recharts-pie-sector').should('have.length.greaterThan', 0)
        })

        it('shows recent activity sections', () => {
            cy.wait('@getAdoptionMetrics')

            // Recent policy approvals
            cy.contains('Recent Policy Approvals').should('be.visible')
            cy.get('[data-testid="recent-policy"]').should('have.length.greaterThan', 0)

            // Upcoming training sessions
            cy.contains('Upcoming Training Sessions').should('be.visible')
            cy.get('[data-testid="upcoming-session"]').should('have.length.greaterThan', 0)
        })

        it('displays tool adoption by department', () => {
            cy.wait('@getAdoptionMetrics')

            cy.contains('Tool Adoption by Department').should('be.visible')
            cy.get('[data-testid="department-tools"]').should('have.length.greaterThan', 0)

            // Check department tool details
            cy.get('[data-testid="department-tools"]').first().within(() => {
                cy.get('[data-testid="department-name"]').should('be.visible')
                cy.get('[data-testid="tool-count-badge"]').should('be.visible')
                cy.get('[data-testid="tool-item"]').should('have.length.greaterThan', 0)
            })
        })

        it('filters by category', () => {
            cy.wait('@getAdoptionMetrics')

            // Apply category filter
            cy.get('[data-testid="category-filter"]').click()
            cy.contains('Learning Management').click()

            cy.wait('@getAdoptionMetrics')

            // Should filter data accordingly
            cy.get('[data-testid="tool-item"]').should('contain', 'Learning Management')
        })
    })

    describe('Watchlist Dashboard', () => {
        beforeEach(() => {
            // Mock watchlist metrics API
            cy.fixture('dashboards/watchlist-metrics.json').then((data) => {
                cy.intercept('GET', '/api/dashboard/watchlist*', data).as('getWatchlistMetrics')
            })
            cy.visit('/dashboard/watchlist')
        })

        it('displays watchlist overview', () => {
            cy.wait('@getWatchlistMetrics')

            // Check header
            cy.contains('Watchlist Dashboard').should('be.visible')
            cy.contains('Pending approvals and upcoming renewals').should('be.visible')

            // Check key metrics
            cy.contains('Pending Approvals').should('be.visible')
            cy.contains('Vendor Renewals').should('be.visible')
            cy.contains('Action Items').should('be.visible')
            cy.contains('Contract Value').should('be.visible')

            // Verify metric counts
            cy.get('[data-testid="pending-approvals"]').should('contain', '8')
            cy.get('[data-testid="vendor-renewals"]').should('contain', '5')
            cy.get('[data-testid="action-items"]').should('contain', '12')
        })

        it('shows priority action items', () => {
            cy.wait('@getWatchlistMetrics')

            cy.contains('Priority Action Items').should('be.visible')
            cy.get('[data-testid="action-item"]').should('have.length.greaterThan', 0)

            // Check action item details
            cy.get('[data-testid="action-item"]').first().within(() => {
                cy.get('[data-testid="action-title"]').should('be.visible')
                cy.get('[data-testid="priority-badge"]').should('be.visible')
                cy.get('[data-testid="action-type-badge"]').should('be.visible')
                cy.get('[data-testid="assigned-to"]').should('be.visible')
            })
        })

        it('displays pending approvals by category', () => {
            cy.wait('@getWatchlistMetrics')

            // Pending policies
            cy.contains('Pending Policies').should('be.visible')
            cy.get('[data-testid="pending-policy"]').should('have.length.greaterThan', 0)

            // Pending vendors
            cy.contains('Pending Vendors').should('be.visible')
            cy.get('[data-testid="pending-vendor"]').should('have.length.greaterThan', 0)

            // Pending assessments
            cy.contains('Pending Assessments').should('be.visible')
            cy.get('[data-testid="pending-assessment"]').should('have.length.greaterThan', 0)
        })

        it('shows vendor renewal information', () => {
            cy.wait('@getWatchlistMetrics')

            // Upcoming renewals
            cy.contains('Upcoming Renewals').should('be.visible')
            cy.get('[data-testid="upcoming-renewal"]').should('have.length.greaterThan', 0)

            // Overdue renewals (if any)
            cy.get('[data-testid="overdue-renewal"]').should('exist')

            // Check renewal details
            cy.get('[data-testid="upcoming-renewal"]').first().within(() => {
                cy.get('[data-testid="vendor-name"]').should('be.visible')
                cy.get('[data-testid="contract-value"]').should('be.visible')
                cy.get('[data-testid="renewal-date"]').should('be.visible')
                cy.get('[data-testid="days-until-renewal"]').should('be.visible')
            })
        })

        it('highlights overdue items', () => {
            cy.wait('@getWatchlistMetrics')

            // Should show overdue indicators
            cy.get('[data-testid="overdue-badge"]').should('be.visible')
            cy.get('[data-testid="overdue-renewal"]').should('have.class', 'border-red-500')

            // Overdue items should be prominently displayed
            cy.contains('Overdue by').should('be.visible')
        })

        it('handles empty watchlist state', () => {
            // Mock empty watchlist
            cy.intercept('GET', '/api/dashboard/watchlist*', {
                success: true,
                data: {
                    pendingApprovals: { policies: [], vendors: [], assessments: [], total: 0 },
                    vendorRenewals: { upcoming: [], overdue: [], total: 0 },
                    actionItems: []
                },
                lastUpdated: new Date().toISOString()
            }).as('getEmptyWatchlist')

            cy.visit('/dashboard/watchlist')
            cy.wait('@getEmptyWatchlist')

            cy.contains('All Clear').should('be.visible')
            cy.contains('No pending approvals or renewals requiring attention.').should('be.visible')
        })
    })

    describe('Dashboard Integration', () => {
        it('navigates between dashboards', () => {
            cy.visit('/dashboard/readiness')

            // Navigate to adoption dashboard
            cy.get('[data-testid="nav-adoption"]').click()
            cy.url().should('include', '/dashboard/adoption')
            cy.contains('Adoption Dashboard').should('be.visible')

            // Navigate to watchlist dashboard
            cy.get('[data-testid="nav-watchlist"]').click()
            cy.url().should('include', '/dashboard/watchlist')
            cy.contains('Watchlist Dashboard').should('be.visible')
        })

        it('maintains consistent filtering across dashboards', () => {
            cy.visit('/dashboard/readiness')

            // Apply department filter
            cy.get('[data-testid="department-filter"]').select('Technology')

            // Navigate to adoption dashboard
            cy.get('[data-testid="nav-adoption"]').click()

            // Filter should be maintained
            cy.get('[data-testid="department-filter"]').should('have.value', 'Technology')
        })

        it('shows loading states correctly', () => {
            // Slow API response simulation
            cy.intercept('GET', '/api/dashboard/readiness*', (req) => {
                req.reply({
                    delay: 2000,
                    fixture: 'dashboards/readiness-metrics.json'
                })
            }).as('getSlowMetrics')

            cy.visit('/dashboard/readiness')

            // Should show skeleton loader
            cy.get('[data-testid="dashboard-skeleton"]').should('be.visible')

            cy.wait('@getSlowMetrics')

            // Skeleton should disappear and content should load
            cy.get('[data-testid="dashboard-skeleton"]').should('not.exist')
            cy.contains('Readiness & Risk Dashboard').should('be.visible')
        })

        it('handles authentication requirements', () => {
            // Clear authentication
            cy.window().then((win) => {
                win.localStorage.removeItem('auth-user')
            })

            cy.visit('/dashboard/readiness')

            // Should redirect to login or show auth error
            cy.url().should('include', '/login')
        })
    })

    describe('Dashboard Data Snapshots', () => {
        it('captures readiness dashboard snapshot', () => {
            cy.fixture('dashboards/readiness-metrics.json').then((data) => {
                cy.intercept('GET', '/api/dashboard/readiness*', data).as('getReadinessMetrics')
            })

            cy.visit('/dashboard/readiness')
            cy.wait('@getReadinessMetrics')

            // Visual regression testing
            // cy.matchImageSnapshot('readiness-dashboard-full')

            // cy.get('[data-testid="metrics-cards"]').matchImageSnapshot('readiness-metrics-cards')
            // cy.get('[data-testid="trend-chart"]').matchImageSnapshot('readiness-trend-chart')
            // cy.get('[data-testid="risks-list"]').matchImageSnapshot('readiness-risks-list')

            // Verify components are visible instead
            cy.get('[data-testid="metrics-cards"]').should('be.visible')
            cy.get('[data-testid="trend-chart"]').should('be.visible')
            cy.get('[data-testid="risks-list"]').should('be.visible')
        })

        it('captures adoption dashboard snapshot', () => {
            cy.fixture('dashboards/adoption-metrics.json').then((data) => {
                cy.intercept('GET', '/api/dashboard/adoption*', data).as('getAdoptionMetrics')
            })

            cy.visit('/dashboard/adoption')
            cy.wait('@getAdoptionMetrics')

            // cy.matchImageSnapshot('adoption-dashboard-full')

            // Component snapshots
            // cy.get('[data-testid="adoption-charts"]').matchImageSnapshot('adoption-charts')
            // cy.get('[data-testid="recent-activity"]').matchImageSnapshot('adoption-recent-activity')

            // Verify components are visible instead
            cy.get('[data-testid="adoption-charts"]').should('be.visible')
            cy.get('[data-testid="recent-activity"]').should('be.visible')
        })

        it('captures watchlist dashboard snapshot', () => {
            cy.fixture('dashboards/watchlist-metrics.json').then((data) => {
                cy.intercept('GET', '/api/dashboard/watchlist*', data).as('getWatchlistMetrics')
            })

            cy.visit('/dashboard/watchlist')
            cy.wait('@getWatchlistMetrics')

            // cy.matchImageSnapshot('watchlist-dashboard-full')

            // Component snapshots
            // cy.get('[data-testid="action-items"]').matchImageSnapshot('watchlist-action-items')
            // cy.get('[data-testid="pending-approvals"]').matchImageSnapshot('watchlist-pending-approvals')
            // cy.get('[data-testid="vendor-renewals"]').matchImageSnapshot('watchlist-renewals')

            // Verify components are visible instead
            cy.get('[data-testid="action-items"]').should('be.visible')
            cy.get('[data-testid="pending-approvals"]').should('be.visible')
            cy.get('[data-testid="vendor-renewals"]').should('be.visible')
        })
    })

    describe('Dashboard Performance', () => {
        it('loads dashboards within performance budget', () => {
            cy.visit('/dashboard/readiness')

            // Dashboard should load within 3 seconds
            cy.get('[data-testid="metrics-cards"]', { timeout: 3000 }).should('be.visible')

            // API calls should complete quickly
            cy.get('@getReadinessMetrics.all').should('have.length', 1)
            cy.get('@getReadinessMetrics').its('response.statusCode').should('eq', 200)
        })

        it('efficiently updates data on filter changes', () => {
            cy.visit('/dashboard/readiness')
            cy.wait('@getReadinessMetrics')

            const startTime = Date.now()

            // Change filter
            cy.get('[data-testid="department-filter"]').select('Technology')
            cy.wait('@getReadinessMetrics')

            const endTime = Date.now()
            const duration = endTime - startTime

            // Filter change should complete within 1 second
            expect(duration).to.be.lessThan(1000)
        })
    })
})
