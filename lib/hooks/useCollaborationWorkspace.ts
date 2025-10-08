"use client";

import { getOrganizationForUser, hasActivePayment } from "@/lib/payments/access";
import { createClient } from "@/lib/supabase/client";
import type {
    CollaborationRoom,
    ImplementationPhase,
    ImplementationTask,
    TaskComment,
    TeamDocument,
    TeamMember,
} from "@/types/collaboration";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseCollaborationWorkspaceOptions {
    defaultRoomSlug?: string;
}

export interface WorkspaceSummary {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    activeMembers: number;
}

interface UseCollaborationWorkspaceReturn {
    loading: boolean;
    error: string | null;
    organization: string | null;
    role: string | null;
    teamMembers: TeamMember[];
    activeMember?: TeamMember | null;
    phases: ImplementationPhase[];
    documents: TeamDocument[];
    room: CollaborationRoom | null;
    summary: WorkspaceSummary;
    createTask: (payload: {
        phaseId: string;
        title: string;
        description?: string;
        priority: ImplementationTask["priority"];
        dueDate?: string;
        assigneeId?: string | null;
    }) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<ImplementationTask>) => Promise<void>;
    addComment: (taskId: string, comment: string) => Promise<void>;
    addDocument: (payload: { title: string; description?: string; link: string; tags?: string[] }) => Promise<void>;
    updateRoomContent: (content: string) => void;
    roomSaving: boolean;
    refreshWorkspace: (organizationOverride?: string | null) => Promise<void>;
}

export const STATUS_ORDER: Array<ImplementationTask["status"]> = [
    "todo",
    "in_progress",
    "blocked",
    "completed",
];

const getDueTimestamp = (dueDate?: string | null) => {
    if (!dueDate) {
        return Number.POSITIVE_INFINITY;
    }

    const timestamp = new Date(dueDate).getTime();
    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

export function attachCommentsToPhases(
    phases: ImplementationPhase[],
    comments: TaskComment[],
    statusOrder: Array<ImplementationTask["status"]> = STATUS_ORDER
): ImplementationPhase[] {
    const statusRank = new Map(statusOrder.map((status, index) => [status, index] as const));
    const commentsByTask = comments.reduce<Map<string, TaskComment[]>>((acc, comment) => {
        const list = acc.get(comment.task_id) ?? [];
        list.push(comment);
        acc.set(comment.task_id, list);
        return acc;
    }, new Map());

    return phases.map((phase) => {
        const tasks = phase.implementation_tasks ?? [];
        const enhancedTasks = tasks
            .map((task) => ({
                ...task,
                comments: commentsByTask.get(task.id) ?? [],
            }))
            .sort((a, b) => {
                const statusA = statusRank.get(a.status) ?? Number.MAX_SAFE_INTEGER;
                const statusB = statusRank.get(b.status) ?? Number.MAX_SAFE_INTEGER;

                if (statusA !== statusB) {
                    return statusA - statusB;
                }

                const dueA = getDueTimestamp(a.due_date);
                const dueB = getDueTimestamp(b.due_date);

                if (dueA !== dueB) {
                    return dueA - dueB;
                }

                return (a.task_title || "").localeCompare(b.task_title || "");
            });

        return {
            ...phase,
            implementation_tasks: enhancedTasks,
        };
    });
}

export function buildWorkspaceSummary(phases: ImplementationPhase[], members: TeamMember[]): WorkspaceSummary {
    const tasks = phases.flatMap((phase) => phase.implementation_tasks || []);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "completed").length;
    const now = Date.now();
    const overdueTasks = tasks.filter((task) => {
        if (!task.due_date || task.status === "completed") {
            return false;
        }
        const dueTime = new Date(task.due_date).getTime();
        return !Number.isNaN(dueTime) && dueTime < now;
    }).length;

    const activeMembers = members.filter((member) => member.status !== "inactive").length;

    return {
        totalTasks,
        completedTasks,
        overdueTasks,
        activeMembers,
    };
}

