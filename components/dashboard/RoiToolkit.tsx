'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Table } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
    calculateRoiMetrics,
    generateProposalMarkdown,
    RoiAssumptions,
} from '@/lib/roi/calculations';
import type { RoiScenario } from '@/types/roi';
import {
    BookOpen,
    CheckCircle2,
    CircleDollarSign,
    Copy,
    DollarSign,
    Download,
    FileText,
    Info,
    Lightbulb,
    LineChart,
    Loader2,
    RefreshCw,
    Save,
    Star,
    StarOff,
    Target,
    Timer,
    Trash2,
    Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface RoiToolkitProps {
    organizationName?: string | null;
}

interface ScenarioPreset {
    id: string;
    label: string;
    audienceLabel: string;
    description: string;
    assumptions: RoiAssumptions;
}

const defaultAssumptions: RoiAssumptions = {
    staffCount: 25,
    hoursSavedPerWeek: 3.5,
    hourlyRate: 48,
    aiToolsCost: 44000,
    trainingCost: 15000,
    changeManagementCost: 12000,
    additionalRevenue: 18000,
    studentImpactScore: 4.1,
    fundingGoal: 55000,
};

const scenarioPresets: ScenarioPreset[] = [
    {
        id: 'k12',
        label: 'K-12 District Pilot',
        audienceLabel: 'K-12 leadership & school board stakeholders',
        description: '25 instructional staff adopting AI lesson planning assistants across two campuses.',
        assumptions: {
            staffCount: 25,
            hoursSavedPerWeek: 3.8,
            hourlyRate: 44,
            aiToolsCost: 36000,
            trainingCost: 12000,
            changeManagementCost: 9000,
            additionalRevenue: 12000,
            studentImpactScore: 4.3,
            fundingGoal: 45000,
        },
    },
    {
        id: 'higher-ed',
        label: 'Higher Ed Academic Success',
        audienceLabel: 'Provost, CFO, and institutional advancement teams',
        description: 'Academic success center deploying AI coaching across tutoring and advising programs.',
        assumptions: {
            staffCount: 48,
            hoursSavedPerWeek: 2.7,
            hourlyRate: 52,
            aiToolsCost: 62000,
            trainingCost: 22000,
            changeManagementCost: 16000,
            additionalRevenue: 38000,
            studentImpactScore: 4.6,
            fundingGoal: 85000,
        },
    },
    {
        id: 'workforce-dev',
        label: 'Workforce Development Initiative',
        audienceLabel: 'Economic development & workforce innovation offices',
        description: 'Career services and employer partnerships team automating placement analytics.',
        assumptions: {
            staffCount: 32,
            hoursSavedPerWeek: 3.2,
            hourlyRate: 49,
            aiToolsCost: 51000,
            trainingCost: 18000,
            changeManagementCost: 14500,
            additionalRevenue: 52000,
            studentImpactScore: 3.9,
            fundingGoal: 78000,
        },
    },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: value >= 100000 ? 0 : 2,
    }).format(value);

const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const assumptionFields: Array<{
    key: keyof RoiAssumptions;
    label: string;
    description: string;
    min: number;
    max: number;
    step: number;
    prefix?: string;
    suffix?: string;
}> = [
        {
            key: 'staffCount',
            label: 'Staff impact scope',
            description: 'Total team members adopting AI workflows.',
            min: 1,
            max: 500,
            step: 1,
        },
        {
            key: 'hoursSavedPerWeek',
            label: 'Hours saved per staff (weekly)',
            description: 'Average time returned to each staff member every week.',
            min: 0,
            max: 12,
            step: 0.1,
            suffix: ' hrs',
        },
        {
            key: 'hourlyRate',
            label: 'Loaded hourly rate',
            description: 'Average hourly cost inclusive of benefits.',
            min: 20,
            max: 150,
            step: 1,
            prefix: '$',
        },
        {
            key: 'aiToolsCost',
            label: 'AI platform & integration cost (annual)',
            description: 'Licensing, integration, and data platform fees.',
            min: 0,
            max: 250000,
            step: 1000,
            prefix: '$',
        },
        {
            key: 'trainingCost',
            label: 'Training & enablement budget',
            description: 'Upskilling and professional learning investments.',
            min: 0,
            max: 150000,
            step: 1000,
            prefix: '$',
        },
        {
            key: 'changeManagementCost',
            label: 'Change management & compliance',
            description: 'Communications, governance, and policy operations.',
            min: 0,
            max: 120000,
            step: 1000,
            prefix: '$',
        },
        {
            key: 'additionalRevenue',
            label: 'Additional value streams',
            description: 'Tuition retention, funding incentives, or savings beyond labor.',
            min: 0,
            max: 250000,
            step: 1000,
            prefix: '$',
        },
        {
            key: 'studentImpactScore',
            label: 'Learner impact score',
            description: 'Expected student satisfaction uplift on a 1-5 scale.',
            min: 1,
            max: 5,
            step: 0.1,
        },
        {
            key: 'fundingGoal',
            label: 'Funding target',
            description: 'Goal for grants or executive budget requests.',
            min: 0,
            max: 200000,
            step: 1000,
            prefix: '$',
        },
    ];

