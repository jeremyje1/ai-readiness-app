#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testCredentials = {
    email: 'jeremy.estrella@gmail.com',
    password: 'Ipo4Eva45*'
};

async function auditPlatform() {
    console.log('🔍 Starting Platform Audit...\n');

    try {
        // 1. Test Login
        console.log('1. Testing Login...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword(testCredentials);

        if (authError) {
            console.error('❌ Login failed:', authError.message);
            return;
        }

        console.log('✅ Login successful');
        console.log('   User ID:', authData.user.id);
        console.log('   Email:', authData.user.email);

        // 2. Check User Profile
        console.log('\n2. Checking User Profile...');
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .single();

        if (profileError) {
            console.log('❌ No user profile found:', profileError.message);
        } else {
            console.log('✅ User profile found:', {
                name: profile.full_name,
                institution: profile.institution_id,
                role: profile.role
            });
        }

        // 3. Check Institutions
        console.log('\n3. Checking User Institutions...');
        const { data: memberships, error: membershipError } = await supabase
            .from('institution_memberships')
            .select(`
        *,
        institutions(*)
      `)
            .eq('user_id', authData.user.id);

        if (membershipError || !memberships?.length) {
            console.log('❌ No institution memberships found');
        } else {
            console.log('✅ Institution memberships found:');
            memberships.forEach(m => {
                console.log(`   - ${m.institutions?.name || 'Unknown'} (${m.role})`);
            });
        }

        // 4. Check AI Readiness Assessments
        console.log('\n4. Checking AI Readiness Assessments...');
        const { data: assessments, error: assessmentError } = await supabase
            .from('ai_readiness_assessments')
            .select('*')
            .eq('user_id', authData.user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (assessmentError || !assessments?.length) {
            console.log('❌ No assessments found');
        } else {
            console.log(`✅ Found ${assessments.length} assessments:`);
            assessments.forEach(a => {
                console.log(`   - ${a.institution_name} (${a.status}) - Created: ${new Date(a.created_at).toLocaleDateString()}`);
                if (a.overall_score) {
                    console.log(`     Score: ${a.overall_score}%`);
                }
            });
        }

        // 5. Check Assessment Results
        console.log('\n5. Checking Assessment Results...');
        if (assessments?.length) {
            const latestAssessment = assessments[0];
            const { data: results, error: resultsError } = await supabase
                .from('ai_readiness_results')
                .select('*')
                .eq('assessment_id', latestAssessment.id)
                .single();

            if (resultsError || !results) {
                console.log('❌ No results found for latest assessment');
            } else {
                console.log('✅ Results found for latest assessment:');
                console.log('   Overall Score:', results.overall_score);
                console.log('   Maturity Level:', results.maturity_level);
                if (results.domain_scores) {
                    console.log('   Domain Scores:', Object.keys(results.domain_scores).length, 'domains');
                }
            }
        }

        // 6. Check Payments/Subscriptions
        console.log('\n6. Checking Payment Status...');
        const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', authData.user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (paymentError || !payments?.length) {
            console.log('❌ No payment records found');
        } else {
            const payment = payments[0];
            console.log('✅ Payment found:');
            console.log(`   - Tier: ${payment.tier}`);
            console.log(`   - Status: ${payment.status}`);
            console.log(`   - Created: ${new Date(payment.created_at).toLocaleDateString()}`);
        }

        // 7. Check if using demo/mock data
        console.log('\n7. Checking for Demo/Mock Data Usage...');

        // Check if institution name has [TEST] prefix
        if (assessments?.length) {
            const hasTestPrefix = assessments.some(a => a.institution_name?.startsWith('[TEST]'));
            if (hasTestPrefix) {
                console.log('⚠️  Found assessments with [TEST] prefix - indicating test mode');
            }
        }

        // Check if using default/demo institution
        const demoInstitutions = ['Sample Institution', 'Demo School', 'Test University'];
        if (assessments?.length) {
            const hasDemoName = assessments.some(a =>
                demoInstitutions.includes(a.institution_name?.replace('[TEST] ', ''))
            );
            if (hasDemoName) {
                console.log('⚠️  Found assessments with demo institution names');
            }
        }

        console.log('\n📊 AUDIT SUMMARY:');
        console.log('=================');
        console.log('✓ Authentication: Working');
        console.log(`${profile ? '✓' : '✗'} User Profile: ${profile ? 'Exists' : 'Missing'}`);
        console.log(`${memberships?.length ? '✓' : '✗'} Institution Setup: ${memberships?.length ? 'Complete' : 'Incomplete'}`);
        console.log(`${assessments?.length ? '✓' : '✗'} Assessments: ${assessments?.length || 0} found`);
        console.log(`${payments?.length ? '✓' : '✗'} Payment Status: ${payments?.length ? 'Verified' : 'Not found'}`);

        if (!memberships?.length) {
            console.log('\n⚠️  ISSUE: User has no institution setup - this explains the "Creating..." bug');
            console.log('   The modal is likely failing to create the institution record.');
        }

    } catch (error) {
        console.error('❌ Audit failed:', error.message);
    } finally {
        await supabase.auth.signOut();
        console.log('\n✅ Signed out');
    }
}

// Run audit
auditPlatform().catch(console.error);