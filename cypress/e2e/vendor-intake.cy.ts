/**
 * Vendor Intake End-to-End Tests
 * Tests the complete vendor assessment workflow
 * @version 1.0.0
 */

describe('Vendor Intake System', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth-user', JSON.stringify({
        id: 'test-user-123',
        email: 'test@school.edu',
        role: 'admin'
      }))
    })

    // Intercept API calls
    cy.intercept('GET', '/api/vendors*', { fixture: 'vendors/empty-list.json' }).as('getVendors')
    cy.intercept('POST', '/api/vendors', { fixture: 'vendors/create-success.json' }).as('createVendor')
    cy.intercept('POST', '/api/vendors/*/decision-brief', { fixture: 'vendors/brief-success.json' }).as('generateBrief')
  })

  describe('Vendor Intake Form', () => {
    beforeEach(() => {
      cy.visit('/vendor/intake')
    })

    it('displays the intake form with all sections', () => {
      cy.contains('Vendor Assessment Form').should('be.visible')
      cy.contains('Basic Information').should('be.visible')
      cy.contains('Data Handling').should('be.visible')
      cy.contains('AI Capabilities').should('be.visible')
      cy.contains('Student Data').should('be.visible')
      cy.contains('Compliance').should('be.visible')
      cy.contains('Technical Integration').should('be.visible')
    })

    it('validates required fields', () => {
      cy.get('[data-testid="submit-assessment"]').click()
      
      // Should show validation errors
      cy.contains('Vendor name is required').should('be.visible')
      cy.contains('Please provide a description').should('be.visible')
      cy.contains('Category is required').should('be.visible')
    })

    it('shows conditional fields based on responses', () => {
      // Initially, age gate questions should be hidden
      cy.get('[data-testid="minimum-age"]').should('not.exist')
      
      // Enable student data handling
      cy.get('[data-testid="handles-student-data"]').check()
      
      // Now age gate questions should appear
      cy.get('[data-testid="age-gate"]').should('be.visible')
      cy.get('[data-testid="age-gate"]').check()
      cy.get('[data-testid="minimum-age"]').should('be.visible')
    })

    it('evaluates AI risks in real-time', () => {
      // Fill in AI service details
      cy.get('[data-testid="is-ai-service"]').check()
      cy.get('[data-testid="trains-on-user-data"]').check()
      cy.get('[data-testid="bias-auditing"]').uncheck()
      
      // Should show AI risk warnings
      cy.contains('AI Training Risk').should('be.visible')
      cy.contains('High risk: Service trains models on user data').should('be.visible')
      cy.contains('Bias Risk').should('be.visible')
    })

    it('displays FERPA compliance warnings', () => {
      // Set up FERPA violation scenario
      cy.get('[data-testid="handles-student-data"]').check()
      cy.get('[data-testid="stores-pii"]').check()
      cy.get('[data-testid="pii-types"]').select(['grades', 'behavior'])
      cy.get('[data-testid="data-location"]').select(['other'])
      cy.get('[data-testid="data-retention"]').type('indefinite')
      
      // Should show FERPA warnings
      cy.contains('FERPA Compliance Risk').should('be.visible')
      cy.contains('High risk: Indefinite data retention').should('be.visible')
      cy.contains('Medium risk: Data stored outside US').should('be.visible')
    })

    it('shows COPPA warnings for young student data', () => {
      // Set up COPPA scenario
      cy.get('[data-testid="handles-student-data"]').check()
      cy.get('[data-testid="age-gate"]').check()
      cy.get('[data-testid="minimum-age"]').type('10')
      cy.get('[data-testid="parental-consent"]').uncheck()
      
      // Should show COPPA warnings
      cy.contains('COPPA Compliance Risk').should('be.visible')
      cy.contains('Critical risk: Handles data from children under 13 without parental consent').should('be.visible')
    })

    it('completes full assessment submission', () => {
      // Fill in all required fields
      cy.get('[data-testid="vendor-name"]').type('TestVendor Learning Platform')
      cy.get('[data-testid="vendor-url"]').type('https://testvendor.com')
      cy.get('[data-testid="description"]').type('A comprehensive learning management system')
      cy.get('[data-testid="category"]').select('Learning Management')
      cy.get('[data-testid="contact-email"]').type('contact@testvendor.com')
      cy.get('[data-testid="contact-name"]').type('John Doe')
      cy.get('[data-testid="business-justification"]').type('Need better student engagement tools')

      // Data handling
      cy.get('[data-testid="stores-pii"]').check()
      cy.get('[data-testid="pii-types"]').select(['names', 'emails'])
      cy.get('[data-testid="data-location"]').select(['us'])
      cy.get('[data-testid="data-retention"]').type('7 years')

      // AI capabilities
      cy.get('[data-testid="is-ai-service"]').uncheck()

      // Student data
      cy.get('[data-testid="handles-student-data"]').check()
      cy.get('[data-testid="age-gate"]').check()
      cy.get('[data-testid="minimum-age"]').type('13')
      cy.get('[data-testid="educational-purpose"]').check()

      // Compliance
      cy.get('[data-testid="privacy-policy"]').check()
      cy.get('[data-testid="terms-of-service"]').check()
      cy.get('[data-testid="data-processing-agreement"]').check()

      // Submit the assessment
      cy.get('[data-testid="submit-assessment"]').click()

      // Should show success message
      cy.wait('@createVendor')
      cy.contains('Vendor assessment submitted successfully').should('be.visible')
    })
  })

  describe('Vendor Dashboard', () => {
    beforeEach(() => {
      cy.fixture('vendors/dashboard-data.json').then((data) => {
        cy.intercept('GET', '/api/vendors*', data).as('getVendorsDashboard')
      })
      cy.visit('/vendor/dashboard')
    })

    it('displays vendor statistics', () => {
      cy.wait('@getVendorsDashboard')
      
      cy.contains('Total Vendors').should('be.visible')
      cy.contains('Pending Review').should('be.visible')
      cy.contains('Approved').should('be.visible')
      cy.contains('High Risk').should('be.visible')
    })

    it('filters vendors by status', () => {
      cy.wait('@getVendorsDashboard')
      
      // Filter by pending status
      cy.get('[data-testid="status-filter"]').click()
      cy.contains('Pending').click()
      
      // Should only show pending vendors
      cy.get('[data-testid="vendor-card"]').should('contain', 'pending')
    })

    it('generates decision brief for vendor', () => {
      cy.wait('@getVendorsDashboard')
      
      // Click generate brief button for first vendor
      cy.get('[data-testid="generate-brief-btn"]').first().click()
      
      cy.wait('@generateBrief')
      cy.contains('Decision brief generated successfully').should('be.visible')
    })

    it('searches vendors by name', () => {
      cy.wait('@getVendorsDashboard')
      
      cy.get('[data-testid="vendor-search"]').type('TestVendor')
      
      // Should filter results
      cy.get('[data-testid="vendor-card"]').should('contain', 'TestVendor')
    })
  })

  describe('Vendor Catalog', () => {
    beforeEach(() => {
      cy.fixture('vendors/catalog-data.json').then((data) => {
        cy.intercept('GET', '/api/vendors*', data).as('getCatalog')
      })
      cy.visit('/vendor/catalog')
    })

    it('displays approved tools', () => {
      cy.wait('@getCatalog')
      
      cy.contains('Approved Tool Catalog').should('be.visible')
      cy.get('[data-testid="catalog-item"]').should('have.length.greaterThan', 0)
    })

    it('filters tools by category', () => {
      cy.wait('@getCatalog')
      
      cy.get('[data-testid="category-filter"]').click()
      cy.contains('Learning Management').click()
      
      // Should filter to only LMS tools
      cy.get('[data-testid="catalog-item"]').should('contain', 'Learning Management')
    })

    it('shows tool usage guidelines', () => {
      cy.wait('@getCatalog')
      
      cy.get('[data-testid="catalog-item"]').first().within(() => {
        cy.contains('Approved Usage').should('be.visible')
        cy.contains('Restrictions').should('be.visible')
      })
    })

    it('opens vendor website', () => {
      cy.wait('@getCatalog')
      
      // Mock window.open
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen')
      })
      
      cy.get('[data-testid="visit-site-btn"]').first().click()
      cy.get('@windowOpen').should('have.been.called')
    })
  })

  describe('Decision Brief Generation', () => {
    beforeEach(() => {
      cy.fixture('vendors/vendor-details.json').then((data) => {
        cy.intercept('GET', '/api/vendors/*', data).as('getVendorDetails')
      })
    })

    it('generates comprehensive decision brief', () => {
      cy.intercept('POST', '/api/vendors/*/decision-brief', {
        statusCode: 200,
        body: { success: true, data: { id: 'brief-123' } }
      }).as('generateBrief')

      cy.visit('/vendor/dashboard')
      cy.wait('@getVendorsDashboard')
      
      cy.get('[data-testid="generate-brief-btn"]').first().click()
      
      cy.wait('@generateBrief')
      cy.contains('Decision brief generated successfully').should('be.visible')
    })

    it('downloads decision brief as PDF', () => {
      cy.intercept('GET', '/api/vendors/*/download', {
        statusCode: 200,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="decision_brief.pdf"'
        },
        body: 'mock-pdf-content'
      }).as('downloadBrief')

      // Trigger download
      cy.visit('/vendor/dashboard')
      cy.wait('@getVendorsDashboard')
      
      cy.get('[data-testid="download-brief-btn"]').first().click()
      
      cy.wait('@downloadBrief')
    })
  })

  describe('Complete Workflow Integration', () => {
    it('completes full vendor intake to catalog workflow', () => {
      // Step 1: Submit vendor assessment
      cy.visit('/vendor/intake')
      
      // Fill out assessment form (abbreviated)
      cy.get('[data-testid="vendor-name"]').type('WorkflowTest Vendor')
      cy.get('[data-testid="description"]').type('Test vendor for workflow')
      cy.get('[data-testid="category"]').select('Learning Management')
      cy.get('[data-testid="contact-email"]').type('test@workflow.com')
      cy.get('[data-testid="contact-name"]').type('Test Contact')
      cy.get('[data-testid="business-justification"]').type('Testing workflow')
      
      // Basic compliance setup
      cy.get('[data-testid="handles-student-data"]').check()
      cy.get('[data-testid="stores-pii"]').uncheck()
      cy.get('[data-testid="educational-purpose"]').check()
      cy.get('[data-testid="privacy-policy"]').check()
      cy.get('[data-testid="terms-of-service"]').check()
      
      cy.get('[data-testid="submit-assessment"]').click()
      cy.wait('@createVendor')

      // Step 2: Navigate to dashboard and generate brief
      cy.visit('/vendor/dashboard')
      cy.wait('@getVendorsDashboard')
      
      cy.get('[data-testid="generate-brief-btn"]').first().click()
      cy.wait('@generateBrief')

      // Step 3: Mock approval process
      cy.intercept('PATCH', '/api/vendors/*', {
        statusCode: 200,
        body: { success: true, data: { status: 'approved' } }
      }).as('approveVendor')

      // Step 4: Verify vendor appears in catalog
      cy.fixture('vendors/approved-catalog.json').then((data) => {
        cy.intercept('GET', '/api/vendors*', data).as('getApprovedCatalog')
      })

      cy.visit('/vendor/catalog')
      cy.wait('@getApprovedCatalog')
      
      cy.contains('WorkflowTest Vendor').should('be.visible')
      cy.contains('Approved').should('be.visible')
    })

    it('handles high-risk vendor with mitigations', () => {
      // Submit high-risk vendor assessment
      cy.visit('/vendor/intake')
      
      // Fill high-risk scenario
      cy.get('[data-testid="vendor-name"]').type('HighRisk AI Platform')
      cy.get('[data-testid="description"]').type('AI platform with student data training')
      cy.get('[data-testid="category"]').select('AI & Machine Learning')
      cy.get('[data-testid="contact-email"]').type('contact@highrisk.com')
      cy.get('[data-testid="contact-name"]').type('Risk Contact')
      cy.get('[data-testid="business-justification"]').type('Need AI capabilities')
      
      // High-risk settings
      cy.get('[data-testid="is-ai-service"]').check()
      cy.get('[data-testid="trains-on-user-data"]').check()
      cy.get('[data-testid="handles-student-data"]').check()
      cy.get('[data-testid="stores-pii"]').check()
      cy.get('[data-testid="pii-types"]').select(['grades', 'behavior'])
      cy.get('[data-testid="data-location"]').select(['other'])
      cy.get('[data-testid="age-gate"]').check()
      cy.get('[data-testid="minimum-age"]').type('8')
      cy.get('[data-testid="parental-consent"]').uncheck()
      
      // Should show multiple risk flags
      cy.contains('FERPA Compliance Risk').should('be.visible')
      cy.contains('COPPA Compliance Risk').should('be.visible')
      cy.contains('AI Training Risk').should('be.visible')
      
      cy.get('[data-testid="submit-assessment"]').click()
      
      // Should require review due to high risk
      cy.contains('High-risk assessment submitted for review').should('be.visible')
    })
  })
})
