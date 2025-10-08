import { POLICY_CLAUSES, POLICY_TEMPLATES } from '@/lib/policy/templates';
import type { Audience, PolicyClause } from '@/lib/policy/types';
import type {
    BlueprintGoals,
    BlueprintPolicyClauseDraft,
    BlueprintPolicyClauseRevision,
    BlueprintPolicyRecommendation,
    BlueprintPolicyStatus,
    QuickWin,
    ReadinessScores
} from '@/types/blueprint';

type RecommendationStatus = BlueprintPolicyStatus;

interface PolicyRecommendationContext {
    goals: BlueprintGoals;
    assessment: any;
    readinessScores: ReadinessScores;
    quickWins: QuickWin[];
}

interface PolicySignal {
    key: string;
    reason: string;
    tags: string[];
    weight: number;
}

const clamp = (value: number, min = 0, max = 100): number => {
    if (!Number.isFinite(value)) return min;
    return Math.min(Math.max(value, min), max);
};

const determineAudience = (assessment: any, goals: BlueprintGoals): Audience => {
    const rawType = `${assessment?.organization_type || assessment?.institution_type || assessment?.industry || ''}`.toLowerCase();

    if (rawType.includes('k-12') || rawType.includes('k12') || rawType.includes('district') || rawType.includes('elementary') || rawType.includes('secondary')) {
        return 'k12';
    }

    if (rawType.includes('college') || rawType.includes('university') || rawType.includes('higher') || rawType.includes('post-secondary')) {
        return 'highered';
    }

    const goalsText = goals.primary_goals.join(' ').toLowerCase();
    if (goalsText.includes('student safety') || goalsText.includes('classroom') || goalsText.includes('district')) {
        return 'k12';
    }

    return 'highered';
};

const buildInitialRevision = (clause: PolicyClause): BlueprintPolicyClauseRevision => ({
    version: clause.metadata.version,
    body: clause.body,
    updatedAt: clause.metadata.updatedAt || clause.metadata.createdAt,
    updatedBy: clause.metadata.author || 'policy-engine',
    note: 'Initial template version'
});

const createClauseDraft = (clause: PolicyClause): BlueprintPolicyClauseDraft => ({
    clauseId: clause.id,
    title: clause.title,
    tags: clause.tags,
    originalBody: clause.body,
    currentBody: clause.body,
    currentVersion: clause.metadata.version,
    metadata: {
        sourceVersion: clause.metadata.version,
        author: clause.metadata.author,
        legalReview: clause.metadata.legalReview,
        createdAt: clause.metadata.createdAt,
        updatedAt: clause.metadata.updatedAt
    },
    revisions: [buildInitialRevision(clause)]
});

const clauseMatchesSignal = (clause: PolicyClause, signal: PolicySignal): boolean => {
    return clause.tags.some((tag) => signal.tags.includes(tag.toLowerCase()));
};

