import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

// Scoring: 0=0 points, 1=1 point, 2=2 points, 3=3 points
function calculateScores(answers: Record<number, number>) {
    const categories = {
        GOVERN: [1, 2, 3, 4, 5],
        MAP: [6, 7, 8, 9, 10],
        MEASURE: [11, 12, 13, 14, 15],
        MANAGE: [16, 17, 18, 19, 20]
    };

    const scores: Record<string, { score: number; maxScore: number; percentage: number }> = {};
    let totalScore = 0;
    let maxTotalScore = 0;

    for (const [category, questionIds] of Object.entries(categories)) {
        let categoryScore = 0;
        let categoryMax = questionIds.length * 3; // Max 3 points per question

        questionIds.forEach(qId => {
            const answer = answers[qId - 1]; // Questions are 1-indexed
            if (answer !== undefined) {
                categoryScore += answer;
            }
        });

        scores[category] = {
            score: categoryScore,
            maxScore: categoryMax,
            percentage: Math.round((categoryScore / categoryMax) * 100)
        };

        totalScore += categoryScore;
        maxTotalScore += categoryMax;
    }

    scores.OVERALL = {
        score: totalScore,
        maxScore: maxTotalScore,
        percentage: Math.round((totalScore / maxTotalScore) * 100)
    };

    return scores;
}

function getReadinessLevel(percentage: number): string {
    if (percentage >= 80) return 'Advanced';
    if (percentage >= 60) return 'Developing';
    if (percentage >= 40) return 'Emerging';
    return 'Beginning';
}

async function generateAIRoadmap(scores: any, answers: Record<number, number>) {
    try {
        const prompt = `You are an AI readiness consultant for K-12 and Higher Education institutions.

Based on this assessment data:
- Overall Readiness: ${scores.OVERALL.percentage}%
- GOVERN Score: ${scores.GOVERN.percentage}%
- MAP Score: ${scores.MAP.percentage}%
- MEASURE Score: ${scores.MEASURE.percentage}%
- MANAGE Score: ${scores.MANAGE.percentage}%

Generate a personalized 30/60/90 day implementation roadmap.

Format:
## Executive Summary
[2-3 sentences about their current state and priority areas]

## 30-Day Quick Wins
[3-4 actionable items with specific deliverables]

## 60-Day Foundation Building
[3-4 items that build on 30-day work]

## 90-Day Strategic Initiatives
[2-3 larger strategic initiatives]

## Key Recommendations
[Top 3 priorities based on lowest scoring areas]

Keep it practical, specific, and actionable. Focus on the lowest-scoring categories for quick improvements.`;

        if (!openai) {
            // Return a fallback roadmap when OpenAI is not configured
            return `# AI Readiness Roadmap

Based on your assessment scores:
- GOVERN: ${scores.GOVERN.percentage}%
- MAP: ${scores.MAP.percentage}% 
- MEASURE: ${scores.MEASURE.percentage}%
- MANAGE: ${scores.MANAGE.percentage}%

## Next Steps
1. Focus on improving your lowest scoring areas first
2. Develop comprehensive AI governance policies
3. Map your AI systems and data flows
4. Establish measurement and monitoring processes
5. Implement risk management procedures

For detailed recommendations, please ensure OpenAI API is configured.`;
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert AI readiness consultant specializing in K-12 and Higher Education. Provide actionable, specific guidance based on NIST AI RMF framework.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        return completion.choices[0].message.content || 'Unable to generate roadmap';
    } catch (error) {
        console.error('OpenAI error:', error);
        return 'Roadmap generation temporarily unavailable. Your scores have been saved.';
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, answers, completedAt } = await req.json();

        // Verify user matches
        if (userId !== user.id) {
            return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
        }

        // Calculate scores
        const scores = calculateScores(answers);
        const readinessLevel = getReadinessLevel(scores.OVERALL.percentage);

        console.log('Generating AI roadmap...');
        // Generate AI roadmap
        const roadmap = await generateAIRoadmap(scores, answers);

        // Save to database
        const { data: assessment, error: dbError } = await supabase
            .from('streamlined_assessment_responses')
            .insert({
                user_id: userId,
                responses: answers,
                scores: scores,
                readiness_level: readinessLevel,
                ai_roadmap: roadmap,
                completed_at: completedAt
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
        }

        console.log('✅ Assessment saved, creating gap analysis...');

        // Also create gap_analysis_results for dashboard
        const gapAnalysisData = {
            user_id: userId,
            overall_score: scores.OVERALL.percentage,
            maturity_level: readinessLevel,
            govern_score: scores.GOVERN.percentage,
            govern_gaps: [], // Will be populated from detailed analysis
            govern_strengths: [],
            govern_recommendations: [roadmap.split('GOVERN')[1]?.split('MAP')[0] || 'Focus on governance'].slice(0, 200),
            map_score: scores.MAP.percentage,
            map_gaps: [],
            map_strengths: [],
            map_recommendations: [roadmap.split('MAP')[1]?.split('MEASURE')[0] || 'Focus on mapping'].slice(0, 200),
            measure_score: scores.MEASURE.percentage,
            measure_gaps: [],
            measure_strengths: [],
            measure_recommendations: [roadmap.split('MEASURE')[1]?.split('MANAGE')[0] || 'Focus on measurement'].slice(0, 200),
            manage_score: scores.MANAGE.percentage,
            manage_gaps: [],
            manage_strengths: [],
            manage_recommendations: [roadmap.split('MANAGE')[1] || 'Focus on risk management'].slice(0, 200),
            priority_actions: [
                'Review AI governance policies',
                'Establish AI oversight committee',
                'Document current AI systems'
            ],
            quick_wins: [
                'Create AI acceptable use policy',
                'Conduct AI awareness training',
                'Inventory existing AI tools'
            ],
            analysis_date: new Date().toISOString()
        };

        const { error: gapError } = await supabase
            .from('gap_analysis_results')
            .upsert(gapAnalysisData, {
                onConflict: 'user_id',
                ignoreDuplicates: false
            });

        if (gapError) {
            console.error('⚠️ Gap analysis creation failed:', gapError);
            // Don't fail the whole request
        } else {
            console.log('✅ Gap analysis created for dashboard');
        }

        return NextResponse.json({
            success: true,
            assessmentId: assessment.id,
            scores,
            readinessLevel,
            roadmap
        });

    } catch (error: any) {
        console.error('Assessment submission error:', error);
        return NextResponse.json(
            { error: error.message || 'Server error' },
            { status: 500 }
        );
    }
}
