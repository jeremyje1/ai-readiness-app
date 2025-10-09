

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_analytics_events"("retention_days" integer DEFAULT 365) RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_analytics_events"("retention_days" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_analytics_events"("retention_days" integer) IS 'Function to clean up analytics events older than specified retention period';



CREATE OR REPLACE FUNCTION "public"."create_audit_trail"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO vendor_vetting_audit (
        entity_type,
        entity_id,
        action_type,
        action_description,
        user_id,
        user_name,
        old_value,
        new_value
    ) VALUES (
        CASE TG_TABLE_NAME
            WHEN 'vendor_profiles' THEN 'vendor_profile'
            WHEN 'vendor_tools' THEN 'vendor_tool'
            WHEN 'vendor_intake_forms' THEN 'intake_form'
            WHEN 'risk_assessments' THEN 'risk_assessment'
            WHEN 'decision_briefs' THEN 'decision_brief'
            WHEN 'approved_tools_catalog' THEN 'approved_tool'
            WHEN 'compliance_monitoring' THEN 'compliance_monitoring'
            ELSE TG_TABLE_NAME
        END,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        TG_OP || ' operation on ' || TG_TABLE_NAME,
        auth.uid(),
        'system',
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."create_audit_trail"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        institution_type,
        onboarding_completed
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'default',
        false
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_community_stats"("target_audience" "text" DEFAULT NULL::"text") RETURNS TABLE("total_join_requests" bigint, "pending_requests" bigint, "successful_joins" bigint, "join_rate" numeric, "requests_by_audience" "jsonb", "recent_activity" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_join_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
        COUNT(*) FILTER (WHERE status = 'joined') as successful_joins,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'joined')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as join_rate,
        jsonb_build_object(
            'k12', COUNT(*) FILTER (WHERE audience = 'k12'),
            'highered', COUNT(*) FILTER (WHERE audience = 'highered')
        ) as requests_by_audience,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'email', email,
                    'name', name,
                    'audience', audience,
                    'status', status,
                    'created_at', created_at
                )
                ORDER BY created_at DESC
            )
            FROM community_join_requests 
            WHERE (target_audience IS NULL OR audience = target_audience)
            AND created_at >= NOW() - INTERVAL '7 days'
            LIMIT 10
        ) as recent_activity
    FROM community_join_requests
    WHERE target_audience IS NULL OR audience = target_audience;
END;
$$;


ALTER FUNCTION "public"."get_community_stats"("target_audience" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_community_stats"("target_audience" "text") IS 'Returns comprehensive community join statistics by audience';



CREATE OR REPLACE FUNCTION "public"."get_expert_session_stats"("target_audience" "text" DEFAULT NULL::"text") RETURNS TABLE("total_bookings" bigint, "confirmed_bookings" bigint, "completed_sessions" bigint, "total_revenue" numeric, "average_rating" numeric, "bookings_by_audience" "jsonb", "popular_sessions" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
        COALESCE(SUM(price_paid), 0) as total_revenue,
        ROUND(AVG(feedback_rating), 2) as average_rating,
        jsonb_build_object(
            'k12', COUNT(*) FILTER (WHERE audience = 'k12'),
            'highered', COUNT(*) FILTER (WHERE audience = 'highered')
        ) as bookings_by_audience,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'session_id', session_id,
                    'booking_count', booking_count,
                    'average_rating', average_rating
                )
            )
            FROM (
                SELECT 
                    session_id,
                    COUNT(*) as booking_count,
                    ROUND(AVG(feedback_rating), 2) as average_rating
                FROM expert_session_bookings
                WHERE (target_audience IS NULL OR audience = target_audience)
                GROUP BY session_id
                ORDER BY COUNT(*) DESC
                LIMIT 5
            ) popular
        ) as popular_sessions
    FROM expert_session_bookings
    WHERE target_audience IS NULL OR audience = target_audience;
END;
$$;


ALTER FUNCTION "public"."get_expert_session_stats"("target_audience" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_expert_session_stats"("target_audience" "text") IS 'Returns expert session booking and performance statistics';



CREATE OR REPLACE FUNCTION "public"."get_user_by_email"("email_input" "text") RETURNS TABLE("id" "uuid", "email" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email = email_input
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_user_by_email"("email_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_analytics_summary"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_summary;
END;
$$;


ALTER FUNCTION "public"."refresh_analytics_summary"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."refresh_analytics_summary"() IS 'Function to refresh the analytics summary materialized view';



CREATE OR REPLACE FUNCTION "public"."refresh_vendor_compliance_report"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW vendor_compliance_report;
END;
$$;


ALTER FUNCTION "public"."refresh_vendor_compliance_report"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ai_readiness_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ai_readiness_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_approval_approvers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_approval_approvers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_approval_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_approval_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_profile_timestamp"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_policy_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "policy_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "template_content" "text" NOT NULL,
    "stakeholders" "text"[] DEFAULT '{}'::"text"[],
    "implementation_steps" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_policy_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_readiness_assessments" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "user_id" "uuid",
    "institution_name" "text",
    "institution_type" "text",
    "institution_size" "text",
    "contact_email" "text",
    "contact_name" "text",
    "tier" "text",
    "status" "text" DEFAULT 'PENDING'::"text",
    "responses" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_readiness_score" numeric(3,2),
    "domain_scores" "jsonb" DEFAULT '{}'::"jsonb",
    "maturity_profile" "jsonb" DEFAULT '{}'::"jsonb",
    "policy_recommendations" "jsonb" DEFAULT '[]'::"jsonb",
    "custom_policies_generated" "jsonb" DEFAULT '[]'::"jsonb",
    "implementation_frameworks" "jsonb" DEFAULT '[]'::"jsonb",
    "ai_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "is_team_assessment" boolean DEFAULT false,
    "team_members" "jsonb" DEFAULT '[]'::"jsonb",
    "team_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "open_ended_responses" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "submitted_at" timestamp with time zone,
    "analyzed_at" timestamp with time zone,
    "pdf_report_generated" boolean DEFAULT false,
    "pdf_report_url" "text",
    CONSTRAINT "ai_readiness_assessments_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'IN_PROGRESS'::"text", 'COMPLETED'::"text", 'ANALYZED'::"text"]))),
    CONSTRAINT "ai_readiness_assessments_tier_check" CHECK (("tier" = ANY (ARRAY['basic'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."ai_readiness_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_readiness_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "text",
    "tier" "text" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "stripe_session_id" "text",
    "stripe_payment_intent_id" "text",
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_readiness_payments_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."ai_readiness_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_readiness_team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "assessment_id" "text",
    "user_id" "uuid",
    "member_name" "text",
    "member_email" "text",
    "department" "text",
    "role" "text",
    "responses" "jsonb" DEFAULT '{}'::"jsonb",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_readiness_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_readiness_teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "text",
    "team_name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_readiness_teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" bigint NOT NULL,
    "event_name" "text" NOT NULL,
    "audience" "text" NOT NULL,
    "user_id" "text",
    "session_id" "text",
    "properties" "jsonb" DEFAULT '{}'::"jsonb",
    "timestamp" timestamp with time zone NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "referer" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "analytics_events_audience_check" CHECK (("audience" = ANY (ARRAY['k12'::"text", 'highered'::"text"])))
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."analytics_events" IS 'Stores audience-aware analytics events for tracking user behavior and feature usage';



COMMENT ON COLUMN "public"."analytics_events"."event_name" IS 'Name of the analytics event (e.g., dashboard_view, assessment_started)';



COMMENT ON COLUMN "public"."analytics_events"."audience" IS 'Audience type: k12 for K-12 districts, highered for higher education';



COMMENT ON COLUMN "public"."analytics_events"."user_id" IS 'User ID if the event is associated with an authenticated user';



COMMENT ON COLUMN "public"."analytics_events"."session_id" IS 'Session ID for tracking user sessions across events';



COMMENT ON COLUMN "public"."analytics_events"."properties" IS 'Additional event properties stored as JSON';



COMMENT ON COLUMN "public"."analytics_events"."timestamp" IS 'Client-side timestamp when the event occurred';



COMMENT ON COLUMN "public"."analytics_events"."ip_address" IS 'IP address of the client (for security and fraud detection)';



COMMENT ON COLUMN "public"."analytics_events"."user_agent" IS 'User agent string (for device/browser analytics)';



COMMENT ON COLUMN "public"."analytics_events"."referer" IS 'HTTP referer header (for traffic source analytics)';



CREATE SEQUENCE IF NOT EXISTS "public"."analytics_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."analytics_events_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."analytics_events_id_seq" OWNED BY "public"."analytics_events"."id";



CREATE MATERIALIZED VIEW "public"."analytics_summary" AS
 SELECT "audience",
    "event_name",
    "date"("timestamp") AS "event_date",
    "count"(*) AS "event_count",
    "count"(DISTINCT "user_id") FILTER (WHERE ("user_id" IS NOT NULL)) AS "unique_users",
    "count"(DISTINCT "session_id") FILTER (WHERE ("session_id" IS NOT NULL)) AS "unique_sessions",
    "min"("timestamp") AS "first_event",
    "max"("timestamp") AS "last_event"
   FROM "public"."analytics_events"
  GROUP BY "audience", "event_name", ("date"("timestamp"))
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."analytics_summary" OWNER TO "postgres";


COMMENT ON MATERIALIZED VIEW "public"."analytics_summary" IS 'Materialized view providing daily aggregated analytics data by audience and event type';



CREATE TABLE IF NOT EXISTS "public"."approval_approvers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" character varying(255),
    "user_email" character varying(255),
    "role" character varying(100) NOT NULL,
    "is_required" boolean DEFAULT true NOT NULL,
    "has_approved" boolean DEFAULT false NOT NULL,
    "approved_at" timestamp with time zone,
    "decision" character varying(20),
    "comment" "text",
    "e_signature_signed" boolean DEFAULT false,
    "e_signature_signed_at" timestamp with time zone,
    "e_signature_ip_address" "inet",
    "e_signature_user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "approval_approvers_decision_check" CHECK ((("decision")::"text" = ANY ((ARRAY['approved'::character varying, 'rejected'::character varying, 'changes_requested'::character varying])::"text"[])))
);


ALTER TABLE "public"."approval_approvers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" character varying(50) NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    "session_id" character varying(255)
);


ALTER TABLE "public"."approval_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_name" character varying(255),
    "user_email" character varying(255),
    "comment" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "is_internal" boolean DEFAULT false,
    "attachments" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."approval_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "who" "uuid" NOT NULL,
    "who_name" character varying(255),
    "who_email" character varying(255),
    "action" character varying(50) NOT NULL,
    "comment" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "approval_events_action_check" CHECK ((("action")::"text" = ANY ((ARRAY['created'::character varying, 'approved'::character varying, 'rejected'::character varying, 'requested_changes'::character varying, 'reassigned'::character varying, 'comment_added'::character varying, 'due_date_updated'::character varying])::"text"[])))
);


ALTER TABLE "public"."approval_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approval_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "approval_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "sent" boolean DEFAULT false,
    "sent_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "action_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "approval_notifications_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['approval_request'::character varying, 'approval_reminder'::character varying, 'approval_completed'::character varying, 'approval_overdue'::character varying, 'changes_requested'::character varying])::"text"[])))
);


ALTER TABLE "public"."approval_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_type" character varying(20) NOT NULL,
    "subject_id" character varying(255) NOT NULL,
    "subject_title" "text",
    "subject_version" character varying(50),
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "due_date" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "approvals_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'changes_requested'::character varying, 'rejected'::character varying])::"text"[]))),
    CONSTRAINT "approvals_subject_type_check" CHECK ((("subject_type")::"text" = ANY ((ARRAY['policy'::character varying, 'artifact'::character varying])::"text"[])))
);


ALTER TABLE "public"."approvals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approved_tool_catalog" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "tool_name" character varying(255) NOT NULL,
    "category" character varying(100) NOT NULL,
    "description" "text",
    "usage_guidelines" "text",
    "restrictions" "jsonb" DEFAULT '[]'::"jsonb",
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "approved_by" character varying(255) NOT NULL,
    "approved_at" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "review_frequency" character varying(50) DEFAULT 'annually'::character varying,
    "next_review_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."approved_tool_catalog" OWNER TO "postgres";


COMMENT ON TABLE "public"."approved_tool_catalog" IS 'Catalog of approved vendor tools and services';



CREATE TABLE IF NOT EXISTS "public"."approved_tools_catalog" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tool_id" "uuid",
    "decision_brief_id" "uuid",
    "approval_date" timestamp with time zone NOT NULL,
    "approved_by" "text" NOT NULL,
    "approval_type" "text" DEFAULT 'full'::"text",
    "expiration_date" timestamp with time zone,
    "auto_renewal" boolean DEFAULT false,
    "approved_roles" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "approved_subjects" "text"[] DEFAULT '{}'::"text"[],
    "approved_grade_levels" "text"[] DEFAULT '{}'::"text"[],
    "approved_use_cases" "text"[] DEFAULT '{}'::"text"[],
    "usage_restrictions" "text"[] DEFAULT '{}'::"text"[],
    "deployment_scope" "text" DEFAULT 'district_wide'::"text",
    "max_concurrent_users" integer,
    "seat_allocation" "jsonb" DEFAULT '{}'::"jsonb",
    "organizational_units" "text"[] DEFAULT '{}'::"text"[],
    "compliance_status" "text" DEFAULT 'Compliant'::"text",
    "last_compliance_check" timestamp with time zone,
    "next_compliance_review" timestamp with time zone,
    "compliance_notes" "text",
    "active_users_count" integer DEFAULT 0,
    "total_sessions" integer DEFAULT 0,
    "last_activity_date" timestamp with time zone,
    "usage_trends" "jsonb" DEFAULT '{}'::"jsonb",
    "user_feedback_score" numeric(3,2),
    "incidents_count" integer DEFAULT 0,
    "last_incident_date" timestamp with time zone,
    "incident_severity_history" "jsonb" DEFAULT '[]'::"jsonb",
    "training_completion_rate" numeric(5,2) DEFAULT 0,
    "support_tickets_count" integer DEFAULT 0,
    "documentation_rating" numeric(3,2),
    "license_type" "text",
    "contract_start_date" timestamp with time zone,
    "contract_end_date" timestamp with time zone,
    "renewal_date" timestamp with time zone,
    "contract_value" numeric(12,2),
    "payment_schedule" "text",
    "status" "text" DEFAULT 'active'::"text",
    "status_reason" "text",
    "last_updated_by" "text",
    "change_log" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "approved_tools_catalog_approval_type_check" CHECK (("approval_type" = ANY (ARRAY['full'::"text", 'conditional'::"text", 'pilot'::"text", 'restricted'::"text"]))),
    CONSTRAINT "approved_tools_catalog_compliance_status_check" CHECK (("compliance_status" = ANY (ARRAY['Compliant'::"text", 'Minor Issues'::"text", 'Major Issues'::"text", 'Non-Compliant'::"text"]))),
    CONSTRAINT "approved_tools_catalog_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'deprecated'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."approved_tools_catalog" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artifacts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "assessment_id" "uuid",
    "type" character varying(20) NOT NULL,
    "format" character varying(10) NOT NULL,
    "storage_key" "text" NOT NULL,
    "version" integer DEFAULT 1,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "valid_artifact_format" CHECK ((("format")::"text" = ANY ((ARRAY['pdf'::character varying, 'docx'::character varying, 'pptx'::character varying])::"text"[]))),
    CONSTRAINT "valid_artifact_type" CHECK ((("type")::"text" = ANY ((ARRAY['gap-report'::character varying, 'policy-redline'::character varying, 'board-deck'::character varying])::"text"[])))
);


ALTER TABLE "public"."artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessment_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "metric_name" character varying(50) NOT NULL,
    "metric_value" bigint DEFAULT 0 NOT NULL,
    "labels" "jsonb" DEFAULT '{}'::"jsonb",
    "recorded_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."assessment_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assessment_progress" (
    "id" bigint NOT NULL,
    "session_id" "text" NOT NULL,
    "assessment_id" "text" NOT NULL,
    "audience" "text" NOT NULL,
    "user_id" "text",
    "current_section" "text" NOT NULL,
    "current_question" "text" NOT NULL,
    "responses" "jsonb" DEFAULT '{}'::"jsonb",
    "completed_sections" "text"[] DEFAULT '{}'::"text"[],
    "started_at" timestamp with time zone NOT NULL,
    "last_saved_at" timestamp with time zone NOT NULL,
    "progress_percent" integer DEFAULT 0,
    "is_complete" boolean DEFAULT false,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "assessment_progress_audience_check" CHECK (("audience" = ANY (ARRAY['k12'::"text", 'highered'::"text"]))),
    CONSTRAINT "assessment_progress_progress_percent_check" CHECK ((("progress_percent" >= 0) AND ("progress_percent" <= 100)))
);


ALTER TABLE "public"."assessment_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."assessment_progress" IS 'Stores assessment progress for autosave and resume functionality';



COMMENT ON COLUMN "public"."assessment_progress"."session_id" IS 'Unique session identifier for the assessment attempt';



COMMENT ON COLUMN "public"."assessment_progress"."assessment_id" IS 'ID of the assessment bank being taken';



COMMENT ON COLUMN "public"."assessment_progress"."audience" IS 'Audience type (k12 or highered)';



COMMENT ON COLUMN "public"."assessment_progress"."user_id" IS 'User ID if authenticated, null for anonymous sessions';



COMMENT ON COLUMN "public"."assessment_progress"."responses" IS 'JSON object of question_id -> answer pairs';



COMMENT ON COLUMN "public"."assessment_progress"."completed_sections" IS 'Array of completed section IDs';



COMMENT ON COLUMN "public"."assessment_progress"."progress_percent" IS 'Progress percentage (0-100)';



COMMENT ON COLUMN "public"."assessment_progress"."metadata" IS 'Additional metadata like user agent, referrer, etc.';



CREATE SEQUENCE IF NOT EXISTS "public"."assessment_progress_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."assessment_progress_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."assessment_progress_id_seq" OWNED BY "public"."assessment_progress"."id";



CREATE TABLE IF NOT EXISTS "public"."assessments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "scores" "jsonb" DEFAULT '{"AIBS": 0, "AICS": 0, "AIMS": 0, "AIPS": 0, "AIRS": 0, "AIRIX": 0}'::"jsonb" NOT NULL,
    "findings" "jsonb" DEFAULT '[]'::"jsonb",
    "recommendations" "jsonb" DEFAULT '[]'::"jsonb",
    "evidence_doc_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "user_id" "uuid",
    "assessment_date" timestamp with time zone DEFAULT "now"(),
    "completion_status" "text" DEFAULT 'in_progress'::"text",
    "risk_score" numeric,
    "compliance_status" "text",
    "algorithm_results" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "resource_type" "text",
    "resource_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auth_password_setup_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auth_password_setup_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprint_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "blueprint_id" "uuid",
    "task_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "user_name" "text" NOT NULL,
    "comment_text" "text" NOT NULL,
    "is_internal" boolean DEFAULT false,
    "is_resolved" boolean DEFAULT false,
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blueprint_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprint_goals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "assessment_id" "uuid",
    "primary_goals" "text"[] NOT NULL,
    "department_goals" "jsonb" DEFAULT '[]'::"jsonb",
    "learning_objectives" "jsonb" DEFAULT '[]'::"jsonb",
    "implementation_style" "text",
    "pilot_preference" boolean DEFAULT true,
    "training_capacity" integer,
    "timeline_preference" "text" NOT NULL,
    "budget_range" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "blueprint_goals_implementation_style_check" CHECK (("implementation_style" = ANY (ARRAY['aggressive'::"text", 'moderate'::"text", 'cautious'::"text"])))
);


