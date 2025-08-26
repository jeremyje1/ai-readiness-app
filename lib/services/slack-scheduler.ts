/**
 * Slack Content Scheduler
 * Manages automated posting of discussion prompts, tips, and content
 */

import { SlackAutomationService } from './slack-automation'

interface ScheduledPost {
    id: string
    type: 'discussion' | 'tip' | 'blog' | 'policy_alert' | 'celebration'
    scheduledTime: string // cron format
    enabled: boolean
    lastRun?: Date
    nextRun?: Date
}

export class SlackSchedulerService {
    private slackService: SlackAutomationService
    private schedules: ScheduledPost[]

    constructor() {
        this.slackService = new SlackAutomationService()
        this.schedules = this.getDefaultSchedules()
    }

    /**
     * Default posting schedule
     */
    private getDefaultSchedules(): ScheduledPost[] {
        return [
            {
                id: 'weekly-tip',
                type: 'tip',
                scheduledTime: '0 9 * * 1', // Monday at 9 AM
                enabled: true
            },
            {
                id: 'k12-discussion',
                type: 'discussion',
                scheduledTime: '0 10 * * 2', // Tuesday at 10 AM
                enabled: true
            },
            {
                id: 'higher-ed-discussion',
                type: 'discussion',
                scheduledTime: '0 10 * * 4', // Thursday at 10 AM
                enabled: true
            },
            {
                id: 'policy-friday',
                type: 'discussion',
                scheduledTime: '0 14 * * 5', // Friday at 2 PM
                enabled: true
            },
            {
                id: 'blog-sharing',
                type: 'blog',
                scheduledTime: '0 11 * * 3', // Wednesday at 11 AM
                enabled: true
            }
        ]
    }

    /**
     * Execute scheduled posts based on current time
     */
    async executeScheduledPosts(): Promise<void> {
        const now = new Date()

        for (const schedule of this.schedules) {
            if (!schedule.enabled) continue

            // Check if it's time to run this schedule
            if (this.shouldRunNow(schedule, now)) {
                try {
                    await this.executePost(schedule)
                    schedule.lastRun = now
                    schedule.nextRun = this.calculateNextRun(schedule.scheduledTime, now)
                    console.log(`✅ Executed scheduled post: ${schedule.id}`)
                } catch (error) {
                    console.error(`❌ Failed to execute scheduled post ${schedule.id}:`, error)
                }
            }
        }
    }

    /**
     * Execute a specific type of post
     */
    private async executePost(schedule: ScheduledPost): Promise<void> {
        switch (schedule.type) {
            case 'tip':
                await this.slackService.sendWeeklyTip()
                break

            case 'discussion':
                await this.postScheduledDiscussion(schedule.id)
                break

            case 'blog':
                await this.postCuratedContent()
                break

            case 'policy_alert':
                // This would be triggered by actual policy changes
                // For now, we'll skip unless there are real alerts
                break

            case 'celebration':
                // This would be triggered by actual assessment completions
                // For now, we'll skip unless there are real celebrations
                break
        }
    }

    /**
     * Post discussion prompts based on schedule
     */
    private async postScheduledDiscussion(scheduleId: string): Promise<void> {
        const prompts = this.slackService.getWeeklyPrompts()

        let selectedPrompt = null

        // Select appropriate prompt based on schedule
        if (scheduleId.includes('k12')) {
            selectedPrompt = prompts.find(p => p.category === 'k12')
        } else if (scheduleId.includes('higher-ed')) {
            selectedPrompt = prompts.find(p => p.category === 'higher_ed')
        } else if (scheduleId.includes('policy')) {
            selectedPrompt = prompts.find(p => p.type === 'policy_alert')
        } else {
            selectedPrompt = prompts.find(p => p.category === 'general')
        }

        if (selectedPrompt) {
            await this.slackService.sendDiscussionPrompt(selectedPrompt)
        }
    }

