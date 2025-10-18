#!/usr/bin/env node

/**
 * Apply phone column migration to demo_leads table
 * Run: node apply-phone-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyMigration() {
    console.log('🚀 Applying phone column migration to demo_leads...\n');

    const migrationPath = path.join(__dirname, 'supabase/migrations/20251018_add_phone_to_demo_leads.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Migration SQL:');
    console.log(sql);
    console.log('\n📡 Executing migration...\n');

    try {
        // Execute the migration
        const { error } = await supabase.rpc('exec_sql', { query: sql });

        if (error) {
            // If RPC doesn't exist, try direct approach
            console.log('⚠️  RPC method not available, trying direct execution...\n');
            
            // Split into individual statements
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                console.log(`Executing: ${statement.substring(0, 100)}...`);
                
                // For ALTER TABLE, we'll use a different approach
                if (statement.includes('ALTER TABLE demo_leads')) {
                    // Check if column already exists
                    const { data: columns } = await supabase
                        .from('demo_leads')
                        .select('phone')
                        .limit(0);

                    if (columns !== null) {
                        console.log('✅ phone column already exists');
                        continue;
                    }
                }

                // Execute statement
                const { error: stmtError } = await supabase.rpc('exec_sql', {
                    query: statement + ';'
                });

                if (stmtError) {
                    console.error('❌ Error:', stmtError.message);
                } else {
                    console.log('✅ Success');
                }
            }
        } else {
            console.log('✅ Migration applied successfully!');
        }

        // Verify the column was added
        console.log('\n🔍 Verifying phone column...');
        const { data, error: selectError } = await supabase
            .from('demo_leads')
            .select('id, first_name, email, phone')
            .limit(1);

        if (selectError) {
            console.error('❌ Verification failed:', selectError.message);
        } else {
            console.log('✅ phone column verified and accessible!');
            if (data && data.length > 0) {
                console.log('Sample row:', data[0]);
            }
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }

    console.log('\n✅ Migration complete!');
}

applyMigration();
