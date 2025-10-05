'use client';

import BlueprintProgressTracker from '@/components/blueprint/BlueprintProgressTracker';
import BlueprintSharing from '@/components/blueprint/BlueprintSharing';
import BlueprintViewer from '@/components/blueprint/BlueprintViewer';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

interface BlueprintPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function BlueprintPage({ params }: BlueprintPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [showSharing, setShowSharing] = useState(false);
    const [blueprint, setBlueprint] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchBlueprint();

        // Auto-refresh if generating
        const interval = setInterval(() => {
            if (blueprint?.status === 'generating') {
                fetchBlueprint();
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [id, blueprint?.status]);

    const fetchBlueprint = async () => {
        try {
            const response = await fetch(`/api/blueprint/${id}`);
            if (!response.ok) throw new Error('Blueprint not found');

            const data = await response.json();
            setBlueprint(data);
        } catch (error) {
            console.error('Error fetching blueprint:', error);
            router.push('/blueprint');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBlueprint();
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (!blueprint) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Blueprint Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        The blueprint you're looking for doesn't exist or you don't have access to it.
                    </p>
                    <Button onClick={() => router.push('/blueprint')}>
                        View All Blueprints
                    </Button>
                </Card>
            </div>
        );
    }

    // Show generation status
    if (blueprint.status === 'generating') {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/blueprint')}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Blueprints
                </Button>

                <Card className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6 animate-pulse">
                        <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Generating Your Blueprint</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        We're creating your comprehensive AI implementation blueprint. This typically takes 2-3 minutes.
                    </p>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-64 bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>

                        <p className="text-sm text-gray-500">
                            Analyzing your assessment results and generating personalized recommendations...
                        </p>

                        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Check Status
                        </Button>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                        <p className="text-sm text-blue-900">
                            <strong>Tip:</strong> This page will automatically refresh when your blueprint is ready.
                            Feel free to navigate away and come back later.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.push('/blueprint')}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blueprints
            </Button>

            {/* Main Tabs */}
            <Tabs defaultValue="blueprint" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="blueprint" className="mt-6">
                    <BlueprintViewer
                        blueprintId={id}
                        onShare={() => setShowSharing(true)}
                        onEdit={() => {
                            // TODO: Implement edit functionality
                            alert('Edit functionality coming soon!');
                        }}
                    />
                </TabsContent>

                <TabsContent value="progress" className="mt-6">
                    <BlueprintProgressTracker blueprintId={id} />
                </TabsContent>
            </Tabs>

            {/* Sharing Modal */}
            {showSharing && blueprint && (
                <BlueprintSharing
                    blueprintId={blueprint.id}
                    isPublic={blueprint.is_public}
                    shareToken={blueprint.share_token}
                    sharedWith={blueprint.shared_with || []}
                    onClose={() => setShowSharing(false)}
                />
            )}
        </div>
    );
}