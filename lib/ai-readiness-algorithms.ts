// AI Readiness Algorithm Suite (AIRIX Framework)
// Provides AI-specific readiness indices for blueprint generation
import type { AlgorithmInputResponse, AlgorithmScoreDetail } from '../types/algorithm';

export interface AIReadinessMetrics {
    airix: AlgorithmScoreDetail; // Overall AI Readiness Index
    airs: AlgorithmScoreDetail;  // AI Infrastructure & Resources Score
    aics: AlgorithmScoreDetail;  // AI Capability & Competence Score
    aims: AlgorithmScoreDetail;  // AI Implementation Maturity Score
    aips: AlgorithmScoreDetail;  // AI Policy & Ethics Score
    aibs: AlgorithmScoreDetail;  // AI Benefits Score
}

// Utility functions
function clamp01(n: number): number { return isFinite(n) ? Math.min(1, Math.max(0, n)) : 0; }
function clamp0100(n: number): number { return isFinite(n) ? Math.min(100, Math.max(0, n)) : 0; }

// Convert Likert (1-5) to 0-1 scale
function likertTo01(v: any): number {
    const num = Number(v);
    if (!isFinite(num)) return 0.5; // neutral fallback
    return clamp01((num - 1) / 4);
}

// Convert Likert (1-5) to 0-100 scale
function likertTo0100(v: any): number {
    return likertTo01(v) * 100;
}

