#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserData(email) {
    try {
        console.log(`\n🔍 Checking data for: ${email}\n`);

        // Sign in as the user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: 'TestPassword123!' // Use the test password
        });

        if (authError) {
            console.error('❌ Login failed:', authError.message);
            return;
        }

        const userId = authData.user.id;
        console.log('✅ Logged in as:', userId);

        // Check streamlined_assessment_responses
        console.log('\n📊 Checking streamlined_assessment_responses...');
        const { data: assessments, error: assessError } = await supabase
            .from('streamlined_assessment_responses')
            .select('*')
            .eq('user_id', userId);

        if (assessError) {
            console.error('❌ Error:', assessError);
        } else if (assessments && assessments.length > 0) {
            console.log(`✅ Found ${assessments.length} assessment(s)`);
            assessments.forEach((a, i) => {
                console.log(`\nAssessment ${i + 1}:`);
                console.log('  ID:', a.id);
                console.log('  Completed:', a.completed_at);
                console.log('  Readiness Level:', a.readiness_level);
                console.log('  Scores:', JSON.stringify(a.scores, null, 2));
                console.log('  Responses count:', Object.keys(a.responses || {}).length);
            });
        } else {
            console.log('ℹ️ No assessments found');
        }

        // Check gap_analysis_results
        console.log('\n📈 Checking gap_analysis_results...');
        const { data: gapData, error: gapError } = await supabase
            .from('gap_analysis_results')
            .select('*')
            .eq('user_id', userId);

        if (gapError) {
            console.error('❌ Error:', gapError);
        } else if (gapData && gapData.length > 0) {
            console.log(`✅ Found ${gapData.length} gap analysis record(s)`);
            gapData.forEach((g, i) => {
                console.log(`\nGap Analysis ${i + 1}:`);
                console.log('  Overall Score:', g.overall_score);
                console.log('  Maturity Level:', g.maturity_level);
                console.log('  GOVERN:', g.govern_score);
                console.log('  MAP:', g.map_score);
                console.log('  MEASURE:', g.measure_score);
                console.log('  MANAGE:', g.manage_score);
            });
        } else {
            console.log('ℹ️ No gap analysis found');
        }

        // Check institutions
        console.log('\n🏢 Checking institution memberships...');
        const { data: memberships, error: memError } = await supabase
            .from('institution_memberships')
            .select('*, institutions(*)')
            .eq('user_id', userId);

        if (memError) {
            console.error('❌ Error:', memError);
        } else if (memberships && memberships.length > 0) {
            console.log(`✅ Found ${memberships.length} membership(s)`);
            memberships.forEach((m, i) => {
                console.log(`\nMembership ${i + 1}:`);
                console.log('  Institution:', m.institutions?.name);
                console.log('  Role:', m.role);
            });
        } else {
            console.log('ℹ️ No memberships found');
        }

        // Check uploaded documents
        console.log('\n📄 Checking uploaded documents...');
        const { data: docs, error: docError } = await supabase
            .from('uploaded_documents')
            .select('*')
            .eq('user_id', userId);

        if (docError) {
            console.error('❌ Error:', docError);
        } else if (docs && docs.length > 0) {
            console.log(`✅ Found ${docs.length} document(s)`);
            docs.forEach((d, i) => {
                console.log(`  ${i + 1}. ${d.file_name} (${d.file_type})`);
            });
        } else {
            console.log('ℹ️ No documents found');
        }

        console.log('\n✅ Data check complete!\n');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

// Get email from command line args
const email = process.argv[2];

if (!email) {
    console.log('Usage: node check-user-data.js <email>');
    console.log('Example: node check-user-data.js test@example.com');
    process.exit(1);
}

checkUserData(email);
