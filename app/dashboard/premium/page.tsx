'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    Phone,
    RefreshCw,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface MetricCard {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
}

export default function PremiumDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [blueprintProgress, setBlueprintProgress] = useState(0);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load user profile and dashboard metrics
            const response = await fetch('/api/dashboard/premium-metrics');
            const data = await response.json();

            setUserName(data.userName || 'Leader');
            setInstitutionName(data.institutionName || 'Your Institution');
            setBlueprintProgress(data.blueprintProgress || 0);
            setUpcomingEvents(data.upcomingEvents || []);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const metrics: MetricCard[] = [
        {
            title: 'Implementation Progress',
            value: `${blueprintProgress}%`,
            change: '+12% this month',
            trend: 'up',
            icon: TrendingUp
        },
        {
            title: 'Team Members',
            value: 8,
            change: '+3 active today',
            trend: 'up',
            icon: Users
        },
        {
            title: 'Tasks Completed',
            value: 24,
            change: '6 due this week',
            trend: 'neutral',
            icon: CheckCircle2
        },
        {
            title: 'ROI Projection',
            value: '$1.2M',
            change: '3-year estimate',
            trend: 'up',
            icon: BarChart3
        }
    ];

    const quickActions = [
        {
            title: 'Schedule Expert Call',
            description: 'Book your monthly strategy session',
            icon: Phone,
            action: () => router.push('/expert-sessions/schedule'),
            color: 'bg-indigo-100 text-indigo-700'
        },
        {
            title: 'View AI Trends Report',
            description: 'October 2025 insights ready',
            icon: FileText,
            action: () => router.push('/reports/ai-trends'),
            color: 'bg-purple-100 text-purple-700'
        },
        {
            title: 'Join Office Hours',
            description: 'Next session: Tomorrow 2 PM',
            icon: Calendar,
            action: () => router.push('/events/office-hours'),
            color: 'bg-green-100 text-green-700'
        },
        {
            title: 'Browse Policy Templates',
            description: '52 templates available',
            icon: BookOpen,
            action: () => router.push('/resources/policies'),
            color: 'bg-amber-100 text-amber-700'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">Welcome back, {userName}</h1>
                                <Badge className="bg-amber-400 text-amber-900">Premium</Badge>
                            </div>
                            <p className="text-indigo-100">{institutionName} • AI Transformation Dashboard</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-indigo-200">Next expert session</p>
                            <p className="text-lg font-semibold">Oct 15, 2025 at 2:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Metrics Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <metric.icon className="h-6 w-6 text-gray-700" />
                                    </div>
                                    <Badge
                                        variant={metric.trend === 'up' ? 'default' : 'secondary'}
                                        className={metric.trend === 'up' ? 'bg-green-100 text-green-700' : ''}
                                    >
                                        {metric.change}
                                    </Badge>
                                </div>
                                <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                                <p className="text-sm text-gray-600">{metric.title}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <motion.div
                                key={action.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="p-4 cursor-pointer hover:shadow-lg transition-all group"
                                    onClick={action.action}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${action.color}`}>
                                            <action.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1 group-hover:text-indigo-600 transition-colors">
                                                {action.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">{action.description}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="progress" className="space-y-6">
                    <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                        <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
                        <TabsTrigger value="insights">AI Insights</TabsTrigger>
                        <TabsTrigger value="team">Team Activity</TabsTrigger>
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                    </TabsList>

                    <TabsContent value="progress" className="space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Blueprint Implementation Progress</h3>
                                <Button variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Update Progress
                                </Button>
                            </div>

                            {/* Phase Progress */}
                            <div className="space-y-4">
                                {[
                                    { phase: 'Foundation', progress: 100, status: 'completed' },
                                    { phase: 'Pilot Programs', progress: 75, status: 'in-progress' },
                                    { phase: 'Scaling', progress: 30, status: 'upcoming' },
                                    { phase: 'Optimization', progress: 0, status: 'future' }
                                ].map((phase) => (
                                    <div key={phase.phase}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{phase.phase}</span>
                                                {phase.status === 'completed' && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                )}
                                                {phase.status === 'in-progress' && (
                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-600">{phase.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${phase.status === 'completed' ? 'bg-green-600' :
                                                        phase.status === 'in-progress' ? 'bg-blue-600' :
                                                            'bg-gray-400'
                                                    }`}
                                                style={{ width: `${phase.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Key Milestones */}
                            <div className="mt-8">
                                <h4 className="font-semibold mb-4">Upcoming Milestones</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        <div className="flex-1">
                                            <p className="font-medium">Faculty AI Training Program Launch</p>
                                            <p className="text-sm text-gray-600">Due in 2 weeks</p>
                                        </div>
                                        <Button size="sm" variant="outline">View Tasks</Button>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Target className="h-5 w-5 text-gray-600" />
                                        <div className="flex-1">
                                            <p className="font-medium">Student Support Chatbot Pilot</p>
                                            <p className="text-sm text-gray-600">Due in 1 month</p>
                                        </div>
                                        <Button size="sm" variant="outline">View Tasks</Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* ROI Tracker */}
                        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">ROI Tracker</h3>
                                <Badge className="bg-green-100 text-green-700">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    On Track
                                </Badge>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Time Saved</p>
                                    <p className="text-2xl font-bold">320 hours/month</p>
                                    <p className="text-sm text-green-600">+45% from baseline</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Cost Reduction</p>
                                    <p className="text-2xl font-bold">$42,000/month</p>
                                    <p className="text-sm text-green-600">17% operational savings</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Student Satisfaction</p>
                                    <p className="text-2xl font-bold">4.6/5.0</p>
                                    <p className="text-sm text-green-600">+0.8 from last year</p>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-6">October 2025 AI Trends Report</h3>

                            {/* Executive Summary */}
                            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    Executive Summary
                                </h4>
                                <p className="text-gray-700">
                                    This month's analysis shows significant advancements in AI-powered student support systems,
                                    with 73% of peer institutions now implementing some form of AI tutoring. Your institution
                                    is well-positioned to leverage these trends with your current pilot programs.
                                </p>
                            </div>

                            {/* Key Insights */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-3">Key Insights for Your Institution</h4>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                title: 'AI Writing Assistants Gaining Traction',
                                                impact: 'High',
                                                recommendation: 'Consider expanding your Grammarly pilot to include AI writing tutors'
                                            },
                                            {
                                                title: 'Predictive Analytics for Student Success',
                                                impact: 'Medium',
                                                recommendation: 'Your current data infrastructure supports immediate implementation'
                                            },
                                            {
                                                title: 'Virtual Teaching Assistants',
                                                impact: 'High',
                                                recommendation: 'Align with your Q1 2026 roadmap for Course AI integration'
                                            }
                                        ].map((insight, index) => (
                                            <div key={index} className="border-l-4 border-indigo-600 pl-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h5 className="font-medium">{insight.title}</h5>
                                                    <Badge variant={insight.impact === 'High' ? 'destructive' : 'secondary'}>
                                                        {insight.impact} Impact
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">{insight.recommendation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button>
                                        Download Full Report
                                        <Download className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-6">Team Activity Overview</h3>

                            {/* Active Team Members */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-3">Active Team Members</h4>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Sarah Chen', role: 'CTO', lastActive: '2 hours ago', status: 'online' },
                                            { name: 'Michael Roberts', role: 'Provost', lastActive: '1 day ago', status: 'offline' },
                                            { name: 'Lisa Wang', role: 'Dir. Innovation', lastActive: '3 hours ago', status: 'online' }
                                        ].map((member) => (
                                            <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-sm text-gray-600">{member.role}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500">{member.lastActive}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">Recent Activity</h4>
                                    <div className="space-y-2">
                                        {[
                                            { action: 'Blueprint updated', user: 'Sarah Chen', time: '2 hours ago' },
                                            { action: 'Policy template downloaded', user: 'Michael Roberts', time: '1 day ago' },
                                            { action: 'Task completed: Faculty survey', user: 'Lisa Wang', time: '3 hours ago' }
                                        ].map((activity, index) => (
                                            <div key={index} className="flex items-start gap-3 p-2">
                                                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                                                <div className="flex-1">
                                                    <p className="text-sm">{activity.action}</p>
                                                    <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <Button className="w-full">
                                    <Users className="mr-2 h-4 w-4" />
                                    Invite Team Members
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Exclusive Content */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-4">Exclusive Resources</h3>
                                <div className="space-y-3">
                                    <Link href="/resources/case-studies" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Award className="h-5 w-5 text-indigo-600" />
                                                <div>
                                                    <p className="font-medium">Success Stories</p>
                                                    <p className="text-sm text-gray-600">12 new case studies</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </Link>

                                    <Link href="/resources/rfp-templates" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-purple-600" />
                                                <div>
                                                    <p className="font-medium">RFP Templates</p>
                                                    <p className="text-sm text-gray-600">AI vendor selection</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </Link>

                                    <Link href="/resources/webinars" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Zap className="h-5 w-5 text-amber-600" />
                                                <div>
                                                    <p className="font-medium">Expert Webinars</p>
                                                    <p className="text-sm text-gray-600">38 sessions available</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </Link>
                                </div>
                            </Card>

                            {/* Upcoming Events */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-4">Your Premium Events</h3>
                                <div className="space-y-3">
                                    <div className="p-3 border border-indigo-200 bg-indigo-50 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium">Monthly Strategy Call</h4>
                                            <Badge className="bg-indigo-600">1-on-1</Badge>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">Oct 15, 2025 at 2:00 PM EST</p>
                                        <Button size="sm" className="w-full">Join Call</Button>
                                    </div>

                                    <div className="p-3 border rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium">AI Office Hours</h4>
                                            <Badge variant="secondary">Group</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">Oct 10, 2025 at 3:00 PM EST</p>
                                        <Button size="sm" variant="outline" className="w-full">Add to Calendar</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}