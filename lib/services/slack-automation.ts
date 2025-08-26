/**
 * Slack Automation Service
 * Handles automated discussion prompts, blog sharing, and community engagement
 */

interface SlackMessage {
    text?: string
    blocks?: any[]
    channel?: string
    username?: string
    icon_emoji?: string
}

interface DiscussionPrompt {
    id: string
    type: 'weekly_discussion' | 'policy_alert' | 'best_practice' | 'case_study'
    title: string
    prompt: string
    category: 'k12' | 'higher_ed' | 'general'
    scheduledFor: Date
}

interface BlogPost {
    title: string
    url: string
    summary: string
    tags: string[]
    publishedAt: Date
}

export class SlackAutomationService {
    private webhookUrl: string
    private enabled: boolean

    constructor() {
        this.webhookUrl = process.env.SLACK_WEBHOOK_URL || ''
        this.enabled = process.env.POLICY_UPDATE_SLACK_ENABLED === 'true' && !!this.webhookUrl
    }

    /**
     * Send discussion prompt to Slack channel
     */
    async sendDiscussionPrompt(prompt: DiscussionPrompt): Promise<boolean> {
        if (!this.enabled) return false

        const message: SlackMessage = {
            username: "AI Readiness Bot",
            icon_emoji: ":robot_face:",
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `💬 ${prompt.title}`,
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: prompt.prompt
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `📊 Category: *${prompt.category.toUpperCase()}* | 🏷️ Type: *${prompt.type.replace('_', ' ')}*`
                        }
                    ]
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "👆 *React with emojis to share your thoughts or reply in thread to start the discussion!*"
                    }
                }
            ]
        }

        return this.sendToSlack(message)
    }

    /**
     * Share relevant blog post or article
     */
    async shareBlogPost(post: BlogPost): Promise<boolean> {
        if (!this.enabled) return false

        const message: SlackMessage = {
            username: "AI Resources Bot",
            icon_emoji: ":newspaper:",
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "📰 New AI Readiness Resource",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${post.title}*\n\n${post.summary}`
                    },
                    accessory: {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Read Article",
                            emoji: true
                        },
                        url: post.url,
                        action_id: "read_article"
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `🏷️ Tags: ${post.tags.map(tag => `\`${tag}\``).join(' ')} | 📅 ${post.publishedAt.toLocaleDateString()}`
                        }
                    ]
                }
            ]
        }

        return this.sendToSlack(message)
    }

    /**
     * Send policy update alert
     */
    async sendPolicyAlert(framework: string, changes: string[], severity: 'low' | 'medium' | 'high'): Promise<boolean> {
        if (!this.enabled) return false

        const severityEmoji = {
            low: '💙',
            medium: '⚠️',
            high: '🚨'
        }

        const message: SlackMessage = {
            username: "Policy Monitor",
            icon_emoji: ":shield:",
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `${severityEmoji[severity]} Policy Update Alert`,
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Framework Updated:* ${framework}\n*Severity:* ${severity.toUpperCase()}`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Key Changes:*\n" + changes.map(change => `• ${change}`).join('\n')
                    }
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Review Changes",
                                emoji: true
                            },
                            url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/policy-updates`,
                            action_id: "review_changes",
                            style: severity === 'high' ? 'danger' : 'primary'
                        }
                    ]
                }
            ]
        }

        return this.sendToSlack(message)
    }

    /**
     * Send weekly AI readiness tip
     */
    async sendWeeklyTip(): Promise<boolean> {
        const tips = [
            {
                title: "Data Governance Best Practice",
                content: "Implement data classification before deploying AI tools. Knowing what data is sensitive helps determine appropriate AI usage policies."
            },
            {
                title: "Risk Assessment Tip",
                content: "Start with low-risk AI applications like grammar checking or scheduling before implementing high-risk tools like student assessment or hiring."
            },
            {
                title: "Vendor Management",
                content: "Require AI vendors to provide detailed security audits and compliance certifications. Your institution's risk is their responsibility too."
            },
            {
                title: "Policy Communication",
                content: "AI policies should be written in plain language. If staff can't understand the policy, they can't follow it effectively."
            },
            {
                title: "Training Strategy",
                content: "Create role-specific AI training. Teachers need different guidance than IT staff or administrators."
            }
        ]

        const randomTip = tips[Math.floor(Math.random() * tips.length)]

        const message: SlackMessage = {
            username: "AI Readiness Coach",
            icon_emoji: ":bulb:",
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "💡 Weekly AI Readiness Tip",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${randomTip.title}*\n\n${randomTip.content}`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "💬 How is your institution handling this? Share your experiences in the thread!"
                        }
                    ]
                }
            ]
        }

        return this.sendToSlack(message)
    }

    /**
     * Send assessment completion celebration
     */
    async sendAssessmentCelebration(institutionName: string, score: number): Promise<boolean> {
        if (!this.enabled) return false

        const message: SlackMessage = {
            username: "Assessment Bot",
            icon_emoji: ":trophy:",
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🎉 Assessment Completed!",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${institutionName}* just completed their AI Readiness Assessment!\n\n*Score: ${Math.round(score * 100)}%*`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "👏 Congratulations on taking the first step toward AI readiness!"
                        }
                    ]
                }
            ]
        }

        return this.sendToSlack(message)
    }

    /**
     * Send community highlight
     */
    async sendCommunityHighlight(userName: string, achievement: string): Promise<boolean> {
        if (!this.enabled) return false

        const message: SlackMessage = {
            username: "Community Bot",
            icon_emoji: ":star2:",
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "⭐ Community Spotlight",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Kudos to ${userName}!*\n\n${achievement}`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "🌟 Want to be featured? Share your AI implementation wins with the community!"
                        }
                    ]
                }
            ]
        }

        return this.sendToSlack(message)
    }

    /**
     * Send the actual message to Slack
     */
    private async sendToSlack(message: SlackMessage): Promise<boolean> {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message)
            })

            if (!response.ok) {
                console.error('Failed to send Slack message:', await response.text())
                return false
            }

            console.log('✅ Slack message sent successfully')
            return true
        } catch (error) {
            console.error('Error sending Slack message:', error)
            return false
        }
    }

    /**
     * Get discussion prompts for the week
     */
    getWeeklyPrompts(): DiscussionPrompt[] {
        const baseDate = new Date()

        return [
            {
                id: 'weekly-k12-1',
                type: 'weekly_discussion',
                title: 'K-12 AI Tool Implementation',
                prompt: '🏫 **Discussion:** What AI tools are you piloting in your K-12 district? Share your experiences with:\n\n• Student-facing AI applications\n• Teacher productivity tools\n• Administrative automation\n• Challenges you\'ve encountered\n• Success stories to celebrate\n\n*Tag @channel if you have specific questions for the community!*',
                category: 'k12',
                scheduledFor: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000) // Tomorrow
            },
            {
                id: 'weekly-higher-ed-1',
                type: 'weekly_discussion',
                title: 'Higher Ed Research & AI Ethics',
                prompt: '🎓 **Discussion:** How is your institution balancing AI innovation with academic integrity?\n\n• Research applications of AI\n• Student use policies\n• Faculty guidelines\n• Plagiarism detection challenges\n• Innovative AI education approaches\n\n*Share your policies or ask for feedback on draft guidelines!*',
                category: 'higher_ed',
                scheduledFor: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000) // Day after tomorrow
            },
            {
                id: 'weekly-policy-1',
                type: 'policy_alert',
                title: 'Policy Framework Deep Dive',
                prompt: '📋 **Weekly Policy Focus:** Let\'s discuss AI governance frameworks this week.\n\n• Which frameworks are you using? (NIST, ISO, institutional)\n• How do you adapt frameworks to your context?\n• What gaps have you identified?\n• Resource sharing: templates, checklists, examples\n\n*Drop links to resources that have helped your institution!*',
                category: 'general',
                scheduledFor: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000) // In 3 days
            }
        ]
    }

    /**
     * Get curated blog posts and resources
     */
    getCuratedContent(): BlogPost[] {
        return [
            {
                title: "FERPA and AI: What Educational Leaders Need to Know",
                url: "https://example.com/ferpa-ai-guide",
                summary: "Navigate the complex intersection of student privacy laws and AI implementation in educational settings.",
                tags: ["FERPA", "Privacy", "Compliance", "K-12", "Higher Ed"],
                publishedAt: new Date()
            },
            {
                title: "Building an AI-Ready Cybersecurity Framework for Schools",
                url: "https://example.com/ai-cybersecurity-schools",
                summary: "Essential security considerations when deploying AI tools in educational environments.",
                tags: ["Cybersecurity", "Risk Management", "Implementation", "Best Practices"],
                publishedAt: new Date()
            },
            {
                title: "Case Study: Successful AI Policy Implementation at State University",
                url: "https://example.com/ai-policy-case-study",
                summary: "Real-world example of how one institution developed and deployed comprehensive AI governance policies.",
                tags: ["Case Study", "Higher Ed", "Policy Implementation", "Governance"],
                publishedAt: new Date()
            }
        ]
    }
}
