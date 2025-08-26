// Test inserting sample data
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

async function insertSampleData() {
    console.log('📝 Inserting Sample Data...\n');

    try {
        // Insert sample vendor profiles
        console.log('🏢 Inserting Vendor Profiles...');
        const { data: vendorData, error: vendorError } = await supabase
            .from('vendor_profiles')
            .insert([
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
            ])
            .select();

        if (vendorError) {
            console.error('❌ Error inserting vendors:', vendorError.message);
        } else {
            console.log('✅ Inserted vendors:', vendorData.length);
        }

        // Insert framework metadata
        console.log('\n📜 Inserting Framework Metadata...');
        const { data: frameworkData, error: frameworkError } = await supabase
            .from('framework_metadata')
            .insert([
                {
                    name: 'FERPA',
                    version: '2024.1',
                    type: 'law',
                    description: 'Family Educational Rights and Privacy Act',
                    authority: 'US Department of Education',
                    effective_date: '1974-08-21',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        scope: 'student_privacy',
                        applies_to: ['K-12', 'Higher Education']
                    }
                },
                {
                    name: 'COPPA',
                    version: '2013.1',
                    type: 'law',
                    description: 'Children\'s Online Privacy Protection Act',
                    authority: 'Federal Trade Commission',
                    effective_date: '2000-04-21',
                    last_updated: new Date().toISOString(),
                    metadata: {
                        scope: 'child_privacy',
                        age_limit: 13
                    }
                }
            ])
            .select();

        if (frameworkError) {
            console.error('❌ Error inserting frameworks:', frameworkError.message);
        } else {
            console.log('✅ Inserted frameworks:', frameworkData.length);
        }

        console.log('\n🎉 Sample data insertion completed!');

    } catch (error) {
        console.error('💥 Sample data insertion failed:', error.message);
    }
}

insertSampleData();
