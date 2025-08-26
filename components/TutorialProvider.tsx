'use client'

import InteractiveTutorial from '@/components/InteractiveTutorial'
import { FloatingTutorialHelp } from '@/components/TutorialTrigger'
import useTutorialManager from '@/lib/hooks/useTutorialManager'
import React from 'react'

interface TutorialProviderProps {
    children: React.ReactNode
}

export default function TutorialProvider({ children }: TutorialProviderProps) {
    const {
        tutorialState,
        completeTutorial,
        skipTutorial
    } = useTutorialManager()

    return (
        <>
            {children}

            {/* Interactive Tutorial */}
            <InteractiveTutorial
                isOpen={tutorialState.isOpen}
                tutorialType={tutorialState.tutorialType}
                onComplete={completeTutorial}
                onSkip={skipTutorial}
            />

            {/* Floating Help Button */}
            <FloatingTutorialHelp />
        </>
    )
}
