#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzcxOTA1NSwiZXhwIjoyMDM5Mjk1MDU1fQ.cKaZTzs3fLqz9dthQwO-S9w-fJDaJ0Wqhu8KMgxlS_E';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Read migration files
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrations = [
      '20251002100318_platform_redesign_schema.sql',
      '20251002110000_create_documents_storage.sql'
    ];

    for (const migrationFile of migrations) {
      const filePath = path.join(migrationsDir, migrationFile);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Migration file not found: ${migrationFile}`);
        continue;
      }

      console.log(`📝 Running migration: ${migrationFile}`);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute the SQL
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        console.error(`❌ Error in ${migrationFile}:`, error.message);
        // Continue with next migration
      } else {
        console.log(`✅ Completed: ${migrationFile}\n`);
      }
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...');

    const tables = [
      'uploaded_documents',
      'streamlined_assessment_responses',
      'gap_analysis_results',
      'implementation_roadmaps',
      'user_activity_log'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ Table ${table}: NOT FOUND - ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: EXISTS (${count || 0} rows)`);
      }
    }

    // Check storage bucket
    console.log('\n🗄️  Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.log('❌ Could not list buckets:', bucketError.message);
    } else {
      const documentsBucket = buckets.find(b => b.id === 'documents');
      if (documentsBucket) {
        console.log('✅ Storage bucket "documents" exists');
      } else {
        console.log('⚠️  Storage bucket "documents" not found - will be created on first upload');
      }
    }

    console.log('\n✨ Migration process completed!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
