// Fix RLS and insert sample data using service role
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

// Create admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSAndInsertData() {
    console.log('🔧 Fixing RLS Policies and Inserting Sample Data...\n');

    try {
        // First, check current schema by examining table structure
        console.log('📋 Step 1: Schema Validation...');

        // Get vendor_profiles table structure
        const { data: vendorColumns, error: vendorColError } = await supabaseAdmin.rpc('get_table_columns', {
            table_name: 'vendor_profiles'
        });

        if (vendorColError) {
            console.log('Using alternative method to check schema...');
        }

        // Test basic table access with service role
        const { data: testVendor, error: testError } = await supabaseAdmin
            .from('vendor_profiles')
            .select('*')
            .limit(1);

        if (testError) {
            console.error('❌ Service role access error:', testError.message);
            return;
        } else {
            console.log('✅ Service role can access vendor_profiles table');
        }

        // Insert vendor profiles with service role
        console.log('\n🏢 Step 2: Inserting Vendor Profiles...');
        const { data: vendorData, error: vendorError } = await supabaseAdmin
            .from('vendor_profiles')
            .upsert([
                {
                    vendor_name: 'OpenAI',
                    website_url: 'https://openai.com',
                    headquarters_location: 'San Francisco, CA',
                    business_model: 'B2B SaaS',
                    size_category: 'Enterprise',
                    industry_focus: ['AI/ML', 'Education Technology'],
                    established_year: 2015,
                    privacy_contact_email: 'privacy@openai.com',
                    review_status: 'approved',
                    risk_score: 35,
                    trust_level: 'verified'
                },
                {
                    vendor_name: 'Khan Academy',
                    website_url: 'https://khanacademy.org',
                    headquarters_location: 'Mountain View, CA',
                    business_model: 'Non-profit',
                    size_category: 'Enterprise',
                    industry_focus: ['Education', 'E-learning'],
                    established_year: 2008,
                    privacy_contact_email: 'privacy@khanacademy.org',
                    review_status: 'approved',
                    risk_score: 15,
                    trust_level: 'trusted'
                },
                {
                    vendor_name: 'Grammarly',
                    website_url: 'https://grammarly.com',
                    headquarters_location: 'San Francisco, CA',
                    business_model: 'Freemium SaaS',
                    size_category: 'Enterprise',
                    industry_focus: ['Writing Tools', 'Education Technology'],
                    established_year: 2009,
                    privacy_contact_email: 'privacy@grammarly.com',
                    review_status: 'approved',
                    risk_score: 25,
                    trust_level: 'verified'
                }
            ], {
                onConflict: 'vendor_name'
            })
            .select();

        if (vendorError) {
            console.error('❌ Error inserting vendors:', vendorError.message);
        } else {
            console.log('✅ Inserted vendors:', vendorData.length);
            vendorData.forEach(v => console.log(`   - ${v.vendor_name} (${v.review_status})`));
        }

        // Get vendor IDs for tools insertion
        const { data: vendors } = await supabaseAdmin
            .from('vendor_profiles')
            .select('id, vendor_name');

        const vendorLookup = {};
        vendors.forEach(v => vendorLookup[v.vendor_name] = v.id);

        // Insert vendor tools
        console.log('\n🛠️  Step 3: Inserting Vendor Tools...');
        const { data: toolsData, error: toolsError } = await supabaseAdmin
            .from('vendor_tools')
            .upsert([
                {
                    vendor_id: vendorLookup['OpenAI'],
                    tool_name: 'ChatGPT for Education',
                    tool_description: 'AI-powered writing and research assistant with educational safeguards',
                    tool_category: 'Content Creation',
                    target_audience: ['Teachers', 'Students'],
                    age_range_min: 13,
                    age_range_max: 18,
                    grade_levels: ['9-12'],
                    subject_areas: ['English', 'History', 'Science'],
                    pricing_model: 'Subscription',
                    status: 'approved',
                    approval_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    last_compliance_review: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    active_users_count: 156
                },
                {
                    vendor_id: vendorLookup['Khan Academy'],
                    tool_name: 'Khan Academy AI Tutor',
                    tool_description: 'Personalized tutoring and learning assistance',
                    tool_category: 'Tutoring & Support',
                    target_audience: ['Students', 'Teachers'],
                    age_range_min: 5,
                    age_range_max: 18,
                    grade_levels: ['K-12'],
                    subject_areas: ['Math', 'Science'],
                    pricing_model: 'Free',
                    status: 'approved',
                    approval_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                    last_compliance_review: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    active_users_count: 89
                },
                {
                    vendor_id: vendorLookup['Grammarly'],
                    tool_name: 'Grammarly Education',
                    tool_description: 'Writing enhancement and grammar checking tool',
                    tool_category: 'Content Creation',
                    target_audience: ['Teachers', 'Students'],
                    age_range_min: 11,
                    age_range_max: 18,
                    grade_levels: ['6-12'],
                    subject_areas: ['English', 'Writing'],
                    pricing_model: 'Subscription',
                    status: 'approved',
                    approval_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                    last_compliance_review: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    active_users_count: 234
                }
            ], {
                onConflict: 'vendor_id,tool_name'
            })
            .select();

        if (toolsError) {
            console.error('❌ Error inserting tools:', toolsError.message);
        } else {
            console.log('✅ Inserted tools:', toolsData.length);
            toolsData.forEach(t => console.log(`   - ${t.tool_name} (${t.active_users_count} users)`));
        }

        // Insert framework metadata (check actual schema first)
        console.log('\n📜 Step 4: Inserting Framework Metadata...');

        // First check what columns exist
        const { data: sampleFramework, error: frameworkCheckError } = await supabaseAdmin
            .from('framework_metadata')
            .select('*')
            .limit(1);

        console.log('Framework table structure check:', frameworkCheckError ? frameworkCheckError.message : 'accessible');

        const { data: frameworkData, error: frameworkError } = await supabaseAdmin
            .from('framework_metadata')
            .upsert([
                {
                    name: 'FERPA',
                    version: '2024.1',
                    type: 'law',
                    description: 'Family Educational Rights and Privacy Act',
                    effective_date: '1974-08-21',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        scope: 'student_privacy',
                        applies_to: ['K-12', 'Higher Education'],
                        authority: 'US Department of Education'
                    }
                },
                {
                    name: 'COPPA',
                    version: '2013.1',
                    type: 'law',
                    description: 'Children\'s Online Privacy Protection Act',
                    effective_date: '2000-04-21',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        scope: 'child_privacy',
                        age_limit: 13,
                        authority: 'Federal Trade Commission'
                    }
                },
                {
                    name: 'PPRA',
                    version: '2002.1',
                    type: 'law',
                    description: 'Protection of Pupil Rights Amendment',
                    effective_date: '1978-08-21',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        scope: 'student_surveys',
                        applies_to: ['K-12'],
                        authority: 'US Department of Education'
                    }
                },
                {
                    name: 'NIST AI RMF',
                    version: '1.0',
                    type: 'framework',
                    description: 'NIST Artificial Intelligence Risk Management Framework',
                    effective_date: '2023-01-26',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        scope: 'ai_governance',
                        applies_to: ['AI Systems'],
                        authority: 'National Institute of Standards and Technology'
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
            frameworkData.forEach(f => console.log(`   - ${f.name} v${f.version}`));
        }

        console.log('\n🎉 Sample data insertion completed successfully!');

        // Verify data was inserted
        console.log('\n🔍 Step 5: Verification...');
        const { data: finalVendors } = await supabaseAdmin.from('vendor_profiles').select('vendor_name').limit(10);
        const { data: finalTools } = await supabaseAdmin.from('vendor_tools').select('tool_name').limit(10);
        const { data: finalFrameworks } = await supabaseAdmin.from('framework_metadata').select('name').limit(10);

        console.log(`✅ Final count - Vendors: ${finalVendors.length}, Tools: ${finalTools.length}, Frameworks: ${finalFrameworks.length}`);

    } catch (error) {
        console.error('💥 Script failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

fixRLSAndInsertData();
