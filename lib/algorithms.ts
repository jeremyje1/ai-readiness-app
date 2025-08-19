// Enterprise Algorithm Suite
// Provides calculated indices derived from assessment responses and organizational metrics.
import type { AlgorithmInputResponse, OrganizationOperationalMetrics, EnterpriseAlgorithmResult, AlgorithmScoreDetail } from '../types/algorithm';

export type AlgorithmScore = AlgorithmScoreDetail;
export type EnterpriseMetricsResult = EnterpriseAlgorithmResult;

export const ALGORITHM_SUITE_VERSION = { version: '1.0.0' };

// Utility: safely coerce to number within [0,1]
function clamp01(n: number): number { return isFinite(n) ? Math.min(1, Math.max(0, n)) : 0; }

// Convert Likert (1-5) -> 0-1 scale
function likertTo01(v: any): number {
  const num = Number(v);
  if (!isFinite(num)) return 0.5; // neutral fallback
  return clamp01((num - 1) / 4);
}

// Extract numeric metric if present (assumed already 0-1) else fallback
function pickMetric(obj: any, key: string, fallback = 0.5): number {
  if (!obj || typeof obj !== 'object') return fallback;
  const raw = obj[key];
  const n = Number(raw);
  if (!isFinite(n)) return fallback;
  // Heuristic: if appears to be >1 (e.g. 0-100 scale) normalize by 100
  if (n > 1 && n <= 100) return clamp01(n / 100);
  if (n > 100) return 1; // cap
  return clamp01(n);
}

interface AssessmentResponseLike extends AlgorithmInputResponse {}

function collectResponses(assessmentData: any): AssessmentResponseLike[] {
  if (!assessmentData) return [];
  if (Array.isArray(assessmentData.responses)) return assessmentData.responses as AssessmentResponseLike[];
  // Some datasets use object map; convert
  if (assessmentData.responses && typeof assessmentData.responses === 'object') {
    return Object.values(assessmentData.responses) as AssessmentResponseLike[];
  }
  return [];
}

function average(values: number[], fallback = 0.5): number {
  if (!values.length) return fallback;
  return clamp01(values.reduce((a, b) => a + b, 0) / values.length);
}

// 1. Digital Strategy & Capability Health (DSCH)
// Combines strategic planning, technology integration, leadership strategic alignment.
function computeDSCH(responses: AssessmentResponseLike[], metrics: OrganizationOperationalMetrics): AlgorithmScore {
  const strategyResp = responses.filter(r => /strategy|strategic/i.test(r.prompt || r.section || '') || r.tags?.includes('strategy'));
  const techResp = responses.filter(r => /tech|integration|digital/i.test(r.prompt || r.section || '') || r.tags?.includes('technology'));
  const leadershipResp = responses.filter(r => /leader|governance/i.test(r.prompt || r.section || '') || r.tags?.includes('leadership'));

  const factors: Record<string, number> = {
    strategicAlignment: average(strategyResp.map(r => likertTo01(r.value))),
    technologyIntegration: average(techResp.map(r => likertTo01(r.value))),
    leadershipSupport: average(leadershipResp.map(r => likertTo01(r.value))),
    digitalMaturity: pickMetric(metrics, 'digitalMaturity'),
    systemIntegration: pickMetric(metrics, 'systemIntegration')
  };
  const overall = average(Object.values(factors));
  return { overallScore: overall, factors };
}

// 2. Change Readiness Framework (CRF)
// Uses changeReadiness, innovationCapacity, agility, collaboration.
function computeCRF(responses: AssessmentResponseLike[], metrics: OrganizationOperationalMetrics): AlgorithmScore {
  const changeResp = responses.filter(r => /change|adapt|agile/i.test(r.prompt || '') || r.tags?.includes('change'));
  const collabResp = responses.filter(r => /collab|team/i.test(r.prompt || '') || r.tags?.includes('collaboration'));
  const innovationResp = responses.filter(r => /innovat/i.test(r.prompt || '') || r.tags?.includes('innovation'));

  const factors: Record<string, number> = {
    changePractices: average(changeResp.map(r => likertTo01(r.value))),
    collaborationIndex: pickMetric(metrics, 'collaborationIndex'),
    innovationCapacity: pickMetric(metrics, 'innovationCapacity'),
    strategicAgility: pickMetric(metrics, 'strategicAgility'),
    leadershipEffectiveness: pickMetric(metrics, 'leadershipEffectiveness')
  };
  const overall = average(Object.values(factors));
  return { overallScore: overall, factors };
}

// 3. Leadership Effectiveness Index (LEI)
// Focus on leadership scores, decision latency (inverse), governance clarity.
function computeLEI(responses: AssessmentResponseLike[], metrics: OrganizationOperationalMetrics): AlgorithmScore {
  const leadershipResp = responses.filter(r => /leader|governance|reporting/i.test(r.prompt || r.section || '') || r.tags?.includes('leadership'));
  const decisionLatency = pickMetric(metrics, 'decisionLatency'); // lower is better
  const reverseDecisionLatency = 1 - decisionLatency; // invert
  const factors: Record<string, number> = {
    leadershipPractices: average(leadershipResp.map(r => likertTo01(r.value))),
    leadershipEffectiveness: pickMetric(metrics, 'leadershipEffectiveness'),
    decisionEfficiency: reverseDecisionLatency,
    communicationEfficiency: pickMetric(metrics, 'communicationEfficiency')
  };
  const overall = average(Object.values(factors));
  return { overallScore: overall, factors };
}

