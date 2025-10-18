'use client';

import { useEffect, useRef } from 'react';
import type { Tour } from 'shepherd.js';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import '../styles/shepherd-custom.css';

export function DemoTour() {
    const tourRef = useRef<Tour | null>(null);

    useEffect(() => {
        // Initialize tour
        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shepherd-theme-custom',
                scrollTo: { behavior: 'smooth', block: 'center' },
                cancelIcon: {
                    enabled: true
                }
            }
        });

        // Step 1: Welcome
        tour.addStep({
            id: 'welcome',
            title: '👋 Welcome to AI Blueprint Demo!',
            text: `
                <div class="space-y-3">
                    <p>You're exploring a <strong>30-minute demo</strong> with pre-loaded sample data.</p>
                    <p>This tour will highlight the platform's key features for educational institutions.</p>
                    <p class="text-sm text-gray-600">💡 Tip: Changes won't be saved, so feel free to click around!</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Skip Tour',
                    action: tour.cancel,
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Start Tour',
                    action: tour.next
                }
            ]
        });

        // Step 2: Dashboard Overview
        tour.addStep({
            id: 'dashboard',
            title: '📊 Your AI Readiness Dashboard',
            text: `
                <div class="space-y-3">
                    <p>This dashboard shows your institution's <strong>AI readiness assessment</strong> results:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                        <li>Overall readiness score</li>
                        <li>Gap analysis across NIST categories</li>
                        <li>Implementation roadmap</li>
                        <li>Progress tracking</li>
                    </ul>
                </div>
            `,
            attachTo: {
                element: '[data-tour="dashboard-content"]',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ],
            when: {
                show() {
                    // Ensure element exists, if not skip this step
                    const element = document.querySelector('[data-tour="dashboard-content"]');
                    if (!element) {
                        console.warn('Dashboard element not found, skipping step');
                        tour.next();
                    }
                }
            }
        });

        // Step 3: Blueprints Feature
        tour.addStep({
            id: 'blueprints',
            title: '🚀 AI Implementation Blueprints',
            text: `
                <div class="space-y-3">
                    <p>Create <strong>customized implementation plans</strong> with AI assistance:</p>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                        <li>Department-specific recommendations</li>
                        <li>Phased rollout strategies</li>
                        <li>Budget and timeline planning</li>
                        <li>Progress milestones</li>
                    </ul>
                    <p class="text-sm text-purple-600 font-medium">This is where the magic happens! ✨</p>
                </div>
            `,
            attachTo: {
                element: '[data-tour="blueprints"]',
                on: 'bottom'
            },
            buttons: [
                {
                    text: 'Back',
                    action: tour.back,
                    classes: 'shepherd-button-secondary'
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ],
            when: {
                show() {
                    const element = document.querySelector('[data-tour="blueprints"]');
                    if (!element) {
                        console.warn('Blueprints element not found, skipping step');
                        tour.next();
                    }
                }
            }
        });

        // Step 4: Complete
        tour.addStep({
            id: 'complete',
            title: '🎉 Tour Complete!',
            text: `
                <div class="space-y-3">
                    <p>You're all set! Explore the demo at your own pace.</p>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <p class="font-semibold text-yellow-800 mb-1">⏱️ Remember:</p>
                        <p class="text-yellow-700">Your demo session expires in 30 minutes. Check the countdown timer at the top!</p>
                    </div>
                    <p class="text-sm text-gray-600">Want to save your work? Create a free account anytime.</p>
                </div>
            `,
            buttons: [
                {
                    text: 'Finish Tour',
                    action: tour.complete
                }
            ]
        });

        tourRef.current = tour;

        // Listen for tour start event from DemoBanner
        const handleStartTour = () => {
            if (tourRef.current) {
                tourRef.current.start();
            }
        };

        window.addEventListener('start-demo-tour', handleStartTour);

        // Cleanup
        return () => {
            window.removeEventListener('start-demo-tour', handleStartTour);
            if (tourRef.current) {
                tourRef.current.complete();
            }
        };
    }, []);

    return null; // This component doesn't render anything
}
