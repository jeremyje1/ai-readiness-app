'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUserContext } from '@/components/UserProvider'
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Lightbulb,
    MousePointer,
    Play,
    SkipForward,
    X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface TutorialStep {
    id: string
    title: string
    description: string
    target: string // CSS selector or element ID
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
    action?: 'click' | 'hover' | 'scroll' | 'view'
    content: {
        heading: string
        body: string
        tips?: string[]
        nextAction?: string
    }
    spotlight?: boolean
    allowSkip?: boolean
}

interface TutorialProps {
    isOpen: boolean
    onComplete: () => void
    onSkip: () => void
    tutorialType?: 'dashboard' | 'assessment' | 'executive' | 'compliance' | 'funding'
}

const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
    dashboard: [
        {
            id: 'welcome',
            title: 'Welcome to AI Blueprint!',
            description: 'Let\'s take a quick tour of your AI readiness platform',
            target: 'body',
            position: 'center',
            content: {
                heading: 'Welcome to Your AI Readiness Journey! 🚀',
                body: 'AI Blueprint helps educational institutions assess, plan, and implement AI technologies responsibly. This interactive tour will show you all the key features and how to use them effectively.',
                tips: [
                    'This tutorial takes about 3 minutes',
                    'You can skip any time or restart later',
                    'Each section has specific tools for different roles'
                ],
                nextAction: 'Let\'s start with the main navigation'
            },
            spotlight: false,
            allowSkip: true
        },
        {
            id: 'navigation',
            title: 'Main Navigation',
            description: 'Your command center for all AI readiness activities',
            target: '[data-tutorial="main-nav"]',
            position: 'bottom',
            action: 'view',
            content: {
                heading: 'Navigation Hub 🧭',
                body: 'The main navigation gives you access to all platform features. Each section is designed for specific aspects of AI readiness management.',
                tips: [
                    'Services: AI readiness assessments and tools',
                    'Contact: Direct access to expert support',
                    'Dashboard: Your personalized control center'
                ],
                nextAction: 'Click on your email to access the dashboard'
            },
            spotlight: true
        },
        {
            id: 'user-menu',
            title: 'User Dashboard Access',
            description: 'Quick access to your personalized dashboard',
            target: '[data-tutorial="user-email"]',
            position: 'bottom',
            action: 'click',
            content: {
                heading: 'Your Dashboard Gateway 👤',
                body: 'Click on your email address to access your personalized AI readiness dashboard. This is where you\'ll find all your assessments, reports, and progress tracking.',
                tips: [
                    'Dashboard shows your institution\'s AI readiness score',
                    'Access completed assessments and reports',
                    'Track progress over time'
                ],
                nextAction: 'Try clicking your email to see the dashboard'
            },
            spotlight: true
        }
    ],
    executive: [
        {
            id: 'executive-overview',
            title: 'Executive Dashboard Overview',
            description: 'High-level insights for leadership decisions',
            target: '[data-tutorial="executive-dashboard"]',
            position: 'top',
            content: {
                heading: 'Executive Command Center 📊',
                body: 'The Executive Dashboard provides leadership with comprehensive AI readiness insights, compliance tracking, and strategic recommendations for informed decision-making.',
                tips: [
                    'Real-time readiness scores across all domains',
                    'Compliance monitoring and alerts',
                    'Funding opportunity recommendations'
                ],
                nextAction: 'Let\'s explore each section'
            },
            spotlight: true
        },
        {
            id: 'readiness-scores',
            title: 'AI Readiness Scorecards',
            description: 'Track your institution\'s AI maturity across key domains',
            target: '[data-tutorial="readiness-tab"]',
            position: 'right',
            action: 'click',
            content: {
                heading: 'Readiness Scorecards 🎯',
                body: 'Monitor your institution\'s AI readiness across critical domains: Policy Governance, Data Privacy, Vendor Management, Staff Training, and Infrastructure.',
                tips: [
                    'Green scores (80+): Strong readiness',
                    'Yellow scores (60-79): Areas for improvement',
                    'Red scores (<60): Immediate attention needed'
                ],
                nextAction: 'Click to view detailed breakdowns'
            },
            spotlight: true
        },
        {
            id: 'adoption-metrics',
            title: 'Adoption Progress Tracking',
            description: 'Monitor AI implementation progress across departments',
            target: '[data-tutorial="adoption-tab"]',
            position: 'right',
            action: 'click',
            content: {
                heading: 'Adoption Metrics 📈',
                body: 'Track AI tool adoption, training completion, and policy implementation across your institution. See which departments are leading and which need support.',
                tips: [
                    'Department-by-department progress view',
                    'Training completion rates',
                    'Policy acknowledgment tracking'
                ],
                nextAction: 'View adoption progress by department'
            },
            spotlight: true
        },
        {
            id: 'compliance-watchlist',
            title: 'Compliance Monitoring',
            description: 'Stay ahead of policy updates and vendor renewals',
            target: '[data-tutorial="compliance-tab"]',
            position: 'right',
            action: 'click',
            content: {
                heading: 'Compliance Watchlist ⚖️',
                body: 'Monitor policy updates, vendor contract renewals, and compliance deadlines. Never miss critical dates that could impact your AI initiatives.',
                tips: [
                    'Automated alerts for upcoming deadlines',
                    'Priority levels for critical items',
                    'Assignment tracking for accountability'
                ],
                nextAction: 'Check your compliance status'
            },
            spotlight: true
        },
        {
            id: 'funding-opportunities',
            title: 'AI Funding Recommendations',
            description: 'Discover grants and funding aligned with your readiness assessment',
            target: '[data-tutorial="funding-tab"]',
            position: 'right',
            action: 'click',
            content: {
                heading: 'Funding Opportunities 💰',
                body: 'AI-powered matching finds federal grants, state funding, and private opportunities that align with your institution\'s specific AI readiness needs and gaps.',
                tips: [
                    'Personalized recommendations based on your assessment',
                    'Auto-generated grant narrative templates',
                    'Deadline tracking and eligibility scoring'
                ],
                nextAction: 'Explore funding matches for your institution'
            },
            spotlight: true
        }
    ],
    assessment: [
        {
            id: 'assessment-intro',
            title: 'AI Readiness Assessment',
            description: 'Comprehensive evaluation of your AI preparedness',
            target: '[data-tutorial="assessment-form"]',
            position: 'top',
            content: {
                heading: 'AI Readiness Assessment 📋',
                body: 'This comprehensive assessment evaluates your institution across six critical domains to provide a complete picture of your AI readiness and specific recommendations.',
                tips: [
                    'Questions adapt based on your institution type',
                    'Progress is automatically saved',
                    'Detailed recommendations generated from responses'
                ],
                nextAction: 'Start with the first section'
            },
            spotlight: true
        },
        {
            id: 'question-types',
            title: 'Understanding Question Types',
            description: 'Different question formats for comprehensive evaluation',
            target: '[data-tutorial="question-card"]',
            position: 'left',
            content: {
                heading: 'Question Formats 🤔',
                body: 'The assessment uses multiple question types: Likert scale ratings, multiple choice, and open-ended context questions to capture nuanced insights about your institution.',
                tips: [
                    'Likert scales: Rate your agreement (1-5)',
                    'Context questions: Provide specific examples',
                    'Multiple choice: Select best fit options'
                ],
                nextAction: 'Answer honestly for accurate recommendations'
            },
            spotlight: true
        },
        {
            id: 'progress-tracking',
            title: 'Progress Tracking',
            description: 'Monitor your completion and save progress',
            target: '[data-tutorial="progress-bar"]',
            position: 'bottom',
            content: {
                heading: 'Track Your Progress ⏳',
                body: 'Your progress is automatically saved as you complete sections. You can pause and resume anytime without losing your work.',
                tips: [
                    'Green sections: Completed',
                    'Blue sections: In progress',
                    'Gray sections: Not started'
                ],
                nextAction: 'Complete sections at your own pace'
            },
            spotlight: true
        }
    ],
    compliance: [
        {
            id: 'compliance-overview',
            title: 'Compliance Watchlist',
            description: 'Proactive compliance monitoring and management',
            target: '[data-tutorial="compliance-dashboard"]',
            position: 'top',
            content: {
                heading: 'Compliance Management 🛡️',
                body: 'Stay ahead of policy updates, vendor renewals, and training requirements. This watchlist helps you maintain compliance across all AI-related activities.',
                tips: [
                    'Automated deadline tracking',
                    'Priority-based alerting system',
                    'Assignment and accountability features'
                ],
                nextAction: 'Review your current compliance status'
            },
            spotlight: true
        },
        {
            id: 'priority-items',
            title: 'Priority Items',
            description: 'Focus on critical compliance needs first',
            target: '[data-tutorial="priority-filter"]',
            position: 'right',
            content: {
                heading: 'Priority Management 🚨',
                body: 'Items are prioritized by urgency and impact. Critical items require immediate attention, while low priority items can be scheduled for later.',
                tips: [
                    'Red: Critical - immediate action required',
                    'Yellow: High - address within 30 days',
                    'Green: Medium/Low - plan accordingly'
                ],
                nextAction: 'Filter by priority to focus your efforts'
            },
            spotlight: true
        }
    ],
    funding: [
        {
            id: 'funding-overview',
            title: 'AI Funding Generator',
            description: 'Discover and apply for AI-related funding opportunities',
            target: '[data-tutorial="funding-generator"]',
            position: 'top',
            content: {
                heading: 'Funding Opportunity Engine 💡',
                body: 'Our AI-powered system matches your institution\'s specific needs with federal, state, and private funding opportunities, then helps generate compelling grant narratives.',
                tips: [
                    'Personalized matching based on your assessment',
                    'Auto-generated grant narratives',
                    'Eligibility scoring and deadline tracking'
                ],
                nextAction: 'Explore opportunities matched to your needs'
            },
            spotlight: true
        },
        {
            id: 'opportunity-matching',
            title: 'Smart Opportunity Matching',
            description: 'AI-powered funding recommendations',
            target: '[data-tutorial="funding-opportunities"]',
            position: 'left',
            content: {
                heading: 'Intelligent Matching 🎯',
                body: 'Our algorithm analyzes your assessment results and matches you with funding opportunities that align with your specific AI readiness gaps and institutional goals.',
                tips: [
                    'Match scores show alignment strength',
                    'Eligibility requirements clearly listed',
                    'Application deadlines prominently displayed'
                ],
                nextAction: 'Click on high-match opportunities'
            },
            spotlight: true
        },
        {
            id: 'narrative-generation',
            title: 'Grant Narrative Generation',
            description: 'Auto-generate professional grant applications',
            target: '[data-tutorial="generate-narrative"]',
            position: 'bottom',
            content: {
                heading: 'Narrative Generation ✍️',
                body: 'Generate professional grant narratives that incorporate your institution\'s specific data, assessment results, and alignment with funding priorities.',
                tips: [
                    'Uses your actual institutional data',
                    'Incorporates assessment findings',
                    'Customizable templates for different funders'
                ],
                nextAction: 'Generate a sample narrative'
            },
            spotlight: true
        }
    ]
}