function average(values: number[]): number {
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

// Extract responses by category/tag
function getResponsesByCategory(responses: AlgorithmInputResponse[], keywords: RegExp | string[]): AlgorithmInputResponse[] {
    const keywordList = Array.isArray(keywords) ? keywords : [];
    const regex = keywords instanceof RegExp ? keywords : null;

    return responses.filter(r => {
        const text = `${r.prompt || ''} ${r.section || ''} ${r.tags?.join(' ') || ''}`.toLowerCase();
        if (regex) return regex.test(text);
        return keywordList.some(kw => text.includes(kw.toLowerCase()));
    });
}

// 1. AI Infrastructure & Resources Score (AIRS)
// Measures data, infrastructure, and digital resources readiness
function computeAIRS(responses: AlgorithmInputResponse[]): AlgorithmScoreDetail {
    const dataResponses = getResponsesByCategory(responses, ['data', 'database', 'storage', 'quality', 'integration']);
    const infraResponses = getResponsesByCategory(responses, ['infrastructure', 'cloud', 'compute', 'network', 'hardware']);
    const digitalResponses = getResponsesByCategory(responses, ['digital', 'software', 'platform', 'tools', 'systems']);

    const factors: Record<string, number> = {
        dataReadiness: average(dataResponses.map(r => likertTo0100(r.value))),
        infrastructureCapability: average(infraResponses.map(r => likertTo0100(r.value))),
        digitalResources: average(digitalResponses.map(r => likertTo0100(r.value))),
    };

    // Weighted average: Data (40%), Infrastructure (35%), Digital Resources (25%)
    const overallScore = clamp0100(
        factors.dataReadiness * 0.4 +
        factors.infrastructureCapability * 0.35 +
        factors.digitalResources * 0.25
    );

    return { overallScore, factors };
}

// 2. AI Capability & Competence Score (AICS)
// Measures staff digital and analytical competence
function computeAICS(responses: AlgorithmInputResponse[]): AlgorithmScoreDetail {
    const staffResponses = getResponsesByCategory(responses, ['staff', 'skills', 'training', 'competence', 'expertise']);
    const analyticalResponses = getResponsesByCategory(responses, ['analytical', 'analysis', 'metrics', 'insights', 'data science']);
    const digitalSkillsResponses = getResponsesByCategory(responses, ['digital skills', 'technology', 'ai knowledge', 'ml understanding']);

    const factors: Record<string, number> = {
        staffCompetence: average(staffResponses.map(r => likertTo0100(r.value))),
        analyticalCapability: average(analyticalResponses.map(r => likertTo0100(r.value))),
        digitalSkills: average(digitalSkillsResponses.map(r => likertTo0100(r.value))),
    };

    const overallScore = clamp0100(average(Object.values(factors)));
    return { overallScore, factors };
}

// 3. AI Implementation Maturity Score (AIMS)
// Measures project governance and change management readiness
function computeAIMS(responses: AlgorithmInputResponse[]): AlgorithmScoreDetail {
    const governanceResponses = getResponsesByCategory(responses, ['governance', 'project', 'management', 'oversight', 'steering']);
    const changeResponses = getResponsesByCategory(responses, ['change', 'adoption', 'transformation', 'readiness']);
    const maturityResponses = getResponsesByCategory(responses, ['maturity', 'pilot', 'scale', 'production', 'implementation']);

    const factors: Record<string, number> = {
        projectGovernance: average(governanceResponses.map(r => likertTo0100(r.value))),
        changeManagement: average(changeResponses.map(r => likertTo0100(r.value))),
        implementationPhase: average(maturityResponses.map(r => likertTo0100(r.value))),
    };

    // Adjust score based on implementation phase (pilot = 0.7x, scale = 1.0x)
    const phaseMultiplier = factors.implementationPhase < 50 ? 0.7 : 1.0;
    const baseScore = average([factors.projectGovernance, factors.changeManagement]);
    const overallScore = clamp0100(baseScore * phaseMultiplier);

    return { overallScore, factors };
}

// 4. AI Policy & Ethics Score (AIPS)
// Measures governance, bias mitigation, privacy, and compliance
function computeAIPS(responses: AlgorithmInputResponse[]): AlgorithmScoreDetail {
    const policyResponses = getResponsesByCategory(responses, ['policy', 'governance', 'guidelines', 'framework']);
    const ethicsResponses = getResponsesByCategory(responses, ['ethics', 'bias', 'fairness', 'responsible']);
    const privacyResponses = getResponsesByCategory(responses, ['privacy', 'security', 'data protection', 'confidential']);
    const complianceResponses = getResponsesByCategory(responses, ['compliance', 'regulation', 'legal', 'audit']);

    const factors: Record<string, number> = {
        policyFramework: average(policyResponses.map(r => likertTo0100(r.value))),
        ethicalPractices: average(ethicsResponses.map(r => likertTo0100(r.value))),
        privacyProtection: average(privacyResponses.map(r => likertTo0100(r.value))),
        regulatoryCompliance: average(complianceResponses.map(r => likertTo0100(r.value))),
    };

    // Higher scores indicate better policies (inverse of risk)
    // Formula: (5 - avg_risk_score) × 20 to penalize high risk
    const avgRisk = average(Object.values(factors).map(v => (100 - v) / 20)); // Convert to 1-5 risk scale
    const overallScore = clamp0100((5 - avgRisk) * 20);

    return { overallScore, factors };
}

// 5. AI Benefits Score (AIBS)
// Measures expected ROI and service improvement vs risks
function computeAIBS(responses: AlgorithmInputResponse[]): AlgorithmScoreDetail {
    const benefitResponses = getResponsesByCategory(responses, ['benefit', 'roi', 'value', 'improvement', 'efficiency']);
    const riskResponses = getResponsesByCategory(responses, ['risk', 'challenge', 'concern', 'barrier']);
    const potentialResponses = getResponsesByCategory(responses, ['potential', 'opportunity', 'growth', 'innovation']);

    const benefits = average(benefitResponses.map(r => likertTo0100(r.value)));
    const risks = average(riskResponses.map(r => likertTo0100(r.value)));
    const potential = average(potentialResponses.map(r => likertTo0100(r.value))) || 100; // Default to 100 if no potential responses

    const factors: Record<string, number> = {
        expectedBenefits: benefits,
        identifiedRisks: risks,
        realizationPotential: potential,
    };

    // Formula: (benefits - risks) ÷ potential × 100
    // Note: For enterprise tiers, this could include Monte Carlo simulation
    const netBenefit = Math.max(0, benefits - risks);
    const overallScore = clamp0100((netBenefit / potential) * 100);

    return { overallScore, factors };
}

// Main function to calculate all AI readiness metrics
export async function calculateAIReadinessMetrics(assessmentData: any): Promise<AIReadinessMetrics> {
    // Extract responses from assessment data
    const responses = extractResponses(assessmentData);

    // Calculate individual scores
    const airs = computeAIRS(responses);
    const aics = computeAICS(responses);
    const aims = computeAIMS(responses);
    const aips = computeAIPS(responses);
    const aibs = computeAIBS(responses);

    // Calculate AIRIX (overall AI Readiness Index) as weighted average
    const weights = {
        airs: 0.25,  // Infrastructure is foundational
        aics: 0.20,  // Capability is important
        aims: 0.20,  // Maturity affects success
        aips: 0.20,  // Policy/Ethics is critical
        aibs: 0.15   // Benefits realization
    };

    const airixScore = clamp0100(
        airs.overallScore * weights.airs +
        aics.overallScore * weights.aics +
        aims.overallScore * weights.aims +
        aips.overallScore * weights.aips +
        aibs.overallScore * weights.aibs
    );

    const airix: AlgorithmScoreDetail = {
        overallScore: airixScore,
        factors: {
            infrastructure: airs.overallScore,
            capability: aics.overallScore,
            maturity: aims.overallScore,
            policy: aips.overallScore,
            benefits: aibs.overallScore
        }
    };

    return {
        airix,
        airs,
        aics,
        aims,
        aips,
        aibs
    };
}

// Helper function to extract responses from various assessment data formats
function extractResponses(assessmentData: any): AlgorithmInputResponse[] {
    if (!assessmentData) return [];

    // Handle array of responses
    if (Array.isArray(assessmentData)) {
        return assessmentData;
    }

    // Handle responses property
    if (assessmentData.responses) {
        if (Array.isArray(assessmentData.responses)) {
            return assessmentData.responses;
        }
        if (typeof assessmentData.responses === 'object') {
            return Object.values(assessmentData.responses);
        }
    }

    // Handle assessment_responses property (from database)
    if (assessmentData.assessment_responses) {
        if (Array.isArray(assessmentData.assessment_responses)) {
            return assessmentData.assessment_responses;
        }
    }

    return [];
}