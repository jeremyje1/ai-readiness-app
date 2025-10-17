"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PersonalizedDashboardClientProps {
    userId: string
    gapAnalysis: any
    assessment: any
    roadmaps: any[]
    documents: any[]
    blueprints: any[]
}

export default function PersonalizedDashboardClient({
    userId,
    gapAnalysis,
    assessment,
    roadmaps,
    documents,
    blueprints
}: PersonalizedDashboardClientProps) {
    const router = useRouter()

    // Empty state - no gap analysis yet
    if (!gapAnalysis && !assessment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-12">
                <div className="container max-w-5xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Welcome to Your Dashboard! 🎯
                        </h1>
                        <p className="text-xl text-gray-600">
                            Complete your assessment to unlock personalized insights
                        </p>
                    </div>

                    <Card className="border-2 border-indigo-100">
                        <CardContent className="p-10">
                            <div className="mb-10">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                                    Your Path to AI Excellence
                                </h2>

                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="text-center">
                                        <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl font-bold text-indigo-600">1</span>
                                        </div>
                                        <h3 className="font-semibold mb-2">Quick Assessment</h3>
                                        <p className="text-sm text-gray-600">
                                            Answer strategic questions about your institution's AI readiness
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl font-bold text-indigo-600">2</span>
                                        </div>
                                        <h3 className="font-semibold mb-2">Get Your Roadmap</h3>
                                        <p className="text-sm text-gray-600">
                                            Receive NIST-aligned analysis and 30/60/90-day action plan
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl font-bold text-indigo-600">3</span>
                                        </div>
                                        <h3 className="font-semibold mb-2">Take Action</h3>
                                        <p className="text-sm text-gray-600">
                                            Follow prioritized recommendations and track progress
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-8">
                                <h3 className="font-semibold text-lg mb-3">What You'll Receive:</h3>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">AI Readiness Score (0-100)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">NIST Framework Gap Analysis</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">Implementation Roadmap</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">Priority Actions & Quick Wins</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <Button
                                    onClick={() => router.push("/assessment")}
                                    size="lg"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    Start Your Assessment <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // TODO: Full dashboard with gap analysis visualization
    // For now, show basic data summary
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-8">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your AI Readiness Dashboard</h1>
                    <p className="text-gray-600">Personalized insights and roadmap</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-indigo-600">
                                {gapAnalysis?.overall_score || assessment?.scores?.OVERALL?.percentage || "N/A"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Roadmaps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-600">{roadmaps.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-green-600">{documents.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Dashboard Enhancement In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            We're upgrading your dashboard with enhanced visualizations, NIST alignment insights, and interactive roadmap features.
                        </p>
                        <p className="text-sm text-gray-500">
                            Data loaded: {gapAnalysis ? "Gap Analysis ✓" : ""} {assessment ? "Assessment ✓" : ""} {roadmaps.length > 0 ? "Roadmaps ✓" : ""}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
