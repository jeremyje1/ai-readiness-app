'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertCircle,
    Bot,
    Calendar,
    CheckCircle,
    Clock,
    MessageSquare,
    Send,
    Settings,
    TrendingUp,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ScheduleStatus {
    id: string
    type: string
    scheduledTime: string
    enabled: boolean
    lastRun?: string
    nextRun?: string
}

export default function SlackAutomationDashboard() {
    const [schedules, setSchedules] = useState<ScheduleStatus[]>([])
    const [loading, setLoading] = useState(false)
    const [lastAction, setLastAction] = useState<string | null>(null)

    // Manual post controls
    const [postType, setPostType] = useState('tip')
    const [postCategory, setPostCategory] = useState('general')
    const [customMessage, setCustomMessage] = useState('')

    // Celebration controls
    const [institutionName, setInstitutionName] = useState('')
    const [assessmentScore, setAssessmentScore] = useState('')

    // Policy alert controls
    const [frameworkName, setFrameworkName] = useState('')
    const [policyChanges, setPolicyChanges] = useState('')
    const [alertSeverity, setAlertSeverity] = useState('medium')

    useEffect(() => {
        loadScheduleStatus()
    }, [])

    const loadScheduleStatus = async () => {
        try {
            const response = await fetch('/api/slack-automation?action=schedule_status')
            const data = await response.json()
            setSchedules(data.schedules || [])
        } catch (error) {
            console.error('Failed to load schedule status:', error)
        }
    }

    const triggerManualPost = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/slack-automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'manual_post',
                    type: postType,
                    category: postCategory
                })
            })

            const data = await response.json()
            setLastAction(data.success ? 'Manual post sent successfully!' : 'Failed to send post')
        } catch (error) {
            setLastAction('Error sending manual post')
        }
        setLoading(false)
    }

    const triggerCelebration = async () => {
        if (!institutionName || !assessmentScore) return

        setLoading(true)
        try {
            const response = await fetch('/api/slack-automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'assessment_celebration',
                    data: {
                        institutionName,
                        score: parseFloat(assessmentScore) / 100
                    }
                })
            })

            const data = await response.json()
            setLastAction(data.success ? 'Celebration sent!' : 'Failed to send celebration')
            if (data.success) {
                setInstitutionName('')
                setAssessmentScore('')
            }
        } catch (error) {
            setLastAction('Error sending celebration')
        }
        setLoading(false)
    }

    const triggerPolicyAlert = async () => {
        if (!frameworkName || !policyChanges) return

        setLoading(true)
        try {
            const changes = policyChanges.split('\n').filter(change => change.trim())
            const response = await fetch('/api/slack-automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'policy_alert',
                    data: {
                        framework: frameworkName,
                        changes,
                        severity: alertSeverity
                    }
                })
            })

            const data = await response.json()
            setLastAction(data.success ? 'Policy alert sent!' : 'Failed to send alert')
            if (data.success) {
                setFrameworkName('')
                setPolicyChanges('')
            }
        } catch (error) {
            setLastAction('Error sending policy alert')
        }
        setLoading(false)
    }

    const toggleSchedule = async (scheduleId: string, enabled: boolean) => {
        try {
            const response = await fetch('/api/slack-automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_schedule',
                    data: {
                        scheduleId,
                        updates: { enabled }
                    }
                })
            })

            if (response.ok) {
                setSchedules(prev =>
                    prev.map(schedule =>
                        schedule.id === scheduleId
                            ? { ...schedule, enabled }
                            : schedule
                    )
                )
                setLastAction(`Schedule ${enabled ? 'enabled' : 'disabled'}`)
            }
        } catch (error) {
            setLastAction('Error updating schedule')
        }
    }

    const runScheduledPosts = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/slack-automation?action=run_scheduled')
            const data = await response.json()
            setLastAction('Scheduled posts executed')
            loadScheduleStatus() // Refresh status
        } catch (error) {
            setLastAction('Error running scheduled posts')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Bot className="h-8 w-8" />
                        Slack Community Automation
                    </h1>
                    <p className="text-muted-foreground">
                        Manage automated discussion prompts, tips, and community engagement
                    </p>
                </div>
                <Button onClick={runScheduledPosts} disabled={loading}>
                    <Clock className="h-4 w-4 mr-2" />
                    Run Scheduled Posts
                </Button>
            </div>

            {lastAction && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            {lastAction}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Current Schedules */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Posting Schedule
                    </CardTitle>
                    <CardDescription>
                        Automated posting schedule for community engagement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {schedules.map((schedule) => (
                            <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                                            {schedule.type}
                                        </Badge>
                                        <span className="font-medium">{schedule.id}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <div>Schedule: {schedule.scheduledTime}</div>
                                        {schedule.lastRun && <div>Last run: {schedule.lastRun}</div>}
                                        {schedule.nextRun && <div>Next run: {schedule.nextRun}</div>}
                                    </div>
                                </div>
                                <Switch
                                    checked={schedule.enabled}
                                    onCheckedChange={(enabled) => toggleSchedule(schedule.id, enabled)}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Manual Posts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Manual Posts
                        </CardTitle>
                        <CardDescription>
                            Send immediate posts to your Slack community
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Post Type</Label>
                            <Select value={postType} onValueChange={setPostType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tip">Weekly Tip</SelectItem>
                                    <SelectItem value="discussion">Discussion Prompt</SelectItem>
                                    <SelectItem value="blog">Blog/Resource Share</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {postType === 'discussion' && (
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={postCategory} onValueChange={setPostCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="k12">K-12 Education</SelectItem>
                                        <SelectItem value="higher_ed">Higher Education</SelectItem>
                                        <SelectItem value="general">General AI Policy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button onClick={triggerManualPost} disabled={loading} className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Post
                        </Button>
                    </CardContent>
                </Card>

                {/* Assessment Celebrations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Assessment Celebrations
                        </CardTitle>
                        <CardDescription>
                            Celebrate assessment completions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Institution Name</Label>
                            <Input
                                value={institutionName}
                                onChange={(e) => setInstitutionName(e.target.value)}
                                placeholder="Springfield School District"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Assessment Score (%)</Label>
                            <Input
                                type="number"
                                value={assessmentScore}
                                onChange={(e) => setAssessmentScore(e.target.value)}
                                placeholder="85"
                                min="0"
                                max="100"
                            />
                        </div>

                        <Button
                            onClick={triggerCelebration}
                            disabled={loading || !institutionName || !assessmentScore}
                            className="w-full"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Send Celebration
                        </Button>
                    </CardContent>
                </Card>

                {/* Policy Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Policy Alerts
                        </CardTitle>
                        <CardDescription>
                            Notify community of policy updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Framework Name</Label>
                            <Input
                                value={frameworkName}
                                onChange={(e) => setFrameworkName(e.target.value)}
                                placeholder="NIST AI Risk Management Framework"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Key Changes (one per line)</Label>
                            <Textarea
                                value={policyChanges}
                                onChange={(e) => setPolicyChanges(e.target.value)}
                                placeholder="Updated risk assessment requirements&#10;New governance guidelines&#10;Enhanced monitoring protocols"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select value={alertSeverity} onValueChange={setAlertSeverity}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low Priority</SelectItem>
                                    <SelectItem value="medium">Medium Priority</SelectItem>
                                    <SelectItem value="high">High Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={triggerPolicyAlert}
                            disabled={loading || !frameworkName || !policyChanges}
                            className="w-full"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Send Alert
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
