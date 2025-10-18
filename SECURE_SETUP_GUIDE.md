# 🔐 How to Set Up Vercel Environment Variables Securely

## ⚠️ CRITICAL: DO NOT commit credentials to git!

You mentioned you have:
- Supabase Access Token
- Database password

**These should NEVER appear in:**
- Git commits
- Source code files
- Documentation
- Shell scripts that get committed

## ✅ SECURE Method: Use the Interactive Script

I've created `setup-vercel-env-secure.sh` which will:
1. Prompt you to paste each value securely (hidden input)
2. Send values directly to Vercel API
3. NOT save values anywhere locally
4. NOT commit values to git (.gitignore blocks *.sh files)

### How to Use:

```bash
# 1. Run the secure setup script
./setup-vercel-env-secure.sh

# 2. When prompted, paste your values:
#    - Supabase URL (from your project dashboard)
#    - Supabase anon key (from your project dashboard)  
#    - Supabase service_role key (from your project dashboard)
#    - Your NEW SendGrid API key (rotated)
#    - Other configuration values

# 3. Script will upload to Vercel securely

# 4. Delete the script when done
rm setup-vercel-env-secure.sh
```

## 📋 What You Need to Get from Supabase

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

You'll need:
1. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
2. **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## 🚫 What NOT to Do

```bash
# ❌ NEVER do this:
export SUPABASE_SERVICE_ROLE_KEY="actual-key-here"
git add . && git commit -m "add env vars"

# ❌ NEVER do this:
echo "SUPABASE_SERVICE_ROLE_KEY=actual-key" >> .env.local
git add .env.local

# ❌ NEVER do this:
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "actual-key"
# (This would appear in shell history)
```

## ✅ What TO Do

```bash
# ✅ Use the interactive script (safest)
./setup-vercel-env-secure.sh

# ✅ Or use Vercel dashboard manually
# Go to: https://vercel.com/jeremyje1/ai-readiness-app/settings/environment-variables
# Click "Add New" and paste values in the web UI

# ✅ Or use Vercel CLI interactively
vercel env add SUPABASE_SERVICE_ROLE_KEY
# (Vercel will prompt for the value - paste it when prompted)
```

## 🔒 Security Best Practices

### For .env.local (Local Development)
```bash
# Your .env.local should have real values for local testing
# BUT it's in .gitignore so it won't be committed

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SENDGRID_API_KEY=SG_xxxxx...
```

**Important:** 
- `.env.local` is already in .gitignore ✅
- It's safe to have real values there for local development ✅
- Just NEVER commit it to git ✅

### For Vercel (Production)
- Use the script I created, OR
- Use Vercel dashboard web UI, OR
- Use `vercel env add` with interactive prompts

### For Documentation
- Always use placeholders: `SG_xxxx...`, `eyJhbGci...`
- Never show full keys, even in examples
- Explain WHERE to get the keys, not what they are

## 📝 Current Status

✅ `.env.local` is in .gitignore (won't be committed)
✅ `*.sh` files are in .gitignore (scripts won't be committed)
✅ Security audit completed
✅ All hardcoded keys removed from source code

⚠️ Vercel environment variables still need to be set

## 🚀 Next Steps

1. Run `./setup-vercel-env-secure.sh`
2. Paste your values when prompted (input will be hidden)
3. Script will configure Vercel for you
4. Vercel will auto-deploy your demo
5. Test at: https://aiblueprint.educationaiblueprint.com/demo

## ❓ Questions?

**Q: Is the Supabase anon key really secret?**
A: The anon key is designed for client-side use, but still shouldn't be hardcoded. Use environment variables and Row Level Security (RLS) policies for protection.

**Q: Can I use the database password directly in the app?**
A: No! Use Supabase connection strings with pooling. The Supabase client SDK handles authentication for you.

**Q: What about the Supabase Access Token you mentioned?**
A: That's for Supabase CLI/API access, not for your app. Don't put it in environment variables. Keep it in a password manager.

**Q: Is it safe to run `setup-vercel-env-secure.sh`?**
A: Yes! It uses `read -s` (silent input) and sends directly to Vercel API. Nothing is saved locally or logged.

## 📚 Reference

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [12 Factor App - Config](https://12factor.net/config)
