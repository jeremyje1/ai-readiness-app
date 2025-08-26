// Test database connection and sample data
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables manually
let envVars = {};
try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) {
    console.error('Could not read .env.local file');
}

const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDatabase() {
    console.log('🔍 Testing Database Connection...\n');

    try {
        // Test 1: Check vendor profiles
        console.log('📋 Test 1: Vendor Profiles');
        const { data: vendors, error: vendorError } = await supabase
            .from('vendor_profiles')
            .select('vendor_name, review_status, trust_level')
            .limit(5);

        if (vendorError) {
            console.error('❌ Vendor profiles error:', vendorError.message);
        } else {
            console.log('✅ Vendor profiles found:', vendors.length);
            vendors.forEach(v => console.log(`   - ${v.vendor_name} (${v.review_status}, ${v.trust_level})`));
        }

        // Test 2: Check vendor tools
        console.log('\n🛠️  Test 2: Vendor Tools');
        const { data: tools, error: toolsError } = await supabase
            .from('vendor_tools')
            .select('tool_name, status, active_users_count')
            .limit(5);

        if (toolsError) {
            console.error('❌ Vendor tools error:', toolsError.message);
        } else {
            console.log('✅ Vendor tools found:', tools.length);
            tools.forEach(t => console.log(`   - ${t.tool_name} (${t.status}, ${t.active_users_count} users)`));
        }

        // Test 3: List all tables to see what exists
        console.log('\n📊 Test 3: List Available Tables');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .like('table_name', '%assessment%');

        if (tablesError) {
            console.error('❌ Tables query error:', tablesError.message);
        } else {
            console.log('✅ Assessment-related tables:', tables.map(t => t.table_name));
        }

        // Test 4: Check framework metadata with correct columns
        console.log('\n📜 Test 4: Policy Framework System');
        const { data: frameworks, error: frameworkError } = await supabase
            .from('framework_metadata')
            .select('*')
            .limit(3);

        if (frameworkError) {
            console.error('❌ Framework metadata error:', frameworkError.message);
        } else {
            console.log('✅ Policy frameworks found:', frameworks.length);
            if (frameworks.length > 0) {
                console.log('Sample framework:', Object.keys(frameworks[0]));
            }
        }

        // Test 5: Check basic table existence
        console.log('\n�️  Test 5: Basic Table Check');
        const testTables = [
            'vendor_profiles',
            'vendor_tools',
            'framework_metadata',
            'approved_tools_catalog'
        ];

        for (const tableName of testTables) {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`❌ ${tableName}: ${error.message}`);
            } else {
                console.log(`✅ ${tableName}: exists (${data.length} sample records)`);
            }
        }

        console.log('\n🎉 Database testing completed!');

    } catch (error) {
        console.error('💥 Database test failed:', error.message);
    }
}

testDatabase();
