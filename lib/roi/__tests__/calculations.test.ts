import { describe, expect, it } from 'vitest';
import { calculateRoiMetrics, generateProposalMarkdown, RoiAssumptions } from '../calculations';

const baseAssumptions: RoiAssumptions = {
    staffCount: 25,
    hoursSavedPerWeek: 3.5,
    hourlyRate: 48,
    aiToolsCost: 34000,
    trainingCost: 12000,
    changeManagementCost: 8500,
    additionalRevenue: 15000,
    studentImpactScore: 4.2,
    fundingGoal: 50000,
};

describe('calculateRoiMetrics', () => {
    it('computes ROI metrics with positive benefit', () => {
        const results = calculateRoiMetrics(baseAssumptions);

        expect(results.weeklyHoursSaved).toBe(87.5);
        expect(results.annualHoursSaved).toBe(4550);
        expect(results.annualLaborSavings).toBe(218400);
        expect(results.totalInvestment).toBe(54500);
        expect(results.totalBenefits).toBe(233400);
        expect(results.netAnnualBenefit).toBe(178900);
        expect(results.roiPercentage).toBeCloseTo(328.26, 2);
        expect(results.paybackMonths).toBeGreaterThan(0);
        expect(results.threeYearValue).toBe(536700);
    });

    it('handles zero investment safely', () => {
        const results = calculateRoiMetrics({
            ...baseAssumptions,
            aiToolsCost: 0,
            trainingCost: 0,
            changeManagementCost: 0,
        });

        expect(results.totalInvestment).toBe(0);
        expect(results.roiPercentage).toBe(0);
        expect(results.paybackMonths).toBeNull();
    });

    it('clamps invalid values gracefully', () => {
        const results = calculateRoiMetrics({
            ...baseAssumptions,
            staffCount: Number.POSITIVE_INFINITY,
            hoursSavedPerWeek: -10,
            hourlyRate: Number.NaN,
        });

        expect(results.weeklyHoursSaved).toBeLessThanOrEqual(10000 * 80);
        expect(results.annualHoursSaved).toBeGreaterThanOrEqual(0);
        expect(results.roiPercentage).toBeLessThanOrEqual(0);
        expect(results.paybackMonths).toBeNull();
    });
});

describe('generateProposalMarkdown', () => {
    it('produces a markdown template with key sections', () => {
        const results = calculateRoiMetrics(baseAssumptions);
        const markdown = generateProposalMarkdown({
            organizationName: 'Summit College',
            audienceLabel: 'Higher Education Leadership',
            assumptions: baseAssumptions,
            results,
        });

        expect(markdown).toContain('# AI Investment Business Case — Summit College');
        expect(markdown).toContain('## Executive Summary');
        expect(markdown).toContain('Projected ROI');
        expect(markdown).toContain('## Funding Strategy');
        expect(markdown).toContain('Three-year strategic value');
    });
});
