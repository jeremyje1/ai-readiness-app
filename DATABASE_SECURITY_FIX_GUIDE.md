# Database Security Fix Guide

## 🚨 Critical Security Issues Identified

Your Supabase database has been flagged with several security vulnerabilities that need immediate attention:

### Issues Found:
1. **RLS Disabled on Public Tables** (4 tables)
2. **Security Definer Views** (7 views)

## 🔒 Security Risks

### Row Level Security (RLS) Issues:
- **enterprise_algorithm_changelog**: Exposes algorithm data without user context
- **institutions**: Institution data accessible to all users  
- **institution_memberships**: User membership data not protected
- **assessment_metrics**: Assessment data accessible across institutions

### Security Definer View Issues:
- Views run with creator's permissions instead of user's permissions
- Bypasses normal security controls
- Can expose data users shouldn't see

## 🛠️ Fix Options

### Option 1: Quick RLS Fix (Partial)
```bash
./scripts/quick-security-fix.sh
```
This enables RLS but doesn't add policies or fix views.

### Option 2: Manual SQL Fix (Recommended)
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `scripts/fix-database-security.sql`
4. Execute the script

### Option 3: Full Automated Fix
```bash
./scripts/apply-security-fixes.sh
```
Requires Supabase CLI and proper configuration.

## 📋 What the Fix Does

### 1. Enables RLS on Tables
```sql
ALTER TABLE public.enterprise_algorithm_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_metrics ENABLE ROW LEVEL SECURITY;
```

### 2. Creates Security Policies
- **Institution-based isolation**: Users only see data for their institutions
- **Role-based access**: Admins have broader permissions
- **User context enforcement**: Policies check `auth.uid()`

### 3. Fixes Security Definer Views
- Removes `SECURITY DEFINER` property
- Views now use querying user's permissions
- Maintains functionality while improving security

## 🔍 Verification Steps

After applying fixes:

1. **Check RLS Status**:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('enterprise_algorithm_changelog', 'institutions', 'institution_memberships', 'assessment_metrics');
   ```

2. **Verify Policies**:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. **Test Application**:
   - Login with different user accounts
   - Verify users only see appropriate data
   - Check admin functions still work

## ⚡ Quick Start

**Recommended approach for immediate fix:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project → SQL Editor
3. Copy the entire contents of `scripts/fix-database-security.sql`
4. Paste and execute
5. Test your application functionality

## 🚨 Important Notes

- **Backup First**: Consider backing up your database before applying changes
- **Test Thoroughly**: Verify all application features work after applying fixes
- **Monitor Logs**: Watch for any permission-denied errors after deployment
- **User Impact**: These changes may affect how users access data

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs for permission errors
2. Verify user roles and institution memberships are correct
3. Test with different user accounts to ensure proper isolation
4. Review the RLS policies to ensure they match your business logic

## 🎯 Expected Outcome

After applying these fixes:
- ✅ All security linter warnings resolved
- ✅ Data properly isolated by institution
- ✅ User permissions enforced at database level
- ✅ Views operate with user context
- ✅ Maintains existing application functionality
