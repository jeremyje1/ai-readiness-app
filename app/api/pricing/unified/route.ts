import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' as any })
  : (null as unknown as Stripe)

export async function GET(_req: NextRequest) {
  try {
    const monthlyId = process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY || ''
    const yearlyId = process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY || ''

    if (!stripe || !monthlyId || !yearlyId) {
      return NextResponse.json(
        { error: 'Pricing not configured' },
        { status: 500 }
      )
    }

    const [monthlyPrice, yearlyPrice] = await Promise.all([
      stripe.prices.retrieve(monthlyId),
      stripe.prices.retrieve(yearlyId),
    ])

    return NextResponse.json({
      monthly: {
        id: monthlyPrice.id,
        unit_amount: monthlyPrice.unit_amount ?? null,
        currency: monthlyPrice.currency,
        recurring: monthlyPrice.recurring || null,
      },
      yearly: {
        id: yearlyPrice.id,
        unit_amount: yearlyPrice.unit_amount ?? null,
        currency: yearlyPrice.currency,
        recurring: yearlyPrice.recurring || null,
      },
    })
  } catch (err) {
    console.error('Unified pricing API error', err)
    return NextResponse.json(
      { error: 'Failed to load pricing' },
      { status: 500 }
    )
  }
}