ALTER TABLE "public"."blueprint_goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprint_phases" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "blueprint_id" "uuid",
    "phase_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "start_date" "date",
    "end_date" "date",
    "duration" "text",
    "objectives" "text"[],
    "key_outcomes" "text"[],
    "success_criteria" "jsonb",
    "budget" numeric,
    "required_resources" "jsonb",
    "status" "text" DEFAULT 'not_started'::"text",
    "progress_percentage" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "blueprint_phases_progress_percentage_check" CHECK ((("progress_percentage" >= 0) AND ("progress_percentage" <= 100))),
    CONSTRAINT "blueprint_phases_status_check" CHECK (("status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'completed'::"text", 'delayed'::"text"])))
);


ALTER TABLE "public"."blueprint_phases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprint_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "blueprint_id" "uuid",
    "overall_progress" integer DEFAULT 0,
    "phases_completed" integer DEFAULT 0,
    "tasks_completed" integer DEFAULT 0,
    "tasks_total" integer DEFAULT 0,
    "days_elapsed" integer DEFAULT 0,
    "days_remaining" integer,
    "is_on_track" boolean DEFAULT true,
    "budget_spent" numeric DEFAULT 0,
    "budget_remaining" numeric,
    "milestones_completed" integer DEFAULT 0,
    "next_milestone" "text",
    "next_milestone_date" "date",
    "active_risks" integer DEFAULT 0,
    "open_issues" integer DEFAULT 0,
    "blockers" "text"[],
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blueprint_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprint_tasks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "blueprint_id" "uuid",
    "phase_id" "uuid",
    "task_title" "text" NOT NULL,
    "task_description" "text",
    "task_type" "text",
    "priority" "text" DEFAULT 'medium'::"text",
    "department" "text",
    "assigned_to" "text"[],
    "owner_email" "text",
    "start_date" "date",
    "due_date" "date",
    "estimated_hours" integer,
    "actual_hours" integer,
    "dependencies" "uuid"[],
    "blocks" "uuid"[],
    "resources_needed" "jsonb",
    "deliverables" "text"[],
    "status" "text" DEFAULT 'pending'::"text",
    "completion_percentage" integer DEFAULT 0,
    "completed_at" timestamp with time zone,
    "notes" "text",
    "last_update" "text",
    "updated_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "blueprint_tasks_priority_check" CHECK (("priority" = ANY (ARRAY['critical'::"text", 'high'::"text", 'medium'::"text", 'low'::"text"]))),
    CONSTRAINT "blueprint_tasks_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'blocked'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "blueprint_tasks_task_type_check" CHECK (("task_type" = ANY (ARRAY['policy'::"text", 'training'::"text", 'implementation'::"text", 'assessment'::"text", 'communication'::"text", 'technical'::"text"])))
);


ALTER TABLE "public"."blueprint_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprint_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "template_content" "text" NOT NULL,
    "variables" "jsonb" DEFAULT '[]'::"jsonb",
    "institution_types" "text"[],
    "department_types" "text"[],
    "use_cases" "text"[],
    "prerequisites" "text"[],
    "author" "text",
    "version" "text" DEFAULT '1.0'::"text",
    "is_premium" boolean DEFAULT false,
    "tier_required" "text" DEFAULT 'free'::"text",
    "usage_count" integer DEFAULT 0,
    "rating" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "blueprint_templates_category_check" CHECK (("category" = ANY (ARRAY['policy'::"text", 'training'::"text", 'communication'::"text", 'assessment'::"text", 'implementation'::"text", 'quick_start'::"text"])))
);


ALTER TABLE "public"."blueprint_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprints" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "assessment_id" "uuid",
    "goals_id" "uuid",
    "title" "text" DEFAULT 'AI Implementation Blueprint'::"text" NOT NULL,
    "version" integer DEFAULT 1,
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "vision_statement" "text",
    "executive_summary" "text",
    "value_proposition" "jsonb",
    "readiness_scores" "jsonb" NOT NULL,
    "maturity_level" "text",
    "implementation_phases" "jsonb"[] NOT NULL,
    "department_plans" "jsonb" DEFAULT '[]'::"jsonb",
    "success_metrics" "jsonb" DEFAULT '[]'::"jsonb",
    "kpi_targets" "jsonb" DEFAULT '{}'::"jsonb",
    "risk_assessment" "jsonb" DEFAULT '[]'::"jsonb",
    "mitigation_strategies" "jsonb" DEFAULT '[]'::"jsonb",
    "resource_allocation" "jsonb",
    "total_budget" numeric,
    "quick_wins" "jsonb" DEFAULT '[]'::"jsonb",
    "recommended_tools" "jsonb" DEFAULT '[]'::"jsonb",
    "master_pdf_url" "text",
    "executive_pdf_url" "text",
    "department_pdfs" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'draft'::"text",
    "approval_status" "text" DEFAULT 'pending'::"text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "is_public" boolean DEFAULT false,
    "share_token" "text" DEFAULT ("gen_random_uuid"())::"text",
    "shared_with" "uuid"[] DEFAULT ARRAY[]::"uuid"[],
    "document_insights" "jsonb" DEFAULT '[]'::"jsonb",
    "document_compliance" "jsonb" DEFAULT '[]'::"jsonb",
    "source_documents" "jsonb" DEFAULT '[]'::"jsonb",
    "recommended_policies" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "blueprints_approval_status_check" CHECK (("approval_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'revision_needed'::"text"]))),
    CONSTRAINT "blueprints_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'generating'::"text", 'complete'::"text", 'updated'::"text"])))
);


ALTER TABLE "public"."blueprints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "event_type" character varying(50) DEFAULT 'meeting'::character varying,
    "location" character varying(255),
    "phase_id" "uuid",
    "host_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "organization" character varying(255),
    "meeting_url" "text",
    "attendee_ids" "uuid"[],
    "max_attendees" integer,
    "is_recurring" boolean DEFAULT false,
    "recurrence_rule" "text"
);


ALTER TABLE "public"."calendar_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaboration_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization" character varying(255) NOT NULL,
    "slug" character varying(120) NOT NULL,
    "title" character varying(255) NOT NULL,
    "content" "text" DEFAULT ''::"text",
    "last_editor" "uuid",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."collaboration_rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_event_registrations" (
    "id" bigint NOT NULL,
    "event_id" "text" NOT NULL,
    "user_id" "text",
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "audience" "text" NOT NULL,
    "registration_status" "text" DEFAULT 'registered'::"text",
    "registration_source" "text" DEFAULT 'community_hub'::"text",
    "attended_at" timestamp with time zone,
    "feedback_rating" integer,
    "feedback_comments" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "community_event_registrations_audience_check" CHECK (("audience" = ANY (ARRAY['k12'::"text", 'highered'::"text"]))),
    CONSTRAINT "community_event_registrations_feedback_rating_check" CHECK ((("feedback_rating" >= 1) AND ("feedback_rating" <= 5))),
    CONSTRAINT "community_event_registrations_registration_status_check" CHECK (("registration_status" = ANY (ARRAY['registered'::"text", 'attended'::"text", 'no_show'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."community_event_registrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."community_event_registrations" IS 'Tracks registrations for community events and webinars';



CREATE SEQUENCE IF NOT EXISTS "public"."community_event_registrations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."community_event_registrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."community_event_registrations_id_seq" OWNED BY "public"."community_event_registrations"."id";



CREATE TABLE IF NOT EXISTS "public"."community_join_requests" (
    "id" bigint NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "audience" "text" NOT NULL,
    "user_id" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "slack_invite_sent" boolean DEFAULT false,
    "slack_invite_sent_at" timestamp with time zone,
    "joined_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "community_join_requests_audience_check" CHECK (("audience" = ANY (ARRAY['k12'::"text", 'highered'::"text"]))),
    CONSTRAINT "community_join_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'invited'::"text", 'joined'::"text", 'rejected'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."community_join_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."community_join_requests" IS 'Tracks requests to join the Slack community with invite status';



COMMENT ON COLUMN "public"."community_join_requests"."slack_invite_sent" IS 'Whether a Slack invitation has been sent';



CREATE SEQUENCE IF NOT EXISTS "public"."community_join_requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."community_join_requests_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."community_join_requests_id_seq" OWNED BY "public"."community_join_requests"."id";



CREATE TABLE IF NOT EXISTS "public"."compliance_evidence" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tracking_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "evidence_type" character varying(50) NOT NULL,
    "file_url" "text",
    "document_id" "uuid",
    "external_reference" "text",
    "uploaded_by" "uuid",
    "review_status" character varying(20) DEFAULT 'pending'::character varying,
    "expires_at" "date",
    "is_current" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    CONSTRAINT "compliance_evidence_evidence_type_check" CHECK ((("evidence_type")::"text" = ANY ((ARRAY['document'::character varying, 'policy'::character varying, 'assessment'::character varying, 'training'::character varying, 'system'::character varying, 'process'::character varying])::"text"[]))),
    CONSTRAINT "compliance_evidence_review_status_check" CHECK ((("review_status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'needs_revision'::character varying])::"text"[])))
);


ALTER TABLE "public"."compliance_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_findings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tracking_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "finding_type" character varying(50) NOT NULL,
    "severity" character varying(20) NOT NULL,
    "remediation" "text",
    "status" character varying(20) DEFAULT 'open'::character varying,
    "identified_by" "uuid",
    "assigned_to" "uuid",
    "target_resolution_date" "date",
    "identified_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    CONSTRAINT "compliance_findings_finding_type_check" CHECK ((("finding_type")::"text" = ANY ((ARRAY['gap'::character varying, 'risk'::character varying, 'non_compliance'::character varying, 'improvement'::character varying])::"text"[]))),
    CONSTRAINT "compliance_findings_severity_check" CHECK ((("severity")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "compliance_findings_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['open'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'accepted'::character varying, 'deferred'::character varying])::"text"[])))
);


ALTER TABLE "public"."compliance_findings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_frameworks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "audience" character varying(20) NOT NULL,
    "description" "text",
    "regulatory_body" character varying(255),
    "is_federal" boolean DEFAULT true,
    "is_active" boolean DEFAULT true,
    "review_cycle_months" integer DEFAULT 12,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "compliance_frameworks_audience_check" CHECK ((("audience")::"text" = ANY ((ARRAY['k12'::character varying, 'highered'::character varying, 'both'::character varying])::"text"[])))
);


ALTER TABLE "public"."compliance_frameworks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_monitoring" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tool_id" "uuid",
    "monitoring_date" timestamp with time zone DEFAULT "now"(),
    "monitoring_type" "text",
    "monitoring_period_start" timestamp with time zone,
    "monitoring_period_end" timestamp with time zone,
    "coppa_status" "text" DEFAULT 'compliant'::"text",
    "coppa_findings" "jsonb" DEFAULT '{}'::"jsonb",
    "ferpa_status" "text" DEFAULT 'compliant'::"text",
    "ferpa_findings" "jsonb" DEFAULT '{}'::"jsonb",
    "ppra_status" "text" DEFAULT 'compliant'::"text",
    "ppra_findings" "jsonb" DEFAULT '{}'::"jsonb",
    "usage_within_approved_scope" boolean DEFAULT true,
    "unauthorized_usage_incidents" integer DEFAULT 0,
    "data_handling_compliance" boolean DEFAULT true,
    "consent_management_compliance" boolean DEFAULT true,
    "security_controls_effective" boolean DEFAULT true,
    "data_encryption_verified" boolean DEFAULT true,
    "access_controls_verified" boolean DEFAULT true,
    "vulnerability_scan_results" "jsonb" DEFAULT '{}'::"jsonb",
    "privacy_policy_current" boolean DEFAULT true,
    "data_minimization_verified" boolean DEFAULT true,
    "retention_policy_followed" boolean DEFAULT true,
    "user_rights_requests_handled" integer DEFAULT 0,
    "compliance_score" integer,
    "issues_identified" "text"[] DEFAULT '{}'::"text"[],
    "corrective_actions_required" "text"[] DEFAULT '{}'::"text"[],
    "recommendations" "text"[] DEFAULT '{}'::"text"[],
    "follow_up_required" boolean DEFAULT false,
    "follow_up_date" timestamp with time zone,
    "reviewed_by" "text",
    "review_date" timestamp with time zone,
    "approved_by" "text",
    "approval_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "compliance_monitoring_compliance_score_check" CHECK ((("compliance_score" >= 0) AND ("compliance_score" <= 100))),
    CONSTRAINT "compliance_monitoring_coppa_status_check" CHECK (("coppa_status" = ANY (ARRAY['compliant'::"text", 'minor_issues'::"text", 'major_issues'::"text", 'non_compliant'::"text", 'not_applicable'::"text"]))),
    CONSTRAINT "compliance_monitoring_ferpa_status_check" CHECK (("ferpa_status" = ANY (ARRAY['compliant'::"text", 'minor_issues'::"text", 'major_issues'::"text", 'non_compliant'::"text", 'not_applicable'::"text"]))),
    CONSTRAINT "compliance_monitoring_monitoring_type_check" CHECK (("monitoring_type" = ANY (ARRAY['scheduled'::"text", 'incident_driven'::"text", 'complaint_driven'::"text", 'audit'::"text"]))),
    CONSTRAINT "compliance_monitoring_ppra_status_check" CHECK (("ppra_status" = ANY (ARRAY['compliant'::"text", 'minor_issues'::"text", 'major_issues'::"text", 'non_compliant'::"text", 'not_applicable'::"text"])))
);


ALTER TABLE "public"."compliance_monitoring" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_tracking" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "control_id" "uuid",
    "assigned_to" "uuid",
    "department" character varying(100),
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "priority" character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    "risk_level" character varying(20) DEFAULT 'medium'::character varying,
    "due_date" "date" NOT NULL,
    "completion_percentage" integer DEFAULT 0,
    "notes" "text",
    "last_action" "text",
    "next_action" "text",
    "dependencies" "uuid"[] DEFAULT '{}'::"uuid"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "compliance_tracking_completion_percentage_check" CHECK ((("completion_percentage" >= 0) AND ("completion_percentage" <= 100))),
    CONSTRAINT "compliance_tracking_priority_check" CHECK ((("priority")::"text" = ANY ((ARRAY['critical'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying])::"text"[]))),
    CONSTRAINT "compliance_tracking_risk_level_check" CHECK ((("risk_level")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::"text"[]))),
    CONSTRAINT "compliance_tracking_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'review_needed'::character varying, 'completed'::character varying, 'flagged'::character varying, 'overdue'::character varying])::"text"[])))
);


ALTER TABLE "public"."compliance_tracking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "organization" "text",
    "message" "text" NOT NULL,
    "user_id" "uuid",
    "user_agent" "text",
    "ip_address" "inet",
    "spam_score" integer DEFAULT 0,
    "honeypot_tripped" boolean DEFAULT false,
    "processed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."decision_briefs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_assessment_id" "uuid",
    "intake_form_id" "uuid",
    "brief_title" "text" NOT NULL,
    "brief_date" timestamp with time zone DEFAULT "now"(),
    "prepared_by" "text" NOT NULL,
    "review_board" "text" DEFAULT 'Technology Committee'::"text",
    "meeting_date" timestamp with time zone,
    "executive_summary" "text" NOT NULL,
    "recommendation" "text" NOT NULL,
    "key_benefits" "text"[] DEFAULT '{}'::"text"[],
    "primary_concerns" "text"[] DEFAULT '{}'::"text"[],
    "risk_level_summary" "text",
    "critical_risks" "text"[] DEFAULT '{}'::"text"[],
    "acceptable_risks" "text"[] DEFAULT '{}'::"text"[],
    "mitigation_plan" "text",
    "compliance_summary" "jsonb" DEFAULT '{}'::"jsonb",
    "regulatory_considerations" "text",
    "legal_review_required" boolean DEFAULT false,
    "legal_review_status" "text",
    "implementation_timeline" "text",
    "pilot_program_recommended" boolean DEFAULT false,
    "pilot_scope" "text",
    "training_plan" "text",
    "rollout_phases" "jsonb" DEFAULT '[]'::"jsonb",
    "monitoring_plan" "text",
    "success_metrics" "text"[] DEFAULT '{}'::"text"[],
    "review_schedule" "text",
    "escalation_procedures" "text",
    "cost_benefit_analysis" "text",
    "budget_impact" numeric(12,2),
    "alternative_costs" "jsonb" DEFAULT '{}'::"jsonb",
    "roi_projection" "text",
    "board_decision" "text",
    "decision_date" timestamp with time zone,
    "decision_rationale" "text",
    "voting_record" "jsonb" DEFAULT '{}'::"jsonb",
    "dissenting_opinions" "text",
    "implementation_status" "text" DEFAULT 'pending'::"text",
    "implementation_start_date" timestamp with time zone,
    "go_live_date" timestamp with time zone,
    "actual_vs_planned_variance" "text",
    "document_version" integer DEFAULT 1,
    "document_status" "text" DEFAULT 'draft'::"text",
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "related_documents" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "decision_briefs_document_status_check" CHECK (("document_status" = ANY (ARRAY['draft'::"text", 'review'::"text", 'final'::"text", 'archived'::"text"]))),
    CONSTRAINT "decision_briefs_recommendation_check" CHECK (("recommendation" = ANY (ARRAY['Approve'::"text", 'Conditional Approval'::"text", 'Reject'::"text", 'Defer'::"text"])))
);


ALTER TABLE "public"."decision_briefs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "document_type" "text",
    "key_themes" "text"[] DEFAULT '{}'::"text"[],
    "ai_readiness_indicators" "text"[] DEFAULT '{}'::"text"[],
    "alignment_opportunities" "text"[] DEFAULT '{}'::"text"[],
    "gaps" "text"[] DEFAULT '{}'::"text"[],
    "recommendations" "text"[] DEFAULT '{}'::"text"[],
    "confidence_score" integer DEFAULT 0,
    "analysis_data" "jsonb",
    "analyzed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "summary" "text",
    "compliance_findings" "jsonb" DEFAULT '[]'::"jsonb",
    "budget_signals" "jsonb" DEFAULT '[]'::"jsonb",
    "blueprint_alignment" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "document_analyses_confidence_score_check" CHECK ((("confidence_score" >= 0) AND ("confidence_score" <= 100)))
);


ALTER TABLE "public"."document_analyses" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_analyses" IS 'Stores AI-powered document analysis results for paid subscribers';



CREATE TABLE IF NOT EXISTS "public"."document_sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "section_type" character varying(20) NOT NULL,
    "heading" "text",
    "content" "text" NOT NULL,
    "page_number" integer,
    "position_start" integer,
    "position_end" integer,
    "confidence" numeric(3,2) DEFAULT 0.0,
    "framework_mappings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "valid_section_type" CHECK ((("section_type")::"text" = ANY ((ARRAY['governance'::character varying, 'risk'::character varying, 'instruction'::character varying, 'assessment'::character varying, 'data'::character varying, 'vendor'::character varying, 'accessibility'::character varying])::"text"[])))
);


ALTER TABLE "public"."document_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "mime_type" character varying(100) NOT NULL,
    "size" bigint NOT NULL,
    "storage_key" "text" NOT NULL,
    "pii_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "ocr_text" "text",
    "sections" "jsonb" DEFAULT '[]'::"jsonb",
    "framework_tags" "jsonb" DEFAULT '{}'::"jsonb",
    "status" character varying(20) DEFAULT 'uploaded'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "processed_at" timestamp with time zone,
    CONSTRAINT "valid_document_status" CHECK ((("status")::"text" = ANY ((ARRAY['uploaded'::character varying, 'processed'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enterprise_algorithm_changelog" (
    "version" "text" NOT NULL,
    "released_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "summary" "text" NOT NULL,
    "details" "jsonb",
    "breaking_changes" boolean DEFAULT false
);


ALTER TABLE "public"."enterprise_algorithm_changelog" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enterprise_algorithm_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "text" NOT NULL,
    "user_id" "uuid",
    "algorithm_version" "text" NOT NULL,
    "computed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "dsch" "jsonb" NOT NULL,
    "crf" "jsonb" NOT NULL,
    "lei" "jsonb" NOT NULL,
    "oci" "jsonb" NOT NULL,
    "hoci" "jsonb" NOT NULL,
    "raw" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."enterprise_algorithm_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_rsvps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid",
    "team_member_id" "uuid",
    "response" "text" DEFAULT 'pending'::"text",
    "responded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_rsvps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expert_session_bookings" (
    "id" bigint NOT NULL,
    "session_id" "text" NOT NULL,
    "user_id" "text",
    "email" "text" NOT NULL,
    "name" "text" NOT NULL,
    "audience" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "booking_method" "text" DEFAULT 'calendly'::"text",
    "calendly_event_uuid" "text",
    "scheduled_at" timestamp with time zone,
    "duration_minutes" integer,
    "price_paid" numeric(10,2) DEFAULT 0,
    "payment_status" "text" DEFAULT 'free'::"text",
    "notes" "text",
    "feedback_rating" integer,
    "feedback_comments" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "expert_session_bookings_audience_check" CHECK (("audience" = ANY (ARRAY['k12'::"text", 'highered'::"text"]))),
    CONSTRAINT "expert_session_bookings_booking_method_check" CHECK (("booking_method" = ANY (ARRAY['calendly'::"text", 'direct'::"text", 'fallback'::"text"]))),
    CONSTRAINT "expert_session_bookings_feedback_rating_check" CHECK ((("feedback_rating" >= 1) AND ("feedback_rating" <= 5))),
    CONSTRAINT "expert_session_bookings_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['free'::"text", 'pending'::"text", 'paid'::"text", 'refunded'::"text"]))),
    CONSTRAINT "expert_session_bookings_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'completed'::"text", 'cancelled'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."expert_session_bookings" OWNER TO "postgres";


COMMENT ON TABLE "public"."expert_session_bookings" IS 'Manages expert consultation session bookings and payments';



COMMENT ON COLUMN "public"."expert_session_bookings"."calendly_event_uuid" IS 'UUID from Calendly webhook for event tracking';



COMMENT ON COLUMN "public"."expert_session_bookings"."price_paid" IS 'Amount paid for the session (0 for free sessions)';



CREATE SEQUENCE IF NOT EXISTS "public"."expert_session_bookings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."expert_session_bookings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."expert_session_bookings_id_seq" OWNED BY "public"."expert_session_bookings"."id";



CREATE TABLE IF NOT EXISTS "public"."framework_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "framework_id" character varying(100) NOT NULL,
    "version" character varying(50) NOT NULL,
    "change_type" character varying(20) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "affected_sections" "text"[] DEFAULT '{}'::"text"[],
    "impact_level" character varying(20) DEFAULT 'medium'::character varying,
    "effective_date" timestamp with time zone,
    "requires_redline" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "framework_changes_change_type_check" CHECK ((("change_type")::"text" = ANY ((ARRAY['major'::character varying, 'minor'::character varying, 'patch'::character varying, 'hotfix'::character varying])::"text"[]))),
    CONSTRAINT "framework_changes_impact_level_check" CHECK ((("impact_level")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[])))
);


ALTER TABLE "public"."framework_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."framework_controls" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "framework_id" "uuid",
    "code" character varying(50) NOT NULL,
    "title" character varying(500) NOT NULL,
    "description" "text",
    "complexity_weight" numeric(3,2) DEFAULT 1.0,
    "is_required" boolean DEFAULT true,
    "impact_areas" "text"[] DEFAULT '{}'::"text"[],
    "typical_evidence" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."framework_controls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."framework_metadata" (
    "id" character varying(100) NOT NULL,
    "name" character varying(255) NOT NULL,
    "version" character varying(50) NOT NULL,
    "last_updated" timestamp with time zone NOT NULL,
    "source_url" "text",
    "checksum" character varying(64),
    "status" character varying(20) DEFAULT 'active'::character varying,
    "changelog" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "framework_metadata_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'deprecated'::character varying, 'draft'::character varying])::"text"[])))
);


ALTER TABLE "public"."framework_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."framework_monitoring_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "framework_id" character varying(100) NOT NULL,
    "check_interval" integer DEFAULT 60,
    "enabled" boolean DEFAULT true,
    "auto_generate_redlines" boolean DEFAULT true,
    "notify_approvers" boolean DEFAULT true,
    "impact_threshold" character varying(20) DEFAULT 'medium'::character varying,
    "approvers" "text"[] DEFAULT '{}'::"text"[],
    "last_checked" timestamp with time zone,
    "next_check" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "framework_monitoring_config_impact_threshold_check" CHECK ((("impact_threshold")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[])))
);


ALTER TABLE "public"."framework_monitoring_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."framework_scores" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "framework" character varying(10) NOT NULL,
    "category" character varying(50) NOT NULL,
    "control_id" character varying(20) NOT NULL,
    "score" numeric(3,2) NOT NULL,
    "evidence_doc_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "rationale" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "valid_framework" CHECK ((("framework")::"text" = ANY ((ARRAY['AIRIX'::character varying, 'AIRS'::character varying, 'AICS'::character varying, 'AIMS'::character varying, 'AIPS'::character varying, 'AIBS'::character varying])::"text"[])))
);


ALTER TABLE "public"."framework_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gap_analysis_results" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "overall_score" numeric(5,2),
    "maturity_level" "text",
    "govern_score" numeric(5,2),
    "govern_gaps" "text"[],
    "govern_strengths" "text"[],
    "govern_recommendations" "text"[],
    "map_score" numeric(5,2),
    "map_gaps" "text"[],
    "map_strengths" "text"[],
    "map_recommendations" "text"[],
    "measure_score" numeric(5,2),
    "measure_gaps" "text"[],
    "measure_strengths" "text"[],
    "measure_recommendations" "text"[],
    "manage_score" numeric(5,2),
    "manage_gaps" "text"[],
    "manage_strengths" "text"[],
    "manage_recommendations" "text"[],
    "priority_actions" "text"[],
    "quick_wins" "text"[],
    "analysis_date" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "risk_hotspots" "jsonb" DEFAULT '[]'::"jsonb",
    "nist_alignment" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."gap_analysis_results" OWNER TO "postgres";


COMMENT ON COLUMN "public"."gap_analysis_results"."govern_strengths" IS 'TEXT[] array of strengths identified in the GOVERN category';



COMMENT ON COLUMN "public"."gap_analysis_results"."govern_recommendations" IS 'TEXT[] array of recommendations for improving GOVERN category scores';



COMMENT ON COLUMN "public"."gap_analysis_results"."map_strengths" IS 'TEXT[] array of strengths identified in the MAP category';



COMMENT ON COLUMN "public"."gap_analysis_results"."map_recommendations" IS 'TEXT[] array of recommendations for improving MAP category scores';



COMMENT ON COLUMN "public"."gap_analysis_results"."measure_strengths" IS 'TEXT[] array of strengths identified in the MEASURE category';



COMMENT ON COLUMN "public"."gap_analysis_results"."measure_recommendations" IS 'TEXT[] array of recommendations for improving MEASURE category scores';



COMMENT ON COLUMN "public"."gap_analysis_results"."manage_strengths" IS 'TEXT[] array of strengths identified in the MANAGE category';



COMMENT ON COLUMN "public"."gap_analysis_results"."manage_recommendations" IS 'TEXT[] array of recommendations for improving MANAGE category scores';



COMMENT ON COLUMN "public"."gap_analysis_results"."priority_actions" IS 'TEXT[] array of priority actions to take immediately';



CREATE TABLE IF NOT EXISTS "public"."implementation_phases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phase_name" character varying(255) NOT NULL,
    "description" "text",
    "start_date" "date",
    "target_end_date" "date",
    "status" character varying(50) DEFAULT 'planning'::character varying,
    "budget" numeric(12,2),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "organization" character varying(255),
    "phase_order" integer DEFAULT 1 NOT NULL,
    "actual_end_date" "date"
);


