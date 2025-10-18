import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface AssessmentSubmission {
    leadId: string;
    responses: Record<number, number>; // questionId -> value (0-4)
}

interface CategoryScore {
    name: string;
    score: number;
    questionCount: number;
}

interface QuickWin {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    rationale: string;
    timeframe: string;
    category: string;
    categoryScore: number;
}

interface AssessmentResults {
    overallScore: number;
    readinessLevel: string;
    categoryScores: Record<string, number>;
    quickWins: QuickWin[];
    estimatedImpact: {
        costSavings: string;
        timeSaved: string;
        efficiencyGain: string;
    };
    percentile: number;
}

// Category mapping (matches frontend questions)
const CATEGORY_MAP: Record<string, number[]> = {
    'Strategy & Vision': [1, 2],
    'Leadership & Governance': [3, 4],
    'Faculty & Staff Readiness': [5, 6],
    'Technology Infrastructure': [7, 8],
    'Data & Privacy': [9, 10],
    'Curriculum & Pedagogy': [11],
    'Analytics & Outcomes': [12]
};

// Category weights for overall score calculation
const CATEGORY_WEIGHTS: Record<string, number> = {
    'Strategy & Vision': 0.15,
    'Leadership & Governance': 0.15,
    'Faculty & Staff Readiness': 0.20, // Highest weight
    'Technology Infrastructure': 0.15,
    'Data & Privacy': 0.15,
    'Curriculum & Pedagogy': 0.10,
    'Analytics & Outcomes': 0.10
};

// Quick win recommendations by category
const QUICK_WIN_LIBRARY: Record<string, QuickWin> = {
    'Strategy & Vision': {
        priority: 'HIGH',
        title: 'Draft AI Strategic Vision Document',
        rationale: 'Establish clear direction and secure leadership buy-in for AI initiatives',
        timeframe: '30 days',
        category: 'Strategy',
        categoryScore: 0
    },
    'Leadership & Governance': {
        priority: 'HIGH',
        title: 'Form Cross-Functional AI Task Force',
        rationale: 'Coordinate initiatives across departments and avoid siloed implementations',
        timeframe: '2 weeks',
        category: 'Leadership',
        categoryScore: 0
    },
    'Faculty & Staff Readiness': {
        priority: 'HIGH',
        title: 'Launch Faculty AI Literacy Workshops',
        rationale: 'Build confidence and competence among educators to drive meaningful adoption',
        timeframe: '30 days',
        category: 'Readiness',
        categoryScore: 0
    },
    'Technology Infrastructure': {
        priority: 'MEDIUM',
        title: 'Audit and Integrate Core Systems (SIS/LMS)',
        rationale: 'Enable seamless data flow needed for AI-powered analytics and automation',
        timeframe: 'This quarter',
        category: 'Infrastructure',
        categoryScore: 0
    },
    'Data & Privacy': {
        priority: 'HIGH',
        title: 'Publish AI Acceptable Use Policy',
        rationale: 'Establish clear guardrails and ensure FERPA/COPPA compliance',
        timeframe: '30 days',
        category: 'Privacy',
        categoryScore: 0
    },
    'Curriculum & Pedagogy': {
        priority: 'MEDIUM',
        title: 'Pilot AI Tools in 2-3 High-Enrollment Courses',
        rationale: 'Demonstrate value to stakeholders and gather actionable faculty feedback',
        timeframe: 'Next semester',
        category: 'Curriculum',
        categoryScore: 0
    },
    'Analytics & Outcomes': {
        priority: 'MEDIUM',
        title: 'Implement Early Alert System for At-Risk Students',
        rationale: 'Use predictive analytics to improve retention and student success rates',
        timeframe: 'This quarter',
        category: 'Analytics',
        categoryScore: 0
    }
};

