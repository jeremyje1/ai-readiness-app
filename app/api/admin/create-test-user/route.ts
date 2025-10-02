import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Simple auth check
  const authHeader = req.headers.get('x-admin-key');
  if (authHeader !== 'test-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
  }

  try {
    const testEmail = 'test@aiblueprint.com';
    const testPassword = 'TestUser123!';

    // Step 1: Create the user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        organization: 'Test Organization',
        payment_verified: true,
        tier: 'platform-monthly',
        created_via: 'admin_test'
      }
    });

    if (userError) {
      // Check if user already exists
      if (userError.message.includes('already registered')) {
        // Get existing user
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === testEmail);

        if (existingUser) {
          // Update password for existing user
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: testPassword }
          );

          if (updateError) {
            return NextResponse.json({
              error: 'Failed to update existing user password',
              details: updateError.message
            }, { status: 500 });
          }

          return NextResponse.json({
            success: true,
            message: 'Test user already exists - password updated',
            credentials: {
              email: testEmail,
              password: testPassword,
              userId: existingUser.id
            }
          });
        }
      }

      return NextResponse.json({
        error: 'Failed to create user',
        details: userError.message
      }, { status: 500 });
    }

    const userId = userData.user.id;

    // Step 2: Create user profile
    await supabaseAdmin.from('user_profiles').upsert({
      user_id: userId,
      email: testEmail,
      full_name: 'Test User',
      organization: 'Test Organization',
      role: 'Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Step 3: Create payment record
    await supabaseAdmin.from('user_payments').upsert({
      user_id: userId,
      email: testEmail,
      name: 'Test User',
      organization: 'Test Organization',
      tier: 'platform-monthly',
      stripe_customer_id: 'cus_test_' + Math.random().toString(36).substring(7),
      stripe_session_id: 'cs_test_' + Math.random().toString(36).substring(7),
      payment_amount: 199,
      payment_status: 'completed',
      access_granted: true,
      created_at: new Date().toISOString()
    });

    // Step 4: Create sample assessment
    await supabaseAdmin.from('streamlined_assessment_responses').insert({
      user_id: userId,
      institution_type: 'university',
      institution_size: 'large',
      institution_state: 'California',
      ai_journey_stage: 'piloting',
      biggest_challenge: 'Faculty adoption and training',
      top_priorities: ['faculty_development', 'student_safety', 'academic_integrity'],
      implementation_timeline: 'immediate',
      contact_name: 'Test User',
      contact_email: testEmail,
      contact_role: 'CIO',
      completed_at: new Date().toISOString()
    });

    // Step 5: Create sample gap analysis
    await supabaseAdmin.from('gap_analysis_results').insert({
      user_id: userId,
      overall_score: 65.5,
      maturity_level: 'Developing',
      govern_score: 60.0,
      govern_gaps: ['Lack of formal AI governance structure', 'No clear AI ethics guidelines'],
      govern_strengths: ['Executive support for AI initiatives', 'Budget allocated for AI projects'],
      govern_recommendations: ['Establish AI governance committee', 'Develop AI ethics framework'],
      map_score: 70.0,
      map_gaps: ['Incomplete AI risk assessment', 'Limited stakeholder mapping'],
      map_strengths: ['Strong IT infrastructure', 'Existing data governance'],
      map_recommendations: ['Complete comprehensive AI risk assessment', 'Map all AI stakeholders'],
      measure_score: 65.0,
      measure_gaps: ['No AI performance metrics', 'Limited monitoring capabilities'],
      measure_strengths: ['Regular security assessments', 'Established reporting procedures'],
      measure_recommendations: ['Define AI KPIs', 'Implement AI monitoring tools'],
      manage_score: 67.0,
      manage_gaps: ['Reactive incident response', 'Limited AI training programs'],
      manage_strengths: ['Strong project management', 'Good vendor relationships'],
      manage_recommendations: ['Develop proactive AI management plan', 'Create AI training curriculum'],
      priority_actions: ['Establish AI governance committee', 'Complete AI risk assessment', 'Define AI KPIs'],
      quick_wins: ['Document current AI tools in use', 'Survey faculty on AI needs', 'Create AI working group']
    });

    // Step 6: Create sample roadmaps
    const roadmaps = [
      {
        user_id: userId,
        roadmap_type: '30_day',
        goals: ['Establish AI governance', 'Complete initial assessment', 'Form AI committee'],
        action_items: ['Schedule stakeholder meetings', 'Draft governance charter', 'Identify committee members'],
        milestones: ['Week 1: Stakeholder alignment', 'Week 2: Charter draft', 'Week 3: Committee formation', 'Week 4: First meeting'],
        success_metrics: ['Committee formed', 'Charter approved', '100% stakeholder participation'],
        status: 'in_progress',
        completion_percentage: 25
      },
      {
        user_id: userId,
        roadmap_type: '60_day',
        goals: ['Develop AI policies', 'Launch pilot program', 'Train key staff'],
        action_items: ['Write AI usage policy', 'Select pilot departments', 'Develop training materials'],
        milestones: ['Month 1: Policy development', 'Month 2: Pilot launch and training'],
        success_metrics: ['Policy approved', '3+ departments in pilot', '50+ staff trained'],
        status: 'not_started',
        completion_percentage: 0
      },
      {
        user_id: userId,
        roadmap_type: '90_day',
        goals: ['Full AI framework implementation', 'Measure pilot outcomes', 'Plan expansion'],
        action_items: ['Deploy AI tools', 'Collect metrics', 'Develop expansion plan'],
        milestones: ['Month 1: Deployment', 'Month 2: Measurement', 'Month 3: Planning'],
        success_metrics: ['Framework operational', 'ROI measured', 'Expansion plan approved'],
        status: 'not_started',
        completion_percentage: 0
      }
    ];

    for (const roadmap of roadmaps) {
      await supabaseAdmin.from('implementation_roadmaps').insert(roadmap);
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      credentials: {
        email: testEmail,
        password: testPassword,
        userId: userId,
        loginUrl: 'https://aiblueprint.k12aiblueprint.com/auth/login'
      },
      features: [
        'Full dashboard access',
        'Sample assessment data',
        'Gap analysis results',
        'Implementation roadmaps',
        'Document upload capability'
      ]
    });

  } catch (error: any) {
    console.error('Test user creation error:', error);
    return NextResponse.json({
      error: 'Failed to create test user',
      details: error.message
    }, { status: 500 });
  }
}