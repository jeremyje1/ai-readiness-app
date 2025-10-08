export interface TeamMember {
    id: string;
    user_id?: string;
    full_name: string;
    email: string;
    role: string;
    department?: string | null;
    avatar_url?: string | null;
    status?: string | null;
    last_active_at?: string | null;
}

export interface TaskComment {
    id: string;
    organization: string;
    task_id: string;
    author_id: string | null;
    content: string;
    created_at: string;
    updated_at?: string;
    author?: TeamMember | null;
}

export interface ImplementationTask {
    id: string;
    organization: string;
    phase_id: string;
    task_title: string;
    description?: string | null;
    status: 'todo' | 'in_progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    due_date?: string | null;
    assigned_to?: string | null;
    created_at?: string;
    updated_at?: string;
    comments?: TaskComment[];
}

export interface ImplementationPhase {
    id: string;
    organization: string;
    phase_name: string;
    phase_order?: number;
    status?: string;
    start_date?: string | null;
    target_end_date?: string | null;
    implementation_tasks?: ImplementationTask[];
}

export interface TeamDocument {
    id: string;
    organization: string;
    title: string;
    description?: string | null;
    storage_path: string;
    tags?: string[] | null;
    created_at: string;
    last_modified_at?: string | null;
    last_modified_by?: string | null;
}

export interface CollaborationRoom {
    id: string;
    organization: string;
    slug: string;
    title: string;
    content: string;
    last_editor?: string | null;
    updated_at: string;
    created_at: string;
}
