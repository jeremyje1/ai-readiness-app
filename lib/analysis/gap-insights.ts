export type DomainKey = 'govern' | 'map' | 'measure' | 'manage';

export interface DomainInsight {
    key: DomainKey;
    label: string;
    score: number;
    recommendation?: string | null;
    gaps?: string[] | null;
}

export interface RecommendationInsight {
    id?: string;
    title: string;
    category?: string;
    description?: string;
    priority?: string;
}

export interface GapInsightInput {
    overallScore: number;
    domains: DomainInsight[];
    recommendations?: RecommendationInsight[];
    quickWins?: string[] | null;
}

export interface RiskHotspot {
    id: string;
    pillar: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    severityLabel: string;
    riskStatement: string;
    likelihood: 'Almost certain' | 'Likely' | 'Possible' | 'Unlikely';
    impact: 'Severe' | 'High' | 'Moderate' | 'Low';
    recommendedMitigation: string;
    nistReference: string;
    score: number;
}

export interface NistAlignmentInsight {
    id: string;
    function: string;
    score: number;
    status: 'optimized' | 'progressing' | 'attention' | 'critical';
    statusLabel: string;
    requirement: string;
    guidance: string;
    priority: 'Monitor quarterly' | 'Plan next quarter' | 'Address within 60 days' | 'Immediate action';
}

interface DomainDefinition {
    pillar: string;
    riskFocus: string;
    defaultMitigation: string;
    nistReference: string;
    requirement: string;
    guidance: string;
}

const DOMAIN_DEFINITIONS: Record<DomainKey, DomainDefinition> = {
    govern: {
        pillar: 'Govern',
        riskFocus: 'unclear accountability and oversight for AI initiatives',
        defaultMitigation: 'Stand up a cross-functional AI governance council, document decision rights, and publish an escalation path for AI issues.',
        nistReference: 'NIST AI RMF: Govern (GV 1.1, GV 2.3)',
        requirement: 'Establish roles, responsibilities, and accountability for AI use (GV 2)',
        guidance: 'Document a governance charter, assign accountable leaders, and integrate AI policy reviews into executive routines.'
    },
    map: {
        pillar: 'Map',
        riskFocus: 'limited visibility into AI use cases, data flows, and stakeholders',
        defaultMitigation: 'Inventory critical AI use cases, map data inputs/outputs, and socialize business owner responsibilities.',
        nistReference: 'NIST AI RMF: Map (MP 1.1, MP 2.2)',
        requirement: 'Maintain an authoritative inventory of AI use cases and context (MP 1)',
        guidance: 'Launch an enterprise AI inventory workshop, capture system purpose, data lineage, and user impact, and update quarterly.'
    },
    measure: {
        pillar: 'Measure',
        riskFocus: 'insufficient monitoring of AI performance, bias, and drift',
        defaultMitigation: 'Define key risk indicators, implement bias/performance checks, and automate alerting into quality processes.',
        nistReference: 'NIST AI RMF: Measure (ME 3.1, ME 4.2)',
        requirement: 'Continuously evaluate AI systems for validity, reliability, and harms (ME 3)',
        guidance: 'Stand up ongoing model QA with fairness metrics, stress testing, and reporting dashboards to leadership.'
    },
    manage: {
        pillar: 'Manage',
        riskFocus: 'gaps in incident response, change management, and stakeholder communications',
        defaultMitigation: 'Create AI incident playbooks, align with legal/comms, and rehearse response scenarios with affected teams.',
        nistReference: 'NIST AI RMF: Manage (MA 2.3, MA 3.1)',
        requirement: 'Establish processes to respond to and recover from AI incidents (MA 3)',
        guidance: 'Develop an AI-specific incident response plan, define trigger thresholds, and run tabletop exercises with stakeholders.'
    }
};

const severityFromScore = (score: number) => {
    if (score <= 35) return { level: 'critical' as const, label: 'Critical' };
    if (score <= 55) return { level: 'high' as const, label: 'High' };
    if (score <= 70) return { level: 'medium' as const, label: 'Medium' };
    return { level: 'low' as const, label: 'Low' };
};

const likelihoodFromSeverity = (level: RiskHotspot['severity']): RiskHotspot['likelihood'] => {
    switch (level) {
        case 'critical':
            return 'Almost certain';
        case 'high':
            return 'Likely';
        case 'medium':
            return 'Possible';
        default:
            return 'Unlikely';
    }
};

const impactFromSeverity = (level: RiskHotspot['severity']): RiskHotspot['impact'] => {
    switch (level) {
        case 'critical':
            return 'Severe';
        case 'high':
            return 'High';
        case 'medium':
            return 'Moderate';
        default:
            return 'Low';
    }
};

const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const sanitizeScore = (score?: number) => {
    if (typeof score !== 'number' || Number.isNaN(score)) return 0;
    return clampValue(Math.round(score), 0, 100);
};

