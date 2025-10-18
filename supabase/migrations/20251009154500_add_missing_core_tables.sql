-- Align core application tables with current Next.js features
-- Run via Supabase CLI: supabase db push

-- 1. Ensure user_payments has subscription metadata
ALTER TABLE public.user_payments
    ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
    ADD COLUMN IF NOT EXISTS stripe_price_id text,
    ADD COLUMN IF NOT EXISTS plan_type text,
    ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
    ADD COLUMN IF NOT EXISTS stripe_customer_email text,
    ADD COLUMN IF NOT EXISTS stripe_product_id text;

-- Keep updated_at current when we touch payment rows
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'set_user_payments_updated_at'
    ) THEN
        EXECUTE 'CREATE TRIGGER set_user_payments_updated_at
            BEFORE UPDATE ON public.user_payments
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();';
    END IF;
END $$;

-- 2. Profiles table (lightweight public profile separate from user_profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    preferred_name text,
    position text,
    organization text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT profiles_user_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles owners can read'
    ) THEN
        EXECUTE 'CREATE POLICY "Profiles owners can read" ON public.profiles
            FOR SELECT USING (auth.uid() = id);';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles owners can insert'
    ) THEN
        EXECUTE 'CREATE POLICY "Profiles owners can insert" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Profiles owners can update'
    ) THEN
        EXECUTE 'CREATE POLICY "Profiles owners can update" ON public.profiles
            FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);';
    END IF;
END $$;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3. ROI calculations history
CREATE TABLE IF NOT EXISTS public.roi_calculations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization text NOT NULL,
    calculation_date timestamptz NOT NULL DEFAULT now(),
    monthly_savings numeric(12,2),
    annual_projection numeric(12,2),
    payback_period_months integer,
    roi_percentage numeric(6,2),
    calculation_details jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roi_calculations_org ON public.roi_calculations(organization, calculation_date DESC);

ALTER TABLE public.roi_calculations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'roi_calculations' AND policyname = 'ROI calculations org access'
    ) THEN
        EXECUTE 'CREATE POLICY "ROI calculations org access" ON public.roi_calculations
            FOR ALL USING (
                EXISTS (
                    SELECT 1
                    FROM public.user_payments up
                    WHERE up.user_id = auth.uid()
                      AND up.organization = roi_calculations.organization
                      AND coalesce(up.access_granted, false)
                )
            ) WITH CHECK (
                EXISTS (
                    SELECT 1
                    FROM public.user_payments up
                    WHERE up.user_id = auth.uid()
                      AND up.organization = roi_calculations.organization
                      AND coalesce(up.access_granted, false)
                )
            );';
    END IF;
END $$;

GRANT ALL ON public.roi_calculations TO service_role;

-- 4. Contact messages storage
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    organization text,
    message text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    user_agent text,
    ip_address inet,
    spam_score integer DEFAULT 0,
    honeypot_tripped boolean DEFAULT false,
    processed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_processed ON public.contact_messages(processed);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'contact_messages' AND policyname = 'Service role manages contact messages'
    ) THEN
        EXECUTE 'CREATE POLICY "Service role manages contact messages" ON public.contact_messages
            FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'');';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'contact_messages' AND policyname = 'Authenticated can submit contact messages'
    ) THEN
        EXECUTE 'CREATE POLICY "Authenticated can submit contact messages" ON public.contact_messages
            FOR INSERT WITH CHECK (auth.role() IN (''authenticated'', ''service_role''));';
    END IF;
END $$;

GRANT ALL ON public.contact_messages TO service_role;
GRANT INSERT ON public.contact_messages TO authenticated;

-- 5. Audit log table for dashboard metrics
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Users can view own audit logs'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view own audit logs" ON public.audit_logs
            FOR SELECT USING (auth.uid() = user_id);';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Users can insert own audit logs'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
            FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = ''service_role'');';
    END IF;
END $$;

GRANT ALL ON public.audit_logs TO service_role;

-- 6. Personalized recommendations surfaced on dashboard
CREATE TABLE IF NOT EXISTS public.recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    category text,
    title text NOT NULL,
    description text,
    priority_score integer DEFAULT 0,
    resource_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user ON public.recommendations(user_id, is_active DESC, priority_score DESC);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'recommendations' AND policyname = 'Users manage own recommendations'
    ) THEN
        EXECUTE 'CREATE POLICY "Users manage own recommendations" ON public.recommendations
            FOR ALL USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);';
    END IF;
END $$;

GRANT ALL ON public.recommendations TO service_role;

-- 7. Subscriptions table used for document analysis eligibility
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text NOT NULL,
    tier text,
    current_period_end timestamptz,
    trial_ends_at timestamptz,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_price_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users can view own subscriptions'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
            FOR SELECT USING (auth.uid() = user_id);';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Service role manages subscriptions'
    ) THEN
        EXECUTE 'CREATE POLICY "Service role manages subscriptions" ON public.subscriptions
            FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'');';
    END IF;
END $$;

GRANT ALL ON public.subscriptions TO service_role;

-- 8. Enhance assessments table for dashboard queries
ALTER TABLE public.assessments
    ADD COLUMN IF NOT EXISTS user_id uuid,
    ADD COLUMN IF NOT EXISTS assessment_date timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS completion_status text DEFAULT 'in_progress',
    ADD COLUMN IF NOT EXISTS risk_score numeric,
    ADD COLUMN IF NOT EXISTS compliance_status text,
    ADD COLUMN IF NOT EXISTS algorithm_results jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_assessments_user ON public.assessments(user_id, assessment_date DESC);

-- Keep updated_at in sync if function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'set_assessments_updated_at'
    ) THEN
        EXECUTE 'CREATE TRIGGER set_assessments_updated_at
            BEFORE UPDATE ON public.assessments
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();';
    END IF;
END $$;

-- 9. Convenience grants (service role already full access)
GRANT SELECT, INSERT, UPDATE ON public.recommendations, public.roi_calculations, public.audit_logs TO authenticated;
