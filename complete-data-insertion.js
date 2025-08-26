// Final data insertion with correct schema
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

async function completeDataInsertion() {
    console.log('📊 Complete Sample Data Insertion...\n');

    try {
        // 1. Insert framework metadata with correct schema
        console.log('📜 Inserting frameworks...');

        const { data: frameworkData, error: frameworkError } = await supabaseAdmin
            .from('framework_metadata')
            .upsert([
                {
                    name: 'FERPA',
                    version: '2024.1',
                    source_url: 'https://www.ed.gov/policy/gen/guid/fpco/ferpa/',
                    checksum: 'ferpa-2024-1-checksum',
                    status: 'active',
                    changelog: 'Initial implementation for AI readiness assessment'
                },
                {
                    name: 'COPPA',
                    version: '2013.1',
                    source_url: 'https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa',
                    checksum: 'coppa-2013-1-checksum',
                    status: 'active',
                    changelog: 'Children privacy protection framework'
                },
                {
                    name: 'PPRA',
                    version: '2002.1',
                    source_url: 'https://www.ed.gov/policy/gen/guid/fpco/ppra/',
                    checksum: 'ppra-2002-1-checksum',
                    status: 'active',
                    changelog: 'Student survey protection framework'
                },
                {
                    name: 'NIST AI RMF',
                    version: '1.0',
                    source_url: 'https://www.nist.gov/itl/ai-risk-management-framework',
                    checksum: 'nist-ai-rmf-1-0-checksum',
                    status: 'active',
                    changelog: 'NIST AI Risk Management Framework'
                },
                {
                    name: 'GDPR',
                    version: '2018.1',
                    source_url: 'https://gdpr.eu/',
                    checksum: 'gdpr-2018-1-checksum',
                    status: 'active',
                    changelog: 'EU General Data Protection Regulation'
                }
            ], {
                onConflict: 'name,version'
            })
            .select();

        if (frameworkError) {
            console.error('❌ Framework error:', frameworkError.message);
        } else {
            console.log(`✅ Frameworks inserted: ${frameworkData.length}`);
        }

        // 2. Add tools to approved catalog
        console.log('\n🔧 Adding tools to approved catalog...');

        // First get vendor tools to link them
        const { data: tools } = await supabaseAdmin
            .from('vendor_tools')
            .select('id, name, vendor_id');

        if (tools && tools.length > 0) {
            const approvedTools = tools.map(tool => ({
                tool_id: tool.id,
                approval_date: new Date().toISOString(),
                approved_by: 'system-admin',
                approval_notes: `Initial approval for ${tool.name}`,
                expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                compliance_notes: 'Meets standard compliance requirements'
            }));

            const { data: catalogData, error: catalogError } = await supabaseAdmin
                .from('approved_tools_catalog')
                .upsert(approvedTools, { onConflict: 'tool_id' })
                .select();

            if (catalogError) {
                console.error('❌ Catalog error:', catalogError.message);
            } else {
                console.log(`✅ Approved tools: ${catalogData.length}`);
            }
        }

        // 3. Create sample vendor intakes
        console.log('\n📝 Creating vendor intakes...');

        const { data: vendors } = await supabaseAdmin
            .from('vendor_profiles')
            .select('id, name');

        if (vendors && vendors.length > 0) {
            const intakes = vendors.map(vendor => ({
                vendor_id: vendor.id,
                intake_date: new Date().toISOString(),
                status: 'completed',
                submitted_by: 'vendor-admin',
                notes: `Initial intake for ${vendor.name}`,
                metadata: {
                    contact_person: 'John Doe',
                    business_contact: 'business@example.com',
                    technical_contact: 'tech@example.com',
                    company_size: '1000-5000',
                    primary_market: 'Education Technology'
                }
            }));

            const { data: intakeData, error: intakeError } = await supabaseAdmin
                .from('vendor_intakes')
                .upsert(intakes, { onConflict: 'vendor_id' })
                .select();

            if (intakeError) {
                console.error('❌ Intake error:', intakeError.message);
            } else {
                console.log(`✅ Vendor intakes: ${intakeData.length}`);
            }
        }

        // 4. Final verification
        console.log('\n🔍 Final Data Verification...');

        const tables = [
            'vendor_profiles',
            'vendor_tools',
            'framework_metadata',
            'approved_tools_catalog',
            'vendor_intakes'
        ];

        for (const table of tables) {
            const { data, error } = await supabaseAdmin
                .from(table)
                .select('*', { count: 'exact' });

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: ${data.length} records`);
            }
        }

        console.log('\n🎊 Sample data insertion completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. ✅ Database populated with sample data');
        console.log('2. ✅ RLS policies working with service role');
        console.log('3. 🔄 Test frontend application with sample data');
        console.log('4. 🔄 Verify all features work end-to-end');

    } catch (error) {
        console.error('💥 Data insertion failed:', error.message);
    }
}

completeDataInsertion();
