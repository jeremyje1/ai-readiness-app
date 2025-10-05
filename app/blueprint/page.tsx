'use client';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import {
    Clock,
    FileText,
    Plus,
    Search,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Blueprint {
    id: string;
    title: string;
    status: string;
    maturity_level: string;
    generated_at: string;
    last_updated: string;
    total_budget: number;
    blueprint_goals: {
        timeline_preference: string;
        budget_range: string;
    };
    progress?: {
        overall_progress: number;
        is_on_track: boolean;
    };
}

export default function BlueprintListPage() {
    const router = useRouter();
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchBlueprints();
    }, [statusFilter]);

    const fetchBlueprints = async () => {
        try {
            const url = statusFilter === 'all'
                ? '/api/blueprint?limit=50'
                : `/api/blueprint?status=${statusFilter}&limit=50`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch blueprints');

            const data = await response.json();
            setBlueprints(data.blueprints || []);
        } catch (error) {
            console.error('Error fetching blueprints:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBlueprints = blueprints.filter(blueprint =>
        blueprint.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            complete: 'bg-green-100 text-green-800',
            generating: 'bg-yellow-100 text-yellow-800',
            draft: 'bg-gray-100 text-gray-800',
            updated: 'bg-blue-100 text-blue-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-indigo-600" />
                        AI Implementation Blueprints
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Comprehensive roadmaps for your AI transformation journey
                    </p>
                </div>
                <Button onClick={() => router.push('/blueprint/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Blueprint
                </Button>
            </div>

            {/* Stats Summary */}
            {blueprints.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-indigo-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Blueprints</p>
                                <p className="text-2xl font-bold">{blueprints.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Complete</p>
                                <p className="text-2xl font-bold">
                                    {blueprints.filter(b => b.status === 'complete').length}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold">
                                    {blueprints.filter(b => b.progress && b.progress.overall_progress < 100).length}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Generating</p>
                                <p className="text-2xl font-bold">
                                    {blueprints.filter(b => b.status === 'generating').length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters and Search */}
            <Card className="p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search blueprints..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('all')}
                            size="sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={statusFilter === 'complete' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('complete')}
                            size="sm"
                        >
                            Complete
                        </Button>
                        <Button
                            variant={statusFilter === 'generating' ? 'default' : 'outline'}
                            onClick={() => setStatusFilter('generating')}
                            size="sm"
                        >
                            Generating
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Blueprints Grid */}
            {filteredBlueprints.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                            <FileText className="h-10 w-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Blueprints Found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? 'Try adjusting your search criteria'
                                : 'Create your first blueprint to get started with AI implementation planning'}
                        </p>
                        {!searchTerm && (
                            <Button onClick={() => router.push('/blueprint/new')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Blueprint
                            </Button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlueprints.map((blueprint) => (
                        <Card
                            key={blueprint.id}
                            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/blueprint/${blueprint.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-2">{blueprint.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className={getStatusColor(blueprint.status)}>
                                            {blueprint.status}
                                        </Badge>
                                        <Badge variant="outline">{blueprint.maturity_level}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex justify-between">
                                    <span>Created:</span>
                                    <span className="font-medium">
                                        {new Date(blueprint.generated_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Budget:</span>
                                    <span className="font-medium">
                                        ${blueprint.total_budget?.toLocaleString() || '0'}
                                    </span>
                                </div>
                                {blueprint.blueprint_goals && (
                                    <div className="flex justify-between">
                                        <span>Timeline:</span>
                                        <span className="font-medium">
                                            {blueprint.blueprint_goals.timeline_preference}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {blueprint.progress && blueprint.status === 'complete' && (
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Implementation Progress</span>
                                        <span className="font-bold text-indigo-600">
                                            {blueprint.progress.overall_progress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all"
                                            style={{ width: `${blueprint.progress.overall_progress}%` }}
                                        />
                                    </div>
                                    {!blueprint.progress.is_on_track && (
                                        <p className="text-xs text-red-600 mt-1">Behind schedule</p>
                                    )}
                                </div>
                            )}

                            {blueprint.status === 'generating' && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 text-sm text-yellow-700">
                                        <Clock className="h-4 w-4 animate-spin" />
                                        <span>Generating blueprint... (2-3 minutes)</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}