ALTER TABLE "public"."implementation_phases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."implementation_roadmaps" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "roadmap_type" "text",
    "goals" "text"[],
    "action_items" "text"[],
    "milestones" "text"[],
    "success_metrics" "text"[],
    "start_date" "date",
    "end_date" "date",
    "status" "text" DEFAULT 'not_started'::"text",
    "completion_percentage" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."implementation_roadmaps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."implementation_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phase_id" "uuid",
    "assigned_to" "uuid",
    "task_title" character varying(255) NOT NULL,
    "description" "text",
    "status" character varying(50) DEFAULT 'todo'::character varying,
    "priority" character varying(20) DEFAULT 'medium'::character varying,
    "due_date" "date",
    "completed_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "organization" character varying(255),
    "estimated_hours" integer DEFAULT 0,
    "actual_hours" integer DEFAULT 0,
    "blockers" "text"[],
    "dependencies" "uuid"[]
);


ALTER TABLE "public"."implementation_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."institution_memberships" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "institution_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."institution_memberships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."institutions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "headcount" integer,
    "budget" numeric(15,2),
    "depth_mode" "text",
    "owner_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "org_type" "text"
);


ALTER TABLE "public"."institutions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pii_detections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "pii_type" character varying(20) NOT NULL,
    "detected_text" "text" NOT NULL,
    "redacted_text" "text" NOT NULL,
    "position_start" integer NOT NULL,
    "position_end" integer NOT NULL,
    "confidence" numeric(3,2) NOT NULL,
    "detected_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."pii_detections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."policy_control_mappings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "control_id" "uuid",
    "policy_title" character varying(500) NOT NULL,
    "policy_url" "text",
    "mapping_strength" character varying(20) DEFAULT 'full'::character varying,
    "coverage_percentage" integer DEFAULT 100,
    "mapped_by" "uuid",
    "mapped_at" timestamp with time zone DEFAULT "now"(),
    "last_verified" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "policy_control_mappings_coverage_percentage_check" CHECK ((("coverage_percentage" >= 0) AND ("coverage_percentage" <= 100))),
    CONSTRAINT "policy_control_mappings_mapping_strength_check" CHECK ((("mapping_strength")::"text" = ANY ((ARRAY['full'::character varying, 'partial'::character varying, 'related'::character varying])::"text"[])))
);


ALTER TABLE "public"."policy_control_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."policy_redline_packs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "policy_id" character varying(100) NOT NULL,
    "original_version" character varying(50) NOT NULL,
    "updated_version" character varying(50) NOT NULL,
    "framework_change_id" "uuid" NOT NULL,
    "changes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "approvers" "text"[] DEFAULT '{}'::"text"[],
    "status" character varying(30) DEFAULT 'draft'::character varying,
    "generated_by" character varying(20) DEFAULT 'system'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "rejection_reason" "text",
    CONSTRAINT "policy_redline_packs_generated_by_check" CHECK ((("generated_by")::"text" = ANY ((ARRAY['system'::character varying, 'manual'::character varying])::"text"[]))),
    CONSTRAINT "policy_redline_packs_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'sent_for_approval'::character varying, 'approved'::character varying, 'rejected'::character varying])::"text"[])))
);


ALTER TABLE "public"."policy_redline_packs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."policy_update_job_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" character varying(100) NOT NULL,
    "success" boolean NOT NULL,
    "frameworks_checked" integer DEFAULT 0,
    "changes_detected" integer DEFAULT 0,
    "redlines_generated" integer DEFAULT 0,
    "notifications_sent" integer DEFAULT 0,
    "errors" "text"[] DEFAULT '{}'::"text"[],
    "processing_time" integer DEFAULT 0,
    "executed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."policy_update_job_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."policy_update_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying(30) NOT NULL,
    "recipient_id" character varying(100) NOT NULL,
    "recipient_email" character varying(255) NOT NULL,
    "policy_id" character varying(100),
    "redline_pack_id" "uuid",
    "framework_change_id" "uuid",
    "title" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "action_url" "text",
    "sent" boolean DEFAULT false,
    "sent_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "policy_update_notifications_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['redline_generated'::character varying, 'approval_required'::character varying, 'framework_updated'::character varying])::"text"[])))
);


ALTER TABLE "public"."policy_update_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "preferred_name" "text",
    "position" "text",
    "organization" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "category" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "priority_score" integer DEFAULT 0,
    "resource_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recommendations_catalog" (
    "id" integer NOT NULL,
    "code" "text" NOT NULL,
    "title" "text" NOT NULL,
    "category" "text" NOT NULL,
    "subcategory" "text",
    "description" "text" NOT NULL,
    "implementation_guide" "jsonb" NOT NULL,
    "estimated_effort" "text",
    "estimated_duration" "text",
    "estimated_cost_range" "text",
    "prerequisites" "text"[],
    "required_capabilities" "text"[],
    "min_readiness_score" numeric(3,2),
    "applicable_departments" "text"[],
    "institution_types" "text"[],
    "expected_outcomes" "text"[],
    "success_metrics" "text"[],
    "related_tools" "text"[],
    "related_templates" "uuid"[],
    "external_resources" "jsonb",
    "tags" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."recommendations_catalog" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."recommendations_catalog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."recommendations_catalog_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."recommendations_catalog_id_seq" OWNED BY "public"."recommendations_catalog"."id";



CREATE TABLE IF NOT EXISTS "public"."risk_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "intake_form_id" "uuid",
    "tool_id" "uuid",
    "assessment_type" "text" DEFAULT 'initial'::"text",
    "assessment_date" timestamp with time zone DEFAULT "now"(),
    "assessor_name" "text",
    "assessor_role" "text",
    "overall_risk_score" integer,
    "risk_level" "text",
    "privacy_risk_score" integer,
    "security_risk_score" integer,
    "compliance_risk_score" integer,
    "pedagogical_risk_score" integer,
    "financial_risk_score" integer,
    "operational_risk_score" integer,
    "risk_factors" "jsonb" DEFAULT '{}'::"jsonb",
    "mitigation_measures" "jsonb" DEFAULT '{}'::"jsonb",
    "residual_risks" "jsonb" DEFAULT '{}'::"jsonb",
    "coppa_assessment" "jsonb" DEFAULT '{}'::"jsonb",
    "ferpa_assessment" "jsonb" DEFAULT '{}'::"jsonb",
    "ppra_assessment" "jsonb" DEFAULT '{}'::"jsonb",
    "state_law_assessment" "jsonb" DEFAULT '{}'::"jsonb",
    "accessibility_assessment" "jsonb" DEFAULT '{}'::"jsonb",
    "data_encryption_status" "text",
    "access_controls_rating" "text",
    "vulnerability_assessment" "jsonb" DEFAULT '{}'::"jsonb",
    "penetration_test_results" "jsonb" DEFAULT '{}'::"jsonb",
    "security_certifications" "text"[] DEFAULT '{}'::"text"[],
    "privacy_policy_review" "jsonb" DEFAULT '{}'::"jsonb",
    "data_minimization_score" integer,
    "consent_mechanism_rating" "text",
    "data_subject_rights_support" "text",
    "cross_border_transfer_assessment" "jsonb" DEFAULT '{}'::"jsonb",
    "approval_recommendation" "text",
    "recommended_restrictions" "text"[] DEFAULT '{}'::"text"[],
    "monitoring_requirements" "text"[] DEFAULT '{}'::"text"[],
    "training_requirements" "text"[] DEFAULT '{}'::"text"[],
    "review_schedule" "text",
    "reviewed_by" "text",
    "review_date" timestamp with time zone,
    "review_notes" "text",
    "approved_by" "text",
    "approval_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "risk_assessments_approval_recommendation_check" CHECK (("approval_recommendation" = ANY (ARRAY['approve'::"text", 'conditional_approval'::"text", 'reject'::"text", 'needs_more_info'::"text"]))),
    CONSTRAINT "risk_assessments_assessment_type_check" CHECK (("assessment_type" = ANY (ARRAY['initial'::"text", 'annual'::"text", 'incident'::"text", 'change_request'::"text"]))),
    CONSTRAINT "risk_assessments_compliance_risk_score_check" CHECK ((("compliance_risk_score" >= 0) AND ("compliance_risk_score" <= 100))),
    CONSTRAINT "risk_assessments_financial_risk_score_check" CHECK ((("financial_risk_score" >= 0) AND ("financial_risk_score" <= 100))),
    CONSTRAINT "risk_assessments_operational_risk_score_check" CHECK ((("operational_risk_score" >= 0) AND ("operational_risk_score" <= 100))),
    CONSTRAINT "risk_assessments_overall_risk_score_check" CHECK ((("overall_risk_score" >= 0) AND ("overall_risk_score" <= 100))),
    CONSTRAINT "risk_assessments_pedagogical_risk_score_check" CHECK ((("pedagogical_risk_score" >= 0) AND ("pedagogical_risk_score" <= 100))),
    CONSTRAINT "risk_assessments_privacy_risk_score_check" CHECK ((("privacy_risk_score" >= 0) AND ("privacy_risk_score" <= 100))),
    CONSTRAINT "risk_assessments_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['Low'::"text", 'Medium'::"text", 'High'::"text", 'Critical'::"text"]))),
    CONSTRAINT "risk_assessments_security_risk_score_check" CHECK ((("security_risk_score" >= 0) AND ("security_risk_score" <= 100)))
);


ALTER TABLE "public"."risk_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_calculations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization" "text" NOT NULL,
    "calculation_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "monthly_savings" numeric(12,2),
    "annual_projection" numeric(12,2),
    "payback_period_months" integer,
    "roi_percentage" numeric(6,2),
    "calculation_details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roi_calculations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_type" character varying(255) NOT NULL,
    "metric_value" numeric(12,2) NOT NULL,
    "category" character varying(100),
    "metric_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "organization" character varying(255) NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."roi_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_metrics_backup_20251009" (
    "id" "uuid",
    "metric_name" character varying(255),
    "baseline_value" numeric(12,2),
    "target_value" numeric(12,2),
    "current_value" numeric(12,2),
    "unit" character varying(50),
    "category" character varying(100),
    "measurement_date" "date",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "organization" character varying(255)
);


ALTER TABLE "public"."roi_metrics_backup_20251009" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_metrics_backup_pre_align" (
    "id" "uuid",
    "metric_name" character varying(255),
    "baseline_value" numeric(12,2),
    "target_value" numeric(12,2),
    "current_value" numeric(12,2),
    "unit" character varying(50),
    "category" character varying(100),
    "measurement_date" "date",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "organization" character varying(255)
);


ALTER TABLE "public"."roi_metrics_backup_pre_align" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roi_scenarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization" character varying(255) NOT NULL,
    "user_id" "uuid",
    "name" character varying(255) NOT NULL,
    "description" "text",
    "audience_label" "text",
    "assumptions" "jsonb" NOT NULL,
    "results" "jsonb" NOT NULL,
    "is_favorite" boolean DEFAULT false,
    "last_used_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."roi_scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."streamlined_assessment_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "institution_type" "text",
    "institution_size" "text",
    "institution_state" "text",
    "ai_journey_stage" "text",
    "biggest_challenge" "text",
    "top_priorities" "text"[],
    "implementation_timeline" "text",
    "contact_name" "text",
    "contact_email" "text",
    "contact_role" "text",
    "preferred_consultation_time" "text",
    "special_considerations" "text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "responses" "jsonb",
    "scores" "jsonb",
    "readiness_level" character varying(50),
    "ai_roadmap" "text"
);


ALTER TABLE "public"."streamlined_assessment_responses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."streamlined_assessment_responses"."responses" IS 'JSONB object containing question_id: answer_value pairs for NIST assessment';



COMMENT ON COLUMN "public"."streamlined_assessment_responses"."scores" IS 'JSONB object containing calculated scores by category (GOVERN, MAP, MEASURE, MANAGE, OVERALL)';



COMMENT ON COLUMN "public"."streamlined_assessment_responses"."readiness_level" IS 'Overall readiness level: Beginning, Emerging, Developing, or Advanced';



COMMENT ON COLUMN "public"."streamlined_assessment_responses"."ai_roadmap" IS 'AI-generated 30/60/90 day implementation roadmap based on assessment results';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "status" "text" NOT NULL,
    "tier" "text",
    "current_period_end" timestamp with time zone,
    "trial_ends_at" timestamp with time zone,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "stripe_price_id" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization" character varying(255) NOT NULL,
    "task_id" "uuid",
    "author_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."task_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_member_id" "uuid",
    "action_type" "text" NOT NULL,
    "action_details" "jsonb",
    "entity_type" "text",
    "entity_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_activity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization" character varying(255) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "storage_path" "text" NOT NULL,
    "tags" "text"[],
    "created_by" "uuid",
    "last_modified_by" "uuid",
    "last_modified_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."team_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "team_id" "uuid",
    "user_id" "uuid",
    "role" character varying(50) NOT NULL,
    "permissions" "jsonb" DEFAULT '{"view": true}'::"jsonb",
    "workload_capacity" integer DEFAULT 15,
    "current_workload" integer DEFAULT 0,
    "department" character varying(100),
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "organization" character varying(255),
    "email" "text",
    "full_name" "text",
    "avatar_url" "text",
    "status" "text" DEFAULT 'active'::"text",
    "last_active_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "team_members_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'contributor'::character varying, 'reviewer'::character varying, 'viewer'::character varying])::"text"[])))
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "audience" character varying(20) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "teams_audience_check" CHECK ((("audience")::"text" = ANY ((ARRAY['k12'::character varying, 'highered'::character varying, 'both'::character varying])::"text"[])))
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."uploaded_documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "document_type" "text",
    "file_name" "text" NOT NULL,
    "file_path" "text",
    "file_size" integer,
    "file_url" "text",
    "mime_type" "text",
    "processing_status" "text" DEFAULT 'pending'::"text",
    "processed_at" timestamp with time zone,
    "analysis_result" "jsonb",
    "upload_date" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."uploaded_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tool_id" "uuid",
    "analytics_date" "date" NOT NULL,
    "period_type" "text" DEFAULT 'daily'::"text",
    "active_users" integer DEFAULT 0,
    "new_users" integer DEFAULT 0,
    "sessions_count" integer DEFAULT 0,
    "total_session_duration" integer DEFAULT 0,
    "average_session_duration" numeric(8,2) DEFAULT 0,
    "teacher_users" integer DEFAULT 0,
    "student_users" integer DEFAULT 0,
    "admin_users" integer DEFAULT 0,
    "parent_users" integer DEFAULT 0,
    "usage_by_grade" "jsonb" DEFAULT '{}'::"jsonb",
    "usage_by_subject" "jsonb" DEFAULT '{}'::"jsonb",
    "usage_by_department" "jsonb" DEFAULT '{}'::"jsonb",
    "features_used" "jsonb" DEFAULT '{}'::"jsonb",
    "most_popular_features" "text"[] DEFAULT '{}'::"text"[],
    "system_uptime" numeric(5,2) DEFAULT 100,
    "response_time_avg" numeric(8,2),
    "error_rate" numeric(5,4) DEFAULT 0,
    "user_rating" numeric(3,2),
    "feedback_count" integer DEFAULT 0,
    "support_tickets" integer DEFAULT 0,
    "content_created_count" integer DEFAULT 0,
    "data_processed_volume" numeric(12,2),
    "storage_used" numeric(12,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "usage_analytics_period_type_check" CHECK (("period_type" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'monthly'::"text", 'quarterly'::"text"])))
);


