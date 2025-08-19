import { describe, test, expect } from 'vitest';
import { calculateEnterpriseMetrics, ALGORITHM_SUITE_VERSION } from '../lib/algorithms';

describe('Enterprise Algorithm Suite - Unit Factors', () => {
  const baseAssessment = {
    responses: [
      { prompt: 'Strategic planning is comprehensive', value: 5, tags: ['strategy'] },
      { prompt: 'Technology systems are well-integrated', value: 4, tags: ['technology'] },
      { prompt: 'Leadership drives governance clarity', value: 3, tags: ['leadership'] },
      { prompt: 'Teams collaborate effectively', value: 2, tags: ['collaboration'] },
      { prompt: 'Innovation encouraged frequently', value: 4, tags: ['innovation'] }
    ]
  };

  const baseMetrics = {
    digitalMaturity: 0.8,
    systemIntegration: 0.7,
    collaborationIndex: 0.6,
    innovationCapacity: 0.65,
    strategicAgility: 0.55,
    leadershipEffectiveness: 0.75,
    decisionLatency: 0.4, // lower better
    communicationEfficiency: 0.7,
    employeeEngagement: 0.6,
    changeReadiness: 0.5,
    futureReadiness: 0.45,
    processComplexity: 0.3, // lower better
    operationalRisk: 0.2,
    technologicalRisk: 0.25,
    cybersecurityLevel: 0.7,
    resourceUtilization: 0.65,
    taskAutomationLevel: 0.5
  };

  test('produces meta version and response count', async () => {
    const res = await calculateEnterpriseMetrics(baseAssessment, baseMetrics);
    expect(res.meta?.version).toBe(ALGORITHM_SUITE_VERSION.version);
    expect(res.meta?.responseCount).toBe(baseAssessment.responses.length);
  });

  test('DSCH emphasizes strategic & tech responses', async () => {
    const res = await calculateEnterpriseMetrics(baseAssessment, baseMetrics);
    expect(res.dsch.factors.strategicAlignment).toBeGreaterThan(0.5);
    expect(res.dsch.overallScore).toBeGreaterThan(0.5);
  });

  test('LEI inverts decision latency', async () => {
    const highLatency = { ...baseMetrics, decisionLatency: 0.9 };
    const lowLatency = { ...baseMetrics, decisionLatency: 0.1 };
    const resHigh = await calculateEnterpriseMetrics(baseAssessment, highLatency);
    const resLow = await calculateEnterpriseMetrics(baseAssessment, lowLatency);
    expect(resLow.lei.factors.decisionEfficiency).toBeGreaterThan(resHigh.lei.factors.decisionEfficiency);
  });

  test('HOCI penalizes higher risk & process complexity', async () => {
    const worse = { ...baseMetrics, processComplexity: 0.8, operationalRisk: 0.6, technologicalRisk: 0.7 };
    const better = { ...baseMetrics, processComplexity: 0.2, operationalRisk: 0.1, technologicalRisk: 0.1 };
    const resWorse = await calculateEnterpriseMetrics(baseAssessment, worse);
    const resBetter = await calculateEnterpriseMetrics(baseAssessment, better);
    expect(resBetter.hoci.overallScore).toBeGreaterThan(resWorse.hoci.overallScore);
  });
});
