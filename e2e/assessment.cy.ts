/**
 * Assessment 2.0 E2E Tests
 * Tests the document upload, processing, and artifact generation workflow
 */

describe('Assessment 2.0 Flow', () => {
    beforeEach(() => {
        // Mock authentication
        cy.loginAs('admin')

        // Mock processing APIs
        cy.intercept('POST', '**/api/documents/upload', {
            statusCode: 200,
            body: {
                id: 'doc-123',
                status: 'uploaded',
                fileName: 'handbook.pdf'
            }
        }).as('uploadDocument')

        cy.intercept('GET', '**/api/documents/doc-123/status', {
            statusCode: 200,
            body: {
                id: 'doc-123',
                status: 'processing',
                stages: {
                    virus_scan: { status: 'completed' },
                    text_extraction: { status: 'processing' },
                    gap_analysis: { status: 'pending' }
                }
            }
        }).as('checkStatus')

        cy.intercept('GET', '**/api/documents/doc-123/artifacts', {
            statusCode: 200,
            body: {
                artifacts: [
                    { id: 'gap-report-123', type: 'gap-report', status: 'ready' },
                    { id: 'policy-redline-123', type: 'policy-redline', status: 'ready' },
                    { id: 'board-deck-123', type: 'board-deck', status: 'ready' }
                ]
            }
        }).as('getArtifacts')
    })

    it('uploads documents, runs analysis, and downloads artifacts', () => {
        // Navigate to assessment page
        cy.visitAndWait('/assessment')

        // Verify page loaded
        cy.contains('Document Upload').should('be.visible')
        cy.getByTestId('dropzone').should('be.visible')

        // Upload document
        cy.getByTestId('dropzone').selectFile('e2e/fixtures/handbook.pdf', { force: true })

        // Verify upload initiated
        cy.wait('@uploadDocument')
        cy.contains('Processing').should('exist')

        // Mock processing completion
        cy.intercept('GET', '**/api/documents/doc-123/status', {
            statusCode: 200,
            body: {
                id: 'doc-123',
                status: 'completed',
                stages: {
                    virus_scan: { status: 'completed' },
                    text_extraction: { status: 'completed' },
                    gap_analysis: { status: 'completed' },
                    artifact_generation: { status: 'completed' }
                }
            }
        }).as('processingComplete')

        // Wait for processing to complete
        cy.waitForProcessing()

        // Verify analysis results appear
        cy.contains('Review Findings').should('exist')
        cy.wait('@getArtifacts')

        // Verify artifacts are available
        cy.getByTestId('artifact-gap-report').should('exist')
        cy.getByTestId('artifact-policy-redline').should('exist')
        cy.getByTestId('artifact-board-deck').should('exist')

        // Test artifact download
        cy.getByTestId('artifact-gap-report').click()

        // Verify download was triggered (mock)
        cy.window().then((win) => {
            // In a real test, you might check for download events
            cy.log('Gap report download triggered')
        })
    })

    it('handles upload errors gracefully', () => {
        // Mock upload failure
        cy.intercept('POST', '**/api/documents/upload', {
            statusCode: 400,
            body: { error: 'File too large' }
        }).as('uploadError')

        cy.visitAndWait('/assessment')

        // Try to upload oversized file
        cy.getByTestId('dropzone').selectFile('e2e/fixtures/large-file.pdf', { force: true })

        // Verify error handling
        cy.wait('@uploadError')
        cy.contains('File too large').should('be.visible')
        cy.getByTestId('error-message').should('be.visible')
    })

    it('shows processing stages progress', () => {
        cy.visitAndWait('/assessment')
        cy.getByTestId('dropzone').selectFile('e2e/fixtures/handbook.pdf', { force: true })

        // Mock different processing stages
        const stages = [
            { virus_scan: { status: 'completed' }, text_extraction: { status: 'processing' } },
            { virus_scan: { status: 'completed' }, text_extraction: { status: 'completed' }, gap_analysis: { status: 'processing' } },
            { virus_scan: { status: 'completed' }, text_extraction: { status: 'completed' }, gap_analysis: { status: 'completed' } }
        ]

        stages.forEach((stage, index) => {
            cy.intercept('GET', '**/api/documents/doc-123/status', {
                statusCode: 200,
                body: { id: 'doc-123', status: 'processing', stages: stage }
            }).as(`stage${index}`)
        })

        // Verify progress indicators
        cy.getByTestId('progress-virus-scan').should('contain', 'Completed')
        cy.getByTestId('progress-text-extraction').should('contain', 'Processing')
    })

    it('supports accessibility navigation', () => {
        cy.visitAndWait('/assessment')

        // Test keyboard navigation
        cy.get('body').focus().type('{tab}')
        cy.focused().should('have.attr', 'data-testid', 'dropzone')

        // Test screen reader support
        cy.getByTestId('dropzone').should('have.attr', 'aria-label')
        cy.checkA11y()
    })

    it('handles multiple document uploads', () => {
        cy.visitAndWait('/assessment')

        // Upload first document
        cy.getByTestId('dropzone').selectFile('e2e/fixtures/handbook.pdf', { force: true })
        cy.wait('@uploadDocument')

        // Upload second document
        cy.getByTestId('add-document').click()
        cy.getByTestId('dropzone-2').selectFile('e2e/fixtures/policy.pdf', { force: true })

        // Verify both documents are processing
        cy.getByTestId('document-list').children().should('have.length', 2)
        cy.contains('handbook.pdf').should('be.visible')
        cy.contains('policy.pdf').should('be.visible')
    })
})
