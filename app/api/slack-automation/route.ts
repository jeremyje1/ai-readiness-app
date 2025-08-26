/**
 * API endpoint for Slack automation management
 * Handles manual triggers and schedule management
 */

import { SlackSchedulerService } from '@/lib/services/slack-scheduler'
import { NextRequest, NextResponse } from 'next/server'

const scheduler = new SlackSchedulerService()

export async function POST(request: NextRequest) {
    try {
        const { action, type, category, data } = await request.json()

        switch (action) {
            case 'manual_post':
                const success = await scheduler.triggerManualPost(type, category)
                return NextResponse.json({ success, message: `Manual ${type} post triggered` })

            case 'assessment_celebration':
                if (data?.institutionName && data?.score !== undefined) {
                    const success = await scheduler.triggerAssessmentCelebration(data.institutionName, data.score)
                    return NextResponse.json({ success, message: 'Assessment celebration sent' })
                }
                return NextResponse.json({ error: 'Missing institution name or score' }, { status: 400 })

            case 'policy_alert':
                if (data?.framework && data?.changes && data?.severity) {
                    const success = await scheduler.triggerPolicyAlert(data.framework, data.changes, data.severity)
                    return NextResponse.json({ success, message: 'Policy alert sent' })
                }
                return NextResponse.json({ error: 'Missing policy alert data' }, { status: 400 })

            case 'community_highlight':
                if (data?.userName && data?.achievement) {
                    const success = await scheduler.triggerCommunityHighlight(data.userName, data.achievement)
                    return NextResponse.json({ success, message: 'Community highlight sent' })
                }
                return NextResponse.json({ error: 'Missing user name or achievement' }, { status: 400 })

            case 'update_schedule':
                if (data?.scheduleId && data?.updates) {
                    const success = scheduler.updateSchedule(data.scheduleId, data.updates)
                    return NextResponse.json({ success, message: 'Schedule updated' })
                }
                return NextResponse.json({ error: 'Missing schedule data' }, { status: 400 })

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error) {
        console.error('Slack automation API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        switch (action) {
            case 'schedule_status':
                const schedules = scheduler.getScheduleStatus()
                return NextResponse.json({ schedules })

            case 'run_scheduled':
                // This would typically be called by a cron job
                await scheduler.executeScheduledPosts()
                return NextResponse.json({ message: 'Scheduled posts executed' })

            default:
                return NextResponse.json({
                    message: 'Slack Automation API',
                    endpoints: {
                        'POST /': 'Trigger manual posts and manage schedules',
                        'GET /?action=schedule_status': 'Get current schedule status',
                        'GET /?action=run_scheduled': 'Execute scheduled posts'
                    }
                })
        }
    } catch (error) {
        console.error('Slack automation API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
