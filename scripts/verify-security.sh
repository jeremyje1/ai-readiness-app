#!/bin/bash
# Security Verification Script
# Run this after updating all credentials to verify everything works

set -e

echo "🔒 AI Readiness App - Security Verification"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="${1:-https://aiblueprint.educationaiblueprint.com}"

echo "Testing against: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
if curl -sf "$BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
fi
echo ""

# Test 2: Stripe Configuration
echo "2️⃣  Testing Stripe Configuration..."
STRIPE_RESPONSE=$(curl -sf "$BASE_URL/api/stripe/config-status" 2>/dev/null || echo "failed")
if [[ "$STRIPE_RESPONSE" == *"present"* ]]; then
    echo -e "${GREEN}✅ Stripe configuration loaded${NC}"
else
    echo -e "${RED}❌ Stripe configuration error${NC}"
fi
echo ""

# Test 3: API Routes Responding
echo "3️⃣  Testing API Routes..."
ROUTES=(
    "/api/assessment/submit"
    "/api/blueprint/generate"
    "/api/stripe/edu-checkout"
)

for route in "${ROUTES[@]}"; do
    STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL$route" -X OPTIONS 2>/dev/null || echo "000")
    if [[ "$STATUS" != "000" && "$STATUS" != "404" ]]; then
        echo -e "${GREEN}✅ $route responding${NC}"
    else
        echo -e "${YELLOW}⚠️  $route status: $STATUS${NC}"
    fi
done
echo ""

# Test 4: Check Environment Variables (local)
echo "4️⃣  Checking Local Environment Variables..."
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "STRIPE_SECRET_KEY"
    "NEXTAUTH_SECRET"
    "ADMIN_GRANT_TOKEN"
    "CRON_SECRET"
    "JWT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [[ -n "${!var}" ]]; then
        echo -e "${GREEN}✅ $var is set${NC}"
    else
        echo -e "${RED}❌ $var is not set${NC}"
    fi
done
echo ""

# Summary
echo "🎯 Verification Complete!"
echo ""
echo "Next Steps:"
echo "1. Test user signup and login"
echo "2. Test Stripe checkout flow (use test card: 4242 4242 4242 4242)"
echo "3. Test email delivery (signup/password reset)"
echo "4. Monitor application logs for errors"
echo ""
echo "If all tests pass, security remediation is complete! ✅"