export function useCollaborationWorkspace(
    options: UseCollaborationWorkspaceOptions = {}
): UseCollaborationWorkspaceReturn {
    const { defaultRoomSlug = "mission-control" } = options;
    const supabase = useMemo(() => createClient(), []);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [organization, setOrganization] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
    const [phases, setPhases] = useState<ImplementationPhase[]>([]);
    const [documents, setDocuments] = useState<TeamDocument[]>([]);
    const [room, setRoom] = useState<CollaborationRoom | null>(null);
    const [roomSaving, setRoomSaving] = useState(false);

    const summary = useMemo<WorkspaceSummary>(() => buildWorkspaceSummary(phases, teamMembers), [phases, teamMembers]);

    const refreshWorkspace = useCallback(async (organizationOverride?: string | null) => {
        const targetOrganization = organizationOverride ?? organization;
        if (!targetOrganization) {
            return;
        }

        try {
            const [membersRes, phasesRes, commentsRes, documentsRes, roomRes] = await Promise.all([
                supabase
                    .from("team_members")
                    .select("id,user_id,full_name,email,role,department,avatar_url,status,last_active_at")
                    .eq("organization", targetOrganization)
                    .order("full_name", { ascending: true }),
                supabase
                    .from("implementation_phases")
                    .select(
                        `id, organization, phase_name, phase_order, status, start_date, target_end_date,
             implementation_tasks (
               id, organization, phase_id, task_title, description, status, priority, due_date, assigned_to, created_at, updated_at
             )`
                    )
                    .eq("organization", targetOrganization)
                    .order("phase_order", { ascending: true }),
                supabase
                    .from("task_comments")
                    .select("id, organization, task_id, author_id, content, created_at, updated_at")
                    .eq("organization", targetOrganization)
                    .order("created_at", { ascending: true }),
                supabase
                    .from("team_documents")
                    .select("id, organization, title, description, storage_path, tags, created_at, last_modified_at, last_modified_by")
                    .eq("organization", targetOrganization)
                    .order("last_modified_at", { ascending: false }),
                supabase
                    .from("collaboration_rooms")
                    .select("id, organization, slug, title, content, last_editor, updated_at, created_at")
                    .eq("organization", targetOrganization)
                    .eq("slug", defaultRoomSlug)
                    .maybeSingle(),
            ]);

            if (membersRes.error) throw membersRes.error;
            if (phasesRes.error) throw phasesRes.error;
            if (commentsRes.error) throw commentsRes.error;
            if (documentsRes.error) throw documentsRes.error;
            if (roomRes.error) throw roomRes.error;

            setTeamMembers(membersRes.data || []);

            const enrichedPhases = attachCommentsToPhases(
                (phasesRes.data || []) as ImplementationPhase[],
                commentsRes.data || []
            );

            setPhases(enrichedPhases);
            setDocuments(documentsRes.data || []);

            if (roomRes.data) {
                setRoom(roomRes.data);
            } else {
                // Create default room when missing
                const { data: newRoom, error: createRoomError } = await supabase
                    .from("collaboration_rooms")
                    .insert({
                        organization: targetOrganization,
                        slug: defaultRoomSlug,
                        title: "Real-time Strategic Notes",
                        content: "",
                    })
                    .select()
                    .single();

                if (createRoomError) {
                    throw createRoomError;
                }

                setRoom(newRoom);
            }
        } catch (err) {
            console.error("Error refreshing collaboration workspace", err);
            setError(err instanceof Error ? err.message : "Failed to load collaboration workspace");
        }
    }, [organization, supabase, defaultRoomSlug]);

    useEffect(() => {
        let active = true;

        const bootstrap = async () => {
            try {
                setLoading(true);
                setError(null);

                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();

                if (userError || !user) {
                    throw new Error("Authentication required to access collaborative workspace");
                }

                const { organization: paymentOrganization, payment } = await getOrganizationForUser(supabase, user.id);

                if (!payment || !hasActivePayment(payment)) {
                    throw new Error("Active premium subscription required to access collaborative workspace");
                }

                const resolvedOrganization =
                    paymentOrganization ||
                    user.user_metadata?.organization ||
                    (user.email ? user.email.split("@")[1] : null) ||
                    `premium-${user.id.slice(0, 8)}`;

                if (!active) return;

                setOrganization(resolvedOrganization);
                setRole(payment.role || null);

                await refreshWorkspace(resolvedOrganization);

                if (!active) return;

                // Determine active team member for current user
                const { data: memberRecord } = await supabase
                    .from("team_members")
                    .select("id,user_id,full_name,email,role,department,avatar_url,status,last_active_at")
                    .eq("organization", resolvedOrganization)
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (memberRecord && active) {
                    setActiveMember(memberRecord);
                }
            } catch (err) {
                console.error("Failed to initialize collaboration workspace", err);
                if (active) {
                    setError(err instanceof Error ? err.message : "Failed to initialize collaboration workspace");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        bootstrap();

        return () => {
            active = false;
        };
    }, [refreshWorkspace, supabase]);

    // Subscribe to real-time updates for collaboration notes
    useEffect(() => {
        if (!room?.id) {
            return;
        }

        const channel = supabase
            .channel(`collaboration-room-${room.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "collaboration_rooms",
                    filter: `id=eq.${room.id}`,
                },
                (payload) => {
                    const updated = payload.new as CollaborationRoom;
                    setRoom((prev) => (prev ? { ...prev, content: updated.content, updated_at: updated.updated_at, last_editor: updated.last_editor } : updated));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room?.id, supabase]);

    const debouncedRoomUpdate = useRef<NodeJS.Timeout | null>(null);

    const updateRoomContent = useCallback(
        (content: string) => {
            if (!room || !organization) {
                return;
            }

            setRoom((prev) => (prev ? { ...prev, content } : prev));
            setRoomSaving(true);

            if (debouncedRoomUpdate.current) {
                clearTimeout(debouncedRoomUpdate.current);
            }

            debouncedRoomUpdate.current = setTimeout(async () => {
                try {
                    const { error: updateError } = await supabase
                        .from("collaboration_rooms")
                        .update({ content, updated_at: new Date().toISOString(), last_editor: activeMember?.id || null })
                        .eq("id", room.id);

                    if (updateError) {
                        throw updateError;
                    }
                } catch (err) {
                    console.error("Failed to update collaboration room content", err);
                    setError("Unable to save changes to shared note");
                } finally {
                    setRoomSaving(false);
                }
            }, 600);
        },
        [room, organization, supabase, activeMember?.id]
    );

    const createTask = useCallback<UseCollaborationWorkspaceReturn["createTask"]>(
        async ({ phaseId, title, description, priority, dueDate, assigneeId }) => {
            if (!organization) {
                return;
            }

            const payload = {
                phase_id: phaseId,
                organization,
                task_title: title,
                description: description || null,
                priority,
                status: "todo" as ImplementationTask["status"],
                due_date: dueDate || null,
                assigned_to: assigneeId || null,
            };

            const { error: insertError } = await supabase.from("implementation_tasks").insert(payload);

            if (insertError) {
                console.error("Error creating task", insertError);
                setError("Unable to create task");
                return;
            }

            await refreshWorkspace();
        },
        [organization, supabase, refreshWorkspace]
    );

    const updateTask = useCallback<UseCollaborationWorkspaceReturn["updateTask"]>(
        async (taskId, updates) => {
            const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
            if (updates.assigned_to === undefined) {
                delete payload.assigned_to;
            }

            const { error: updateError } = await supabase
                .from("implementation_tasks")
                .update(payload)
                .eq("id", taskId);

            if (updateError) {
                console.error("Error updating task", updateError);
                setError("Unable to update task");
                return;
            }

            await refreshWorkspace();
        },
        [supabase, refreshWorkspace]
    );

    const addComment = useCallback<UseCollaborationWorkspaceReturn["addComment"]>(
        async (taskId, comment) => {
            if (!organization) return;
            if (!activeMember) {
                setError("Join the workspace team before posting comments");
                return;
            }

            const { error: commentError } = await supabase.from("task_comments").insert({
                organization,
                task_id: taskId,
                author_id: activeMember.id,
                content: comment,
            });

            if (commentError) {
                console.error("Error adding comment", commentError);
                setError("Unable to add comment");
                return;
            }

            await refreshWorkspace();
        },
        [organization, supabase, activeMember, refreshWorkspace]
    );

    const addDocument = useCallback<UseCollaborationWorkspaceReturn["addDocument"]>(
        async ({ title, description, link, tags }) => {
            if (!organization) return;

            const { error: docError } = await supabase.from("team_documents").insert({
                organization,
                title,
                description: description || null,
                storage_path: link,
                tags: tags && tags.length > 0 ? tags : null,
                last_modified_at: new Date().toISOString(),
                last_modified_by: activeMember?.id || null,
            });

            if (docError) {
                console.error("Error adding document", docError);
                setError("Unable to save document reference");
                return;
            }

            await refreshWorkspace();
        },
        [organization, supabase, activeMember, refreshWorkspace]
    );

    return {
        loading,
        error,
        organization,
        role,
        teamMembers,
        activeMember,
        phases,
        documents,
        room,
        summary,
        createTask,
        updateTask,
        addComment,
        addDocument,
        updateRoomContent,
        roomSaving,
        refreshWorkspace,
    };
}
