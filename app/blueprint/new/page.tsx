'use client';

import GoalSettingWizard from '@/components/blueprint/GoalSettingWizard';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import ConversionModal from '@/components/ConversionModal';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewBlueprintPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [assessmentId, setAssessmentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConversionModal, setShowConversionModal] = useState(false);
    const [conversionReason, setConversionReason] = useState<'trial_expired' | 'subscription_required'>('subscription_required');

    useEffect(() => {
        // Get assessment ID from URL or fetch latest
        const paramAssessmentId = searchParams.get('assessment_id');

        if (paramAssessmentId) {
            setAssessmentId(paramAssessmentId);
            setLoading(false);
        } else {
            fetchLatestAssessment();
        }
    }, [searchParams]);

    const fetchLatestAssessment = async () => {
        try {
            const response = await fetch('/api/assessment/latest');
            if (!response.ok) throw new Error('No assessment found');

            const data = await response.json();
            if (!data.assessment?.id) {
                throw new Error('Please complete an assessment first');
            }

            setAssessmentId(data.assessment.id);
        } catch (error: any) {
            console.error('Error fetching assessment:', error);
            setError(error.message || 'Failed to load assessment');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (goalsId: string) => {
        // Start blueprint generation
        try {
            const response = await fetch('/api/blueprint/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goals_id: goalsId,
                    assessment_id: assessmentId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Check if it's a subscription-related error
                if (response.status === 403) {
                    if (errorData.code === 'TRIAL_EXPIRED') {
                        setConversionReason('trial_expired');
                    } else if (errorData.code === 'SUBSCRIPTION_REQUIRED') {
                        setConversionReason('subscription_required');
                    }
                    setShowConversionModal(true);
                    return;
                }

                throw new Error(errorData.error || 'Failed to generate blueprint');
            }

            const data = await response.json();

            // Redirect to the new blueprint (it will be in generating status)
            router.push(`/blueprint/${data.blueprint_id}`);
        } catch (error: any) {
            console.error('Error generating blueprint:', error);
            alert(error.message || 'Failed to generate blueprint. Please try again.');
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card className="p-8 text-center">
                    <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Assessment Required</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => router.back()}>
                            Go Back
                        </Button>
                        <Button onClick={() => router.push('/assessment')}>
                            Start Assessment
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Create AI Implementation Blueprint</h1>
                        <p className="text-gray-600 mt-1">
                            Let&rsquo;s define your goals and preferences for AI implementation
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg">
                        <Sparkles className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">What You&rsquo;ll Get</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Comprehensive AI implementation roadmap tailored to your institution</li>
                            <li>• Phase-by-phase action plans with specific tasks and timelines</li>
                            <li>• Department-specific strategies and resource allocation</li>
                            <li>• Risk assessment and mitigation strategies</li>
                            <li>• Quick wins and tool recommendations</li>
                            <li>• Progress tracking and collaboration features</li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Goal Setting Wizard */}
            {assessmentId && (
                <GoalSettingWizard
                    assessmentId={assessmentId}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                />
            )}

            {/* Conversion Modal */}
            <ConversionModal
                isOpen={showConversionModal}
                onClose={() => setShowConversionModal(false)}
                reason={conversionReason}
            />
        </div>
    );
}