-- AI Blueprint System Database Schema
-- Run this in Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/jocigzsthcpspxfdfxae/sql/new

-- Organizations table (if not already present)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  domain text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Blueprint Goals and Objectives
CREATE TABLE IF NOT EXISTS public.blueprint_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  assessment_id uuid REFERENCES public.streamlined_assessment_responses(id),
  
  -- Primary goals
  primary_goals text[] NOT NULL,
  
  -- Department-specific goals
  department_goals jsonb DEFAULT '[]'::jsonb,
  
  -- Student learning objectives
  learning_objectives jsonb DEFAULT '[]'::jsonb,
  
  -- Implementation preferences
  implementation_style text CHECK (implementation_style IN ('aggressive', 'moderate', 'cautious')),
  pilot_preference boolean DEFAULT true,
  training_capacity integer,
  
  -- Constraints
  timeline_preference text NOT NULL,
  budget_range text NOT NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Main Blueprints table
CREATE TABLE IF NOT EXISTS public.blueprints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  organization_id uuid REFERENCES public.organizations(id),
  assessment_id uuid REFERENCES public.streamlined_assessment_responses(id),
  goals_id uuid REFERENCES public.blueprint_goals(id),
  
  -- Blueprint metadata
  title text NOT NULL DEFAULT 'AI Implementation Blueprint',
  version integer DEFAULT 1,
  generated_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  
  -- Executive summary and vision
  vision_statement text,
  executive_summary text,
  value_proposition jsonb,
  
  -- Readiness analysis from algorithms
  readiness_scores jsonb NOT NULL,
  maturity_level text,
  
  -- Implementation roadmap
  implementation_phases jsonb[] NOT NULL,
  
  -- Department-specific plans
  department_plans jsonb DEFAULT '[]'::jsonb,
  
  -- Success metrics and KPIs
  success_metrics jsonb DEFAULT '[]'::jsonb,
  kpi_targets jsonb DEFAULT '{}'::jsonb,
  
  -- Risk analysis and mitigation
  risk_assessment jsonb DEFAULT '[]'::jsonb,
  mitigation_strategies jsonb DEFAULT '[]'::jsonb,
  
  -- Resource allocation
  resource_allocation jsonb,
  total_budget numeric,
  
  -- Quick wins and recommendations
  quick_wins jsonb DEFAULT '[]'::jsonb,
  recommended_tools jsonb DEFAULT '[]'::jsonb,
  
  -- Generated documents
  master_pdf_url text,
  executive_pdf_url text,
  department_pdfs jsonb DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete', 'updated')),
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'revision_needed')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  
  -- Sharing and collaboration
  is_public boolean DEFAULT false,
  share_token text UNIQUE DEFAULT gen_random_uuid()::text,
  shared_with uuid[] DEFAULT ARRAY[]::uuid[]
);

