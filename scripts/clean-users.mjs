#!/usr/bin/env node
/**
 * Script to delete all users and related data from Supabase
 * This will clean up test users so you can start fresh
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Admin client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteAllUsers() {
  console.log('🧹 Starting user cleanup...\n');

  try {
    // Step 1: Delete from related tables first (due to foreign key constraints)
    console.log('1️⃣ Cleaning related tables...');

    // Delete password setup tokens
    const { error: tokenError } = await supabase
      .from('auth_password_setup_tokens')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (tokenError && tokenError.code !== 'PGRST116') {
      console.error('Error deleting password tokens:', tokenError.message);
    } else {
      console.log('   ✅ Deleted all password setup tokens');
    }

    // Delete user payments
    const { error: paymentError } = await supabase
      .from('user_payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (paymentError && paymentError.code !== 'PGRST116') {
      console.error('Error deleting user payments:', paymentError.message);
    } else {
      console.log('   ✅ Deleted all user payments');
    }

    // Delete user profiles
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error deleting user profiles:', profileError.message);
    } else {
      console.log('   ✅ Deleted all user profiles');
    }

    // Delete streamlined assessment responses
    const { error: assessmentError } = await supabase
      .from('streamlined_assessment_responses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (assessmentError && assessmentError.code !== 'PGRST116') {
      console.error('Error deleting assessment responses:', assessmentError.message);
    } else {
      console.log('   ✅ Deleted all assessment responses');
    }

    // Delete uploaded documents
    const { error: docError } = await supabase
      .from('uploaded_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (docError && docError.code !== 'PGRST116') {
      console.error('Error deleting uploaded documents:', docError.message);
    } else {
      console.log('   ✅ Deleted all uploaded documents');
    }

    // Delete gap analysis results
    const { error: gapError } = await supabase
      .from('gap_analysis_results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (gapError && gapError.code !== 'PGRST116') {
      console.error('Error deleting gap analysis:', gapError.message);
    } else {
      console.log('   ✅ Deleted all gap analysis results');
    }

    // Delete implementation roadmaps
    const { error: roadmapError } = await supabase
      .from('implementation_roadmaps')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (roadmapError && roadmapError.code !== 'PGRST116') {
      console.error('Error deleting roadmaps:', roadmapError.message);
    } else {
      console.log('   ✅ Deleted all implementation roadmaps');
    }

    // Delete user activity logs
    const { error: activityError } = await supabase
      .from('user_activity_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (activityError && activityError.code !== 'PGRST116') {
      console.error('Error deleting activity logs:', activityError.message);
    } else {
      console.log('   ✅ Deleted all activity logs');
    }

    // Step 2: List all auth users
    console.log('\n2️⃣ Finding all auth users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    console.log(`   Found ${users.length} users to delete`);

    // Step 3: Delete each user
    if (users.length > 0) {
      console.log('\n3️⃣ Deleting users...');

      for (const user of users) {
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

          if (deleteError) {
            console.error(`   ❌ Failed to delete ${user.email}:`, deleteError.message);
          } else {
            console.log(`   ✅ Deleted user: ${user.email || user.id}`);
          }
        } catch (err) {
          console.error(`   ❌ Error deleting user ${user.email}:`, err.message);
        }
      }
    }

    console.log('\n✨ Cleanup complete!');
    console.log('All users and related data have been removed from the database.');
    console.log('You can now start fresh with new test signups.\n');

  } catch (error) {
    console.error('Fatal error during cleanup:', error);
    process.exit(1);
  }
}

// Add confirmation prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  WARNING: This will delete ALL users and their data from the database!');
console.log('This includes:');
console.log('  - All user accounts');
console.log('  - Password setup tokens');
console.log('  - User payments');
console.log('  - User profiles');
console.log('  - Assessment responses');
console.log('  - Uploaded documents');
console.log('  - Gap analysis results');
console.log('  - Implementation roadmaps');
console.log('  - Activity logs\n');

rl.question('Are you sure you want to continue? Type "yes" to confirm: ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    deleteAllUsers().then(() => {
      rl.close();
      process.exit(0);
    });
  } else {
    console.log('\n❌ Cleanup cancelled');
    rl.close();
    process.exit(0);
  }
});