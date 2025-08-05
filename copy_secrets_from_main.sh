#!/bin/bash

echo "🔄 Copying API keys from main app..."

# Check if main app .env.local exists
if [ ! -f "../organizational_realign_app/.env.local" ]; then
    echo "❌ Main app .env.local not found!"
    exit 1
fi

# Copy each secret if it exists in main app
copy_secret() {
    local key=$1
    local value=$(cd ../organizational_realign_app && grep "^$key=" .env.local 2>/dev/null | cut -d'=' -f2-)
    if [ ! -z "$value" ]; then
        # Escape special characters for sed
        escaped_value=$(echo "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')
        sed -i '' "s|^$key=.*|$key=$value|" .env.local
        echo "✅ Copied $key"
    else
        echo "⚠️  $key not found in main app"
    fi
}

# Copy all the required secrets
copy_secret "OPENAI_API_KEY"
copy_secret "STRIPE_SECRET_KEY"
copy_secret "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
copy_secret "STRIPE_WEBHOOK_SECRET"
copy_secret "NEXT_PUBLIC_SUPABASE_URL"
copy_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY"
copy_secret "SUPABASE_SERVICE_ROLE_KEY"
copy_secret "SENDGRID_API_KEY"
copy_secret "SENDGRID_FROM_EMAIL"
copy_secret "NEXT_PUBLIC_GA_MEASUREMENT_ID"

echo ""
echo "🎉 Environment setup complete!"
echo "🔍 Check .env.local to verify all keys are present"