// 4. Organizational Culture Index (OCI)
// Culture: engagement, collaboration, innovation, change readiness.
function computeOCI(_responses: AssessmentResponseLike[], metrics: OrganizationOperationalMetrics): AlgorithmScore {
  const factors: Record<string, number> = {
    employeeEngagement: pickMetric(metrics, 'employeeEngagement'),
    collaborationIndex: pickMetric(metrics, 'collaborationIndex'),
    innovationCapacity: pickMetric(metrics, 'innovationCapacity'),
    changeReadiness: pickMetric(metrics, 'changeReadiness'),
    futureReadiness: pickMetric(metrics, 'futureReadiness')
  };
  const overall = average(Object.values(factors));
  return { overallScore: overall, factors };
}

// 5. Hybrid Operating Capability Index (HOCI)
// Operational & tech execution: process, automation, resource utilization, system integration, risk (inverse of risk factors).
function computeHOCI(_responses: AssessmentResponseLike[], metrics: OrganizationOperationalMetrics): AlgorithmScore {
  const processComplexity = pickMetric(metrics, 'processComplexity'); // lower better -> invert
  const operationalRisk = pickMetric(metrics, 'operationalRisk'); // invert
  const technologicalRisk = pickMetric(metrics, 'technologicalRisk'); // invert
  const cybersecurityLevel = pickMetric(metrics, 'cybersecurityLevel');
  const systemIntegration = pickMetric(metrics, 'systemIntegration');
  const resourceUtilization = pickMetric(metrics, 'resourceUtilization');
  const taskAutomationLevel = pickMetric(metrics, 'taskAutomationLevel');

  const factors: Record<string, number> = {
    processEfficiency: 1 - processComplexity,
    automation: taskAutomationLevel,
    resourceUtilization,
    integration: systemIntegration,
    cybersecurity: cybersecurityLevel,
    riskMitigation: 1 - average([operationalRisk, technologicalRisk])
  };
  const overall = average(Object.values(factors));
  return { overallScore: overall, factors };
}

export async function calculateEnterpriseMetrics(assessmentData: any, orgMetrics: OrganizationOperationalMetrics): Promise<EnterpriseMetricsResult> {
  const responses = collectResponses(assessmentData);
  try {
    const dsch = computeDSCH(responses, orgMetrics);
    const crf = computeCRF(responses, orgMetrics);
    const lei = computeLEI(responses, orgMetrics);
    const oci = computeOCI(responses, orgMetrics);
    const hoci = computeHOCI(responses, orgMetrics);

    const result: EnterpriseMetricsResult = {
      dsch,
      crf,
      lei,
      oci,
      hoci,
      meta: {
        version: ALGORITHM_SUITE_VERSION.version,
        computedAt: new Date().toISOString(),
        responseCount: responses.length
      }
    };
    if (process.env.ALGORITHM_DEBUG === '1') {
      // eslint-disable-next-line no-console
      console.debug('[AlgorithmSuite] Computed metrics', JSON.stringify(result));
    }
    return result;
  } catch (err) {
    // Fail-safe: never throw inside algorithm (test expects resolve) — surface degraded scores instead.
    return {
      dsch: { overallScore: 0, factors: {}, notes: ['error computing score'] },
      crf: { overallScore: 0, factors: {}, notes: ['error computing score'] },
      lei: { overallScore: 0, factors: {}, notes: ['error computing score'] },
      oci: { overallScore: 0, factors: {}, notes: ['error computing score'] },
      hoci: { overallScore: 0, factors: {}, notes: ['error computing score'] },
      meta: { version: ALGORITHM_SUITE_VERSION.version, computedAt: new Date().toISOString(), responseCount: responses.length }
    };
  }
}

export async function persistEnterpriseMetrics(assessmentId: string, result: EnterpriseMetricsResult) {
  // Lazy import to avoid forcing env vars during pure algorithm tests
  let supabaseAdmin: any = null;
  try {
    const mod = await import('./supabase');
    supabaseAdmin = (mod as any).supabaseAdmin;
  } catch (_) {
    // ignore
  }
  if (!supabaseAdmin) {
    if (process.env.ALGORITHM_DEBUG === '1') console.warn('[AlgorithmSuite] Supabase admin not available - skip persist');
    return { skipped: true };
  }
  const record = {
    assessment_id: assessmentId,
    algorithm_version: result.meta?.version,
    computed_at: result.meta?.computedAt,
    dsch: result.dsch,
    crf: result.crf,
    lei: result.lei,
    oci: result.oci,
    hoci: result.hoci,
    raw: result
  };
  const { error } = await supabaseAdmin.from('enterprise_algorithm_results').insert(record);
  if (error) {
    console.error('[AlgorithmSuite] persist failed', error.message);
    return { success: false, error: error.message };
  }
  return { success: true, assessmentId, version: result.meta?.version };
}
