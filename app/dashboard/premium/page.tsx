'use client';

import { RoiToolkit } from '@/components/dashboard/RoiToolkit';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCollaborationWorkspace } from '@/lib/hooks/useCollaborationWorkspace';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowRight,
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    Phone,
    RefreshCw,
    Sparkles,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface MetricCard {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
}

export default function PremiumDashboard() {
    const router = useRouter();
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [blueprintProgress, setBlueprintProgress] = useState(0);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

    const {
        loading: workspaceLoading,
        error: workspaceError,
        organization,
        role,
        teamMembers,
        phases,
        documents,
        room,
        summary,
        updateRoomContent,
        roomSaving,
        refreshWorkspace,
    } = useCollaborationWorkspace();

    const loadDashboardData = useCallback(async () => {
        setMetricsLoading(true);
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
            setMetricsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const getInitials = useCallback((name: string) => {
        if (!name) {
            return 'TM';
        }

        return name
            .split(' ')
            .map((part) => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'TM';
    }, []);

    const metrics: MetricCard[] = useMemo(() => {
        const totalRemaining = Math.max(summary.totalTasks - summary.completedTasks, 0);

        return [
            {
                title: 'Implementation Progress',
                value: `${blueprintProgress}%`,
                change: 'Updated weekly',
                trend: blueprintProgress >= 60 ? 'up' : 'neutral',
                icon: TrendingUp
            },
            {
                title: 'Active Team Members',
                value: summary.activeMembers,
                change: `${teamMembers.length} total members`,
                trend: summary.activeMembers > 0 ? 'up' : 'neutral',
                icon: Users
            },
            {
                title: 'Tasks Completed',
                value: summary.completedTasks,
                change: `${totalRemaining} remaining`,
                trend:
                    summary.totalTasks > 0 && summary.completedTasks >= summary.totalTasks ? 'up' : 'neutral',
                icon: CheckCircle2
            },
            {
                title: 'Overdue Tasks',
                value: summary.overdueTasks,
                change: summary.overdueTasks > 0 ? 'Needs attention' : 'All on track',
                trend: summary.overdueTasks > 0 ? 'down' : 'up',
                icon: AlertTriangle
            }
        ];
    }, [blueprintProgress, summary, teamMembers.length]);

    const phasesWithStats = useMemo(() => {
        const now = Date.now();
        return phases.map((phase) => {
            const tasks = phase.implementation_tasks ?? [];
            const completed = tasks.filter((task) => task.status === 'completed').length;
            const overdue = tasks.filter((task) => {
                if (!task.due_date || task.status === 'completed') {
                    return false;
                }
                const dueTime = new Date(task.due_date).getTime();
                return !Number.isNaN(dueTime) && dueTime < now;
            }).length;
            const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
            const derivedStatus =
                percent === 100
                    ? 'completed'
                    : tasks.some((task) => task.status === 'in_progress')
                        ? 'in_progress'
                        : phase.status ?? 'planning';

            return {
                phase,
                tasks,
                completed,
                total: tasks.length,
                overdue,
                percent,
                derivedStatus,
            };
        });
    }, [phases]);

    const upcomingMilestones = useMemo(() => {
        const milestones = phases
            .flatMap((phase) =>
                (phase.implementation_tasks ?? []).map((task) => ({
                    task,
                    phaseName: phase.phase_name,
                }))
            )
            .filter(({ task }) => task.status !== 'completed' && task.due_date)
            .map(({ task, phaseName }) => ({
                task,
                phaseName,
                dueTime: new Date(task.due_date as string).getTime(),
            }))
            .filter(({ dueTime }) => !Number.isNaN(dueTime))
            .sort((a, b) => a.dueTime - b.dueTime)
            .slice(0, 3);

        return milestones;
    }, [phases]);

    const recentComments = useMemo(() => {
        const memberById = new Map(teamMembers.map((member) => [member.id, member] as const));
        const comments = phases.flatMap((phase) =>
            (phase.implementation_tasks ?? []).flatMap((task) =>
                (task.comments ?? []).map((comment) => ({
                    comment,
                    taskTitle: task.task_title,
                    phaseName: phase.phase_name,
                    author: comment.author ?? (comment.author_id ? memberById.get(comment.author_id) ?? null : null),
                }))
            )
        );

        return comments
            .sort((a, b) => {
                const timeA = new Date(a.comment.created_at).getTime();
                const timeB = new Date(b.comment.created_at).getTime();
                return Number.isNaN(timeB) ? -1 : Number.isNaN(timeA) ? 1 : timeB - timeA;
            })
            .slice(0, 6);
    }, [phases, teamMembers]);

    const sortedMembers = useMemo(
        () =>
            [...teamMembers].sort((a, b) => {
                const timeA = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
                const timeB = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
                return timeB - timeA;
            }),
        [teamMembers]
    );

    const topDocuments = useMemo(() => documents.slice(0, 6), [documents]);

    const roomUpdatedLabel = useMemo(() => {
        if (!room?.updated_at) {
            return null;
        }

        const updatedAt = new Date(room.updated_at);
        if (Number.isNaN(updatedAt.getTime())) {
            return null;
        }

        return updatedAt.toLocaleString();
    }, [room?.updated_at]);

    const premiumEvents = useMemo(() => {
        return (upcomingEvents || [])
            .map((event) => ({
                ...event,
                dateObj: event?.date ? new Date(event.date) : null,
            }))
            .filter((event) => !event.date || (event.dateObj && !Number.isNaN(event.dateObj.getTime())))
            .sort((a, b) => {
                const timeA = a.dateObj ? a.dateObj.getTime() : Number.POSITIVE_INFINITY;
                const timeB = b.dateObj ? b.dateObj.getTime() : Number.POSITIVE_INFINITY;
                return timeA - timeB;
            });
    }, [upcomingEvents]);

    const formattedRole = useMemo(() => {
        if (!role) {
            return null;
        }

        return role
            .split('_')
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
            .join(' ');
    }, [role]);

    const organizationLabel = organization || institutionName || 'Your Institution';

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

    if (metricsLoading || workspaceLoading) {
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
                            <p className="text-indigo-100">
                                {organizationLabel} • AI Transformation Dashboard
                                {formattedRole ? ` • ${formattedRole}` : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-indigo-200">Next expert session</p>
                            <p className="text-lg font-semibold">Oct 15, 2025 at 2:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {workspaceError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Workspace Access Issue</AlertTitle>
                        <AlertDescription>{workspaceError}</AlertDescription>
                    </Alert>
                )}

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
                                <Button variant="outline" size="sm" onClick={() => refreshWorkspace()}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Update Progress
                                </Button>
                            </div>

                            {/* Phase Progress */}
                            <div className="space-y-4">
                                {phasesWithStats.length === 0 ? (
                                    <p className="text-sm text-gray-600">
                                        No implementation phases have been created yet. Use the collaboration workspace to plan your rollout.
                                    </p>
                                ) : (
                                    phasesWithStats.map(({ phase, percent, derivedStatus, completed, total, overdue }) => (
                                        <div key={phase.id}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{phase.phase_name}</span>
                                                    {derivedStatus === 'completed' && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    )}
                                                    {derivedStatus === 'in_progress' && (
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                                            Active
                                                        </Badge>
                                                    )}
                                                    {overdue > 0 && (
                                                        <Badge variant="destructive" className="bg-amber-100 text-amber-700 border border-amber-200">
                                                            {overdue} overdue
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {percent}% ({completed}/{total})
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${derivedStatus === 'completed'
                                                        ? 'bg-green-600'
                                                        : derivedStatus === 'in_progress'
                                                            ? 'bg-blue-600'
                                                            : 'bg-gray-400'
                                                        }`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Key Milestones */}
                            <div className="mt-8">
                                <h4 className="font-semibold mb-4">Upcoming Milestones</h4>
                                <div className="space-y-3">
                                    {upcomingMilestones.length === 0 ? (
                                        <p className="text-sm text-gray-600">
                                            No upcoming milestones. Assign due dates to tasks to track them here.
                                        </p>
                                    ) : (
                                        upcomingMilestones.map(({ task, phaseName }) => {
                                            const dueLabel = task.due_date
                                                ? new Date(task.due_date).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : 'No due date';

                                            return (
                                                <div key={task.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{task.task_title}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {phaseName} • Due {dueLabel}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="border-amber-200 text-amber-700">
                                                        {(task.priority || 'medium').toUpperCase()}
                                                    </Badge>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </Card>

                        <RoiToolkit organizationName={organization} />
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
                                    This month&rsquo;s analysis shows significant advancements in AI-powered student support systems,
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
                        <Card className="p-6 space-y-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="text-xl font-bold">Team Activity Overview</h3>
                                <Badge variant="secondary">{summary.activeMembers} active members</Badge>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Active Team Members</h4>
                                    {sortedMembers.length === 0 ? (
                                        <p className="text-sm text-gray-600">No team members yet. Invite colleagues to collaborate.</p>
                                    ) : (
                                        sortedMembers.map((member) => {
                                            const statusLabel = (member.status || 'active').replace(/_/g, ' ');
                                            const isActive = member.status !== 'inactive';
                                            return (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            {member.avatar_url ? (
                                                                <AvatarImage src={member.avatar_url} alt={member.full_name} />
                                                            ) : (
                                                                <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{member.full_name}</p>
                                                            <p className="text-sm text-gray-600">{member.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            variant="outline"
                                                            className={isActive ? 'border-green-200 text-green-700' : 'border-gray-300 text-gray-600'}
                                                        >
                                                            {statusLabel}
                                                        </Badge>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {member.last_active_at
                                                                ? new Date(member.last_active_at).toLocaleString()
                                                                : 'No activity recorded'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold">Recent Task Discussions</h4>
                                    {recentComments.length === 0 ? (
                                        <p className="text-sm text-gray-600">No comments yet. Start a thread on a task to collaborate.</p>
                                    ) : (
                                        recentComments.map(({ comment, taskTitle, phaseName, author }, index) => (
                                            <div key={`${comment.id}-${index}`} className="p-3 border border-gray-200 rounded-lg bg-white">
                                                <p className="text-sm text-gray-700">{comment.content}</p>
                                                <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                                                    <span>{author?.full_name || 'Workspace member'}</span>
                                                    <span>
                                                        {phaseName} • {taskTitle}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold">Team Documents</h4>
                                    {topDocuments.length === 0 ? (
                                        <p className="text-sm text-gray-600">No shared documents uploaded yet.</p>
                                    ) : (
                                        topDocuments.map((doc) => (
                                            <div key={doc.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium">{doc.title}</p>
                                                        <p className="text-xs text-gray-600">{doc.description || 'Shared reference document'}</p>
                                                    </div>
                                                    <Badge variant="outline">{(doc.tags && doc.tags.length > 0 ? doc.tags[0] : 'doc').toUpperCase()}</Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                                                    <span>
                                                        Updated{' '}
                                                        {doc.last_modified_at
                                                            ? new Date(doc.last_modified_at).toLocaleDateString()
                                                            : doc.created_at
                                                                ? new Date(doc.created_at).toLocaleDateString()
                                                                : 'recently'}
                                                    </span>
                                                    {doc.storage_path && (
                                                        <a
                                                            href={doc.storage_path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:underline"
                                                        >
                                                            Open
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold">{room?.title || 'Mission Control Notes'}</h4>
                                        <p className="text-xs text-gray-500">
                                            {roomSaving
                                                ? 'Saving shared note…'
                                                : roomUpdatedLabel
                                                    ? `Last updated ${roomUpdatedLabel}`
                                                    : 'Changes save automatically'}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">Collaborative Note</Badge>
                                </div>
                                <Textarea
                                    value={room?.content ?? ''}
                                    onChange={(event) => {
                                        if (!room) {
                                            return;
                                        }
                                        updateRoomContent(event.target.value);
                                    }}
                                    placeholder="Capture meeting agendas, decisions, and next steps for your AI rollout."
                                    disabled={!room}
                                />
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <Button variant="outline" onClick={() => refreshWorkspace()}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Sync Workspace
                                    </Button>
                                    <Button onClick={() => router.push('/team')}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Team
                                    </Button>
                                </div>
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
                                    {premiumEvents.length === 0 ? (
                                        <p className="text-sm text-gray-600">
                                            We&apos;ll notify you when new premium sessions are scheduled.
                                        </p>
                                    ) : (
                                        premiumEvents.map((event) => {
                                            const formattedDate = event.dateObj
                                                ? event.dateObj.toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                })
                                                : 'TBA';
                                            const action = () => {
                                                if (event.type === 'one-on-one') {
                                                    router.push('/expert-sessions/schedule');
                                                } else {
                                                    router.push('/events/office-hours');
                                                }
                                            };

                                            return (
                                                <div
                                                    key={event.id ?? `${event.title}-${formattedDate}`}
                                                    className="p-3 border border-indigo-200 bg-indigo-50 rounded-lg"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-medium">{event.title}</h4>
                                                            <p className="text-xs text-gray-500">{event.duration || 30} minute session</p>
                                                        </div>
                                                        <Badge className="bg-indigo-600">
                                                            {(event.type || 'premium').toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-2">{formattedDate}</p>
                                                    <Button size="sm" className="w-full" onClick={action}>
                                                        View Details
                                                    </Button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}