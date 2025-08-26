/**
 * Cron job endpoint for automated Slack posts
 * Can be called by Vercel Cron, GitHub Actions, or external schedulers
 */

import { SlackSchedulerService } from '@/lib/services/slack-scheduler'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    // Verify cron secret for security
    const cronSecret = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret || cronSecret !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const scheduler = new SlackSchedulerService()
        await scheduler.executeScheduledPosts()

        return NextResponse.json({
            success: true,
            message: 'Scheduled Slack posts executed',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json({
            error: 'Cron job failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    // Also support POST for GitHub Actions
    return GET(request)
}
