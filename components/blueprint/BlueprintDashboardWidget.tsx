'use client';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Progress } from '@/components/progress';
import {
    ArrowRight,
    Clock,
    FileText,
    Plus,
    Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BlueprintSummary {
    id: string;
    title: string;
    status: string;
    maturity_level: string;
    generated_at: string;
    progress?: {
        overall_progress: number;
        is_on_track: boolean;
    };
}

interface BlueprintDashboardWidgetProps {
    blueprints?: BlueprintSummary[];
    hasAssessment?: boolean;
    loading?: boolean;
}

export default function BlueprintDashboardWidget({
    blueprints: initialBlueprints = [],
    hasAssessment: initialHasAssessment = false,
    loading: initialLoading = false
}: BlueprintDashboardWidgetProps) {
    const router = useRouter();
    const [blueprints] = useState<BlueprintSummary[]>(initialBlueprints);
    const [loading] = useState(initialLoading);
    const [hasAssessment] = useState(initialHasAssessment);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            complete: 'bg-green-100 text-green-800',
            generating: 'bg-yellow-100 text-yellow-800',
            draft: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-bold">AI Implementation Blueprints</h2>
                </div>
                <Button
                    size="sm"
                    onClick={() => router.push('/blueprint/new')}
                    disabled={!hasAssessment}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Blueprint
                </Button>
            </div>

            {blueprints.length === 0 ? (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <FileText className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">No Blueprints Yet</h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        {hasAssessment
                            ? 'Create your first AI implementation blueprint to get a comprehensive roadmap tailored to your institution.'
                            : 'Complete an assessment first to unlock blueprint generation.'}
                    </p>
                    {hasAssessment ? (
                        <Button onClick={() => router.push('/blueprint/new')}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Create Your First Blueprint
                        </Button>
                    ) : (
                        <Button onClick={() => router.push('/assessment')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Start Assessment
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {blueprints.map((blueprint) => (
                            <div
                                key={blueprint.id}
                                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => router.push(`/blueprint/${blueprint.id}`)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold">{blueprint.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            Created: {new Date(blueprint.generated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(blueprint.status)}>
                                            {blueprint.status}
                                        </Badge>
                                        <Badge variant="outline">{blueprint.maturity_level}</Badge>
                                    </div>
                                </div>

                                {blueprint.progress && (
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-medium">
                                                {blueprint.progress.overall_progress}%
                                            </span>
                                        </div>
                                        <Progress value={blueprint.progress.overall_progress} className="h-2" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/blueprint')}
                        >
                            View All Blueprints
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </>
            )}

            {!hasAssessment && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Complete an AI readiness assessment to unlock blueprint generation.
                    </p>
                </div>
            )}
        </Card>
    );
}