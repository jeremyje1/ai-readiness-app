// Schema validation and correction script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
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

const supabaseAdmin = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function validateAndFixSchema() {
    console.log('📋 Schema Validation and Correction...\n');

    try {
        // Check framework_metadata table structure by trying different approaches
        console.log('🔍 Checking framework_metadata schema...');

        // Try to select with minimal columns first
        const { data: frameworkTest1, error: error1 } = await supabaseAdmin
            .from('framework_metadata')
            .select('name, version')
            .limit(1);

        if (error1) {
            console.error('❌ Basic columns error:', error1.message);
        } else {
            console.log('✅ Basic columns (name, version) work');
        }

        // Try common column combinations
        const testColumns = [
            ['name', 'version', 'type'],
            ['name', 'version', 'framework_type'],
            ['name', 'version', 'category'],
            ['*']
        ];

        for (const columns of testColumns) {
            const { data, error } = await supabaseAdmin
                .from('framework_metadata')
                .select(columns.join(','))
                .limit(1);

            if (!error && data) {
                console.log(`✅ Working columns: ${columns.join(', ')}`);
                if (data.length > 0) {
                    console.log('Sample record keys:', Object.keys(data[0]));
                }
                break;
            } else {
                console.log(`❌ Failed columns: ${columns.join(', ')}`);
            }
        }

        // Insert framework data with correct schema
        console.log('\n📜 Inserting frameworks with correct schema...');

        const { data: frameworkData, error: frameworkError } = await supabaseAdmin
            .from('framework_metadata')
            .upsert([
                {
                    name: 'FERPA',
                    version: '2024.1',
                    type: 'law',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        description: 'Family Educational Rights and Privacy Act',
                        scope: 'student_privacy',
                        applies_to: ['K-12', 'Higher Education'],
                        authority: 'US Department of Education',
                        effective_date: '1974-08-21'
                    }
                },
                {
                    name: 'COPPA',
                    version: '2013.1',
                    type: 'law',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        description: 'Children\'s Online Privacy Protection Act',
                        scope: 'child_privacy',
                        age_limit: 13,
                        authority: 'Federal Trade Commission',
                        effective_date: '2000-04-21'
                    }
                },
                {
                    name: 'PPRA',
                    version: '2002.1',
                    type: 'law',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        description: 'Protection of Pupil Rights Amendment',
                        scope: 'student_surveys',
                        applies_to: ['K-12'],
                        authority: 'US Department of Education',
                        effective_date: '1978-08-21'
                    }
                },
                {
                    name: 'NIST AI RMF',
                    version: '1.0',
                    type: 'framework',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        description: 'NIST Artificial Intelligence Risk Management Framework',
                        scope: 'ai_governance',
                        applies_to: ['AI Systems'],
                        authority: 'National Institute of Standards and Technology',
                        effective_date: '2023-01-26'
                    }
                },
                {
                    name: 'GDPR',
                    version: '2018.1',
                    type: 'law',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        description: 'General Data Protection Regulation',
                        scope: 'data_protection',
                        applies_to: ['EU Data Processing'],
                        authority: 'European Union',
                        effective_date: '2018-05-25'
                    }
                }
            ], {
                onConflict: 'name,version'
            })
            .select();

        if (frameworkError) {
            console.error('❌ Error inserting frameworks:', frameworkError.message);
        } else {
            console.log('✅ Inserted frameworks:', frameworkData.length);
            frameworkData.forEach(f => console.log(`   - ${f.name} v${f.version} (${f.type})`));
        }

        // Test all critical tables
        console.log('\n🗄️  Testing all critical tables...');
        const tables = [
            'vendor_profiles',
            'vendor_tools',
            'framework_metadata',
            'approved_tools_catalog',
            'vendor_intakes',
            'approval_requests'
        ];

        for (const table of tables) {
            const { data, error } = await supabaseAdmin
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: ${data.length} records available`);
            }
        }

        console.log('\n🎉 Schema validation completed!');

    } catch (error) {
        console.error('💥 Schema validation failed:', error.message);
    }
}

validateAndFixSchema();
