'use client';

import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { Progress } from '@/components/progress';
import {
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Target
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface BlueprintProgressProps {
    blueprintId: string;
}

interface ProgressData {
    overall_progress: number;
    phases_completed: number;
    tasks_completed: number;
    tasks_total: number;
    is_on_track: boolean;
    budget_spent: number;
    budget_remaining?: number;
    days_elapsed: number;
    days_remaining?: number;
    milestones_completed: number;
    next_milestone?: string;
    next_milestone_date?: string;
    active_risks: number;
    open_issues: number;
    blockers: string[];
    last_updated: string;
}

export default function BlueprintProgressTracker({ blueprintId }: BlueprintProgressProps) {
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
        // Refresh every 30 seconds
        const interval = setInterval(fetchProgress, 30000);
        return () => clearInterval(interval);
    }, [blueprintId]);

    const fetchProgress = async () => {
        try {
            const response = await fetch(`/api/blueprint/${blueprintId}/progress`);
            if (!response.ok) throw new Error('Failed to fetch progress');
            const data = await response.json();
            setProgress(data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!progress) {
        return (
            <Card className="p-6">
                <p className="text-gray-600 text-center">No progress data available yet</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overall Progress */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Overall Progress</h3>
                    <Badge variant={progress.is_on_track ? 'default' : 'destructive'}>
                        {progress.is_on_track ? 'On Track' : 'Behind Schedule'}
                    </Badge>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Implementation Progress</span>
                        <span className="font-bold text-indigo-600">{progress.overall_progress}%</span>
                    </div>
                    <Progress value={progress.overall_progress} className="h-3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                            {progress.tasks_completed}
                        </div>
                        <div className="text-sm text-gray-600">Tasks Complete</div>
                        <div className="text-xs text-gray-500">of {progress.tasks_total}</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {progress.phases_completed}
                        </div>
                        <div className="text-sm text-gray-600">Phases Done</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {progress.milestones_completed}
                        </div>
                        <div className="text-sm text-gray-600">Milestones</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {progress.days_elapsed}
                        </div>
                        <div className="text-sm text-gray-600">Days Elapsed</div>
                        {progress.days_remaining && (
                            <div className="text-xs text-gray-500">{progress.days_remaining} remaining</div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Next Milestone */}
                {progress.next_milestone && (
                    <Card className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-600">Next Milestone</p>
                                <p className="font-bold truncate">{progress.next_milestone}</p>
                                {progress.next_milestone_date && (
                                    <p className="text-xs text-gray-500">
                                        {new Date(progress.next_milestone_date).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Budget Status */}
                {progress.budget_spent > 0 && (
                    <Card className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Budget Spent</p>
                                <p className="font-bold">${progress.budget_spent.toLocaleString()}</p>
                                {progress.budget_remaining && (
                                    <p className="text-xs text-gray-500">
                                        ${progress.budget_remaining.toLocaleString()} remaining
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Issues & Risks */}
                <Card className="p-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${progress.active_risks > 0 || progress.open_issues > 0
                                ? 'bg-red-100'
                                : 'bg-gray-100'
                            }`}>
                            <AlertCircle className={`h-5 w-5 ${progress.active_risks > 0 || progress.open_issues > 0
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Active Issues</p>
                            <p className="font-bold">
                                {progress.active_risks} Risks / {progress.open_issues} Issues
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Blockers Alert */}
            {progress.blockers && progress.blockers.length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-bold text-red-900 mb-2">Active Blockers</h4>
                            <ul className="space-y-1">
                                {progress.blockers.map((blocker, index) => (
                                    <li key={index} className="text-sm text-red-800">
                                        • {blocker}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>
            )}

            {/* Timeline Visualization */}
            <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Implementation Timeline</h3>
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                    <div
                        className="absolute left-0 top-0 w-1 bg-indigo-600 transition-all"
                        style={{ height: `${progress.overall_progress}%` }}
                    ></div>

                    <div className="space-y-6 ml-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 rounded-full ${progress.overall_progress >= 25 ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}></div>
                            <div className="flex-1">
                                <p className="font-medium">Foundation Phase</p>
                                <p className="text-sm text-gray-600">Initial setup and planning</p>
                            </div>
                            {progress.overall_progress >= 25 && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 rounded-full ${progress.overall_progress >= 50 ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}></div>
                            <div className="flex-1">
                                <p className="font-medium">Pilot Implementation</p>
                                <p className="text-sm text-gray-600">Testing with early adopters</p>
                            </div>
                            {progress.overall_progress >= 50 && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 rounded-full ${progress.overall_progress >= 75 ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}></div>
                            <div className="flex-1">
                                <p className="font-medium">Full Deployment</p>
                                <p className="text-sm text-gray-600">Institution-wide rollout</p>
                            </div>
                            {progress.overall_progress >= 75 && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 rounded-full ${progress.overall_progress >= 100 ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}></div>
                            <div className="flex-1">
                                <p className="font-medium">Optimization & Scaling</p>
                                <p className="text-sm text-gray-600">Continuous improvement</p>
                            </div>
                            {progress.overall_progress >= 100 && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500">
                Last updated: {new Date(progress.last_updated).toLocaleString()}
            </div>
        </div>
    );
}