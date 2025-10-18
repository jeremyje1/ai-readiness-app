'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CheckCircle2, Loader2, ShieldCheck, Sparkles, Target, Users } from 'lucide-react'

type DemoStatus = 'form' | 'submitting' | 'initializing' | 'redirecting' | 'error'
type QuickAssessmentKey = 'governance' | 'training' | 'funding'

interface IntakeContact {
    firstName: string
    lastName: string
    email: string
    institutionName: string
    institutionType: string
    role: string
    phone: string
}

interface QuickAssessment {
    governance: number
    training: number
    funding: number
}

const STORAGE_KEY = 'demo-intake-form'

const INSTITUTION_TYPES = [
    { value: 'K-12 District', label: 'K-12 District' },
    { value: 'Higher Education', label: 'Higher Education' },
    { value: 'Charter/Private', label: 'Charter or Private Institution' },
    { value: 'State Agency', label: 'State Agency or Department' },
    { value: 'Other', label: 'Other' }
]

const ROLE_OPTIONS = [
    { value: 'Superintendent / Chancellor', label: 'Superintendent / Chancellor' },
    { value: 'Provost / CAO', label: 'Provost / Chief Academic Officer' },
    { value: 'CIO / CTO', label: 'CIO / CTO / Technology Director' },
    { value: 'Principal / Campus Leader', label: 'Principal / Campus Leader' },
    { value: 'Innovation Lead', label: 'Innovation Lead / Strategic Initiatives' },
    { value: 'Teacher / Faculty Lead', label: 'Teacher / Faculty Lead' },
    { value: 'Other', label: 'Other' }
]

const INTEREST_OPTIONS = [
    {
        id: 'policy',
        title: 'AI Policy Library & Governance',
        description: 'Board-ready templates, redlines, and implementation playbooks.'
    },
    {
        id: 'compliance',
        title: 'Privacy & Compliance Watchlist',
        description: 'Live vendor monitoring plus incident workflows mapped to FERPA/COPPA.'
    },
    {
        id: 'funding',
        title: 'Grant Funding & ROI',
        description: 'Grant narratives, Title IV alignment, and ROI benchmarks for leadership.'
    },
    {
        id: 'training',
        title: 'Staff Training & Change Management',
        description: 'Role-based PD plans, adoption telemetry, and certification tracking.'
    },
    {
        id: 'analytics',
        title: 'Executive Analytics & Reporting',
        description: 'Leadership dashboards summarizing readiness, adoption, and investment impact.'
    }
]

const QUICK_QUESTIONS: Array<{
    id: QuickAssessmentKey
    title: string
    description: string
    helper: string
}> = [
        {
            id: 'governance',
            title: 'Governance & Policy Guardrails',
            description: 'Board policy, acceptable use, and procurement review processes.',
            helper: '1 = no policy in place • 5 = fully approved and enforced'
        },
        {
            id: 'training',
            title: 'Staff Training & Classroom Enablement',
            description: 'PD pathways, change management, and AI literacy across teams.',
            helper: '1 = ad-hoc pilots • 5 = districtwide, role-specific training'
        },
        {
            id: 'funding',
            title: 'Funding & Measurement Readiness',
            description: 'Grant strategy, ROI tracking, and executive sponsorship.',
            helper: '1 = unclear funding path • 5 = ongoing funding with outcomes'
        }
    ]

const SCORE_SCALE = [1, 2, 3, 4, 5] as const

const DEFAULT_CONTACT: IntakeContact = {
    firstName: '',
    lastName: '',
    email: '',
    institutionName: '',
    institutionType: INSTITUTION_TYPES[0]?.value ?? 'K-12 District',
    role: ROLE_OPTIONS[0]?.value ?? 'Superintendent / Chancellor',
    phone: ''
}

const DEFAULT_ASSESSMENT: QuickAssessment = {
    governance: 3,
    training: 3,
    funding: 3
}

function deriveQualificationLabel(average: number, interests: string[]) {
    if (Number.isNaN(average)) return interests.length >= 3 ? 'Warm' : 'Cold'
    if (average >= 4.2 || interests.includes('funding')) return 'Hot'
    if (average >= 3.2) return 'Warm'
    return 'Cold'
}

function deriveReadinessLevel(average: number) {
    if (Number.isNaN(average)) return 'Emerging'
    if (average >= 4) return 'Maturing'
    if (average >= 3) return 'Developing'
    return 'Emerging'
}