ALTER TABLE "public"."usage_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activity_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "activity_type" "text" NOT NULL,
    "activity_data" "jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "email" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "organization" character varying(255),
    "tier" character varying(100) NOT NULL,
    "stripe_customer_id" character varying(255) NOT NULL,
    "stripe_session_id" character varying(255) NOT NULL,
    "payment_amount" integer NOT NULL,
    "payment_status" character varying(50) DEFAULT 'completed'::character varying,
    "access_granted" boolean DEFAULT true,
    "access_revoked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_test" boolean DEFAULT false NOT NULL,
    "role" character varying(50) DEFAULT 'viewer'::character varying,
    "department" character varying(100),
    "stripe_subscription_id" "text",
    "stripe_price_id" "text",
    "plan_type" "text",
    "trial_ends_at" timestamp with time zone,
    "stripe_customer_email" "text",
    "stripe_product_id" "text",
    CONSTRAINT "user_payments_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'contributor'::character varying, 'reviewer'::character varying, 'viewer'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text" NOT NULL,
    "phone" "text",
    "job_title" "text",
    "department" "text",
    "institution_id" "uuid",
    "institution_name" "text",
    "institution_type" "text",
    "institution_size" "text",
    "student_count" integer,
    "faculty_count" integer,
    "staff_count" integer,
    "annual_budget" numeric(15,2),
    "city" "text",
    "state" "text",
    "country" "text" DEFAULT 'US'::"text",
    "timezone" "text" DEFAULT 'America/New_York'::"text",
    "preferred_mode" "text" DEFAULT 'quick'::"text",
    "assessment_context" "jsonb" DEFAULT '{}'::"jsonb",
    "onboarding_completed" boolean DEFAULT false,
    "onboarding_step" integer DEFAULT 0,
    "onboarding_data" "jsonb" DEFAULT '{}'::"jsonb",
    "subscription_tier" "text",
    "subscription_status" "text" DEFAULT 'inactive'::"text",
    "trial_ends_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_login_at" timestamp with time zone,
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "user_profiles_institution_size_check" CHECK (("institution_size" = ANY (ARRAY['Small'::"text", 'Medium'::"text", 'Large'::"text", 'Extra Large'::"text"]))),
    CONSTRAINT "user_profiles_institution_type_check" CHECK (("institution_type" = ANY (ARRAY['K12'::"text", 'HigherEd'::"text", 'District'::"text", 'University'::"text", 'Community College'::"text", 'Trade School'::"text", 'default'::"text"]))),
    CONSTRAINT "user_profiles_preferred_mode_check" CHECK (("preferred_mode" = ANY (ARRAY['quick'::"text", 'comprehensive'::"text", 'full'::"text"]))),
    CONSTRAINT "user_profiles_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'trial'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_profiles" IS 'Stores comprehensive user and institutional profile information that persists across sessions';



COMMENT ON COLUMN "public"."user_profiles"."assessment_context" IS 'JSONB field storing assessment-specific context and preferences';



COMMENT ON COLUMN "public"."user_profiles"."onboarding_data" IS 'JSONB field storing onboarding responses that previously lived in localStorage';



COMMENT ON COLUMN "public"."user_profiles"."preferences" IS 'JSONB field for user UI/UX preferences';



COMMENT ON COLUMN "public"."user_profiles"."metadata" IS 'JSONB field for extensible custom data';



CREATE OR REPLACE VIEW "public"."user_profile_with_institution" AS
 SELECT "up"."id",
    "up"."user_id",
    "up"."full_name",
    "up"."email",
    "up"."phone",
    "up"."job_title",
    "up"."department",
    "up"."institution_id",
    "up"."institution_name",
    "up"."institution_type",
    "up"."institution_size",
    "up"."student_count",
    "up"."faculty_count",
    "up"."staff_count",
    "up"."annual_budget",
    "up"."city",
    "up"."state",
    "up"."country",
    "up"."timezone",
    "up"."preferred_mode",
    "up"."assessment_context",
    "up"."onboarding_completed",
    "up"."onboarding_step",
    "up"."onboarding_data",
    "up"."subscription_tier",
    "up"."subscription_status",
    "up"."trial_ends_at",
    "up"."created_at",
    "up"."updated_at",
    "up"."last_login_at",
    "up"."preferences",
    "up"."metadata",
    "i"."name" AS "institution_full_name",
    "i"."slug" AS "institution_slug",
    "i"."org_type" AS "institution_org_type",
    "i"."headcount" AS "institution_headcount",
    "i"."budget" AS "institution_budget"
   FROM ("public"."user_profiles" "up"
     LEFT JOIN "public"."institutions" "i" ON (("up"."institution_id" = "i"."id")));


ALTER VIEW "public"."user_profile_with_institution" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_assessments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "section" character varying(50) NOT NULL,
    "question_id" character varying(100) NOT NULL,
    "response" "jsonb" NOT NULL,
    "risk_weight" integer DEFAULT 0,
    "compliance_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vendor_assessments" OWNER TO "postgres";


COMMENT ON TABLE "public"."vendor_assessments" IS 'Questionnaire responses and assessment data';



CREATE TABLE IF NOT EXISTS "public"."vendor_audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "event_type" character varying(50) NOT NULL,
    "event_description" "text" NOT NULL,
    "user_id" character varying(255) NOT NULL,
    "user_email" character varying(255),
    "ip_address" "inet",
    "user_agent" "text",
    "session_id" character varying(255),
    "before_state" "jsonb",
    "after_state" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vendor_audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."vendor_audit_logs" IS 'Audit trail for all vendor-related activities';



CREATE TABLE IF NOT EXISTS "public"."vendor_intakes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "vendor_name" character varying(255) NOT NULL,
    "vendor_url" "text",
    "vendor_description" "text",
    "vendor_category" character varying(100),
    "contact_email" character varying(255),
    "contact_name" character varying(255),
    "business_justification" "text",
    "assessment_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "risk_score" integer DEFAULT 0,
    "risk_level" character varying(20) DEFAULT 'low'::character varying,
    "risk_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "decision_outcome" character varying(20),
    "decision_reason" "text",
    "decision_conditions" "jsonb" DEFAULT '[]'::"jsonb",
    "decision_approver" character varying(255),
    "decision_approved_at" timestamp with time zone,
    "decision_valid_until" timestamp with time zone,
    "created_by" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_by" character varying(255),
    "reviewed_at" timestamp with time zone,
    "requested_urgency" character varying(20) DEFAULT 'medium'::character varying,
    "expected_launch_date" timestamp with time zone,
    "request_notes" "text",
    CONSTRAINT "vendor_intakes_requested_urgency_check" CHECK ((("requested_urgency")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::"text"[]))),
    CONSTRAINT "vendor_intakes_risk_level_check" CHECK ((("risk_level")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "vendor_intakes_risk_score_check" CHECK ((("risk_score" >= 0) AND ("risk_score" <= 100))),
    CONSTRAINT "vendor_intakes_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'under_review'::character varying, 'approved'::character varying, 'rejected'::character varying, 'conditional'::character varying])::"text"[])))
);


ALTER TABLE "public"."vendor_intakes" OWNER TO "postgres";


COMMENT ON TABLE "public"."vendor_intakes" IS 'Main table for vendor intake and assessment tracking';



CREATE MATERIALIZED VIEW "public"."vendor_compliance_report" AS
 SELECT "date_trunc"('month'::"text", "created_at") AS "month",
    "status",
    "risk_level",
    "count"(*) AS "vendor_count",
    "avg"("risk_score") AS "avg_risk_score",
    "sum"(
        CASE
            WHEN (("risk_flags")::"text" ~~ '%FERPA%'::"text") THEN 1
            ELSE 0
        END) AS "ferpa_flagged",
    "sum"(
        CASE
            WHEN (("risk_flags")::"text" ~~ '%COPPA%'::"text") THEN 1
            ELSE 0
        END) AS "coppa_flagged",
    "sum"(
        CASE
            WHEN (("risk_flags")::"text" ~~ '%PPRA%'::"text") THEN 1
            ELSE 0
        END) AS "ppra_flagged",
    "avg"((EXTRACT(epoch FROM ("decision_approved_at" - "created_at")) / (86400)::numeric)) AS "avg_decision_days"
   FROM "public"."vendor_intakes" "vi"
  WHERE ("created_at" >= ("date_trunc"('year'::"text", "now"()) - '2 years'::interval))
  GROUP BY ("date_trunc"('month'::"text", "created_at")), "status", "risk_level"
  ORDER BY ("date_trunc"('month'::"text", "created_at")) DESC, "status", "risk_level"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."vendor_compliance_report" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_control_dependencies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "control_id" "uuid",
    "vendor_name" character varying(255) NOT NULL,
    "dependency_type" character varying(50) NOT NULL,
    "risk_impact" character varying(20) DEFAULT 'medium'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vendor_control_dependencies_dependency_type_check" CHECK ((("dependency_type")::"text" = ANY ((ARRAY['required'::character varying, 'supporting'::character varying, 'alternative'::character varying])::"text"[]))),
    CONSTRAINT "vendor_control_dependencies_risk_impact_check" CHECK ((("risk_impact")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[])))
);


ALTER TABLE "public"."vendor_control_dependencies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_data_flows" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "flow_type" character varying(20) NOT NULL,
    "data_types" "jsonb" DEFAULT '[]'::"jsonb",
    "frequency" character varying(20),
    "volume" character varying(20),
    "encryption_enabled" boolean DEFAULT false,
    "retention_period" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vendor_data_flows_flow_type_check" CHECK ((("flow_type")::"text" = ANY ((ARRAY['inbound'::character varying, 'outbound'::character varying, 'bidirectional'::character varying, 'none'::character varying])::"text"[]))),
    CONSTRAINT "vendor_data_flows_frequency_check" CHECK ((("frequency")::"text" = ANY ((ARRAY['real-time'::character varying, 'daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'on-demand'::character varying])::"text"[]))),
    CONSTRAINT "vendor_data_flows_volume_check" CHECK ((("volume")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::"text"[])))
);


ALTER TABLE "public"."vendor_data_flows" OWNER TO "postgres";


COMMENT ON TABLE "public"."vendor_data_flows" IS 'Data flow documentation for vendor integrations';



CREATE TABLE IF NOT EXISTS "public"."vendor_decision_briefs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "brief_data" "jsonb" NOT NULL,
    "pdf_url" "text",
    "generated_by" character varying(255) NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "recommendation" character varying(20) NOT NULL,
    "risk_summary" "jsonb" DEFAULT '{}'::"jsonb",
    "mitigation_summary" "jsonb" DEFAULT '[]'::"jsonb",
    "approval_requirements" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."vendor_decision_briefs" OWNER TO "postgres";


COMMENT ON TABLE "public"."vendor_decision_briefs" IS 'Generated decision briefs and recommendations';



CREATE TABLE IF NOT EXISTS "public"."vendor_intake_forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid",
    "institution_id" "uuid",
    "submitted_by" "text" NOT NULL,
    "submitter_email" "text",
    "submitter_role" "text",
    "requesting_department" "text",
    "submission_date" timestamp with time zone DEFAULT "now"(),
    "priority_level" "text" DEFAULT 'normal'::"text",
    "tool_name" "text" NOT NULL,
    "vendor_name" "text" NOT NULL,
    "tool_description" "text",
    "tool_url" "text",
    "requested_use_case" "text",
    "educational_objectives" "text"[],
    "target_users" "text"[] DEFAULT '{}'::"text"[],
    "estimated_user_count" integer,
    "min_age" integer DEFAULT 13,
    "max_age" integer DEFAULT 18,
    "grade_levels" "text"[] DEFAULT '{}'::"text"[],
    "subject_areas" "text"[] DEFAULT '{}'::"text"[],
    "usage_frequency" "text",
    "concurrent_users_expected" integer,
    "hosting_location" "text" DEFAULT 'United States'::"text",
    "data_center_location" "text",
    "cloud_provider" "text",
    "model_provider" "text",
    "api_integrations" "text"[] DEFAULT '{}'::"text"[],
    "authentication_method" "text",
    "single_sign_on_support" boolean DEFAULT false,
    "data_collected" "text"[] DEFAULT '{}'::"text"[],
    "pii_collected" boolean DEFAULT false,
    "data_sharing" boolean DEFAULT false,
    "data_sharing_partners" "text"[] DEFAULT '{}'::"text"[],
    "data_retention_period" "text" DEFAULT '1 year'::"text",
    "data_deletion_policy" "text",
    "training_on_user_data" boolean DEFAULT false,
    "opt_out_available" boolean DEFAULT false,
    "data_portability" boolean DEFAULT false,
    "age_gate_implemented" boolean DEFAULT false,
    "parental_consent_required" boolean DEFAULT false,
    "coppa_compliant" boolean DEFAULT false,
    "ferpa_compliant" boolean DEFAULT false,
    "ppra_compliant" boolean DEFAULT false,
    "gdpr_compliant" boolean DEFAULT false,
    "accessibility_compliant" boolean DEFAULT false,
    "content_filtering" boolean DEFAULT false,
    "moderation_features" "text"[] DEFAULT '{}'::"text"[],
    "pricing_model" "text",
    "estimated_annual_cost" numeric(12,2) DEFAULT 0,
    "contract_length" "text" DEFAULT '1 year'::"text",
    "trial_available" boolean DEFAULT false,
    "trial_duration_days" integer DEFAULT 0,
    "pilot_program_requested" boolean DEFAULT false,
    "assigned_reviewer" "text",
    "review_status" "text" DEFAULT 'submitted'::"text",
    "review_priority" "text" DEFAULT 'normal'::"text",
    "expected_completion_date" timestamp with time zone,
    "business_justification" "text",
    "alternatives_considered" "text"[],
    "stakeholder_input" "text",
    "special_requirements" "text",
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vendor_intake_forms_priority_level_check" CHECK (("priority_level" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "vendor_intake_forms_review_status_check" CHECK (("review_status" = ANY (ARRAY['submitted'::"text", 'assigned'::"text", 'screening'::"text", 'risk_assessment'::"text", 'security_review'::"text", 'privacy_review'::"text", 'compliance_check'::"text", 'board_review'::"text", 'approved'::"text", 'conditional'::"text", 'rejected'::"text", 'on_hold'::"text"])))
);


ALTER TABLE "public"."vendor_intake_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_mitigations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "risk_flag" character varying(20) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "mitigation_type" character varying(20) NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "assignee" character varying(255),
    "due_date" timestamp with time zone,
    "evidence" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vendor_mitigations_mitigation_type_check" CHECK ((("mitigation_type")::"text" = ANY ((ARRAY['technical'::character varying, 'procedural'::character varying, 'contractual'::character varying, 'policy'::character varying])::"text"[]))),
    CONSTRAINT "vendor_mitigations_risk_flag_check" CHECK ((("risk_flag")::"text" = ANY ((ARRAY['FERPA'::character varying, 'COPPA'::character varying, 'PPRA'::character varying, 'GDPR'::character varying, 'CCPA'::character varying, 'SOX'::character varying, 'HIPAA'::character varying])::"text"[]))),
    CONSTRAINT "vendor_mitigations_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'implemented'::character varying, 'verified'::character varying])::"text"[])))
);


ALTER TABLE "public"."vendor_mitigations" OWNER TO "postgres";


COMMENT ON TABLE "public"."vendor_mitigations" IS 'Risk mitigation actions for vendor compliance';



CREATE TABLE IF NOT EXISTS "public"."vendor_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vendor_name" "text" NOT NULL,
    "website_url" "text",
    "headquarters_location" "text",
    "business_model" "text",
    "size_category" "text",
    "industry_focus" "text"[],
    "established_year" integer,
    "privacy_contact_email" "text",
    "security_contact_email" "text",
    "support_email" "text",
    "data_protection_officer" "text",
    "privacy_policy_url" "text",
    "terms_of_service_url" "text",
    "security_documentation_url" "text",
    "certification_status" "jsonb" DEFAULT '{}'::"jsonb",
    "compliance_frameworks" "text"[] DEFAULT '{}'::"text"[],
    "audit_history" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "last_reviewed_at" timestamp with time zone,
    "review_status" "text" DEFAULT 'pending'::"text",
    "risk_score" integer DEFAULT 50,
    "trust_level" "text" DEFAULT 'unverified'::"text",
    CONSTRAINT "vendor_profiles_review_status_check" CHECK (("review_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'conditional'::"text", 'rejected'::"text", 'suspended'::"text"]))),
    CONSTRAINT "vendor_profiles_risk_score_check" CHECK ((("risk_score" >= 0) AND ("risk_score" <= 100))),
    CONSTRAINT "vendor_profiles_size_category_check" CHECK (("size_category" = ANY (ARRAY['Startup'::"text", 'SMB'::"text", 'Enterprise'::"text", 'PublicCompany'::"text"]))),
    CONSTRAINT "vendor_profiles_trust_level_check" CHECK (("trust_level" = ANY (ARRAY['unverified'::"text", 'basic'::"text", 'verified'::"text", 'trusted'::"text", 'preferred'::"text"])))
);


ALTER TABLE "public"."vendor_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vendor_id" "uuid",
    "tool_name" "text" NOT NULL,
    "tool_description" "text",
    "tool_category" "text",
    "tool_url" "text",
    "primary_function" "text",
    "target_audience" "text"[],
    "age_range_min" integer DEFAULT 13,
    "age_range_max" integer DEFAULT 18,
    "grade_levels" "text"[] DEFAULT '{}'::"text"[],
    "subject_areas" "text"[] DEFAULT '{}'::"text"[],
    "technical_requirements" "jsonb" DEFAULT '{}'::"jsonb",
    "integration_capabilities" "text"[] DEFAULT '{}'::"text"[],
    "api_availability" boolean DEFAULT false,
    "offline_capability" boolean DEFAULT false,
    "mobile_support" boolean DEFAULT true,
    "browser_requirements" "text"[] DEFAULT '{}'::"text"[],
    "accessibility_features" "text"[] DEFAULT '{}'::"text"[],
    "languages_supported" "text"[] DEFAULT ARRAY['English'::"text"],
    "pricing_model" "text",
    "cost_structure" "jsonb" DEFAULT '{}'::"jsonb",
    "free_tier_available" boolean DEFAULT false,
    "trial_period_days" integer DEFAULT 0,
    "contract_requirements" "text",
    "minimum_contract_length" "text",
    "cancellation_policy" "text",
    "data_residency" "text" DEFAULT 'United States'::"text",
    "hosting_provider" "text",
    "encryption_standards" "text"[] DEFAULT '{}'::"text"[],
    "backup_procedures" "text",
    "disaster_recovery_plan" "text",
    "uptime_guarantee" numeric(5,2),
    "support_channels" "text"[] DEFAULT '{}'::"text"[],
    "training_provided" boolean DEFAULT false,
    "documentation_quality" "text" DEFAULT 'basic'::"text",
    "onboarding_support" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    "risk_assessment_id" "uuid",
    "approval_date" timestamp with time zone,
    "last_compliance_review" timestamp with time zone,
    "next_review_due" timestamp with time zone,
    "active_users_count" integer DEFAULT 0,
    "usage_statistics" "jsonb" DEFAULT '{}'::"jsonb",
    "incident_history" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "vendor_tools_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'conditional'::"text", 'rejected'::"text", 'deprecated'::"text"])))
);


ALTER TABLE "public"."vendor_tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_vetting_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_description" "text",
    "user_id" "uuid",
    "user_name" "text",
    "user_role" "text",
    "action_timestamp" timestamp with time zone DEFAULT "now"(),
    "field_changed" "text",
    "old_value" "jsonb",
    "new_value" "jsonb",
    "change_reason" "text",
    "session_id" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vendor_vetting_audit_action_type_check" CHECK (("action_type" = ANY (ARRAY['create'::"text", 'update'::"text", 'delete'::"text", 'approve'::"text", 'reject'::"text", 'suspend'::"text", 'reactivate'::"text", 'review'::"text"]))),
    CONSTRAINT "vendor_vetting_audit_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['vendor_profile'::"text", 'vendor_tool'::"text", 'intake_form'::"text", 'risk_assessment'::"text", 'decision_brief'::"text", 'approved_tool'::"text", 'compliance_monitoring'::"text"])))
);


ALTER TABLE "public"."vendor_vetting_audit" OWNER TO "postgres";


ALTER TABLE ONLY "public"."analytics_events" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."analytics_events_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."assessment_progress" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."assessment_progress_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."community_event_registrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."community_event_registrations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."community_join_requests" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."community_join_requests_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."expert_session_bookings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."expert_session_bookings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."recommendations_catalog" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recommendations_catalog_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ai_policy_templates"
    ADD CONSTRAINT "ai_policy_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_readiness_assessments"
    ADD CONSTRAINT "ai_readiness_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_readiness_payments"
    ADD CONSTRAINT "ai_readiness_payments_assessment_id_key" UNIQUE ("assessment_id");



