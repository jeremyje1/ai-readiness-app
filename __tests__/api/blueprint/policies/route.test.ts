/**
 * Tests for blueprint policy inline editing API
 */

import { PATCH, PUT } from '@/app/api/blueprint/[id]/policies/route';
import type { BlueprintPolicyClauseDraft, BlueprintPolicyRecommendation } from '@/types/blueprint';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let createClientMock: any;

vi.mock('@/lib/supabase/server', () => ({
    createClient: (...args: any[]) => createClientMock(...args)
}));

const blueprintId = 'bp-123';
const userId = 'user-123';

const baseClause = (overrides: Partial<BlueprintPolicyClauseDraft> = {}): BlueprintPolicyClauseDraft => ({
    clauseId: 'clause-1',
    title: 'Acceptable Use',
    tags: ['safety'],
    originalBody: 'Original acceptable use clause',
    currentBody: 'Original acceptable use clause',
    currentVersion: 1,
    metadata: {
        sourceVersion: 1,
        author: 'policy-engine'
    },
    revisions: [
        {
            version: 1,
            body: 'Original acceptable use clause',
            updatedAt: new Date('2024-01-01').toISOString(),
            updatedBy: 'system'
        }
    ],
    ...overrides
});

const baseRecommendation = (
    overrides: Partial<BlueprintPolicyRecommendation> = {}
): BlueprintPolicyRecommendation => ({
    templateId: 'template-1',
    templateName: 'AI Acceptable Use Policy',
    templateVersion: 1,
    audience: 'k12',
    matchScore: 0.82,
    matchReasons: ['Strong match with readiness gaps'],
    status: 'recommended',
    lastEvaluatedAt: new Date('2024-02-01').toISOString(),
    clauses: [baseClause()],
    ...overrides
});

let blueprintRow: { id: string; user_id: string; recommended_policies: BlueprintPolicyRecommendation[] };
let lastUpdatePayload: any;
let updateEqMock: any;

beforeEach(() => {
    vi.clearAllMocks();
    blueprintRow = {
        id: blueprintId,
        user_id: userId,
        recommended_policies: [baseRecommendation()]
    };

    lastUpdatePayload = null;
    updateEqMock = vi.fn(async () => ({ data: null, error: null }));

    const selectSingleMock = vi.fn(async () => ({ data: JSON.parse(JSON.stringify(blueprintRow)), error: null }));
    const selectMock = vi.fn(() => ({
        eq: vi.fn(() => ({
            single: selectSingleMock
        }))
    }));

    const updateMock = vi.fn((payload: any) => {
        lastUpdatePayload = payload;
        return {
            eq: updateEqMock
        };
    });

    const fromMock = vi.fn(() => ({
        select: selectMock,
        update: updateMock
    }));

    const authGetUserMock = vi.fn(async () => ({ data: { user: { id: userId } }, error: null }));

    createClientMock = vi.fn().mockResolvedValue({
        auth: {
            getUser: authGetUserMock
        },
        from: fromMock
    });
});

describe('/api/blueprint/[id]/policies', () => {
    it('saves inline clause edits and records a new revision', async () => {
        const updatedBody = 'Updated clause body with new guardrails.';
        const request = new Request('http://localhost/api/blueprint/bp-123/policies', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: 'template-1',
                clauseId: 'clause-1',
                body: updatedBody
            })
        });

        const response = await PUT(request, { params: Promise.resolve({ id: blueprintId }) });
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(payload.policies)).toBe(true);
        const [template] = payload.policies as BlueprintPolicyRecommendation[];
        const [clause] = template.clauses;

        expect(clause.currentBody).toBe(updatedBody);
        expect(clause.currentVersion).toBe(2);
        expect(clause.revisions).toHaveLength(2);
        expect(template.status).toBe('in_progress');
        expect(lastUpdatePayload.recommended_policies[0].clauses[0].currentBody).toBe(updatedBody);
        expect(updateEqMock).toHaveBeenCalledWith('id', blueprintId);
    });

    it('updates policy status transitions with metadata tracking', async () => {
        const request = new Request('http://localhost/api/blueprint/bp-123/policies', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'status',
                templateId: 'template-1',
                status: 'ready_for_review'
            })
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: blueprintId }) });
        const payload = await response.json();

        expect(response.status).toBe(200);
        const [template] = payload.policies as BlueprintPolicyRecommendation[];

        expect(template.status).toBe('ready_for_review');
        expect(template.lastEditedBy).toBe(userId);
        expect(lastUpdatePayload.recommended_policies[0].status).toBe('ready_for_review');
        expect(updateEqMock).toHaveBeenCalledWith('id', blueprintId);
    });

    it('reverts a clause to an earlier version and appends to revision history', async () => {
        blueprintRow.recommended_policies = [
            baseRecommendation({
                clauses: [
                    baseClause({
                        currentVersion: 2,
                        currentBody: 'Updated clause body',
                        revisions: [
                            {
                                version: 1,
                                body: 'Original acceptable use clause',
                                updatedAt: new Date('2024-01-01').toISOString(),
                                updatedBy: 'system'
                            },
                            {
                                version: 2,
                                body: 'Updated clause body',
                                updatedAt: new Date('2024-02-01').toISOString(),
                                updatedBy: userId
                            }
                        ]
                    })
                ]
            })
        ];

        const request = new Request('http://localhost/api/blueprint/bp-123/policies', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'revert',
                templateId: 'template-1',
                clauseId: 'clause-1',
                version: 1
            })
        });

        const response = await PATCH(request, { params: Promise.resolve({ id: blueprintId }) });
        const payload = await response.json();

        expect(response.status).toBe(200);
        const [template] = payload.policies as BlueprintPolicyRecommendation[];
        const [clause] = template.clauses;

        expect(template.status).toBe('in_progress');
        expect(clause.currentVersion).toBe(3);
        expect(clause.currentBody).toBe('Original acceptable use clause');
        expect(clause.revisions).toHaveLength(3);
        const latestRevision = clause.revisions[clause.revisions.length - 1];
        expect(latestRevision.version).toBe(3);
        expect(latestRevision.note).toMatch(/Reverted to version 1/);
        expect(lastUpdatePayload.recommended_policies[0].clauses[0].currentVersion).toBe(3);
    });
});
