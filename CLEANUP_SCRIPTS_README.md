# 🧹 User Cleanup Scripts Guide

This guide provides scripts to manage test users and data for checkout flow testing.

## 📋 Available Scripts

### 1. `list-users.js` - Preview Current Data
**Usage:** `node list-users.js`

**Purpose:** 
- Shows all current users in the system
- Displays user creation dates and confirmation status
- Shows counts of related data (institutions, assessments, etc.)
- Perfect for checking current state before cleanup

**Example Output:**
```
📋 Current users in the system:

Found 7 users:

1. 📧 jeremy.estrella@gmail.com
   🆔 ID: abc123...
   📅 Created: 8/26/2025, 7:16:32 PM
   ✅ Email Confirmed: Yes

📊 Related data counts:
   👤 User profiles: 0
   🏢 Institutions: 1
   👥 Memberships: 1
   📝 Assessments: 10
```

### 2. `cleanup-test-users.js` - Safe Full Cleanup
**Usage:** `node cleanup-test-users.js`

**Purpose:**
- Comprehensive cleanup of ALL users and related data
- Includes safety confirmation prompt (type "yes" to proceed)
- Handles foreign key relationships properly
- Perfect for starting fresh with checkout testing

**What it cleans:**
- ✅ All authentication users
- ✅ Assessment results
- ✅ Institution memberships  
- ✅ Institution records
- ✅ Password setup tokens
- ✅ Algorithm results

### 3. `force-cleanup.js` - Handle Stubborn Data
**Usage:** `node force-cleanup.js`

**Purpose:**
- Handles users that can't be deleted due to database constraints
- Cleans up any remaining foreign key references
- Use when the main cleanup script can't delete all users

## 🚀 Recommended Workflow

### Starting Fresh for Checkout Testing:

1. **Check current state:**
   ```bash
   node list-users.js
   ```

2. **Clean everything:**
   ```bash
   node cleanup-test-users.js
   # Type "yes" when prompted
   ```

3. **If any users remain stuck:**
   ```bash
   node force-cleanup.js
   ```

4. **Verify cleanup:**
   ```bash
   node list-users.js
   # Should show "No users found - database is clean!"
   ```

## ⚠️ Important Notes

- **These scripts affect ALL users** - they're designed for test environments
- **Actions are irreversible** - make sure you want to delete everything
- **Stripe subscriptions** should be canceled separately in your Stripe dashboard
- **Scripts are safe** - they include confirmation prompts and proper error handling

## 🎯 Perfect For:

- ✅ Testing checkout flows from scratch
- ✅ Cleaning up after testing different registration scenarios  
- ✅ Resetting the system after creating multiple test accounts
- ✅ Ensuring clean state before important demos or testing sessions

## 🔧 How It Works:

The scripts use your `.env.local` Supabase credentials to:
1. Connect to your Supabase database with admin privileges
2. Clean related data tables first (to avoid foreign key conflicts)
3. Delete authentication users through Supabase Admin API
4. Provide detailed feedback on what was cleaned

Now you can test your checkout flow as many times as needed with a clean slate each time! 🎉