ALTER TABLE ONLY "public"."ai_readiness_payments"
    ADD CONSTRAINT "ai_readiness_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_readiness_team_members"
    ADD CONSTRAINT "ai_readiness_team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_readiness_team_members"
    ADD CONSTRAINT "ai_readiness_team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."ai_readiness_teams"
    ADD CONSTRAINT "ai_readiness_teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_approvers"
    ADD CONSTRAINT "approval_approvers_approval_id_user_id_key" UNIQUE ("approval_id", "user_id");



ALTER TABLE ONLY "public"."approval_approvers"
    ADD CONSTRAINT "approval_approvers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_audit_logs"
    ADD CONSTRAINT "approval_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_comments"
    ADD CONSTRAINT "approval_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_events"
    ADD CONSTRAINT "approval_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approval_notifications"
    ADD CONSTRAINT "approval_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approved_tool_catalog"
    ADD CONSTRAINT "approved_tool_catalog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approved_tool_catalog"
    ADD CONSTRAINT "approved_tool_catalog_vendor_id_key" UNIQUE ("vendor_id");



ALTER TABLE ONLY "public"."approved_tools_catalog"
    ADD CONSTRAINT "approved_tools_catalog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artifacts"
    ADD CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_metrics"
    ADD CONSTRAINT "assessment_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_progress"
    ADD CONSTRAINT "assessment_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assessment_progress"
    ADD CONSTRAINT "assessment_progress_session_id_key" UNIQUE ("session_id");



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_password_setup_tokens"
    ADD CONSTRAINT "auth_password_setup_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_password_setup_tokens"
    ADD CONSTRAINT "auth_password_setup_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."blueprint_comments"
    ADD CONSTRAINT "blueprint_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprint_goals"
    ADD CONSTRAINT "blueprint_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprint_phases"
    ADD CONSTRAINT "blueprint_phases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprint_progress"
    ADD CONSTRAINT "blueprint_progress_blueprint_id_key" UNIQUE ("blueprint_id");



ALTER TABLE ONLY "public"."blueprint_progress"
    ADD CONSTRAINT "blueprint_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprint_tasks"
    ADD CONSTRAINT "blueprint_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprint_templates"
    ADD CONSTRAINT "blueprint_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprint_templates"
    ADD CONSTRAINT "blueprint_templates_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_share_token_key" UNIQUE ("share_token");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collaboration_rooms"
    ADD CONSTRAINT "collaboration_rooms_organization_slug_key" UNIQUE ("organization", "slug");



ALTER TABLE ONLY "public"."collaboration_rooms"
    ADD CONSTRAINT "collaboration_rooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_event_registrations"
    ADD CONSTRAINT "community_event_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_join_requests"
    ADD CONSTRAINT "community_join_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_evidence"
    ADD CONSTRAINT "compliance_evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_findings"
    ADD CONSTRAINT "compliance_findings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_frameworks"
    ADD CONSTRAINT "compliance_frameworks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_monitoring"
    ADD CONSTRAINT "compliance_monitoring_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_tracking"
    ADD CONSTRAINT "compliance_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."decision_briefs"
    ADD CONSTRAINT "decision_briefs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_analyses"
    ADD CONSTRAINT "document_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_sections"
    ADD CONSTRAINT "document_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enterprise_algorithm_changelog"
    ADD CONSTRAINT "enterprise_algorithm_changelog_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "public"."enterprise_algorithm_results"
    ADD CONSTRAINT "enterprise_algorithm_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_event_id_team_member_id_key" UNIQUE ("event_id", "team_member_id");



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expert_session_bookings"
    ADD CONSTRAINT "expert_session_bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."framework_changes"
    ADD CONSTRAINT "framework_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."framework_controls"
    ADD CONSTRAINT "framework_controls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."framework_metadata"
    ADD CONSTRAINT "framework_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."framework_monitoring_config"
    ADD CONSTRAINT "framework_monitoring_config_framework_id_key" UNIQUE ("framework_id");



ALTER TABLE ONLY "public"."framework_monitoring_config"
    ADD CONSTRAINT "framework_monitoring_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."framework_scores"
    ADD CONSTRAINT "framework_scores_assessment_id_framework_control_id_key" UNIQUE ("assessment_id", "framework", "control_id");



ALTER TABLE ONLY "public"."framework_scores"
    ADD CONSTRAINT "framework_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gap_analysis_results"
    ADD CONSTRAINT "gap_analysis_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."implementation_phases"
    ADD CONSTRAINT "implementation_phases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."implementation_roadmaps"
    ADD CONSTRAINT "implementation_roadmaps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."institution_memberships"
    ADD CONSTRAINT "institution_memberships_institution_id_user_id_key" UNIQUE ("institution_id", "user_id");



ALTER TABLE ONLY "public"."institution_memberships"
    ADD CONSTRAINT "institution_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pii_detections"
    ADD CONSTRAINT "pii_detections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."policy_control_mappings"
    ADD CONSTRAINT "policy_control_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."policy_redline_packs"
    ADD CONSTRAINT "policy_redline_packs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."policy_update_job_logs"
    ADD CONSTRAINT "policy_update_job_logs_job_id_key" UNIQUE ("job_id");



ALTER TABLE ONLY "public"."policy_update_job_logs"
    ADD CONSTRAINT "policy_update_job_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."policy_update_notifications"
    ADD CONSTRAINT "policy_update_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recommendations_catalog"
    ADD CONSTRAINT "recommendations_catalog_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."recommendations_catalog"
    ADD CONSTRAINT "recommendations_catalog_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_assessments"
    ADD CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_calculations"
    ADD CONSTRAINT "roi_calculations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_metrics"
    ADD CONSTRAINT "roi_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roi_scenarios"
    ADD CONSTRAINT "roi_scenarios_organization_name_key" UNIQUE ("organization", "name");



ALTER TABLE ONLY "public"."roi_scenarios"
    ADD CONSTRAINT "roi_scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."streamlined_assessment_responses"
    ADD CONSTRAINT "streamlined_assessment_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_comments"
    ADD CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."implementation_tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_activity"
    ADD CONSTRAINT "team_activity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_documents"
    ADD CONSTRAINT "team_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."uploaded_documents"
    ADD CONSTRAINT "uploaded_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_analytics"
    ADD CONSTRAINT "usage_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_analytics"
    ADD CONSTRAINT "usage_analytics_tool_id_analytics_date_period_type_key" UNIQUE ("tool_id", "analytics_date", "period_type");



ALTER TABLE ONLY "public"."user_activity_log"
    ADD CONSTRAINT "user_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_payments"
    ADD CONSTRAINT "user_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_payments"
    ADD CONSTRAINT "user_payments_stripe_session_id_key" UNIQUE ("stripe_session_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."vendor_assessments"
    ADD CONSTRAINT "vendor_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_assessments"
    ADD CONSTRAINT "vendor_assessments_vendor_id_section_question_id_key" UNIQUE ("vendor_id", "section", "question_id");



ALTER TABLE ONLY "public"."vendor_audit_logs"
    ADD CONSTRAINT "vendor_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_control_dependencies"
    ADD CONSTRAINT "vendor_control_dependencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_data_flows"
    ADD CONSTRAINT "vendor_data_flows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_decision_briefs"
    ADD CONSTRAINT "vendor_decision_briefs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_intake_forms"
    ADD CONSTRAINT "vendor_intake_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_intakes"
    ADD CONSTRAINT "vendor_intakes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_mitigations"
    ADD CONSTRAINT "vendor_mitigations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_profiles"
    ADD CONSTRAINT "vendor_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_profiles"
    ADD CONSTRAINT "vendor_profiles_vendor_name_key" UNIQUE ("vendor_name");



ALTER TABLE ONLY "public"."vendor_tools"
    ADD CONSTRAINT "vendor_tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_tools"
    ADD CONSTRAINT "vendor_tools_vendor_id_tool_name_key" UNIQUE ("vendor_id", "tool_name");



ALTER TABLE ONLY "public"."vendor_vetting_audit"
    ADD CONSTRAINT "vendor_vetting_audit_pkey" PRIMARY KEY ("id");



CREATE INDEX "enterprise_algorithm_results_assessment_idx" ON "public"."enterprise_algorithm_results" USING "btree" ("assessment_id");



CREATE UNIQUE INDEX "enterprise_algorithm_results_assessment_user_version_uidx" ON "public"."enterprise_algorithm_results" USING "btree" ("assessment_id", "user_id", "algorithm_version");



CREATE INDEX "enterprise_algorithm_results_computed_at_idx" ON "public"."enterprise_algorithm_results" USING "btree" ("computed_at");



CREATE INDEX "enterprise_algorithm_results_user_idx" ON "public"."enterprise_algorithm_results" USING "btree" ("user_id");



CREATE INDEX "idx_activity_log_created_at" ON "public"."user_activity_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activity_log_user_id" ON "public"."user_activity_log" USING "btree" ("user_id");



CREATE INDEX "idx_ai_readiness_assessments_ai_score" ON "public"."ai_readiness_assessments" USING "btree" ("ai_readiness_score");



CREATE INDEX "idx_ai_readiness_assessments_created_at" ON "public"."ai_readiness_assessments" USING "btree" ("created_at");



CREATE INDEX "idx_ai_readiness_assessments_institution_type" ON "public"."ai_readiness_assessments" USING "btree" ("institution_type");



CREATE INDEX "idx_ai_readiness_assessments_status" ON "public"."ai_readiness_assessments" USING "btree" ("status");



CREATE INDEX "idx_ai_readiness_assessments_tier" ON "public"."ai_readiness_assessments" USING "btree" ("tier");



CREATE INDEX "idx_ai_readiness_assessments_user_id" ON "public"."ai_readiness_assessments" USING "btree" ("user_id");



CREATE INDEX "idx_ai_readiness_domain_scores" ON "public"."ai_readiness_assessments" USING "gin" ("domain_scores");



CREATE INDEX "idx_ai_readiness_payments_assessment_id" ON "public"."ai_readiness_payments" USING "btree" ("assessment_id");



CREATE INDEX "idx_ai_readiness_payments_status" ON "public"."ai_readiness_payments" USING "btree" ("payment_status");



CREATE INDEX "idx_ai_readiness_policy_recs" ON "public"."ai_readiness_assessments" USING "gin" ("policy_recommendations");



CREATE INDEX "idx_ai_readiness_responses" ON "public"."ai_readiness_assessments" USING "gin" ("responses");



CREATE INDEX "idx_ai_readiness_team_members_assessment_id" ON "public"."ai_readiness_team_members" USING "btree" ("assessment_id");



CREATE INDEX "idx_ai_readiness_team_members_team_id" ON "public"."ai_readiness_team_members" USING "btree" ("team_id");



CREATE INDEX "idx_ai_readiness_teams_assessment_id" ON "public"."ai_readiness_teams" USING "btree" ("assessment_id");



CREATE INDEX "idx_analytics_events_audience" ON "public"."analytics_events" USING "btree" ("audience");



CREATE INDEX "idx_analytics_events_audience_timestamp" ON "public"."analytics_events" USING "btree" ("audience", "timestamp");



CREATE INDEX "idx_analytics_events_event_audience_timestamp" ON "public"."analytics_events" USING "btree" ("event_name", "audience", "timestamp" DESC);



CREATE INDEX "idx_analytics_events_event_name" ON "public"."analytics_events" USING "btree" ("event_name");



CREATE INDEX "idx_analytics_events_properties" ON "public"."analytics_events" USING "gin" ("properties");



CREATE INDEX "idx_analytics_events_session_id" ON "public"."analytics_events" USING "btree" ("session_id") WHERE ("session_id" IS NOT NULL);



CREATE INDEX "idx_analytics_events_timestamp" ON "public"."analytics_events" USING "btree" ("timestamp");



CREATE INDEX "idx_analytics_events_user_id" ON "public"."analytics_events" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);



CREATE UNIQUE INDEX "idx_analytics_summary_unique" ON "public"."analytics_summary" USING "btree" ("audience", "event_name", "event_date");



CREATE INDEX "idx_approval_approvers_approval_id" ON "public"."approval_approvers" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_approvers_decision" ON "public"."approval_approvers" USING "btree" ("decision");



CREATE INDEX "idx_approval_approvers_has_approved" ON "public"."approval_approvers" USING "btree" ("has_approved");



CREATE INDEX "idx_approval_approvers_user_id" ON "public"."approval_approvers" USING "btree" ("user_id");



CREATE INDEX "idx_approval_audit_logs_action" ON "public"."approval_audit_logs" USING "btree" ("action");



CREATE INDEX "idx_approval_audit_logs_approval_id" ON "public"."approval_audit_logs" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_audit_logs_timestamp" ON "public"."approval_audit_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_approval_audit_logs_user_id" ON "public"."approval_audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_approval_comments_approval_id" ON "public"."approval_comments" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_comments_timestamp" ON "public"."approval_comments" USING "btree" ("timestamp");



CREATE INDEX "idx_approval_comments_user_id" ON "public"."approval_comments" USING "btree" ("user_id");



CREATE INDEX "idx_approval_events_action" ON "public"."approval_events" USING "btree" ("action");



CREATE INDEX "idx_approval_events_approval_id" ON "public"."approval_events" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_events_timestamp" ON "public"."approval_events" USING "btree" ("timestamp");



CREATE INDEX "idx_approval_events_who" ON "public"."approval_events" USING "btree" ("who");



CREATE INDEX "idx_approval_notifications_approval_id" ON "public"."approval_notifications" USING "btree" ("approval_id");



CREATE INDEX "idx_approval_notifications_recipient_id" ON "public"."approval_notifications" USING "btree" ("recipient_id");



CREATE INDEX "idx_approval_notifications_sent" ON "public"."approval_notifications" USING "btree" ("sent");



CREATE INDEX "idx_approval_notifications_type" ON "public"."approval_notifications" USING "btree" ("type");



CREATE INDEX "idx_approvals_created_at" ON "public"."approvals" USING "btree" ("created_at");



CREATE INDEX "idx_approvals_created_by" ON "public"."approvals" USING "btree" ("created_by");



CREATE INDEX "idx_approvals_due_date" ON "public"."approvals" USING "btree" ("due_date");



CREATE INDEX "idx_approvals_status" ON "public"."approvals" USING "btree" ("status");



CREATE INDEX "idx_approvals_subject" ON "public"."approvals" USING "btree" ("subject_type", "subject_id");



CREATE INDEX "idx_approved_tool_catalog_category" ON "public"."approved_tool_catalog" USING "btree" ("category");



CREATE INDEX "idx_approved_tool_catalog_is_active" ON "public"."approved_tool_catalog" USING "btree" ("is_active");



CREATE INDEX "idx_approved_tool_catalog_vendor_id" ON "public"."approved_tool_catalog" USING "btree" ("vendor_id");



CREATE INDEX "idx_approved_tools_approval_date" ON "public"."approved_tools_catalog" USING "btree" ("approval_date");



CREATE INDEX "idx_approved_tools_compliance_status" ON "public"."approved_tools_catalog" USING "btree" ("compliance_status");



CREATE INDEX "idx_approved_tools_grade_levels" ON "public"."approved_tools_catalog" USING "gin" ("approved_grade_levels");



CREATE INDEX "idx_approved_tools_roles" ON "public"."approved_tools_catalog" USING "gin" ("approved_roles");



CREATE INDEX "idx_approved_tools_status" ON "public"."approved_tools_catalog" USING "btree" ("status");



CREATE INDEX "idx_approved_tools_subjects" ON "public"."approved_tools_catalog" USING "gin" ("approved_subjects");



CREATE INDEX "idx_approved_tools_tool_id" ON "public"."approved_tools_catalog" USING "btree" ("tool_id");



CREATE INDEX "idx_artifacts_assessment" ON "public"."artifacts" USING "btree" ("assessment_id");



CREATE INDEX "idx_artifacts_created" ON "public"."artifacts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_artifacts_org" ON "public"."artifacts" USING "btree" ("org_id");



CREATE INDEX "idx_artifacts_type" ON "public"."artifacts" USING "btree" ("type");



CREATE INDEX "idx_assessment_completed" ON "public"."streamlined_assessment_responses" USING "btree" ("completed_at" DESC);



CREATE INDEX "idx_assessment_progress_assessment_id" ON "public"."assessment_progress" USING "btree" ("assessment_id");



CREATE INDEX "idx_assessment_progress_audience" ON "public"."assessment_progress" USING "btree" ("audience");



CREATE INDEX "idx_assessment_progress_session_id" ON "public"."assessment_progress" USING "btree" ("session_id");



CREATE INDEX "idx_assessment_progress_updated_at" ON "public"."assessment_progress" USING "btree" ("updated_at");



CREATE INDEX "idx_assessment_progress_user_id" ON "public"."assessment_progress" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_assessment_readiness_level" ON "public"."streamlined_assessment_responses" USING "btree" ("readiness_level");



CREATE INDEX "idx_assessments_created" ON "public"."assessments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_assessments_org" ON "public"."assessments" USING "btree" ("org_id");



CREATE INDEX "idx_assessments_scores" ON "public"."assessments" USING "gin" ("scores");



CREATE INDEX "idx_assessments_user" ON "public"."assessments" USING "btree" ("user_id", "assessment_date" DESC);



CREATE INDEX "idx_audit_logs_user" ON "public"."audit_logs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_blueprint_tasks_blueprint_id" ON "public"."blueprint_tasks" USING "btree" ("blueprint_id");



CREATE INDEX "idx_blueprint_tasks_status" ON "public"."blueprint_tasks" USING "btree" ("status");



CREATE INDEX "idx_blueprint_templates_category" ON "public"."blueprint_templates" USING "btree" ("category");



CREATE INDEX "idx_blueprints_assessment_id" ON "public"."blueprints" USING "btree" ("assessment_id");



CREATE INDEX "idx_blueprints_status" ON "public"."blueprints" USING "btree" ("status");



CREATE INDEX "idx_blueprints_user_id" ON "public"."blueprints" USING "btree" ("user_id");



CREATE INDEX "idx_calendar_events_org" ON "public"."calendar_events" USING "btree" ("organization");



CREATE INDEX "idx_calendar_events_time" ON "public"."calendar_events" USING "btree" ("start_time", "end_time");



CREATE INDEX "idx_collaboration_rooms_org" ON "public"."collaboration_rooms" USING "btree" ("organization");



CREATE INDEX "idx_community_event_registrations_audience" ON "public"."community_event_registrations" USING "btree" ("audience");



CREATE INDEX "idx_community_event_registrations_email" ON "public"."community_event_registrations" USING "btree" ("email");



CREATE INDEX "idx_community_event_registrations_event_id" ON "public"."community_event_registrations" USING "btree" ("event_id");



CREATE INDEX "idx_community_event_registrations_user_id" ON "public"."community_event_registrations" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_community_join_requests_audience" ON "public"."community_join_requests" USING "btree" ("audience");



CREATE INDEX "idx_community_join_requests_created_at" ON "public"."community_join_requests" USING "btree" ("created_at");



CREATE INDEX "idx_community_join_requests_email" ON "public"."community_join_requests" USING "btree" ("email");



CREATE INDEX "idx_community_join_requests_status" ON "public"."community_join_requests" USING "btree" ("status");



CREATE INDEX "idx_compliance_monitoring_date" ON "public"."compliance_monitoring" USING "btree" ("monitoring_date");



CREATE INDEX "idx_compliance_monitoring_tool_id" ON "public"."compliance_monitoring" USING "btree" ("tool_id");



CREATE INDEX "idx_compliance_monitoring_type" ON "public"."compliance_monitoring" USING "btree" ("monitoring_type");



CREATE INDEX "idx_contact_messages_email" ON "public"."contact_messages" USING "btree" ("email");



CREATE INDEX "idx_contact_messages_processed" ON "public"."contact_messages" USING "btree" ("processed");



CREATE INDEX "idx_controls_code" ON "public"."framework_controls" USING "btree" ("code");



CREATE INDEX "idx_controls_framework" ON "public"."framework_controls" USING "btree" ("framework_id");



CREATE INDEX "idx_decision_briefs_brief_date" ON "public"."decision_briefs" USING "btree" ("brief_date");



CREATE INDEX "idx_decision_briefs_recommendation" ON "public"."decision_briefs" USING "btree" ("recommendation");



CREATE INDEX "idx_decision_briefs_risk_assessment_id" ON "public"."decision_briefs" USING "btree" ("risk_assessment_id");



CREATE INDEX "idx_document_analyses_analyzed_at" ON "public"."document_analyses" USING "btree" ("analyzed_at" DESC);



CREATE INDEX "idx_document_analyses_user_id" ON "public"."document_analyses" USING "btree" ("user_id");



CREATE INDEX "idx_documents_created" ON "public"."documents" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_documents_framework_tags" ON "public"."documents" USING "gin" ("framework_tags");



CREATE INDEX "idx_documents_org" ON "public"."documents" USING "btree" ("org_id");



