'use client'

import { useUserContext } from '@/components/UserProvider'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TutorialState {
    isOpen: boolean
    tutorialType: 'dashboard' | 'assessment' | 'executive' | 'compliance' | 'funding'
    shouldShow: boolean
}

interface TutorialManager {
    tutorialState: TutorialState
    showTutorial: (type: TutorialState['tutorialType']) => void
    completeTutorial: () => void
    skipTutorial: () => void
    restartTutorial: (type?: TutorialState['tutorialType']) => void
    hasCompletedTutorial: (type: TutorialState['tutorialType']) => boolean
    isFirstVisit: boolean
}

const TUTORIAL_ROUTES = {
    '/ai-readiness/dashboard': 'dashboard',
    '/ai-readiness/assessment': 'assessment',
    '/executive': 'executive',
    '/executive/compliance': 'compliance',
    '/executive/funding': 'funding'
} as const

export const useTutorialManager = (): TutorialManager => {
    const { user, institution, loading } = useUserContext()
    const pathname = usePathname()

    const [tutorialState, setTutorialState] = useState<TutorialState>({
        isOpen: false,
        tutorialType: 'dashboard',
        shouldShow: false
    })

    const [isFirstVisit, setIsFirstVisit] = useState(false)

    useEffect(() => {
        if (loading || !user || typeof window === 'undefined') return

        // Check if this is user's first visit
        const hasVisitedBefore = localStorage.getItem('user-has-visited')
        const firstVisit = !hasVisitedBefore

        if (firstVisit) {
            localStorage.setItem('user-has-visited', 'true')
            setIsFirstVisit(true)
        }

        // Determine if we should show tutorial based on route and completion status
        const routeTutorialType = TUTORIAL_ROUTES[pathname as keyof typeof TUTORIAL_ROUTES]

        if (routeTutorialType) {
            const hasCompleted = hasCompletedTutorial(routeTutorialType)
            const hasSkipped = localStorage.getItem(`tutorial-skipped-${routeTutorialType}`)

            // Show tutorial if it's first visit to this page and user hasn't completed or skipped it
            const shouldShow = firstVisit && !hasCompleted && !hasSkipped

            setTutorialState(prev => ({
                ...prev,
                tutorialType: routeTutorialType,
                shouldShow,
                isOpen: shouldShow
            }))
        }
    }, [pathname, user, loading])

    const hasCompletedTutorial = (type: TutorialState['tutorialType']): boolean => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(`tutorial-completed-${type}`) === 'true'
    }

    const showTutorial = (type: TutorialState['tutorialType']) => {
        setTutorialState({
            isOpen: true,
            tutorialType: type,
            shouldShow: true
        })
    }

    const completeTutorial = () => {
        if (typeof window === 'undefined') return

        const { tutorialType } = tutorialState
        localStorage.setItem(`tutorial-completed-${tutorialType}`, 'true')
        localStorage.setItem('tutorial-completed-at', new Date().toISOString())

        setTutorialState(prev => ({
            ...prev,
            isOpen: false,
            shouldShow: false
        }))
    }

    const skipTutorial = () => {
        if (typeof window === 'undefined') return

        const { tutorialType } = tutorialState
        localStorage.setItem(`tutorial-skipped-${tutorialType}`, 'true')

        setTutorialState(prev => ({
            ...prev,
            isOpen: false,
            shouldShow: false
        }))
    }

    const restartTutorial = (type?: TutorialState['tutorialType']) => {
        if (typeof window === 'undefined') return

        const tutorialType = type || tutorialState.tutorialType

        // Clear completion/skip status
        localStorage.removeItem(`tutorial-completed-${tutorialType}`)
        localStorage.removeItem(`tutorial-skipped-${tutorialType}`)

        setTutorialState({
            isOpen: true,
            tutorialType,
            shouldShow: true
        })
    }

    return {
        tutorialState,
        showTutorial,
        completeTutorial,
        skipTutorial,
        restartTutorial,
        hasCompletedTutorial,
        isFirstVisit
    }
}

export default useTutorialManager
