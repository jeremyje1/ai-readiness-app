/// <reference types="cypress" />

// Custom commands for AI Readiness App testing

// Make this file a module
export { }

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Login with mock user credentials
             */
            loginAs(role?: 'admin' | 'user' | 'superintendent' | 'owner'): Chainable<void>

            /**
             * Navigate to a specific page and wait for load
             */
            visitAndWait(url: string): Chainable<void>

            /**
             * Check accessibility violations
             */
            checkA11y(): Chainable<void>

            /**
             * Mock API response
             */
            mockApi(endpoint: string, fixture: string): Chainable<void>

            /**
             * Get element by test ID (data-testid)
             */
            getByTestId(testId: string): Chainable<JQuery<HTMLElement>>

            /**
             * Wait for API request to complete
             */
            waitForApi(alias: string): Chainable<void>

            /**
             * Upload file to dropzone
             */
            uploadFile(selector: string, fileName: string): Chainable<void>

            /**
             * Create artifact fixture for testing
             */
            createArtifactFixture(): Chainable<string>

            /**
             * Wait for processing to complete
             */
            waitForProcessing(): Chainable<void>

            /**
             * Check download was triggered
             */
            verifyDownload(fileName: string): Chainable<void>
        }
    }
}

// Login command
Cypress.Commands.add('loginAs', (role: 'admin' | 'user' | 'superintendent' | 'owner' = 'admin') => {
    const users: Record<string, any> = {
        admin: { id: 'admin-1', email: 'admin@school.edu', role: 'admin' },
        user: { id: 'user-1', email: 'user@school.edu', role: 'user' },
        superintendent: { id: 'super-1', email: 'super@school.edu', role: 'superintendent' },
        owner: { id: 'owner-1', email: 'owner@school.edu', role: 'owner' }
    }

    cy.window().then((win) => {
        win.localStorage.setItem('auth_user', JSON.stringify(users[role]))
    })
})

// Visit and wait command
Cypress.Commands.add('visitAndWait', (url: string) => {
    cy.visit(url)
    cy.get('body').should('be.visible')
    cy.wait(500) // Brief wait for hydration
})

// Accessibility check command
Cypress.Commands.add('checkA11y', () => {
    // Placeholder for axe-core integration
    cy.log('Accessibility check - implement axe-core if needed')
})

// Mock API command
Cypress.Commands.add('mockApi', (endpoint: string, fixture: string) => {
    cy.intercept('GET', `**/api/${endpoint}`, { fixture }).as(`mock-${endpoint}`)
})

// Get by test ID command
Cypress.Commands.add('getByTestId', (testId: string) => {
    return cy.get(`[data-testid="${testId}"]`)
})

// Wait for API command
Cypress.Commands.add('waitForApi', (alias: string) => {
    cy.wait(`@${alias}`)
})

// Upload file command
Cypress.Commands.add('uploadFile', (selector: string, fileName: string) => {
    cy.get(selector).selectFile(`e2e/fixtures/${fileName}`, { force: true })
})

// Create artifact fixture command
Cypress.Commands.add('createArtifactFixture', () => {
    const artifactId = `artifact-${Date.now()}`

    // Mock artifact creation API
    cy.intercept('POST', '**/api/artifacts', {
        statusCode: 201,
        body: { id: artifactId, status: 'pending' }
    }).as('createArtifact')

    return cy.wrap(artifactId)
})

// Wait for processing command
Cypress.Commands.add('waitForProcessing', () => {
    // Wait for processing indicators to disappear
    cy.get('[data-testid*="processing"]', { timeout: 30000 }).should('not.exist')
    cy.get('.loading', { timeout: 30000 }).should('not.exist')
})

// Verify download command
Cypress.Commands.add('verifyDownload', (fileName: string) => {
    // Mock download verification
    cy.window().its('downloadTriggered').should('contain', fileName)
})
