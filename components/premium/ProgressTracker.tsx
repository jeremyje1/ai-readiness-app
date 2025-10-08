'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Circle,
    Clock,
    FileText,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Task {
    id: string;
    title: string;
    description: string;
    assignee?: string;
    dueDate: string;
    status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
    priority: 'high' | 'medium' | 'low';
    phase: string;
}

interface Milestone {
    id: string;
    title: string;
    date: string;
    status: 'achieved' | 'on-track' | 'at-risk' | 'upcoming';
    impact: string;
    tasks: Task[];
}

export default function ProgressTracker() {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
    const [overallProgress, setOverallProgress] = useState(0);

    useEffect(() => {
        // Load progress data
        loadProgressData();
    }, []);

    const loadProgressData = async () => {
        // Mock data - in production, fetch from API
        setMilestones([
            {
                id: '1',
                title: 'AI Governance Framework Launch',
                date: '2025-10-15',
                status: 'on-track',
                impact: 'Establishes ethical guidelines for all AI initiatives',
                tasks: [
                    {
                        id: 't1',
                        title: 'Draft AI ethics policy',
                        description: 'Create comprehensive policy document covering bias, privacy, and transparency',
                        assignee: 'Sarah Chen',
                        dueDate: '2025-10-10',
                        status: 'completed',
                        priority: 'high',
                        phase: 'Foundation'
                    },
                    {
                        id: 't2',
                        title: 'Faculty senate review',
                        description: 'Present policy to faculty senate for feedback and approval',
                        assignee: 'Michael Roberts',
                        dueDate: '2025-10-12',
                        status: 'in-progress',
                        priority: 'high',
                        phase: 'Foundation'
                    },
                    {
                        id: 't3',
                        title: 'Board approval',
                        description: 'Final presentation to board of trustees',
                        dueDate: '2025-10-15',
                        status: 'upcoming',
                        priority: 'high',
                        phase: 'Foundation'
                    }
                ]
            },
            {
                id: '2',
                title: 'Student Support AI Pilot',
                date: '2025-11-01',
                status: 'on-track',
                impact: 'Reduce response time for student inquiries by 80%',
                tasks: [
                    {
                        id: 't4',
                        title: 'Vendor selection',
                        description: 'Evaluate and select AI chatbot platform',
                        assignee: 'Lisa Wang',
                        dueDate: '2025-10-20',
                        status: 'in-progress',
                        priority: 'high',
                        phase: 'Pilot Programs'
                    },
                    {
                        id: 't5',
                        title: 'Integration with student portal',
                        description: 'Technical integration and SSO setup',
                        assignee: 'Tech Team',
                        dueDate: '2025-10-25',
                        status: 'upcoming',
                        priority: 'medium',
                        phase: 'Pilot Programs'
                    }
                ]
            }
        ]);

        // Calculate overall progress
        setOverallProgress(42);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'achieved':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'in-progress':
            case 'on-track':
                return <Clock className="h-5 w-5 text-blue-600" />;
            case 'at-risk':
            case 'overdue':
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default:
                return <Circle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'achieved':
                return 'bg-green-100 text-green-700';
            case 'in-progress':
            case 'on-track':
                return 'bg-blue-100 text-blue-700';
            case 'at-risk':
            case 'overdue':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Overall Progress Overview */}
            <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">AI Implementation Progress</h2>
                    <Badge className="bg-indigo-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12% this month
                    </Badge>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm text-gray-600">{overallProgress}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-3" />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-indigo-600">4</p>
                            <p className="text-sm text-gray-600">Phases</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600">12</p>
                            <p className="text-sm text-gray-600">Completed Tasks</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">8</p>
                            <p className="text-sm text-gray-600">In Progress</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-amber-600">2</p>
                            <p className="text-sm text-gray-600">At Risk</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Milestones Timeline */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Key Milestones</h3>
                    <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Timeline
                    </Button>
                </div>

                <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                        <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedMilestone === milestone.id ? 'border-indigo-600 bg-indigo-50' : 'hover:border-gray-300'
                                }`}
                            onClick={() => setSelectedMilestone(
                                selectedMilestone === milestone.id ? null : milestone.id
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    {getStatusIcon(milestone.status)}
                                    <div className="flex-1">
                                        <h4 className="font-semibold mb-1">{milestone.title}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{milestone.impact}</p>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="secondary" className={getStatusColor(milestone.status)}>
                                                {milestone.status.replace('-', ' ')}
                                            </Badge>
                                            <span className="text-sm text-gray-500">
                                                <Calendar className="inline h-3 w-3 mr-1" />
                                                {new Date(milestone.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                <Target className="inline h-3 w-3 mr-1" />
                                                {milestone.tasks.length} tasks
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${selectedMilestone === milestone.id ? 'rotate-90' : ''
                                    }`} />
                            </div>

                            {/* Expanded Task List */}
                            {selectedMilestone === milestone.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t"
                                >
                                    <div className="space-y-3">
                                        {milestone.tasks.map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(task.status)}
                                                    <div>
                                                        <p className="font-medium">{task.title}</p>
                                                        <p className="text-sm text-gray-600">{task.description}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {task.assignee && (
                                                                <span className="text-xs text-gray-500">
                                                                    <Users className="inline h-3 w-3 mr-1" />
                                                                    {task.assignee}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                <Clock className="inline h-3 w-3 mr-1" />
                                                                Due {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        task.priority === 'high' ? 'destructive' :
                                                            task.priority === 'medium' ? 'default' :
                                                                'secondary'
                                                    }
                                                    className="ml-2"
                                                >
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" variant="outline">
                                            <FileText className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Track Metrics
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Quick Wins Spotlight */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-bold">This Week&rsquo;s Quick Wins</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium">AI Writing Assistant deployed to English Department</p>
                            <p className="text-sm text-gray-600">85% faculty adoption in first week</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Automated transcript processing saves 120 hours/month</p>
                            <p className="text-sm text-gray-600">Registrar&rsquo;s office efficiency gain</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}