const clampScore = (score: number) => clampValue(Math.round(score), 0, 100);

export function buildRiskHotspots(input: GapInsightInput): RiskHotspot[] {
    const domainsByKey: Partial<Record<DomainKey, DomainInsight>> = {};
    input.domains.forEach((domain) => {
        domainsByKey[domain.key] = domain;
    });

    const hotspots: RiskHotspot[] = [];

    (Object.keys(DOMAIN_DEFINITIONS) as DomainKey[]).forEach((key) => {
        const meta = DOMAIN_DEFINITIONS[key];
        const domain = domainsByKey[key];
        const rawScore = sanitizeScore(domain?.score ?? input.overallScore);
        const severity = severityFromScore(rawScore);

        if (severity.level === 'low') {
            return;
        }

        const recommendation = domain?.recommendation && domain.recommendation.trim().length > 0
            ? domain.recommendation
            : input.quickWins?.find((win) => win?.toLowerCase().includes(meta.pillar.toLowerCase())) ??
            input.recommendations?.find((rec) => rec.category?.toLowerCase().includes(meta.pillar.toLowerCase()))?.title ??
            meta.defaultMitigation;

        hotspots.push({
            id: `risk-${key}`,
            pillar: meta.pillar,
            severity: severity.level,
            severityLabel: severity.label,
            riskStatement: `Low ${meta.pillar.toLowerCase()} scores indicate ${meta.riskFocus}.`,
            likelihood: likelihoodFromSeverity(severity.level),
            impact: impactFromSeverity(severity.level),
            recommendedMitigation: recommendation || meta.defaultMitigation,
            nistReference: meta.nistReference,
            score: rawScore
        });
    });

    if (hotspots.length === 0) {
        // Provide a proactive risk based on the lowest scoring domain (or overall score)
        const fallbackDomain = [...(Object.values(domainsByKey) as DomainInsight[])].sort(
            (a, b) => sanitizeScore(a?.score) - sanitizeScore(b?.score)
        )[0];
        if (fallbackDomain) {
            const meta = DOMAIN_DEFINITIONS[fallbackDomain.key];
            hotspots.push({
                id: `risk-${fallbackDomain.key}`,
                pillar: meta.pillar,
                severity: 'medium',
                severityLabel: 'Medium',
                riskStatement: `Monitor ${meta.pillar.toLowerCase()} practices to prevent ${meta.riskFocus}.`,
                likelihood: 'Possible',
                impact: 'Moderate',
                recommendedMitigation: fallbackDomain.recommendation || meta.defaultMitigation,
                nistReference: meta.nistReference,
                score: sanitizeScore(fallbackDomain.score)
            });
        } else {
            hotspots.push({
                id: 'risk-overall',
                pillar: 'AI Governance',
                severity: 'medium',
                severityLabel: 'Medium',
                riskStatement: 'Continue maturing AI governance to prevent unmanaged risk exposure.',
                likelihood: 'Possible',
                impact: 'Moderate',
                recommendedMitigation: 'Refresh your AI risk register and align mitigation owners for the next quarter.',
                nistReference: 'NIST AI RMF: Govern & Manage',
                score: clampScore(input.overallScore)
            });
        }
    }

    return hotspots.sort((a, b) => a.score - b.score);
}

export function buildNistAlignment(input: GapInsightInput): NistAlignmentInsight[] {
    const insights: NistAlignmentInsight[] = [];
    const domainsByKey: Partial<Record<DomainKey, DomainInsight>> = {};
    input.domains.forEach((domain) => {
        domainsByKey[domain.key] = domain;
    });

    (Object.keys(DOMAIN_DEFINITIONS) as DomainKey[]).forEach((key) => {
        const meta = DOMAIN_DEFINITIONS[key];
        const domain = domainsByKey[key];
        const rawScore = sanitizeScore(domain?.score ?? input.overallScore);

        let status: NistAlignmentInsight['status'];
        let statusLabel: string;
        let priority: NistAlignmentInsight['priority'];

        if (rawScore >= 85) {
            status = 'optimized';
            statusLabel = 'Optimized';
            priority = 'Monitor quarterly';
        } else if (rawScore >= 70) {
            status = 'progressing';
            statusLabel = 'Progressing';
            priority = 'Plan next quarter';
        } else if (rawScore >= 50) {
            status = 'attention';
            statusLabel = 'Needs Attention';
            priority = 'Address within 60 days';
        } else {
            status = 'critical';
            statusLabel = 'Critical Gap';
            priority = 'Immediate action';
        }

        const guidance = domain?.recommendation && domain.recommendation.trim().length > 0
            ? domain.recommendation
            : meta.guidance;

        insights.push({
            id: `nist-${key}`,
            function: meta.pillar,
            score: rawScore,
            status,
            statusLabel,
            requirement: meta.requirement,
            guidance,
            priority
        });
    });

    return insights.sort((a, b) => a.score - b.score);
}
