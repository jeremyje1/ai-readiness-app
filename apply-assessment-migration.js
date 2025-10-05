/**
 * Apply NIST assessment schema migration to production database
 * Run: node apply-assessment-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnv() {
    const envPath = '.env.local';
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local file not found');
        process.exit(1);
    }
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
}

loadEnv();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
    console.log('🚀 Applying NIST assessment schema migration...\n');

    // Read the migration file
    const migrationSQL = fs.readFileSync(
        './supabase/migrations/20250105_add_nist_assessment_columns.sql',
        'utf-8'
    );

    console.log('📄 Migration SQL:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('');

    // Split into individual statements (simple split on semicolon)
    const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                sql: statement
            });

            if (error) {
                // Try direct query if RPC doesn't work
                throw new Error(`RPC failed: ${error.message}`);
            }

            console.log('   ✅ Success');
            successCount++;
        } catch (rpcError) {
            // If RPC doesn't work, we'll need to run via psql or Supabase dashboard
            console.log(`   ⚠️  RPC method unavailable: ${rpcError.message}`);
            console.log('   ℹ️  Please run this migration in Supabase SQL Editor');
            errorCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (errorCount > 0) {
        console.log('\n⚠️  Some statements could not be executed via API.');
        console.log('📋 Please copy the migration SQL above and run it in:');
        console.log('   Supabase Dashboard → SQL Editor → New Query\n');
        console.log('Or run via Supabase CLI:');
        console.log('   supabase db push\n');
    } else {
        console.log('\n✅ All migrations applied successfully!');
        console.log('🎉 Assessment submission should now work!\n');
    }

    // Verify the changes
    console.log('\n🔍 Verifying schema changes...\n');

    // Check if new columns exist in streamlined_assessment_responses
    const { data: assessmentCols, error: assessmentError } = await supabase
        .from('streamlined_assessment_responses')
        .select('responses, scores, readiness_level, ai_roadmap')
        .limit(0);

    if (assessmentError) {
        console.log('❌ streamlined_assessment_responses verification failed');
        console.log(`   Error: ${assessmentError.message}`);
    } else {
        console.log('✅ streamlined_assessment_responses table updated');
    }

    // Check if new columns exist in gap_analysis_results
    const { data: gapCols, error: gapError } = await supabase
        .from('gap_analysis_results')
        .select('govern_strengths, govern_recommendations, priority_actions')
        .limit(0);

    if (gapError) {
        console.log('❌ gap_analysis_results verification failed');
        console.log(`   Error: ${gapError.message}`);
    } else {
        console.log('✅ gap_analysis_results table updated');
    }

    console.log('\n✅ Schema migration complete!\n');
}

applyMigration().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
