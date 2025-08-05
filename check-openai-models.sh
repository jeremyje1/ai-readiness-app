#!/bin/bash

# OpenAI Model Configuration Checker
# Helps verify which models are available in your OpenAI project

echo "🔧 OpenAI Model Configuration Checker"
echo "======================================"

# Check if API key exists
if [ -z "$OPENAI_API_KEY" ]; then
    if [ -f ".env" ] && grep -q "OPENAI_API_KEY" .env; then
        echo "✅ API key found in .env file"
        # Source the .env file
        export $(cat .env | grep OPENAI_API_KEY | xargs)
    elif [ -f ".env.local" ] && grep -q "OPENAI_API_KEY" .env.local; then
        echo "✅ API key found in .env.local file"
        export $(cat .env.local | grep OPENAI_API_KEY | xargs)
    else
        echo "❌ OPENAI_API_KEY not found"
        echo ""
        echo "💡 Please add your OpenAI API key to .env or .env.local:"
        echo "   OPENAI_API_KEY=your_key_here"
        exit 1
    fi
fi

echo "✅ API key configured"
echo ""

echo "🧪 Testing model availability..."

# Test GPT-4o
echo "Testing gpt-4o..."
RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Test"}],
    "max_tokens": 10
  }')

if echo "$RESPONSE" | grep -q "error"; then
    ERROR=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    echo "❌ gpt-4o: $ERROR"
    GPT4O_AVAILABLE=false
else
    echo "✅ gpt-4o: Available"
    GPT4O_AVAILABLE=true
fi

# Test GPT-4o-mini
echo "Testing gpt-4o-mini..."
RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Test"}],
    "max_tokens": 10
  }')

if echo "$RESPONSE" | grep -q "error"; then
    ERROR=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    echo "❌ gpt-4o-mini: $ERROR"
    GPT4OMINI_AVAILABLE=false
else
    echo "✅ gpt-4o-mini: Available"
    GPT4OMINI_AVAILABLE=true
fi

# Test DALL-E 3
echo "Testing dall-e-3..."
RESPONSE=$(curl -s https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "dall-e-3",
    "prompt": "test",
    "n": 1,
    "size": "1024x1024"
  }')

if echo "$RESPONSE" | grep -q "error"; then
    ERROR=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    echo "❌ dall-e-3: $ERROR"
    DALLE_AVAILABLE=false
else
    echo "✅ dall-e-3: Available"
    DALLE_AVAILABLE=true
fi

echo ""
echo "📊 SUMMARY"
echo "=========="

if [ "$GPT4O_AVAILABLE" = true ]; then
    echo "✅ Primary AI model (gpt-4o) ready for enhanced reports"
else
    echo "❌ Primary AI model (gpt-4o) not available"
    echo "   🔧 Action needed: Enable gpt-4o in OpenAI project settings"
fi

if [ "$GPT4OMINI_AVAILABLE" = true ]; then
    echo "✅ Fallback AI model (gpt-4o-mini) available"
else
    echo "⚠️  Fallback AI model (gpt-4o-mini) not available"
fi

if [ "$DALLE_AVAILABLE" = true ]; then
    echo "✅ AI image generation (dall-e-3) ready for org charts"
else
    echo "❌ AI image generation (dall-e-3) not available"
    echo "   🔧 Action needed: Enable dall-e-3 in OpenAI project settings"
fi

echo ""
echo "🛠️  CONFIGURATION INSTRUCTIONS"
echo "==============================="
echo ""
echo "1. Visit: https://platform.openai.com/settings/organization/projects"
echo "2. Select your project"
echo "3. Go to 'Limits' or 'Models' tab"
echo "4. Enable these models:"
echo "   ✅ gpt-4o (for AI reports)"
echo "   ✅ gpt-4o-mini (fallback)"
echo "   ✅ dall-e-3 (for org chart images)"
echo "   ✅ gpt-3.5-turbo (emergency fallback)"
echo ""
echo "5. Set usage limits as needed"
echo "6. Save changes"
echo ""

if [ "$GPT4O_AVAILABLE" = false ]; then
    echo "⚠️  CURRENT IMPACT:"
    echo "   • Enhanced AI reports will use fallback models"
    echo "   • Report quality may be reduced"
    echo "   • Some features may not work optimally"
    echo ""
fi

if [ "$DALLE_AVAILABLE" = false ]; then
    echo "⚠️  IMAGE GENERATION IMPACT:"
    echo "   • AI org chart images will not be generated"
    echo "   • System will use SVG fallbacks"
    echo "   • Visual quality may be reduced"
    echo ""
fi

echo "💡 After enabling models, run this script again to verify"