CREATE INDEX "idx_documents_status" ON "public"."documents" USING "btree" ("status");



CREATE INDEX "idx_evidence_current" ON "public"."compliance_evidence" USING "btree" ("is_current", "expires_at");



CREATE INDEX "idx_evidence_tracking" ON "public"."compliance_evidence" USING "btree" ("tracking_id");



CREATE INDEX "idx_expert_session_bookings_audience" ON "public"."expert_session_bookings" USING "btree" ("audience");



CREATE INDEX "idx_expert_session_bookings_email" ON "public"."expert_session_bookings" USING "btree" ("email");



CREATE INDEX "idx_expert_session_bookings_scheduled_at" ON "public"."expert_session_bookings" USING "btree" ("scheduled_at");



CREATE INDEX "idx_expert_session_bookings_session_id" ON "public"."expert_session_bookings" USING "btree" ("session_id");



CREATE INDEX "idx_expert_session_bookings_status" ON "public"."expert_session_bookings" USING "btree" ("status");



CREATE INDEX "idx_expert_session_bookings_user_id" ON "public"."expert_session_bookings" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_findings_status" ON "public"."compliance_findings" USING "btree" ("status", "severity");



CREATE INDEX "idx_findings_tracking" ON "public"."compliance_findings" USING "btree" ("tracking_id");



CREATE INDEX "idx_framework_changes_effective_date" ON "public"."framework_changes" USING "btree" ("effective_date");



CREATE INDEX "idx_framework_changes_framework_id" ON "public"."framework_changes" USING "btree" ("framework_id");



CREATE INDEX "idx_framework_changes_impact_level" ON "public"."framework_changes" USING "btree" ("impact_level");



CREATE INDEX "idx_framework_changes_requires_redline" ON "public"."framework_changes" USING "btree" ("requires_redline");



CREATE INDEX "idx_framework_metadata_status" ON "public"."framework_metadata" USING "btree" ("status");



CREATE INDEX "idx_framework_metadata_updated" ON "public"."framework_metadata" USING "btree" ("updated_at");



CREATE INDEX "idx_framework_scores_assessment" ON "public"."framework_scores" USING "btree" ("assessment_id");



CREATE INDEX "idx_framework_scores_framework" ON "public"."framework_scores" USING "btree" ("framework");



CREATE INDEX "idx_framework_scores_score" ON "public"."framework_scores" USING "btree" ("score" DESC);



CREATE INDEX "idx_frameworks_audience" ON "public"."compliance_frameworks" USING "btree" ("audience", "is_active");



CREATE INDEX "idx_gap_analysis_user_id" ON "public"."gap_analysis_results" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_gap_analysis_user_id_unique" ON "public"."gap_analysis_results" USING "btree" ("user_id");



CREATE INDEX "idx_implementation_phases_org" ON "public"."implementation_phases" USING "btree" ("organization");



CREATE INDEX "idx_institution_memberships_active" ON "public"."institution_memberships" USING "btree" ("active");



CREATE INDEX "idx_institution_memberships_institution" ON "public"."institution_memberships" USING "btree" ("institution_id");



CREATE INDEX "idx_institution_memberships_user" ON "public"."institution_memberships" USING "btree" ("user_id");



CREATE INDEX "idx_intake_forms_assessment_id" ON "public"."vendor_intake_forms" USING "btree" ("assessment_id");



CREATE INDEX "idx_intake_forms_assigned_reviewer" ON "public"."vendor_intake_forms" USING "btree" ("assigned_reviewer");



CREATE INDEX "idx_intake_forms_status" ON "public"."vendor_intake_forms" USING "btree" ("review_status");



CREATE INDEX "idx_intake_forms_submission_date" ON "public"."vendor_intake_forms" USING "btree" ("submission_date");



CREATE INDEX "idx_intake_forms_submitted_by" ON "public"."vendor_intake_forms" USING "btree" ("submitted_by");



CREATE INDEX "idx_job_logs_executed_at" ON "public"."policy_update_job_logs" USING "btree" ("executed_at");



CREATE INDEX "idx_job_logs_success" ON "public"."policy_update_job_logs" USING "btree" ("success");



CREATE INDEX "idx_metrics_name" ON "public"."assessment_metrics" USING "btree" ("metric_name");



CREATE INDEX "idx_metrics_recorded" ON "public"."assessment_metrics" USING "btree" ("recorded_at" DESC);



CREATE INDEX "idx_monitoring_config_enabled" ON "public"."framework_monitoring_config" USING "btree" ("enabled");



CREATE INDEX "idx_monitoring_config_framework_id" ON "public"."framework_monitoring_config" USING "btree" ("framework_id");



CREATE INDEX "idx_monitoring_config_next_check" ON "public"."framework_monitoring_config" USING "btree" ("next_check");



CREATE INDEX "idx_password_setup_token" ON "public"."auth_password_setup_tokens" USING "btree" ("token");



CREATE INDEX "idx_pii_detected" ON "public"."pii_detections" USING "btree" ("detected_at" DESC);



CREATE INDEX "idx_pii_document" ON "public"."pii_detections" USING "btree" ("document_id");



CREATE INDEX "idx_pii_type" ON "public"."pii_detections" USING "btree" ("pii_type");



CREATE INDEX "idx_policy_mappings_control" ON "public"."policy_control_mappings" USING "btree" ("control_id");



CREATE INDEX "idx_policy_notifications_recipient" ON "public"."policy_update_notifications" USING "btree" ("recipient_id");



CREATE INDEX "idx_policy_notifications_redline_pack" ON "public"."policy_update_notifications" USING "btree" ("redline_pack_id");



CREATE INDEX "idx_policy_notifications_sent" ON "public"."policy_update_notifications" USING "btree" ("sent");



CREATE INDEX "idx_policy_notifications_type" ON "public"."policy_update_notifications" USING "btree" ("type");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_recommendations_category" ON "public"."recommendations_catalog" USING "btree" ("category");



CREATE INDEX "idx_recommendations_user" ON "public"."recommendations" USING "btree" ("user_id", "is_active" DESC, "priority_score" DESC);



CREATE INDEX "idx_redline_packs_created_at" ON "public"."policy_redline_packs" USING "btree" ("created_at");



CREATE INDEX "idx_redline_packs_framework_change" ON "public"."policy_redline_packs" USING "btree" ("framework_change_id");



CREATE INDEX "idx_redline_packs_generated_by" ON "public"."policy_redline_packs" USING "btree" ("generated_by");



CREATE INDEX "idx_redline_packs_policy_id" ON "public"."policy_redline_packs" USING "btree" ("policy_id");



CREATE INDEX "idx_redline_packs_status" ON "public"."policy_redline_packs" USING "btree" ("status");



CREATE INDEX "idx_risk_assessments_intake_form_id" ON "public"."risk_assessments" USING "btree" ("intake_form_id");



CREATE INDEX "idx_risk_assessments_overall_score" ON "public"."risk_assessments" USING "btree" ("overall_risk_score");



CREATE INDEX "idx_risk_assessments_risk_level" ON "public"."risk_assessments" USING "btree" ("risk_level");



CREATE INDEX "idx_risk_assessments_tool_id" ON "public"."risk_assessments" USING "btree" ("tool_id");



CREATE INDEX "idx_roadmaps_user_id" ON "public"."implementation_roadmaps" USING "btree" ("user_id");



CREATE INDEX "idx_roi_calculations_org" ON "public"."roi_calculations" USING "btree" ("organization", "calculation_date" DESC);



CREATE INDEX "idx_roi_metrics_org" ON "public"."roi_metrics" USING "btree" ("organization");



CREATE INDEX "idx_roi_metrics_org_date" ON "public"."roi_metrics" USING "btree" ("organization", "metric_date" DESC);



CREATE INDEX "idx_roi_scenarios_favorite" ON "public"."roi_scenarios" USING "btree" ("is_favorite", "updated_at" DESC);



CREATE INDEX "idx_roi_scenarios_org" ON "public"."roi_scenarios" USING "btree" ("organization");



CREATE INDEX "idx_roi_scenarios_user" ON "public"."roi_scenarios" USING "btree" ("user_id");



CREATE INDEX "idx_sections_document" ON "public"."document_sections" USING "btree" ("document_id");



CREATE INDEX "idx_sections_page" ON "public"."document_sections" USING "btree" ("page_number");



CREATE INDEX "idx_sections_type" ON "public"."document_sections" USING "btree" ("section_type");



CREATE INDEX "idx_streamlined_assessment_user_id" ON "public"."streamlined_assessment_responses" USING "btree" ("user_id");



CREATE INDEX "idx_subscriptions_user_status" ON "public"."subscriptions" USING "btree" ("user_id", "status");



CREATE INDEX "idx_task_comments_org" ON "public"."task_comments" USING "btree" ("organization");



CREATE INDEX "idx_task_comments_task" ON "public"."task_comments" USING "btree" ("task_id");



CREATE INDEX "idx_tasks_org" ON "public"."implementation_tasks" USING "btree" ("organization");



CREATE INDEX "idx_tasks_phase" ON "public"."implementation_tasks" USING "btree" ("phase_id");



CREATE INDEX "idx_tasks_status" ON "public"."implementation_tasks" USING "btree" ("status");



CREATE INDEX "idx_team_documents_org" ON "public"."team_documents" USING "btree" ("organization");



CREATE INDEX "idx_team_members_active" ON "public"."team_members" USING "btree" ("is_active");



CREATE INDEX "idx_team_members_org" ON "public"."team_members" USING "btree" ("organization");



CREATE INDEX "idx_team_members_team_id" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_user_id" ON "public"."team_members" USING "btree" ("user_id");



CREATE INDEX "idx_teams_org_audience" ON "public"."teams" USING "btree" ("org_id", "audience");



CREATE INDEX "idx_tracking_assigned_to" ON "public"."compliance_tracking" USING "btree" ("assigned_to");



CREATE INDEX "idx_tracking_control" ON "public"."compliance_tracking" USING "btree" ("control_id");



CREATE INDEX "idx_tracking_due_date" ON "public"."compliance_tracking" USING "btree" ("due_date");



CREATE INDEX "idx_tracking_org_status" ON "public"."compliance_tracking" USING "btree" ("org_id", "status");



CREATE INDEX "idx_tracking_priority" ON "public"."compliance_tracking" USING "btree" ("priority");



CREATE INDEX "idx_uploaded_documents_user_id" ON "public"."uploaded_documents" USING "btree" ("user_id");



CREATE INDEX "idx_usage_analytics_date" ON "public"."usage_analytics" USING "btree" ("analytics_date");



CREATE INDEX "idx_usage_analytics_period_type" ON "public"."usage_analytics" USING "btree" ("period_type");



CREATE INDEX "idx_usage_analytics_tool_id" ON "public"."usage_analytics" USING "btree" ("tool_id");



CREATE INDEX "idx_user_payments_access" ON "public"."user_payments" USING "btree" ("access_granted");



CREATE INDEX "idx_user_payments_email" ON "public"."user_payments" USING "btree" ("email");



CREATE INDEX "idx_user_payments_is_test" ON "public"."user_payments" USING "btree" ("is_test");



CREATE INDEX "idx_user_payments_stripe_customer" ON "public"."user_payments" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_user_payments_tier" ON "public"."user_payments" USING "btree" ("tier");



CREATE INDEX "idx_user_payments_user_id" ON "public"."user_payments" USING "btree" ("user_id");



CREATE INDEX "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");



CREATE INDEX "idx_user_profiles_institution_id" ON "public"."user_profiles" USING "btree" ("institution_id");



CREATE INDEX "idx_user_profiles_institution_type" ON "public"."user_profiles" USING "btree" ("institution_type");



CREATE INDEX "idx_user_profiles_subscription_status" ON "public"."user_profiles" USING "btree" ("subscription_status");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_vendor_assessments_section" ON "public"."vendor_assessments" USING "btree" ("section");



CREATE INDEX "idx_vendor_assessments_vendor_id" ON "public"."vendor_assessments" USING "btree" ("vendor_id");



CREATE INDEX "idx_vendor_audit_logs_created_at" ON "public"."vendor_audit_logs" USING "btree" ("created_at");



CREATE INDEX "idx_vendor_audit_logs_event_type" ON "public"."vendor_audit_logs" USING "btree" ("event_type");



CREATE INDEX "idx_vendor_audit_logs_user_id" ON "public"."vendor_audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_vendor_audit_logs_vendor_id" ON "public"."vendor_audit_logs" USING "btree" ("vendor_id");



CREATE INDEX "idx_vendor_data_flows_flow_type" ON "public"."vendor_data_flows" USING "btree" ("flow_type");



CREATE INDEX "idx_vendor_data_flows_vendor_id" ON "public"."vendor_data_flows" USING "btree" ("vendor_id");



CREATE INDEX "idx_vendor_decision_briefs_generated_at" ON "public"."vendor_decision_briefs" USING "btree" ("generated_at");



CREATE INDEX "idx_vendor_decision_briefs_vendor_id" ON "public"."vendor_decision_briefs" USING "btree" ("vendor_id");



CREATE INDEX "idx_vendor_dependencies_control" ON "public"."vendor_control_dependencies" USING "btree" ("control_id");



CREATE INDEX "idx_vendor_intakes_created_at" ON "public"."vendor_intakes" USING "btree" ("created_at");



CREATE INDEX "idx_vendor_intakes_created_by" ON "public"."vendor_intakes" USING "btree" ("created_by");



CREATE INDEX "idx_vendor_intakes_risk_level" ON "public"."vendor_intakes" USING "btree" ("risk_level");



CREATE INDEX "idx_vendor_intakes_status" ON "public"."vendor_intakes" USING "btree" ("status");



CREATE INDEX "idx_vendor_intakes_vendor_name" ON "public"."vendor_intakes" USING "btree" ("vendor_name");



CREATE INDEX "idx_vendor_mitigations_risk_flag" ON "public"."vendor_mitigations" USING "btree" ("risk_flag");



CREATE INDEX "idx_vendor_mitigations_status" ON "public"."vendor_mitigations" USING "btree" ("status");



CREATE INDEX "idx_vendor_mitigations_vendor_id" ON "public"."vendor_mitigations" USING "btree" ("vendor_id");



CREATE INDEX "idx_vendor_profiles_created_at" ON "public"."vendor_profiles" USING "btree" ("created_at");



CREATE INDEX "idx_vendor_profiles_name" ON "public"."vendor_profiles" USING "btree" ("vendor_name");



CREATE INDEX "idx_vendor_profiles_risk_score" ON "public"."vendor_profiles" USING "btree" ("risk_score");



CREATE INDEX "idx_vendor_profiles_status" ON "public"."vendor_profiles" USING "btree" ("review_status");



CREATE INDEX "idx_vendor_tools_category" ON "public"."vendor_tools" USING "btree" ("tool_category");



CREATE INDEX "idx_vendor_tools_grade_levels" ON "public"."vendor_tools" USING "gin" ("grade_levels");



CREATE INDEX "idx_vendor_tools_name" ON "public"."vendor_tools" USING "btree" ("tool_name");



CREATE INDEX "idx_vendor_tools_status" ON "public"."vendor_tools" USING "btree" ("status");



CREATE INDEX "idx_vendor_tools_subject_areas" ON "public"."vendor_tools" USING "gin" ("subject_areas");



CREATE INDEX "idx_vendor_tools_vendor_id" ON "public"."vendor_tools" USING "btree" ("vendor_id");



CREATE INDEX "idx_vendor_vetting_audit_action_type" ON "public"."vendor_vetting_audit" USING "btree" ("action_type");



CREATE INDEX "idx_vendor_vetting_audit_entity" ON "public"."vendor_vetting_audit" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_vendor_vetting_audit_timestamp" ON "public"."vendor_vetting_audit" USING "btree" ("action_timestamp");



CREATE INDEX "idx_vendor_vetting_audit_user" ON "public"."vendor_vetting_audit" USING "btree" ("user_id");



CREATE UNIQUE INDEX "user_payments_user_id_unique" ON "public"."user_payments" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "audit_approved_tools_catalog" AFTER INSERT OR DELETE OR UPDATE ON "public"."approved_tools_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_trail"();



CREATE OR REPLACE TRIGGER "audit_decision_briefs" AFTER INSERT OR DELETE OR UPDATE ON "public"."decision_briefs" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_trail"();



CREATE OR REPLACE TRIGGER "audit_risk_assessments" AFTER INSERT OR DELETE OR UPDATE ON "public"."risk_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_trail"();



CREATE OR REPLACE TRIGGER "audit_vendor_profiles" AFTER INSERT OR DELETE OR UPDATE ON "public"."vendor_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_trail"();



CREATE OR REPLACE TRIGGER "audit_vendor_tools" AFTER INSERT OR DELETE OR UPDATE ON "public"."vendor_tools" FOR EACH ROW EXECUTE FUNCTION "public"."create_audit_trail"();



CREATE OR REPLACE TRIGGER "enterprise_algorithm_results_set_updated_at" BEFORE UPDATE ON "public"."enterprise_algorithm_results" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_timestamp"();



CREATE OR REPLACE TRIGGER "set_assessments_updated_at" BEFORE UPDATE ON "public"."assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_user_payments_updated_at" BEFORE UPDATE ON "public"."user_payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_update_approval_approvers_updated_at" BEFORE UPDATE ON "public"."approval_approvers" FOR EACH ROW EXECUTE FUNCTION "public"."update_approval_approvers_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_approval_updated_at" BEFORE UPDATE ON "public"."approvals" FOR EACH ROW EXECUTE FUNCTION "public"."update_approval_updated_at"();



CREATE OR REPLACE TRIGGER "update_ai_readiness_assessments_updated_at" BEFORE UPDATE ON "public"."ai_readiness_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_ai_readiness_updated_at"();



CREATE OR REPLACE TRIGGER "update_approved_tool_catalog_updated_at" BEFORE UPDATE ON "public"."approved_tool_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_approved_tools_catalog_updated_at" BEFORE UPDATE ON "public"."approved_tools_catalog" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_assessment_progress_updated_at" BEFORE UPDATE ON "public"."assessment_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_assessments_updated_at" BEFORE UPDATE ON "public"."assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_community_event_registrations_updated_at" BEFORE UPDATE ON "public"."community_event_registrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_community_join_requests_updated_at" BEFORE UPDATE ON "public"."community_join_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_compliance_monitoring_updated_at" BEFORE UPDATE ON "public"."compliance_monitoring" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_decision_briefs_updated_at" BEFORE UPDATE ON "public"."decision_briefs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_expert_session_bookings_updated_at" BEFORE UPDATE ON "public"."expert_session_bookings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_frameworks_updated_at" BEFORE UPDATE ON "public"."compliance_frameworks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_risk_assessments_updated_at" BEFORE UPDATE ON "public"."risk_assessments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tracking_updated_at" BEFORE UPDATE ON "public"."compliance_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_usage_analytics_updated_at" BEFORE UPDATE ON "public"."usage_analytics" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_payments_updated_at" BEFORE UPDATE ON "public"."user_payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_timestamp" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_profile_timestamp"();



CREATE OR REPLACE TRIGGER "update_vendor_intake_forms_updated_at" BEFORE UPDATE ON "public"."vendor_intake_forms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vendor_intakes_updated_at" BEFORE UPDATE ON "public"."vendor_intakes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vendor_mitigations_updated_at" BEFORE UPDATE ON "public"."vendor_mitigations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vendor_profiles_updated_at" BEFORE UPDATE ON "public"."vendor_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vendor_tools_updated_at" BEFORE UPDATE ON "public"."vendor_tools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ai_readiness_assessments"
    ADD CONSTRAINT "ai_readiness_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_readiness_payments"
    ADD CONSTRAINT "ai_readiness_payments_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."ai_readiness_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_readiness_team_members"
    ADD CONSTRAINT "ai_readiness_team_members_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."ai_readiness_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_readiness_team_members"
    ADD CONSTRAINT "ai_readiness_team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."ai_readiness_teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_readiness_team_members"
    ADD CONSTRAINT "ai_readiness_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_readiness_teams"
    ADD CONSTRAINT "ai_readiness_teams_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."ai_readiness_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_readiness_teams"
    ADD CONSTRAINT "ai_readiness_teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approved_tool_catalog"
    ADD CONSTRAINT "approved_tool_catalog_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_intakes"("id");



ALTER TABLE ONLY "public"."approved_tools_catalog"
    ADD CONSTRAINT "approved_tools_catalog_decision_brief_id_fkey" FOREIGN KEY ("decision_brief_id") REFERENCES "public"."decision_briefs"("id");



ALTER TABLE ONLY "public"."approved_tools_catalog"
    ADD CONSTRAINT "approved_tools_catalog_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."vendor_tools"("id");



