'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// NIST AI RMF Framework Categories
const ASSESSMENT_QUESTIONS = [
    // GOVERN (5 questions)
    {
        id: 1,
        category: 'GOVERN',
        question: 'Does your institution have a written AI policy or acceptable use guidelines?',
        options: ['No policy exists', 'Policy in draft', 'Policy approved but not implemented', 'Policy fully implemented']
    },
    {
        id: 2,
        category: 'GOVERN',
        question: 'Have you identified who is responsible for AI governance at your institution?',
        options: ['No one assigned', 'Informal responsibility', 'Individual assigned', 'Committee or team established']
    },
    {
        id: 3,
        category: 'GOVERN',
        question: 'Are AI tools and vendors reviewed before being used by students/staff?',
        options: ['Never reviewed', 'Occasionally reviewed', 'Reviewed by request', 'All AI tools must be pre-approved']
    },
    {
        id: 4,
        category: 'GOVERN',
        question: 'Do you have a process for handling AI-related incidents or concerns?',
        options: ['No process', 'Informal process', 'Documented process', 'Tested and refined process']
    },
    {
        id: 5,
        category: 'GOVERN',
        question: 'How often do you review and update AI policies?',
        options: ['Never', 'When issues arise', 'Annually', 'Quarterly or more frequently']
    },

    // MAP (5 questions)
    {
        id: 6,
        category: 'MAP',
        question: 'Have you identified where AI is currently being used in your institution?',
        options: ['No inventory', 'Partial list', 'Complete list of known tools', 'Comprehensive inventory with regular audits']
    },
    {
        id: 7,
        category: 'MAP',
        question: 'Do you understand the risks associated with AI use in education?',
        options: ['Not considered', 'General awareness', 'Documented risk assessment', 'Comprehensive risk analysis with mitigation plans']
    },
    {
        id: 8,
        category: 'MAP',
        question: 'Have you mapped AI use to student data privacy regulations (FERPA, COPPA)?',
        options: ['Not considered', 'General awareness', 'Partial mapping', 'Complete compliance mapping']
    },
    {
        id: 9,
        category: 'MAP',
        question: 'Do you track which AI tools have access to student or institutional data?',
        options: ['Not tracked', 'Some tools tracked', 'Most tools tracked', 'All tools tracked with data flow mapping']
    },
    {
        id: 10,
        category: 'MAP',
        question: 'Have you identified potential bias or equity concerns with AI use?',
        options: ['Not considered', 'Awareness of concerns', 'Some analysis done', 'Comprehensive equity review']
    },

    // MEASURE (5 questions)
    {
        id: 11,
        category: 'MEASURE',
        question: 'Do you monitor how AI tools are being used by teachers and students?',
        options: ['No monitoring', 'Occasional checks', 'Regular usage reports', 'Real-time monitoring with alerts']
    },
    {
        id: 12,
        category: 'MEASURE',
        question: 'Have you established metrics to measure AI impact on learning outcomes?',
        options: ['No metrics', 'Planning metrics', 'Some metrics defined', 'Comprehensive metrics with baseline data']
    },
    {
        id: 13,
        category: 'MEASURE',
        question: 'Do you collect feedback from teachers/faculty about AI tool effectiveness?',
        options: ['No feedback collected', 'Ad-hoc feedback', 'Regular surveys', 'Systematic feedback with analysis']
    },
    {
        id: 14,
        category: 'MEASURE',
        question: 'Are you tracking AI-related incidents or concerns?',
        options: ['Not tracked', 'Informally tracked', 'Documented tracking', 'Systematic tracking with trend analysis']
    },
    {
        id: 15,
        category: 'MEASURE',
        question: 'Do you measure compliance with AI policies?',
        options: ['No measurement', 'Occasional audits', 'Regular compliance checks', 'Continuous compliance monitoring']
    },

    // MANAGE (5 questions)
    {
        id: 16,
        category: 'MANAGE',
        question: 'How do you communicate AI policies to staff and students?',
        options: ['Not communicated', 'Email or announcement', 'Training sessions', 'Comprehensive onboarding and ongoing education']
    },
    {
        id: 17,
        category: 'MANAGE',
        question: 'Do you provide professional development on AI for educators?',
        options: ['No training offered', 'Optional workshops', 'Required training for some', 'Comprehensive PD program for all staff']
    },
    {
        id: 18,
        category: 'MANAGE',
        question: 'How do you respond when new AI tools become popular?',
        options: ['React when problems arise', 'Evaluate if requested', 'Proactive evaluation', 'Systematic review and decision process']
    },
    {
        id: 19,
        category: 'MANAGE',
        question: 'Do you have a process for students/staff to request AI tool approval?',
        options: ['No process', 'Informal requests', 'Documented process', 'Streamlined approval workflow']
    },
    {
        id: 20,
        category: 'MANAGE',
        question: 'How often do you update stakeholders on AI initiatives?',
        options: ['Never', 'When issues arise', 'Quarterly updates', 'Regular updates with transparent reporting']
    }
];

export default function AssessmentPage() {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const supabase = createClient();

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                router.push('/auth/login');
                return;
            }

            setUserId(session.user.id);
            setUserEmail(session.user.email || null);
            setLoading(false);
        } catch (error) {
            console.error('Auth error:', error);
            router.push('/auth/login');
        }
    };

    const handleAnswer = (value: number) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: value
        }));

        // Auto-advance to next question
        if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentQuestion(currentQuestion + 1);
            }, 300);
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (!userId) return;

        setSubmitting(true);

        try {
            // Save assessment responses
            const response = await fetch('/api/assessment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    answers,
                    completedAt: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit assessment');
            }

            // Redirect to results page where OpenAI roadmap will be generated
            router.push('/dashboard');
        } catch (error) {
            console.error('Submission error:', error);
            alert('Error submitting assessment. Please try again.');
            setSubmitting(false);
        }
    };

    const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
    const isComplete = Object.keys(answers).length === ASSESSMENT_QUESTIONS.length;
    const currentQ = ASSESSMENT_QUESTIONS[currentQuestion];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading assessment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-xl font-bold">AI Readiness Assessment</h1>
                        <span className="text-sm text-gray-600">
                            Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex gap-2 mt-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">GOVERN: 5Q</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">MAP: 5Q</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">MEASURE: 5Q</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">MANAGE: 5Q</span>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Card className="p-8">
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                            {currentQ.category}
                        </span>
                        <h2 className="text-2xl font-bold mb-2">
                            {currentQ.question}
                        </h2>
                        <p className="text-gray-600">
                            Select the option that best describes your current state
                        </p>
                    </div>

                    <div className="space-y-3">
                        {currentQ.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                                    answers[currentQuestion] === index
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{option}</span>
                                    {answers[currentQuestion] === index && (
                                        <CheckCircle className="h-5 w-5 text-blue-600" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentQuestion === 0}
                        >
                            Back
                        </Button>

                        {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 && answers[currentQuestion] !== undefined ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={!isComplete || submitting}
                                className="min-w-[200px]"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Your Roadmap...
                                    </>
                                ) : (
                                    <>
                                        Complete Assessment <CheckCircle className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                disabled={answers[currentQuestion] === undefined || currentQuestion === ASSESSMENT_QUESTIONS.length - 1}
                            >
                                Next Question
                            </Button>
                        )}
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        {Object.keys(answers).length} of {ASSESSMENT_QUESTIONS.length} questions answered
                    </div>
                </Card>
            </div>
        </div>
    );
}
