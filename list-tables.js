/**
 * List all tables in Supabase database
 * Run: node list-tables.js
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

async function listTables() {
    console.log('🔍 Querying database for all tables...\n');

    // Query the information schema to get all tables in the public schema
    const { data: tables, error } = await supabase
        .rpc('exec_sql', {
            query: `
                SELECT 
                    table_name,
                    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
                FROM information_schema.tables t
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            `
        });

    if (error) {
        console.error('❌ Error querying tables (trying direct query):', error.message);

        // Try a simpler approach - query each table directly
        const knownTables = [
            'user_profiles',
            'institutions',
            'institution_memberships',
            'streamlined_assessment_responses',
            'gap_analysis_results',
            'ai_blueprints',
            'assessment_documents',
            'document_analysis_results',
            'user_payments',
            'subscription_usage'
        ];

        console.log('\n📊 Checking known critical tables:\n');

        for (const tableName of knownTables) {
            try {
                const { data, error, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    console.log(`❌ ${tableName}: Does NOT exist or no access (${error.code})`);
                } else {
                    console.log(`✅ ${tableName}: EXISTS (${count || 0} rows)`);
                }
            } catch (e) {
                console.log(`❌ ${tableName}: Error checking - ${e.message}`);
            }
        }
        return;
    }

    console.log('✅ Found tables in public schema:\n');
    console.log('Table Name                              | Columns');
    console.log('----------------------------------------|--------');

    if (tables && tables.length > 0) {
        tables.forEach(t => {
            console.log(`${t.table_name.padEnd(40)}| ${t.column_count}`);
        });
        console.log(`\n📊 Total: ${tables.length} tables\n`);
    } else {
        console.log('⚠️ No tables found in public schema\n');
    }
}

// Check specific critical tables
async function checkCriticalTables() {
    console.log('\n🔍 Checking critical tables for the app:\n');

    const criticalTables = {
        'user_profiles': 'User profile data',
        'institutions': 'Organization/institution data',
        'institution_memberships': 'User-institution relationships',
        'streamlined_assessment_responses': 'Assessment answers and scores',
        'gap_analysis_results': 'AI readiness gap analysis',
        'ai_blueprints': 'Generated implementation blueprints',
        'assessment_documents': 'Uploaded documents for analysis',
        'document_analysis_results': 'AI document analysis results'
    };

    for (const [tableName, description] of Object.entries(criticalTables)) {
        try {
            const { count, error } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${tableName.padEnd(35)} - MISSING or NO ACCESS`);
                console.log(`   Purpose: ${description}`);
                console.log(`   Error: ${error.code} - ${error.message}\n`);
            } else {
                console.log(`✅ ${tableName.padEnd(35)} - EXISTS (${count || 0} rows)`);
            }
        } catch (e) {
            console.log(`❌ ${tableName.padEnd(35)} - ERROR: ${e.message}\n`);
        }
    }
}

// Check for the specific user
async function checkUserProfile(userId = '1dbe2f11-69cc-49dd-b340-75ac0e502dd5') {
    console.log(`\n🔍 Checking profile for user: ${userId}\n`);

    // Check in user_profiles
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (profileError) {
        console.log(`❌ Error checking user_profiles: ${profileError.message}`);
    } else if (profile) {
        console.log('✅ Profile found in user_profiles:');
        console.log(JSON.stringify(profile, null, 2));
    } else {
        console.log('❌ No profile found in user_profiles for this user');
    }

    // Check in institutions
    const { data: membership, error: membershipError } = await supabase
        .from('institution_memberships')
        .select('*, institutions(*)')
        .eq('user_id', userId)
        .maybeSingle();

    if (membershipError) {
        console.log(`\n❌ Error checking institution_memberships: ${membershipError.message}`);
    } else if (membership) {
        console.log('\n✅ Institution membership found:');
        console.log(JSON.stringify(membership, null, 2));
    } else {
        console.log('\n⚠️ No institution membership found for this user');
    }
}

async function main() {
    try {
        await listTables();
        await checkCriticalTables();
        await checkUserProfile();
    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

main();