    /**
     * Post curated blog content
     */
    private async postCuratedContent(): Promise<void> {
        const content = this.slackService.getCuratedContent()

        // Post one piece of content randomly
        if (content.length > 0) {
            const randomContent = content[Math.floor(Math.random() * content.length)]
            await this.slackService.shareBlogPost(randomContent)
        }
    }

    /**
     * Check if a schedule should run now
     */
    private shouldRunNow(schedule: ScheduledPost, now: Date): boolean {
        // Simple check - in production you'd use a proper cron library
        const hour = now.getHours()
        const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.

        // Parse basic cron format: "0 9 * * 1" = 9 AM on Monday
        const cronParts = schedule.scheduledTime.split(' ')
        const targetHour = parseInt(cronParts[1])
        const targetDayOfWeek = parseInt(cronParts[4])

        // Check if we haven't run today already
        const lastRunToday = schedule.lastRun &&
            schedule.lastRun.toDateString() === now.toDateString()

        return !lastRunToday &&
            hour === targetHour &&
            dayOfWeek === targetDayOfWeek
    }

    /**
     * Calculate next run time (simplified)
     */
    private calculateNextRun(cronTime: string, from: Date): Date {
        const cronParts = cronTime.split(' ')
        const targetHour = parseInt(cronParts[1])
        const targetDayOfWeek = parseInt(cronParts[4])

        const nextRun = new Date(from)
        nextRun.setHours(targetHour, 0, 0, 0)

        // Find next occurrence of target day
        while (nextRun.getDay() !== targetDayOfWeek || nextRun <= from) {
            nextRun.setDate(nextRun.getDate() + 1)
        }

        return nextRun
    }

    /**
     * Manual trigger for specific content types
     */
    async triggerManualPost(type: 'tip' | 'discussion' | 'blog', category?: string): Promise<boolean> {
        try {
            switch (type) {
                case 'tip':
                    return await this.slackService.sendWeeklyTip()

                case 'discussion':
                    const prompts = this.slackService.getWeeklyPrompts()
                    const prompt = category
                        ? prompts.find(p => p.category === category)
                        : prompts[0]

                    if (prompt) {
                        return await this.slackService.sendDiscussionPrompt(prompt)
                    }
                    return false

                case 'blog':
                    const content = this.slackService.getCuratedContent()
                    if (content.length > 0) {
                        return await this.slackService.shareBlogPost(content[0])
                    }
                    return false

                default:
                    return false
            }
        } catch (error) {
            console.error('Error in manual post trigger:', error)
            return false
        }
    }

    /**
     * Get current schedule status
     */
    getScheduleStatus(): ScheduledPost[] {
        return this.schedules.map(schedule => ({
            ...schedule,
            nextRun: this.calculateNextRun(schedule.scheduledTime, new Date())
        }))
    }

    /**
     * Update schedule configuration
     */
    updateSchedule(scheduleId: string, updates: Partial<ScheduledPost>): boolean {
        const scheduleIndex = this.schedules.findIndex(s => s.id === scheduleId)

        if (scheduleIndex === -1) return false

        this.schedules[scheduleIndex] = {
            ...this.schedules[scheduleIndex],
            ...updates
        }

        return true
    }

    /**
     * Trigger celebration for assessment completion
     */
    async triggerAssessmentCelebration(institutionName: string, score: number): Promise<boolean> {
        return await this.slackService.sendAssessmentCelebration(institutionName, score)
    }

    /**
     * Trigger policy update alert
     */
    async triggerPolicyAlert(framework: string, changes: string[], severity: 'low' | 'medium' | 'high'): Promise<boolean> {
        return await this.slackService.sendPolicyAlert(framework, changes, severity)
    }

    /**
     * Trigger community highlight
     */
    async triggerCommunityHighlight(userName: string, achievement: string): Promise<boolean> {
        return await this.slackService.sendCommunityHighlight(userName, achievement)
    }
}
