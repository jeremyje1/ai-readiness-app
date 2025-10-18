import { NextResponse } from 'next/server'

import PolicyUpdatesService from '@/lib/services/policy-updates'

export const runtime = 'nodejs'

type RefreshPayload = {
    dryRun?: boolean
    dry_run?: boolean
    forceRedlines?: boolean
    force_redlines?: boolean
}

const headerName = 'x-cron-secret'

function getCronSecretFromHeaders(request: Request): string | null {
    const explicitHeader = request.headers.get(headerName)
    if (explicitHeader) {
        return explicitHeader.trim()
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
        return null
    }

    const bearerMatch = authHeader.match(/^Bearer\s+(.*)$/i)
    return bearerMatch ? bearerMatch[1].trim() : authHeader.trim()
}

export async function POST(request: Request) {
    try {
        const cronSecret = process.env.CRON_SECRET?.trim()
        if (!cronSecret) {
            console.error('❌ CRON_SECRET env var missing')
            return NextResponse.json({
                success: false,
                error: 'Server misconfiguration'
            }, { status: 500 })
        }

        const providedSecret = getCronSecretFromHeaders(request)
        if (!providedSecret || providedSecret !== cronSecret) {
            console.error('❌ Unauthorized policy updates request')
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 })
        }

        let payload: RefreshPayload = {}
        const contentType = request.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
            try {
                payload = await request.json()
            } catch (error) {
                console.warn('⚠️ Failed to parse refresh payload, defaulting to empty object', error)
            }
        }

        const dryRunFlag = payload.dryRun ?? payload.dry_run
        const forceRedlinesFlag = payload.forceRedlines ?? payload.force_redlines

        const dryRun = typeof dryRunFlag === 'boolean'
            ? dryRunFlag
            : process.env.POLICY_UPDATES_DRY_RUN === 'true'

        const forceRedlines = typeof forceRedlinesFlag === 'boolean'
            ? forceRedlinesFlag
            : false

        const service = new PolicyUpdatesService({
            featureFlags: {
                policy_updates_auto_redline: forceRedlines || process.env.POLICY_UPDATES_AUTO_REDLINE === 'true',
                policy_updates_notifications: process.env.POLICY_UPDATES_NOTIFICATIONS === 'true',
                policy_updates_dry_run: dryRun
            }
        })

        const result = await service.runPolicyUpdateJob()
        const status = result.success ? 200 : 500

        return NextResponse.json({
            success: result.success,
            dryRun,
            forceRedlines,
            jobId: result.jobId,
            frameworksChecked: result.frameworksChecked,
            changesDetected: result.changesDetected.length,
            redlinePacksGenerated: result.redlinePacksGenerated.length,
            notificationsSent: result.notificationsSent.length,
            processingTime: result.processingTime,
            errors: result.errors
        }, { status })

    } catch (error) {
        console.error('❌ Policy updates refresh failed', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}