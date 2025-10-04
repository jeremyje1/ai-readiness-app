'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useTutorialManager from '@/lib/hooks/useTutorialManager'
import {
    BookOpen,
    HelpCircle,
    Play,
    RefreshCw
} from 'lucide-react'

interface TutorialTriggerProps {
    variant?: 'button' | 'badge' | 'help-icon' | 'floating'
    tutorialType?: 'dashboard' | 'assessment'
    label?: string
    className?: string
    showNewBadge?: boolean
}

export default function TutorialTrigger({
    variant = 'button',
    tutorialType,
    label,
    className = '',
    showNewBadge = false
}: TutorialTriggerProps) {
    const {
        showTutorial,
        restartTutorial,
        hasCompletedTutorial,
        isFirstVisit,
        tutorialState
    } = useTutorialManager()

    const handleClick = () => {
        if (tutorialType) {
            const hasCompleted = hasCompletedTutorial(tutorialType)
            if (hasCompleted) {
                restartTutorial(tutorialType)
            } else {
                showTutorial(tutorialType)
            }
        } else {
            // Use current page tutorial type
            restartTutorial()
        }
    }

    const getButtonText = () => {
        if (label) return label

        const hasCompleted = tutorialType ? hasCompletedTutorial(tutorialType) : false

        if (hasCompleted) {
            return 'Restart Tutorial'
        }

        if (isFirstVisit && !hasCompleted) {
            return 'Start Tour'
        }

        return 'Show Tutorial'
    }

    const getIcon = () => {
        const hasCompleted = tutorialType ? hasCompletedTutorial(tutorialType) : false

        if (hasCompleted) {
            return <RefreshCw className="h-4 w-4" />
        }

        if (isFirstVisit) {
            return <Play className="h-4 w-4" />
        }

        return <HelpCircle className="h-4 w-4" />
    }

    // Floating help button
    if (variant === 'floating') {
        return (
            <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
                <Button
                    onClick={handleClick}
                    className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
                    title={getButtonText()}
                >
                    {getIcon()}
                </Button>
                {showNewBadge && isFirstVisit && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 px-1 py-0 text-xs animate-pulse"
                    >
                        New
                    </Badge>
                )}
            </div>
        )
    }

    // Help icon only
    if (variant === 'help-icon') {
        return (
            <button
                onClick={handleClick}
                className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${className}`}
                title={getButtonText()}
            >
                <HelpCircle className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                {showNewBadge && isFirstVisit && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 px-1 py-0 text-xs animate-pulse"
                    >
                        !
                    </Badge>
                )}
            </button>
        )
    }

    // Badge variant
    if (variant === 'badge') {
        return (
            <Badge
                onClick={handleClick}
                variant="outline"
                className={`cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors ${className}`}
            >
                <BookOpen className="h-3 w-3 mr-1" />
                {getButtonText()}
                {showNewBadge && isFirstVisit && (
                    <span className="ml-1 animate-pulse">✨</span>
                )}
            </Badge>
        )
    }

    // Default button variant
    return (
        <Button
            onClick={handleClick}
            variant="outline"
            size="sm"
            className={`flex items-center gap-2 ${className}`}
        >
            {getIcon()}
            {getButtonText()}
            {showNewBadge && isFirstVisit && (
                <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                    New
                </Badge>
            )}
        </Button>
    )
}

// Pre-configured variants for common use cases
export function DashboardTutorialTrigger(props: Omit<TutorialTriggerProps, 'tutorialType'>) {
    return <TutorialTrigger {...props} tutorialType="dashboard" />
}

export function AssessmentTutorialTrigger(props: Omit<TutorialTriggerProps, 'tutorialType'>) {
    return <TutorialTrigger {...props} tutorialType="assessment" />
}

// Floating tutorial help - always available
export function FloatingTutorialHelp() {
    return (
        <TutorialTrigger
            variant="floating"
            showNewBadge={true}
        />
    )
}
