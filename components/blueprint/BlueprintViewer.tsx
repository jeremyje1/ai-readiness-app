'use client';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Blueprint } from '@/types/blueprint';
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
    Share2,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface BlueprintViewerProps {
    blueprintId: string;
    onEdit?: () => void;
    onShare?: () => void;
}

export default function BlueprintViewer({ blueprintId, onEdit, onShare }: BlueprintViewerProps) {
    const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]));

    useEffect(() => {
        fetchBlueprint();
    }, [blueprintId]);

    const fetchBlueprint = async () => {
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
    };

    const togglePhase = (phaseNumber: number) => {
        const newExpanded = new Set(expandedPhases);
        if (newExpanded.has(phaseNumber)) {
            newExpanded.delete(phaseNumber);
        } else {
            newExpanded.add(phaseNumber);
        }
        setExpandedPhases(newExpanded);
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
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="phases">Implementation</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
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
                        )}
                        
                        <div className="space-y-4">
                            {Object.entries(blueprint.readiness_scores).map(([key, value]) => {
                                if (key === 'overall') return null;
                                const score = typeof value === 'object' ? value.score : value;
                                
                                // Define metric explanations
                                const metricInfo: Record<string, { name: string; description: string }> = {
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
                    {blueprint.implementation_phases?.map((phase, index) => (
                        <Card key={index} className="overflow-hidden">
                            <button
                                onClick={() => togglePhase(phase.phase)}
                                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {expandedPhases.has(phase.phase) ? (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            )}
                                            <h3 className="text-xl font-bold">
                                                Phase {phase.phase}: {phase.title}
                                            </h3>
                                            <Badge variant="secondary">{phase.duration}</Badge>
                                        </div>
                                        <p className="text-gray-600 ml-8">
                                            Budget: ${(phase.budget || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {expandedPhases.has(phase.phase) && (
                                <div className="p-6 pt-0 border-t">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-bold mb-3">Objectives</h4>
                                            <ul className="space-y-2">
                                                {phase.objectives?.map((obj, i) => (
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
                                                {phase.deliverables?.map((del, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                                                        <span className="text-sm">{del}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {phase.tasks && phase.tasks.length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-bold mb-3">Key Tasks</h4>
                                            <div className="space-y-2">
                                                {phase.tasks.map((task, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium">{task.title}</p>
                                                            <p className="text-sm text-gray-600">{task.description}</p>
                                                        </div>
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
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </TabsContent>

                {/* Departments Tab */}
                <TabsContent value="departments" className="space-y-4">
                    {blueprint.department_plans?.map((dept, index) => (
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

                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Budget:</span> ${dept.budget_allocation?.toLocaleString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Training:</span> {dept.training_requirements?.length || 0} programs
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
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