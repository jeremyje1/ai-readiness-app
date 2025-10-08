// Blueprint System Types

export interface BlueprintGoals {
    id: string;
    user_id: string;
    assessment_id: string;

    // Primary goals
    primary_goals: string[];

    // Department-specific goals
    department_goals: DepartmentGoal[];

    // Student learning objectives
    learning_objectives: LearningObjective[];

    // Implementation preferences
    implementation_style: 'aggressive' | 'moderate' | 'cautious';
    pilot_preference: boolean;
    training_capacity: number; // hours per week

    // Constraints
    timeline_preference: '3months' | '6months' | '1year' | '18months';
    budget_range: 'under10k' | '10k-50k' | '50k-100k' | '100k-250k' | 'over250k';

    created_at: string;
    updated_at: string;
}

export interface DepartmentGoal {
    department: string;
    challenges: string[];
    outcomes: string[];
    budget: number;
    timeline: string;
}

export interface LearningObjective {
    grade: string;
    subject: string;
    currentMetrics: Record<string, number>;
    targetMetrics: Record<string, number>;
}

export interface Blueprint {
    id: string;
    user_id: string;
    organization_id?: string;
    assessment_id: string;
    goals_id: string;

    // Metadata
    title: string;
    version: number;
    generated_at: string;
    last_updated: string;

    // Executive content
    vision_statement: string;
    executive_summary: string;
    value_proposition: ValueProposition;

    // Readiness analysis
    readiness_scores: ReadinessScores;
    maturity_level: string;

    // Implementation
    implementation_phases: ImplementationPhase[];
    department_plans: DepartmentPlan[];

    // Metrics and KPIs
    success_metrics: SuccessMetric[];
    kpi_targets: Record<string, any>;

    // Risk management
    risk_assessment: Risk[];
    mitigation_strategies: MitigationStrategy[];

    // Resources
    resource_allocation: ResourceAllocation;
    total_budget: number;

    // Quick wins
    quick_wins: QuickWin[];
    recommended_tools: RecommendedTool[];
    recommended_policies?: BlueprintPolicyRecommendation[];

    // Document analysis integration
    document_insights?: BlueprintDocumentInsight[];
    document_compliance?: BlueprintDocumentComplianceOverview;
    source_documents?: BlueprintDocumentSource[];

    // Documents
    master_pdf_url?: string;
    executive_pdf_url?: string;
    department_pdfs: Record<string, string>;

    // Status
    status: 'draft' | 'generating' | 'complete' | 'updated';
    approval_status: 'pending' | 'approved' | 'revision_needed';
    approved_by?: string;
    approved_at?: string;

    // Sharing
    is_public: boolean;
    share_token: string;
    shared_with: string[];

    // Relational data
    phases?: BlueprintPhaseRecord[];
}

export interface BlueprintDocumentInsight {
    documentId?: string;
    fileName: string;
    documentType: string;
    keyThemes: string[];
    aiReadinessIndicators: string[];
    alignmentOpportunities: string[];
    complianceFindings: BlueprintComplianceFinding[];
    budgetSignals?: BlueprintBudgetSignal[];
    summary: string;
    confidenceScore: number;
    analyzedAt?: string;
}

export interface BlueprintComplianceFinding {
    area: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}

export interface BlueprintBudgetSignal {
    category: string;
    amount?: number;
    opportunity: string;
}

export interface BlueprintDocumentSource {
    documentId: string;
    fileName: string;
    url?: string;
    uploadedAt?: string;
}

export interface BlueprintDocumentComplianceOverview {
    severityTally: Record<'low' | 'medium' | 'high' | 'critical', number>;
    focusAreas: string[];
    notes: string[];
}

export interface BlueprintPolicyClauseRevision {
    version: number;
    body: string;
    updatedAt: string;
    updatedBy: string;
    note?: string;
}

export interface BlueprintPolicyClauseDraft {
    clauseId: string;
    title: string;
    tags: string[];
    originalBody: string;
    currentBody: string;
    currentVersion: number;
    metadata: {
        sourceVersion: number;
        author?: string;
        legalReview?: boolean;
        createdAt?: string;
        updatedAt?: string;
    };
    lastEditedAt?: string;
    lastEditedBy?: string;
    revisions: BlueprintPolicyClauseRevision[];
}

export type BlueprintPolicyStatus = 'recommended' | 'in_progress' | 'ready_for_review' | 'approved';

export interface BlueprintPolicyRecommendation {
    templateId: string;
    templateName: string;
    templateVersion: number;
    audience: string;
    jurisdiction?: string;
    matchScore: number;
    matchReasons: string[];
    status: BlueprintPolicyStatus;
    lastEvaluatedAt: string;
    lastEditedAt?: string;
    lastEditedBy?: string;
    clauses: BlueprintPolicyClauseDraft[];
}

export interface ValueProposition {
    summary: string;
    key_benefits: string[];
    expected_roi: string;
    timeline_to_value: string;
}

export interface ReadinessScores {
    overall: number;
    // AI-specific readiness metrics (AIRIX framework)
    airs: { score: number; factors: Record<string, number> }; // AI Infrastructure & Resources Score
    aics: { score: number; factors: Record<string, number> }; // AI Capability & Competence Score
    aims: { score: number; factors: Record<string, number> }; // AI Implementation Maturity Score
    aips: { score: number; factors: Record<string, number> }; // AI Policy & Ethics Score
    aibs: { score: number; factors: Record<string, number> }; // AI Benefits Score
    // Legacy metrics (kept for backward compatibility)
    dsch?: { score: number; factors: Record<string, number> };
    lei?: { score: number; factors: Record<string, number> };
    crf?: { score: number; factors: Record<string, number> };
    oci?: { score: number; factors: Record<string, number> };
    hoci?: { score: number; factors: Record<string, number> };
}

