# E2E Testing Patterns Guide

This guide documents the E2E testing patterns and approaches used in the AI Readiness platform to help developers and AI assistants understand the testing methodology.

## Overview

Our E2E tests use Cypress with TypeScript and follow established patterns for consistent, maintainable test suites. Tests are organized by feature area and include comprehensive coverage of user workflows.

## Test Structure

### Custom Commands (`e2e/support/commands.ts`)

We've extended Cypress with domain-specific commands:

- **`cy.loginAs(role)`** - Authentication helper for different user roles
- **`cy.getByTestId(selector)`** - Consistent test selector pattern  
- **`cy.visitAndWait(url)`** - Navigate with loading state handling
- **`cy.uploadFile(selector, filename)`** - File upload workflow helper
- **`cy.createArtifactFixture()`** - Generate test artifacts for workflows
- **`cy.waitForProcessing(timeout?)`** - Wait for async processing completion
- **`cy.verifyDownload(filename)`** - Validate file download functionality

### Test Patterns

#### 1. Assessment Workflow (`assessment.cy.ts`)

**Happy Path Testing:**
```typescript
it('processes document upload through complete workflow', () => {
  cy.loginAs('owner')
  cy.visitAndWait('/assessment')
  cy.uploadFile('[data-testid="file-upload"]', 'handbook.pdf')
  cy.waitForProcessing()
  cy.verifyDownload('assessment-report.pdf')
})
```

**Error Handling:**
```typescript
it('handles invalid file formats gracefully', () => {
  cy.uploadFile('[data-testid="file-upload"]', 'invalid.txt')
  cy.contains('Unsupported file format').should('be.visible')
  cy.getByTestId('error-message').should('contain', 'Please upload a PDF')
})
```

**Accessibility Testing:**
```typescript
it('maintains accessibility standards', () => {
  cy.visitAndWait('/assessment')
  cy.injectAxe()
  cy.checkA11y()
})
```

#### 2. Approval Workflow (`approvals.cy.ts`)

**Multi-Stage Approvals:**
```typescript
it('routes artifact through two approvers', () => {
  cy.loginAs('owner')
  cy.createArtifactFixture().as('artifactId')
  cy.visitAndWait('/approvals')
  
  // Start approval
  cy.getByTestId('start-approval').click()
  
  // First approver
  cy.getByTestId('approver-1-approve').click()
  cy.getByTestId('approval-stage').should('contain', 'Stage 2')
  
  // Second approver requests changes
  cy.getByTestId('approver-2-request-changes').click()
  cy.getByTestId('change-comment').type('Update section 3.2')
  cy.getByTestId('submit-changes').click()
})
```

**Audit Trail Testing:**
```typescript
it('shows approval history and audit trail', () => {
  cy.loginAs('admin')
  cy.visitAndWait('/approvals/approval-123')
  
  cy.getByTestId('approval-history').should('be.visible')
  cy.contains('john.doe@school.edu').should('be.visible')
  cy.getByTestId('event-timestamp').should('contain', '10:00 AM')
})
```

## API Mocking Patterns

### Standard Interceptors

```typescript
beforeEach(() => {
  // Success responses
  cy.intercept('POST', '**/api/upload', {
    statusCode: 200,
    body: { id: 'upload-123', status: 'processing' }
  }).as('uploadFile')
  
  // Error responses  
  cy.intercept('POST', '**/api/upload', {
    statusCode: 400,
    body: { error: 'Invalid file format' }
  }).as('uploadError')
})
```

### Dynamic Fixtures

Use fixtures for complex response data:
```typescript
cy.intercept('GET', '**/api/approvals', { fixture: 'approval-dashboard.json' })
```

## Test Data Management

### Fixtures Location: `e2e/fixtures/`

- `approval-dashboard.json` - Approval workflow data
- `assessment-report.json` - Document assessment results
- `user-profiles.json` - Test user configurations

### Test ID Conventions

Use consistent `data-testid` attributes:
- `[action]-[component]` - e.g., `start-approval`, `upload-file`
- `[component]-[state]` - e.g., `approval-pending`, `processing-status`
- `[section]-[element]` - e.g., `header-menu`, `footer-links`

## User Role Testing

### Role-Based Access

```typescript
// Test different user permissions
cy.loginAs('admin')    // Full access
cy.loginAs('owner')    // Institution owner
cy.loginAs('user')     // Regular user
cy.loginAs('viewer')   // Read-only access
```

### Permission Validation

```typescript
it('enforces approval permissions and roles', () => {
  cy.loginAs('user')
  cy.getByTestId('bulk-approve').should('not.exist')
  
  cy.loginAs('admin') 
  cy.getByTestId('bulk-approve').should('be.visible')
})
```

## Mobile and Responsive Testing

### Viewport Testing

```typescript
it('supports mobile-responsive interface', () => {
  cy.viewport('iphone-6')
  cy.getByTestId('mobile-menu-toggle').should('be.visible')
  
  // Test swipe gestures
  cy.getByTestId('approval-card').swipe('left')
})
```

## Error Scenario Coverage

### Network Errors
- API timeouts
- Server errors (5xx)
- Network connectivity issues

### Validation Errors  
- Invalid file formats
- Missing required fields
- Business rule violations

### Edge Cases
- Large file uploads
- Concurrent user actions
- Session expiration

## Performance Testing

### Loading States

```typescript
cy.visitAndWait('/assessment')  // Waits for page ready
cy.waitForProcessing(30000)     // Custom timeout for long operations
```

### File Upload Testing

```typescript
cy.uploadFile('[data-testid="file-upload"]', 'large-document.pdf')
cy.getByTestId('upload-progress').should('be.visible')
cy.waitForProcessing()
```

## Best Practices

1. **Use Page Object Pattern** for complex workflows
2. **Mock External APIs** consistently 
3. **Test User Journeys** end-to-end
4. **Include Accessibility** in all tests
5. **Validate Error States** thoroughly
6. **Test Mobile Responsiveness** 
7. **Use Semantic Selectors** (data-testid)
8. **Keep Tests Independent** and atomic

## Running Tests

```bash
# Run all E2E tests
npm run cypress:run

# Run specific test file  
npx cypress run --spec "e2e/assessment.cy.ts"

# Open Cypress GUI
npx cypress open
```

## Debugging

- Use `cy.pause()` to stop execution
- Add `cy.debug()` for inspection
- Check Network tab for API calls
- Review test artifacts in `cypress/screenshots/`

This guide provides comprehensive patterns for creating maintainable, reliable E2E tests that cover the full user experience of the AI Readiness platform.
