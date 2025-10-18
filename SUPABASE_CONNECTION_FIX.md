# Supabase Database Connection Fix Guide

## Problem
Your SUPABASE_DB_URL is configured in GitHub Secrets but the workflow is still failing. This is likely due to:
1. Incorrect password
2. Using wrong port (6543 instead of 5432)
3. Special characters in password not URL-encoded
4. Missing part of the connection string

## Your Supabase Project

**Project Reference:** `jocigzsthcpspxfdfxae`  
**Dashboard URL:** https://app.supabase.com/project/jocigzsthcpspxfdfxae/settings/database

---

## Step 1: Get Your Database Password

1. Go to: https://app.supabase.com/project/jocigzsthcpspxfdfxae/settings/database
2. Scroll to **"Database password"** section
3. Options:
   - If you know your password → Write it down
   - If you don't know it → Click **"Reset database password"**
     - ⚠️ This will break existing connections temporarily
     - ✅ Copy the new password immediately!

---

## Step 2: Build Your Connection String

### Get Connection Info from Supabase

1. In Supabase Dashboard → Settings → Database
2. Find **"Connection String"** section
3. Click **"URI"** tab
4. Under **"Method"**, select **"Direct connection"** (NOT Transaction pooler)
5. You'll see:

```
postgresql://postgres:[YOUR_PASSWORD]@db.jocigzsthcpspxfdfxae.supabase.co:5432/postgres
```

This is your template! Just replace `[YOUR_PASSWORD]` with your actual password.

### CRITICAL: Use Direct Connection (not Pooler)

From Supabase Dashboard → Settings → Database → Connection String:
1. Select **"URI"** tab
2. Under **"Method"**, select **"Direct connection"**
3. You'll see:

```
postgresql://postgres:[YOUR_PASSWORD]@db.jocigzsthcpspxfdfxae.supabase.co:5432/postgres
```

**This is the CORRECT format for seeding!**

**WRONG** (Transaction pooler - has "pooler" in hostname):
```
postgresql://postgres.jocigzsthcpspxfdfxae:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**CORRECT** (Direct connection):
```
postgresql://postgres:[YOUR_PASSWORD]@db.jocigzsthcpspxfdfxae.supabase.co:5432/postgres
```

Key differences:
- ✅ Host: `db.jocigzsthcpspxfdfxae.supabase.co` (direct)
- ❌ Host: `aws-0-us-east-1.pooler.supabase.com` (pooler)
- ✅ Port: `5432`
- ❌ Port: `6543`

---

## Step 3: Handle Special Characters in Password

If your password contains special characters, they **MUST** be URL-encoded:

| Character | Encoded | Example |
|-----------|---------|---------|
| `@` | `%40` | `pass@word` → `pass%40word` |
| `#` | `%23` | `pass#word` → `pass%23word` |
| `&` | `%26` | `pass&word` → `pass%26word` |
| `!` | `%21` | `pass!word` → `pass%21word` |
| `$` | `%24` | `pass$word` → `pass%24word` |
| `%` | `%25` | `pass%word` → `pass%25word` |
| `^` | `%5E` | `pass^word` → `pass%5Eword` |
| `*` | `%2A` | `pass*word` → `pass%2Aword` |
| ` ` (space) | `%20` | `pass word` → `pass%20word` |

### Example

If your password is: `ExampleP@ss123!`

Your connection string should be:
```
postgresql://postgres:ExampleP%40ss123%21@db.your-project-ref.supabase.co:5432/postgres
```

**Note:** Replace `your-project-ref` with your actual Supabase project reference.

---

## Step 4: Test Connection Locally (Optional but Recommended)

### Add to .env.local

```bash
SUPABASE_DB_URL="postgresql://postgres:[YOUR-ENCODED-PASSWORD]@db.jocigzsthcpspxfdfxae.supabase.co:5432/postgres"
```

### Test it

```bash
node test-supabase-connection.js
```

If it says **"✅ Connection successful!"**, your connection string is correct!

---

## Step 5: Update GitHub Secret

1. **Go to:** https://github.com/jeremyje1/ai-readiness-app/settings/secrets/actions

2. **Find** `SUPABASE_DB_URL` in the list

3. **Click** the pencil icon (✏️) to edit

4. **Paste** your FULL connection string with:
   - ✅ Port 5432 (not 6543)
   - ✅ Password URL-encoded if it has special characters
   - ✅ Format: `postgresql://postgres.jocigzsthcpspxfdfxae:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

5. **Click** "Update secret"

---

## Step 6: Trigger Workflow to Test

After updating the secret:

1. Make any small change (or use the workflow test script)
2. Push to main branch
3. Check: https://github.com/jeremyje1/ai-readiness-app/actions

The "Seed Production Policy Templates" workflow should now pass! ✅

---

## Quick Checklist

- [ ] Got database password from Supabase dashboard
- [ ] Built connection string with port **5432** (not 6543)
- [ ] URL-encoded special characters in password
- [ ] Removed `?pgbouncer=true` from end
- [ ] Tested connection locally (optional)
- [ ] Updated SUPABASE_DB_URL in GitHub Secrets
- [ ] Triggered workflow to verify it works

---

## Connection String Template

Use this template (replace the bracketed parts):

```
postgresql://postgres:[URL-ENCODED-PASSWORD]@db.jocigzsthcpspxfdfxae.supabase.co:5432/postgres
```

**Key points:**
- `postgres` = database user
- `[URL-ENCODED-PASSWORD]` = your password with special chars encoded
- `db.jocigzsthcpspxfdfxae.supabase.co` = your direct connection host
- `:5432` = Direct connection port
- `/postgres` = database name

---

## Still Having Issues?

### Error: "password authentication failed"
→ Password is incorrect. Reset in Supabase dashboard.

### Error: "ETIMEDOUT" or "ECONNREFUSED"
→ Using wrong port. Make sure it's **5432** not 6543.

### Error: "no pg_hba.conf entry"
→ SSL issue. Make sure connection string doesn't have extra parameters.

### Workflow still fails
→ Double-check the secret is saved correctly in GitHub:
   - Go to Settings → Secrets → Actions
   - Verify SUPABASE_DB_URL exists
   - Re-enter it if needed

---

## Need Help?

1. Check workflow logs: https://github.com/jeremyje1/ai-readiness-app/actions
2. Look for the specific error message
3. Compare with troubleshooting section above

**Support:** info@northpathstrategies.org

---

**Last Updated:** October 18, 2025