ALTER TABLE ONLY "public"."artifacts"
    ADD CONSTRAINT "artifacts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artifacts"
    ADD CONSTRAINT "artifacts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assessments"
    ADD CONSTRAINT "assessments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."auth_password_setup_tokens"
    ADD CONSTRAINT "auth_password_setup_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprint_comments"
    ADD CONSTRAINT "blueprint_comments_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprint_comments"
    ADD CONSTRAINT "blueprint_comments_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."blueprint_comments"
    ADD CONSTRAINT "blueprint_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."blueprint_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprint_comments"
    ADD CONSTRAINT "blueprint_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."blueprint_goals"
    ADD CONSTRAINT "blueprint_goals_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."streamlined_assessment_responses"("id");



ALTER TABLE ONLY "public"."blueprint_goals"
    ADD CONSTRAINT "blueprint_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."blueprint_phases"
    ADD CONSTRAINT "blueprint_phases_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprint_progress"
    ADD CONSTRAINT "blueprint_progress_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprint_tasks"
    ADD CONSTRAINT "blueprint_tasks_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprint_tasks"
    ADD CONSTRAINT "blueprint_tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "public"."blueprint_phases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."streamlined_assessment_responses"("id");



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_goals_id_fkey" FOREIGN KEY ("goals_id") REFERENCES "public"."blueprint_goals"("id");



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_created_by_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."team_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."calendar_events"
    ADD CONSTRAINT "calendar_events_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "public"."implementation_phases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaboration_rooms"
    ADD CONSTRAINT "collaboration_rooms_last_editor_fkey" FOREIGN KEY ("last_editor") REFERENCES "public"."team_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."compliance_evidence"
    ADD CONSTRAINT "compliance_evidence_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_evidence"
    ADD CONSTRAINT "compliance_evidence_tracking_id_fkey" FOREIGN KEY ("tracking_id") REFERENCES "public"."compliance_tracking"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_evidence"
    ADD CONSTRAINT "compliance_evidence_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_findings"
    ADD CONSTRAINT "compliance_findings_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_findings"
    ADD CONSTRAINT "compliance_findings_identified_by_fkey" FOREIGN KEY ("identified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_findings"
    ADD CONSTRAINT "compliance_findings_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_findings"
    ADD CONSTRAINT "compliance_findings_tracking_id_fkey" FOREIGN KEY ("tracking_id") REFERENCES "public"."compliance_tracking"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_monitoring"
    ADD CONSTRAINT "compliance_monitoring_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."approved_tools_catalog"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_tracking"
    ADD CONSTRAINT "compliance_tracking_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_tracking"
    ADD CONSTRAINT "compliance_tracking_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "public"."framework_controls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_tracking"
    ADD CONSTRAINT "compliance_tracking_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_tracking"
    ADD CONSTRAINT "compliance_tracking_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."decision_briefs"
    ADD CONSTRAINT "decision_briefs_intake_form_id_fkey" FOREIGN KEY ("intake_form_id") REFERENCES "public"."vendor_intake_forms"("id");



ALTER TABLE ONLY "public"."decision_briefs"
    ADD CONSTRAINT "decision_briefs_risk_assessment_id_fkey" FOREIGN KEY ("risk_assessment_id") REFERENCES "public"."risk_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_analyses"
    ADD CONSTRAINT "document_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_sections"
    ADD CONSTRAINT "document_sections_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_rsvps"
    ADD CONSTRAINT "event_rsvps_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_approvers"
    ADD CONSTRAINT "fk_approval_approvers_approval" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_approvers"
    ADD CONSTRAINT "fk_approval_approvers_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_audit_logs"
    ADD CONSTRAINT "fk_approval_audit_logs_approval" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_audit_logs"
    ADD CONSTRAINT "fk_approval_audit_logs_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_comments"
    ADD CONSTRAINT "fk_approval_comments_approval" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_comments"
    ADD CONSTRAINT "fk_approval_comments_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_events"
    ADD CONSTRAINT "fk_approval_events_approval" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_events"
    ADD CONSTRAINT "fk_approval_events_who" FOREIGN KEY ("who") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_notifications"
    ADD CONSTRAINT "fk_approval_notifications_approval" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approval_notifications"
    ADD CONSTRAINT "fk_approval_notifications_recipient" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "fk_approvals_created_by" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."framework_changes"
    ADD CONSTRAINT "fk_framework_changes_framework" FOREIGN KEY ("framework_id") REFERENCES "public"."framework_metadata"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."framework_monitoring_config"
    ADD CONSTRAINT "fk_monitoring_config_framework" FOREIGN KEY ("framework_id") REFERENCES "public"."framework_metadata"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."policy_update_notifications"
    ADD CONSTRAINT "fk_policy_notifications_change" FOREIGN KEY ("framework_change_id") REFERENCES "public"."framework_changes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."policy_update_notifications"
    ADD CONSTRAINT "fk_policy_notifications_redline" FOREIGN KEY ("redline_pack_id") REFERENCES "public"."policy_redline_packs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."policy_redline_packs"
    ADD CONSTRAINT "fk_redline_packs_change" FOREIGN KEY ("framework_change_id") REFERENCES "public"."framework_changes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."framework_controls"
    ADD CONSTRAINT "framework_controls_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."compliance_frameworks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."framework_scores"
    ADD CONSTRAINT "framework_scores_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gap_analysis_results"
    ADD CONSTRAINT "gap_analysis_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."implementation_roadmaps"
    ADD CONSTRAINT "implementation_roadmaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."institution_memberships"
    ADD CONSTRAINT "institution_memberships_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."institution_memberships"
    ADD CONSTRAINT "institution_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."pii_detections"
    ADD CONSTRAINT "pii_detections_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."policy_control_mappings"
    ADD CONSTRAINT "policy_control_mappings_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "public"."framework_controls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."policy_control_mappings"
    ADD CONSTRAINT "policy_control_mappings_mapped_by_fkey" FOREIGN KEY ("mapped_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_assessments"
    ADD CONSTRAINT "risk_assessments_intake_form_id_fkey" FOREIGN KEY ("intake_form_id") REFERENCES "public"."vendor_intake_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_assessments"
    ADD CONSTRAINT "risk_assessments_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."vendor_tools"("id");



ALTER TABLE ONLY "public"."roi_scenarios"
    ADD CONSTRAINT "roi_scenarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."streamlined_assessment_responses"
    ADD CONSTRAINT "streamlined_assessment_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_comments"
    ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."team_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task_comments"
    ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."implementation_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."implementation_tasks"
    ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."team_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."implementation_tasks"
    ADD CONSTRAINT "tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "public"."implementation_phases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_activity"
    ADD CONSTRAINT "team_activity_team_member_id_fkey" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_documents"
    ADD CONSTRAINT "team_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."team_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."team_documents"
    ADD CONSTRAINT "team_documents_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "public"."team_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."uploaded_documents"
    ADD CONSTRAINT "uploaded_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_analytics"
    ADD CONSTRAINT "usage_analytics_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."approved_tools_catalog"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity_log"
    ADD CONSTRAINT "user_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_payments"
    ADD CONSTRAINT "user_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_assessments"
    ADD CONSTRAINT "vendor_assessments_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_intakes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_audit_logs"
    ADD CONSTRAINT "vendor_audit_logs_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_intakes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_control_dependencies"
    ADD CONSTRAINT "vendor_control_dependencies_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "public"."framework_controls"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_data_flows"
    ADD CONSTRAINT "vendor_data_flows_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_intakes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_decision_briefs"
    ADD CONSTRAINT "vendor_decision_briefs_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_intakes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_mitigations"
    ADD CONSTRAINT "vendor_mitigations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_intakes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_profiles"
    ADD CONSTRAINT "vendor_profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."vendor_tools"
    ADD CONSTRAINT "vendor_tools_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_vetting_audit"
    ADD CONSTRAINT "vendor_vetting_audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins can delete memberships" ON "public"."institution_memberships" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."institution_memberships" "im"
  WHERE (("im"."user_id" = "auth"."uid"()) AND ("im"."institution_id" = "institution_memberships"."institution_id") AND ("im"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))))));



CREATE POLICY "Admins can manage vendor tools" ON "public"."vendor_tools" USING ((("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['admin'::"text", 'privacy_officer'::"text", 'technology_director'::"text"])));



CREATE POLICY "Admins can manage vendor vetting" ON "public"."vendor_profiles" USING ((("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['admin'::"text", 'privacy_officer'::"text", 'technology_director'::"text"])));



CREATE POLICY "Admins can modify memberships" ON "public"."institution_memberships" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND (("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."institution_memberships" "im"
  WHERE (("im"."user_id" = "auth"."uid"()) AND ("im"."institution_id" = "institution_memberships"."institution_id") AND ("im"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))))));



CREATE POLICY "Admins can update institutions" ON "public"."institutions" FOR UPDATE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."institution_memberships" "im"
  WHERE (("im"."user_id" = "auth"."uid"()) AND ("im"."institution_id" = "institutions"."id") AND ("im"."role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))))));



CREATE POLICY "Allow analytics event insertion" ON "public"."analytics_events" FOR INSERT WITH CHECK ((("event_name" IS NOT NULL) AND ("audience" IS NOT NULL) AND ("timestamp" IS NOT NULL)));



CREATE POLICY "Allow anonymous AI readiness submissions" ON "public"."ai_readiness_assessments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anonymous users can access session-based progress" ON "public"."assessment_progress" USING (("user_id" IS NULL));



CREATE POLICY "Anyone can create bookings" ON "public"."expert_session_bookings" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can create event registrations" ON "public"."community_event_registrations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can create join requests" ON "public"."community_join_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read AI policy templates" ON "public"."ai_policy_templates" FOR SELECT USING (true);



CREATE POLICY "Approvers can update their own decisions" ON "public"."approval_approvers" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Artifacts access by org membership" ON "public"."artifacts" USING ((EXISTS ( SELECT 1
   FROM "public"."institution_memberships" "im"
  WHERE (("im"."institution_id" = "artifacts"."org_id") AND ("im"."user_id" = "auth"."uid"()) AND ("im"."active" = true)))));



CREATE POLICY "Assessments access by org membership" ON "public"."assessments" USING ((EXISTS ( SELECT 1
   FROM "public"."institution_memberships" "im"
  WHERE (("im"."institution_id" = "assessments"."org_id") AND ("im"."user_id" = "auth"."uid"()) AND ("im"."active" = true)))));



CREATE POLICY "Authenticated can submit contact messages" ON "public"."contact_messages" FOR INSERT WITH CHECK (("auth"."role"() = ANY (ARRAY['authenticated'::"text", 'service_role'::"text"])));



CREATE POLICY "Authenticated users can view recommendations" ON "public"."recommendations_catalog" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can view templates" ON "public"."blueprint_templates" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authorized users can update vendor intakes" ON "public"."vendor_intakes" FOR UPDATE USING (((("created_by")::"text" = "current_setting"('app.user_id'::"text", true)) OR ("current_setting"('app.user_role'::"text", true) = ANY (ARRAY['admin'::"text", 'compliance_officer'::"text", 'security_lead'::"text"]))));



CREATE POLICY "Documents access by org membership" ON "public"."documents" USING ((EXISTS ( SELECT 1
   FROM "public"."institution_memberships" "im"
  WHERE (("im"."institution_id" = "documents"."org_id") AND ("im"."user_id" = "auth"."uid"()) AND ("im"."active" = true)))));



CREATE POLICY "Enable read for authenticated users" ON "public"."assessment_metrics" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read for authenticated users" ON "public"."enterprise_algorithm_changelog" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read for authenticated users" ON "public"."institution_memberships" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read for authenticated users" ON "public"."institutions" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Framework scores access by assessment ownership" ON "public"."framework_scores" USING ((EXISTS ( SELECT 1
   FROM ("public"."assessments" "a"
     JOIN "public"."institution_memberships" "im" ON (("im"."institution_id" = "a"."org_id")))
  WHERE (("a"."id" = "framework_scores"."assessment_id") AND ("im"."user_id" = "auth"."uid"()) AND ("im"."active" = true)))));



CREATE POLICY "Only approval creators can manage approvers" ON "public"."approval_approvers" USING (("approval_id" IN ( SELECT "approvals"."id"
   FROM "public"."approvals"
  WHERE ("approvals"."created_by" = "auth"."uid"()))));



CREATE POLICY "Only creators can update approval metadata" ON "public"."approvals" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "PII access by document ownership" ON "public"."pii_detections" USING ((EXISTS ( SELECT 1
   FROM ("public"."documents" "d"
     JOIN "public"."institution_memberships" "im" ON (("im"."institution_id" = "d"."org_id")))
  WHERE (("d"."id" = "pii_detections"."document_id") AND ("im"."user_id" = "auth"."uid"()) AND ("im"."active" = true)))));



CREATE POLICY "Profiles owners can insert" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Profiles owners can read" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Profiles owners can update" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "ROI calculations org access" ON "public"."roi_calculations" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND (("up"."organization")::"text" = "roi_calculations"."organization") AND COALESCE("up"."access_granted", false))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_payments" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND (("up"."organization")::"text" = "roi_calculations"."organization") AND COALESCE("up"."access_granted", false)))));



CREATE POLICY "Reviewers can manage risk assessments" ON "public"."risk_assessments" USING ((("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['admin'::"text", 'privacy_officer'::"text", 'technology_director'::"text", 'reviewer'::"text"])));



CREATE POLICY "Sections access by document ownership" ON "public"."document_sections" USING ((EXISTS ( SELECT 1
   FROM ("public"."documents" "d"
     JOIN "public"."institution_memberships" "im" ON (("im"."institution_id" = "d"."org_id")))
  WHERE (("d"."id" = "document_sections"."document_id") AND ("im"."user_id" = "auth"."uid"()) AND ("im"."active" = true)))));



CREATE POLICY "Service accounts can access all analytics events" ON "public"."analytics_events" USING (((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Service accounts can manage all bookings" ON "public"."expert_session_bookings" USING (((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Service accounts can manage all event registrations" ON "public"."community_event_registrations" USING (((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Service accounts can manage all join requests" ON "public"."community_join_requests" USING (((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")));



CREATE POLICY "Service role can manage all payment records" ON "public"."user_payments" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role manages contact messages" ON "public"."contact_messages" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role manages subscriptions" ON "public"."subscriptions" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Super admins can delete institutions" ON "public"."institutions" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."raw_user_meta_data" ->> 'role'::"text") = 'super_admin'::"text"))))));



CREATE POLICY "System can create audit logs" ON "public"."approval_audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can create notifications" ON "public"."approval_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Team creators can manage teams" ON "public"."ai_readiness_teams" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Team members can read team info" ON "public"."ai_readiness_team_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."ai_readiness_teams"
  WHERE (("ai_readiness_teams"."id" = "ai_readiness_team_members"."team_id") AND ("ai_readiness_teams"."created_by" = "auth"."uid"()))))));



CREATE POLICY "Users can access their own analytics events" ON "public"."analytics_events" FOR SELECT USING ((("user_id" IS NULL) OR ("user_id" = ("auth"."uid"())::"text")));



CREATE POLICY "Users can access their own assessment progress" ON "public"."assessment_progress" USING ((("user_id" IS NULL) OR ("user_id" = ("auth"."uid"())::"text")));



CREATE POLICY "Users can add comments to their approvals" ON "public"."approval_comments" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND ("approval_id" IN ( SELECT "approvals"."id"
   FROM "public"."approvals"
  WHERE (("approvals"."created_by" = "auth"."uid"()) OR ("approvals"."id" IN ( SELECT "approval_approvers"."approval_id"
           FROM "public"."approval_approvers"
          WHERE ("approval_approvers"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can add events to their approvals" ON "public"."approval_events" FOR INSERT WITH CHECK ((("who" = "auth"."uid"()) AND ("approval_id" IN ( SELECT "approvals"."id"
   FROM "public"."approvals"
  WHERE (("approvals"."created_by" = "auth"."uid"()) OR ("approvals"."id" IN ( SELECT "approval_approvers"."approval_id"
           FROM "public"."approval_approvers"
          WHERE ("approval_approvers"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can claim unlinked payment" ON "public"."user_payments" FOR UPDATE USING ((("user_id" IS NULL) AND ("lower"(("email")::"text") = "lower"(("auth"."jwt"() ->> 'email'::"text"))))) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can collaborate in their organization" ON "public"."collaboration_rooms" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("collaboration_rooms"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE) AND (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying])::"text"[]))))));



CREATE POLICY "Users can create approvals" ON "public"."approvals" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can create institutions" ON "public"."institutions" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can create own blueprint goals" ON "public"."blueprint_goals" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own blueprints" ON "public"."blueprints" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own membership" ON "public"."institution_memberships" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can create their own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create vendor intakes" ON "public"."vendor_intakes" FOR INSERT WITH CHECK ((("created_by")::"text" = "current_setting"('app.user_id'::"text", true)));



CREATE POLICY "Users can delete own document analyses" ON "public"."document_analyses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Users can insert own document analyses" ON "public"."document_analyses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage ROI metrics in their organization" ON "public"."roi_metrics" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("roi_metrics"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text") AND (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying])::"text"[]))))));



CREATE POLICY "Users can manage ROI scenarios in their organization" ON "public"."roi_scenarios" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("roi_scenarios"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE) AND (("user_payments"."role" IS NULL) OR (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying, 'member'::character varying])::"text"[]))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("roi_scenarios"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE) AND (("user_payments"."role" IS NULL) OR (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying, 'member'::character varying])::"text"[])))))));



CREATE POLICY "Users can manage calendar events in their organization" ON "public"."calendar_events" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("calendar_events"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text") AND (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying])::"text"[]))))));



CREATE POLICY "Users can manage phases in their organization" ON "public"."implementation_phases" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("implementation_phases"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text") AND (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying])::"text"[]))))));



CREATE POLICY "Users can manage task comments in their organization" ON "public"."task_comments" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("task_comments"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE) AND (("user_payments"."role" IS NULL) OR (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying, 'member'::character varying])::"text"[])))))));



CREATE POLICY "Users can manage tasks in their organization" ON "public"."implementation_tasks" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("implementation_tasks"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text") AND (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying])::"text"[]))))));



CREATE POLICY "Users can manage team documents in their organization" ON "public"."team_documents" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("team_documents"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE) AND (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying, 'editor'::character varying])::"text"[]))))));



CREATE POLICY "Users can manage team members in their organization" ON "public"."team_members" USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("team_members"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text") AND (("user_payments"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying])::"text"[]))))));



CREATE POLICY "Users can read institutions" ON "public"."institutions" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can read own AI payments" ON "public"."ai_readiness_payments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."ai_readiness_assessments"
  WHERE (("ai_readiness_assessments"."id" = "ai_readiness_payments"."assessment_id") AND ("ai_readiness_assessments"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can read own AI readiness assessments" ON "public"."ai_readiness_assessments" FOR SELECT USING ((("auth"."uid"() IS NULL) OR ("user_id" IS NULL) OR ("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."ai_readiness_team_members"
  WHERE (("ai_readiness_team_members"."assessment_id" = "ai_readiness_assessments"."id") AND ("ai_readiness_team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can read their institutions" ON "public"."institutions" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM "public"."institution_memberships" "im"
  WHERE (("im"."user_id" = "auth"."uid"()) AND ("im"."institution_id" = "institutions"."id")))) OR ("auth"."uid"() IS NOT NULL))));



CREATE POLICY "Users can submit intake forms" ON "public"."vendor_intake_forms" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update own AI readiness assessments" ON "public"."ai_readiness_assessments" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."ai_readiness_team_members"
  WHERE (("ai_readiness_team_members"."assessment_id" = "ai_readiness_assessments"."id") AND ("ai_readiness_team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can update own blueprint goals" ON "public"."blueprint_goals" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own blueprints" ON "public"."blueprints" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own document analyses" ON "public"."document_analyses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own bookings" ON "public"."expert_session_bookings" FOR UPDATE USING ((("user_id" IS NULL) OR ("user_id" = ("auth"."uid"())::"text")));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view ROI metrics in their organization" ON "public"."roi_metrics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("roi_metrics"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text")))));



CREATE POLICY "Users can view ROI scenarios in their organization" ON "public"."roi_scenarios" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("roi_scenarios"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE)))));



CREATE POLICY "Users can view approvals they created or are approvers for" ON "public"."approvals" FOR SELECT USING ((("auth"."uid"() = "created_by") OR ("auth"."uid"() IN ( SELECT "approval_approvers"."user_id"
   FROM "public"."approval_approvers"
  WHERE ("approval_approvers"."approval_id" = "approvals"."id")))));