const DEFAULT_SCENARIO_NAME = 'Custom ROI scenario';
const DEFAULT_AUDIENCE_LABEL = 'Institutional leadership & funding stakeholders';

export function RoiToolkit({ organizationName }: RoiToolkitProps) {
    const [assumptions, setAssumptions] = useState<RoiAssumptions>(defaultAssumptions);
    const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('custom');
    const [activeSavedScenarioId, setActiveSavedScenarioId] = useState<string | null>(null);
    const [audienceLabel, setAudienceLabel] = useState<string>(DEFAULT_AUDIENCE_LABEL);
    const [scenarioFormName, setScenarioFormName] = useState<string>(DEFAULT_SCENARIO_NAME);
    const [scenarioFormDescription, setScenarioFormDescription] = useState<string>('');
    const [savedScenarios, setSavedScenarios] = useState<RoiScenario[]>([]);
    const [loadingScenarios, setLoadingScenarios] = useState<boolean>(true);
    const [scenarioError, setScenarioError] = useState<string | null>(null);
    const [scenarioFeedback, setScenarioFeedback] = useState<string | null>(null);
    const [savingScenarioAction, setSavingScenarioAction] = useState<'idle' | 'create' | 'update'>('idle');
    const [deletingScenarioId, setDeletingScenarioId] = useState<string | null>(null);
    const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'calculator' | 'proposal' | 'guidance'>('calculator');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

    const { toast } = useToast();

    const selectedPreset = useMemo(() => {
        if (!selectedScenarioKey.startsWith('preset:')) {
            return undefined;
        }

        const presetId = selectedScenarioKey.split(':')[1];
        return scenarioPresets.find((scenario) => scenario.id === presetId);
    }, [selectedScenarioKey]);

    const activeSavedScenario = useMemo(
        () => savedScenarios.find((scenario) => scenario.id === activeSavedScenarioId) ?? null,
        [savedScenarios, activeSavedScenarioId]
    );

    const results = useMemo(() => calculateRoiMetrics(assumptions), [assumptions]);

    const sensitivity = useMemo(() => {
        const adjustments = [
            { label: '-10% hours saved', multiplier: 0.9 },
            { label: 'Baseline', multiplier: 1 },
            { label: '+15% hours saved', multiplier: 1.15 },
        ];

        return adjustments.map(({ label, multiplier }) => {
            const modified = calculateRoiMetrics({
                ...assumptions,
                hoursSavedPerWeek: Math.max(0, assumptions.hoursSavedPerWeek * multiplier),
            });

            return {
                label,
                roi: modified.roiPercentage,
                net: modified.netAnnualBenefit,
            };
        });
    }, [assumptions]);

    const proposalMarkdown = useMemo(
        () =>
            generateProposalMarkdown({
                organizationName,
                audienceLabel,
                assumptions,
                results,
            }),
        [organizationName, audienceLabel, assumptions, results]
    );

    const handleAssumptionChange = (key: keyof RoiAssumptions, value: number) => {
        setAssumptions((prev) => ({
            ...prev,
            [key]: Number.isFinite(value) ? value : prev[key],
        }));
        setSelectedScenarioKey('custom');
        setScenarioFeedback(null);
    };

    const handlePresetSelect = (preset: ScenarioPreset) => {
        setAssumptions(preset.assumptions);
        setSelectedScenarioKey(`preset:${preset.id}`);
        setActiveSavedScenarioId(null);
        setAudienceLabel(preset.audienceLabel);
        setScenarioFormName(preset.label);
        setScenarioFormDescription(preset.description);
        setScenarioFeedback(`Loaded preset: ${preset.label}`);
    };

    const sortScenarios = useCallback((scenarios: RoiScenario[]) => {
        return [...scenarios].sort((a, b) => {
            if (a.is_favorite !== b.is_favorite) {
                return a.is_favorite ? -1 : 1;
            }

            const updatedA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            const updatedB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            return updatedB - updatedA;
        });
    }, []);

    const readErrorMessage = async (response: Response) => {
        try {
            const data = await response.json();
            if (data?.error) {
                return data.error as string;
            }
        } catch (error) {
            // Ignore body parsing issues and fall back to status message
        }

        return `Request failed with status ${response.status}`;
    };

    const fetchSavedScenarios = useCallback(async () => {
        setLoadingScenarios(true);
        setScenarioError(null);

        try {
            const response = await fetch('/api/roi/scenarios');

            if (!response.ok) {
                if (response.status === 404) {
                    setSavedScenarios([]);
                    return;
                }

                throw new Error(await readErrorMessage(response));
            }

            const data = await response.json();
            const scenarios: RoiScenario[] = Array.isArray(data?.scenarios) ? data.scenarios : [];
            setSavedScenarios(sortScenarios(scenarios));
        } catch (error) {
            console.error('Unable to load ROI scenarios', error);
            setScenarioError(error instanceof Error ? error.message : 'Unable to load saved scenarios right now.');
        } finally {
            setLoadingScenarios(false);
        }
    }, [sortScenarios]);

    useEffect(() => {
        fetchSavedScenarios();
    }, [fetchSavedScenarios]);

    const handleSavedScenarioSelect = (scenario: RoiScenario) => {
        setAssumptions(scenario.assumptions);
        setSelectedScenarioKey(`saved:${scenario.id}`);
        setActiveSavedScenarioId(scenario.id);
        setAudienceLabel(scenario.audience_label || DEFAULT_AUDIENCE_LABEL);
        setScenarioFormName(scenario.name);
        setScenarioFormDescription(scenario.description || '');
        setScenarioFeedback(`Loaded scenario: ${scenario.name}`);
        setScenarioError(null);

        void (async () => {
            try {
                await fetch(`/api/roi/scenarios/${scenario.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lastUsedAt: new Date().toISOString() }),
                });
            } catch (error) {
                console.warn('Unable to update scenario last used timestamp', error);
            }
        })();
    };

    const handleResetToBaseline = () => {
        setAssumptions(defaultAssumptions);
        setSelectedScenarioKey('custom');
        setActiveSavedScenarioId(null);
        setAudienceLabel(DEFAULT_AUDIENCE_LABEL);
        setScenarioFormName(DEFAULT_SCENARIO_NAME);
        setScenarioFormDescription('');
        setScenarioFeedback(null);
        setScenarioError(null);
    };

    const buildScenarioPayload = () => ({
        name: scenarioFormName.trim(),
        description: scenarioFormDescription.trim() ? scenarioFormDescription.trim() : undefined,
        audienceLabel: audienceLabel.trim() || DEFAULT_AUDIENCE_LABEL,
        assumptions,
        results,
        isFavorite: activeSavedScenario?.is_favorite ?? false,
    });

    const handleCreateScenario = async () => {
        if (!scenarioFormName.trim()) {
            setScenarioError('Scenario name is required before saving.');
            return;
        }

        setSavingScenarioAction('create');
        setScenarioFeedback(null);
        setScenarioError(null);

        try {
            const response = await fetch('/api/roi/scenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buildScenarioPayload()),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response));
            }

            const data = await response.json();
            const scenario: RoiScenario = data.scenario;

            setSavedScenarios((prev) => {
                const filtered = prev.filter((item) => item.id !== scenario.id);
                return sortScenarios([scenario, ...filtered]);
            });

            setSelectedScenarioKey(`saved:${scenario.id}`);
            setActiveSavedScenarioId(scenario.id);
            setScenarioFeedback('Scenario saved successfully.');
            toast({
                title: 'Scenario saved',
                description: `"${scenario.name}" is now saved for your organization.`,
            });
        } catch (error) {
            console.error('Unable to save ROI scenario', error);
            const message = error instanceof Error ? error.message : 'Failed to save scenario.';
            setScenarioError(message);
            toast({
                title: 'Could not save scenario',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setSavingScenarioAction('idle');
        }
    };

    const handleUpdateScenario = async () => {
        if (!activeSavedScenarioId) {
            return handleCreateScenario();
        }

        if (!scenarioFormName.trim()) {
            setScenarioError('Scenario name is required before updating.');
            return;
        }

        setSavingScenarioAction('update');
        setScenarioFeedback(null);
        setScenarioError(null);

        try {
            const response = await fetch(`/api/roi/scenarios/${activeSavedScenarioId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...buildScenarioPayload(),
                    lastUsedAt: activeSavedScenario?.last_used_at ?? new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response));
            }

            const data = await response.json();
            const scenario: RoiScenario = data.scenario;

            setSavedScenarios((prev) => sortScenarios(prev.map((item) => (item.id === scenario.id ? scenario : item))));
            setScenarioFeedback('Scenario updated successfully.');
            toast({
                title: 'Scenario updated',
                description: `"${scenario.name}" has been refreshed with the latest numbers.`,
            });
        } catch (error) {
            console.error('Unable to update ROI scenario', error);
            const message = error instanceof Error ? error.message : 'Failed to update scenario.';
            setScenarioError(message);
            toast({
                title: 'Update failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setSavingScenarioAction('idle');
        }
    };

    const handleDeleteScenario = async (scenarioId: string) => {
        const scenarioToDelete = savedScenarios.find((scenario) => scenario.id === scenarioId);
        setDeletingScenarioId(scenarioId);
        setScenarioFeedback(null);
        setScenarioError(null);

        try {
            const response = await fetch(`/api/roi/scenarios/${scenarioId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response));
            }

            setSavedScenarios((prev) => sortScenarios(prev.filter((scenario) => scenario.id !== scenarioId)));

            if (activeSavedScenarioId === scenarioId) {
                setActiveSavedScenarioId(null);
                setSelectedScenarioKey('custom');
                setScenarioFeedback('Scenario deleted.');
            }

            toast({
                title: 'Scenario deleted',
                description: scenarioToDelete?.name
                    ? `"${scenarioToDelete.name}" has been removed from your saved scenarios.`
                    : 'Scenario removed from your saved scenarios.',
            });
        } catch (error) {
            console.error('Unable to delete ROI scenario', error);
            const message = error instanceof Error ? error.message : 'Failed to delete scenario.';
            setScenarioError(message);
            toast({
                title: 'Delete failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setDeletingScenarioId(null);
        }
    };

    const handleToggleFavorite = async (scenario: RoiScenario) => {
        setTogglingFavoriteId(scenario.id);
        setScenarioError(null);

        try {
            const response = await fetch(`/api/roi/scenarios/${scenario.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFavorite: !scenario.is_favorite }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response));
            }

            const data = await response.json();
            const updated: RoiScenario = data.scenario;

            setSavedScenarios((prev) => sortScenarios(prev.map((item) => (item.id === updated.id ? updated : item))));
            setScenarioFeedback(updated.is_favorite ? 'Scenario marked as favorite.' : 'Scenario removed from favorites.');
            toast({
                title: updated.is_favorite ? 'Added to favorites' : 'Removed from favorites',
                description: `"${updated.name}" ${updated.is_favorite ? 'will stay pinned to the top.' : 'is no longer pinned to the top.'}`,
            });
        } catch (error) {
            console.error('Unable to update scenario favorite status', error);
            const message = error instanceof Error ? error.message : 'Failed to update favorite status.';
            setScenarioError(message);
            toast({
                title: 'Favorite update failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setTogglingFavoriteId(null);
        }
    };

    const handleCopyProposal = async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
            setCopyStatus('error');
            setTimeout(() => setCopyStatus('idle'), 3000);
            return;
        }

        try {
            await navigator.clipboard.writeText(proposalMarkdown);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch (error) {
            console.error('Unable to copy proposal template', error);
            setCopyStatus('error');
            setTimeout(() => setCopyStatus('idle'), 3000);
        }
    };

    const handleDownloadProposal = () => {
        if (typeof window === 'undefined') {
            return;
        }

        const blob = new Blob([proposalMarkdown], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileSlug = (organizationName || 'ai-funding-proposal').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `${fileSlug || 'ai-funding-proposal'}.md`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const budgetLineItems = [
        {
            label: 'AI platform & integrations',
            amount: assumptions.aiToolsCost,
        },
        {
            label: 'Training & enablement',
            amount: assumptions.trainingCost,
        },
        {
            label: 'Change management & compliance',
            amount: assumptions.changeManagementCost,
        },
    ];

    return (
        <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                        <LineChart className="h-5 w-5" />
                        ROI Funding Toolkit
                    </div>
                    <p className="text-sm text-indigo-900/70 mt-1 max-w-xl">
                        Model savings, craft executive-ready talking points, and export grant-friendly narratives in minutes.
                    </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Interactive
                </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="calculator" className="flex items-center gap-2">
                        <Target className="h-4 w-4" /> Calculator
                    </TabsTrigger>
                    <TabsTrigger value="proposal" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Proposal Builder
                    </TabsTrigger>
                    <TabsTrigger value="guidance" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Grant Guidance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calculator" className="mt-0">
                    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-indigo-900">Scenario presets</p>
                                {scenarioPresets.map((preset) => {
                                    const isSelected = selectedScenarioKey === `preset:${preset.id}`;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => handlePresetSelect(preset)}
                                            className={`w-full rounded-lg border px-4 py-3 text-left transition-all hover:border-indigo-400 hover:shadow-sm ${isSelected ? 'border-indigo-500 bg-white shadow' : 'border-indigo-200 bg-white/70'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-indigo-900">{preset.label}</span>
                                                {isSelected && <Badge variant="secondary">Active</Badge>}
                                            </div>
                                            <p className="text-xs text-indigo-900/70 mt-1">{preset.description}</p>
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={handleResetToBaseline}
                                    className="w-full rounded-lg border border-dashed border-indigo-300 px-4 py-2 text-sm text-indigo-700 hover:border-indigo-500 hover:text-indigo-900"
                                >
                                    <Wand2 className="inline h-4 w-4 mr-2" />Reset to baseline
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-indigo-900">Saved scenarios</p>
                                    {loadingScenarios && (
                                        <span className="text-xs text-indigo-500 flex items-center gap-1">
                                            <Loader2 className="h-3 w-3 animate-spin" /> Loading
                                        </span>
                                    )}
                                </div>
                                {loadingScenarios ? (
                                    <div className="h-20 rounded-lg border border-indigo-200 bg-white/60 animate-pulse" />
                                ) : savedScenarios.length === 0 ? (
                                    <p className="text-xs text-indigo-900/70">No saved scenarios yet. Save a configuration below.</p>
                                ) : (
                                    savedScenarios.map((scenario) => {
                                        const isSelected = selectedScenarioKey === `saved:${scenario.id}`;
                                        return (
                                            <div
                                                key={scenario.id}
                                                className={`flex items-start justify-between rounded-lg border px-4 py-3 transition-all ${isSelected
                                                        ? 'border-indigo-500 bg-white shadow'
                                                        : 'border-indigo-200 bg-white/70 hover:border-indigo-400 hover:shadow-sm'
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => handleSavedScenarioSelect(scenario)}
                                                    className="flex-1 text-left"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-medium text-indigo-900">{scenario.name}</span>
                                                        {isSelected && <Badge variant="secondary">Active</Badge>}
                                                    </div>
                                                    <p className="text-xs text-indigo-900/70 mt-1">
                                                        {scenario.audience_label || DEFAULT_AUDIENCE_LABEL}
                                                    </p>
                                                    <p className="text-[11px] text-indigo-900/50 mt-1">
                                                        Updated {scenario.updated_at ? new Date(scenario.updated_at).toLocaleDateString() : 'recently'}
                                                    </p>
                                                </button>
                                                <div className="flex flex-col items-end gap-2 pl-3">
                                                    <button
                                                        type="button"
                                                        aria-label={scenario.is_favorite ? 'Remove favorite' : 'Mark as favorite'}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleToggleFavorite(scenario);
                                                        }}
                                                        className="rounded-full p-1 text-indigo-400 hover:text-amber-500 disabled:opacity-60"
                                                        disabled={togglingFavoriteId === scenario.id}
                                                    >
                                                        {togglingFavoriteId === scenario.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : scenario.is_favorite ? (
                                                            <Star className="h-4 w-4 text-amber-500" />
                                                        ) : (
                                                            <StarOff className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Delete scenario"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteScenario(scenario.id);
                                                        }}
                                                        className="rounded-full p-1 text-red-400 hover:text-red-600 disabled:opacity-60"
                                                        disabled={deletingScenarioId === scenario.id}
                                                    >
                                                        {deletingScenarioId === scenario.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="rounded-lg border border-indigo-100 bg-white/70 p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                                    <Save className="h-4 w-4" /> Scenario details
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roi-scenario-name" className="text-sm text-indigo-900">
                                        Scenario name
                                    </Label>
                                    <Input
                                        id="roi-scenario-name"
                                        value={scenarioFormName}
                                        onChange={(event) => {
                                            setScenarioFormName(event.target.value);
                                            setScenarioFeedback(null);
                                        }}
                                        placeholder="Executive summary scenario"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roi-scenario-audience" className="text-sm text-indigo-900">
                                        Audience focus
                                    </Label>
                                    <Input
                                        id="roi-scenario-audience"
                                        value={audienceLabel}
                                        onChange={(event) => {
                                            setAudienceLabel(event.target.value);
                                            setScenarioFeedback(null);
                                        }}
                                        placeholder="Funding stakeholders"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roi-scenario-description" className="text-sm text-indigo-900">
                                        Description (optional)
                                    </Label>
                                    <Textarea
                                        id="roi-scenario-description"
                                        value={scenarioFormDescription}
                                        onChange={(event) => {
                                            setScenarioFormDescription(event.target.value);
                                            setScenarioFeedback(null);
                                        }}
                                        placeholder="Add context for this scenario..."
                                        className="min-h-[80px]"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" onClick={handleCreateScenario} disabled={savingScenarioAction !== 'idle'}>
                                        {savingScenarioAction === 'create' ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Save as new
                                    </Button>
                                    {activeSavedScenarioId && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleUpdateScenario}
                                            disabled={savingScenarioAction !== 'idle'}
                                        >
                                            {savingScenarioAction === 'update' ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                            )}
                                            Update saved
                                        </Button>
                                    )}
                                </div>
                                {scenarioFeedback && <p className="text-xs text-green-600">{scenarioFeedback}</p>}
                                {scenarioError && <p className="text-xs text-red-600">{scenarioError}</p>}
                            </div>

                            <div className="rounded-lg border border-indigo-100 bg-white/70 p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                                    <Info className="h-4 w-4" />Key takeaways
                                </div>
                                <ul className="space-y-2 text-sm text-indigo-900/80">
                                    <li className="flex gap-2">
                                        <Timer className="h-4 w-4 mt-0.5 text-indigo-500" />
                                        <span>{formatNumber(results.annualHoursSaved)} hours returned to staff annually.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <DollarSign className="h-4 w-4 mt-0.5 text-indigo-500" />
                                        <span>{formatCurrency(results.netAnnualBenefit)} net annual benefit after program costs.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <Target className="h-4 w-4 mt-0.5 text-indigo-500" />
                                        <span>{formatPercent(results.roiPercentage)} projected ROI with payback in {results.paybackMonths ? `${results.paybackMonths.toFixed(1)} months` : 'the first implementation cycle'}.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {assumptionFields.map(({ key, label, description, min, max, step, prefix, suffix }) => {
                                    const numericValue = Number(assumptions[key]);
                                    let formattedValue: string;

                                    if (step < 1 || key === 'studentImpactScore') {
                                        formattedValue = numericValue.toFixed(1);
                                    } else {
                                        formattedValue = formatNumber(Math.round(numericValue));
                                    }

                                    const badgeLabel = prefix === '$'
                                        ? formatCurrency(numericValue)
                                        : `${prefix ?? ''}${formattedValue}${suffix ?? ''}`;

                                    return (
                                        <div key={key} className="rounded-lg border border-white/60 bg-white/80 p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold text-indigo-900">{label}</Label>
                                                <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200 bg-indigo-50">
                                                    {badgeLabel}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-indigo-900/70 mt-1">{description}</p>
                                            <div className="mt-3 space-y-2">
                                                <Slider
                                                    key={`${key}-${assumptions[key]}`}
                                                    defaultValue={[numericValue ?? 0]}
                                                    onValueChange={([value]) => handleAssumptionChange(key, Number(value))}
                                                    min={min}
                                                    max={max}
                                                    step={step}
                                                />
                                                <Input
                                                    type="number"
                                                    min={min}
                                                    max={max}
                                                    step={step}
                                                    value={numericValue}
                                                    onChange={(event) => handleAssumptionChange(key, Number(event.target.value))}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="rounded-lg bg-white p-4 shadow-sm border border-indigo-100">
                                    <div className="text-xs text-indigo-900/70">Annual hours saved</div>
                                    <div className="text-xl font-semibold text-indigo-900 mt-1">
                                        {formatNumber(results.annualHoursSaved)} hrs
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow-sm border border-indigo-100">
                                    <div className="text-xs text-indigo-900/70">Labor savings</div>
                                    <div className="text-xl font-semibold text-indigo-900 mt-1">
                                        {formatCurrency(results.annualLaborSavings)}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow-sm border border-indigo-100">
                                    <div className="text-xs text-indigo-900/70">Net annual benefit</div>
                                    <div className="text-xl font-semibold text-indigo-900 mt-1">
                                        {formatCurrency(results.netAnnualBenefit)}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-white p-4 shadow-sm border border-indigo-100">
                                    <div className="text-xs text-indigo-900/70">ROI & payback</div>
                                    <div className="text-xl font-semibold text-indigo-900 mt-1">
                                        {formatPercent(results.roiPercentage)} •{' '}
                                        {results.paybackMonths ? `${results.paybackMonths.toFixed(1)} mo` : 'Fast payback'}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-indigo-100 bg-white/80 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900 mb-3">
                                    <CircleDollarSign className="h-4 w-4" /> Sensitivity preview
                                </div>
                                <Table>
                                    <thead>
                                        <tr className="text-indigo-900/70">
                                            <th>Scenario</th>
                                            <th>Net Benefit</th>
                                            <th>ROI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sensitivity.map((entry) => (
                                            <tr key={entry.label}>
                                                <td>{entry.label}</td>
                                                <td>{formatCurrency(entry.net)}</td>
                                                <td>{formatPercent(entry.roi)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="proposal" className="mt-0">
                    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                        <div className="space-y-4 rounded-lg border border-indigo-100 bg-white/80 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                                <Lightbulb className="h-4 w-4" /> Messaging cues
                            </div>
                            <ul className="space-y-2 text-sm text-indigo-900/80">
                                <li>Lead with the {formatPercent(results.roiPercentage)} ROI headline.</li>
                                <li>Highlight {formatCurrency(results.netAnnualBenefit)} annual reinvestment capacity.</li>
                                <li>Showcase learner impact score of {assumptions.studentImpactScore.toFixed(1)} / 5.</li>
                                <li>Connect to funding goal of {formatCurrency(assumptions.fundingGoal)}.</li>
                            </ul>

                            <div className="pt-4 border-t border-dashed border-indigo-200">
                                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                                    <DollarSign className="h-4 w-4" /> Budget snapshot
                                </div>
                                <ul className="mt-2 space-y-1 text-sm text-indigo-900/80">
                                    {budgetLineItems.map((item) => (
                                        <li key={item.label} className="flex justify-between">
                                            <span>{item.label}</span>
                                            <span>{formatCurrency(item.amount)}</span>
                                        </li>
                                    ))}
                                    <li className="flex justify-between font-semibold text-indigo-900">
                                        <span>Total investment</span>
                                        <span>{formatCurrency(results.totalInvestment)}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-dashed border-indigo-200">
                                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                                    <Target className="h-4 w-4" /> Deployment markers
                                </div>
                                <ul className="mt-2 space-y-2 text-sm text-indigo-900/80">
                                    <li>✅ Secure funding approval and procurement within 30 days.</li>
                                    <li>✅ Launch enablement sprint and pilot programs in quarter one.</li>
                                    <li>✅ Publish ROI dashboard and success stories before renewal cycle.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h4 className="text-lg font-semibold text-indigo-900">Auto-generated proposal outline</h4>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleCopyProposal}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                                    </Button>
                                    <Button size="sm" onClick={handleDownloadProposal}>
                                        <Download className="h-4 w-4 mr-2" /> Download .md
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                value={proposalMarkdown}
                                readOnly
                                className="min-h-[420px] whitespace-pre-wrap font-mono text-xs"
                            />
                            {copyStatus === 'error' && (
                                <p className="text-sm text-red-600">Clipboard copy unavailable in this browser. Try downloading instead.</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="guidance" className="mt-0">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-lg border border-indigo-100 bg-white/80 p-5 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                                <BookOpen className="h-4 w-4" /> Grant-readiness checklist
                            </div>
                            <ul className="space-y-3 text-sm text-indigo-900/80">
                                <li>
                                    <strong>Align outcomes:</strong> Map ROI metrics to grant priorities such as workforce development,
                                    digital equity, or student success.
                                </li>
                                <li>
                                    <strong>Evidence portfolio:</strong> Package pilot results, testimonials, and data governance policies
                                    for reviewers.
                                </li>
                                <li>
                                    <strong>Budget narrative:</strong> Tie each cost item to a specific milestone and articulate sustainability
                                    beyond year one.
                                </li>
                                <li>
                                    <strong>Reporting cadence:</strong> Commit to quarterly impact stories and ROI dashboards shared with funders.
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-indigo-100 bg-white/80 p-5 space-y-4">
                            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                                <Lightbulb className="h-4 w-4" /> Budget planning guardrails
                            </div>
                            <ul className="space-y-3 text-sm text-indigo-900/80">
                                <li>
                                    <strong>Cap platform spend</strong> at {formatCurrency(assumptions.aiToolsCost * 1.1)} to account for contingencies.
                                </li>
                                <li>
                                    Dedicate <strong>{formatCurrency(assumptions.trainingCost * 0.2)}</strong> to ongoing professional learning to maintain adoption.
                                </li>
                                <li>
                                    Reserve a <strong>10% innovation buffer</strong> ({formatCurrency(results.totalInvestment * 0.1)}) for new AI use cases or compliance updates.
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-indigo-100 bg-white/80 p-5 space-y-4 lg:col-span-2">
                            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
                                <CircleDollarSign className="h-4 w-4" /> Suggested proposal outline
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-indigo-900/80">
                                <li>Executive summary featuring ROI headline and learner impact.</li>
                                <li>Needs assessment referencing baseline manual workload.</li>
                                <li>Implementation roadmap tied to grant deliverables.</li>
                                <li>Budget table mirroring the toolkit line items and total cost of {formatCurrency(results.totalInvestment)}.</li>
                                <li>Measurement plan outlining KPIs such as hours saved and satisfaction score.</li>
                            </ol>
                            <div className="rounded-md bg-indigo-50/80 border border-indigo-200 p-4 text-sm text-indigo-900/80 flex gap-3">
                                <Lightbulb className="h-4 w-4 text-indigo-600 mt-0.5" />
                                <p>
                                    Pair this guidance with your collaborative workspace notes to capture stakeholder quotes, pilot data,
                                    and in-kind contributions that strengthen grant competitiveness.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </Card>
    );
}
