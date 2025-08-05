#!/bin/bash

# Generate secure random secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Update the .env.local file with generated secrets
sed -i '' "s/NEXTAUTH_SECRET=\"your-nextauth-secret-key-here\"/NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"/" .env.local
sed -i '' "s/JWT_SECRET=\"your-jwt-secret-here\"/JWT_SECRET=\"$JWT_SECRET\"/" .env.local

# Copy the NEXTAUTH_SECRET from main app if it exists
MAIN_NEXTAUTH=$(cd ../organizational_realign_app && grep "NEXTAUTH_SECRET=" .env.local 2>/dev/null | cut -d'"' -f2)
if [ ! -z "$MAIN_NEXTAUTH" ]; then
    sed -i '' "s/NEXTAUTH_SECRET=\".*\"/NEXTAUTH_SECRET=\"$MAIN_NEXTAUTH\"/" .env.local
    echo "✅ Copied NEXTAUTH_SECRET from main app"
else
    echo "✅ Generated new NEXTAUTH_SECRET"
fi

echo "✅ Generated new JWT_SECRET"
echo "⚠️  You still need to add:"
echo "   - OPENAI_API_KEY"
echo "   - STRIPE keys"
echo "   - SUPABASE credentials" 
echo "   - SENDGRID_API_KEY"
echo "   - NEXT_PUBLIC_GA_MEASUREMENT_ID (if you have one)"