CREATE POLICY "Users can view approved tools" ON "public"."approved_tools_catalog" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can view approver info for their approvals" ON "public"."approval_approvers" FOR SELECT USING (("approval_id" IN ( SELECT "approvals"."id"
   FROM "public"."approvals"
  WHERE (("approvals"."created_by" = "auth"."uid"()) OR ("approvals"."id" IN ( SELECT "approval_approvers_1"."approval_id"
           FROM "public"."approval_approvers" "approval_approvers_1"
          WHERE ("approval_approvers_1"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view audit logs for their approvals" ON "public"."approval_audit_logs" FOR SELECT USING (("approval_id" IN ( SELECT "approvals"."id"
   FROM "public"."approvals"
  WHERE (("approvals"."created_by" = "auth"."uid"()) OR ("approvals"."id" IN ( SELECT "approval_approvers"."approval_id"
           FROM "public"."approval_approvers"
          WHERE ("approval_approvers"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view blueprint phases" ON "public"."blueprint_phases" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."blueprints"
  WHERE (("blueprints"."id" = "blueprint_phases"."blueprint_id") AND (("blueprints"."user_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("blueprints"."shared_with")) OR ("blueprints"."is_public" = true))))));



CREATE POLICY "Users can view blueprint tasks" ON "public"."blueprint_tasks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."blueprints"
  WHERE (("blueprints"."id" = "blueprint_tasks"."blueprint_id") AND (("blueprints"."user_id" = "auth"."uid"()) OR ("auth"."uid"() = ANY ("blueprints"."shared_with")) OR ("blueprints"."is_public" = true))))));



CREATE POLICY "Users can view calendar events in their organization" ON "public"."calendar_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("calendar_events"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text")))));



CREATE POLICY "Users can view collaboration rooms in their organization" ON "public"."collaboration_rooms" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("collaboration_rooms"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE)))));



CREATE POLICY "Users can view comments for their approvals" ON "public"."approval_comments" FOR SELECT USING (("approval_id" IN ( SELECT "approvals"."id"
   FROM "public"."approvals"
  WHERE (("approvals"."created_by" = "auth"."uid"()) OR ("approvals"."id" IN ( SELECT "approval_approvers"."approval_id"
           FROM "public"."approval_approvers"
          WHERE ("approval_approvers"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view events for their approvals" ON "public"."approval_events" FOR SELECT USING (("approval_id" IN ( SELECT "approvals"."id"
   FROM "public"."approvals"
  WHERE (("approvals"."created_by" = "auth"."uid"()) OR ("approvals"."id" IN ( SELECT "approval_approvers"."approval_id"
           FROM "public"."approval_approvers"
          WHERE ("approval_approvers"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view mitigations for accessible vendors" ON "public"."vendor_mitigations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."vendor_intakes" "v"
  WHERE (("v"."id" = "vendor_mitigations"."vendor_id") AND ((("v"."created_by")::"text" = "current_setting"('app.user_id'::"text", true)) OR (("v"."reviewed_by")::"text" = "current_setting"('app.user_id'::"text", true)) OR ("current_setting"('app.user_role'::"text", true) = ANY (ARRAY['admin'::"text", 'compliance_officer'::"text", 'security_lead'::"text"])))))));



CREATE POLICY "Users can view own activity" ON "public"."user_activity_log" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own assessment responses" ON "public"."streamlined_assessment_responses" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own audit logs" ON "public"."audit_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own blueprint goals" ON "public"."blueprint_goals" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own blueprints" ON "public"."blueprints" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() = ANY ("shared_with")) OR ("is_public" = true)));



CREATE POLICY "Users can view own document analyses" ON "public"."document_analyses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own documents" ON "public"."uploaded_documents" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own gap analysis" ON "public"."gap_analysis_results" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own roadmaps" ON "public"."implementation_roadmaps" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subscriptions" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view phases in their organization" ON "public"."implementation_phases" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("implementation_phases"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text")))));



CREATE POLICY "Users can view task comments in their organization" ON "public"."task_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("task_comments"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE)))));



CREATE POLICY "Users can view tasks in their organization" ON "public"."implementation_tasks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("implementation_tasks"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text")))));



CREATE POLICY "Users can view team documents in their organization" ON "public"."team_documents" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("team_documents"."organization")::"text") AND (("user_payments"."payment_status")::"text" = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'premium'::character varying])::"text"[])) AND ("user_payments"."access_granted" IS TRUE)))));



CREATE POLICY "Users can view team members in their organization" ON "public"."team_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_payments"
  WHERE (("user_payments"."user_id" = "auth"."uid"()) AND (("user_payments"."organization")::"text" = ("team_members"."organization")::"text") AND (("user_payments"."payment_status")::"text" = 'premium'::"text")))));



CREATE POLICY "Users can view their notifications" ON "public"."approval_notifications" FOR SELECT USING (("recipient_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own bookings" ON "public"."expert_session_bookings" FOR SELECT USING ((("user_id" IS NULL) OR ("user_id" = ("auth"."uid"())::"text")));



CREATE POLICY "Users can view their own event registrations" ON "public"."community_event_registrations" FOR SELECT USING ((("user_id" IS NULL) OR ("user_id" = ("auth"."uid"())::"text")));



CREATE POLICY "Users can view their own intake forms" ON "public"."vendor_intake_forms" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (("auth"."email"() = "submitter_email") OR (("auth"."jwt"() ->> 'user_role'::"text") = ANY (ARRAY['admin'::"text", 'privacy_officer'::"text", 'technology_director'::"text"])))));



CREATE POLICY "Users can view their own join requests" ON "public"."community_join_requests" FOR SELECT USING ((("user_id" IS NULL) OR ("user_id" = ("auth"."uid"())::"text")));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view user_payments (owned or unlinked email)" ON "public"."user_payments" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (("user_id" IS NULL) AND ("lower"(("email")::"text") = "lower"(("auth"."jwt"() ->> 'email'::"text"))))));



CREATE POLICY "Users can view vendor intakes they created or are assigned to r" ON "public"."vendor_intakes" FOR SELECT USING (((("created_by")::"text" = "current_setting"('app.user_id'::"text", true)) OR (("reviewed_by")::"text" = "current_setting"('app.user_id'::"text", true)) OR ("current_setting"('app.user_role'::"text", true) = ANY (ARRAY['admin'::"text", 'compliance_officer'::"text", 'security_lead'::"text"]))));



CREATE POLICY "Users manage own recommendations" ON "public"."recommendations" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ai_policy_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_readiness_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_readiness_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_readiness_team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_readiness_teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_approvers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approval_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approvals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approved_tool_catalog" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approved_tools_catalog" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessment_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessment_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_password_setup_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blueprint_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blueprint_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blueprint_phases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blueprint_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blueprint_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blueprints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calendar_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaboration_rooms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_event_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_join_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_findings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_frameworks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_monitoring" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."decision_briefs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enterprise_algorithm_changelog" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enterprise_algorithm_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_rsvps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expert_session_bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."framework_changes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."framework_controls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."framework_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."framework_monitoring_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."framework_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gap_analysis_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."implementation_phases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."implementation_roadmaps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."implementation_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."institution_memberships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."institutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pii_detections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."policy_control_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."policy_redline_packs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."policy_update_job_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."policy_update_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."risk_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roi_calculations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roi_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roi_scenarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select-own" ON "public"."enterprise_algorithm_results" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "service role only" ON "public"."auth_password_setup_tokens" TO "service_role" USING (true);



CREATE POLICY "service-role-full-access" ON "public"."enterprise_algorithm_results" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."streamlined_assessment_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_activity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."uploaded_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_analytics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user can view own valid token" ON "public"."auth_password_setup_tokens" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") AND ("used_at" IS NULL) AND ("expires_at" > "now"())));



ALTER TABLE "public"."user_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_control_dependencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_data_flows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_decision_briefs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_intake_forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_intakes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_mitigations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_tools" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_vetting_audit" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_analytics_events"("retention_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_analytics_events"("retention_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_analytics_events"("retention_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_audit_trail"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_audit_trail"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_audit_trail"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_community_stats"("target_audience" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_community_stats"("target_audience" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_community_stats"("target_audience" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_expert_session_stats"("target_audience" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_expert_session_stats"("target_audience" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_expert_session_stats"("target_audience" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_by_email"("email_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_by_email"("email_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_by_email"("email_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_analytics_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_analytics_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_analytics_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_vendor_compliance_report"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_vendor_compliance_report"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_vendor_compliance_report"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ai_readiness_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ai_readiness_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ai_readiness_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_approval_approvers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_approval_approvers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_approval_approvers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_approval_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_approval_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_approval_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile_timestamp"() TO "service_role";



GRANT ALL ON TABLE "public"."ai_policy_templates" TO "anon";
GRANT ALL ON TABLE "public"."ai_policy_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_policy_templates" TO "service_role";



GRANT ALL ON TABLE "public"."ai_readiness_assessments" TO "anon";
GRANT ALL ON TABLE "public"."ai_readiness_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_readiness_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."ai_readiness_payments" TO "anon";
GRANT ALL ON TABLE "public"."ai_readiness_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_readiness_payments" TO "service_role";



GRANT ALL ON TABLE "public"."ai_readiness_team_members" TO "anon";
GRANT ALL ON TABLE "public"."ai_readiness_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_readiness_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."ai_readiness_teams" TO "anon";
GRANT ALL ON TABLE "public"."ai_readiness_teams" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_readiness_teams" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."analytics_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_summary" TO "anon";
GRANT ALL ON TABLE "public"."analytics_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_summary" TO "service_role";



GRANT ALL ON TABLE "public"."approval_approvers" TO "anon";
GRANT ALL ON TABLE "public"."approval_approvers" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_approvers" TO "service_role";



GRANT ALL ON TABLE "public"."approval_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."approval_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."approval_comments" TO "anon";
GRANT ALL ON TABLE "public"."approval_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_comments" TO "service_role";



GRANT ALL ON TABLE "public"."approval_events" TO "anon";
GRANT ALL ON TABLE "public"."approval_events" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_events" TO "service_role";



GRANT ALL ON TABLE "public"."approval_notifications" TO "anon";
GRANT ALL ON TABLE "public"."approval_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."approval_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."approvals" TO "anon";
GRANT ALL ON TABLE "public"."approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."approvals" TO "service_role";



GRANT ALL ON TABLE "public"."approved_tool_catalog" TO "anon";
GRANT ALL ON TABLE "public"."approved_tool_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."approved_tool_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."approved_tools_catalog" TO "anon";
GRANT ALL ON TABLE "public"."approved_tools_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."approved_tools_catalog" TO "service_role";



GRANT ALL ON TABLE "public"."artifacts" TO "anon";
GRANT ALL ON TABLE "public"."artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."artifacts" TO "service_role";



GRANT ALL ON TABLE "public"."assessment_metrics" TO "anon";
GRANT ALL ON TABLE "public"."assessment_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."assessment_progress" TO "anon";
GRANT ALL ON TABLE "public"."assessment_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."assessment_progress" TO "service_role";



GRANT ALL ON SEQUENCE "public"."assessment_progress_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."assessment_progress_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."assessment_progress_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."assessments" TO "anon";
GRANT ALL ON TABLE "public"."assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."assessments" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."auth_password_setup_tokens" TO "anon";
GRANT ALL ON TABLE "public"."auth_password_setup_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_password_setup_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."blueprint_comments" TO "anon";
GRANT ALL ON TABLE "public"."blueprint_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprint_comments" TO "service_role";



GRANT ALL ON TABLE "public"."blueprint_goals" TO "anon";
GRANT ALL ON TABLE "public"."blueprint_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprint_goals" TO "service_role";



GRANT ALL ON TABLE "public"."blueprint_phases" TO "anon";
GRANT ALL ON TABLE "public"."blueprint_phases" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprint_phases" TO "service_role";



GRANT ALL ON TABLE "public"."blueprint_progress" TO "anon";
GRANT ALL ON TABLE "public"."blueprint_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprint_progress" TO "service_role";



GRANT ALL ON TABLE "public"."blueprint_tasks" TO "anon";
GRANT ALL ON TABLE "public"."blueprint_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprint_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."blueprint_templates" TO "anon";
GRANT ALL ON TABLE "public"."blueprint_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprint_templates" TO "service_role";



GRANT ALL ON TABLE "public"."blueprints" TO "anon";
GRANT ALL ON TABLE "public"."blueprints" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprints" TO "service_role";



GRANT ALL ON TABLE "public"."calendar_events" TO "anon";
GRANT ALL ON TABLE "public"."calendar_events" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_events" TO "service_role";



GRANT ALL ON TABLE "public"."collaboration_rooms" TO "anon";
GRANT ALL ON TABLE "public"."collaboration_rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."collaboration_rooms" TO "service_role";



GRANT ALL ON TABLE "public"."community_event_registrations" TO "anon";
GRANT ALL ON TABLE "public"."community_event_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."community_event_registrations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."community_event_registrations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_event_registrations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_event_registrations_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."community_join_requests" TO "anon";
GRANT ALL ON TABLE "public"."community_join_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."community_join_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."community_join_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_join_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_join_requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_evidence" TO "anon";
GRANT ALL ON TABLE "public"."compliance_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_evidence" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_findings" TO "anon";
GRANT ALL ON TABLE "public"."compliance_findings" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_findings" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_frameworks" TO "anon";
GRANT ALL ON TABLE "public"."compliance_frameworks" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_frameworks" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_monitoring" TO "anon";
GRANT ALL ON TABLE "public"."compliance_monitoring" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_monitoring" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_tracking" TO "anon";
GRANT ALL ON TABLE "public"."compliance_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT ALL ON TABLE "public"."decision_briefs" TO "anon";
GRANT ALL ON TABLE "public"."decision_briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."decision_briefs" TO "service_role";



GRANT ALL ON TABLE "public"."document_analyses" TO "anon";
GRANT ALL ON TABLE "public"."document_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."document_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."document_sections" TO "anon";
GRANT ALL ON TABLE "public"."document_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."document_sections" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."enterprise_algorithm_changelog" TO "anon";
GRANT ALL ON TABLE "public"."enterprise_algorithm_changelog" TO "authenticated";
GRANT ALL ON TABLE "public"."enterprise_algorithm_changelog" TO "service_role";



GRANT ALL ON TABLE "public"."enterprise_algorithm_results" TO "anon";
GRANT ALL ON TABLE "public"."enterprise_algorithm_results" TO "authenticated";
GRANT ALL ON TABLE "public"."enterprise_algorithm_results" TO "service_role";



GRANT ALL ON TABLE "public"."event_rsvps" TO "anon";
GRANT ALL ON TABLE "public"."event_rsvps" TO "authenticated";
GRANT ALL ON TABLE "public"."event_rsvps" TO "service_role";



GRANT ALL ON TABLE "public"."expert_session_bookings" TO "anon";
GRANT ALL ON TABLE "public"."expert_session_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."expert_session_bookings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."expert_session_bookings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."expert_session_bookings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."expert_session_bookings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."framework_changes" TO "anon";
GRANT ALL ON TABLE "public"."framework_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."framework_changes" TO "service_role";



GRANT ALL ON TABLE "public"."framework_controls" TO "anon";
GRANT ALL ON TABLE "public"."framework_controls" TO "authenticated";
GRANT ALL ON TABLE "public"."framework_controls" TO "service_role";



GRANT ALL ON TABLE "public"."framework_metadata" TO "anon";
GRANT ALL ON TABLE "public"."framework_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."framework_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."framework_monitoring_config" TO "anon";
GRANT ALL ON TABLE "public"."framework_monitoring_config" TO "authenticated";
GRANT ALL ON TABLE "public"."framework_monitoring_config" TO "service_role";



GRANT ALL ON TABLE "public"."framework_scores" TO "anon";
GRANT ALL ON TABLE "public"."framework_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."framework_scores" TO "service_role";



GRANT ALL ON TABLE "public"."gap_analysis_results" TO "anon";
GRANT ALL ON TABLE "public"."gap_analysis_results" TO "authenticated";
GRANT ALL ON TABLE "public"."gap_analysis_results" TO "service_role";



GRANT ALL ON TABLE "public"."implementation_phases" TO "anon";
GRANT ALL ON TABLE "public"."implementation_phases" TO "authenticated";
GRANT ALL ON TABLE "public"."implementation_phases" TO "service_role";



GRANT ALL ON TABLE "public"."implementation_roadmaps" TO "anon";
GRANT ALL ON TABLE "public"."implementation_roadmaps" TO "authenticated";
GRANT ALL ON TABLE "public"."implementation_roadmaps" TO "service_role";



GRANT ALL ON TABLE "public"."implementation_tasks" TO "anon";
GRANT ALL ON TABLE "public"."implementation_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."implementation_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."institution_memberships" TO "anon";
GRANT ALL ON TABLE "public"."institution_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."institution_memberships" TO "service_role";



GRANT ALL ON TABLE "public"."institutions" TO "anon";
GRANT ALL ON TABLE "public"."institutions" TO "authenticated";
GRANT ALL ON TABLE "public"."institutions" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."pii_detections" TO "anon";
GRANT ALL ON TABLE "public"."pii_detections" TO "authenticated";
GRANT ALL ON TABLE "public"."pii_detections" TO "service_role";



GRANT ALL ON TABLE "public"."policy_control_mappings" TO "anon";
GRANT ALL ON TABLE "public"."policy_control_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."policy_control_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."policy_redline_packs" TO "anon";
GRANT ALL ON TABLE "public"."policy_redline_packs" TO "authenticated";
GRANT ALL ON TABLE "public"."policy_redline_packs" TO "service_role";



GRANT ALL ON TABLE "public"."policy_update_job_logs" TO "anon";
GRANT ALL ON TABLE "public"."policy_update_job_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."policy_update_job_logs" TO "service_role";



GRANT ALL ON TABLE "public"."policy_update_notifications" TO "anon";
GRANT ALL ON TABLE "public"."policy_update_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."policy_update_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recommendations" TO "anon";
GRANT ALL ON TABLE "public"."recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."recommendations_catalog" TO "anon";
GRANT ALL ON TABLE "public"."recommendations_catalog" TO "authenticated";
GRANT ALL ON TABLE "public"."recommendations_catalog" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recommendations_catalog_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recommendations_catalog_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recommendations_catalog_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."risk_assessments" TO "anon";
GRANT ALL ON TABLE "public"."risk_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."roi_calculations" TO "anon";
GRANT ALL ON TABLE "public"."roi_calculations" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_calculations" TO "service_role";



GRANT ALL ON TABLE "public"."roi_metrics" TO "anon";
GRANT ALL ON TABLE "public"."roi_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."roi_metrics_backup_20251009" TO "anon";
GRANT ALL ON TABLE "public"."roi_metrics_backup_20251009" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_metrics_backup_20251009" TO "service_role";



GRANT ALL ON TABLE "public"."roi_metrics_backup_pre_align" TO "anon";
GRANT ALL ON TABLE "public"."roi_metrics_backup_pre_align" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_metrics_backup_pre_align" TO "service_role";



GRANT ALL ON TABLE "public"."roi_scenarios" TO "anon";
GRANT ALL ON TABLE "public"."roi_scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."roi_scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."streamlined_assessment_responses" TO "anon";
GRANT ALL ON TABLE "public"."streamlined_assessment_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."streamlined_assessment_responses" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."task_comments" TO "anon";
GRANT ALL ON TABLE "public"."task_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."task_comments" TO "service_role";



GRANT ALL ON TABLE "public"."team_activity" TO "anon";
GRANT ALL ON TABLE "public"."team_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."team_activity" TO "service_role";



GRANT ALL ON TABLE "public"."team_documents" TO "anon";
GRANT ALL ON TABLE "public"."team_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."team_documents" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."uploaded_documents" TO "anon";
GRANT ALL ON TABLE "public"."uploaded_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."uploaded_documents" TO "service_role";



GRANT ALL ON TABLE "public"."usage_analytics" TO "anon";
GRANT ALL ON TABLE "public"."usage_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."user_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."user_payments" TO "anon";
GRANT ALL ON TABLE "public"."user_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."user_payments" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_profile_with_institution" TO "anon";
GRANT ALL ON TABLE "public"."user_profile_with_institution" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profile_with_institution" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_assessments" TO "anon";
GRANT ALL ON TABLE "public"."vendor_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."vendor_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_intakes" TO "anon";
GRANT ALL ON TABLE "public"."vendor_intakes" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_intakes" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_compliance_report" TO "anon";
GRANT ALL ON TABLE "public"."vendor_compliance_report" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_compliance_report" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_control_dependencies" TO "anon";
GRANT ALL ON TABLE "public"."vendor_control_dependencies" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_control_dependencies" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_data_flows" TO "anon";
GRANT ALL ON TABLE "public"."vendor_data_flows" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_data_flows" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_decision_briefs" TO "anon";
GRANT ALL ON TABLE "public"."vendor_decision_briefs" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_decision_briefs" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_intake_forms" TO "anon";
GRANT ALL ON TABLE "public"."vendor_intake_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_intake_forms" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_mitigations" TO "anon";
GRANT ALL ON TABLE "public"."vendor_mitigations" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_mitigations" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_profiles" TO "anon";
GRANT ALL ON TABLE "public"."vendor_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_tools" TO "anon";
GRANT ALL ON TABLE "public"."vendor_tools" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_tools" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_vetting_audit" TO "anon";
GRANT ALL ON TABLE "public"."vendor_vetting_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_vetting_audit" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
