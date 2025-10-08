'use client';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Textarea } from '@/components/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type {
    BlueprintPolicyClauseDraft,
    BlueprintPolicyRecommendation,
    BlueprintPolicyStatus
} from '@/types/blueprint';
import {
    BadgeCheck,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Edit3,
    FileText,
    History,
    Loader2,
    ShieldAlert,
    Sparkles,
    Undo2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface BlueprintPoliciesPanelProps {
    blueprintId: string;
    policies: BlueprintPolicyRecommendation[];
    onPoliciesUpdated: (policies: BlueprintPolicyRecommendation[]) => void;
}

type ClauseKey = `${string}:${string}`;

type DraftState = Record<ClauseKey, string>;
type EditingState = Record<ClauseKey, boolean>;
type LoadingState = Record<ClauseKey, boolean>;
type TemplateLoadingState = Record<string, boolean>;

const statusLabels: Record<BlueprintPolicyStatus, string> = {
    recommended: 'Recommended',
    in_progress: 'In Progress',
    ready_for_review: 'Ready for Review',
    approved: 'Approved'
};

const statusBadgeClasses: Record<BlueprintPolicyStatus, string> = {
    recommended: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    in_progress: 'bg-blue-600 text-white border-blue-600',
    ready_for_review: 'border-amber-400 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200'
};

const statusOptions: BlueprintPolicyStatus[] = [
    'recommended',
    'in_progress',
    'ready_for_review',
    'approved'
];

const clauseKey = (templateId: string, clauseId: string): ClauseKey => `${templateId}:${clauseId}`;

export function BlueprintPoliciesPanel({ blueprintId, policies, onPoliciesUpdated }: BlueprintPoliciesPanelProps) {
    const { toast } = useToast();
    const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<DraftState>({});
    const [editing, setEditing] = useState<EditingState>({});
    const [savingClauses, setSavingClauses] = useState<LoadingState>({});
    const [statusUpdating, setStatusUpdating] = useState<TemplateLoadingState>({});
    const [revertingClauses, setRevertingClauses] = useState<LoadingState>({});

    useEffect(() => {
        const nextDrafts: DraftState = {};
        policies.forEach((template) => {
            template.clauses.forEach((clause) => {
                nextDrafts[clauseKey(template.templateId, clause.clauseId)] = clause.currentBody || clause.originalBody;
            });
        });
        setDrafts(nextDrafts);
        setEditing({});
    }, [policies]);

    const templateSummaries = useMemo(() => {
        return policies.map((template) => {
            const editingClauses = template.clauses.filter((clause) => editing[clauseKey(template.templateId, clause.clauseId)]);
            return {
                templateId: template.templateId,
                clausesCount: template.clauses.length,
                revisionsCount: template.clauses.reduce((total, clause) => total + (clause.revisions?.length || 0), 0),
                editingCount: editingClauses.length
            };
        });
    }, [policies, editing]);

    const toggleTemplate = (templateId: string) => {
        setExpandedTemplates((prev) => ({
            ...prev,
            [templateId]: !(prev[templateId] ?? true)
        }));
    };

    const setClauseEditing = (templateId: string, clauseId: string, value: boolean) => {
        setEditing((prev) => ({
            ...prev,
            [clauseKey(templateId, clauseId)]: value
        }));
    };

    const updateDraft = (templateId: string, clauseId: string, value: string) => {
        setDrafts((prev) => ({
            ...prev,
            [clauseKey(templateId, clauseId)]: value
        }));
    };

    const handleClauseSave = async (template: BlueprintPolicyRecommendation, clause: BlueprintPolicyClauseDraft) => {
        const key = clauseKey(template.templateId, clause.clauseId);
        const draftValue = drafts[key]?.trim();

        if (!draftValue) {
            toast({
                title: 'Clause body required',
                description: 'Please provide text for the clause before saving.',
                variant: 'destructive'
            });
            return;
        }

        if (draftValue === clause.currentBody) {
            setClauseEditing(template.templateId, clause.clauseId, false);
            return;
        }

        setSavingClauses((prev) => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(`/api/blueprint/${blueprintId}/policies`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: template.templateId,
                    clauseId: clause.clauseId,
                    body: draftValue,
                    note: 'Edited inline from blueprint viewer'
                })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to save clause changes');
            }

            onPoliciesUpdated(payload.policies || []);
            setClauseEditing(template.templateId, clause.clauseId, false);
            toast({
                title: 'Clause updated',
                description: `${template.templateName} • ${clause.title} saved successfully.`
            });
        } catch (error) {
            console.error('Error updating policy clause:', error);
            const message = error instanceof Error ? error.message : 'Unable to save changes. Please try again.';
            toast({
                title: 'Save failed',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setSavingClauses((prev) => ({ ...prev, [key]: false }));
        }
    };

    const handleStatusChange = async (template: BlueprintPolicyRecommendation, nextStatus: BlueprintPolicyStatus) => {
        if (template.status === nextStatus) return;

        setStatusUpdating((prev) => ({ ...prev, [template.templateId]: true }));

        try {
            const response = await fetch(`/api/blueprint/${blueprintId}/policies`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'status',
                    templateId: template.templateId,
                    status: nextStatus
                })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to update status');
            }

            onPoliciesUpdated(payload.policies || []);
            toast({
                title: 'Status updated',
                description: `${template.templateName} marked as ${statusLabels[nextStatus]}.`
            });
        } catch (error) {
            console.error('Error updating policy status:', error);
            const message = error instanceof Error ? error.message : 'Unable to update status. Please try again.';
            toast({
                title: 'Status update failed',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setStatusUpdating((prev) => ({ ...prev, [template.templateId]: false }));
        }
    };

    const handleRevert = async (template: BlueprintPolicyRecommendation, clause: BlueprintPolicyClauseDraft, version: number) => {
        const key = clauseKey(template.templateId, clause.clauseId);
        setRevertingClauses((prev) => ({ ...prev, [key]: true }));

        try {
            const response = await fetch(`/api/blueprint/${blueprintId}/policies`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'revert',
                    templateId: template.templateId,
                    clauseId: clause.clauseId,
                    version,
                    note: 'Reverted via blueprint viewer'
                })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.error || 'Failed to revert clause');
            }

            onPoliciesUpdated(payload.policies || []);
            toast({
                title: 'Clause reverted',
                description: `${clause.title} restored to version ${version}.`
            });
        } catch (error) {
            console.error('Error reverting clause:', error);
            const message = error instanceof Error ? error.message : 'Unable to revert this clause. Please try again.';
            toast({
                title: 'Revert failed',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setRevertingClauses((prev) => ({ ...prev, [key]: false }));
        }
    };

    if (!policies || policies.length === 0) {
        return (
            <Card className="p-8 text-center space-y-3">
                <Sparkles className="mx-auto h-10 w-10 text-indigo-500" />
                <h3 className="text-lg font-semibold">Policy recommendations are on the way</h3>
                <p className="text-sm text-gray-600">
                    Regenerate this blueprint or complete additional readiness assessments to unlock tailored policy drafts.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-indigo-50 border-indigo-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-900">Inline Policy Editing</h3>
                        <p className="text-sm text-indigo-800">
                            Tweak clauses, capture revision history, and move policies through review stages without leaving the blueprint.
                        </p>
                    </div>
                    <div className="flex gap-4 text-sm text-indigo-900">
                        {templateSummaries.map((summary) => (
                            <div key={summary.templateId} className="flex flex-col items-center">
                                <span className="font-semibold">{summary.clausesCount}</span>
                                <span className="text-xs uppercase tracking-wide text-indigo-600">Clauses</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                {policies.map((template) => {
                    const isExpanded = expandedTemplates[template.templateId] ?? true;
                    return (
                        <Card key={template.templateId} className="overflow-hidden">
                            <div className="border-b bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => toggleTemplate(template.templateId)}
                                    className="flex items-center gap-3 text-left"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-500" />
                                    )}
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            {template.templateName}
                                            <Badge variant="outline" className={cn('capitalize', statusBadgeClasses[template.status])}>
                                                {statusLabels[template.status]}
                                            </Badge>
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                                            <span className="inline-flex items-center gap-1">
                                                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                                Match {Math.round(template.matchScore * 100)}%
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-indigo-500" />
                                                Evaluated {new Date(template.lastEvaluatedAt).toLocaleDateString()}
                                            </span>
                                            {template.jurisdiction && (
                                                <span className="inline-flex items-center gap-1">
                                                    <ShieldAlert className="h-4 w-4 text-purple-500" />
                                                    {template.jurisdiction}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>

                                <div className="flex items-center gap-3">
                                    <Select
                                        value={template.status}
                                        onValueChange={(value) => handleStatusChange(template, value as BlueprintPolicyStatus)}
                                        disabled={statusUpdating[template.templateId]}
                                    >
                                        <SelectTrigger className="w-48 bg-white">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {statusLabels[option]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {statusUpdating[template.templateId] && (
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                    )}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-6 space-y-6">
                                    {template.matchReasons && template.matchReasons.length > 0 && (
                                        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
                                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4" /> Why this policy?
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {template.matchReasons.map((reason, index) => (
                                                    <li key={index}>{reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {template.clauses.map((clause) => {
                                            const key = clauseKey(template.templateId, clause.clauseId);
                                            const isEditing = editing[key] ?? false;
                                            const draftValue = drafts[key] ?? clause.currentBody;

                                            return (
                                                <div key={clause.clauseId} className="border border-gray-200 rounded-lg">
                                                    <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-white px-4 py-3">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-indigo-500" />
                                                                {clause.title}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                                                                <span>Version {clause.currentVersion}</span>
                                                                {clause.lastEditedAt && (
                                                                    <span>
                                                                        Last edited {new Date(clause.lastEditedAt).toLocaleString()}
                                                                    </span>
                                                                )}
                                                                {clause.tags?.map((tag) => (
                                                                    <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleClauseSave(template, clause)}
                                                                        disabled={!!savingClauses[key]}
                                                                    >
                                                                        {savingClauses[key] ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                        )}
                                                                        Save
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            updateDraft(template.templateId, clause.clauseId, clause.currentBody);
                                                                            setClauseEditing(template.templateId, clause.clauseId, false);
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setClauseEditing(template.templateId, clause.clauseId, true)}
                                                                >
                                                                    <Edit3 className="h-4 w-4 mr-1" />
                                                                    Edit clause
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="p-4 space-y-4">
                                                        {isEditing ? (
                                                            <Textarea
                                                                value={draftValue}
                                                                onChange={(event) => updateDraft(template.templateId, clause.clauseId, event.target.value)}
                                                                className="min-h-[180px]"
                                                            />
                                                        ) : (
                                                            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                                                                {clause.currentBody}
                                                            </div>
                                                        )}

                                                        {clause.revisions && clause.revisions.length > 0 && (
                                                            <div className="rounded-lg bg-gray-50 p-3">
                                                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                                                                    <History className="h-4 w-4" /> Revision history
                                                                </div>
                                                                <ul className="space-y-2">
                                                                    {[...clause.revisions]
                                                                        .sort((a, b) => b.version - a.version)
                                                                        .map((revision) => (
                                                                            <li key={`${clause.clauseId}-rev-${revision.version}`} className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                                                                                <div>
                                                                                    <span className="font-medium text-gray-800">Version {revision.version}</span>
                                                                                    <span className="ml-2 text-gray-500">
                                                                                        {new Date(revision.updatedAt).toLocaleString()}
                                                                                    </span>
                                                                                    {revision.note && <span className="ml-2 italic text-gray-500">{revision.note}</span>}
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        onClick={() => handleRevert(template, clause, revision.version)}
                                                                                        disabled={!!revertingClauses[key]}
                                                                                    >
                                                                                        {revertingClauses[key] ? (
                                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                                        ) : (
                                                                                            <Undo2 className="h-4 w-4 mr-1" />
                                                                                        )}
                                                                                        Revert
                                                                                    </Button>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default BlueprintPoliciesPanel;
