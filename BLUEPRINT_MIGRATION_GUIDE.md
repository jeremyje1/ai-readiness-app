# Blueprint Database Migration - Manual Setup Guide

## Issue
The `supabase db push` command is failing due to migration history conflicts with already-applied migrations.

## Solution
Apply the blueprint migration manually through the Supabase Dashboard.

## Steps

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/sql/new

### 2. Copy the SQL
Open the file: `apply_blueprint_migration.sql` in this directory

### 3. Execute
- Copy all contents of `apply_blueprint_migration.sql`
- Paste into the SQL Editor
- Click "Run" button
- Wait for completion message: "Blueprint tables created successfully!"

### 4. Verify Tables Created
Run this query in the SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'blueprint%'
ORDER BY table_name;
```

You should see:
- blueprint_comments
- blueprint_goals
- blueprint_phases  
- blueprint_progress
- blueprint_tasks
- blueprint_templates
- blueprints
- recommendations_catalog

### 5. Clean Up Migration Directory (Optional)
After successful application, you can organize your migrations:

```bash
# The SQL has been applied, so you can keep the migration file for reference
# Or move the applied_backup files back if needed
```

## What Was Created

### 11 New Tables:
1. **organizations** - Institution/organization records
2. **blueprint_goals** - User-defined implementation goals
3. **blueprints** - Master blueprint records
4. **blueprint_phases** - Implementation phases
5. **blueprint_tasks** - Granular tasks
6. **blueprint_templates** - Reusable templates
7. **recommendations_catalog** - Best practice recommendations
8. **blueprint_progress** - Progress tracking
9. **blueprint_comments** - Collaboration comments

### Security:
- Row Level Security (RLS) enabled on all tables
- Policies ensure users can only access their own blueprints
- Public blueprints accessible to all
- Shared blueprints accessible to specified users

### Performance:
- Indexes on frequently queried columns
- Optimized for user_id, assessment_id, status lookups

## Next Steps After Migration

1. ✅ Database tables created
2. ⏳ Test API endpoints
3. ⏳ Build UI components
4. ⏳ Integrate with assessment flow

## Troubleshooting

If you see errors about existing policies:
- The SQL uses `DROP POLICY IF EXISTS` before `CREATE POLICY`
- This makes it safe to run multiple times

If you see foreign key errors:
- Ensure `streamlined_assessment_responses` table exists
- Check that `auth.users` is accessible

## Alternative: psql Command Line (Advanced)

If you prefer command line and have the database password:

```bash
PGPASSWORD='your_password' psql "postgresql://postgres.jocigzsthcpspxfdfxae:your_password@aws-0-us-west-1.pooler.supabase.com:6543/postgres" < apply_blueprint_migration.sql
```

Replace `your_password` with your actual database password.
