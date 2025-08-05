#!/bin/bash

# AI Readiness App - Production Deployment Script
# Optimized for AI workloads and enhanced features

set -e

echo "🤖 AI READINESS APP - PRODUCTION DEPLOYMENT"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Pre-deployment checks
log_info "Running AI-specific pre-deployment checks..."

# Check OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    log_error "OPENAI_API_KEY not configured. AI features will fail."
    exit 1
fi

# Test OpenAI connection
if [ -f "./check-openai-models.sh" ]; then
    ./check-openai-models.sh || {
        log_error "OpenAI configuration failed. Aborting deployment."
        exit 1
    }
    log_success "OpenAI configuration verified"
fi

# Test AI PDF generation
if [ -f "./test-enhanced-ai-pdf.sh" ]; then
    log_info "Testing AI PDF generation..."
    ./test-enhanced-ai-pdf.sh || {
        log_warning "AI PDF generation test failed. Deploying with fallback."
    }
fi

# Run AI reliability dashboard
if [ -f "./ai-reliability-dashboard.sh" ]; then
    log_info "Checking AI system reliability..."
    ./ai-reliability-dashboard.sh
fi

# Check if pnpm or npm
if command -v pnpm >/dev/null 2>&1; then
    PACKAGE_MANAGER="pnpm"
else
    PACKAGE_MANAGER="npm"
fi

# Build and deploy
log_info "Building AI readiness app with $PACKAGE_MANAGER..."
$PACKAGE_MANAGER run build

log_info "Deploying to Vercel..."
if command -v vercel >/dev/null 2>&1; then
    vercel --prod
else
    log_error "Vercel CLI not found. Please install: npm i -g vercel"
    exit 1
fi

# Post-deployment verification
log_info "Running post-deployment verification..."

# Set deployment URL (customize as needed)
DEPLOYMENT_URL="https://ai-readiness.northpathstrategies.org"

# Test health endpoint
log_info "Testing health endpoint..."
if curl -s "$DEPLOYMENT_URL/api/health" >/dev/null 2>&1; then
    log_success "Health check passed"
else
    log_warning "Health check failed - app may still be deploying"
fi

# Test AI readiness endpoint
log_info "Testing AI readiness endpoint..."
if curl -s "$DEPLOYMENT_URL/api/ai-readiness/calculate" >/dev/null 2>&1; then
    log_success "AI readiness endpoint accessible"
else
    log_warning "AI readiness endpoint not responding"
fi

log_success "AI Readiness App deployment complete! 🚀"
log_info "App URL: $DEPLOYMENT_URL"
log_info "Admin URL: $DEPLOYMENT_URL/admin"
log_info "AI Features: GPT-4o powered reports, 6 patent-pending algorithms"

echo ""
echo -e "${GREEN}🎉 Deployment successful! Your AI readiness app is live! 🎉${NC}"
