import { NextRequest, NextResponse } from 'next/server'
import { PolicyUpdatesService } from '@/lib/services/policy-updates'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest) {
  const headerSecret = req.headers.get('x-cron-secret')
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return headerSecret === secret
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🔄 Starting policy updates refresh job')
    
    const policyUpdatesService = new PolicyUpdatesService()
    const result = await policyUpdatesService.runPolicyUpdateJob()

    console.log('✅ Policy updates job completed:', {
      success: result.success,
      frameworks: result.frameworksChecked,
      changes: result.changesDetected.length,
      redlines: result.redlinePacksGenerated.length,
      notifications: result.notificationsSent.length,
      errors: result.errors.length,
      duration: `${result.processingTime}ms`
    })

    return NextResponse.json({
      success: result.success,
      jobId: result.jobId,
      summary: {
        frameworksChecked: result.frameworksChecked,
        changesDetected: result.changesDetected.length,
        redlinePacksGenerated: result.redlinePacksGenerated.length,
        notificationsSent: result.notificationsSent.length,
        processingTime: result.processingTime
      },
      errors: result.errors,
      changes: result.changesDetected.map(change => ({
        framework: change.frameworkId,
        version: change.version,
        title: change.title,
        impact: change.impactLevel,
        requiresRedline: change.requiresRedline
      })),
      redlinePacks: result.redlinePacksGenerated.map(pack => ({
        id: pack.id,
        policyId: pack.policyId,
        changesCount: pack.changes.length,
        approvers: pack.approvers.length,
        status: pack.status
      }))
    })

  } catch (error) {
    console.error('Policy updates job failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return job status/health check
  return NextResponse.json({
    jobName: 'policy-updates:refresh',
    description: 'Checks framework/version metadata and generates redline packs for affected policies',
    featureFlags: {
      policy_updates_auto_redline: process.env.POLICY_UPDATES_AUTO_REDLINE === 'true',
      policy_updates_notifications: process.env.POLICY_UPDATES_NOTIFICATIONS === 'true',
      policy_updates_dry_run: process.env.POLICY_UPDATES_DRY_RUN === 'true'
    },
    lastRun: 'Not implemented - would fetch from database',
    nextRun: 'Scheduled via GitHub Actions',
    status: 'active'
  })
}
