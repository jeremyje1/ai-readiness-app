import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' as any })
  : (null as unknown as Stripe)

export async function GET(_req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Pricing not configured' },
        { status: 500 }
      )
    }

    // New canonical envs (fallback to legacy names for compatibility)
    const TEAM_MONTHLY = process.env.STRIPE_PRICE_AI_BLUEPRINT_TEAM_MONTHLY
      || process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_MONTHLY
      || ''
    const TEAM_YEARLY = process.env.STRIPE_PRICE_AI_BLUEPRINT_TEAM_YEARLY
      || process.env.STRIPE_PRICE_AI_READINESS_COMPLETE_YEARLY
      || ''

    const SELF_SERVE = process.env.STRIPE_PRICE_AI_BLUEPRINT_SELF_SERVE_ONETIME || ''
    const BOARD_READY = process.env.STRIPE_PRICE_AI_BLUEPRINT_BOARD_READY_PRO_ONETIME || ''
    const ENTERPRISE = process.env.STRIPE_PRICE_AI_BLUEPRINT_ENTERPRISE_PROGRAM_ONETIME || ''

    // Fetch what we can; skip missing
    const fetchPrice = async (id: string) => (id ? await stripe.prices.retrieve(id) : null)

    const [teamMonthly, teamYearly, selfServe, boardReady, enterprise] = await Promise.all([
      fetchPrice(TEAM_MONTHLY),
      fetchPrice(TEAM_YEARLY),
      fetchPrice(SELF_SERVE),
      fetchPrice(BOARD_READY),
      fetchPrice(ENTERPRISE),
    ])

    return NextResponse.json({
      // Back-compat top-level for pages expecting monthly/yearly (Team)
      monthly: teamMonthly
        ? {
            id: teamMonthly.id,
            unit_amount: teamMonthly.unit_amount ?? null,
            currency: teamMonthly.currency,
            recurring: teamMonthly.recurring || null,
          }
        : null,
      yearly: teamYearly
        ? {
            id: teamYearly.id,
            unit_amount: teamYearly.unit_amount ?? null,
            currency: teamYearly.currency,
            recurring: teamYearly.recurring || null,
          }
        : null,

      // Expanded pricing structure
      team: {
        monthly: teamMonthly
          ? {
              id: teamMonthly.id,
              unit_amount: teamMonthly.unit_amount ?? null,
              currency: teamMonthly.currency,
              recurring: teamMonthly.recurring || null,
            }
          : null,
        yearly: teamYearly
          ? {
              id: teamYearly.id,
              unit_amount: teamYearly.unit_amount ?? null,
              currency: teamYearly.currency,
              recurring: teamYearly.recurring || null,
            }
          : null,
      },
      selfServeAssessment: selfServe
        ? {
            id: selfServe.id,
            unit_amount: selfServe.unit_amount ?? null,
            currency: selfServe.currency,
            type: 'one_time',
          }
        : null,
      boardReadyPro: boardReady
        ? {
            id: boardReady.id,
            unit_amount: boardReady.unit_amount ?? null,
            currency: boardReady.currency,
            type: 'one_time',
          }
        : null,
      enterpriseReadinessProgram: enterprise
        ? {
            id: enterprise.id,
            unit_amount: enterprise.unit_amount ?? null,
            currency: enterprise.currency,
            type: 'one_time',
          }
        : null,
    })
  } catch (err) {
    console.error('Unified pricing API error', err)
    return NextResponse.json(
      { error: 'Failed to load pricing' },
      { status: 500 }
    )
  }
}
