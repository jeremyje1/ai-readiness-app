# Development Guidelines & VS Code Setup

## 🎯 Overview

This document outlines the development standards, VS Code configuration, and quality guardrails for the AI Readiness Assessment Platform.

## 🛠️ VS Code Configuration

### Automatic Setup
The `.vscode/` directory contains predefined settings for consistent development:

- **Auto-formatting** on save
- **Auto-import organization** 
- **TypeScript project diagnostics**
- **ESLint validation** for all supported file types
- **Consistent line endings** (LF)

### Available Tasks
Use `Ctrl+Shift+P` → "Tasks: Run Task" to access:

- `typecheck` - TypeScript type checking
- `lint` - ESLint code quality checks  
- `test` - Run unit tests with Vitest
- `e2e` - Run end-to-end tests with Cypress
- `build` - Production build
- `precommit` - Complete quality gate check

## 🚦 Quality Guardrails

### Pre-commit Hooks
Husky automatically runs quality checks before each commit:

```bash
npm run precommit
```

This executes:
1. **TypeScript type checking** (`npm run typecheck`)
2. **ESLint code quality** (`npm run lint`) 
3. **Unit test suite** (`npm run test:run`)

### Manual Quality Checks
```bash
# Type checking
npm run typecheck

# Linting 
npm run lint

# Unit tests
npm run test

# E2E tests  
npm run cypress:run

# Full quality gate
npm run precommit
```

## 📝 Pull Request Process

### PR Template Checklist
Every PR must complete the following checklist:

#### **Engineering Requirements**
- [ ] `ENGINEERING_PLAN.md` updated with feature details
- [ ] Database migrations + seeds + rollback scripts
- [ ] API contracts documented in `/docs/http/*.http`
- [ ] Unit/integration/e2e tests added (screenshots attached)

#### **Operational Requirements**  
- [ ] Telemetry added (logs/metrics/traces)
- [ ] Feature flag + rollout/rollback plan
- [ ] Performance impact assessed

#### **Quality Requirements**
- [ ] Accessibility checks (labels, tab order, contrast)
- [ ] Security/Privacy review (no PII to LLMs, secrets safe)
- [ ] Type checking passes: `npm run typecheck`
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm run test`

### Code Review Standards
- **Security**: No secrets in code, proper input validation
- **Performance**: Database query optimization, bundle size impact
- **Accessibility**: WCAG compliance, keyboard navigation
- **Testing**: Appropriate test coverage, edge cases handled
- **Documentation**: API contracts, feature flag documentation

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:ui       # Visual UI
```

### E2E Tests (Cypress)
```bash
npm run cypress:open  # Interactive mode
npm run cypress:run   # Headless mode
```

### Custom Cypress Commands
Available in all E2E tests:

```typescript
// Mock authentication
cy.loginAs('admin' | 'user' | 'superintendent')

// Navigate with loading wait
cy.visitAndWait('/dashboard')

// Mock API responses
cy.mockApi('dashboard/readiness', 'readiness-metrics.json')

// Accessibility validation
cy.checkA11y()
```

## 📁 Project Structure

### API Documentation
```
/docs/http/
├── dashboard.http        # Dashboard API endpoints
├── policy-updates.http   # Policy updates endpoints
└── *.http               # Additional API documentation
```

### Test Organization
```
/test/                   # Unit tests (Vitest)
/e2e/                    # End-to-end tests (Cypress)  
├── fixtures/            # Test data
├── support/             # Custom commands
└── *.cy.ts             # Test specs
```

### Configuration Files
```
/.vscode/
├── settings.json        # Editor preferences
└── tasks.json          # VS Code tasks

/.husky/
└── pre-commit          # Git hooks

/cypress.config.ts       # E2E test configuration
/.eslintrc.json         # Code quality rules
```

## 🚀 Development Workflow

### 1. Setup New Feature
```bash
# Update engineering plan
vim ENGINEERING_PLAN.md

# Create feature branch
git checkout -b feature/new-feature

# Install dependencies if needed
npm install
```

### 2. Development Cycle
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test

# Type check continuously
npm run typecheck --watch
```

### 3. Quality Assurance
```bash
# Full quality gate
npm run precommit

# E2E testing
npm run cypress:run

# Manual testing checklist
# □ Accessibility (keyboard nav, screen reader)
# □ Performance (loading times, bundle size)
# □ Security (input validation, auth checks)
```

### 4. Pre-commit Checklist
- [ ] Feature flag configured
- [ ] Database migration tested
- [ ] API endpoints documented
- [ ] Tests written and passing
- [ ] Performance impact minimal
- [ ] Security review completed
- [ ] Accessibility verified

### 5. Submit PR
```bash
# Commit with quality gate
git add .
git commit -m "feat: implement new feature"

# Push and create PR
git push origin feature/new-feature
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Feature Flags
POLICY_UPDATES_AUTO_REDLINE=false
ENABLE_ADVANCED_AI=true
```

### Optional Development Tools
```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-playwright.playwright
```

## 📊 Performance Standards

### Build Performance
- **Type checking**: < 30 seconds
- **Linting**: < 10 seconds  
- **Unit tests**: < 60 seconds
- **E2E tests**: < 5 minutes
- **Production build**: < 2 minutes

### Runtime Performance
- **Page load**: < 3 seconds
- **API response**: < 1 second
- **Database queries**: < 500ms
- **Bundle size**: < 1MB main chunk

## 🛡️ Security Guidelines

### Code Security
- No hardcoded secrets or credentials
- Input validation on all user inputs
- SQL injection prevention (use parameterized queries)
- XSS prevention (escape user content)
- CSRF protection enabled

### Privacy Protection  
- No PII sent to external LLMs
- Sensitive data encrypted at rest
- Audit logs for data access
- GDPR/FERPA compliance maintained

### Authentication & Authorization
- All API endpoints require authentication
- Role-based access control implemented
- Session management secure
- Password requirements enforced

---

*AI Readiness Platform Development Standards v1.0*