export default function InteractiveTutorial({
    isOpen,
    onComplete,
    onSkip,
    tutorialType = 'dashboard'
}: TutorialProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const tutorialRef = useRef<HTMLDivElement>(null)
    const { user, institution } = useUserContext()

    const steps = TUTORIAL_STEPS[tutorialType] || TUTORIAL_STEPS.dashboard
    const currentStepData = steps[currentStep]

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            // Add tutorial attributes to elements
            addTutorialAttributes()
        } else {
            setIsVisible(false)
            removeTutorialAttributes()
        }

        return () => {
            removeTutorialAttributes()
        }
    }, [isOpen])

    useEffect(() => {
        if (isVisible && currentStepData) {
            updateTargetElement()
        }
    }, [currentStep, isVisible, currentStepData])

    const addTutorialAttributes = () => {
        // Add data-tutorial attributes to key elements for targeting
        const elements = [
            { selector: 'header', attribute: 'main-nav' },
            { selector: '[href="/ai-readiness/dashboard"]', attribute: 'user-email' },
            { selector: '[data-testid="executive-dashboard"]', attribute: 'executive-dashboard' },
            { selector: '[value="readiness"]', attribute: 'readiness-tab' },
            { selector: '[value="adoption"]', attribute: 'adoption-tab' },
            { selector: '[value="compliance"]', attribute: 'compliance-tab' },
            { selector: '[value="funding"]', attribute: 'funding-tab' },
            { selector: 'form', attribute: 'assessment-form' },
            { selector: '.progress-bar', attribute: 'progress-bar' },
            { selector: '.question-card', attribute: 'question-card' }
        ]

        elements.forEach(({ selector, attribute }) => {
            const element = document.querySelector(selector)
            if (element) {
                element.setAttribute('data-tutorial', attribute)
            }
        })
    }

    const removeTutorialAttributes = () => {
        const elements = document.querySelectorAll('[data-tutorial]')
        elements.forEach(element => {
            element.removeAttribute('data-tutorial')
        })
    }

    const updateTargetElement = () => {
        if (!currentStepData) return

        const target = document.querySelector(currentStepData.target)
        setTargetElement(target as HTMLElement)

        if (target && currentStepData.position !== 'center') {
            const rect = target.getBoundingClientRect()
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop

            let top = 0
            let left = 0

            switch (currentStepData.position) {
                case 'top':
                    top = rect.top + scrollTop - 20
                    left = rect.left + rect.width / 2
                    break
                case 'bottom':
                    top = rect.bottom + scrollTop + 20
                    left = rect.left + rect.width / 2
                    break
                case 'left':
                    top = rect.top + scrollTop + rect.height / 2
                    left = rect.left - 20
                    break
                case 'right':
                    top = rect.top + scrollTop + rect.height / 2
                    left = rect.right + 20
                    break
            }

            setPosition({ top, left })

            // Scroll target into view
            target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleComplete = () => {
        // Store tutorial completion in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(`tutorial-completed-${tutorialType}`, 'true')
            localStorage.setItem('tutorial-completed-at', new Date().toISOString())
        }
        onComplete()
    }

    const handleSkip = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`tutorial-skipped-${tutorialType}`, 'true')
        }
        onSkip()
    }

    if (!isVisible || !currentStepData) return null

    const getPositionClasses = () => {
        if (currentStepData.position === 'center') {
            return 'fixed inset-0 flex items-center justify-center z-50'
        }

        return 'fixed z-50'
    }

    const getArrowIcon = () => {
        switch (currentStepData.position) {
            case 'top': return <ArrowDown className="h-4 w-4" />
            case 'bottom': return <ArrowUp className="h-4 w-4" />
            case 'left': return <ArrowRight className="h-4 w-4" />
            case 'right': return <ArrowLeft className="h-4 w-4" />
            default: return <MousePointer className="h-4 w-4" />
        }
    }

    return (
        <>
            {/* Overlay */}
            {currentStepData.spotlight && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    style={{
                        clipPath: targetElement ?
                            `polygon(0% 0%, 0% 100%, ${targetElement.getBoundingClientRect().left - 10}px 100%, ${targetElement.getBoundingClientRect().left - 10}px ${targetElement.getBoundingClientRect().top - 10}px, ${targetElement.getBoundingClientRect().right + 10}px ${targetElement.getBoundingClientRect().top - 10}px, ${targetElement.getBoundingClientRect().right + 10}px ${targetElement.getBoundingClientRect().bottom + 10}px, ${targetElement.getBoundingClientRect().left - 10}px ${targetElement.getBoundingClientRect().bottom + 10}px, ${targetElement.getBoundingClientRect().left - 10}px 100%, 100% 100%, 100% 0%)` :
                            undefined
                    }}
                />
            )}

            {/* Tutorial Card */}
            <div
                className={getPositionClasses()}
                style={currentStepData.position !== 'center' ? {
                    top: position.top,
                    left: position.left,
                    transform: 'translate(-50%, -50%)'
                } : undefined}
            >
                <Card
                    ref={tutorialRef}
                    className="w-96 max-w-sm mx-4 shadow-2xl border-2 border-blue-500 bg-white relative"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-2">
                            {getArrowIcon()}
                            <div>
                                <h3 className="font-semibold text-gray-900">{currentStepData.title}</h3>
                                <p className="text-xs text-gray-600">
                                    Step {currentStep + 1} of {steps.length}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSkip}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <CardContent className="p-4">
                        <div className="space-y-4">
                            {/* Content */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                    {currentStepData.content.heading}
                                </h4>
                                <p className="text-sm text-gray-700 mb-3">
                                    {currentStepData.content.body}
                                </p>

                                {/* Tips */}
                                {currentStepData.content.tips && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-800">
                                                Quick Tips
                                            </span>
                                        </div>
                                        <ul className="text-xs text-yellow-700 space-y-1">
                                            {currentStepData.content.tips.map((tip, index) => (
                                                <li key={index} className="flex items-start gap-1">
                                                    <span className="text-yellow-500 mt-0.5">•</span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Next Action */}
                                {currentStepData.content.nextAction && (
                                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                        <Play className="h-3 w-3" />
                                        {currentStepData.content.nextAction}
                                    </div>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div
                                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 0}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-2">
                                    {currentStepData.allowSkip && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSkip}
                                            className="flex items-center gap-1"
                                        >
                                            <SkipForward className="h-4 w-4" />
                                            Skip Tour
                                        </Button>
                                    )}

                                    <Button
                                        onClick={handleNext}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        {currentStep === steps.length - 1 ? (
                                            <>
                                                <CheckCircle className="h-4 w-4" />
                                                Complete
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
