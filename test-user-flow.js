#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const { randomBytes } = require('crypto');

// Initialize Supabase client
// Environment variables are required - no fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate test user email
const testEmail = `test_${randomBytes(4).toString('hex')}@example.com`;
const testPassword = 'TestPassword123!';

console.log('🧪 Starting automated test flow...');
console.log(`📧 Test email: ${testEmail}`);

async function runTest() {
    try {
        // Step 1: Sign up new user
        console.log('\n1️⃣ Testing user signup...');
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User',
                    preferred_name: 'Test'
                }
            }
        });

        if (signupError) {
            console.error('❌ Signup failed:', signupError.message);
            return;
        }
        console.log('✅ Signup successful:', signupData.user?.id);

        // Step 2: Create institution
        console.log('\n2️⃣ Creating institution...');
        const { data: institution, error: instError } = await supabase
            .from('institutions')
            .insert({
                name: 'Test University',
                slug: `test-uni-${randomBytes(4).toString('hex')}`,
                org_type: 'HigherEd',
                headcount: 250,
                budget: 5000000,
                owner_user_id: signupData.user.id
            })
            .select()
            .single();

        if (instError) {
            console.error('❌ Institution creation failed:', instError.message);
            return;
        }
        console.log('✅ Institution created:', institution.id);

        // Step 3: Create institution membership
        console.log('\n3️⃣ Creating institution membership...');
        const { error: membershipError } = await supabase
            .from('institution_memberships')
            .insert({
                institution_id: institution.id,
                user_id: signupData.user.id,
                role: 'owner',
                active: true
            });

        if (membershipError) {
            console.error('❌ Membership creation failed:', membershipError.message);
            return;
        }
        console.log('✅ Membership created');

        // Step 4: Check/Create profile
        console.log('\n4️⃣ Checking user profile...');
        const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signupData.user.id)
            .maybeSingle();

        if (checkError) {
            console.error('❌ Error checking profile:', checkError);
        }

        if (existingProfile) {
            console.log('✅ Profile already exists (created by trigger)');
        } else {
            console.log('Creating new profile...');
            const { data: newProfile, error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: signupData.user.id,
                    email: testEmail,
                    full_name: 'Test User',
                    preferred_name: 'Test',
                    position: 'Test Administrator'
                })
                .select()
                .single();

            if (profileError) {
                console.error('❌ Profile creation failed:', JSON.stringify(profileError, null, 2));
                // Continue anyway as profile might be created by trigger
            } else {
                console.log('✅ Profile created');
            }
        }

        // Step 5: Submit assessment
        console.log('\n5️⃣ Submitting assessment...');
        const assessmentData = {
            user_id: signupData.user.id,
            responses: {
                maturity: {
                    strategic_planning: 3,
                    leadership_support: 4,
                    data_infrastructure: 2,
                    technical_readiness: 3,
                    faculty_readiness: 2
                },
                priorities: {
                    student_success: 5,
                    operational_efficiency: 4,
                    teaching_innovation: 4,
                    research_advancement: 3,
                    cost_reduction: 3
                },
                concerns: {
                    data_privacy: 5,
                    academic_integrity: 4,
                    implementation_cost: 4,
                    change_resistance: 3,
                    technical_complexity: 3
                }
            },
            streamlined_responses: {
                maturity: 3,
                priorities: ['student_success', 'operational_efficiency'],
                concerns: ['data_privacy', 'academic_integrity']
            },
            status: 'completed',
            completed_at: new Date().toISOString()
        };

        const { data: assessment, error: assessmentError } = await supabase
            .from('streamlined_assessment_responses')
            .insert(assessmentData)
            .select()
            .single();

        if (assessmentError) {
            console.error('❌ Assessment submission failed:', assessmentError.message);
            return;
        }
        console.log('✅ Assessment submitted:', assessment.id);

        // Step 6: Create gap analysis
        console.log('\n6️⃣ Creating gap analysis...');
        const { error: gapError } = await supabase
            .from('gap_analysis_results')
            .insert({
                user_id: signupData.user.id,
                assessment_id: assessment.id,
                current_state: assessmentData.responses,
                desired_state: {
                    maturity: {
                        strategic_planning: 5,
                        leadership_support: 5,
                        data_infrastructure: 4,
                        technical_readiness: 4,
                        faculty_readiness: 4
                    }
                },
                gaps: {
                    strategic_planning: 2,
                    leadership_support: 1,
                    data_infrastructure: 2,
                    technical_readiness: 1,
                    faculty_readiness: 2
                },
                recommendations: [
                    'Develop comprehensive AI strategy',
                    'Invest in data infrastructure',
                    'Provide faculty training'
                ],
                created_at: new Date().toISOString()
            });

        if (gapError) {
            console.error('❌ Gap analysis creation failed:', gapError.message);
            return;
        }
        console.log('✅ Gap analysis created');

        // Step 7: Check if data is accessible
        console.log('\n7️⃣ Verifying data access...');

        // Check assessment
        const { data: checkAssessment, error: checkAssessmentError } = await supabase
            .from('streamlined_assessment_responses')
            .select('*')
            .eq('user_id', signupData.user.id)
            .maybeSingle();

        if (checkAssessmentError) {
            console.error('❌ Assessment check failed:', checkAssessmentError.message);
        } else {
            console.log('✅ Assessment accessible:', !!checkAssessment);
        }

        // Check gap analysis
        const { data: checkGap, error: checkGapError } = await supabase
            .from('gap_analysis_results')
            .select('*')
            .eq('user_id', signupData.user.id)
            .maybeSingle();

        if (checkGapError) {
            console.error('❌ Gap analysis check failed:', checkGapError.message);
        } else {
            console.log('✅ Gap analysis accessible:', !!checkGap);
        }

        // Check institution membership
        const { data: checkMembership, error: checkMembershipError } = await supabase
            .from('institution_memberships')
            .select(`
                role,
                institutions (
                    id,
                    name,
                    slug,
                    headcount,
                    budget,
                    org_type
                )
            `)
            .eq('user_id', signupData.user.id)
            .eq('active', true)
            .maybeSingle();

        if (checkMembershipError) {
            console.error('❌ Membership check failed:', checkMembershipError.message);
        } else {
            console.log('✅ Membership accessible:', !!checkMembership);
        }

        console.log('\n✨ Test completed successfully!');
        console.log('📝 Summary:');
        console.log(`- User ID: ${signupData.user.id}`);
        console.log(`- Email: ${testEmail}`);
        console.log(`- Institution: ${institution.name} (${institution.id})`);
        console.log(`- Assessment: ${assessment.id}`);

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
runTest();