-- Blueprint implementation phases (normalized for tracking)
CREATE TABLE IF NOT EXISTS public.blueprint_phases (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id uuid REFERENCES public.blueprints(id) ON DELETE CASCADE,
  phase_number integer NOT NULL,
  
  -- Phase details
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  duration text,
  
  -- Phase objectives and outcomes
  objectives text[],
  key_outcomes text[],
  success_criteria jsonb,
  
  -- Budget and resources
  budget numeric,
  required_resources jsonb,
  
  -- Status tracking
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blueprint tasks (granular task management)
CREATE TABLE IF NOT EXISTS public.blueprint_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id uuid REFERENCES public.blueprints(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.blueprint_phases(id) ON DELETE CASCADE,
  
  -- Task details
  task_title text NOT NULL,
  task_description text,
  task_type text CHECK (task_type IN ('policy', 'training', 'implementation', 'assessment', 'communication', 'technical')),
  priority text DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  
  -- Assignment and ownership
  department text,
  assigned_to text[],
  owner_email text,
  
  -- Timeline
  start_date date,
  due_date date,
  estimated_hours integer,
  actual_hours integer,
  
  -- Dependencies
  dependencies uuid[],
  blocks uuid[],
  
  -- Resources and deliverables
  resources_needed jsonb,
  deliverables text[],
  
  -- Status and progress
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
  completion_percentage integer DEFAULT 0,
  completed_at timestamptz,
  
  -- Notes and updates
  notes text,
  last_update text,
  updated_by text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blueprint templates library
CREATE TABLE IF NOT EXISTS public.blueprint_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template metadata
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text CHECK (category IN ('policy', 'training', 'communication', 'assessment', 'implementation', 'quick_start')),
  
  -- Content and structure
  template_content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  
  -- Applicability
  institution_types text[],
  department_types text[],
  use_cases text[],
  prerequisites text[],
  
  -- Metadata
  author text,
  version text DEFAULT '1.0',
  is_premium boolean DEFAULT false,
  tier_required text DEFAULT 'free',
  
  -- Usage tracking
  usage_count integer DEFAULT 0,
  rating numeric(3,2),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recommendations catalog
CREATE TABLE IF NOT EXISTS public.recommendations_catalog (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  
  -- Recommendation details
  title text NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text NOT NULL,
  
  -- Implementation details
  implementation_guide jsonb NOT NULL,
  estimated_effort text,
  estimated_duration text,
  estimated_cost_range text,
  
  -- Requirements and dependencies
  prerequisites text[],
  required_capabilities text[],
  
  -- Applicability rules
  min_readiness_score numeric(3,2),
  applicable_departments text[],
  institution_types text[],
  
  -- Outcomes and metrics
  expected_outcomes text[],
  success_metrics text[],
  
  -- Resources
  related_tools text[],
  related_templates uuid[],
  external_resources jsonb,
  
  -- Metadata
  tags text[],
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blueprint progress tracking
CREATE TABLE IF NOT EXISTS public.blueprint_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id uuid UNIQUE REFERENCES public.blueprints(id) ON DELETE CASCADE,
  
  -- Overall progress
  overall_progress integer DEFAULT 0,
  phases_completed integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  tasks_total integer DEFAULT 0,
  
  -- Timeline tracking
  days_elapsed integer DEFAULT 0,
  days_remaining integer,
  is_on_track boolean DEFAULT true,
  
  -- Budget tracking
  budget_spent numeric DEFAULT 0,
  budget_remaining numeric,
  
  -- Milestone tracking
  milestones_completed integer DEFAULT 0,
  next_milestone text,
  next_milestone_date date,
  
  -- Risk and issues
  active_risks integer DEFAULT 0,
  open_issues integer DEFAULT 0,
  blockers text[],
  
  last_updated timestamptz DEFAULT now()
);

-- Blueprint collaboration and comments
CREATE TABLE IF NOT EXISTS public.blueprint_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id uuid REFERENCES public.blueprints(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.blueprint_tasks(id) ON DELETE CASCADE,
  
  -- Comment details
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  user_name text NOT NULL,
  comment_text text NOT NULL,
  
  -- Comment metadata
  is_internal boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON public.blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_assessment_id ON public.blueprints(assessment_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON public.blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprint_tasks_blueprint_id ON public.blueprint_tasks(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_tasks_status ON public.blueprint_tasks(status);
CREATE INDEX IF NOT EXISTS idx_blueprint_templates_category ON public.blueprint_templates(category);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON public.recommendations_catalog(category);

-- Enable Row Level Security
ALTER TABLE public.blueprint_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own blueprint goals" ON public.blueprint_goals;
CREATE POLICY "Users can view own blueprint goals" ON public.blueprint_goals
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own blueprint goals" ON public.blueprint_goals;
CREATE POLICY "Users can create own blueprint goals" ON public.blueprint_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own blueprint goals" ON public.blueprint_goals;
CREATE POLICY "Users can update own blueprint goals" ON public.blueprint_goals
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own blueprints" ON public.blueprints;
CREATE POLICY "Users can view own blueprints" ON public.blueprints
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with) OR is_public = true);

DROP POLICY IF EXISTS "Users can create own blueprints" ON public.blueprints;
CREATE POLICY "Users can create own blueprints" ON public.blueprints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own blueprints" ON public.blueprints;
CREATE POLICY "Users can update own blueprints" ON public.blueprints
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view blueprint phases" ON public.blueprint_phases;
CREATE POLICY "Users can view blueprint phases" ON public.blueprint_phases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blueprints 
      WHERE blueprints.id = blueprint_phases.blueprint_id 
      AND (blueprints.user_id = auth.uid() OR auth.uid() = ANY(blueprints.shared_with) OR blueprints.is_public = true)
    )
  );

DROP POLICY IF EXISTS "Users can view blueprint tasks" ON public.blueprint_tasks;
CREATE POLICY "Users can view blueprint tasks" ON public.blueprint_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blueprints 
      WHERE blueprints.id = blueprint_tasks.blueprint_id 
      AND (blueprints.user_id = auth.uid() OR auth.uid() = ANY(blueprints.shared_with) OR blueprints.is_public = true)
    )
  );

DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.blueprint_templates;
CREATE POLICY "Authenticated users can view templates" ON public.blueprint_templates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view recommendations" ON public.recommendations_catalog;
CREATE POLICY "Authenticated users can view recommendations" ON public.recommendations_catalog
  FOR SELECT USING (auth.role() = 'authenticated');

-- Success message
SELECT 'Blueprint tables created successfully!' as message;