export interface ImplementationPhase {
    phase: number;
    title: string;
    duration: string;
    start_date?: string;
    end_date?: string;
    objectives: string[];
    tasks: PhaseTask[];
    deliverables: string[];
    budget: number;
    required_resources: string[];
    success_criteria: string[];
}

export interface BlueprintPhaseRecord {
    id: string;
    blueprint_id: string;
    phase_number: number;
    title: string;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    duration?: string | null;
    objectives: string[];
    key_outcomes?: string[] | null;
    deliverables?: string[] | null;
    success_criteria?: any;
    budget?: number | null;
    required_resources?: any;
    status?: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    progress_percentage?: number | null;
    created_at: string;
    updated_at: string;
    blueprint_tasks: BlueprintTask[];
}

export interface PhaseTask {
    id?: string;
    title: string;
    description: string;
    type: 'policy' | 'training' | 'implementation' | 'assessment' | 'communication' | 'technical';
    priority: 'critical' | 'high' | 'medium' | 'low';
    department?: string;
    estimated_hours: number;
    dependencies?: string[];
}

export interface DepartmentPlan {
    department: string;
    overview: string;
    specific_goals: string[];
    assigned_tasks: BlueprintTask[];
    resources_needed: string[];
    training_requirements: TrainingRequirement[];
    timeline: DepartmentTimeline;
    budget_allocation: number;
    success_metrics: string[];
}

export interface TrainingRequirement {
    topic: string;
    audience: string;
    duration: string;
    format: 'online' | 'in-person' | 'hybrid';
    frequency: string;
}

export interface DepartmentTimeline {
    start_date: string;
    milestones: Milestone[];
    completion_date: string;
}

export interface Milestone {
    name: string;
    date: string;
    deliverables: string[];
    status?: 'pending' | 'completed' | 'delayed';
}

export interface SuccessMetric {
    name: string;
    description: string;
    baseline: number | string;
    target: number | string;
    measurement_method: string;
    frequency: string;
    owner: string;
}

export interface Risk {
    id: string;
    category: 'technical' | 'organizational' | 'financial' | 'compliance' | 'adoption';
    description: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation_id?: string;
}

export interface MitigationStrategy {
    id: string;
    risk_id: string;
    strategy: string;
    owner: string;
    timeline: string;
    resources_needed: string[];
}

export interface ResourceAllocation {
    human_resources: HumanResource[];
    technology_resources: TechnologyResource[];
    training_budget: number;
    technology_budget: number;
    consulting_budget: number;
    contingency: number;
}

export interface HumanResource {
    role: string;
    count: number;
    hours_per_week: number;
    duration: string;
}

export interface TechnologyResource {
    category: string;
    tools: string[];
    budget: number;
    procurement_timeline: string;
}

export interface QuickWin {
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
    owner: string;
    resources: string[];
}

export interface RecommendedTool {
    name: string;
    category: string;
    description: string;
    use_cases: string[];
    pricing: string;
    implementation_effort: 'low' | 'medium' | 'high';
    training_required: boolean;
    vendor_support: string;
}

export interface BlueprintTask {
    id: string;
    blueprint_id: string;
    phase_id?: string;

    // Task details
    task_title: string;
    task_description: string;
    task_type: 'policy' | 'training' | 'implementation' | 'assessment' | 'communication' | 'technical';
    priority: 'critical' | 'high' | 'medium' | 'low';

    // Assignment
    department?: string;
    assigned_to: string[];
    owner_email?: string;

    // Timeline
    start_date?: string;
    due_date?: string;
    estimated_hours: number;
    actual_hours?: number;

    // Dependencies
    dependencies: string[];
    blocks: string[];

    // Resources and deliverables
    resources_needed: any;
    deliverables: string[];

    // Status
    status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
    completion_percentage: number;
    completed_at?: string;

    // Notes
    notes?: string;
    last_update?: string;
    updated_by?: string;

    created_at: string;
    updated_at: string;
}

export interface BlueprintTemplate {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: 'policy' | 'training' | 'communication' | 'assessment' | 'implementation' | 'quick_start';
    template_content: string;
    variables: TemplateVariable[];
    institution_types: string[];
    department_types: string[];
    use_cases: string[];
    prerequisites: string[];
    tier_required: string;
}

export interface TemplateVariable {
    key: string;
    description: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
    defaultValue?: any;
    options?: string[];
}

export interface BlueprintProgress {
    id: string;
    blueprint_id: string;
    overall_progress: number;
    phases_completed: number;
    tasks_completed: number;
    tasks_total: number;
    days_elapsed: number;
    days_remaining?: number;
    is_on_track: boolean;
    budget_spent: number;
    budget_remaining?: number;
    milestones_completed: number;
    next_milestone?: string;
    next_milestone_date?: string;
    active_risks: number;
    open_issues: number;
    blockers: string[];
    last_updated: string;
}

export interface BlueprintComment {
    id: string;
    blueprint_id: string;
    task_id?: string;
    user_id: string;
    user_name: string;
    comment_text: string;
    is_internal: boolean;
    is_resolved: boolean;
    resolved_by?: string;
    resolved_at?: string;
    created_at: string;
}