# 🗄️ Database Migration Application Guide

## Quick Start: Apply Migrations via Supabase Dashboard

Since you have the migrations ready, here's the fastest way to apply them:

### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: `jocigzsthcpspxfdfxae`
- Navigate to **SQL Editor**

### 2. Apply Migrations in Order

Copy and paste each migration SQL into the SQL Editor and run them **in this exact order**:

#### ✅ Migration 1: `020_assessment_2_enhanced.sql` (Currently Open)
```sql
-- Copy the entire contents of database-migrations/020_assessment_2_enhanced.sql
-- This includes the core documents, assessments, artifacts, and scoring tables
```

#### ✅ Migration 2: `025_approval_system.sql`
```bash
# Location: database-migrations/025_approval_system.sql
# Adds: approval_workflows, approval_stages, approval_history tables
```

#### ✅ Migration 3: `026_policy_updates_system.sql`
```bash
# Location: database-migrations/026_policy_updates_system.sql  
# Adds: policy_notifications, framework_updates tables
```

#### ✅ Migration 4: `026_vendor_intake_system.sql`
```bash
# Location: database-migrations/026_vendor_intake_system.sql
# Adds: vendor_intakes, vendor_documents tables
```

#### ✅ Migration 5: `20240820_vendor_vetting_system.sql`
```bash
# Location: database-migrations/20240820_vendor_vetting_system.sql
# Adds: vendor_risk_assessments, vendor_evaluations tables
```

### 3. Verification Steps

After each migration:
1. ✅ Check that SQL executed without errors
2. ✅ Verify new tables appear in **Table Editor**
3. ✅ Confirm Row Level Security (RLS) policies are active

### 4. Post-Migration Checklist

```bash
# Test the application
npm run dev

# Run type checking
npm run typecheck

# Run tests
npm run test

# Check Cypress E2E tests
npm run cypress:run
```

## 🚨 Important Notes

- **Apply migrations in order** - they have dependencies
- **Don't skip migrations** - each builds on the previous
- **Check for errors** after each migration
- **Backup recommended** before applying (though Supabase has automatic backups)

## 🔍 Current Status

```
✅ Applied:     8 migrations (001-010)
⚠️  Pending:    5 migrations (020, 025, 026, 026, 20240820)
🎯 Next:       020_assessment_2_enhanced.sql (currently open in editor)
```

## 💡 Quick Apply Commands

If you have `psql` installed and your database password:

```bash
# Set database URL
export DB_URL="postgresql://postgres:[PASSWORD]@db.jocigzsthcpspxfdfxae.supabase.co:5432/postgres"

# Apply all pending migrations
psql "$DB_URL" -f database-migrations/020_assessment_2_enhanced.sql
psql "$DB_URL" -f database-migrations/025_approval_system.sql
psql "$DB_URL" -f database-migrations/026_policy_updates_system.sql
psql "$DB_URL" -f database-migrations/026_vendor_intake_system.sql
psql "$DB_URL" -f database-migrations/20240820_vendor_vetting_system.sql
```

---

**Ready to start?** Copy the contents of `020_assessment_2_enhanced.sql` (currently open in your editor) to your Supabase SQL Editor!
