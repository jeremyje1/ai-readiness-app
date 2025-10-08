import { buildNistAlignment, buildRiskHotspots } from '@/lib/analysis/gap-insights';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type QuickWinItem = {
    id: string;
    title: string;
    pillar: string;
    rationale: string;
    timeframe: string;
    score: number;
};

type RecommendationItem = {
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    resourceId?: string;
};

type DomainInsight = {
    key: 'govern' | 'map' | 'measure' | 'manage';
    label: string;
    score: number;
    recommendation?: string | null;
};

type GapAnalysisSnapshot = {
    overall_score?: number | null;
    quick_wins?: string[] | null;
    risk_hotspots?: unknown[] | null;
    nist_alignment?: unknown[] | null;
    govern_score?: number | null;
    govern_recommendations?: string[] | null;
    map_score?: number | null;
    map_recommendations?: string[] | null;
    measure_score?: number | null;
    measure_recommendations?: string[] | null;
    manage_score?: number | null;
    manage_recommendations?: string[] | null;
} | null;

/**
 * Dashboard metrics API endpoint
 * Serves real customer data for the AudienceAwareDashboard component
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const audience = searchParams.get('audience') || 'k12';

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select(`
                user_id,
                name,
                title,
                institution_id,
                onboarding_completed,
                subscription_status,
                institution:institutions!user_profiles_institution_id_fkey (
                    id,
                    name,
                    slug,
                    headcount,
                    budget,
                    org_type
                )
            `)
            .eq('user_id', user.id)
            .single();

        if (profileError || !profile) {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const { data: assessments } = await supabase
            .from('assessments')
            .select(`
                id,
                user_id,
                assessment_date,
                completion_status,
                risk_score,
                compliance_status,
                algorithm_results
            `)
            .eq('user_id', user.id)
            .order('assessment_date', { ascending: false })
            .limit(5);

        const latestAssessment = assessments?.[0];
        const previousAssessment = assessments?.[1];

        const currentScore = latestAssessment?.algorithm_results?.overall_score
            ? Math.round(latestAssessment.algorithm_results.overall_score * 100)
            : 0;

        const previousScore = previousAssessment?.algorithm_results?.overall_score
            ? Math.round(previousAssessment.algorithm_results.overall_score * 100)
            : 0;

        const getScoreLevel = (score: number) => {
            if (score >= 85) return 'advanced';
            if (score >= 70) return 'proficient';
            if (score >= 50) return 'developing';
            return 'emerging';
        };

        const completedAssessments = assessments?.filter((a) => a.completion_status === 'completed').length || 0;
        const totalAssessments = assessments?.length || 1;
        const completionRate = Math.round((completedAssessments / totalAssessments) * 100);

        const institution = profile.institution?.[0];
        const headcount = institution?.headcount || 0;

        const audienceSpecificMetrics = audience === 'k12'
            ? {
                k12: {
                    districtsServed: headcount ? Math.ceil(headcount / 5000) : 1,
                    studentsImpacted: headcount,
                    staffTrained: Math.floor(headcount * 0.1),
                    policyImplementation: currentScore >= 50 ? 100 : Math.round(currentScore * 2)
                }
            }
            : {
                highered: {
                    institutionsServed: 1,
                    facultyEngaged: Math.floor(headcount * 0.15),
                    programsLaunched: currentScore >= 70 ? Math.floor(currentScore / 10) : 0,
                    researchProjects: currentScore >= 60 ? Math.floor(currentScore / 20) : 0
                }
            };

        const { data: recentActivity } = await supabase
            .from('audit_logs')
            .select('action, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        const activityItems = recentActivity?.map((log, index) => ({
            id: `activity-${index}`,
            type: log.action.includes('assessment') ? 'assessment'
                : log.action.includes('resource') ? 'resource'
                    : log.action.includes('blueprint') ? 'policy'
                        : 'training',
            title: log.action,
            timestamp: log.created_at,
            status: 'completed' as const
        })) || [];

        const { data: recommendations } = await supabase
            .from('recommendations')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('priority_score', { ascending: false })
            .limit(5);

        const recommendationItems: RecommendationItem[] = recommendations?.map((rec) => ({
            id: rec.id,
            priority: rec.priority_score >= 80 ? 'high'
                : rec.priority_score >= 50 ? 'medium'
                    : 'low',
            category: rec.category || 'general',
            title: rec.title,
            description: rec.description,
            resourceId: rec.resource_id
        })) || [];

        const { data: gapAnalysis, error: gapError } = await supabase
            .from('gap_analysis_results')
            .select(`
                overall_score,
                quick_wins,
                risk_hotspots,
                nist_alignment,
                govern_score,
                govern_recommendations,
                map_score,
                map_recommendations,
                measure_score,
                measure_recommendations,
                manage_score,
                manage_recommendations
            `)
            .eq('user_id', user.id)
            .maybeSingle();

        if (gapError && gapError.code !== 'PGRST116') {
            console.warn('Gap analysis fetch warning:', gapError);
        }

        const derivedOverallScore = typeof gapAnalysis?.overall_score === 'number'
            ? Math.round(gapAnalysis.overall_score)
            : currentScore;

        const quickWins = buildQuickWins(gapAnalysis, recommendationItems, derivedOverallScore);
        const domainInsights = deriveDomainInsights(gapAnalysis, recommendationItems, derivedOverallScore);

        const riskHotspots = Array.isArray(gapAnalysis?.risk_hotspots) && gapAnalysis.risk_hotspots?.length
            ? gapAnalysis.risk_hotspots
            : buildRiskHotspots({
                overallScore: derivedOverallScore,
                domains: domainInsights,
                recommendations: recommendationItems.map((rec) => ({
                    title: rec.title,
                    category: rec.category,
                    description: rec.description,
                    priority: rec.priority
                })),
                quickWins: quickWins.map((win) => win.title)
            });

        const nistAlignment = Array.isArray(gapAnalysis?.nist_alignment) && gapAnalysis.nist_alignment?.length
            ? gapAnalysis.nist_alignment
            : buildNistAlignment({
                overallScore: derivedOverallScore,
                domains: domainInsights
            });

        const { data: peerScores } = await supabase
            .from('assessments')
            .select('algorithm_results->overall_score')
            .neq('user_id', user.id)
            .not('algorithm_results', 'is', null);

        const userPercentile = calculatePercentile(currentScore, peerScores || []);

        return NextResponse.json({
            audience,
            metrics: {
                assessmentScore: {
                    current: currentScore,
                    previous: previousScore,
                    trend: currentScore > previousScore ? 'up' : currentScore < previousScore ? 'down' : 'stable',
                    level: getScoreLevel(currentScore)
                },
                completionRate: {
                    percentage: completionRate,
                    completed: completedAssessments,
                    total: totalAssessments
                },
                audienceSpecificMetrics,
                recentActivity: activityItems,
                recommendations: recommendationItems,
                quickWins,
                riskHotspots,
                nistAlignment,
                benchmarking: {
                    percentile: userPercentile,
                    peerComparison: userPercentile >= 75 ? 'above' : userPercentile <= 25 ? 'below' : 'average',
                    sampleSize: peerScores?.length || 0
                }
            },
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Dashboard metrics error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function calculatePercentile(score: number, peerScores: any[]): number {
    if (!peerScores.length) return 50;

    const scores = peerScores
        .map((p) => p.algorithm_results?.overall_score ? p.algorithm_results.overall_score * 100 : 0)
        .filter((s) => s > 0)
        .sort((a, b) => a - b);

    if (!scores.length) return 50;

    const below = scores.filter((s) => s < score).length;
    return Math.round((below / scores.length) * 100);
}

function buildQuickWins(
    gapAnalysis: GapAnalysisSnapshot,
    recommendations: RecommendationItem[],
    overallScore: number
): QuickWinItem[] {
    const wins: QuickWinItem[] = [];
    const seen = new Set<string>();

    const addWin = (win: QuickWinItem) => {
        const key = win.title?.trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        wins.push(win);
    };

    const timeframeForScore = (score: number) => {
        if (score <= 35) return 'Launch this week';
        if (score <= 55) return 'Next 2 weeks';
        if (score <= 70) return 'Within 30 days';
        return 'This quarter';
    };

    if (gapAnalysis) {
        const domainConfigs = [
            {
                key: 'govern' as const,
                label: 'Govern',
                score: gapAnalysis.govern_score,
                recommendations: gapAnalysis.govern_recommendations
            },
            {
                key: 'map' as const,
                label: 'Map',
                score: gapAnalysis.map_score,
                recommendations: gapAnalysis.map_recommendations
            },
            {
                key: 'measure' as const,
                label: 'Measure',
                score: gapAnalysis.measure_score,
                recommendations: gapAnalysis.measure_recommendations
            },
            {
                key: 'manage' as const,
                label: 'Manage',
                score: gapAnalysis.manage_score,
                recommendations: gapAnalysis.manage_recommendations
            }
        ];

        domainConfigs
            .filter((domain) => (domain.score ?? 100) < 82)
            .sort((a, b) => (a.score ?? 100) - (b.score ?? 100))
            .forEach((domain) => {
                const candidate = domain.recommendations?.find((text) => text?.trim().length)
                    ?? gapAnalysis.quick_wins?.find((text) => text?.toLowerCase().includes(domain.label.toLowerCase()))
                    ?? recommendations.find((rec) => rec.category?.toLowerCase().includes(domain.label.toLowerCase()))?.title;

                if (!candidate) return;

                const score = typeof domain.score === 'number' ? Math.round(domain.score) : overallScore;
                addWin({
                    id: `quick-win-${domain.key}`,
                    title: candidate,
                    pillar: `${domain.label} pillar`,
                    rationale: score < 40
                        ? 'Immediate stabilization needed to reduce risk exposure.'
                        : 'High-impact 30-day momentum builder for this pillar.',
                    timeframe: timeframeForScore(score),
                    score
                });
            });

        const addFromList = (
            list: (string | null)[] | null | undefined,
            label: string,
            context: string,
            score: number
        ) => {
            if (!list) return;
            list
                .filter((item): item is string => !!item && item.trim().length > 0)
                .forEach((item) => addWin({
                    id: `quick-win-${label.toLowerCase()}-${item.slice(0, 12).replace(/\s+/g, '-')}`,
                    title: item,
                    pillar: label,
                    rationale: context,
                    timeframe: 'Within 30 days',
                    score
                }));
        };

        addFromList(gapAnalysis.quick_wins, 'Cross-functional', 'Flagged as a readiness quick win.', overallScore);
    }

    if (wins.length < 3) {
        recommendations.forEach((rec) => {
            addWin({
                id: `quick-win-rec-${rec.id}`,
                title: rec.title,
                pillar: rec.category || 'Cross-functional',
                rationale: rec.description || 'High-impact recommendation from your latest readiness results.',
                timeframe: 'Within 30 days',
                score: overallScore
            });
        });
    }

    if (wins.length === 0) {
        addWin({
            id: 'quick-win-fallback',
            title: 'Stand up a focused AI governance sprint',
            pillar: 'Govern',
            rationale: 'Kick off a 30-day governance sprint to establish oversight and build credibility.',
            timeframe: timeframeForScore(overallScore),
            score: overallScore
        });
    }

    return wins.slice(0, 6);
}

function deriveDomainInsights(
    gapAnalysis: GapAnalysisSnapshot,
    recommendations: RecommendationItem[],
    fallbackScore: number
): DomainInsight[] {
    const recommendationLookup = new Map<string, string>();
    recommendations.forEach((rec) => {
        const key = rec.category?.toLowerCase();
        if (!key || recommendationLookup.has(key)) return;
        recommendationLookup.set(key, rec.title);
    });

    const resolveRecommendation = (key: string, list?: string[] | null) => {
        const normalizedKey = key.toLowerCase();
        const fromList = list?.find((item) => item && item.trim().length);
        if (fromList) return fromList;
        return recommendationLookup.get(normalizedKey)
            ?? recommendationLookup.get(`${normalizedKey} pillar`)
            ?? null;
    };

    return [
        {
            key: 'govern',
            label: 'Govern',
            score: normalizeScore(gapAnalysis?.govern_score, fallbackScore),
            recommendation: resolveRecommendation('govern', gapAnalysis?.govern_recommendations)
        },
        {
            key: 'map',
            label: 'Map',
            score: normalizeScore(gapAnalysis?.map_score, fallbackScore),
            recommendation: resolveRecommendation('map', gapAnalysis?.map_recommendations)
        },
        {
            key: 'measure',
            label: 'Measure',
            score: normalizeScore(gapAnalysis?.measure_score, fallbackScore),
            recommendation: resolveRecommendation('measure', gapAnalysis?.measure_recommendations)
        },
        {
            key: 'manage',
            label: 'Manage',
            score: normalizeScore(gapAnalysis?.manage_score, fallbackScore),
            recommendation: resolveRecommendation('manage', gapAnalysis?.manage_recommendations)
        }
    ];
}

function normalizeScore(value: number | null | undefined, fallback: number) {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return Math.max(0, Math.min(100, Math.round(value)));
    }
    return Math.max(0, Math.min(100, Math.round(fallback)));
}