const identifySignals = (readinessScores: ReadinessScores, quickWins: QuickWin[]): PolicySignal[] => {
    const signals: PolicySignal[] = [];

    const policyScore = clamp((readinessScores.aips?.score ?? 0) * 100);
    if (policyScore < 70) {
        signals.push({
            key: 'policy-framework',
            reason: `Policy & Ethics readiness is ${policyScore}/100, indicating gaps in institutional guardrails.`,
            tags: ['policy', 'governance', 'ethics'],
            weight: 24
        });
    }

    const policyFactors = readinessScores.aips?.factors || {};
    const governanceScore = clamp(policyFactors.policyFramework ?? policyScore);
    if (governanceScore < 65) {
        signals.push({
            key: 'governance',
            reason: `Governance structures are scoring ${governanceScore}/100, suggesting the need for clearer oversight.`,
            tags: ['governance', 'committee', 'oversight'],
            weight: 18
        });
    }

    const privacyScore = clamp(policyFactors.privacyProtection ?? policyScore);
    if (privacyScore < 70) {
        signals.push({
            key: 'privacy',
            reason: `Privacy and data protection indicators are at ${privacyScore}/100, prioritizing FERPA/COPPA aligned clauses.`,
            tags: ['privacy', 'ferpa', 'coppa', 'data'],
            weight: 20
        });
    }

    const complianceScore = clamp(policyFactors.regulatoryCompliance ?? policyScore);
    if (complianceScore < 70) {
        signals.push({
            key: 'compliance',
            reason: `Regulatory compliance readiness is ${complianceScore}/100, so explicit compliance language is recommended.`,
            tags: ['compliance', 'regulation', 'legal'],
            weight: 16
        });
    }

    const aimsFactors = readinessScores.aims?.factors || {};
    const projectGovernance = clamp(aimsFactors.projectGovernance ?? 0);
    if (projectGovernance < 60) {
        signals.push({
            key: 'project-governance',
            reason: `Implementation governance is ${projectGovernance}/100, highlighting a need for structured oversight clauses.`,
            tags: ['governance', 'committee', 'risk-assessment'],
            weight: 14
        });
    }

    const changeManagement = clamp(aimsFactors.changeManagement ?? 0);
    if (changeManagement < 60) {
        signals.push({
            key: 'change-management',
            reason: `Change management readiness is ${changeManagement}/100, so training and communication clauses should be emphasized.`,
            tags: ['training', 'education', 'communication'],
            weight: 12
        });
    }

    const quickWinSignals = quickWins
        .filter((win) => /policy|governance|compliance|privacy|ethics/i.test(win.title + win.description))
        .map<PolicySignal>((win) => ({
            key: `quickwin-${win.title}`,
            reason: `Quick win "${win.title}" references policy or compliance gaps.`,
            tags: ['policy', 'governance', 'compliance'],
            weight: 10
        }));

    signals.push(...quickWinSignals);

    return signals;
};

const scoreTemplateAgainstSignals = (templateClauseIds: string[], signals: PolicySignal[]): { score: number; reasons: string[] } => {
    const includedClauses = templateClauseIds
        .map((id) => POLICY_CLAUSES.find((clause) => clause.id === id))
        .filter((clause): clause is PolicyClause => Boolean(clause));

    if (includedClauses.length === 0) {
        return { score: 0, reasons: [] };
    }

    let score = 45; // baseline alignment value for matched audience
    const reasons: string[] = [];

    signals.forEach((signal) => {
        const hasMatch = includedClauses.some((clause) => clauseMatchesSignal(clause, signal));
        if (hasMatch) {
            score += signal.weight;
            reasons.push(signal.reason);
        }
    });

    return {
        score: clamp(score),
        reasons: Array.from(new Set(reasons))
    };
};

export class PolicyRecommender {
    buildRecommendations({ goals, assessment, readinessScores, quickWins }: PolicyRecommendationContext): BlueprintPolicyRecommendation[] {
        const audience = determineAudience(assessment, goals);
        const relevantTemplates = POLICY_TEMPLATES.filter((template) => template.audience === audience);

        if (!relevantTemplates.length) {
            return [];
        }

        const signals = identifySignals(readinessScores, quickWins || []);

        const rankedTemplates = relevantTemplates
            .map((template) => {
                const { score, reasons } = scoreTemplateAgainstSignals(template.clauses, signals);
                return {
                    template,
                    score: Math.max(score, 55), // ensure baseline recommendation for matching audience
                    reasons: reasons.length > 0 ? reasons : [
                        'Provides core policy coverage aligned to your institution type.',
                        'Ensures foundational governance and compliance language is present.'
                    ]
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        const recommendations: BlueprintPolicyRecommendation[] = rankedTemplates.map(({ template, score, reasons }) => {
            const clauses = template.clauses
                .map((clauseId) => POLICY_CLAUSES.find((clause) => clause.id === clauseId))
                .filter((clause): clause is PolicyClause => Boolean(clause))
                .map(createClauseDraft);

            return {
                templateId: template.id,
                templateName: template.name,
                templateVersion: template.version,
                audience: template.audience,
                jurisdiction: template.jurisdiction,
                matchScore: score,
                matchReasons: reasons,
                status: 'recommended' as RecommendationStatus,
                lastEvaluatedAt: new Date().toISOString(),
                clauses
            };
        });

        return recommendations;
    }
}
