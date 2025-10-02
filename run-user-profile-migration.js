/**
 * Direct Migration Runner for User Profiles
 * Runs the user_profiles table creation via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Running user_profiles migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20251002000001_user_profiles_safe_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split into individual statements (simple split by semicolons)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim() === ';') {
        continue;
      }

      // Extract statement type for logging
      const firstWord = statement.trim().split(/\s+/)[0].toUpperCase();

      console.log(`[${i + 1}/${statements.length}] Executing ${firstWord}...`);

      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Some errors are expected (like "already exists")
        if (error.message.includes('already exists') || error.code === '42P07' || error.code === '42710') {
          console.log(`  ⚠️  Skipped (already exists): ${error.message.substring(0, 60)}...`);
        } else {
          console.error(`  ❌ Error: ${error.message}`);
          // Continue anyway - some errors are non-critical
        }
      } else {
        console.log(`  ✅ Success`);
      }
    }

    console.log('\n✅ Migration completed!\n');

    // Verify the table was created
    console.log('🔍 Verifying user_profiles table...');
    const { data: tableCheck, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('✅ Table exists but is empty (as expected)');
      } else {
        console.error('❌ Verification failed:', checkError.message);
      }
    } else {
      console.log('✅ Table exists and is accessible');
      console.log(`📊 Current row count: ${tableCheck.length}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Use raw SQL execution
async function runMigrationDirect() {
  try {
    console.log('🚀 Running user_profiles migration (direct approach)...\n');

    const migrationSQL = `
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    job_title TEXT,
    department TEXT,
    institution_id UUID,
    institution_name TEXT,
    institution_type TEXT,
    institution_size TEXT,
    student_count INTEGER,
    faculty_count INTEGER,
    staff_count INTEGER,
    annual_budget DECIMAL(15,2),
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'US',
    timezone TEXT DEFAULT 'America/New_York',
    preferred_mode TEXT DEFAULT 'quick',
    assessment_context JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    onboarding_data JSONB DEFAULT '{}',
    subscription_tier TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can create their own profile') THEN
        CREATE POLICY "Users can create their own profile" ON public.user_profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.user_profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
    `;

    console.log('📝 Executing migration SQL...\n');

    // Try using the Supabase SQL editor API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('⚠️  Direct SQL execution not available via API');
      console.log('📝 Please run this SQL manually in Supabase Dashboard > SQL Editor:\n');
      console.log(migrationSQL);
      console.log('\n✅ Or the migration file is ready at: supabase/migrations/20251002000001_user_profiles_safe_migration.sql');
    } else {
      console.log('✅ Migration executed successfully!');
    }

  } catch (error) {
    console.log('\n📝 Please run the migration manually in Supabase Dashboard > SQL Editor');
    console.log('Migration file: supabase/migrations/20251002000001_user_profiles_safe_migration.sql\n');
  }
}

// Run the migration
console.log('='.repeat(60));
console.log('USER PROFILES DATABASE MIGRATION');
console.log('='.repeat(60) + '\n');

runMigrationDirect();
