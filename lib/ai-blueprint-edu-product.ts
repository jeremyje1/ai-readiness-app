/**
 * AI Blueprint for Education Product Configuration
 * Single subscription offering for the EDU SaaS
 */

export interface AIBlueprintEduProduct {
    id: string;
    name: string;
    shortName: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    stripePriceIdMonthly?: string;
    stripePriceIdYearly?: string;
}

export const AI_BLUEPRINT_EDU_PRODUCT: AIBlueprintEduProduct = {
    id: 'ai-blueprint-edu',
    name: 'AI Blueprint for Education',
    shortName: 'AI Blueprint',
    description: 'Complete AI readiness assessment and implementation roadmap tailored for higher education institutions',
    monthlyPrice: 199,
    yearlyPrice: 1990, // ~17% discount
    features: [
        'Faculty AI Adoption Micro-Course',
        'Accreditation Alignment Mapping',
        'AIRIX™ Diagnostic Assessment',
        'AIRS™ Implementation Roadmap',
        'Peer Institution Benchmarking',
        'ROI Calculator & Budget Workbook',
        'Quarterly Progress Reviews',
        'Priority Email Support',
        'Classroom Setup Tools',
        'Colleague Invitation System'
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_EDU_MONTHLY_199,
    stripePriceIdYearly: process.env.STRIPE_PRICE_EDU_YEARLY_1990 // Add this env var if using yearly
};

// Helper function to get Stripe price ID based on billing period
export function getStripePriceId(billingPeriod: 'monthly' | 'yearly' = 'monthly'): string | undefined {
    return billingPeriod === 'yearly'
        ? AI_BLUEPRINT_EDU_PRODUCT.stripePriceIdYearly
        : AI_BLUEPRINT_EDU_PRODUCT.stripePriceIdMonthly;
}

// Helper to format price display
export function formatPrice(billingPeriod: 'monthly' | 'yearly' = 'monthly'): string {
    const price = billingPeriod === 'yearly'
        ? AI_BLUEPRINT_EDU_PRODUCT.yearlyPrice
        : AI_BLUEPRINT_EDU_PRODUCT.monthlyPrice;

    const period = billingPeriod === 'yearly' ? '/year' : '/mo';
    return `$${price.toLocaleString()}${period}`;
}

// Calculate savings for yearly billing
export function getYearlySavings(): number {
    const monthlyTotal = AI_BLUEPRINT_EDU_PRODUCT.monthlyPrice * 12;
    return monthlyTotal - AI_BLUEPRINT_EDU_PRODUCT.yearlyPrice;
}

// Get savings percentage
export function getYearlySavingsPercent(): number {
    const monthlyTotal = AI_BLUEPRINT_EDU_PRODUCT.monthlyPrice * 12;
    const savings = getYearlySavings();
    return Math.round((savings / monthlyTotal) * 100);
}