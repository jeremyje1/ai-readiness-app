-- Align premium collaboration schema with application expectations

-- 1. Ensure team_members has the new column set
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'team_members'
		  AND column_name = 'name'
	) THEN
		ALTER TABLE public.team_members RENAME COLUMN name TO full_name;
	END IF;
END $$;

ALTER TABLE public.team_members
	ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
	ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
	ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb,
	ADD COLUMN IF NOT EXISTS department TEXT,
	ADD COLUMN IF NOT EXISTS avatar_url TEXT,
	ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW(),
	ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
	ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
	ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.team_members
SET status = 'active'
WHERE status IS NULL;

-- 2. Align implementation_phases columns
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'implementation_phases'
		  AND column_name = 'end_date'
	) THEN
		ALTER TABLE public.implementation_phases RENAME COLUMN end_date TO target_end_date;
	END IF;
END $$;

ALTER TABLE public.implementation_phases
	ADD COLUMN IF NOT EXISTS phase_order INTEGER,
	ADD COLUMN IF NOT EXISTS actual_end_date DATE,
	ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.implementation_phases AS phases
SET phase_order = calculated.row_number
FROM (
	SELECT id, ROW_NUMBER() OVER (PARTITION BY organization ORDER BY created_at, phase_name) AS row_number
	FROM public.implementation_phases
) AS calculated
WHERE phases.id = calculated.id
  AND phases.phase_order IS NULL;

ALTER TABLE public.implementation_phases
	ALTER COLUMN phase_order SET DEFAULT 1,
	ALTER COLUMN phase_order SET NOT NULL;

-- 3. Ensure implementation_tasks table exists with expected columns
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public'
		  AND table_name = 'tasks'
	) AND NOT EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public'
		  AND table_name = 'implementation_tasks'
	) THEN
		EXECUTE 'ALTER TABLE public.tasks RENAME TO implementation_tasks';
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public'
		  AND table_name = 'implementation_tasks'
	) THEN
		CREATE TABLE public.implementation_tasks (
			id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
			phase_id UUID REFERENCES public.implementation_phases(id) ON DELETE CASCADE,
			organization TEXT NOT NULL,
			task_title TEXT NOT NULL,
			description TEXT,
			assigned_to UUID REFERENCES public.team_members(id),
			priority TEXT DEFAULT 'medium',
			status TEXT DEFAULT 'todo',
			estimated_hours INTEGER DEFAULT 0,
			actual_hours INTEGER DEFAULT 0,
			due_date DATE,
			completed_date DATE,
			blockers TEXT[],
			dependencies UUID[],
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		);
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'implementation_tasks'
		  AND column_name = 'title'
	) THEN
		ALTER TABLE public.implementation_tasks RENAME COLUMN title TO task_title;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'implementation_tasks'
		  AND column_name = 'completed_at'
	) THEN
		ALTER TABLE public.implementation_tasks RENAME COLUMN completed_at TO completed_date;
	END IF;
END $$;

ALTER TABLE public.implementation_tasks
	ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 0,
	ADD COLUMN IF NOT EXISTS actual_hours INTEGER DEFAULT 0,
	ADD COLUMN IF NOT EXISTS blockers TEXT[],
	ADD COLUMN IF NOT EXISTS dependencies UUID[],
	ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
	ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.implementation_tasks(organization);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.implementation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON public.implementation_tasks(phase_id);

-- 4. Align ROI metrics table
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'public'
		  AND table_name = 'roi_metrics_backup_pre_align'
	) THEN
		EXECUTE 'CREATE TABLE public.roi_metrics_backup_pre_align AS SELECT * FROM public.roi_metrics';
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'roi_metrics'
		  AND column_name = 'metric_name'
	) THEN
		ALTER TABLE public.roi_metrics RENAME COLUMN metric_name TO metric_type;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'roi_metrics'
		  AND column_name = 'current_value'
	) THEN
		ALTER TABLE public.roi_metrics RENAME COLUMN current_value TO metric_value;
	END IF;
END $$;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'roi_metrics'
		  AND column_name = 'measurement_date'
	) THEN
		ALTER TABLE public.roi_metrics RENAME COLUMN measurement_date TO metric_date;
	END IF;
END $$;

ALTER TABLE public.roi_metrics
	ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.roi_metrics
	DROP COLUMN IF EXISTS baseline_value,
	DROP COLUMN IF EXISTS target_value,
	DROP COLUMN IF EXISTS unit;

UPDATE public.roi_metrics
SET metric_value = COALESCE(metric_value, 0)
WHERE metric_value IS NULL;

UPDATE public.roi_metrics
SET metric_date = COALESCE(metric_date, CURRENT_DATE)
WHERE metric_date IS NULL;

ALTER TABLE public.roi_metrics
	ALTER COLUMN metric_value TYPE DECIMAL(12,2) USING metric_value::DECIMAL(12,2),
	ALTER COLUMN metric_value SET NOT NULL,
	ALTER COLUMN metric_type SET NOT NULL,
	ALTER COLUMN metric_date SET NOT NULL,
	ALTER COLUMN organization SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_roi_metrics_org_date ON public.roi_metrics(organization, metric_date DESC);

-- 5. Ensure team_activity table exists
CREATE TABLE IF NOT EXISTS public.team_activity (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
	action_type TEXT NOT NULL,
	action_details JSONB,
	entity_type TEXT,
	entity_id UUID,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Align calendar_events structure
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'calendar_events'
		  AND column_name = 'created_by'
	) THEN
		ALTER TABLE public.calendar_events RENAME COLUMN created_by TO host_id;
	END IF;
END $$;

ALTER TABLE public.calendar_events
	ADD COLUMN IF NOT EXISTS meeting_url TEXT,
	ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES public.team_members(id),
	ADD COLUMN IF NOT EXISTS attendee_ids UUID[],
	ADD COLUMN IF NOT EXISTS max_attendees INTEGER,
	ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
	ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
	ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
	ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.calendar_events
	ALTER COLUMN event_type SET DEFAULT 'meeting';

CREATE INDEX IF NOT EXISTS idx_calendar_events_org ON public.calendar_events(organization);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time ON public.calendar_events(start_time, end_time);

-- Remove legacy attendees JSONB once migrated into attendee_ids array
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public'
		  AND table_name = 'calendar_events'
		  AND column_name = 'attendees'
	) THEN
		UPDATE public.calendar_events
		SET attendee_ids = COALESCE(
			attendee_ids,
			ARRAY(
				SELECT value::uuid
				FROM jsonb_array_elements_text(attendees) AS value
				WHERE value ~ '^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$'
			)
		)
		WHERE attendees IS NOT NULL;

		ALTER TABLE public.calendar_events DROP COLUMN attendees;
	END IF;
END $$;

-- 7. Ensure event_rsvps table exists
CREATE TABLE IF NOT EXISTS public.event_rsvps (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
	team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
	response TEXT DEFAULT 'pending',
	responded_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE (event_id, team_member_id)
);

-- 8. Enable Row Level Security where needed
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

