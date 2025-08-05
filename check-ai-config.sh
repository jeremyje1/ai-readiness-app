#!/bin/bash

echo "🔍 Pre-deployment AI Configuration Check..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ CRITICAL: .env file missing!"
    echo "   Clients will receive fallback reports (49KB instead of 700KB+)"
    exit 1
fi

# Check if OpenAI API key exists
if ! grep -q "OPENAI_API_KEY=" .env; then
    echo "❌ CRITICAL: OPENAI_API_KEY missing from .env!"
    echo "   Clients will receive fallback reports (49KB instead of 700KB+)"
    exit 1
fi

# Check if API key looks valid (should start with sk-)
API_KEY=$(grep "OPENAI_API_KEY=" .env | cut -d'=' -f2)
if [[ ! $API_KEY =~ ^sk- ]]; then
    echo "❌ CRITICAL: OpenAI API key appears invalid (should start with 'sk-')"
    echo "   Current key: $API_KEY"
    echo "   Clients will receive fallback reports (49KB instead of 700KB+)"
    exit 1
fi

if [[ ${#API_KEY} -lt 20 ]]; then
    echo "❌ CRITICAL: OpenAI API key appears too short (should be 50+ characters)"
    echo "   Current length: ${#API_KEY}"
    echo "   Clients will receive fallback reports (49KB instead of 700KB+)"
    exit 1
fi

# Test OpenAI connection with a simple model list request
echo "🧪 Testing OpenAI API connection..."
response=$(curl -s -w "\n%{http_code}" -X GET https://api.openai.com/v1/models \
  -H "Authorization: Bearer $API_KEY")

http_code=$(echo "$response" | tail -1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" != "200" ]; then
    echo "❌ CRITICAL: OpenAI API connection failed (HTTP $http_code)"
    echo "   Response: $body"
    echo "   Clients will receive fallback reports (49KB instead of 700KB+)"
    exit 1
fi

# Check if we can see GPT-4o model
if echo "$body" | grep -q "gpt-4o"; then
    echo "✅ OpenAI API connection successful - GPT-4o available"
else
    echo "⚠️  OpenAI API connected but GPT-4o not found in model list"
    echo "   This might affect AI report quality"
fi

echo "✅ OpenAI API configuration is valid"
echo "✅ Clients will receive full AI-enhanced reports (700KB+ with GPT-4o analysis)"
echo ""
echo "🚀 Ready for production deployment!"
