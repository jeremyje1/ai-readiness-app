'use client';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { Blueprint, BlueprintPolicyRecommendation, BlueprintTask } from '@/types/blueprint';
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    DollarSign,
    Download,
    Edit,
    GitBranch,
    RefreshCw,
    Share2,
    Target,
    TrendingUp,
    UserCircle2,
    Users
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BlueprintPoliciesPanel from './BlueprintPoliciesPanel';
import BlueprintUpgradeCTA from './BlueprintUpgradeCTA';

interface BlueprintViewerProps {
    blueprintId: string;
    onEdit?: () => void;
    onShare?: () => void;
}

interface TaskDependencyViewModel {
    id: string;
    label: string;
    phaseNumber?: number;
}

interface TaskViewModel {
    id: string;
    title: string;
    description?: string | null;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: string;
    estimatedHours?: number | null;
    department?: string | null;
    dueDate?: string | null;
    dependencies: TaskDependencyViewModel[];
}

interface PhaseViewModel {
    id: string;
    phaseNumber: number;
    title: string;
    duration: string;
    budget: number;
    objectives: string[];
    deliverables: string[];
    tasks: TaskViewModel[];
}

interface DepartmentTaskViewModel extends TaskViewModel {
    phaseNumber: number;
}

export default function BlueprintViewer({ blueprintId, onEdit, onShare }: BlueprintViewerProps) {
    const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]));
    const [regeneratingBlueprint, setRegeneratingBlueprint] = useState(false);
    const [regeneratingPhase, setRegeneratingPhase] = useState<number | null>(null);
    const subscription = useSubscription();
    const { toast } = useToast();
    const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const handlePoliciesUpdated = useCallback((policies: BlueprintPolicyRecommendation[]) => {
        setBlueprint((previous) => {
            if (!previous) return previous;
            return {
                ...previous,
                recommended_policies: policies,
                last_updated: new Date().toISOString()
            };
        });
    }, []);

    const fetchBlueprint = useCallback(async () => {
        try {
            const response = await fetch(`/api/blueprint/${blueprintId}`);
            if (!response.ok) throw new Error('Failed to fetch blueprint');
            const data = await response.json();
            setBlueprint(data);
        } catch (error) {
            console.error('Error fetching blueprint:', error);
        } finally {
            setLoading(false);
        }
    }, [blueprintId]);

    useEffect(() => {
        fetchBlueprint();
    }, [fetchBlueprint]);

    const togglePhase = (phaseNumber: number) => {
        const newExpanded = new Set(expandedPhases);
        if (newExpanded.has(phaseNumber)) {
            newExpanded.delete(phaseNumber);
        } else {
            newExpanded.add(phaseNumber);
        }
        setExpandedPhases(newExpanded);
    };

    const scrollToTask = useCallback((taskId: string) => {
        const target = taskRefs.current[taskId];
        if (!target) {
            toast({
                title: 'Task not visible',
                description: 'Expand the related phase to view this dependency.'
            });
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ring-2', 'ring-indigo-300', 'ring-offset-2');

        window.setTimeout(() => {
            target.classList.remove('ring-2', 'ring-indigo-300', 'ring-offset-2');
        }, 2000);
    }, [toast]);

    const handleDependencyNavigate = useCallback((dependency: TaskDependencyViewModel) => {
        if (!dependency?.id) return;

        const navigate = () => {
            window.requestAnimationFrame(() => scrollToTask(dependency.id));
        };

        if (dependency.phaseNumber) {
            const alreadyExpanded = expandedPhases.has(dependency.phaseNumber);
            setExpandedPhases((prev) => {
                if (prev.has(dependency.phaseNumber!)) {
                    return prev;
                }
                const next = new Set(prev);
                next.add(dependency.phaseNumber!);
                return next;
            });

            window.setTimeout(navigate, alreadyExpanded ? 0 : 200);
        } else {
            navigate();
        }
    }, [expandedPhases, scrollToTask]);

    const handleRegenerateBlueprint = async () => {
        if (regeneratingBlueprint) return;

        try {
            setRegeneratingBlueprint(true);
            const response = await fetch(`/api/blueprint/${blueprintId}/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scope: 'full' })
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to regenerate blueprint');
            }

            if (response.status === 202) {
                toast({
                    title: 'Regeneration started',
                    description: payload?.message || 'We are creating a fresh implementation plan. This page will refresh with new tasks shortly.'
                });
            } else {
                toast({
                    title: 'Blueprint regenerated',
                    description: payload?.message || 'All phases have been refreshed with updated AI recommendations.'
                });
            }

            setLoading(true);
            await fetchBlueprint();
        } catch (error) {
            console.error('Error regenerating blueprint:', error);
            const message = error instanceof Error ? error.message : 'Unable to regenerate the blueprint. Please try again.';
            toast({
                title: 'Blueprint regeneration failed',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setRegeneratingBlueprint(false);
        }
    };

    const handleRegeneratePhase = async (phaseNumber: number) => {
        if (regeneratingPhase === phaseNumber) return;

        try {
            setRegeneratingPhase(phaseNumber);
            const response = await fetch(`/api/blueprint/${blueprintId}/regenerate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scope: 'phase', phaseNumber })
            });
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to regenerate phase');
            }

            toast({
                title: `Phase ${phaseNumber} regenerated`,
                description: payload?.message || 'Phase recommendations have been refreshed with new AI tasks.'
            });

            setLoading(true);
            await fetchBlueprint();
        } catch (error) {
            console.error('Error regenerating phase:', error);
            const message = error instanceof Error ? error.message : 'Unable to regenerate this phase. Please try again.';
            toast({
                title: 'Phase regeneration failed',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setRegeneratingPhase(null);
        }
    };

    const getMaturityColor = (level: string) => {
        const colors: Record<string, string> = {
            'Beginning': 'bg-red-100 text-red-800',
            'Emerging': 'bg-yellow-100 text-yellow-800',
            'Developing': 'bg-blue-100 text-blue-800',
            'Advanced': 'bg-green-100 text-green-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const phasesToRender = useMemo<PhaseViewModel[]>(() => {
        if (!blueprint) return [];

        if (Array.isArray(blueprint.phases) && blueprint.phases.length > 0) {
            const taskMetaLookup = new Map<string, { title: string; phaseNumber: number }>();

            blueprint.phases.forEach((phase) => {
                const phaseNumber = Number(phase.phase_number ?? 0);
                (phase.blueprint_tasks || []).forEach((task) => {
                    const typedTask = task as Partial<BlueprintTask>;
                    if (typedTask?.id && typedTask?.task_title) {
                        taskMetaLookup.set(typedTask.id, {
                            title: typedTask.task_title,
                            phaseNumber
                        });
                    }
                });
            });

            const priorityOrder: Record<TaskViewModel['priority'], number> = {
                critical: 0,
                high: 1,
                medium: 2,
                low: 3
            };

            return blueprint.phases
                .map<PhaseViewModel>((phase) => {
                    const phaseNumber = Number(phase.phase_number ?? 0);
                    const objectives = Array.isArray(phase.objectives) ? phase.objectives : [];
                    const deliverables = Array.isArray(phase.deliverables) ? phase.deliverables : [];

                    const tasks = ((phase.blueprint_tasks || []) as Partial<BlueprintTask>[]) // Already sorted from API but double-sort to be safe
                        .map<TaskViewModel>((task) => {
                            const dependencyIds = Array.isArray(task?.dependencies) ? task?.dependencies : [];

                            return {
                                id: task?.id || `${phaseNumber}-${task?.task_title}`,
                                title: task?.task_title || 'Untitled Task',
                                description: task?.task_description ?? '',
                                priority: (task?.priority as TaskViewModel['priority']) || 'medium',
                                status: task?.status || 'pending',
                                estimatedHours: task?.estimated_hours ?? null,
                                department: task?.department ?? null,
                                dueDate: (task as any)?.due_date ?? null,
                                dependencies: dependencyIds.map((depId: string) => {
                                    const meta = taskMetaLookup.get(depId);
                                    return {
                                        id: depId,
                                        label: meta?.title || 'Related task',
                                        phaseNumber: meta?.phaseNumber
                                    };
                                })
                            };
                        })
                        .sort((a, b) => {
                            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                            if (priorityDiff !== 0) {
                                return priorityDiff;
                            }
                            return a.title.localeCompare(b.title);
                        });

                    return {
                        id: phase.id,
                        phaseNumber,
                        title: phase.title || `Phase ${phaseNumber}`,
                        duration: phase.duration || 'Duration TBD',
                        budget: Number(phase.budget ?? 0),
                        objectives,
                        deliverables,
                        tasks
                    };
                })
                .sort((a, b) => a.phaseNumber - b.phaseNumber);
        }

        if (Array.isArray(blueprint.implementation_phases) && blueprint.implementation_phases.length > 0) {
            return blueprint.implementation_phases
                .map<PhaseViewModel>((phase) => {
                    const objectives = Array.isArray(phase.objectives) ? phase.objectives : [];
                    const deliverables = Array.isArray(phase.deliverables) ? phase.deliverables : [];

                    const tasks = (phase.tasks || [])
                        .map<TaskViewModel>((task) => {
                            const dependencyIds = Array.isArray(task.dependencies) ? task.dependencies : [];
                            return {
                                id: task.id || `${phase.phase}-${task.title}`,
                                title: task.title,
                                description: task.description,
                                priority: task.priority,
                                status: 'pending',
                                estimatedHours: task.estimated_hours,
                                department: task.department,
                                dueDate: null,
                                dependencies: dependencyIds.map((dependency) => ({
                                    id: dependency,
                                    label: dependency,
                                    phaseNumber: phase.phase
                                }))
                            };
                        })
                        .sort((a, b) => a.title.localeCompare(b.title));

                    return {
                        id: `${blueprint.id}-${phase.phase}`,
                        phaseNumber: phase.phase,
                        title: phase.title,
                        duration: phase.duration,
                        budget: phase.budget || 0,
                        objectives,
                        deliverables,
                        tasks
                    };
                })
                .sort((a, b) => a.phaseNumber - b.phaseNumber);
        }

        return [];
    }, [blueprint]);

    const departmentTaskMap = useMemo<Record<string, DepartmentTaskViewModel[]>>(() => {
        const map: Record<string, DepartmentTaskViewModel[]> = {};

        phasesToRender.forEach((phase) => {
            phase.tasks.forEach((task) => {
                if (!task.department) return;
                const key = task.department;
                if (!map[key]) {
                    map[key] = [];
                }
                map[key].push({
                    ...task,
                    phaseNumber: phase.phaseNumber
                });
            });
        });

        Object.values(map).forEach((tasks) => {
            const priorityOrder: Record<TaskViewModel['priority'], number> = {
                critical: 0,
                high: 1,
                medium: 2,
                low: 3
            };

            tasks.sort((a, b) => {
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) {
                    return priorityDiff;
                }
                return a.title.localeCompare(b.title);
            });
        });

        return map;
    }, [phasesToRender]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!blueprint) {
        return (
            <Card className="p-6 text-center">
                <p className="text-gray-600">Blueprint not found</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{blueprint.title}</h1>
                            <Badge className={getMaturityColor(blueprint.maturity_level)}>
                                {blueprint.maturity_level}
                            </Badge>
                            {blueprint.status === 'generating' && (
                                <Badge variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Generating...
                                </Badge>
                            )}
                        </div>
                        <p className="text-gray-600">
                            Generated: {new Date(blueprint.generated_at).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Trial User Upgrade CTA */}
            {subscription.isTrialUser && (
                <BlueprintUpgradeCTA
                    isTrialUser={true}
                    daysLeftInTrial={subscription.daysLeftInTrial}
                    showFloatingCTA={true}
                />
            )}

            {/* Vision Statement */}
            <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-xl font-bold mb-3">Vision Statement</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                    {blueprint.vision_statement}
                </p>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Overall Readiness</p>
                            <p className="text-2xl font-bold">{blueprint.readiness_scores.overall}%</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Timeline</p>
                            <p className="text-2xl font-bold">
                                {blueprint.implementation_phases?.length || 0} Phases
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Budget</p>
                            <p className="text-2xl font-bold">
                                ${(blueprint.total_budget || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Departments</p>
                            <p className="text-2xl font-bold">
                                {blueprint.department_plans?.length || 0}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="phases">Implementation</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                    <TabsTrigger value="risks">Risks</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {blueprint.executive_summary}
                        </p>
                    </Card>

                    {blueprint.value_proposition && (
                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-4">Value Proposition</h3>
                            <p className="text-gray-700 mb-4">{blueprint.value_proposition.summary}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {blueprint.value_proposition.expected_roi}
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Time to Value</p>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {blueprint.value_proposition.timeline_to_value}
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Key Benefits</p>
                                    <p className="text-2xl font-bold text-purple-700">
                                        {blueprint.value_proposition.key_benefits?.length || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-bold mb-2">Key Benefits:</h4>
                                <ul className="space-y-2">
                                    {blueprint.value_proposition.key_benefits?.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    )}

                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">AI Readiness Scores</h3>

                        {/* Check if using legacy metrics */}
                        {blueprint.readiness_scores.dsch && !blueprint.readiness_scores.airs && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm">
                                        <p className="text-amber-800 font-medium">Legacy Metrics</p>
                                        <p className="text-amber-700 mt-1">This blueprint uses organizational readiness metrics. New blueprints will use AI-specific metrics (AIRS, AICS, AIMS, AIPS, AIBS) for more targeted insights.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Overall Score */}
                        {blueprint.readiness_scores.overall && (
                            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-indigo-600 font-medium">Overall AI Readiness</p>
                                        <p className="text-3xl font-bold text-indigo-900">{(blueprint.readiness_scores.overall * 100).toFixed(0)}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Maturity Level</p>
                                        <p className="text-lg font-semibold capitalize">{blueprint.maturity_level || 'Assessing'}</p>
                                    </div>
                                </div>
                            </div>
                        )}                        <div className="space-y-4">
                            {Object.entries(blueprint.readiness_scores).map(([key, value]) => {
                                if (key === 'overall') return null;
                                const score = typeof value === 'object' ? value.score : value;

                                // Define metric explanations for AI readiness metrics (AIRIX framework)
                                const metricInfo: Record<string, { name: string; description: string }> = {
                                    // AI-specific metrics
                                    airs: {
                                        name: 'AI Infrastructure & Resources',
                                        description: 'Data readiness, computing infrastructure, and digital resources for AI deployment'
                                    },
                                    aics: {
                                        name: 'AI Capability & Competence',
                                        description: 'Staff digital skills, AI/ML knowledge, and analytical competencies'
                                    },
                                    aims: {
                                        name: 'AI Implementation Maturity',
                                        description: 'Project governance, change management, and readiness to scale from pilot to production'
                                    },
                                    aips: {
                                        name: 'AI Policy & Ethics',
                                        description: 'Governance frameworks, bias mitigation, privacy protection, and regulatory compliance'
                                    },
                                    aibs: {
                                        name: 'AI Benefits Score',
                                        description: 'Expected ROI, service improvements, and net benefit realization potential'
                                    },
                                    // Legacy metrics (for backward compatibility)
                                    dsch: {
                                        name: 'Digital Strategy & Capability',
                                        description: 'Strategic planning, technology integration, and leadership alignment for AI initiatives'
                                    },
                                    crf: {
                                        name: 'Change Readiness',
                                        description: 'Organizational agility, innovation capacity, and ability to adapt to AI-driven changes'
                                    },
                                    lei: {
                                        name: 'Leadership Effectiveness',
                                        description: 'Leadership understanding, decision-making efficiency, and governance for AI adoption'
                                    },
                                    oci: {
                                        name: 'Organizational Culture',
                                        description: 'Employee engagement, collaboration, and cultural readiness for AI transformation'
                                    },
                                    hoci: {
                                        name: 'Operational Capability',
                                        description: 'Process efficiency, automation readiness, and technical infrastructure for AI'
                                    }
                                };

                                const info = metricInfo[key] || { name: key.toUpperCase(), description: '' };

                                return (
                                    <div key={key}>
                                        <div className="flex justify-between mb-1">
                                            <div>
                                                <span className="font-medium">{info.name}</span>
                                                {info.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
                                                )}
                                            </div>
                                            <span className="font-bold ml-4">{(score * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                                style={{ width: `${score * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </TabsContent>

                {/* Implementation Phases Tab */}
                <TabsContent value="phases" className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={handleRegenerateBlueprint}
                            disabled={regeneratingBlueprint}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${regeneratingBlueprint ? 'animate-spin' : ''}`} />
                            {regeneratingBlueprint ? 'Regenerating...' : 'Regenerate Blueprint'}
                        </Button>
                    </div>

                    {phasesToRender.length === 0 ? (
                        <Card className="p-6">
                            <p className="text-gray-600">Implementation phases will appear here once the blueprint generation finishes.</p>
                        </Card>
                    ) : (
                        phasesToRender.map((phase) => (
                            <Card key={phase.id} className="overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => togglePhase(phase.phaseNumber)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    togglePhase(phase.phaseNumber);
                                                }
                                            }}
                                            className="flex-1 text-left hover:bg-gray-50 transition-colors rounded-lg p-3 -m-3 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                {expandedPhases.has(phase.phaseNumber) ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                )}
                                                <h3 className="text-xl font-bold">
                                                    Phase {phase.phaseNumber}: {phase.title}
                                                </h3>
                                                <Badge variant="secondary">{phase.duration}</Badge>
                                            </div>
                                            <div className="ml-8 flex flex-wrap gap-4 text-sm text-gray-600">
                                                <span>Budget: ${phase.budget.toLocaleString()}</span>
                                                <span>Key Tasks: {phase.tasks.length}</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleRegeneratePhase(phase.phaseNumber);
                                            }}
                                            disabled={regeneratingPhase === phase.phaseNumber || regeneratingBlueprint}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${regeneratingPhase === phase.phaseNumber ? 'animate-spin' : ''}`} />
                                            {regeneratingPhase === phase.phaseNumber ? 'Regenerating...' : 'Regenerate Phase'}
                                        </Button>
                                    </div>

                                    {expandedPhases.has(phase.phaseNumber) && (
                                        <div className="mt-6 border-t pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-bold mb-3">Objectives</h4>
                                                    <ul className="space-y-2">
                                                        {phase.objectives.map((obj, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <Target className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-1" />
                                                                <span className="text-sm">{obj}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold mb-3">Deliverables</h4>
                                                    <ul className="space-y-2">
                                                        {phase.deliverables.map((del, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                                                                <span className="text-sm">{del}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {phase.tasks.length > 0 && (
                                                <div className="mt-6 space-y-3">
                                                    <h4 className="font-bold mb-3">AI-Recommended Tasks</h4>
                                                    {phase.tasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            ref={(element) => {
                                                                if (element) {
                                                                    taskRefs.current[task.id] = element;
                                                                } else {
                                                                    delete taskRefs.current[task.id];
                                                                }
                                                            }}
                                                            className="p-4 border border-gray-200 rounded-lg bg-white"
                                                        >
                                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900">{task.title}</p>
                                                                    {task.description && (
                                                                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        variant={
                                                                            task.priority === 'critical'
                                                                                ? 'destructive'
                                                                                : task.priority === 'high'
                                                                                    ? 'default'
                                                                                    : 'secondary'
                                                                        }
                                                                    >
                                                                        {task.priority}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="capitalize">
                                                                        {task.status}
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                                                                <div className="flex items-center gap-2">
                                                                    <UserCircle2 className="h-4 w-4 text-indigo-500" />
                                                                    <span>{task.department || 'Cross-functional'}</span>
                                                                </div>
                                                                {typeof task.estimatedHours === 'number' && task.estimatedHours > 0 && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-indigo-500" />
                                                                        <span>{task.estimatedHours} estimated hours</span>
                                                                    </div>
                                                                )}
                                                                {task.dueDate && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-indigo-500" />
                                                                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {task.dependencies.length > 0 && (
                                                                <div className="mt-3 flex items-start gap-3 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                                                                    <GitBranch className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="font-medium text-indigo-900 mb-1">Dependencies</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {task.dependencies.map((dependency) => (
                                                                                <button
                                                                                    key={dependency.id}
                                                                                    type="button"
                                                                                    onClick={() => handleDependencyNavigate(dependency)}
                                                                                    className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-2 py-1 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                                                >
                                                                                    <span>{dependency.label}</span>
                                                                                    {dependency.phaseNumber && dependency.phaseNumber !== phase.phaseNumber && (
                                                                                        <span className="text-[10px] text-indigo-500">Phase {dependency.phaseNumber}</span>
                                                                                    )}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Departments Tab */}
                <TabsContent value="departments" className="space-y-4">
                    {blueprint.department_plans?.map((dept, index) => {
                        const deptTasks = departmentTaskMap[dept.department] || [];

                        return (
                            <Card key={index} className="p-6">
                                <h3 className="text-xl font-bold mb-4">{dept.department}</h3>
                                <p className="text-gray-700 mb-4">{dept.overview}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold mb-3">Goals</h4>
                                        <ul className="space-y-2">
                                            {dept.specific_goals?.map((goal, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Target className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-1" />
                                                    <span className="text-sm">{goal}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-bold mb-3">Success Metrics</h4>
                                        <ul className="space-y-2">
                                            {dept.success_metrics?.map((metric, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                                                    <span className="text-sm">{metric}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-lg bg-indigo-50 p-4">
                                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <span className="font-medium">Budget:</span> ${dept.budget_allocation?.toLocaleString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">Training:</span> {dept.training_requirements?.length || 0} programs
                                        </div>
                                        <div>
                                            <span className="font-medium">Target completion:</span>{' '}
                                            {dept.timeline?.completion_date
                                                ? new Date(dept.timeline.completion_date).toLocaleDateString()
                                                : 'TBD'}
                                        </div>
                                        <div>
                                            <span className="font-medium">AI tasks:</span>{' '}
                                            {deptTasks.length}
                                        </div>
                                    </div>
                                </div>
                                {deptTasks.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-bold mb-3">Active Tasks</h4>
                                        <div className="space-y-2">
                                            {deptTasks.map((task) => (
                                                <div key={task.id} className="rounded-lg border border-gray-200 bg-white p-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                                        <span className="font-medium text-gray-900">{task.title}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={
                                                                    task.priority === 'critical'
                                                                        ? 'destructive'
                                                                        : task.priority === 'high'
                                                                            ? 'default'
                                                                            : 'secondary'
                                                                }
                                                            >
                                                                {task.priority}
                                                            </Badge>
                                                            <span className="text-xs text-gray-500">Phase {task.phaseNumber}</span>
                                                        </div>
                                                    </div>
                                                    {task.description && (
                                                        <p className="mt-1 text-xs text-gray-600">{task.description}</p>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-gray-500">
                                                        {typeof task.estimatedHours === 'number' && task.estimatedHours > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {task.estimatedHours} hrs
                                                            </span>
                                                        )}
                                                        {task.dependencies.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <GitBranch className="h-3 w-3" />
                                                                {task.dependencies.length} dependencies
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {dept.timeline?.milestones && dept.timeline.milestones.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-bold mb-3">Timeline</h4>
                                        <div className="space-y-2">
                                            {dept.timeline.milestones.map((milestone, milestoneIndex) => (
                                                <div
                                                    key={`${milestone.name}-${milestoneIndex}`}
                                                    className="rounded-lg border border-indigo-100 bg-indigo-50 p-3"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-indigo-900">
                                                        <span className="font-semibold">{milestone.name}</span>
                                                        <span className="text-xs">
                                                            {milestone.date
                                                                ? new Date(milestone.date).toLocaleDateString()
                                                                : 'TBD'}
                                                        </span>
                                                    </div>
                                                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                                                        <ul className="mt-2 list-disc pl-5 text-xs text-indigo-800 space-y-1">
                                                            {milestone.deliverables.map((deliverable, deliverableIndex) => (
                                                                <li key={`${milestone.name}-deliverable-${deliverableIndex}`}>
                                                                    {deliverable}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </TabsContent>

                {/* Quick Wins Tab */}
                <TabsContent value="quick-wins" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blueprint.quick_wins?.map((win, index) => (
                            <Card key={index} className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold flex-1">{win.title}</h3>
                                    <Badge
                                        variant={
                                            win.impact === 'high'
                                                ? 'default'
                                                : win.impact === 'medium'
                                                    ? 'secondary'
                                                    : 'outline'
                                        }
                                    >
                                        {win.impact} impact
                                    </Badge>
                                </div>
                                <p className="text-gray-700 mb-4">{win.description}</p>

                                <div className="flex gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Effort:</span> {win.effort}
                                    </div>
                                    <div>
                                        <span className="font-medium">Timeline:</span> {win.timeline}
                                    </div>
                                    <div>
                                        <span className="font-medium">Owner:</span> {win.owner}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Recommended Tools</h3>
                        <div className="space-y-4">
                            {blueprint.recommended_tools?.map((tool, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold">{tool.name}</h4>
                                        <Badge variant="secondary">{tool.category}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{tool.description}</p>
                                    <div className="flex gap-4 text-xs text-gray-600">
                                        <span>Pricing: {tool.pricing}</span>
                                        <span>Effort: {tool.implementation_effort}</span>
                                        {tool.training_required && <span>Training Required</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-4">
                    <BlueprintPoliciesPanel
                        blueprintId={blueprintId}
                        policies={blueprint.recommended_policies || []}
                        onPoliciesUpdated={handlePoliciesUpdated}
                    />
                </TabsContent>

                {/* Risks Tab */}
                <TabsContent value="risks" className="space-y-4">
                    {blueprint.risk_assessment?.map((risk, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${risk.impact === 'high' ? 'bg-red-100' :
                                    risk.impact === 'medium' ? 'bg-yellow-100' :
                                        'bg-green-100'
                                    }`}>
                                    <AlertTriangle className={`h-6 w-6 ${risk.impact === 'high' ? 'text-red-600' :
                                        risk.impact === 'medium' ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex gap-2 mb-2">
                                        <Badge variant="outline">{risk.category}</Badge>
                                        <Badge variant={risk.probability === 'high' ? 'destructive' : 'secondary'}>
                                            {risk.probability} probability
                                        </Badge>
                                        <Badge variant={risk.impact === 'high' ? 'destructive' : 'secondary'}>
                                            {risk.impact} impact
                                        </Badge>
                                    </div>
                                    <p className="text-gray-700 mb-3">{risk.description}</p>

                                    {/* Find and display mitigation strategy */}
                                    {blueprint.mitigation_strategies?.find(m => m.risk_id === risk.id) && (
                                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                            <p className="font-medium text-green-900 mb-1">Mitigation Strategy:</p>
                                            <p className="text-sm text-green-800">
                                                {blueprint.mitigation_strategies.find(m => m.risk_id === risk.id)?.strategy}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}