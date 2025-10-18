#!/bin/bash

set -euo pipefail

# Vercel Environment Variables Setup Script
# Usage:
#   ./setup-vercel-env.sh [path-to-env-file]
#
# All sensitive values are sourced from environment variables or an optional
# dotenv formatted file passed as the first argument. This ensures secrets are
# not hard-coded in the repository.

ENV_FILE=${1:-}

if [[ -n "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "❌ Env file '$ENV_FILE' not found. Aborting." >&2
    exit 1
  fi

  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

echo "Setting up Vercel environment variables..."

DOMAIN="aiblueprint.educationaiblueprint.com"

# Defaults for non-sensitive values
: "${NEXT_PUBLIC_SUPABASE_URL:=https://jocigzsthcpspxfdfxae.supabase.co}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA}"
: "${NEXT_PUBLIC_SITE_URL:=https://${DOMAIN}}"
: "${NEXT_PUBLIC_APP_URL:=https://${DOMAIN}}"
: "${NEXT_PUBLIC_BASE_URL:=https://${DOMAIN}}"
: "${NEXTAUTH_URL:=https://${DOMAIN}}"
: "${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:=pk_live_51Rxag5RMpSG47vNmE0GkLZ6xVBlXC2D8TS5FUSDI4VoKc5mJOzZu8JOKzmMMYMLtAONF7wJUfz6Wi4jKpbS2rBEi00tkzmeJgx}"
: "${STRIPE_PRICE_EDU_MONTHLY_199:=price_1SDnhlRMpSG47vNmDQr1WeJ3}"
: "${STRIPE_PRICE_EDU_YEARLY_1990:=price_1RxbGlRMpSG47vNmWEOu1otZ}"
: "${STRIPE_PRICE_TEAM_MONTHLY:=price_1RxbFkRMpSG47vNmLp4LCRHZ}"
: "${STRIPE_PRICE_TEAM_YEARLY:=price_1RxbGlRMpSG47vNmWEOu1otZ}"
: "${POSTMARK_FROM_EMAIL:=info@northpathstrategies.org}"
: "${POSTMARK_MESSAGE_STREAM:=aiblueprint-transactional}"
: "${POSTMARK_REPLY_TO:=info@northpathstrategies.org}"
: "${FROM_EMAIL:=info@northpathstrategies.org}"
: "${REPLY_TO_EMAIL:=info@northpathstrategies.org}"
: "${ADMIN_EMAIL:=info@northpathstrategies.org}"
: "${ADMIN_NOTIFICATION_EMAIL:=info@northpathstrategies.org}"
: "${RATE_LIMIT_REDIS_PREFIX:=aiblueprint}"

# Internal secrets (must be provided via environment, .env file, or secure prompt)
: "${ADMIN_GRANT_TOKEN:=}"
: "${CRON_SECRET:=}"
: "${NEXTAUTH_SECRET:=}"
: "${JWT_SECRET:=}"

prompt_for_secret() {
  local var_name="$1"
  local prompt_message="$2"

  if [[ -z "${!var_name:-}" ]]; then
    local value=""
    printf '%s: ' "$prompt_message"
    read -r -s value
    echo ""

    if [[ -z "$value" ]]; then
      echo "❌ $var_name is required." >&2
      exit 1
    fi

    export "$var_name"="$value"
  fi
}

prompt_for_secret "SUPABASE_SERVICE_ROLE_KEY" "Enter SUPABASE_SERVICE_ROLE_KEY (reset in Supabase dashboard)"
prompt_for_secret "STRIPE_SECRET_KEY" "Enter STRIPE_SECRET_KEY (new key from Stripe)"
prompt_for_secret "STRIPE_WEBHOOK_SECRET" "Enter STRIPE_WEBHOOK_SECRET (rolled webhook secret)"
prompt_for_secret "POSTMARK_SERVER_TOKEN" "Enter POSTMARK_SERVER_TOKEN (from Postmark server)"
prompt_for_secret "POSTMARK_API_TOKEN" "Enter POSTMARK_API_TOKEN (from Postmark API tab)"
prompt_for_secret "OPENAI_API_KEY" "Enter OPENAI_API_KEY (from OpenAI dashboard)"
prompt_for_secret "ADMIN_GRANT_TOKEN" "Enter ADMIN_GRANT_TOKEN (64 hex characters from secure vault)"
prompt_for_secret "CRON_SECRET" "Enter CRON_SECRET (64 hex characters from secure vault)"
prompt_for_secret "NEXTAUTH_SECRET" "Enter NEXTAUTH_SECRET (base64 token from secure vault)"
prompt_for_secret "JWT_SECRET" "Enter JWT_SECRET (base64 token from secure vault)"

# Allow POSTMARK_API_TOKEN to fall back to server token if desired
if [[ -z "$POSTMARK_API_TOKEN" ]]; then
  POSTMARK_API_TOKEN="$POSTMARK_SERVER_TOKEN"
fi

missing_vars=()

require_var() {
  local var_name="$1"
  if [[ -z "${!var_name:-}" ]]; then
    missing_vars+=("$var_name")
  fi
}

REQUIRED_VARS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_BASE_URL
  NEXTAUTH_URL
  NEXTAUTH_SECRET
  ADMIN_GRANT_TOKEN
  JWT_SECRET
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  STRIPE_PRICE_EDU_MONTHLY_199
  STRIPE_PRICE_EDU_YEARLY_1990
  STRIPE_PRICE_TEAM_MONTHLY
  STRIPE_PRICE_TEAM_YEARLY
  POSTMARK_SERVER_TOKEN
  POSTMARK_API_TOKEN
  POSTMARK_FROM_EMAIL
  POSTMARK_MESSAGE_STREAM
  POSTMARK_REPLY_TO
  FROM_EMAIL
  REPLY_TO_EMAIL
  ADMIN_EMAIL
  ADMIN_NOTIFICATION_EMAIL
  OPENAI_API_KEY
  CRON_SECRET
  RATE_LIMIT_REDIS_PREFIX
)

OPTIONAL_VARS=(
  UPSTASH_REDIS_REST_TOKEN
  UPSTASH_REDIS_REST_URL
)

for var_name in "${REQUIRED_VARS[@]}"; do
  require_var "$var_name"
done

if (( ${#missing_vars[@]} > 0 )); then
  echo "❌ The following variables are missing: ${missing_vars[*]}" >&2
  echo "Set them in your shell or env file before running this script." >&2
  exit 1
fi

set_vercel_var() {
  local var_name="$1"
  local environment="$2"
  local value="${!var_name}"

  echo "→ Setting $var_name ($environment)"
  vercel env rm "$var_name" "$environment" --yes 2>/dev/null || true
  vercel env add "$var_name" "$environment" <<< "$value"
}

TARGET_ENVS=(production)

for env_name in "${TARGET_ENVS[@]}"; do
  for var_name in "${REQUIRED_VARS[@]}"; do
    set_vercel_var "$var_name" "$env_name"
  done
  for var_name in "${OPTIONAL_VARS[@]}"; do
    if [[ -n "${!var_name:-}" ]]; then
      set_vercel_var "$var_name" "$env_name"
    else
      echo "→ Skipping $var_name ($env_name) - no value provided"
    fi
  done
done

echo "✅ All environment variables have been synchronized to Vercel ($TARGET_ENVS)."
echo ""
echo "Next steps:"
echo "1. Run 'vercel --prod' to trigger a new production deployment"
echo "2. Or push a new commit to trigger automatic deployment"
echo ""
echo "To verify variables were added, run: vercel env ls"