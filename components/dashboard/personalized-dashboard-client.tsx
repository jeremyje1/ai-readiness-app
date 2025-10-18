"use client"

import ComplianceWatchlist from "@/components/ComplianceWatchlist"
import DocumentPolicyEngine from "@/components/DocumentPolicyEngine"
import ExecutiveDashboard from "@/components/ExecutiveDashboard"
import FundingJustificationGenerator from "@/components/FundingJustificationGenerator"
import PolicyPackLibrary from "@/components/PolicyPackLibrary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, CheckCircle2, FileText, Target, TrendingUp, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface PersonalizedDashboardClientProps {
    userId: string
    gapAnalysis: any
    assessment: any
    roadmaps: any[]
    documents: any[]
    blueprints: any[]
}

// Mock data for demo mode
const DEMO_DATA = {
    gapAnalysis: {
        overall_score: 73,
        readiness_level: "Developing",
        categories: {
            governance: { score: 78, gaps: 3 },
            infrastructure: { score: 65, gaps: 5 },
            curriculum: { score: 82, gaps: 2 },
            ethics: { score: 70, gaps: 4 },
            professional_development: { score: 68, gaps: 6 }
        }
    },
    blueprints: [
        {
            id: "demo-1",
            title: "AI Integration Roadmap - Fall 2025",
            status: "in_progress",
            maturity_level: "Level 2: Developing",
            generated_at: "2025-01-01",
            blueprint_progress: [{
                overall_progress: 45,
                is_on_track: true
            }]
        },
        {
            id: "demo-2",
            title: "Faculty AI Training Program",
            status: "planning",
            maturity_level: "Level 1: Initial",
            generated_at: "2024-12-15",
            blueprint_progress: [{
                overall_progress: 15,
                is_on_track: true
            }]
        }
    ],
    roadmaps: [
        { id: 1, roadmap_type: "30_day", title: "Quick Wins", status: "active" },
        { id: 2, roadmap_type: "60_day", title: "Foundation Building", status: "planned" },
        { id: 3, roadmap_type: "90_day", title: "Full Integration", status: "planned" }
    ],
    documents: [
        { id: 1, filename: "AI_Policy_Draft_v2.pdf", upload_date: "2025-01-05" },
        { id: 2, filename: "Curriculum_Guidelines.docx", upload_date: "2024-12-20" }
    ],
    metrics: {
        totalStaff: 127,
        trainedStaff: 58,
        completedActions: 12,
        totalActions: 27,
        nextMilestone: "Ethics Policy Review - Due Jan 15"
    }
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
    const [isDemoMode, setIsDemoMode] = useState(false)

    // Detect demo mode
    useEffect(() => {
        const demoMode = document.cookie.includes('demo-mode=true')
        setIsDemoMode(demoMode)
    }, [])

    // Use demo data if in demo mode
    const displayData = isDemoMode ? {
        gapAnalysis: DEMO_DATA.gapAnalysis,
        assessment: null,
        roadmaps: DEMO_DATA.roadmaps,
        documents: DEMO_DATA.documents,
        blueprints: DEMO_DATA.blueprints
    } : {
        gapAnalysis,
        assessment,
        roadmaps,
        documents,
        blueprints
    }

    // Empty state - no gap analysis yet (skip for demo mode)
    if (!displayData.gapAnalysis && !displayData.assessment && !isDemoMode) {
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

    // Dashboard with data (real or demo)
    const score = displayData.gapAnalysis?.overall_score || displayData.assessment?.scores?.OVERALL?.percentage || 0
    const readinessLevel = displayData.gapAnalysis?.readiness_level || "Unknown"

    const overviewContent = (
        <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="border-2 border-indigo-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Overall Readiness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <div className="text-4xl font-bold text-indigo-600">{score}</div>
                            <div className="text-sm text-gray-500 mb-1">/ 100</div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mt-1">{readinessLevel}</div>
                        {isDemoMode && (
                            <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
                                <TrendingUp className="h-4 w-4" />
                                <span>+12% vs last quarter</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Active Blueprints
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-600" data-tour="blueprints">
                            {displayData.blueprints.length}
                        </div>
                        {isDemoMode && DEMO_DATA.blueprints[0]?.blueprint_progress?.[0] && (
                            <div className="text-sm text-gray-600 mt-1">
                                {DEMO_DATA.blueprints[0].blueprint_progress[0].overall_progress}% complete
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Roadmaps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-600">{displayData.roadmaps.length}</div>
                        {isDemoMode && (
                            <div className="text-sm text-gray-600 mt-1">30/60/90 day plans</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {isDemoMode ? "Staff Training" : "Documents"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isDemoMode ? (
                            <>
                                <div className="text-4xl font-bold text-purple-600">
                                    {DEMO_DATA.metrics.trainedStaff}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    of {DEMO_DATA.metrics.totalStaff} staff trained
                                </div>
                            </>
                        ) : (
                            <div className="text-4xl font-bold text-purple-600">{displayData.documents.length}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {isDemoMode ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>NIST Framework Gap Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-5 gap-4">
                                {Object.entries(DEMO_DATA.gapAnalysis.categories).map(([key, data]) => (
                                    <div key={key} className="text-center">
                                        <div className="text-3xl font-bold text-indigo-600 mb-1">{data.score}</div>
                                        <div className="text-xs font-medium text-gray-700 capitalize mb-1">
                                            {key.replace('_', ' ')}
                                        </div>
                                        <div className="text-xs text-red-600">{data.gaps} gaps</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Implementation Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium">Completed Actions</span>
                                        <span className="text-gray-600">
                                            {DEMO_DATA.metrics.completedActions} / {DEMO_DATA.metrics.totalActions}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
                                            style={{ width: `${(DEMO_DATA.metrics.completedActions / DEMO_DATA.metrics.totalActions) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                    <p className="text-sm font-medium text-blue-900">
                                        Next Milestone: {DEMO_DATA.metrics.nextMilestone}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Implementation Blueprints</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {DEMO_DATA.blueprints.map((blueprint) => (
                                    <div key={blueprint.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{blueprint.title}</h3>
                                                <p className="text-sm text-gray-600">{blueprint.maturity_level}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${blueprint.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {blueprint.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        {blueprint.blueprint_progress[0] && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>Progress</span>
                                                    <span>{blueprint.blueprint_progress[0].overall_progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${blueprint.blueprint_progress[0].overall_progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard Enhancement In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            We're upgrading your dashboard with enhanced visualizations, NIST alignment insights, and interactive roadmap features.
                        </p>
                        <p className="text-sm text-gray-500">
                            Data loaded: {displayData.gapAnalysis ? "Gap Analysis ✓" : ""} {displayData.assessment ? "Assessment ✓" : ""} {displayData.roadmaps.length > 0 ? "Roadmaps ✓" : ""}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 py-8" data-tour="dashboard-content">
            <div className="container max-w-7xl mx-auto px-4 space-y-6">
                <div className="mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Your AI Readiness Dashboard
                        {isDemoMode && <span className="ml-3 text-lg text-yellow-600">(Demo Data)</span>}
                    </h1>
                    <p className="text-gray-600">
                        {isDemoMode
                            ? "Sample data showing typical district AI readiness metrics"
                            : "Personalized insights and roadmap"}
                    </p>
                </div>

                {isDemoMode ? (
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="w-full justify-start overflow-x-auto">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="policy">Policy & Governance</TabsTrigger>
                            <TabsTrigger value="leadership">Leadership & ROI</TabsTrigger>
                            <TabsTrigger value="funding">Funding & Grants</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
                            {overviewContent}
                        </TabsContent>
                        <TabsContent value="policy" className="space-y-6">
                            <DocumentPolicyEngine institutionType="K12" demoMode />
                            <ComplianceWatchlist demoMode />
                            <PolicyPackLibrary
                                assessmentId="demo-assessment"
                                institutionType="K12"
                                institutionName="NorthPath Unified School District"
                                state="CA"
                                demoMode
                            />
                        </TabsContent>
                        <TabsContent value="leadership" className="space-y-6">
                            <ExecutiveDashboard />
                        </TabsContent>
                        <TabsContent value="funding" className="space-y-6">
                            <FundingJustificationGenerator demoMode />
                        </TabsContent>
                    </Tabs>
                ) : (
                    overviewContent
                )}
            </div>
        </div>
    )
}
