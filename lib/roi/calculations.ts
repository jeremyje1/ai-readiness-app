export interface RoiAssumptions {
    staffCount: number;
    hoursSavedPerWeek: number;
    hourlyRate: number;
    aiToolsCost: number;
    trainingCost: number;
    changeManagementCost: number;
    additionalRevenue: number;
    studentImpactScore: number;
    fundingGoal: number;
}

export interface RoiResults {
    weeklyHoursSaved: number;
    annualHoursSaved: number;
    annualLaborSavings: number;
    totalInvestment: number;
    totalBenefits: number;
    netAnnualBenefit: number;
    roiPercentage: number;
    monthlyNetBenefit: number;
    paybackMonths: number | null;
    threeYearValue: number;
}

const toNumber = (value: number): number => (Number.isFinite(value) ? value : 0);

const clamp = (value: number, min: number, max: number) => {
    if (Number.isNaN(value)) {
        return min;
    }

    return Math.min(Math.max(value, min), max);
};

export function calculateRoiMetrics(assumptions: RoiAssumptions): RoiResults {
    const staffCount = clamp(Math.round(toNumber(assumptions.staffCount)), 0, 10000);
    const hoursSavedPerWeek = clamp(toNumber(assumptions.hoursSavedPerWeek), 0, 80);
    const hourlyRate = clamp(toNumber(assumptions.hourlyRate), 0, 1000);
    const aiToolsCost = Math.max(0, toNumber(assumptions.aiToolsCost));
    const trainingCost = Math.max(0, toNumber(assumptions.trainingCost));
    const changeManagementCost = Math.max(0, toNumber(assumptions.changeManagementCost));
    const additionalRevenue = Math.max(0, toNumber(assumptions.additionalRevenue));

    const weeklyHoursSaved = staffCount * hoursSavedPerWeek;
    const annualHoursSaved = weeklyHoursSaved * 52;
    const annualLaborSavings = annualHoursSaved * hourlyRate;
    const totalInvestment = aiToolsCost + trainingCost + changeManagementCost;
    const totalBenefits = annualLaborSavings + additionalRevenue;
    const netAnnualBenefit = totalBenefits - totalInvestment;
    const monthlyNetBenefit = netAnnualBenefit / 12;

    const roiPercentage = totalInvestment > 0 ? (netAnnualBenefit / totalInvestment) * 100 : 0;
    const paybackMonths = totalInvestment > 0 && monthlyNetBenefit > 0 ? totalInvestment / monthlyNetBenefit : null;
    const threeYearValue = netAnnualBenefit * 3;

    return {
        weeklyHoursSaved,
        annualHoursSaved,
        annualLaborSavings,
        totalInvestment,
        totalBenefits,
        netAnnualBenefit,
        roiPercentage,
        monthlyNetBenefit,
        paybackMonths,
        threeYearValue,
    };
}

export interface ProposalOptions {
    organizationName?: string | null;
    audienceLabel: string;
    assumptions: RoiAssumptions;
    results: RoiResults;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: value >= 100000 ? 0 : 2,
    }).format(value);

const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(value);

const formatPercent = (value: number) =>
    `${value.toFixed(1)}%`;

export function generateProposalMarkdown({ organizationName, audienceLabel, assumptions, results }: ProposalOptions): string {
    const org = organizationName?.trim() || 'Your Organization';
    const impactDescriptor = assumptions.studentImpactScore >= 4.5
        ? 'transformative'
        : assumptions.studentImpactScore >= 3.5
            ? 'meaningful'
            : 'emerging';

    const paybackSummary = results.paybackMonths
        ? `${results.paybackMonths.toFixed(1)} months`
        : 'within the first year of implementation';

    return `# AI Investment Business Case — ${org}

## Executive Summary
- **Primary audience:** ${audienceLabel}
- **Staff impacted:** ${formatNumber(assumptions.staffCount)} team members
- **Annual labor savings:** ${formatCurrency(results.annualLaborSavings)}
- **Additional value streams:** ${formatCurrency(assumptions.additionalRevenue)}
- **Total investment required:** ${formatCurrency(results.totalInvestment)}
- **Projected ROI:** ${formatPercent(results.roiPercentage)}
- **Payback horizon:** ${paybackSummary}

This proposal outlines how ${org} can achieve ${impactDescriptor} outcomes by scaling AI-enabled workflows across critical operations.

## Problem & Opportunity
- Manual processes currently consume approximately ${formatCurrency(assumptions.staffCount * assumptions.hoursSavedPerWeek * assumptions.hourlyRate * 52)} in staff time annually.
- Stakeholders report an impact score of ${assumptions.studentImpactScore.toFixed(1)} / 5 for AI-assisted learning experiences.
- Competitive benchmarking shows peer institutions already reinvesting savings into strategic initiatives.

## Solution Overview
1. Deploy AI copilots and automation across priority departments.
2. Deliver focused enablement programming for staff to ensure adoption.
3. Establish governance and change management practices aligned to compliance requirements.

## Investment Breakdown
| Line Item | Amount |
| --- | ---: |
| AI platform licenses & integrations | ${formatCurrency(assumptions.aiToolsCost)} |
| Training & enablement | ${formatCurrency(assumptions.trainingCost)} |
| Change management & compliance | ${formatCurrency(assumptions.changeManagementCost)} |
| **Total Investment** | **${formatCurrency(results.totalInvestment)}** |

## Financial Outlook
- **Net annual benefit:** ${formatCurrency(results.netAnnualBenefit)}
- **Monthly benefit:** ${formatCurrency(results.monthlyNetBenefit)}
- **Three-year strategic value:** ${formatCurrency(results.threeYearValue)}
- Sensitivity analysis indicates ROI remains positive even with a 10% reduction in time-savings assumptions.

## Funding Strategy
- Target grant or budget allocation of ${formatCurrency(assumptions.fundingGoal)} to accelerate deployment.
- Prioritize grants focused on workforce development, digital equity, and learner success.
- Leverage savings to sustain ongoing license fees beyond year one.

## Implementation Roadmap
1. **Month 0-1:** Finalize funding, procurement, and stakeholder alignment.
2. **Month 2-3:** Run enablement cohorts and pilot automations with measurement plan.
3. **Month 4+:** Expand to additional departments, publish ROI results, and refresh governance.

## Evaluation & Reporting
- Track hours returned to staff, operational cost reduction, and learner satisfaction on a quarterly basis.
- Provide grantors with dashboards highlighting ROI performance, budget utilization, and success stories.

Prepared automatically with the AI Funding Toolkit to accelerate approvals and grant readiness.`;
}
