'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Brain,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Lightbulb,
    Share2,
    Shield,
    Target,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrendInsight {
    title: string;
    category: string;
    impact: 'high' | 'medium' | 'low';
    timeframe: string;
    description: string;
    recommendations: string[];
    relevanceScore: number;
}

export default function AITrendsReport() {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    useEffect(() => {
        // Simulate loading report data
        setTimeout(() => {
            setReportData({
                generatedAt: new Date().toISOString(),
                institutionProfile: {
                    readinessScore: 72,
                    primaryFocus: 'Student Success',
                    currentPhase: 'Pilot Programs'
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

    const trendInsights: TrendInsight[] = [
        {
            title: 'Multi-Modal AI Learning Assistants',
            category: 'Academic Technology',
            impact: 'high',
            timeframe: '6-12 months',
            description: 'New AI models combining text, visual, and audio processing are revolutionizing personalized learning experiences.',
            recommendations: [
                'Evaluate Khan Academy\'s Khanmigo for your pilot programs',
                'Consider partnering with EdTech vendors for custom solutions',
                'Start with STEM courses where visual learning is crucial'
            ],
            relevanceScore: 95
        },
        {
            title: 'AI-Powered Mental Health Support',
            category: 'Student Services',
            impact: 'high',
            timeframe: '3-6 months',
            description: 'Universities are deploying AI chatbots for 24/7 mental health screening and support, reducing wait times by 70%.',
            recommendations: [
                'Review your current counseling center capacity',
                'Explore partnerships with Woebot or similar platforms',
                'Ensure FERPA and HIPAA compliance in vendor selection'
            ],
            relevanceScore: 88
        },
        {
            title: 'Automated Academic Integrity Monitoring',
            category: 'Governance',
            impact: 'medium',
            timeframe: '3 months',
            description: 'Advanced AI tools now detect contract cheating and sophisticated plagiarism with 94% accuracy.',
            recommendations: [
                'Update your academic integrity policies',
                'Train faculty on new detection capabilities',
                'Balance enforcement with educational approaches'
            ],
            relevanceScore: 76
        }
    ];

    const competitorAnalysis = [
        { institution: 'State University System', aiMaturity: 85, investment: '$12M', focus: 'Research & Analytics' },
        { institution: 'Regional Community Colleges', aiMaturity: 72, investment: '$3.5M', focus: 'Student Success' },
        { institution: 'Private Liberal Arts Peers', aiMaturity: 68, investment: '$2.8M', focus: 'Personalized Learning' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating your personalized AI trends report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex items-start justify-between">
                        <div>
                            <Badge className="bg-amber-400 text-amber-900 mb-4">Premium Report</Badge>
                            <h1 className="text-4xl font-bold mb-2">{currentMonth} AI Trends Report</h1>
                            <p className="text-xl text-indigo-100">Personalized insights for your institution's AI journey</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Executive Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="p-8 mb-8 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Brain className="h-6 w-6 text-indigo-600" />
                            Executive Summary
                        </h2>
                        <div className="prose max-w-none">
                            <p className="text-lg text-gray-700 mb-4">
                                This month's analysis reveals significant opportunities for your institution to leverage
                                emerging AI technologies, particularly in student support and personalized learning.
                                Based on your current pilot programs and 72% readiness score, we've identified
                                3 high-impact initiatives that align with your strategic goals.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-white rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <span className="font-semibold">Quick Win</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Deploy AI chatbot for admissions inquiries (2-week implementation)
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-5 w-5 text-amber-600" />
                                        <span className="font-semibold">Strategic Priority</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Launch multi-modal learning assistant pilot in Spring 2026
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <span className="font-semibold">Risk Mitigation</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Update AI governance framework for new federal guidelines
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Key Trends Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h2 className="text-2xl font-bold mb-6">Key AI Trends for Higher Education</h2>
                    <div className="space-y-6 mb-8">
                        {trendInsights.map((insight, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{insight.title}</h3>
                                            <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                                                {insight.impact} impact
                                            </Badge>
                                            <Badge variant="outline">{insight.category}</Badge>
                                        </div>
                                        <p className="text-gray-600 mb-4">{insight.description}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-2xl font-bold text-indigo-600">{insight.relevanceScore}%</div>
                                        <p className="text-sm text-gray-500">Relevance</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-amber-600" />
                                        Recommended Actions for Your Institution
                                    </h4>
                                    <ul className="space-y-2">
                                        {insight.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 flex items-center gap-4">
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {insight.timeframe}
                                        </Badge>
                                        <Button size="sm" variant="outline">
                                            Add to Roadmap
                                            <ArrowRight className="ml-2 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Competitive Landscape */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-indigo-600" />
                            Competitive AI Landscape
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <span className="font-semibold text-amber-900">Market Position Alert</span>
                                </div>
                                <p className="text-sm text-amber-800">
                                    Your institution ranks in the 68th percentile for AI readiness.
                                    Accelerating implementation could improve competitive positioning for student recruitment.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {competitorAnalysis.map((competitor, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{competitor.institution}</h4>
                                            <p className="text-sm text-gray-600">Focus: {competitor.focus}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-sm text-gray-500">AI Maturity</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-indigo-600 h-2 rounded-full"
                                                            style={{ width: `${competitor.aiMaturity}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{competitor.aiMaturity}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Annual Investment</p>
                                                <p className="font-semibold">{competitor.investment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Next Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <h2 className="text-2xl font-bold mb-4">Your Personalized Next Steps</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-white/10 rounded-lg p-4">
                                <Calendar className="h-8 w-8 mb-2" />
                                <h3 className="font-semibold mb-1">Schedule Strategy Call</h3>
                                <p className="text-sm text-indigo-100 mb-3">
                                    Discuss these insights with your AI expert
                                </p>
                                <Button size="sm" variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                                    Book Now
                                </Button>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <Users className="h-8 w-8 mb-2" />
                                <h3 className="font-semibold mb-1">Share with Team</h3>
                                <p className="text-sm text-indigo-100 mb-3">
                                    Get your stakeholders aligned on priorities
                                </p>
                                <Button size="sm" variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                                    Invite Team
                                </Button>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <Target className="h-8 w-8 mb-2" />
                                <h3 className="font-semibold mb-1">Update Blueprint</h3>
                                <p className="text-sm text-indigo-100 mb-3">
                                    Incorporate new trends into your roadmap
                                </p>
                                <Button size="sm" variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                                    Update Now
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}