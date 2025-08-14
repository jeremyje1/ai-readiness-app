import { NextResponse } from 'next/server'

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
  const monthly = process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY?.trim()
  const yearly = process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY?.trim()

  return NextResponse.json({
    status: 'ok',
    app: 'ai-readiness-app',
    time: new Date().toISOString(),
    routes: {
      pricingUnified: '/api/pricing/unified',
      stripeCheckout: '/api/stripe/unified-checkout',
      higherEd: '/highered-implementation',
    },
    config: {
      stripeConfigured: Boolean(stripeKey && stripeKey.startsWith('sk_')),
      pricingMonthlySet: Boolean(monthly),
      pricingYearlySet: Boolean(yearly),
    },
  })
}
