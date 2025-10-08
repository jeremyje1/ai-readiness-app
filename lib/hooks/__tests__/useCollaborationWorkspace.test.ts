import { afterEach, describe, expect, it, vi } from 'vitest';

import {
    STATUS_ORDER,
    attachCommentsToPhases,
    buildWorkspaceSummary,
    type WorkspaceSummary,
} from '@/lib/hooks/useCollaborationWorkspace';
import type {
    ImplementationPhase,
    ImplementationTask,
    TaskComment,
    TeamMember,
} from '@/types/collaboration';

const createTask = (
    overrides: Partial<ImplementationTask> & Pick<ImplementationTask, 'id' | 'status' | 'priority'>,
): ImplementationTask => ({
    id: overrides.id,
    organization: overrides.organization ?? 'org-1',
    phase_id: overrides.phase_id ?? 'phase-1',
    task_title: overrides.task_title ?? `Task ${overrides.id}`,
    description: overrides.description ?? null,
    status: overrides.status,
    priority: overrides.priority,
    due_date: overrides.due_date ?? null,
    assigned_to: overrides.assigned_to ?? null,
    created_at: overrides.created_at ?? '2025-10-01T00:00:00.000Z',
    updated_at: overrides.updated_at ?? '2025-10-01T00:00:00.000Z',
    comments: overrides.comments,
});

describe('attachCommentsToPhases', () => {
    it('aggregates comments and sorts tasks by status and due date', () => {
        const phases: ImplementationPhase[] = [
            {
                id: 'phase-1',
                organization: 'org-1',
                phase_name: 'Foundation',
                phase_order: 1,
                status: 'active',
                implementation_tasks: [
                    createTask({ id: 'task-1', status: 'in_progress', priority: 'medium', due_date: '2025-10-12' }),
                    createTask({ id: 'task-2', status: 'todo', priority: 'high', due_date: '2025-10-05' }),
                    createTask({ id: 'task-3', status: 'blocked', priority: 'critical', due_date: '2025-10-15' }),
                    createTask({ id: 'task-4', status: 'completed', priority: 'low', due_date: '2025-09-30' }),
                    createTask({ id: 'task-5', status: 'todo', priority: 'medium', due_date: '2025-10-10' }),
                ],
            },
        ];

        const comments: TaskComment[] = [
            {
                id: 'comment-1',
                organization: 'org-1',
                task_id: 'task-2',
                author_id: 'member-1',
                content: 'Draft kickoff agenda.',
                created_at: '2025-10-02T13:00:00.000Z',
                updated_at: '2025-10-02T13:00:00.000Z',
            },
            {
                id: 'comment-2',
                organization: 'org-1',
                task_id: 'task-5',
                author_id: 'member-2',
                content: 'Need updated budget numbers.',
                created_at: '2025-10-03T09:30:00.000Z',
                updated_at: '2025-10-03T09:30:00.000Z',
            },
            {
                id: 'comment-3',
                organization: 'org-1',
                task_id: 'task-5',
                author_id: 'member-3',
                content: 'Finance is working on this.',
                created_at: '2025-10-04T15:10:00.000Z',
                updated_at: '2025-10-04T15:10:00.000Z',
            },
        ];

        const enriched = attachCommentsToPhases(phases, comments);
        const tasks = enriched[0].implementation_tasks ?? [];

        // Status ordering should respect STATUS_ORDER while keeping earlier due dates first within the same status.
        const orderedStatuses = tasks.map((task) => task.status);
        const expectedOrder = ['todo', 'todo', 'in_progress', 'blocked', 'completed'];
        expect(orderedStatuses).toEqual(expectedOrder);

        const orderedIds = tasks.map((task) => task.id);
        expect(orderedIds.slice(0, 2)).toEqual(['task-2', 'task-5']); // todo tasks sorted by due date

        const taskWithComments = tasks.find((task) => task.id === 'task-5');
        expect(taskWithComments?.comments?.length).toBe(2);
        expect(taskWithComments?.comments?.map((comment) => comment.id)).toEqual(['comment-2', 'comment-3']);

        const completedTask = tasks.find((task) => task.id === 'task-4');
        expect(completedTask?.comments).toEqual([]);

        // Ensure all original tasks remain after enrichment.
        expect(tasks).toHaveLength(phases[0].implementation_tasks?.length ?? 0);

        // STATUS_ORDER should still include the same statuses to guarantee expectations remain aligned with implementation.
        expect(STATUS_ORDER).toEqual(['todo', 'in_progress', 'blocked', 'completed']);
    });
});

describe('buildWorkspaceSummary', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('calculates totals, completion counts, overdue tasks, and active members', () => {
        vi.setSystemTime(new Date('2025-10-08T12:00:00.000Z'));

        const phases: ImplementationPhase[] = [
            {
                id: 'phase-1',
                organization: 'org-1',
                phase_name: 'Foundation',
                phase_order: 1,
                implementation_tasks: [
                    createTask({ id: 'task-1', status: 'completed', priority: 'medium', due_date: '2025-10-01' }),
                    createTask({ id: 'task-2', status: 'todo', priority: 'high', due_date: '2025-10-05' }),
                ],
            },
            {
                id: 'phase-2',
                organization: 'org-1',
                phase_name: 'Pilot',
                phase_order: 2,
                implementation_tasks: [
                    createTask({ id: 'task-3', status: 'in_progress', priority: 'critical', due_date: '2025-10-06' }),
                ],
            },
        ];

        const members: TeamMember[] = [
            {
                id: 'member-1',
                user_id: 'user-1',
                full_name: 'Alex Rivera',
                email: 'alex@example.com',
                role: 'admin',
                status: 'active',
            },
            {
                id: 'member-2',
                user_id: 'user-2',
                full_name: 'Morgan Patel',
                email: 'morgan@example.com',
                role: 'editor',
                status: 'inactive',
            },
            {
                id: 'member-3',
                user_id: 'user-3',
                full_name: 'Jordan Kim',
                email: 'jordan@example.com',
                role: 'editor',
                status: 'active',
            },
        ];

        const summary: WorkspaceSummary = buildWorkspaceSummary(phases, members);

        expect(summary.totalTasks).toBe(3);
        expect(summary.completedTasks).toBe(1);
        expect(summary.overdueTasks).toBe(2); // tasks 2 and 3 are past due and not completed
        expect(summary.activeMembers).toBe(2);
    });
});