function calculateCategoryScores(responses: Record<number, number>): Record<string, CategoryScore> {
    const categoryScores: Record<string, CategoryScore> = {};

    for (const [categoryName, questionIds] of Object.entries(CATEGORY_MAP)) {
        let sum = 0;
        let count = 0;

        questionIds.forEach(qId => {
            if (responses[qId] !== undefined) {
                sum += responses[qId];
                count++;
            }
        });

        const score = count > 0 ? Math.round((sum / (count * 4)) * 100) : 0;
        categoryScores[categoryName] = {
            name: categoryName,
            score,
            questionCount: count
        };
    }

    return categoryScores;
}

function calculateOverallScore(categoryScores: Record<string, CategoryScore>): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [categoryName, data] of Object.entries(categoryScores)) {
        const weight = CATEGORY_WEIGHTS[categoryName] || 0;
        weightedSum += data.score * weight;
        totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

function getReadinessLevel(score: number): string {
    if (score <= 25) return 'Beginning';
    if (score <= 50) return 'Developing';
    if (score <= 75) return 'Emerging';
    if (score <= 90) return 'Advanced';
    return 'Leading';
}

function generateQuickWins(categoryScores: Record<string, CategoryScore>): QuickWin[] {
    // Convert to array and sort by score (lowest first)
    const sortedCategories = Object.entries(categoryScores)
        .map(([name, data]) => ({ name, score: data.score }))
        .sort((a, b) => a.score - b.score);

    // Generate quick wins for lowest 6 categories
    const quickWins: QuickWin[] = [];

    sortedCategories.slice(0, 6).forEach((cat, index) => {
        const template = QUICK_WIN_LIBRARY[cat.name];
        if (template) {
            quickWins.push({
                ...template,
                categoryScore: cat.score,
                priority: index < 2 ? 'HIGH' : index < 4 ? 'MEDIUM' : 'LOW'
            });
        }
    });

    return quickWins;
}

function calculateEstimatedImpact(overallScore: number) {
    // Impact scales with readiness score
    const costMin = Math.round(overallScore * 450);
    const costMax = Math.round(overallScore * 750);
    const timeSaved = Math.round(overallScore * 12);
    const efficiency = Math.round(overallScore * 0.22);

    return {
        costSavings: `$${costMin.toLocaleString()}-$${costMax.toLocaleString()}`,
        timeSaved: `${timeSaved.toLocaleString()}+ hrs`,
        efficiencyGain: `${efficiency}%`
    };
}

function calculatePercentile(overallScore: number): number {
    // Mock percentile calculation based on score
    // In production, this would query actual database stats
    return Math.min(95, Math.max(15, overallScore - 10 + Math.random() * 10));
}

function qualifyLead(
    overallScore: number,
    role: string,
    institutionType: string
): 'HOT' | 'WARM' | 'COLD' {
    // HOT: High score + decision-maker role
    const decisionMakers = [
        'Superintendent/President/Chancellor',
        'Provost/Chief Academic Officer',
        'CIO/CTO/Technology Director'
    ];

    if (overallScore >= 60 && decisionMakers.includes(role)) {
        return 'HOT';
    }

    // WARM: Medium score + relevant role OR high score + any role
    const relevantRoles = [
        ...decisionMakers,
        'Dean/Department Chair',
        'Instructional Designer'
    ];

    if (
        (overallScore >= 40 && relevantRoles.includes(role)) ||
        (overallScore >= 60)
    ) {
        return 'WARM';
    }

    // COLD: Everyone else
    return 'COLD';
}

async function sendResultsEmail(
    leadData: any,
    results: AssessmentResults
): Promise<void> {
    try {
        // Resolve a dependable base URL so server-side fetch calls work in every environment
        const baseUrl = (() => {
            const sanitize = (value?: string | null) => value?.trim().replace(/\/$/, '');

            const envBase = sanitize(process.env.NEXT_PUBLIC_BASE_URL);
            if (envBase) {
                return envBase.startsWith('http') ? envBase : `https://${envBase}`;
            }

            const vercelUrl = sanitize(process.env.VERCEL_URL);
            if (vercelUrl) {
                return `https://${vercelUrl}`;
            }

            const vercelBranchUrl = sanitize(process.env.VERCEL_BRANCH_URL);
            if (vercelBranchUrl) {
                return `https://${vercelBranchUrl}`;
            }

            return process.env.NODE_ENV === 'production'
                ? 'https://aiblueprint.educationaiblueprint.com'
                : 'http://localhost:3000';
        })();

        // Send results to user
        const userEmailResponse = await fetch(
            `${baseUrl}/api/demo/emails/user-results`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadData, results })
            }
        );

        if (!userEmailResponse.ok) {
            const errorBody = await userEmailResponse.text().catch(() => '');
            console.error('Failed to send user results email', {
                status: userEmailResponse.status,
                statusText: userEmailResponse.statusText,
                errorBody
            });
        }

        // Send sales notification
        const salesEmailResponse = await fetch(
            `${baseUrl}/api/demo/emails/sales-notification`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadData, results })
            }
        );

        if (!salesEmailResponse.ok) {
            const errorBody = await salesEmailResponse.text().catch(() => '');
            console.error('Failed to send sales notification email', {
                status: salesEmailResponse.status,
                statusText: salesEmailResponse.statusText,
                errorBody
            });
        }
    } catch (error) {
        console.error('Error sending emails:', error);
        // Don't throw - email failure shouldn't block the response
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: AssessmentSubmission = await request.json();

        // Validate leadId
        if (!body.leadId) {
            return NextResponse.json(
                { success: false, error: 'Missing leadId' },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                }
            );
        }

        // Validate responses
        if (!body.responses || Object.keys(body.responses).length < 12) {
            return NextResponse.json(
                { success: false, error: 'Incomplete assessment responses' },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                }
            );
        }

        // Calculate scores
        const categoryScoresData = calculateCategoryScores(body.responses);
        const categoryScores: Record<string, number> = {};
        Object.entries(categoryScoresData).forEach(([name, data]) => {
            categoryScores[name] = data.score;
        });

        const overallScore = calculateOverallScore(categoryScoresData);
        const readinessLevel = getReadinessLevel(overallScore);
        const quickWins = generateQuickWins(categoryScoresData);
        const estimatedImpact = calculateEstimatedImpact(overallScore);
        const percentile = Math.round(calculatePercentile(overallScore));

        const results: AssessmentResults = {
            overallScore,
            readinessLevel,
            categoryScores,
            quickWins,
            estimatedImpact,
            percentile
        };

        // Initialize Supabase admin client with service role key to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Get lead data
        const { data: leadData, error: leadError } = await supabase
            .from('demo_leads')
            .select('*')
            .eq('id', body.leadId)
            .single();

        if (leadError || !leadData) {
            console.error('Error fetching lead data:', leadError);
            return NextResponse.json(
                { success: false, error: 'Lead not found' },
                {
                    status: 404,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                }
            );
        }

        // Qualify lead
        const leadQualification = qualifyLead(
            overallScore,
            leadData.role,
            leadData.institution_type
        );

        // Update lead record with results
        const { error: updateError } = await supabase
            .from('demo_leads')
            .update({
                responses: body.responses,
                overall_score: overallScore,
                readiness_level: readinessLevel,
                category_scores: categoryScores,
                quick_wins: quickWins,
                estimated_impact: estimatedImpact,
                lead_qualification: leadQualification,
                completed_at: new Date().toISOString()
            })
            .eq('id', body.leadId);

        if (updateError) {
            console.error('Error updating demo lead:', updateError);
            // Continue anyway - we can still return results
        }

        // Send emails asynchronously (don't block response)
        sendResultsEmail(leadData, results).catch(err => {
            console.error('Email sending failed:', err);
        });

        return NextResponse.json(
            {
                success: true,
                results
            },
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }
        );
    } catch (error) {
        console.error('Unexpected error in demo assessment submit:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json(
        {},
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        }
    );
}