export default function DemoPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [status, setStatus] = useState<DemoStatus>('form')
    const [errorMessage, setErrorMessage] = useState('')
    const [contact, setContact] = useState<IntakeContact>(DEFAULT_CONTACT)
    const [quickAssessment, setQuickAssessment] = useState<QuickAssessment>(DEFAULT_ASSESSMENT)
    const [interestAreas, setInterestAreas] = useState<string[]>(['policy', 'funding'])
    const [goals, setGoals] = useState('')
    const [resumeAvailable, setResumeAvailable] = useState(false)
    const [referrer, setReferrer] = useState('')

    const utmParams = useMemo(() => {
        if (!searchParams) return {}
        const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
        const params: Record<string, string> = {}
        keys.forEach((key) => {
            const value = searchParams.get(key)
            if (value) {
                params[key] = value
            }
        })
        return params
    }, [searchParams])

    useEffect(() => {
        if (typeof window === 'undefined') return

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as {
                    contact?: Partial<IntakeContact>
                    quickAssessment?: Partial<QuickAssessment>
                    interestAreas?: string[]
                    goals?: string
                }

                if (parsed.contact) {
                    setContact((prev) => ({ ...prev, ...parsed.contact }))
                }

                if (parsed.quickAssessment) {
                    setQuickAssessment((prev) => ({ ...prev, ...parsed.quickAssessment }))
                }

                if (Array.isArray(parsed.interestAreas) && parsed.interestAreas.length > 0) {
                    setInterestAreas(parsed.interestAreas)
                }

                if (parsed.goals) {
                    setGoals(parsed.goals)
                }
            }
        } catch (error) {
            console.warn('Unable to restore demo intake state', error)
        }

        setResumeAvailable(document.cookie.includes('demo-mode=true'))
        setReferrer(document.referrer || '')
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const payload = {
            contact,
            quickAssessment,
            interestAreas,
            goals
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }, [contact, quickAssessment, interestAreas, goals])

    const averageScore = useMemo(() => {
        const values = Object.values(quickAssessment)
        const total = values.reduce((sum, value) => sum + value, 0)
        return total / values.length
    }, [quickAssessment])

    const predictedReadiness = deriveReadinessLevel(averageScore)
    const predictedScore = Math.round((Number.isNaN(averageScore) ? 0 : averageScore) * 20)
    const qualificationLabel = deriveQualificationLabel(averageScore, interestAreas)

    const handleContactChange = useCallback(
        (field: keyof IntakeContact, value: string) => {
            setContact((prev) => ({ ...prev, [field]: value }))
            setErrorMessage('')
        },
        []
    )

    const updateQuickAssessment = useCallback((key: QuickAssessmentKey, value: number) => {
        setQuickAssessment((prev) => ({ ...prev, [key]: value }))
    }, [])

    const toggleInterestArea = useCallback((id: string) => {
        setInterestAreas((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    }, [])

    const resetStoredSession = useCallback(() => {
        if (typeof window === 'undefined') return
        document.cookie = 'demo-mode=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
        document.cookie = 'demo-expiry=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
        window.localStorage.removeItem('demo-lead-id')
        setResumeAvailable(false)
    }, [])

    const launchDemo = useCallback(async () => {
        setStatus('initializing')
        try {
            const response = await fetch('/api/demo/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })

            const data = await response.json()

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || 'Failed to launch demo environment')
            }

            setStatus('redirecting')
            setTimeout(() => {
                router.push(data.redirectUrl)
            }, 600)
        } catch (error) {
            console.error('Demo launch error', error)
            setErrorMessage(error instanceof Error ? error.message : 'Unable to start the demo right now')
            setStatus('error')
        }
    }, [router])

    const handleResumeDemo = useCallback(async () => {
        setErrorMessage('')
        await launchDemo()
    }, [launchDemo])

    const handleStartDemo = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            if (status !== 'form') return

            const requiredFields: Array<keyof IntakeContact> = [
                'firstName',
                'lastName',
                'email',
                'institutionName',
                'institutionType',
                'role'
            ]

            const missing = requiredFields.filter((field) => {
                const value = contact[field]
                return typeof value !== 'string' || value.trim().length === 0
            })

            if (missing.length > 0) {
                setErrorMessage('Please complete the highlighted fields before launching the demo.')
                return
            }

            setErrorMessage('')
            setStatus('submitting')

            try {
                const payload = {
                    ...contact,
                    goals,
                    interestAreas,
                    quickAssessment,
                    utm: utmParams,
                    referrer
                }

                const response = await fetch('/api/demo/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })

                const data = await response.json()

                if (!response.ok || !data?.success) {
                    throw new Error(data?.error || 'We could not capture your information just yet.')
                }

                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify({ contact, quickAssessment, interestAreas, goals })
                    )
                    if (data.leadId) {
                        document.cookie = `demo-lead-id=${encodeURIComponent(data.leadId)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
                        window.localStorage.setItem('demo-lead-id', data.leadId)
                    }
                }

                await launchDemo()
            } catch (error) {
                console.error('Demo intake submission failed', error)
                setErrorMessage(error instanceof Error ? error.message : 'Unable to save your assessment. Please try again.')
                setStatus('form')
            }
        },
        [contact, goals, interestAreas, quickAssessment, launchDemo, referrer, status, utmParams]
    )

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full shadow-xl">
                    <CardHeader className="space-y-2 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <CardTitle className="text-2xl">We hit a snag launching your demo</CardTitle>
                        <CardDescription>{errorMessage || 'Please try again in a moment.'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Button onClick={() => setStatus('form')} className="w-full">
                            Go back to intake
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="mailto:team@educationaiblueprint.com">Contact our team</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (status === 'submitting' || status === 'initializing' || status === 'redirecting') {
        const progressSteps = [
            { id: 'capture', label: 'Capturing your priorities', description: 'Logging assessment responses and focus areas.' },
            { id: 'prepare', label: 'Preparing the workspace', description: 'Loading demo persona, sample policies, and analytics.' },
            { id: 'launch', label: 'Launching interactive tour', description: 'Redirecting you to the personalized dashboard.' }
        ]

        const currentIndex =
            status === 'submitting' ? 0 : status === 'initializing' ? 1 : 2

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <Card className="max-w-xl w-full shadow-xl">
                    <CardHeader className="text-center space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                        <CardTitle className="text-2xl">Getting your guided demo ready</CardTitle>
                        <CardDescription>Hang tight — we are preloading your sample data and showcasing the modules you asked about.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {progressSteps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={cn(
                                        'rounded-lg border px-4 py-3 transition-all',
                                        index < currentIndex && 'border-green-200 bg-green-50 text-green-800',
                                        index === currentIndex && 'border-indigo-200 bg-indigo-50 text-indigo-900',
                                        index > currentIndex && 'border-slate-200 bg-white text-slate-600'
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold">{step.label}</p>
                                            <p className="text-sm opacity-80">{step.description}</p>
                                        </div>
                                        {index < currentIndex ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : index === currentIndex ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-slate-500">
                            Session expires in 30 minutes • No credit card required • Change tracking is sandboxed
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="mb-10 flex flex-col gap-3 text-center">
                    <Badge className="mx-auto w-fit bg-indigo-600 hover:bg-indigo-600">30-minute guided experience</Badge>
                    <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                        Capture your AI priorities, then jump into the live platform tour
                    </h1>
                    <p className="text-slate-600 sm:text-lg">
                        Answer three quick readiness questions and choose the modules you want to see. We&apos;ll preload the demo with the data, policies, and dashboards that match your goals.
                    </p>
                </div>

                {resumeAvailable && (
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 p-4">
                        <div>
                            <p className="font-semibold text-green-800">Resume your earlier demo session</p>
                            <p className="text-sm text-green-700">Pick up the guided tour exactly where you left off. No need to re-enter your information.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleResumeDemo} className="bg-green-600 hover:bg-green-700">
                                Resume Demo
                            </Button>
                            <Button variant="outline" onClick={resetStoredSession}>
                                Start Fresh
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
                    <form onSubmit={handleStartDemo} className="space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Users className="h-5 w-5 text-indigo-500" />
                                    Step 1 · Who&apos;s exploring today?
                                </CardTitle>
                                <CardDescription>We&apos;ll tailor the walkthrough and follow up with the resources your team needs.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name">First name</Label>
                                        <Input
                                            id="first-name"
                                            value={contact.firstName}
                                            onChange={(event) => handleContactChange('firstName', event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">Last name</Label>
                                        <Input
                                            id="last-name"
                                            value={contact.lastName}
                                            onChange={(event) => handleContactChange('lastName', event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="work-email">Work email</Label>
                                    <Input
                                        id="work-email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        value={contact.email}
                                        onChange={(event) => handleContactChange('email', event.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="institution-name">Institution</Label>
                                    <Input
                                        id="institution-name"
                                        value={contact.institutionName}
                                        onChange={(event) => handleContactChange('institutionName', event.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Institution type</Label>
                                        <Select
                                            value={contact.institutionType}
                                            onValueChange={(value) => handleContactChange('institutionType', value)}
                                        >
                                            <SelectTrigger data-testid="institution-type-select">
                                                <SelectValue placeholder="Select institution type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INSTITUTION_TYPES.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <Select value={contact.role} onValueChange={(value) => handleContactChange('role', value)}>
                                            <SelectTrigger data-testid="role-select">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Optional phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        inputMode="tel"
                                        value={contact.phone}
                                        onChange={(event) => handleContactChange('phone', event.target.value)}
                                        placeholder="We&apos;ll only use this for scheduling"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Target className="h-5 w-5 text-indigo-500" />
                                    Step 2 · Quick readiness pulse
                                </CardTitle>
                                <CardDescription>Rate where your institution stands today. This helps us preload the right dashboards.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {QUICK_QUESTIONS.map((question) => (
                                    <div key={question.id} className="rounded-lg border border-slate-200 p-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="font-medium text-slate-900">{question.title}</p>
                                            <p className="text-sm text-slate-600">{question.description}</p>
                                            <p className="text-xs text-slate-400">{question.helper}</p>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {SCORE_SCALE.map((value) => (
                                                <Button
                                                    key={value}
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => updateQuickAssessment(question.id, value)}
                                                    variant={quickAssessment[question.id] === value ? 'default' : 'outline'}
                                                    className={cn(
                                                        'h-10 w-10 rounded-full p-0 text-sm font-semibold',
                                                        quickAssessment[question.id] === value
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    )}
                                                >
                                                    {value}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Sparkles className="h-5 w-5 text-indigo-500" />
                                    Step 3 · What should we showcase?
                                </CardTitle>
                                <CardDescription>Pick the modules you want us to focus on during the live walkthrough.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    {INTEREST_OPTIONS.map((option) => {
                                        const isSelected = interestAreas.includes(option.id)
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => toggleInterestArea(option.id)}
                                                data-testid={`interest-${option.id}`}
                                                className={cn(
                                                    'w-full rounded-lg border px-4 py-3 text-left transition-all',
                                                    isSelected
                                                        ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                                                        : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/50'
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{option.title}</p>
                                                        <p className="text-sm text-slate-600">{option.description}</p>
                                                    </div>
                                                    {isSelected && <CheckCircle2 className="mt-1 h-5 w-5 text-indigo-500" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="goals">What outcome would make this demo a win?</Label>
                                    <Textarea
                                        id="goals"
                                        value={goals}
                                        onChange={(event) => setGoals(event.target.value)}
                                        placeholder="Example: Show our superintendent how the executive dashboard proves ROI and policy coverage."
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {errorMessage && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                By launching the demo you agree to our{' '}
                                <a className="text-indigo-600 hover:underline" href="/terms">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a className="text-indigo-600 hover:underline" href="/privacy">
                                    Privacy Policy
                                </a>.
                            </p>
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-indigo-600 hover:bg-indigo-700"
                                data-testid="start-demo-button"
                            >
                                Start the interactive demo
                            </Button>
                        </div>
                    </form>

                    <aside className="space-y-6">
                        <Card className="border-indigo-200 bg-indigo-50/80">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                    You&apos;ll see these modules live
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-indigo-900">
                                <div>
                                    <p className="font-semibold">Policy & Governance</p>
                                    <p className="text-sm opacity-80">Document Policy Engine, Compliance Watchlist, and the full Policy Pack Library with monthly redlines.</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Leadership & ROI</p>
                                    <p className="text-sm opacity-80">Executive dashboard benchmarking readiness, adoption velocity, and funding impact.</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Grant Funding Studio</p>
                                    <p className="text-sm opacity-80">Funding Justification Generator with instant narratives tied to real grant opportunities.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg">Your readiness snapshot</CardTitle>
                                <CardDescription>We&apos;ll preload the dashboard with these assumptions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-end gap-3">
                                    <div>
                                        <p className="text-4xl font-semibold text-indigo-600">{predictedScore}</p>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Readiness score / 100</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                        {predictedReadiness}
                                    </Badge>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p>
                                        <span className="font-medium text-slate-900">Engagement level:</span> {qualificationLabel} lead — our team will follow up with tailored resources.
                                    </p>
                                    <p className="text-xs text-slate-500">Adjust the ratings above to see how the demo persona changes.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    )
}
