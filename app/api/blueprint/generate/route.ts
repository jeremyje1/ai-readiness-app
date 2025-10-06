import { BlueprintService } from '@/lib/blueprint/blueprint-service';
import { createClient } from '@/lib/supabase/server';
import { Blueprint, BlueprintGoals } from '@/types/blueprint';
import { NextResponse } from 'next/server';

// POST: Generate a new blueprint
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { goals_id, assessment_id, organization_id } = body;

        // Validate required fields
        if (!goals_id || !assessment_id) {
            return NextResponse.json(
                { error: 'Goals ID and assessment ID are required' },
                { status: 400 }
            );
        }

        // Fetch the goals
        const { data: goals, error: goalsError } = await supabase
            .from('blueprint_goals')
            .select('*')
            .eq('id', goals_id)
            .eq('user_id', user.id)
            .single();

        if (goalsError || !goals) {
            return NextResponse.json({ error: 'Goals not found' }, { status: 404 });
        }

        // Fetch the assessment data from streamlined_assessment_responses
        const { data: assessment, error: assessmentError } = await supabase
            .from('streamlined_assessment_responses')
            .select('*')
            .eq('id', assessment_id)
            .eq('user_id', user.id)
            .single();

        if (assessmentError || !assessment) {
            console.error('Assessment fetch error:', assessmentError);
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        console.log('✅ Found assessment:', assessment.id);

        // Check if user has an active subscription or sufficient credits
        const { data: userProfile } = await supabase
            .from('users')
            .select('tier_expiry, is_paid_subscriber, credits_remaining')
            .eq('id', user.id)
            .single();

        const hasAccess = userProfile && (
            (userProfile.is_paid_subscriber && userProfile.tier_expiry && new Date(userProfile.tier_expiry) > new Date()) ||
            (userProfile.credits_remaining && userProfile.credits_remaining > 0)
        );

        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Active subscription or credits required to generate blueprints' },
                { status: 403 }
            );
        }

        // Check for existing blueprint with same goals and assessment
        const { data: existingBlueprint } = await supabase
            .from('blueprints')
            .select('id, status')
            .eq('goals_id', goals_id)
            .eq('assessment_id', assessment_id)
            .eq('user_id', user.id)
            .single();

        if (existingBlueprint && existingBlueprint.status === 'generating') {
            return NextResponse.json(
                { error: 'Blueprint generation already in progress' },
                { status: 409 }
            );
        }

        // Create initial blueprint record
        const initialBlueprint: Partial<Blueprint> = {
            user_id: user.id,
            organization_id: organization_id || null,
            assessment_id,
            goals_id,
            title: `AI Implementation Blueprint - ${new Date().toLocaleDateString()}`,
            version: 1,
            status: 'generating',
            vision_statement: 'Generating vision statement...',
            executive_summary: 'Generating executive summary...',
            value_proposition: {
                summary: 'Analyzing value proposition...',
                key_benefits: [],
                expected_roi: 'Calculating...',
                timeline_to_value: 'Estimating...'
            },
            readiness_scores: {
                overall: 0,
                dsch: { score: 0, factors: {} },
                lei: { score: 0, factors: {} },
                crf: { score: 0, factors: {} },
                oci: { score: 0, factors: {} },
                hoci: { score: 0, factors: {} }
            },
            maturity_level: 'Assessing...',
            implementation_phases: [],
            department_plans: [],
            success_metrics: [],
            kpi_targets: {},
            risk_assessment: [],
            mitigation_strategies: [],
            resource_allocation: {
                human_resources: [],
                technology_resources: [],
                training_budget: 0,
                technology_budget: 0,
                consulting_budget: 0,
                contingency: 0
            },
            total_budget: 0,
            quick_wins: [],
            recommended_tools: [],
            is_public: false,
            share_token: Math.random().toString(36).substring(2, 15),
            shared_with: []
        };

        const { data: newBlueprint, error: insertError } = await supabase
            .from('blueprints')
            .insert(initialBlueprint)
            .select()
            .single();

        if (insertError) {
            console.error('Error creating blueprint:', insertError);
            return NextResponse.json({ error: 'Failed to create blueprint' }, { status: 500 });
        }

        // Deduct credit if not subscriber
        if (userProfile && !userProfile.is_paid_subscriber && userProfile.credits_remaining) {
            await supabase
                .from('users')
                .update({ credits_remaining: userProfile.credits_remaining - 1 })
                .eq('id', user.id);
        }

        // Initialize the blueprint service and start generation
        const blueprintService = new BlueprintService(supabase);

        // Start async generation process
        blueprintService.generateBlueprint(
            newBlueprint.id,
            goals as BlueprintGoals,
            assessment,
            user.id
        ).catch((error: Error) => {
            console.error('Blueprint generation failed:', error);
            // Update status to failed
            supabase
                .from('blueprints')
                .update({ status: 'draft' })
                .eq('id', newBlueprint.id)
                .then(() => { });
        });

        // Return the blueprint ID immediately
        return NextResponse.json({
            blueprint_id: newBlueprint.id,
            status: 'generating',
            message: 'Blueprint generation started. This may take a few minutes.'
        }, { status: 202 });

    } catch (error) {
        console.error('Error in POST /api/blueprint/generate:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}