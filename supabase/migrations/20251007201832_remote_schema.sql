create extension if not exists "pg_trgm" with schema "public" version '1.6';

revoke delete on table "public"."analytics_events" from "anon";

revoke insert on table "public"."analytics_events" from "anon";

revoke references on table "public"."analytics_events" from "anon";

revoke select on table "public"."analytics_events" from "anon";

revoke trigger on table "public"."analytics_events" from "anon";

revoke truncate on table "public"."analytics_events" from "anon";

revoke update on table "public"."analytics_events" from "anon";

revoke delete on table "public"."analytics_events" from "authenticated";

revoke insert on table "public"."analytics_events" from "authenticated";

revoke references on table "public"."analytics_events" from "authenticated";

revoke select on table "public"."analytics_events" from "authenticated";

revoke trigger on table "public"."analytics_events" from "authenticated";

revoke truncate on table "public"."analytics_events" from "authenticated";

revoke update on table "public"."analytics_events" from "authenticated";

revoke delete on table "public"."analytics_events" from "service_role";

revoke insert on table "public"."analytics_events" from "service_role";

revoke references on table "public"."analytics_events" from "service_role";

revoke select on table "public"."analytics_events" from "service_role";

revoke trigger on table "public"."analytics_events" from "service_role";

revoke truncate on table "public"."analytics_events" from "service_role";

revoke update on table "public"."analytics_events" from "service_role";

revoke delete on table "public"."assessment_progress" from "anon";

revoke insert on table "public"."assessment_progress" from "anon";

revoke references on table "public"."assessment_progress" from "anon";

revoke select on table "public"."assessment_progress" from "anon";

revoke trigger on table "public"."assessment_progress" from "anon";

revoke truncate on table "public"."assessment_progress" from "anon";

revoke update on table "public"."assessment_progress" from "anon";

revoke delete on table "public"."assessment_progress" from "authenticated";

revoke insert on table "public"."assessment_progress" from "authenticated";

revoke references on table "public"."assessment_progress" from "authenticated";

revoke select on table "public"."assessment_progress" from "authenticated";

revoke trigger on table "public"."assessment_progress" from "authenticated";

revoke truncate on table "public"."assessment_progress" from "authenticated";

revoke update on table "public"."assessment_progress" from "authenticated";

revoke delete on table "public"."assessment_progress" from "service_role";

revoke insert on table "public"."assessment_progress" from "service_role";

revoke references on table "public"."assessment_progress" from "service_role";

revoke select on table "public"."assessment_progress" from "service_role";

revoke trigger on table "public"."assessment_progress" from "service_role";

revoke truncate on table "public"."assessment_progress" from "service_role";

revoke update on table "public"."assessment_progress" from "service_role";

revoke delete on table "public"."blueprint_comments" from "anon";

revoke insert on table "public"."blueprint_comments" from "anon";

revoke references on table "public"."blueprint_comments" from "anon";

revoke select on table "public"."blueprint_comments" from "anon";

revoke trigger on table "public"."blueprint_comments" from "anon";

revoke truncate on table "public"."blueprint_comments" from "anon";

revoke update on table "public"."blueprint_comments" from "anon";

revoke delete on table "public"."blueprint_comments" from "authenticated";

revoke insert on table "public"."blueprint_comments" from "authenticated";

revoke references on table "public"."blueprint_comments" from "authenticated";

revoke select on table "public"."blueprint_comments" from "authenticated";

revoke trigger on table "public"."blueprint_comments" from "authenticated";

revoke truncate on table "public"."blueprint_comments" from "authenticated";

revoke update on table "public"."blueprint_comments" from "authenticated";

revoke delete on table "public"."blueprint_comments" from "service_role";

revoke insert on table "public"."blueprint_comments" from "service_role";

revoke references on table "public"."blueprint_comments" from "service_role";

revoke select on table "public"."blueprint_comments" from "service_role";

revoke trigger on table "public"."blueprint_comments" from "service_role";

revoke truncate on table "public"."blueprint_comments" from "service_role";

revoke update on table "public"."blueprint_comments" from "service_role";

revoke delete on table "public"."blueprint_goals" from "anon";

revoke insert on table "public"."blueprint_goals" from "anon";

revoke references on table "public"."blueprint_goals" from "anon";

revoke select on table "public"."blueprint_goals" from "anon";

revoke trigger on table "public"."blueprint_goals" from "anon";

revoke truncate on table "public"."blueprint_goals" from "anon";

revoke update on table "public"."blueprint_goals" from "anon";

revoke delete on table "public"."blueprint_goals" from "authenticated";

revoke insert on table "public"."blueprint_goals" from "authenticated";

revoke references on table "public"."blueprint_goals" from "authenticated";

revoke select on table "public"."blueprint_goals" from "authenticated";

revoke trigger on table "public"."blueprint_goals" from "authenticated";

revoke truncate on table "public"."blueprint_goals" from "authenticated";

revoke update on table "public"."blueprint_goals" from "authenticated";

revoke delete on table "public"."blueprint_goals" from "service_role";

revoke insert on table "public"."blueprint_goals" from "service_role";

revoke references on table "public"."blueprint_goals" from "service_role";

revoke select on table "public"."blueprint_goals" from "service_role";

revoke trigger on table "public"."blueprint_goals" from "service_role";

revoke truncate on table "public"."blueprint_goals" from "service_role";

revoke update on table "public"."blueprint_goals" from "service_role";

revoke delete on table "public"."blueprint_phases" from "anon";

revoke insert on table "public"."blueprint_phases" from "anon";

revoke references on table "public"."blueprint_phases" from "anon";

revoke select on table "public"."blueprint_phases" from "anon";

revoke trigger on table "public"."blueprint_phases" from "anon";

revoke truncate on table "public"."blueprint_phases" from "anon";

revoke update on table "public"."blueprint_phases" from "anon";

revoke delete on table "public"."blueprint_phases" from "authenticated";

revoke insert on table "public"."blueprint_phases" from "authenticated";

revoke references on table "public"."blueprint_phases" from "authenticated";

revoke select on table "public"."blueprint_phases" from "authenticated";

revoke trigger on table "public"."blueprint_phases" from "authenticated";

revoke truncate on table "public"."blueprint_phases" from "authenticated";

revoke update on table "public"."blueprint_phases" from "authenticated";

revoke delete on table "public"."blueprint_phases" from "service_role";

revoke insert on table "public"."blueprint_phases" from "service_role";

revoke references on table "public"."blueprint_phases" from "service_role";

revoke select on table "public"."blueprint_phases" from "service_role";

revoke trigger on table "public"."blueprint_phases" from "service_role";

revoke truncate on table "public"."blueprint_phases" from "service_role";

revoke update on table "public"."blueprint_phases" from "service_role";

revoke delete on table "public"."blueprint_progress" from "anon";

revoke insert on table "public"."blueprint_progress" from "anon";

revoke references on table "public"."blueprint_progress" from "anon";

revoke select on table "public"."blueprint_progress" from "anon";

revoke trigger on table "public"."blueprint_progress" from "anon";

revoke truncate on table "public"."blueprint_progress" from "anon";

revoke update on table "public"."blueprint_progress" from "anon";

revoke delete on table "public"."blueprint_progress" from "authenticated";

revoke insert on table "public"."blueprint_progress" from "authenticated";

revoke references on table "public"."blueprint_progress" from "authenticated";

revoke select on table "public"."blueprint_progress" from "authenticated";

revoke trigger on table "public"."blueprint_progress" from "authenticated";

revoke truncate on table "public"."blueprint_progress" from "authenticated";

revoke update on table "public"."blueprint_progress" from "authenticated";

revoke delete on table "public"."blueprint_progress" from "service_role";

revoke insert on table "public"."blueprint_progress" from "service_role";

revoke references on table "public"."blueprint_progress" from "service_role";

revoke select on table "public"."blueprint_progress" from "service_role";

revoke trigger on table "public"."blueprint_progress" from "service_role";

revoke truncate on table "public"."blueprint_progress" from "service_role";

revoke update on table "public"."blueprint_progress" from "service_role";

revoke delete on table "public"."blueprint_tasks" from "anon";

revoke insert on table "public"."blueprint_tasks" from "anon";

revoke references on table "public"."blueprint_tasks" from "anon";

revoke select on table "public"."blueprint_tasks" from "anon";

revoke trigger on table "public"."blueprint_tasks" from "anon";

revoke truncate on table "public"."blueprint_tasks" from "anon";

revoke update on table "public"."blueprint_tasks" from "anon";

revoke delete on table "public"."blueprint_tasks" from "authenticated";

revoke insert on table "public"."blueprint_tasks" from "authenticated";

revoke references on table "public"."blueprint_tasks" from "authenticated";

revoke select on table "public"."blueprint_tasks" from "authenticated";

revoke trigger on table "public"."blueprint_tasks" from "authenticated";

revoke truncate on table "public"."blueprint_tasks" from "authenticated";

revoke update on table "public"."blueprint_tasks" from "authenticated";

revoke delete on table "public"."blueprint_tasks" from "service_role";

revoke insert on table "public"."blueprint_tasks" from "service_role";

revoke references on table "public"."blueprint_tasks" from "service_role";

revoke select on table "public"."blueprint_tasks" from "service_role";

revoke trigger on table "public"."blueprint_tasks" from "service_role";

revoke truncate on table "public"."blueprint_tasks" from "service_role";

revoke update on table "public"."blueprint_tasks" from "service_role";

revoke delete on table "public"."blueprint_templates" from "anon";

revoke insert on table "public"."blueprint_templates" from "anon";

revoke references on table "public"."blueprint_templates" from "anon";

revoke select on table "public"."blueprint_templates" from "anon";

revoke trigger on table "public"."blueprint_templates" from "anon";

revoke truncate on table "public"."blueprint_templates" from "anon";

revoke update on table "public"."blueprint_templates" from "anon";

revoke delete on table "public"."blueprint_templates" from "authenticated";

revoke insert on table "public"."blueprint_templates" from "authenticated";

revoke references on table "public"."blueprint_templates" from "authenticated";

revoke select on table "public"."blueprint_templates" from "authenticated";

revoke trigger on table "public"."blueprint_templates" from "authenticated";

revoke truncate on table "public"."blueprint_templates" from "authenticated";

revoke update on table "public"."blueprint_templates" from "authenticated";

revoke delete on table "public"."blueprint_templates" from "service_role";

revoke insert on table "public"."blueprint_templates" from "service_role";

revoke references on table "public"."blueprint_templates" from "service_role";

revoke select on table "public"."blueprint_templates" from "service_role";

revoke trigger on table "public"."blueprint_templates" from "service_role";

revoke truncate on table "public"."blueprint_templates" from "service_role";

revoke update on table "public"."blueprint_templates" from "service_role";

revoke delete on table "public"."blueprints" from "anon";

revoke insert on table "public"."blueprints" from "anon";

revoke references on table "public"."blueprints" from "anon";

revoke select on table "public"."blueprints" from "anon";

revoke trigger on table "public"."blueprints" from "anon";

revoke truncate on table "public"."blueprints" from "anon";

revoke update on table "public"."blueprints" from "anon";

revoke delete on table "public"."blueprints" from "authenticated";

revoke insert on table "public"."blueprints" from "authenticated";

revoke references on table "public"."blueprints" from "authenticated";

revoke select on table "public"."blueprints" from "authenticated";

revoke trigger on table "public"."blueprints" from "authenticated";

revoke truncate on table "public"."blueprints" from "authenticated";

revoke update on table "public"."blueprints" from "authenticated";

revoke delete on table "public"."blueprints" from "service_role";

revoke insert on table "public"."blueprints" from "service_role";

revoke references on table "public"."blueprints" from "service_role";

revoke select on table "public"."blueprints" from "service_role";

revoke trigger on table "public"."blueprints" from "service_role";

revoke truncate on table "public"."blueprints" from "service_role";

revoke update on table "public"."blueprints" from "service_role";

revoke delete on table "public"."calendar_events" from "anon";

revoke insert on table "public"."calendar_events" from "anon";

revoke references on table "public"."calendar_events" from "anon";

revoke select on table "public"."calendar_events" from "anon";

revoke trigger on table "public"."calendar_events" from "anon";

revoke truncate on table "public"."calendar_events" from "anon";

revoke update on table "public"."calendar_events" from "anon";

revoke delete on table "public"."calendar_events" from "authenticated";

revoke insert on table "public"."calendar_events" from "authenticated";

revoke references on table "public"."calendar_events" from "authenticated";

revoke select on table "public"."calendar_events" from "authenticated";

revoke trigger on table "public"."calendar_events" from "authenticated";

revoke truncate on table "public"."calendar_events" from "authenticated";

revoke update on table "public"."calendar_events" from "authenticated";

revoke delete on table "public"."calendar_events" from "service_role";

revoke insert on table "public"."calendar_events" from "service_role";

revoke references on table "public"."calendar_events" from "service_role";

revoke select on table "public"."calendar_events" from "service_role";

revoke trigger on table "public"."calendar_events" from "service_role";

revoke truncate on table "public"."calendar_events" from "service_role";

revoke update on table "public"."calendar_events" from "service_role";

revoke delete on table "public"."community_event_registrations" from "anon";

revoke insert on table "public"."community_event_registrations" from "anon";

revoke references on table "public"."community_event_registrations" from "anon";

revoke select on table "public"."community_event_registrations" from "anon";

revoke trigger on table "public"."community_event_registrations" from "anon";

revoke truncate on table "public"."community_event_registrations" from "anon";

revoke update on table "public"."community_event_registrations" from "anon";

revoke delete on table "public"."community_event_registrations" from "authenticated";

revoke insert on table "public"."community_event_registrations" from "authenticated";

revoke references on table "public"."community_event_registrations" from "authenticated";

revoke select on table "public"."community_event_registrations" from "authenticated";

revoke trigger on table "public"."community_event_registrations" from "authenticated";

revoke truncate on table "public"."community_event_registrations" from "authenticated";

revoke update on table "public"."community_event_registrations" from "authenticated";

revoke delete on table "public"."community_event_registrations" from "service_role";

revoke insert on table "public"."community_event_registrations" from "service_role";

revoke references on table "public"."community_event_registrations" from "service_role";

revoke select on table "public"."community_event_registrations" from "service_role";

revoke trigger on table "public"."community_event_registrations" from "service_role";

revoke truncate on table "public"."community_event_registrations" from "service_role";

revoke update on table "public"."community_event_registrations" from "service_role";

revoke delete on table "public"."community_join_requests" from "anon";

revoke insert on table "public"."community_join_requests" from "anon";

revoke references on table "public"."community_join_requests" from "anon";

revoke select on table "public"."community_join_requests" from "anon";

revoke trigger on table "public"."community_join_requests" from "anon";

revoke truncate on table "public"."community_join_requests" from "anon";

revoke update on table "public"."community_join_requests" from "anon";

revoke delete on table "public"."community_join_requests" from "authenticated";

revoke insert on table "public"."community_join_requests" from "authenticated";

revoke references on table "public"."community_join_requests" from "authenticated";

revoke select on table "public"."community_join_requests" from "authenticated";

revoke trigger on table "public"."community_join_requests" from "authenticated";

revoke truncate on table "public"."community_join_requests" from "authenticated";

revoke update on table "public"."community_join_requests" from "authenticated";

revoke delete on table "public"."community_join_requests" from "service_role";

revoke insert on table "public"."community_join_requests" from "service_role";

revoke references on table "public"."community_join_requests" from "service_role";

revoke select on table "public"."community_join_requests" from "service_role";

revoke trigger on table "public"."community_join_requests" from "service_role";

revoke truncate on table "public"."community_join_requests" from "service_role";

revoke update on table "public"."community_join_requests" from "service_role";

revoke delete on table "public"."expert_session_bookings" from "anon";

revoke insert on table "public"."expert_session_bookings" from "anon";

revoke references on table "public"."expert_session_bookings" from "anon";

revoke select on table "public"."expert_session_bookings" from "anon";

revoke trigger on table "public"."expert_session_bookings" from "anon";

revoke truncate on table "public"."expert_session_bookings" from "anon";

revoke update on table "public"."expert_session_bookings" from "anon";

revoke delete on table "public"."expert_session_bookings" from "authenticated";

revoke insert on table "public"."expert_session_bookings" from "authenticated";

revoke references on table "public"."expert_session_bookings" from "authenticated";

revoke select on table "public"."expert_session_bookings" from "authenticated";

revoke trigger on table "public"."expert_session_bookings" from "authenticated";

revoke truncate on table "public"."expert_session_bookings" from "authenticated";

revoke update on table "public"."expert_session_bookings" from "authenticated";

revoke delete on table "public"."expert_session_bookings" from "service_role";

revoke insert on table "public"."expert_session_bookings" from "service_role";

revoke references on table "public"."expert_session_bookings" from "service_role";

revoke select on table "public"."expert_session_bookings" from "service_role";

revoke trigger on table "public"."expert_session_bookings" from "service_role";

revoke truncate on table "public"."expert_session_bookings" from "service_role";

revoke update on table "public"."expert_session_bookings" from "service_role";

revoke delete on table "public"."implementation_phases" from "anon";

revoke insert on table "public"."implementation_phases" from "anon";

revoke references on table "public"."implementation_phases" from "anon";

revoke select on table "public"."implementation_phases" from "anon";

revoke trigger on table "public"."implementation_phases" from "anon";

revoke truncate on table "public"."implementation_phases" from "anon";

revoke update on table "public"."implementation_phases" from "anon";

revoke delete on table "public"."implementation_phases" from "authenticated";

revoke insert on table "public"."implementation_phases" from "authenticated";

revoke references on table "public"."implementation_phases" from "authenticated";

revoke select on table "public"."implementation_phases" from "authenticated";

revoke trigger on table "public"."implementation_phases" from "authenticated";

revoke truncate on table "public"."implementation_phases" from "authenticated";

revoke update on table "public"."implementation_phases" from "authenticated";

revoke delete on table "public"."implementation_phases" from "service_role";

revoke insert on table "public"."implementation_phases" from "service_role";

revoke references on table "public"."implementation_phases" from "service_role";

revoke select on table "public"."implementation_phases" from "service_role";

revoke trigger on table "public"."implementation_phases" from "service_role";

revoke truncate on table "public"."implementation_phases" from "service_role";

revoke update on table "public"."implementation_phases" from "service_role";

revoke delete on table "public"."organizations" from "anon";

revoke insert on table "public"."organizations" from "anon";

revoke references on table "public"."organizations" from "anon";

revoke select on table "public"."organizations" from "anon";

revoke trigger on table "public"."organizations" from "anon";

revoke truncate on table "public"."organizations" from "anon";

revoke update on table "public"."organizations" from "anon";

revoke delete on table "public"."organizations" from "authenticated";

revoke insert on table "public"."organizations" from "authenticated";

revoke references on table "public"."organizations" from "authenticated";

revoke select on table "public"."organizations" from "authenticated";

revoke trigger on table "public"."organizations" from "authenticated";

revoke truncate on table "public"."organizations" from "authenticated";

revoke update on table "public"."organizations" from "authenticated";

revoke delete on table "public"."organizations" from "service_role";

revoke insert on table "public"."organizations" from "service_role";

revoke references on table "public"."organizations" from "service_role";

revoke select on table "public"."organizations" from "service_role";

revoke trigger on table "public"."organizations" from "service_role";

revoke truncate on table "public"."organizations" from "service_role";

revoke update on table "public"."organizations" from "service_role";

revoke delete on table "public"."recommendations_catalog" from "anon";

revoke insert on table "public"."recommendations_catalog" from "anon";

revoke references on table "public"."recommendations_catalog" from "anon";

revoke select on table "public"."recommendations_catalog" from "anon";

revoke trigger on table "public"."recommendations_catalog" from "anon";

revoke truncate on table "public"."recommendations_catalog" from "anon";

revoke update on table "public"."recommendations_catalog" from "anon";

revoke delete on table "public"."recommendations_catalog" from "authenticated";

revoke insert on table "public"."recommendations_catalog" from "authenticated";

revoke references on table "public"."recommendations_catalog" from "authenticated";

revoke select on table "public"."recommendations_catalog" from "authenticated";

revoke trigger on table "public"."recommendations_catalog" from "authenticated";

revoke truncate on table "public"."recommendations_catalog" from "authenticated";

revoke update on table "public"."recommendations_catalog" from "authenticated";

revoke delete on table "public"."recommendations_catalog" from "service_role";

revoke insert on table "public"."recommendations_catalog" from "service_role";

revoke references on table "public"."recommendations_catalog" from "service_role";

revoke select on table "public"."recommendations_catalog" from "service_role";

revoke trigger on table "public"."recommendations_catalog" from "service_role";

revoke truncate on table "public"."recommendations_catalog" from "service_role";

revoke update on table "public"."recommendations_catalog" from "service_role";

revoke delete on table "public"."roi_metrics" from "anon";

revoke insert on table "public"."roi_metrics" from "anon";

revoke references on table "public"."roi_metrics" from "anon";

revoke select on table "public"."roi_metrics" from "anon";

revoke trigger on table "public"."roi_metrics" from "anon";

revoke truncate on table "public"."roi_metrics" from "anon";

revoke update on table "public"."roi_metrics" from "anon";

revoke delete on table "public"."roi_metrics" from "authenticated";

revoke insert on table "public"."roi_metrics" from "authenticated";

revoke references on table "public"."roi_metrics" from "authenticated";

revoke select on table "public"."roi_metrics" from "authenticated";

revoke trigger on table "public"."roi_metrics" from "authenticated";

revoke truncate on table "public"."roi_metrics" from "authenticated";

revoke update on table "public"."roi_metrics" from "authenticated";

revoke delete on table "public"."roi_metrics" from "service_role";

revoke insert on table "public"."roi_metrics" from "service_role";

revoke references on table "public"."roi_metrics" from "service_role";

revoke select on table "public"."roi_metrics" from "service_role";

revoke trigger on table "public"."roi_metrics" from "service_role";

revoke truncate on table "public"."roi_metrics" from "service_role";

revoke update on table "public"."roi_metrics" from "service_role";

revoke delete on table "public"."streamlined_assessment_responses" from "anon";

revoke insert on table "public"."streamlined_assessment_responses" from "anon";

revoke references on table "public"."streamlined_assessment_responses" from "anon";

revoke select on table "public"."streamlined_assessment_responses" from "anon";

revoke trigger on table "public"."streamlined_assessment_responses" from "anon";

revoke truncate on table "public"."streamlined_assessment_responses" from "anon";

revoke update on table "public"."streamlined_assessment_responses" from "anon";

revoke delete on table "public"."streamlined_assessment_responses" from "authenticated";

revoke insert on table "public"."streamlined_assessment_responses" from "authenticated";

revoke references on table "public"."streamlined_assessment_responses" from "authenticated";

revoke select on table "public"."streamlined_assessment_responses" from "authenticated";

revoke trigger on table "public"."streamlined_assessment_responses" from "authenticated";

revoke truncate on table "public"."streamlined_assessment_responses" from "authenticated";

revoke update on table "public"."streamlined_assessment_responses" from "authenticated";

revoke delete on table "public"."streamlined_assessment_responses" from "service_role";

revoke insert on table "public"."streamlined_assessment_responses" from "service_role";

revoke references on table "public"."streamlined_assessment_responses" from "service_role";

revoke select on table "public"."streamlined_assessment_responses" from "service_role";

revoke trigger on table "public"."streamlined_assessment_responses" from "service_role";

revoke truncate on table "public"."streamlined_assessment_responses" from "service_role";

revoke update on table "public"."streamlined_assessment_responses" from "service_role";

revoke delete on table "public"."tasks" from "anon";

revoke insert on table "public"."tasks" from "anon";

revoke references on table "public"."tasks" from "anon";

revoke select on table "public"."tasks" from "anon";

revoke trigger on table "public"."tasks" from "anon";

revoke truncate on table "public"."tasks" from "anon";

revoke update on table "public"."tasks" from "anon";

revoke delete on table "public"."tasks" from "authenticated";

revoke insert on table "public"."tasks" from "authenticated";

revoke references on table "public"."tasks" from "authenticated";

revoke select on table "public"."tasks" from "authenticated";

revoke trigger on table "public"."tasks" from "authenticated";

revoke truncate on table "public"."tasks" from "authenticated";

revoke update on table "public"."tasks" from "authenticated";

revoke delete on table "public"."tasks" from "service_role";

revoke insert on table "public"."tasks" from "service_role";

revoke references on table "public"."tasks" from "service_role";

revoke select on table "public"."tasks" from "service_role";

revoke trigger on table "public"."tasks" from "service_role";

revoke truncate on table "public"."tasks" from "service_role";

revoke update on table "public"."tasks" from "service_role";

revoke delete on table "public"."team_members" from "anon";

revoke insert on table "public"."team_members" from "anon";

revoke references on table "public"."team_members" from "anon";

revoke select on table "public"."team_members" from "anon";

revoke trigger on table "public"."team_members" from "anon";

revoke truncate on table "public"."team_members" from "anon";

revoke update on table "public"."team_members" from "anon";

revoke delete on table "public"."team_members" from "authenticated";

revoke insert on table "public"."team_members" from "authenticated";

revoke references on table "public"."team_members" from "authenticated";

revoke select on table "public"."team_members" from "authenticated";

revoke trigger on table "public"."team_members" from "authenticated";

revoke truncate on table "public"."team_members" from "authenticated";

revoke update on table "public"."team_members" from "authenticated";

revoke delete on table "public"."team_members" from "service_role";

revoke insert on table "public"."team_members" from "service_role";

revoke references on table "public"."team_members" from "service_role";

revoke select on table "public"."team_members" from "service_role";

revoke trigger on table "public"."team_members" from "service_role";

revoke truncate on table "public"."team_members" from "service_role";

revoke update on table "public"."team_members" from "service_role";

revoke delete on table "public"."user_payments" from "anon";

revoke insert on table "public"."user_payments" from "anon";

revoke references on table "public"."user_payments" from "anon";

revoke select on table "public"."user_payments" from "anon";

revoke trigger on table "public"."user_payments" from "anon";

revoke truncate on table "public"."user_payments" from "anon";

revoke update on table "public"."user_payments" from "anon";

revoke delete on table "public"."user_payments" from "authenticated";

revoke insert on table "public"."user_payments" from "authenticated";

revoke references on table "public"."user_payments" from "authenticated";

revoke select on table "public"."user_payments" from "authenticated";

revoke trigger on table "public"."user_payments" from "authenticated";

revoke truncate on table "public"."user_payments" from "authenticated";

revoke update on table "public"."user_payments" from "authenticated";

revoke delete on table "public"."user_payments" from "service_role";

revoke insert on table "public"."user_payments" from "service_role";

revoke references on table "public"."user_payments" from "service_role";

revoke select on table "public"."user_payments" from "service_role";

revoke trigger on table "public"."user_payments" from "service_role";

revoke truncate on table "public"."user_payments" from "service_role";

revoke update on table "public"."user_payments" from "service_role";

alter table "public"."user_payments" drop constraint "user_payments_role_check";

create table "public"."ai_policy_templates" (
    "id" uuid not null default gen_random_uuid(),
    "policy_type" text not null,
    "title" text not null,
    "description" text,
    "template_content" text not null,
    "stakeholders" text[] default '{}'::text[],
    "implementation_steps" text[] default '{}'::text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."ai_policy_templates" enable row level security;

create table "public"."ai_readiness_assessments" (
    "id" text not null default (gen_random_uuid())::text,
    "user_id" uuid,
    "institution_name" text,
    "institution_type" text,
    "institution_size" text,
    "contact_email" text,
    "contact_name" text,
    "tier" text,
    "status" text default 'PENDING'::text,
    "responses" jsonb default '{}'::jsonb,
    "ai_readiness_score" numeric(3,2),
    "domain_scores" jsonb default '{}'::jsonb,
    "maturity_profile" jsonb default '{}'::jsonb,
    "policy_recommendations" jsonb default '[]'::jsonb,
    "custom_policies_generated" jsonb default '[]'::jsonb,
    "implementation_frameworks" jsonb default '[]'::jsonb,
    "ai_analysis" jsonb default '{}'::jsonb,
    "is_team_assessment" boolean default false,
    "team_members" jsonb default '[]'::jsonb,
    "team_analysis" jsonb default '{}'::jsonb,
    "open_ended_responses" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "submitted_at" timestamp with time zone,
    "analyzed_at" timestamp with time zone,
    "pdf_report_generated" boolean default false,
    "pdf_report_url" text
);


alter table "public"."ai_readiness_assessments" enable row level security;

create table "public"."ai_readiness_payments" (
    "id" uuid not null default gen_random_uuid(),
    "assessment_id" text,
    "tier" text not null,
    "amount" numeric(10,2) not null,
    "currency" text default 'USD'::text,
    "payment_status" text default 'pending'::text,
    "stripe_session_id" text,
    "stripe_payment_intent_id" text,
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."ai_readiness_payments" enable row level security;

create table "public"."ai_readiness_team_members" (
    "id" uuid not null default gen_random_uuid(),
    "team_id" uuid,
    "assessment_id" text,
    "user_id" uuid,
    "member_name" text,
    "member_email" text,
    "department" text,
    "role" text,
    "responses" jsonb default '{}'::jsonb,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."ai_readiness_team_members" enable row level security;

create table "public"."ai_readiness_teams" (
    "id" uuid not null default gen_random_uuid(),
    "assessment_id" text,
    "team_name" text not null,
    "description" text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."ai_readiness_teams" enable row level security;

create table "public"."approval_approvers" (
    "id" uuid not null default gen_random_uuid(),
    "approval_id" uuid not null,
    "user_id" uuid not null,
    "user_name" character varying(255),
    "user_email" character varying(255),
    "role" character varying(100) not null,
    "is_required" boolean not null default true,
    "has_approved" boolean not null default false,
    "approved_at" timestamp with time zone,
    "decision" character varying(20),
    "comment" text,
    "e_signature_signed" boolean default false,
    "e_signature_signed_at" timestamp with time zone,
    "e_signature_ip_address" inet,
    "e_signature_user_agent" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."approval_approvers" enable row level security;

create table "public"."approval_audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "approval_id" uuid not null,
    "user_id" uuid not null,
    "action" character varying(50) not null,
    "details" jsonb not null default '{}'::jsonb,
    "timestamp" timestamp with time zone default now(),
    "ip_address" inet,
    "user_agent" text,
    "session_id" character varying(255)
);


alter table "public"."approval_audit_logs" enable row level security;

create table "public"."approval_comments" (
    "id" uuid not null default gen_random_uuid(),
    "approval_id" uuid not null,
    "user_id" uuid not null,
    "user_name" character varying(255),
    "user_email" character varying(255),
    "comment" text not null,
    "timestamp" timestamp with time zone default now(),
    "is_internal" boolean default false,
    "attachments" jsonb default '[]'::jsonb
);


alter table "public"."approval_comments" enable row level security;

create table "public"."approval_events" (
    "id" uuid not null default gen_random_uuid(),
    "approval_id" uuid not null,
    "who" uuid not null,
    "who_name" character varying(255),
    "who_email" character varying(255),
    "action" character varying(50) not null,
    "comment" text,
    "timestamp" timestamp with time zone default now(),
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."approval_events" enable row level security;

create table "public"."approval_notifications" (
    "id" uuid not null default gen_random_uuid(),
    "type" character varying(50) not null,
    "approval_id" uuid not null,
    "recipient_id" uuid not null,
    "title" character varying(255) not null,
    "message" text not null,
    "sent" boolean default false,
    "sent_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "action_url" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."approval_notifications" enable row level security;

create table "public"."approvals" (
    "id" uuid not null default gen_random_uuid(),
    "subject_type" character varying(20) not null,
    "subject_id" character varying(255) not null,
    "subject_title" text,
    "subject_version" character varying(50),
    "status" character varying(20) not null default 'pending'::character varying,
    "created_by" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "due_date" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."approvals" enable row level security;

create table "public"."approved_tool_catalog" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vendor_id" uuid not null,
    "tool_name" character varying(255) not null,
    "category" character varying(100) not null,
    "description" text,
    "usage_guidelines" text,
    "restrictions" jsonb default '[]'::jsonb,
    "tags" jsonb default '[]'::jsonb,
    "approved_by" character varying(255) not null,
    "approved_at" timestamp with time zone default now(),
    "valid_until" timestamp with time zone,
    "usage_count" integer default 0,
    "last_used_at" timestamp with time zone,
    "is_active" boolean default true,
    "review_frequency" character varying(50) default 'annually'::character varying,
    "next_review_date" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."approved_tool_catalog" enable row level security;

create table "public"."approved_tools_catalog" (
    "id" uuid not null default gen_random_uuid(),
    "tool_id" uuid,
    "decision_brief_id" uuid,
    "approval_date" timestamp with time zone not null,
    "approved_by" text not null,
    "approval_type" text default 'full'::text,
    "expiration_date" timestamp with time zone,
    "auto_renewal" boolean default false,
    "approved_roles" text[] not null default '{}'::text[],
    "approved_subjects" text[] default '{}'::text[],
    "approved_grade_levels" text[] default '{}'::text[],
    "approved_use_cases" text[] default '{}'::text[],
    "usage_restrictions" text[] default '{}'::text[],
    "deployment_scope" text default 'district_wide'::text,
    "max_concurrent_users" integer,
    "seat_allocation" jsonb default '{}'::jsonb,
    "organizational_units" text[] default '{}'::text[],
    "compliance_status" text default 'Compliant'::text,
    "last_compliance_check" timestamp with time zone,
    "next_compliance_review" timestamp with time zone,
    "compliance_notes" text,
    "active_users_count" integer default 0,
    "total_sessions" integer default 0,
    "last_activity_date" timestamp with time zone,
    "usage_trends" jsonb default '{}'::jsonb,
    "user_feedback_score" numeric(3,2),
    "incidents_count" integer default 0,
    "last_incident_date" timestamp with time zone,
    "incident_severity_history" jsonb default '[]'::jsonb,
    "training_completion_rate" numeric(5,2) default 0,
    "support_tickets_count" integer default 0,
    "documentation_rating" numeric(3,2),
    "license_type" text,
    "contract_start_date" timestamp with time zone,
    "contract_end_date" timestamp with time zone,
    "renewal_date" timestamp with time zone,
    "contract_value" numeric(12,2),
    "payment_schedule" text,
    "status" text default 'active'::text,
    "status_reason" text,
    "last_updated_by" text,
    "change_log" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."approved_tools_catalog" enable row level security;

create table "public"."artifacts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "org_id" uuid not null,
    "assessment_id" uuid,
    "type" character varying(20) not null,
    "format" character varying(10) not null,
    "storage_key" text not null,
    "version" integer default 1,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."artifacts" enable row level security;

create table "public"."assessment_metrics" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "metric_name" character varying(50) not null,
    "metric_value" bigint not null default 0,
    "labels" jsonb default '{}'::jsonb,
    "recorded_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."assessment_metrics" enable row level security;

create table "public"."assessments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "org_id" uuid not null,
    "scores" jsonb not null default '{"AIBS": 0, "AICS": 0, "AIMS": 0, "AIPS": 0, "AIRS": 0, "AIRIX": 0}'::jsonb,
    "findings" jsonb default '[]'::jsonb,
    "recommendations" jsonb default '[]'::jsonb,
    "evidence_doc_ids" uuid[] default '{}'::uuid[],
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."assessments" enable row level security;

create table "public"."auth_password_setup_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "email" text not null,
    "token" text not null,
    "expires_at" timestamp with time zone not null,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."auth_password_setup_tokens" enable row level security;

create table "public"."compliance_evidence" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "tracking_id" uuid,
    "title" character varying(255) not null,
    "description" text,
    "evidence_type" character varying(50) not null,
    "file_url" text,
    "document_id" uuid,
    "external_reference" text,
    "uploaded_by" uuid,
    "review_status" character varying(20) default 'pending'::character varying,
    "expires_at" date,
    "is_current" boolean default true,
    "created_at" timestamp with time zone default now(),
    "reviewed_at" timestamp with time zone,
    "reviewed_by" uuid
);


alter table "public"."compliance_evidence" enable row level security;

create table "public"."compliance_findings" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "tracking_id" uuid,
    "title" character varying(255) not null,
    "description" text not null,
    "finding_type" character varying(50) not null,
    "severity" character varying(20) not null,
    "remediation" text,
    "status" character varying(20) default 'open'::character varying,
    "identified_by" uuid,
    "assigned_to" uuid,
    "target_resolution_date" date,
    "identified_at" timestamp with time zone default now(),
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid
);


alter table "public"."compliance_findings" enable row level security;

create table "public"."compliance_frameworks" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" character varying(255) not null,
    "audience" character varying(20) not null,
    "description" text,
    "regulatory_body" character varying(255),
    "is_federal" boolean default true,
    "is_active" boolean default true,
    "review_cycle_months" integer default 12,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."compliance_frameworks" enable row level security;

create table "public"."compliance_monitoring" (
    "id" uuid not null default gen_random_uuid(),
    "tool_id" uuid,
    "monitoring_date" timestamp with time zone default now(),
    "monitoring_type" text,
    "monitoring_period_start" timestamp with time zone,
    "monitoring_period_end" timestamp with time zone,
    "coppa_status" text default 'compliant'::text,
    "coppa_findings" jsonb default '{}'::jsonb,
    "ferpa_status" text default 'compliant'::text,
    "ferpa_findings" jsonb default '{}'::jsonb,
    "ppra_status" text default 'compliant'::text,
    "ppra_findings" jsonb default '{}'::jsonb,
    "usage_within_approved_scope" boolean default true,
    "unauthorized_usage_incidents" integer default 0,
    "data_handling_compliance" boolean default true,
    "consent_management_compliance" boolean default true,
    "security_controls_effective" boolean default true,
    "data_encryption_verified" boolean default true,
    "access_controls_verified" boolean default true,
    "vulnerability_scan_results" jsonb default '{}'::jsonb,
    "privacy_policy_current" boolean default true,
    "data_minimization_verified" boolean default true,
    "retention_policy_followed" boolean default true,
    "user_rights_requests_handled" integer default 0,
    "compliance_score" integer,
    "issues_identified" text[] default '{}'::text[],
    "corrective_actions_required" text[] default '{}'::text[],
    "recommendations" text[] default '{}'::text[],
    "follow_up_required" boolean default false,
    "follow_up_date" timestamp with time zone,
    "reviewed_by" text,
    "review_date" timestamp with time zone,
    "approved_by" text,
    "approval_date" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."compliance_monitoring" enable row level security;

create table "public"."compliance_tracking" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "org_id" uuid not null,
    "control_id" uuid,
    "assigned_to" uuid,
    "department" character varying(100),
    "status" character varying(50) not null default 'pending'::character varying,
    "priority" character varying(20) not null default 'medium'::character varying,
    "risk_level" character varying(20) default 'medium'::character varying,
    "due_date" date not null,
    "completion_percentage" integer default 0,
    "notes" text,
    "last_action" text,
    "next_action" text,
    "dependencies" uuid[] default '{}'::uuid[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "updated_by" uuid
);


alter table "public"."compliance_tracking" enable row level security;

create table "public"."decision_briefs" (
    "id" uuid not null default gen_random_uuid(),
    "risk_assessment_id" uuid,
    "intake_form_id" uuid,
    "brief_title" text not null,
    "brief_date" timestamp with time zone default now(),
    "prepared_by" text not null,
    "review_board" text default 'Technology Committee'::text,
    "meeting_date" timestamp with time zone,
    "executive_summary" text not null,
    "recommendation" text not null,
    "key_benefits" text[] default '{}'::text[],
    "primary_concerns" text[] default '{}'::text[],
    "risk_level_summary" text,
    "critical_risks" text[] default '{}'::text[],
    "acceptable_risks" text[] default '{}'::text[],
    "mitigation_plan" text,
    "compliance_summary" jsonb default '{}'::jsonb,
    "regulatory_considerations" text,
    "legal_review_required" boolean default false,
    "legal_review_status" text,
    "implementation_timeline" text,
    "pilot_program_recommended" boolean default false,
    "pilot_scope" text,
    "training_plan" text,
    "rollout_phases" jsonb default '[]'::jsonb,
    "monitoring_plan" text,
    "success_metrics" text[] default '{}'::text[],
    "review_schedule" text,
    "escalation_procedures" text,
    "cost_benefit_analysis" text,
    "budget_impact" numeric(12,2),
    "alternative_costs" jsonb default '{}'::jsonb,
    "roi_projection" text,
    "board_decision" text,
    "decision_date" timestamp with time zone,
    "decision_rationale" text,
    "voting_record" jsonb default '{}'::jsonb,
    "dissenting_opinions" text,
    "implementation_status" text default 'pending'::text,
    "implementation_start_date" timestamp with time zone,
    "go_live_date" timestamp with time zone,
    "actual_vs_planned_variance" text,
    "document_version" integer default 1,
    "document_status" text default 'draft'::text,
    "attachments" jsonb default '[]'::jsonb,
    "related_documents" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."decision_briefs" enable row level security;

create table "public"."document_analyses" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "file_name" text not null,
    "document_type" text,
    "key_themes" text[] default '{}'::text[],
    "ai_readiness_indicators" text[] default '{}'::text[],
    "alignment_opportunities" text[] default '{}'::text[],
    "gaps" text[] default '{}'::text[],
    "recommendations" text[] default '{}'::text[],
    "confidence_score" integer default 0,
    "analysis_data" jsonb,
    "analyzed_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
);


alter table "public"."document_analyses" enable row level security;

create table "public"."document_sections" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "document_id" uuid not null,
    "section_type" character varying(20) not null,
    "heading" text,
    "content" text not null,
    "page_number" integer,
    "position_start" integer,
    "position_end" integer,
    "confidence" numeric(3,2) default 0.0,
    "framework_mappings" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."document_sections" enable row level security;

create table "public"."documents" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "org_id" uuid not null,
    "name" character varying(255) not null,
    "mime_type" character varying(100) not null,
    "size" bigint not null,
    "storage_key" text not null,
    "pii_flags" jsonb default '[]'::jsonb,
    "ocr_text" text,
    "sections" jsonb default '[]'::jsonb,
    "framework_tags" jsonb default '{}'::jsonb,
    "status" character varying(20) not null default 'uploaded'::character varying,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "processed_at" timestamp with time zone
);


alter table "public"."documents" enable row level security;

create table "public"."enterprise_algorithm_changelog" (
    "version" text not null,
    "released_at" timestamp with time zone not null default now(),
    "summary" text not null,
    "details" jsonb,
    "breaking_changes" boolean default false
);


alter table "public"."enterprise_algorithm_changelog" enable row level security;

create table "public"."enterprise_algorithm_results" (
    "id" uuid not null default gen_random_uuid(),
    "assessment_id" text not null,
    "user_id" uuid,
    "algorithm_version" text not null,
    "computed_at" timestamp with time zone not null default now(),
    "dsch" jsonb not null,
    "crf" jsonb not null,
    "lei" jsonb not null,
    "oci" jsonb not null,
    "hoci" jsonb not null,
    "raw" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."enterprise_algorithm_results" enable row level security;

create table "public"."framework_changes" (
    "id" uuid not null default gen_random_uuid(),
    "framework_id" character varying(100) not null,
    "version" character varying(50) not null,
    "change_type" character varying(20) not null,
    "title" character varying(255) not null,
    "description" text,
    "affected_sections" text[] default '{}'::text[],
    "impact_level" character varying(20) default 'medium'::character varying,
    "effective_date" timestamp with time zone,
    "requires_redline" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."framework_changes" enable row level security;

create table "public"."framework_controls" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "framework_id" uuid,
    "code" character varying(50) not null,
    "title" character varying(500) not null,
    "description" text,
    "complexity_weight" numeric(3,2) default 1.0,
    "is_required" boolean default true,
    "impact_areas" text[] default '{}'::text[],
    "typical_evidence" text[] default '{}'::text[],
    "created_at" timestamp with time zone default now()
);


alter table "public"."framework_controls" enable row level security;

create table "public"."framework_metadata" (
    "id" character varying(100) not null,
    "name" character varying(255) not null,
    "version" character varying(50) not null,
    "last_updated" timestamp with time zone not null,
    "source_url" text,
    "checksum" character varying(64),
    "status" character varying(20) default 'active'::character varying,
    "changelog" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."framework_metadata" enable row level security;

create table "public"."framework_monitoring_config" (
    "id" uuid not null default gen_random_uuid(),
    "framework_id" character varying(100) not null,
    "check_interval" integer default 60,
    "enabled" boolean default true,
    "auto_generate_redlines" boolean default true,
    "notify_approvers" boolean default true,
    "impact_threshold" character varying(20) default 'medium'::character varying,
    "approvers" text[] default '{}'::text[],
    "last_checked" timestamp with time zone,
    "next_check" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."framework_monitoring_config" enable row level security;

create table "public"."framework_scores" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "assessment_id" uuid not null,
    "framework" character varying(10) not null,
    "category" character varying(50) not null,
    "control_id" character varying(20) not null,
    "score" numeric(3,2) not null,
    "evidence_doc_ids" uuid[] default '{}'::uuid[],
    "rationale" text,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."framework_scores" enable row level security;

create table "public"."gap_analysis_results" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "overall_score" numeric(5,2),
    "maturity_level" text,
    "govern_score" numeric(5,2),
    "govern_gaps" text[],
    "govern_strengths" text[],
    "govern_recommendations" text[],
    "map_score" numeric(5,2),
    "map_gaps" text[],
    "map_strengths" text[],
    "map_recommendations" text[],
    "measure_score" numeric(5,2),
    "measure_gaps" text[],
    "measure_strengths" text[],
    "measure_recommendations" text[],
    "manage_score" numeric(5,2),
    "manage_gaps" text[],
    "manage_strengths" text[],
    "manage_recommendations" text[],
    "priority_actions" text[],
    "quick_wins" text[],
    "analysis_date" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."gap_analysis_results" enable row level security;

create table "public"."implementation_roadmaps" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "roadmap_type" text,
    "goals" text[],
    "action_items" text[],
    "milestones" text[],
    "success_metrics" text[],
    "start_date" date,
    "end_date" date,
    "status" text default 'not_started'::text,
    "completion_percentage" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."implementation_roadmaps" enable row level security;

create table "public"."institution_memberships" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "institution_id" uuid not null,
    "user_id" uuid not null,
    "role" text not null default 'member'::text,
    "active" boolean not null default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."institution_memberships" enable row level security;

create table "public"."institutions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "slug" text not null,
    "name" text not null,
    "headcount" integer,
    "budget" numeric(15,2),
    "depth_mode" text,
    "owner_user_id" uuid,
    "created_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone,
    "org_type" text
);


alter table "public"."institutions" enable row level security;

create table "public"."pii_detections" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "document_id" uuid not null,
    "pii_type" character varying(20) not null,
    "detected_text" text not null,
    "redacted_text" text not null,
    "position_start" integer not null,
    "position_end" integer not null,
    "confidence" numeric(3,2) not null,
    "detected_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."pii_detections" enable row level security;

create table "public"."policy_control_mappings" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "control_id" uuid,
    "policy_title" character varying(500) not null,
    "policy_url" text,
    "mapping_strength" character varying(20) default 'full'::character varying,
    "coverage_percentage" integer default 100,
    "mapped_by" uuid,
    "mapped_at" timestamp with time zone default now(),
    "last_verified" timestamp with time zone default now()
);


alter table "public"."policy_control_mappings" enable row level security;

create table "public"."policy_redline_packs" (
    "id" uuid not null default gen_random_uuid(),
    "policy_id" character varying(100) not null,
    "original_version" character varying(50) not null,
    "updated_version" character varying(50) not null,
    "framework_change_id" uuid not null,
    "changes" jsonb not null default '[]'::jsonb,
    "approvers" text[] default '{}'::text[],
    "status" character varying(30) default 'draft'::character varying,
    "generated_by" character varying(20) default 'system'::character varying,
    "created_at" timestamp with time zone default now(),
    "sent_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "rejection_reason" text
);


alter table "public"."policy_redline_packs" enable row level security;

create table "public"."policy_update_job_logs" (
    "id" uuid not null default gen_random_uuid(),
    "job_id" character varying(100) not null,
    "success" boolean not null,
    "frameworks_checked" integer default 0,
    "changes_detected" integer default 0,
    "redlines_generated" integer default 0,
    "notifications_sent" integer default 0,
    "errors" text[] default '{}'::text[],
    "processing_time" integer default 0,
    "executed_at" timestamp with time zone default now()
);


alter table "public"."policy_update_job_logs" enable row level security;

create table "public"."policy_update_notifications" (
    "id" uuid not null default gen_random_uuid(),
    "type" character varying(30) not null,
    "recipient_id" character varying(100) not null,
    "recipient_email" character varying(255) not null,
    "policy_id" character varying(100),
    "redline_pack_id" uuid,
    "framework_change_id" uuid,
    "title" character varying(255) not null,
    "message" text not null,
    "action_url" text,
    "sent" boolean default false,
    "sent_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."policy_update_notifications" enable row level security;

create table "public"."risk_assessments" (
    "id" uuid not null default gen_random_uuid(),
    "intake_form_id" uuid,
    "tool_id" uuid,
    "assessment_type" text default 'initial'::text,
    "assessment_date" timestamp with time zone default now(),
    "assessor_name" text,
    "assessor_role" text,
    "overall_risk_score" integer,
    "risk_level" text,
    "privacy_risk_score" integer,
    "security_risk_score" integer,
    "compliance_risk_score" integer,
    "pedagogical_risk_score" integer,
    "financial_risk_score" integer,
    "operational_risk_score" integer,
    "risk_factors" jsonb default '{}'::jsonb,
    "mitigation_measures" jsonb default '{}'::jsonb,
    "residual_risks" jsonb default '{}'::jsonb,
    "coppa_assessment" jsonb default '{}'::jsonb,
    "ferpa_assessment" jsonb default '{}'::jsonb,
    "ppra_assessment" jsonb default '{}'::jsonb,
    "state_law_assessment" jsonb default '{}'::jsonb,
    "accessibility_assessment" jsonb default '{}'::jsonb,
    "data_encryption_status" text,
    "access_controls_rating" text,
    "vulnerability_assessment" jsonb default '{}'::jsonb,
    "penetration_test_results" jsonb default '{}'::jsonb,
    "security_certifications" text[] default '{}'::text[],
    "privacy_policy_review" jsonb default '{}'::jsonb,
    "data_minimization_score" integer,
    "consent_mechanism_rating" text,
    "data_subject_rights_support" text,
    "cross_border_transfer_assessment" jsonb default '{}'::jsonb,
    "approval_recommendation" text,
    "recommended_restrictions" text[] default '{}'::text[],
    "monitoring_requirements" text[] default '{}'::text[],
    "training_requirements" text[] default '{}'::text[],
    "review_schedule" text,
    "reviewed_by" text,
    "review_date" timestamp with time zone,
    "review_notes" text,
    "approved_by" text,
    "approval_date" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."risk_assessments" enable row level security;

create table "public"."teams" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "org_id" uuid not null,
    "name" character varying(255) not null,
    "audience" character varying(20) not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."teams" enable row level security;

create table "public"."uploaded_documents" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "document_type" text,
    "file_name" text not null,
    "file_path" text,
    "file_size" integer,
    "file_url" text,
    "mime_type" text,
    "processing_status" text default 'pending'::text,
    "processed_at" timestamp with time zone,
    "analysis_result" jsonb,
    "upload_date" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."uploaded_documents" enable row level security;

create table "public"."usage_analytics" (
    "id" uuid not null default gen_random_uuid(),
    "tool_id" uuid,
    "analytics_date" date not null,
    "period_type" text default 'daily'::text,
    "active_users" integer default 0,
    "new_users" integer default 0,
    "sessions_count" integer default 0,
    "total_session_duration" integer default 0,
    "average_session_duration" numeric(8,2) default 0,
    "teacher_users" integer default 0,
    "student_users" integer default 0,
    "admin_users" integer default 0,
    "parent_users" integer default 0,
    "usage_by_grade" jsonb default '{}'::jsonb,
    "usage_by_subject" jsonb default '{}'::jsonb,
    "usage_by_department" jsonb default '{}'::jsonb,
    "features_used" jsonb default '{}'::jsonb,
    "most_popular_features" text[] default '{}'::text[],
    "system_uptime" numeric(5,2) default 100,
    "response_time_avg" numeric(8,2),
    "error_rate" numeric(5,4) default 0,
    "user_rating" numeric(3,2),
    "feedback_count" integer default 0,
    "support_tickets" integer default 0,
    "content_created_count" integer default 0,
    "data_processed_volume" numeric(12,2),
    "storage_used" numeric(12,2),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."usage_analytics" enable row level security;

create table "public"."user_activity_log" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "activity_type" text not null,
    "activity_data" jsonb,
    "ip_address" text,
    "user_agent" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_activity_log" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "full_name" text,
    "email" text not null,
    "phone" text,
    "job_title" text,
    "department" text,
    "institution_id" uuid,
    "institution_name" text,
    "institution_type" text,
    "institution_size" text,
    "student_count" integer,
    "faculty_count" integer,
    "staff_count" integer,
    "annual_budget" numeric(15,2),
    "city" text,
    "state" text,
    "country" text default 'US'::text,
    "timezone" text default 'America/New_York'::text,
    "preferred_mode" text default 'quick'::text,
    "assessment_context" jsonb default '{}'::jsonb,
    "onboarding_completed" boolean default false,
    "onboarding_step" integer default 0,
    "onboarding_data" jsonb default '{}'::jsonb,
    "subscription_tier" text,
    "subscription_status" text default 'inactive'::text,
    "trial_ends_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "last_login_at" timestamp with time zone,
    "preferences" jsonb default '{}'::jsonb,
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."user_profiles" enable row level security;

create table "public"."vendor_assessments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vendor_id" uuid not null,
    "section" character varying(50) not null,
    "question_id" character varying(100) not null,
    "response" jsonb not null,
    "risk_weight" integer default 0,
    "compliance_flags" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."vendor_assessments" enable row level security;

create table "public"."vendor_audit_logs" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vendor_id" uuid not null,
    "event_type" character varying(50) not null,
    "event_description" text not null,
    "user_id" character varying(255) not null,
    "user_email" character varying(255),
    "ip_address" inet,
    "user_agent" text,
    "session_id" character varying(255),
    "before_state" jsonb,
    "after_state" jsonb,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."vendor_audit_logs" enable row level security;

create table "public"."vendor_control_dependencies" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "control_id" uuid,
    "vendor_name" character varying(255) not null,
    "dependency_type" character varying(50) not null,
    "risk_impact" character varying(20) default 'medium'::character varying,
    "notes" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."vendor_control_dependencies" enable row level security;

create table "public"."vendor_data_flows" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vendor_id" uuid not null,
    "flow_type" character varying(20) not null,
    "data_types" jsonb default '[]'::jsonb,
    "frequency" character varying(20),
    "volume" character varying(20),
    "encryption_enabled" boolean default false,
    "retention_period" character varying(100),
    "created_at" timestamp with time zone default now()
);


alter table "public"."vendor_data_flows" enable row level security;

create table "public"."vendor_decision_briefs" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vendor_id" uuid not null,
    "brief_data" jsonb not null,
    "pdf_url" text,
    "generated_by" character varying(255) not null,
    "generated_at" timestamp with time zone default now(),
    "recommendation" character varying(20) not null,
    "risk_summary" jsonb default '{}'::jsonb,
    "mitigation_summary" jsonb default '[]'::jsonb,
    "approval_requirements" jsonb default '[]'::jsonb
);


alter table "public"."vendor_decision_briefs" enable row level security;

create table "public"."vendor_intake_forms" (
    "id" uuid not null default gen_random_uuid(),
    "assessment_id" uuid,
    "institution_id" uuid,
    "submitted_by" text not null,
    "submitter_email" text,
    "submitter_role" text,
    "requesting_department" text,
    "submission_date" timestamp with time zone default now(),
    "priority_level" text default 'normal'::text,
    "tool_name" text not null,
    "vendor_name" text not null,
    "tool_description" text,
    "tool_url" text,
    "requested_use_case" text,
    "educational_objectives" text[],
    "target_users" text[] default '{}'::text[],
    "estimated_user_count" integer,
    "min_age" integer default 13,
    "max_age" integer default 18,
    "grade_levels" text[] default '{}'::text[],
    "subject_areas" text[] default '{}'::text[],
    "usage_frequency" text,
    "concurrent_users_expected" integer,
    "hosting_location" text default 'United States'::text,
    "data_center_location" text,
    "cloud_provider" text,
    "model_provider" text,
    "api_integrations" text[] default '{}'::text[],
    "authentication_method" text,
    "single_sign_on_support" boolean default false,
    "data_collected" text[] default '{}'::text[],
    "pii_collected" boolean default false,
    "data_sharing" boolean default false,
    "data_sharing_partners" text[] default '{}'::text[],
    "data_retention_period" text default '1 year'::text,
    "data_deletion_policy" text,
    "training_on_user_data" boolean default false,
    "opt_out_available" boolean default false,
    "data_portability" boolean default false,
    "age_gate_implemented" boolean default false,
    "parental_consent_required" boolean default false,
    "coppa_compliant" boolean default false,
    "ferpa_compliant" boolean default false,
    "ppra_compliant" boolean default false,
    "gdpr_compliant" boolean default false,
    "accessibility_compliant" boolean default false,
    "content_filtering" boolean default false,
    "moderation_features" text[] default '{}'::text[],
    "pricing_model" text,
    "estimated_annual_cost" numeric(12,2) default 0,
    "contract_length" text default '1 year'::text,
    "trial_available" boolean default false,
    "trial_duration_days" integer default 0,
    "pilot_program_requested" boolean default false,
    "assigned_reviewer" text,
    "review_status" text default 'submitted'::text,
    "review_priority" text default 'normal'::text,
    "expected_completion_date" timestamp with time zone,
    "business_justification" text,
    "alternatives_considered" text[],
    "stakeholder_input" text,
    "special_requirements" text,
    "attachments" jsonb default '[]'::jsonb,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."vendor_intake_forms" enable row level security;

create table "public"."vendor_intakes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "status" character varying(20) not null default 'pending'::character varying,
    "vendor_name" character varying(255) not null,
    "vendor_url" text,
    "vendor_description" text,
    "vendor_category" character varying(100),
    "contact_email" character varying(255),
    "contact_name" character varying(255),
    "business_justification" text,
    "assessment_data" jsonb not null default '{}'::jsonb,
    "risk_score" integer default 0,
    "risk_level" character varying(20) default 'low'::character varying,
    "risk_flags" jsonb default '[]'::jsonb,
    "decision_outcome" character varying(20),
    "decision_reason" text,
    "decision_conditions" jsonb default '[]'::jsonb,
    "decision_approver" character varying(255),
    "decision_approved_at" timestamp with time zone,
    "decision_valid_until" timestamp with time zone,
    "created_by" character varying(255) not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "reviewed_by" character varying(255),
    "reviewed_at" timestamp with time zone,
    "requested_urgency" character varying(20) default 'medium'::character varying,
    "expected_launch_date" timestamp with time zone,
    "request_notes" text
);


alter table "public"."vendor_intakes" enable row level security;

create table "public"."vendor_mitigations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vendor_id" uuid not null,
    "risk_flag" character varying(20) not null,
    "title" character varying(255) not null,
    "description" text not null,
    "mitigation_type" character varying(20) not null,
    "status" character varying(20) default 'pending'::character varying,
    "assignee" character varying(255),
    "due_date" timestamp with time zone,
    "evidence" text,
    "notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."vendor_mitigations" enable row level security;

create table "public"."vendor_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "vendor_name" text not null,
    "website_url" text,
    "headquarters_location" text,
    "business_model" text,
    "size_category" text,
    "industry_focus" text[],
    "established_year" integer,
    "privacy_contact_email" text,
    "security_contact_email" text,
    "support_email" text,
    "data_protection_officer" text,
    "privacy_policy_url" text,
    "terms_of_service_url" text,
    "security_documentation_url" text,
    "certification_status" jsonb default '{}'::jsonb,
    "compliance_frameworks" text[] default '{}'::text[],
    "audit_history" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "last_reviewed_at" timestamp with time zone,
    "review_status" text default 'pending'::text,
    "risk_score" integer default 50,
    "trust_level" text default 'unverified'::text
);


alter table "public"."vendor_profiles" enable row level security;

create table "public"."vendor_tools" (
    "id" uuid not null default gen_random_uuid(),
    "vendor_id" uuid,
    "tool_name" text not null,
    "tool_description" text,
    "tool_category" text,
    "tool_url" text,
    "primary_function" text,
    "target_audience" text[],
    "age_range_min" integer default 13,
    "age_range_max" integer default 18,
    "grade_levels" text[] default '{}'::text[],
    "subject_areas" text[] default '{}'::text[],
    "technical_requirements" jsonb default '{}'::jsonb,
    "integration_capabilities" text[] default '{}'::text[],
    "api_availability" boolean default false,
    "offline_capability" boolean default false,
    "mobile_support" boolean default true,
    "browser_requirements" text[] default '{}'::text[],
    "accessibility_features" text[] default '{}'::text[],
    "languages_supported" text[] default ARRAY['English'::text],
    "pricing_model" text,
    "cost_structure" jsonb default '{}'::jsonb,
    "free_tier_available" boolean default false,
    "trial_period_days" integer default 0,
    "contract_requirements" text,
    "minimum_contract_length" text,
    "cancellation_policy" text,
    "data_residency" text default 'United States'::text,
    "hosting_provider" text,
    "encryption_standards" text[] default '{}'::text[],
    "backup_procedures" text,
    "disaster_recovery_plan" text,
    "uptime_guarantee" numeric(5,2),
    "support_channels" text[] default '{}'::text[],
    "training_provided" boolean default false,
    "documentation_quality" text default 'basic'::text,
    "onboarding_support" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "status" text default 'pending'::text,
    "risk_assessment_id" uuid,
    "approval_date" timestamp with time zone,
    "last_compliance_review" timestamp with time zone,
    "next_review_due" timestamp with time zone,
    "active_users_count" integer default 0,
    "usage_statistics" jsonb default '{}'::jsonb,
    "incident_history" jsonb default '[]'::jsonb
);


alter table "public"."vendor_tools" enable row level security;

create table "public"."vendor_vetting_audit" (
    "id" uuid not null default gen_random_uuid(),
    "entity_type" text not null,
    "entity_id" uuid not null,
    "action_type" text not null,
    "action_description" text,
    "user_id" uuid,
    "user_name" text,
    "user_role" text,
    "action_timestamp" timestamp with time zone default now(),
    "field_changed" text,
    "old_value" jsonb,
    "new_value" jsonb,
    "change_reason" text,
    "session_id" text,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."vendor_vetting_audit" enable row level security;

alter table "public"."blueprint_comments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."blueprint_goals" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."blueprint_phases" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."blueprint_progress" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."blueprint_tasks" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."blueprint_templates" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."blueprints" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."calendar_events" alter column "organization" drop not null;

alter table "public"."implementation_phases" alter column "organization" drop not null;

alter table "public"."organizations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."roi_metrics" alter column "organization" drop not null;

alter table "public"."streamlined_assessment_responses" add column "ai_journey_stage" text;

alter table "public"."streamlined_assessment_responses" add column "ai_roadmap" text;

alter table "public"."streamlined_assessment_responses" add column "biggest_challenge" text;

alter table "public"."streamlined_assessment_responses" add column "completed_at" timestamp with time zone;

alter table "public"."streamlined_assessment_responses" add column "contact_email" text;

alter table "public"."streamlined_assessment_responses" add column "contact_name" text;

alter table "public"."streamlined_assessment_responses" add column "contact_role" text;

alter table "public"."streamlined_assessment_responses" add column "created_at" timestamp with time zone default now();

alter table "public"."streamlined_assessment_responses" add column "implementation_timeline" text;

alter table "public"."streamlined_assessment_responses" add column "institution_size" text;

alter table "public"."streamlined_assessment_responses" add column "institution_state" text;

alter table "public"."streamlined_assessment_responses" add column "institution_type" text;

alter table "public"."streamlined_assessment_responses" add column "preferred_consultation_time" text;

alter table "public"."streamlined_assessment_responses" add column "readiness_level" character varying(50);

alter table "public"."streamlined_assessment_responses" add column "responses" jsonb;

alter table "public"."streamlined_assessment_responses" add column "scores" jsonb;

alter table "public"."streamlined_assessment_responses" add column "special_considerations" text;

alter table "public"."streamlined_assessment_responses" add column "top_priorities" text[];

alter table "public"."streamlined_assessment_responses" add column "updated_at" timestamp with time zone default now();

alter table "public"."streamlined_assessment_responses" add column "user_id" uuid;

alter table "public"."streamlined_assessment_responses" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."streamlined_assessment_responses" enable row level security;

alter table "public"."tasks" alter column "organization" drop not null;

alter table "public"."team_members" drop column "avatar_url";

alter table "public"."team_members" drop column "created_at";

alter table "public"."team_members" drop column "email";

alter table "public"."team_members" drop column "name";

alter table "public"."team_members" drop column "updated_at";

alter table "public"."team_members" add column "current_workload" integer default 0;

alter table "public"."team_members" add column "is_active" boolean default true;

alter table "public"."team_members" add column "joined_at" timestamp with time zone default now();

alter table "public"."team_members" add column "permissions" jsonb default '{"view": true}'::jsonb;

alter table "public"."team_members" add column "team_id" uuid;

alter table "public"."team_members" add column "user_id" uuid;

alter table "public"."team_members" add column "workload_capacity" integer default 15;

alter table "public"."team_members" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."team_members" alter column "organization" drop not null;

alter table "public"."user_payments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."user_payments" alter column "is_test" set not null;

alter table "public"."user_payments" enable row level security;

CREATE UNIQUE INDEX ai_policy_templates_pkey ON public.ai_policy_templates USING btree (id);

CREATE UNIQUE INDEX ai_readiness_assessments_pkey ON public.ai_readiness_assessments USING btree (id);

CREATE UNIQUE INDEX ai_readiness_payments_assessment_id_key ON public.ai_readiness_payments USING btree (assessment_id);

CREATE UNIQUE INDEX ai_readiness_payments_pkey ON public.ai_readiness_payments USING btree (id);

CREATE UNIQUE INDEX ai_readiness_team_members_pkey ON public.ai_readiness_team_members USING btree (id);

CREATE UNIQUE INDEX ai_readiness_team_members_team_id_user_id_key ON public.ai_readiness_team_members USING btree (team_id, user_id);

CREATE UNIQUE INDEX ai_readiness_teams_pkey ON public.ai_readiness_teams USING btree (id);

CREATE UNIQUE INDEX approval_approvers_approval_id_user_id_key ON public.approval_approvers USING btree (approval_id, user_id);

CREATE UNIQUE INDEX approval_approvers_pkey ON public.approval_approvers USING btree (id);

CREATE UNIQUE INDEX approval_audit_logs_pkey ON public.approval_audit_logs USING btree (id);

CREATE UNIQUE INDEX approval_comments_pkey ON public.approval_comments USING btree (id);

CREATE UNIQUE INDEX approval_events_pkey ON public.approval_events USING btree (id);

CREATE UNIQUE INDEX approval_notifications_pkey ON public.approval_notifications USING btree (id);

CREATE UNIQUE INDEX approvals_pkey ON public.approvals USING btree (id);

CREATE UNIQUE INDEX approved_tool_catalog_pkey ON public.approved_tool_catalog USING btree (id);

CREATE UNIQUE INDEX approved_tool_catalog_vendor_id_key ON public.approved_tool_catalog USING btree (vendor_id);

CREATE UNIQUE INDEX approved_tools_catalog_pkey ON public.approved_tools_catalog USING btree (id);

CREATE UNIQUE INDEX artifacts_pkey ON public.artifacts USING btree (id);

CREATE UNIQUE INDEX assessment_metrics_pkey ON public.assessment_metrics USING btree (id);

CREATE UNIQUE INDEX assessments_pkey ON public.assessments USING btree (id);

CREATE UNIQUE INDEX auth_password_setup_tokens_pkey ON public.auth_password_setup_tokens USING btree (id);

CREATE UNIQUE INDEX auth_password_setup_tokens_token_key ON public.auth_password_setup_tokens USING btree (token);

CREATE UNIQUE INDEX blueprint_progress_blueprint_id_key ON public.blueprint_progress USING btree (blueprint_id);

CREATE UNIQUE INDEX compliance_evidence_pkey ON public.compliance_evidence USING btree (id);

CREATE UNIQUE INDEX compliance_findings_pkey ON public.compliance_findings USING btree (id);

CREATE UNIQUE INDEX compliance_frameworks_pkey ON public.compliance_frameworks USING btree (id);

CREATE UNIQUE INDEX compliance_monitoring_pkey ON public.compliance_monitoring USING btree (id);

CREATE UNIQUE INDEX compliance_tracking_pkey ON public.compliance_tracking USING btree (id);

CREATE UNIQUE INDEX decision_briefs_pkey ON public.decision_briefs USING btree (id);

CREATE UNIQUE INDEX document_analyses_pkey ON public.document_analyses USING btree (id);

CREATE UNIQUE INDEX document_sections_pkey ON public.document_sections USING btree (id);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

CREATE UNIQUE INDEX enterprise_algorithm_changelog_pkey ON public.enterprise_algorithm_changelog USING btree (version);

CREATE INDEX enterprise_algorithm_results_assessment_idx ON public.enterprise_algorithm_results USING btree (assessment_id);

CREATE UNIQUE INDEX enterprise_algorithm_results_assessment_user_version_uidx ON public.enterprise_algorithm_results USING btree (assessment_id, user_id, algorithm_version);

CREATE INDEX enterprise_algorithm_results_computed_at_idx ON public.enterprise_algorithm_results USING btree (computed_at);

CREATE UNIQUE INDEX enterprise_algorithm_results_pkey ON public.enterprise_algorithm_results USING btree (id);

CREATE INDEX enterprise_algorithm_results_user_idx ON public.enterprise_algorithm_results USING btree (user_id);

CREATE UNIQUE INDEX framework_changes_pkey ON public.framework_changes USING btree (id);

CREATE UNIQUE INDEX framework_controls_pkey ON public.framework_controls USING btree (id);

CREATE UNIQUE INDEX framework_metadata_pkey ON public.framework_metadata USING btree (id);

CREATE UNIQUE INDEX framework_monitoring_config_framework_id_key ON public.framework_monitoring_config USING btree (framework_id);

CREATE UNIQUE INDEX framework_monitoring_config_pkey ON public.framework_monitoring_config USING btree (id);

CREATE UNIQUE INDEX framework_scores_assessment_id_framework_control_id_key ON public.framework_scores USING btree (assessment_id, framework, control_id);

CREATE UNIQUE INDEX framework_scores_pkey ON public.framework_scores USING btree (id);

CREATE UNIQUE INDEX gap_analysis_results_pkey ON public.gap_analysis_results USING btree (id);

CREATE INDEX idx_activity_log_created_at ON public.user_activity_log USING btree (created_at DESC);

CREATE INDEX idx_activity_log_user_id ON public.user_activity_log USING btree (user_id);

CREATE INDEX idx_ai_readiness_assessments_ai_score ON public.ai_readiness_assessments USING btree (ai_readiness_score);

CREATE INDEX idx_ai_readiness_assessments_created_at ON public.ai_readiness_assessments USING btree (created_at);

CREATE INDEX idx_ai_readiness_assessments_institution_type ON public.ai_readiness_assessments USING btree (institution_type);

CREATE INDEX idx_ai_readiness_assessments_status ON public.ai_readiness_assessments USING btree (status);

CREATE INDEX idx_ai_readiness_assessments_tier ON public.ai_readiness_assessments USING btree (tier);

CREATE INDEX idx_ai_readiness_assessments_user_id ON public.ai_readiness_assessments USING btree (user_id);

CREATE INDEX idx_ai_readiness_domain_scores ON public.ai_readiness_assessments USING gin (domain_scores);

CREATE INDEX idx_ai_readiness_payments_assessment_id ON public.ai_readiness_payments USING btree (assessment_id);

CREATE INDEX idx_ai_readiness_payments_status ON public.ai_readiness_payments USING btree (payment_status);

CREATE INDEX idx_ai_readiness_policy_recs ON public.ai_readiness_assessments USING gin (policy_recommendations);

CREATE INDEX idx_ai_readiness_responses ON public.ai_readiness_assessments USING gin (responses);

CREATE INDEX idx_ai_readiness_team_members_assessment_id ON public.ai_readiness_team_members USING btree (assessment_id);

CREATE INDEX idx_ai_readiness_team_members_team_id ON public.ai_readiness_team_members USING btree (team_id);

CREATE INDEX idx_ai_readiness_teams_assessment_id ON public.ai_readiness_teams USING btree (assessment_id);

CREATE INDEX idx_approval_approvers_approval_id ON public.approval_approvers USING btree (approval_id);

CREATE INDEX idx_approval_approvers_decision ON public.approval_approvers USING btree (decision);

CREATE INDEX idx_approval_approvers_has_approved ON public.approval_approvers USING btree (has_approved);

CREATE INDEX idx_approval_approvers_user_id ON public.approval_approvers USING btree (user_id);

CREATE INDEX idx_approval_audit_logs_action ON public.approval_audit_logs USING btree (action);

CREATE INDEX idx_approval_audit_logs_approval_id ON public.approval_audit_logs USING btree (approval_id);

CREATE INDEX idx_approval_audit_logs_timestamp ON public.approval_audit_logs USING btree ("timestamp");

CREATE INDEX idx_approval_audit_logs_user_id ON public.approval_audit_logs USING btree (user_id);

CREATE INDEX idx_approval_comments_approval_id ON public.approval_comments USING btree (approval_id);

CREATE INDEX idx_approval_comments_timestamp ON public.approval_comments USING btree ("timestamp");

CREATE INDEX idx_approval_comments_user_id ON public.approval_comments USING btree (user_id);

CREATE INDEX idx_approval_events_action ON public.approval_events USING btree (action);

CREATE INDEX idx_approval_events_approval_id ON public.approval_events USING btree (approval_id);

CREATE INDEX idx_approval_events_timestamp ON public.approval_events USING btree ("timestamp");

CREATE INDEX idx_approval_events_who ON public.approval_events USING btree (who);

CREATE INDEX idx_approval_notifications_approval_id ON public.approval_notifications USING btree (approval_id);

CREATE INDEX idx_approval_notifications_recipient_id ON public.approval_notifications USING btree (recipient_id);

CREATE INDEX idx_approval_notifications_sent ON public.approval_notifications USING btree (sent);

CREATE INDEX idx_approval_notifications_type ON public.approval_notifications USING btree (type);

CREATE INDEX idx_approvals_created_at ON public.approvals USING btree (created_at);

CREATE INDEX idx_approvals_created_by ON public.approvals USING btree (created_by);

CREATE INDEX idx_approvals_due_date ON public.approvals USING btree (due_date);

CREATE INDEX idx_approvals_status ON public.approvals USING btree (status);

CREATE INDEX idx_approvals_subject ON public.approvals USING btree (subject_type, subject_id);

CREATE INDEX idx_approved_tool_catalog_category ON public.approved_tool_catalog USING btree (category);

CREATE INDEX idx_approved_tool_catalog_is_active ON public.approved_tool_catalog USING btree (is_active);

CREATE INDEX idx_approved_tool_catalog_vendor_id ON public.approved_tool_catalog USING btree (vendor_id);

CREATE INDEX idx_approved_tools_approval_date ON public.approved_tools_catalog USING btree (approval_date);

CREATE INDEX idx_approved_tools_compliance_status ON public.approved_tools_catalog USING btree (compliance_status);

CREATE INDEX idx_approved_tools_grade_levels ON public.approved_tools_catalog USING gin (approved_grade_levels);

CREATE INDEX idx_approved_tools_roles ON public.approved_tools_catalog USING gin (approved_roles);

CREATE INDEX idx_approved_tools_status ON public.approved_tools_catalog USING btree (status);

CREATE INDEX idx_approved_tools_subjects ON public.approved_tools_catalog USING gin (approved_subjects);

CREATE INDEX idx_approved_tools_tool_id ON public.approved_tools_catalog USING btree (tool_id);

CREATE INDEX idx_artifacts_assessment ON public.artifacts USING btree (assessment_id);

CREATE INDEX idx_artifacts_created ON public.artifacts USING btree (created_at DESC);

CREATE INDEX idx_artifacts_org ON public.artifacts USING btree (org_id);

CREATE INDEX idx_artifacts_type ON public.artifacts USING btree (type);

CREATE INDEX idx_assessment_completed ON public.streamlined_assessment_responses USING btree (completed_at DESC);

CREATE INDEX idx_assessment_readiness_level ON public.streamlined_assessment_responses USING btree (readiness_level);

CREATE INDEX idx_assessments_created ON public.assessments USING btree (created_at DESC);

CREATE INDEX idx_assessments_org ON public.assessments USING btree (org_id);

CREATE INDEX idx_assessments_scores ON public.assessments USING gin (scores);

CREATE INDEX idx_compliance_monitoring_date ON public.compliance_monitoring USING btree (monitoring_date);

CREATE INDEX idx_compliance_monitoring_tool_id ON public.compliance_monitoring USING btree (tool_id);

CREATE INDEX idx_compliance_monitoring_type ON public.compliance_monitoring USING btree (monitoring_type);

CREATE INDEX idx_controls_code ON public.framework_controls USING btree (code);

CREATE INDEX idx_controls_framework ON public.framework_controls USING btree (framework_id);

CREATE INDEX idx_decision_briefs_brief_date ON public.decision_briefs USING btree (brief_date);

CREATE INDEX idx_decision_briefs_recommendation ON public.decision_briefs USING btree (recommendation);

CREATE INDEX idx_decision_briefs_risk_assessment_id ON public.decision_briefs USING btree (risk_assessment_id);

CREATE INDEX idx_document_analyses_analyzed_at ON public.document_analyses USING btree (analyzed_at DESC);

CREATE INDEX idx_document_analyses_user_id ON public.document_analyses USING btree (user_id);

CREATE INDEX idx_documents_created ON public.documents USING btree (created_at DESC);

CREATE INDEX idx_documents_framework_tags ON public.documents USING gin (framework_tags);

CREATE INDEX idx_documents_org ON public.documents USING btree (org_id);

CREATE INDEX idx_documents_status ON public.documents USING btree (status);

CREATE INDEX idx_evidence_current ON public.compliance_evidence USING btree (is_current, expires_at);

CREATE INDEX idx_evidence_tracking ON public.compliance_evidence USING btree (tracking_id);

CREATE INDEX idx_findings_status ON public.compliance_findings USING btree (status, severity);

CREATE INDEX idx_findings_tracking ON public.compliance_findings USING btree (tracking_id);

CREATE INDEX idx_framework_changes_effective_date ON public.framework_changes USING btree (effective_date);

CREATE INDEX idx_framework_changes_framework_id ON public.framework_changes USING btree (framework_id);

CREATE INDEX idx_framework_changes_impact_level ON public.framework_changes USING btree (impact_level);

CREATE INDEX idx_framework_changes_requires_redline ON public.framework_changes USING btree (requires_redline);

CREATE INDEX idx_framework_metadata_status ON public.framework_metadata USING btree (status);

CREATE INDEX idx_framework_metadata_updated ON public.framework_metadata USING btree (updated_at);

CREATE INDEX idx_framework_scores_assessment ON public.framework_scores USING btree (assessment_id);

CREATE INDEX idx_framework_scores_framework ON public.framework_scores USING btree (framework);

CREATE INDEX idx_framework_scores_score ON public.framework_scores USING btree (score DESC);

CREATE INDEX idx_frameworks_audience ON public.compliance_frameworks USING btree (audience, is_active);

CREATE INDEX idx_gap_analysis_user_id ON public.gap_analysis_results USING btree (user_id);

CREATE UNIQUE INDEX idx_gap_analysis_user_id_unique ON public.gap_analysis_results USING btree (user_id);

CREATE INDEX idx_institution_memberships_active ON public.institution_memberships USING btree (active);

CREATE INDEX idx_institution_memberships_institution ON public.institution_memberships USING btree (institution_id);

CREATE INDEX idx_institution_memberships_user ON public.institution_memberships USING btree (user_id);

CREATE INDEX idx_intake_forms_assessment_id ON public.vendor_intake_forms USING btree (assessment_id);

CREATE INDEX idx_intake_forms_assigned_reviewer ON public.vendor_intake_forms USING btree (assigned_reviewer);

CREATE INDEX idx_intake_forms_status ON public.vendor_intake_forms USING btree (review_status);

CREATE INDEX idx_intake_forms_submission_date ON public.vendor_intake_forms USING btree (submission_date);

CREATE INDEX idx_intake_forms_submitted_by ON public.vendor_intake_forms USING btree (submitted_by);

CREATE INDEX idx_job_logs_executed_at ON public.policy_update_job_logs USING btree (executed_at);

CREATE INDEX idx_job_logs_success ON public.policy_update_job_logs USING btree (success);

CREATE INDEX idx_metrics_name ON public.assessment_metrics USING btree (metric_name);

CREATE INDEX idx_metrics_recorded ON public.assessment_metrics USING btree (recorded_at DESC);

CREATE INDEX idx_monitoring_config_enabled ON public.framework_monitoring_config USING btree (enabled);

CREATE INDEX idx_monitoring_config_framework_id ON public.framework_monitoring_config USING btree (framework_id);

CREATE INDEX idx_monitoring_config_next_check ON public.framework_monitoring_config USING btree (next_check);

CREATE INDEX idx_password_setup_token ON public.auth_password_setup_tokens USING btree (token);

CREATE INDEX idx_pii_detected ON public.pii_detections USING btree (detected_at DESC);

CREATE INDEX idx_pii_document ON public.pii_detections USING btree (document_id);

CREATE INDEX idx_pii_type ON public.pii_detections USING btree (pii_type);

CREATE INDEX idx_policy_mappings_control ON public.policy_control_mappings USING btree (control_id);

CREATE INDEX idx_policy_notifications_recipient ON public.policy_update_notifications USING btree (recipient_id);

CREATE INDEX idx_policy_notifications_redline_pack ON public.policy_update_notifications USING btree (redline_pack_id);

CREATE INDEX idx_policy_notifications_sent ON public.policy_update_notifications USING btree (sent);

CREATE INDEX idx_policy_notifications_type ON public.policy_update_notifications USING btree (type);

CREATE INDEX idx_redline_packs_created_at ON public.policy_redline_packs USING btree (created_at);

CREATE INDEX idx_redline_packs_framework_change ON public.policy_redline_packs USING btree (framework_change_id);

CREATE INDEX idx_redline_packs_generated_by ON public.policy_redline_packs USING btree (generated_by);

CREATE INDEX idx_redline_packs_policy_id ON public.policy_redline_packs USING btree (policy_id);

CREATE INDEX idx_redline_packs_status ON public.policy_redline_packs USING btree (status);

CREATE INDEX idx_risk_assessments_intake_form_id ON public.risk_assessments USING btree (intake_form_id);

CREATE INDEX idx_risk_assessments_overall_score ON public.risk_assessments USING btree (overall_risk_score);

CREATE INDEX idx_risk_assessments_risk_level ON public.risk_assessments USING btree (risk_level);

CREATE INDEX idx_risk_assessments_tool_id ON public.risk_assessments USING btree (tool_id);

CREATE INDEX idx_roadmaps_user_id ON public.implementation_roadmaps USING btree (user_id);

CREATE INDEX idx_sections_document ON public.document_sections USING btree (document_id);

CREATE INDEX idx_sections_page ON public.document_sections USING btree (page_number);

CREATE INDEX idx_sections_type ON public.document_sections USING btree (section_type);

CREATE INDEX idx_streamlined_assessment_user_id ON public.streamlined_assessment_responses USING btree (user_id);

CREATE INDEX idx_team_members_active ON public.team_members USING btree (is_active);

CREATE INDEX idx_team_members_team_id ON public.team_members USING btree (team_id);

CREATE INDEX idx_team_members_user_id ON public.team_members USING btree (user_id);

CREATE INDEX idx_teams_org_audience ON public.teams USING btree (org_id, audience);

CREATE INDEX idx_tracking_assigned_to ON public.compliance_tracking USING btree (assigned_to);

CREATE INDEX idx_tracking_control ON public.compliance_tracking USING btree (control_id);

CREATE INDEX idx_tracking_due_date ON public.compliance_tracking USING btree (due_date);

CREATE INDEX idx_tracking_org_status ON public.compliance_tracking USING btree (org_id, status);

CREATE INDEX idx_tracking_priority ON public.compliance_tracking USING btree (priority);

CREATE INDEX idx_uploaded_documents_user_id ON public.uploaded_documents USING btree (user_id);

CREATE INDEX idx_usage_analytics_date ON public.usage_analytics USING btree (analytics_date);

CREATE INDEX idx_usage_analytics_period_type ON public.usage_analytics USING btree (period_type);

CREATE INDEX idx_usage_analytics_tool_id ON public.usage_analytics USING btree (tool_id);

CREATE INDEX idx_user_payments_access ON public.user_payments USING btree (access_granted);

CREATE INDEX idx_user_payments_email ON public.user_payments USING btree (email);

CREATE INDEX idx_user_payments_is_test ON public.user_payments USING btree (is_test);

CREATE INDEX idx_user_payments_stripe_customer ON public.user_payments USING btree (stripe_customer_id);

CREATE INDEX idx_user_payments_tier ON public.user_payments USING btree (tier);

CREATE INDEX idx_user_payments_user_id ON public.user_payments USING btree (user_id);

CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email);

CREATE INDEX idx_user_profiles_institution_id ON public.user_profiles USING btree (institution_id);

CREATE INDEX idx_user_profiles_institution_type ON public.user_profiles USING btree (institution_type);

CREATE INDEX idx_user_profiles_subscription_status ON public.user_profiles USING btree (subscription_status);

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);

CREATE INDEX idx_vendor_assessments_section ON public.vendor_assessments USING btree (section);

CREATE INDEX idx_vendor_assessments_vendor_id ON public.vendor_assessments USING btree (vendor_id);

CREATE INDEX idx_vendor_audit_logs_created_at ON public.vendor_audit_logs USING btree (created_at);

CREATE INDEX idx_vendor_audit_logs_event_type ON public.vendor_audit_logs USING btree (event_type);

CREATE INDEX idx_vendor_audit_logs_user_id ON public.vendor_audit_logs USING btree (user_id);

CREATE INDEX idx_vendor_audit_logs_vendor_id ON public.vendor_audit_logs USING btree (vendor_id);

CREATE INDEX idx_vendor_data_flows_flow_type ON public.vendor_data_flows USING btree (flow_type);

CREATE INDEX idx_vendor_data_flows_vendor_id ON public.vendor_data_flows USING btree (vendor_id);

CREATE INDEX idx_vendor_decision_briefs_generated_at ON public.vendor_decision_briefs USING btree (generated_at);

CREATE INDEX idx_vendor_decision_briefs_vendor_id ON public.vendor_decision_briefs USING btree (vendor_id);

CREATE INDEX idx_vendor_dependencies_control ON public.vendor_control_dependencies USING btree (control_id);

CREATE INDEX idx_vendor_intakes_created_at ON public.vendor_intakes USING btree (created_at);

CREATE INDEX idx_vendor_intakes_created_by ON public.vendor_intakes USING btree (created_by);

CREATE INDEX idx_vendor_intakes_risk_level ON public.vendor_intakes USING btree (risk_level);

CREATE INDEX idx_vendor_intakes_status ON public.vendor_intakes USING btree (status);

CREATE INDEX idx_vendor_intakes_vendor_name ON public.vendor_intakes USING btree (vendor_name);

CREATE INDEX idx_vendor_mitigations_risk_flag ON public.vendor_mitigations USING btree (risk_flag);

CREATE INDEX idx_vendor_mitigations_status ON public.vendor_mitigations USING btree (status);

CREATE INDEX idx_vendor_mitigations_vendor_id ON public.vendor_mitigations USING btree (vendor_id);

CREATE INDEX idx_vendor_profiles_created_at ON public.vendor_profiles USING btree (created_at);

CREATE INDEX idx_vendor_profiles_name ON public.vendor_profiles USING btree (vendor_name);

CREATE INDEX idx_vendor_profiles_risk_score ON public.vendor_profiles USING btree (risk_score);

CREATE INDEX idx_vendor_profiles_status ON public.vendor_profiles USING btree (review_status);

CREATE INDEX idx_vendor_tools_category ON public.vendor_tools USING btree (tool_category);

CREATE INDEX idx_vendor_tools_grade_levels ON public.vendor_tools USING gin (grade_levels);

CREATE INDEX idx_vendor_tools_name ON public.vendor_tools USING btree (tool_name);

CREATE INDEX idx_vendor_tools_status ON public.vendor_tools USING btree (status);

CREATE INDEX idx_vendor_tools_subject_areas ON public.vendor_tools USING gin (subject_areas);

CREATE INDEX idx_vendor_tools_vendor_id ON public.vendor_tools USING btree (vendor_id);

CREATE INDEX idx_vendor_vetting_audit_action_type ON public.vendor_vetting_audit USING btree (action_type);

CREATE INDEX idx_vendor_vetting_audit_entity ON public.vendor_vetting_audit USING btree (entity_type, entity_id);

CREATE INDEX idx_vendor_vetting_audit_timestamp ON public.vendor_vetting_audit USING btree (action_timestamp);

CREATE INDEX idx_vendor_vetting_audit_user ON public.vendor_vetting_audit USING btree (user_id);

CREATE UNIQUE INDEX implementation_roadmaps_pkey ON public.implementation_roadmaps USING btree (id);

CREATE UNIQUE INDEX institution_memberships_institution_id_user_id_key ON public.institution_memberships USING btree (institution_id, user_id);

CREATE UNIQUE INDEX institution_memberships_pkey ON public.institution_memberships USING btree (id);

CREATE UNIQUE INDEX institutions_pkey ON public.institutions USING btree (id);

CREATE UNIQUE INDEX institutions_slug_key ON public.institutions USING btree (slug);

CREATE UNIQUE INDEX pii_detections_pkey ON public.pii_detections USING btree (id);

CREATE UNIQUE INDEX policy_control_mappings_pkey ON public.policy_control_mappings USING btree (id);

CREATE UNIQUE INDEX policy_redline_packs_pkey ON public.policy_redline_packs USING btree (id);

CREATE UNIQUE INDEX policy_update_job_logs_job_id_key ON public.policy_update_job_logs USING btree (job_id);

CREATE UNIQUE INDEX policy_update_job_logs_pkey ON public.policy_update_job_logs USING btree (id);

CREATE UNIQUE INDEX policy_update_notifications_pkey ON public.policy_update_notifications USING btree (id);

CREATE UNIQUE INDEX risk_assessments_pkey ON public.risk_assessments USING btree (id);

CREATE UNIQUE INDEX team_members_team_id_user_id_key ON public.team_members USING btree (team_id, user_id);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX uploaded_documents_pkey ON public.uploaded_documents USING btree (id);

CREATE UNIQUE INDEX usage_analytics_pkey ON public.usage_analytics USING btree (id);

CREATE UNIQUE INDEX usage_analytics_tool_id_analytics_date_period_type_key ON public.usage_analytics USING btree (tool_id, analytics_date, period_type);

CREATE UNIQUE INDEX user_activity_log_pkey ON public.user_activity_log USING btree (id);

CREATE UNIQUE INDEX user_payments_user_id_unique ON public.user_payments USING btree (user_id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles USING btree (user_id);

CREATE UNIQUE INDEX vendor_assessments_pkey ON public.vendor_assessments USING btree (id);

CREATE UNIQUE INDEX vendor_assessments_vendor_id_section_question_id_key ON public.vendor_assessments USING btree (vendor_id, section, question_id);

CREATE UNIQUE INDEX vendor_audit_logs_pkey ON public.vendor_audit_logs USING btree (id);

CREATE UNIQUE INDEX vendor_control_dependencies_pkey ON public.vendor_control_dependencies USING btree (id);

CREATE UNIQUE INDEX vendor_data_flows_pkey ON public.vendor_data_flows USING btree (id);

CREATE UNIQUE INDEX vendor_decision_briefs_pkey ON public.vendor_decision_briefs USING btree (id);

CREATE UNIQUE INDEX vendor_intake_forms_pkey ON public.vendor_intake_forms USING btree (id);

CREATE UNIQUE INDEX vendor_intakes_pkey ON public.vendor_intakes USING btree (id);

CREATE UNIQUE INDEX vendor_mitigations_pkey ON public.vendor_mitigations USING btree (id);

CREATE UNIQUE INDEX vendor_profiles_pkey ON public.vendor_profiles USING btree (id);

CREATE UNIQUE INDEX vendor_profiles_vendor_name_key ON public.vendor_profiles USING btree (vendor_name);

CREATE UNIQUE INDEX vendor_tools_pkey ON public.vendor_tools USING btree (id);

CREATE UNIQUE INDEX vendor_tools_vendor_id_tool_name_key ON public.vendor_tools USING btree (vendor_id, tool_name);

CREATE UNIQUE INDEX vendor_vetting_audit_pkey ON public.vendor_vetting_audit USING btree (id);

alter table "public"."ai_policy_templates" add constraint "ai_policy_templates_pkey" PRIMARY KEY using index "ai_policy_templates_pkey";

alter table "public"."ai_readiness_assessments" add constraint "ai_readiness_assessments_pkey" PRIMARY KEY using index "ai_readiness_assessments_pkey";

alter table "public"."ai_readiness_payments" add constraint "ai_readiness_payments_pkey" PRIMARY KEY using index "ai_readiness_payments_pkey";

alter table "public"."ai_readiness_team_members" add constraint "ai_readiness_team_members_pkey" PRIMARY KEY using index "ai_readiness_team_members_pkey";

alter table "public"."ai_readiness_teams" add constraint "ai_readiness_teams_pkey" PRIMARY KEY using index "ai_readiness_teams_pkey";

alter table "public"."approval_approvers" add constraint "approval_approvers_pkey" PRIMARY KEY using index "approval_approvers_pkey";

alter table "public"."approval_audit_logs" add constraint "approval_audit_logs_pkey" PRIMARY KEY using index "approval_audit_logs_pkey";

alter table "public"."approval_comments" add constraint "approval_comments_pkey" PRIMARY KEY using index "approval_comments_pkey";

alter table "public"."approval_events" add constraint "approval_events_pkey" PRIMARY KEY using index "approval_events_pkey";

alter table "public"."approval_notifications" add constraint "approval_notifications_pkey" PRIMARY KEY using index "approval_notifications_pkey";

alter table "public"."approvals" add constraint "approvals_pkey" PRIMARY KEY using index "approvals_pkey";

alter table "public"."approved_tool_catalog" add constraint "approved_tool_catalog_pkey" PRIMARY KEY using index "approved_tool_catalog_pkey";

alter table "public"."approved_tools_catalog" add constraint "approved_tools_catalog_pkey" PRIMARY KEY using index "approved_tools_catalog_pkey";

alter table "public"."artifacts" add constraint "artifacts_pkey" PRIMARY KEY using index "artifacts_pkey";

alter table "public"."assessment_metrics" add constraint "assessment_metrics_pkey" PRIMARY KEY using index "assessment_metrics_pkey";

alter table "public"."assessments" add constraint "assessments_pkey" PRIMARY KEY using index "assessments_pkey";

alter table "public"."auth_password_setup_tokens" add constraint "auth_password_setup_tokens_pkey" PRIMARY KEY using index "auth_password_setup_tokens_pkey";

alter table "public"."compliance_evidence" add constraint "compliance_evidence_pkey" PRIMARY KEY using index "compliance_evidence_pkey";

alter table "public"."compliance_findings" add constraint "compliance_findings_pkey" PRIMARY KEY using index "compliance_findings_pkey";

alter table "public"."compliance_frameworks" add constraint "compliance_frameworks_pkey" PRIMARY KEY using index "compliance_frameworks_pkey";

alter table "public"."compliance_monitoring" add constraint "compliance_monitoring_pkey" PRIMARY KEY using index "compliance_monitoring_pkey";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_pkey" PRIMARY KEY using index "compliance_tracking_pkey";

alter table "public"."decision_briefs" add constraint "decision_briefs_pkey" PRIMARY KEY using index "decision_briefs_pkey";

alter table "public"."document_analyses" add constraint "document_analyses_pkey" PRIMARY KEY using index "document_analyses_pkey";

alter table "public"."document_sections" add constraint "document_sections_pkey" PRIMARY KEY using index "document_sections_pkey";

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

alter table "public"."enterprise_algorithm_changelog" add constraint "enterprise_algorithm_changelog_pkey" PRIMARY KEY using index "enterprise_algorithm_changelog_pkey";

alter table "public"."enterprise_algorithm_results" add constraint "enterprise_algorithm_results_pkey" PRIMARY KEY using index "enterprise_algorithm_results_pkey";

alter table "public"."framework_changes" add constraint "framework_changes_pkey" PRIMARY KEY using index "framework_changes_pkey";

alter table "public"."framework_controls" add constraint "framework_controls_pkey" PRIMARY KEY using index "framework_controls_pkey";

alter table "public"."framework_metadata" add constraint "framework_metadata_pkey" PRIMARY KEY using index "framework_metadata_pkey";

alter table "public"."framework_monitoring_config" add constraint "framework_monitoring_config_pkey" PRIMARY KEY using index "framework_monitoring_config_pkey";

alter table "public"."framework_scores" add constraint "framework_scores_pkey" PRIMARY KEY using index "framework_scores_pkey";

alter table "public"."gap_analysis_results" add constraint "gap_analysis_results_pkey" PRIMARY KEY using index "gap_analysis_results_pkey";

alter table "public"."implementation_roadmaps" add constraint "implementation_roadmaps_pkey" PRIMARY KEY using index "implementation_roadmaps_pkey";

alter table "public"."institution_memberships" add constraint "institution_memberships_pkey" PRIMARY KEY using index "institution_memberships_pkey";

alter table "public"."institutions" add constraint "institutions_pkey" PRIMARY KEY using index "institutions_pkey";

alter table "public"."pii_detections" add constraint "pii_detections_pkey" PRIMARY KEY using index "pii_detections_pkey";

alter table "public"."policy_control_mappings" add constraint "policy_control_mappings_pkey" PRIMARY KEY using index "policy_control_mappings_pkey";

alter table "public"."policy_redline_packs" add constraint "policy_redline_packs_pkey" PRIMARY KEY using index "policy_redline_packs_pkey";

alter table "public"."policy_update_job_logs" add constraint "policy_update_job_logs_pkey" PRIMARY KEY using index "policy_update_job_logs_pkey";

alter table "public"."policy_update_notifications" add constraint "policy_update_notifications_pkey" PRIMARY KEY using index "policy_update_notifications_pkey";

alter table "public"."risk_assessments" add constraint "risk_assessments_pkey" PRIMARY KEY using index "risk_assessments_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."uploaded_documents" add constraint "uploaded_documents_pkey" PRIMARY KEY using index "uploaded_documents_pkey";

alter table "public"."usage_analytics" add constraint "usage_analytics_pkey" PRIMARY KEY using index "usage_analytics_pkey";

alter table "public"."user_activity_log" add constraint "user_activity_log_pkey" PRIMARY KEY using index "user_activity_log_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."vendor_assessments" add constraint "vendor_assessments_pkey" PRIMARY KEY using index "vendor_assessments_pkey";

alter table "public"."vendor_audit_logs" add constraint "vendor_audit_logs_pkey" PRIMARY KEY using index "vendor_audit_logs_pkey";

alter table "public"."vendor_control_dependencies" add constraint "vendor_control_dependencies_pkey" PRIMARY KEY using index "vendor_control_dependencies_pkey";

alter table "public"."vendor_data_flows" add constraint "vendor_data_flows_pkey" PRIMARY KEY using index "vendor_data_flows_pkey";

alter table "public"."vendor_decision_briefs" add constraint "vendor_decision_briefs_pkey" PRIMARY KEY using index "vendor_decision_briefs_pkey";

alter table "public"."vendor_intake_forms" add constraint "vendor_intake_forms_pkey" PRIMARY KEY using index "vendor_intake_forms_pkey";

alter table "public"."vendor_intakes" add constraint "vendor_intakes_pkey" PRIMARY KEY using index "vendor_intakes_pkey";

alter table "public"."vendor_mitigations" add constraint "vendor_mitigations_pkey" PRIMARY KEY using index "vendor_mitigations_pkey";

alter table "public"."vendor_profiles" add constraint "vendor_profiles_pkey" PRIMARY KEY using index "vendor_profiles_pkey";

alter table "public"."vendor_tools" add constraint "vendor_tools_pkey" PRIMARY KEY using index "vendor_tools_pkey";

alter table "public"."vendor_vetting_audit" add constraint "vendor_vetting_audit_pkey" PRIMARY KEY using index "vendor_vetting_audit_pkey";

alter table "public"."ai_readiness_assessments" add constraint "ai_readiness_assessments_status_check" CHECK ((status = ANY (ARRAY['PENDING'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'ANALYZED'::text]))) not valid;

alter table "public"."ai_readiness_assessments" validate constraint "ai_readiness_assessments_status_check";

alter table "public"."ai_readiness_assessments" add constraint "ai_readiness_assessments_tier_check" CHECK ((tier = ANY (ARRAY['basic'::text, 'custom'::text]))) not valid;

alter table "public"."ai_readiness_assessments" validate constraint "ai_readiness_assessments_tier_check";

alter table "public"."ai_readiness_assessments" add constraint "ai_readiness_assessments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."ai_readiness_assessments" validate constraint "ai_readiness_assessments_user_id_fkey";

alter table "public"."ai_readiness_payments" add constraint "ai_readiness_payments_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES ai_readiness_assessments(id) ON DELETE CASCADE not valid;

alter table "public"."ai_readiness_payments" validate constraint "ai_readiness_payments_assessment_id_fkey";

alter table "public"."ai_readiness_payments" add constraint "ai_readiness_payments_assessment_id_key" UNIQUE using index "ai_readiness_payments_assessment_id_key";

alter table "public"."ai_readiness_payments" add constraint "ai_readiness_payments_payment_status_check" CHECK ((payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]))) not valid;

alter table "public"."ai_readiness_payments" validate constraint "ai_readiness_payments_payment_status_check";

alter table "public"."ai_readiness_team_members" add constraint "ai_readiness_team_members_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES ai_readiness_assessments(id) ON DELETE CASCADE not valid;

alter table "public"."ai_readiness_team_members" validate constraint "ai_readiness_team_members_assessment_id_fkey";

alter table "public"."ai_readiness_team_members" add constraint "ai_readiness_team_members_team_id_fkey" FOREIGN KEY (team_id) REFERENCES ai_readiness_teams(id) ON DELETE CASCADE not valid;

alter table "public"."ai_readiness_team_members" validate constraint "ai_readiness_team_members_team_id_fkey";

alter table "public"."ai_readiness_team_members" add constraint "ai_readiness_team_members_team_id_user_id_key" UNIQUE using index "ai_readiness_team_members_team_id_user_id_key";

alter table "public"."ai_readiness_team_members" add constraint "ai_readiness_team_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."ai_readiness_team_members" validate constraint "ai_readiness_team_members_user_id_fkey";

alter table "public"."ai_readiness_teams" add constraint "ai_readiness_teams_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES ai_readiness_assessments(id) ON DELETE CASCADE not valid;

alter table "public"."ai_readiness_teams" validate constraint "ai_readiness_teams_assessment_id_fkey";

alter table "public"."ai_readiness_teams" add constraint "ai_readiness_teams_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."ai_readiness_teams" validate constraint "ai_readiness_teams_created_by_fkey";

alter table "public"."approval_approvers" add constraint "approval_approvers_approval_id_user_id_key" UNIQUE using index "approval_approvers_approval_id_user_id_key";

alter table "public"."approval_approvers" add constraint "approval_approvers_decision_check" CHECK (((decision)::text = ANY ((ARRAY['approved'::character varying, 'rejected'::character varying, 'changes_requested'::character varying])::text[]))) not valid;

alter table "public"."approval_approvers" validate constraint "approval_approvers_decision_check";

alter table "public"."approval_approvers" add constraint "fk_approval_approvers_approval" FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE not valid;

alter table "public"."approval_approvers" validate constraint "fk_approval_approvers_approval";

alter table "public"."approval_approvers" add constraint "fk_approval_approvers_user" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."approval_approvers" validate constraint "fk_approval_approvers_user";

alter table "public"."approval_audit_logs" add constraint "fk_approval_audit_logs_approval" FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE not valid;

alter table "public"."approval_audit_logs" validate constraint "fk_approval_audit_logs_approval";

alter table "public"."approval_audit_logs" add constraint "fk_approval_audit_logs_user" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."approval_audit_logs" validate constraint "fk_approval_audit_logs_user";

alter table "public"."approval_comments" add constraint "fk_approval_comments_approval" FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE not valid;

alter table "public"."approval_comments" validate constraint "fk_approval_comments_approval";

alter table "public"."approval_comments" add constraint "fk_approval_comments_user" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."approval_comments" validate constraint "fk_approval_comments_user";

alter table "public"."approval_events" add constraint "approval_events_action_check" CHECK (((action)::text = ANY ((ARRAY['created'::character varying, 'approved'::character varying, 'rejected'::character varying, 'requested_changes'::character varying, 'reassigned'::character varying, 'comment_added'::character varying, 'due_date_updated'::character varying])::text[]))) not valid;

alter table "public"."approval_events" validate constraint "approval_events_action_check";

alter table "public"."approval_events" add constraint "fk_approval_events_approval" FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE not valid;

alter table "public"."approval_events" validate constraint "fk_approval_events_approval";

alter table "public"."approval_events" add constraint "fk_approval_events_who" FOREIGN KEY (who) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."approval_events" validate constraint "fk_approval_events_who";

alter table "public"."approval_notifications" add constraint "approval_notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['approval_request'::character varying, 'approval_reminder'::character varying, 'approval_completed'::character varying, 'approval_overdue'::character varying, 'changes_requested'::character varying])::text[]))) not valid;

alter table "public"."approval_notifications" validate constraint "approval_notifications_type_check";

alter table "public"."approval_notifications" add constraint "fk_approval_notifications_approval" FOREIGN KEY (approval_id) REFERENCES approvals(id) ON DELETE CASCADE not valid;

alter table "public"."approval_notifications" validate constraint "fk_approval_notifications_approval";

alter table "public"."approval_notifications" add constraint "fk_approval_notifications_recipient" FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."approval_notifications" validate constraint "fk_approval_notifications_recipient";

alter table "public"."approvals" add constraint "approvals_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'changes_requested'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."approvals" validate constraint "approvals_status_check";

alter table "public"."approvals" add constraint "approvals_subject_type_check" CHECK (((subject_type)::text = ANY ((ARRAY['policy'::character varying, 'artifact'::character varying])::text[]))) not valid;

alter table "public"."approvals" validate constraint "approvals_subject_type_check";

alter table "public"."approvals" add constraint "fk_approvals_created_by" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."approvals" validate constraint "fk_approvals_created_by";

alter table "public"."approved_tool_catalog" add constraint "approved_tool_catalog_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES vendor_intakes(id) not valid;

alter table "public"."approved_tool_catalog" validate constraint "approved_tool_catalog_vendor_id_fkey";

alter table "public"."approved_tool_catalog" add constraint "approved_tool_catalog_vendor_id_key" UNIQUE using index "approved_tool_catalog_vendor_id_key";

alter table "public"."approved_tools_catalog" add constraint "approved_tools_catalog_approval_type_check" CHECK ((approval_type = ANY (ARRAY['full'::text, 'conditional'::text, 'pilot'::text, 'restricted'::text]))) not valid;

alter table "public"."approved_tools_catalog" validate constraint "approved_tools_catalog_approval_type_check";

alter table "public"."approved_tools_catalog" add constraint "approved_tools_catalog_compliance_status_check" CHECK ((compliance_status = ANY (ARRAY['Compliant'::text, 'Minor Issues'::text, 'Major Issues'::text, 'Non-Compliant'::text]))) not valid;

alter table "public"."approved_tools_catalog" validate constraint "approved_tools_catalog_compliance_status_check";

alter table "public"."approved_tools_catalog" add constraint "approved_tools_catalog_decision_brief_id_fkey" FOREIGN KEY (decision_brief_id) REFERENCES decision_briefs(id) not valid;

alter table "public"."approved_tools_catalog" validate constraint "approved_tools_catalog_decision_brief_id_fkey";

alter table "public"."approved_tools_catalog" add constraint "approved_tools_catalog_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'deprecated'::text, 'expired'::text]))) not valid;

alter table "public"."approved_tools_catalog" validate constraint "approved_tools_catalog_status_check";

alter table "public"."approved_tools_catalog" add constraint "approved_tools_catalog_tool_id_fkey" FOREIGN KEY (tool_id) REFERENCES vendor_tools(id) not valid;

alter table "public"."approved_tools_catalog" validate constraint "approved_tools_catalog_tool_id_fkey";

alter table "public"."artifacts" add constraint "artifacts_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE not valid;

alter table "public"."artifacts" validate constraint "artifacts_assessment_id_fkey";

alter table "public"."artifacts" add constraint "artifacts_org_id_fkey" FOREIGN KEY (org_id) REFERENCES institutions(id) ON DELETE CASCADE not valid;

alter table "public"."artifacts" validate constraint "artifacts_org_id_fkey";

alter table "public"."artifacts" add constraint "valid_artifact_format" CHECK (((format)::text = ANY ((ARRAY['pdf'::character varying, 'docx'::character varying, 'pptx'::character varying])::text[]))) not valid;

alter table "public"."artifacts" validate constraint "valid_artifact_format";

alter table "public"."artifacts" add constraint "valid_artifact_type" CHECK (((type)::text = ANY ((ARRAY['gap-report'::character varying, 'policy-redline'::character varying, 'board-deck'::character varying])::text[]))) not valid;

alter table "public"."artifacts" validate constraint "valid_artifact_type";

alter table "public"."assessments" add constraint "assessments_org_id_fkey" FOREIGN KEY (org_id) REFERENCES institutions(id) ON DELETE CASCADE not valid;

alter table "public"."assessments" validate constraint "assessments_org_id_fkey";

alter table "public"."auth_password_setup_tokens" add constraint "auth_password_setup_tokens_token_key" UNIQUE using index "auth_password_setup_tokens_token_key";

alter table "public"."auth_password_setup_tokens" add constraint "auth_password_setup_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."auth_password_setup_tokens" validate constraint "auth_password_setup_tokens_user_id_fkey";

alter table "public"."blueprint_progress" add constraint "blueprint_progress_blueprint_id_key" UNIQUE using index "blueprint_progress_blueprint_id_key";

alter table "public"."compliance_evidence" add constraint "compliance_evidence_evidence_type_check" CHECK (((evidence_type)::text = ANY ((ARRAY['document'::character varying, 'policy'::character varying, 'assessment'::character varying, 'training'::character varying, 'system'::character varying, 'process'::character varying])::text[]))) not valid;

alter table "public"."compliance_evidence" validate constraint "compliance_evidence_evidence_type_check";

alter table "public"."compliance_evidence" add constraint "compliance_evidence_review_status_check" CHECK (((review_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'needs_revision'::character varying])::text[]))) not valid;

alter table "public"."compliance_evidence" validate constraint "compliance_evidence_review_status_check";

alter table "public"."compliance_evidence" add constraint "compliance_evidence_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_evidence" validate constraint "compliance_evidence_reviewed_by_fkey";

alter table "public"."compliance_evidence" add constraint "compliance_evidence_tracking_id_fkey" FOREIGN KEY (tracking_id) REFERENCES compliance_tracking(id) ON DELETE CASCADE not valid;

alter table "public"."compliance_evidence" validate constraint "compliance_evidence_tracking_id_fkey";

alter table "public"."compliance_evidence" add constraint "compliance_evidence_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_evidence" validate constraint "compliance_evidence_uploaded_by_fkey";

alter table "public"."compliance_findings" add constraint "compliance_findings_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_findings" validate constraint "compliance_findings_assigned_to_fkey";

alter table "public"."compliance_findings" add constraint "compliance_findings_finding_type_check" CHECK (((finding_type)::text = ANY ((ARRAY['gap'::character varying, 'risk'::character varying, 'non_compliance'::character varying, 'improvement'::character varying])::text[]))) not valid;

alter table "public"."compliance_findings" validate constraint "compliance_findings_finding_type_check";

alter table "public"."compliance_findings" add constraint "compliance_findings_identified_by_fkey" FOREIGN KEY (identified_by) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_findings" validate constraint "compliance_findings_identified_by_fkey";

alter table "public"."compliance_findings" add constraint "compliance_findings_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_findings" validate constraint "compliance_findings_resolved_by_fkey";

alter table "public"."compliance_findings" add constraint "compliance_findings_severity_check" CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."compliance_findings" validate constraint "compliance_findings_severity_check";

alter table "public"."compliance_findings" add constraint "compliance_findings_status_check" CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'accepted'::character varying, 'deferred'::character varying])::text[]))) not valid;

alter table "public"."compliance_findings" validate constraint "compliance_findings_status_check";

alter table "public"."compliance_findings" add constraint "compliance_findings_tracking_id_fkey" FOREIGN KEY (tracking_id) REFERENCES compliance_tracking(id) ON DELETE CASCADE not valid;

alter table "public"."compliance_findings" validate constraint "compliance_findings_tracking_id_fkey";

alter table "public"."compliance_frameworks" add constraint "compliance_frameworks_audience_check" CHECK (((audience)::text = ANY ((ARRAY['k12'::character varying, 'highered'::character varying, 'both'::character varying])::text[]))) not valid;

alter table "public"."compliance_frameworks" validate constraint "compliance_frameworks_audience_check";

alter table "public"."compliance_monitoring" add constraint "compliance_monitoring_compliance_score_check" CHECK (((compliance_score >= 0) AND (compliance_score <= 100))) not valid;

alter table "public"."compliance_monitoring" validate constraint "compliance_monitoring_compliance_score_check";

alter table "public"."compliance_monitoring" add constraint "compliance_monitoring_coppa_status_check" CHECK ((coppa_status = ANY (ARRAY['compliant'::text, 'minor_issues'::text, 'major_issues'::text, 'non_compliant'::text, 'not_applicable'::text]))) not valid;

alter table "public"."compliance_monitoring" validate constraint "compliance_monitoring_coppa_status_check";

alter table "public"."compliance_monitoring" add constraint "compliance_monitoring_ferpa_status_check" CHECK ((ferpa_status = ANY (ARRAY['compliant'::text, 'minor_issues'::text, 'major_issues'::text, 'non_compliant'::text, 'not_applicable'::text]))) not valid;

alter table "public"."compliance_monitoring" validate constraint "compliance_monitoring_ferpa_status_check";

alter table "public"."compliance_monitoring" add constraint "compliance_monitoring_monitoring_type_check" CHECK ((monitoring_type = ANY (ARRAY['scheduled'::text, 'incident_driven'::text, 'complaint_driven'::text, 'audit'::text]))) not valid;

alter table "public"."compliance_monitoring" validate constraint "compliance_monitoring_monitoring_type_check";

alter table "public"."compliance_monitoring" add constraint "compliance_monitoring_ppra_status_check" CHECK ((ppra_status = ANY (ARRAY['compliant'::text, 'minor_issues'::text, 'major_issues'::text, 'non_compliant'::text, 'not_applicable'::text]))) not valid;

alter table "public"."compliance_monitoring" validate constraint "compliance_monitoring_ppra_status_check";

alter table "public"."compliance_monitoring" add constraint "compliance_monitoring_tool_id_fkey" FOREIGN KEY (tool_id) REFERENCES approved_tools_catalog(id) ON DELETE CASCADE not valid;

alter table "public"."compliance_monitoring" validate constraint "compliance_monitoring_tool_id_fkey";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_assigned_to_fkey";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_completion_percentage_check" CHECK (((completion_percentage >= 0) AND (completion_percentage <= 100))) not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_completion_percentage_check";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_control_id_fkey" FOREIGN KEY (control_id) REFERENCES framework_controls(id) ON DELETE CASCADE not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_control_id_fkey";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_created_by_fkey";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_priority_check" CHECK (((priority)::text = ANY ((ARRAY['critical'::character varying, 'high'::character varying, 'medium'::character varying, 'low'::character varying])::text[]))) not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_priority_check";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_risk_level_check" CHECK (((risk_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))) not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_risk_level_check";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'review_needed'::character varying, 'completed'::character varying, 'flagged'::character varying, 'overdue'::character varying])::text[]))) not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_status_check";

alter table "public"."compliance_tracking" add constraint "compliance_tracking_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."compliance_tracking" validate constraint "compliance_tracking_updated_by_fkey";

alter table "public"."decision_briefs" add constraint "decision_briefs_document_status_check" CHECK ((document_status = ANY (ARRAY['draft'::text, 'review'::text, 'final'::text, 'archived'::text]))) not valid;

alter table "public"."decision_briefs" validate constraint "decision_briefs_document_status_check";

alter table "public"."decision_briefs" add constraint "decision_briefs_intake_form_id_fkey" FOREIGN KEY (intake_form_id) REFERENCES vendor_intake_forms(id) not valid;

alter table "public"."decision_briefs" validate constraint "decision_briefs_intake_form_id_fkey";

alter table "public"."decision_briefs" add constraint "decision_briefs_recommendation_check" CHECK ((recommendation = ANY (ARRAY['Approve'::text, 'Conditional Approval'::text, 'Reject'::text, 'Defer'::text]))) not valid;

alter table "public"."decision_briefs" validate constraint "decision_briefs_recommendation_check";

alter table "public"."decision_briefs" add constraint "decision_briefs_risk_assessment_id_fkey" FOREIGN KEY (risk_assessment_id) REFERENCES risk_assessments(id) ON DELETE CASCADE not valid;

alter table "public"."decision_briefs" validate constraint "decision_briefs_risk_assessment_id_fkey";

alter table "public"."document_analyses" add constraint "document_analyses_confidence_score_check" CHECK (((confidence_score >= 0) AND (confidence_score <= 100))) not valid;

alter table "public"."document_analyses" validate constraint "document_analyses_confidence_score_check";

alter table "public"."document_analyses" add constraint "document_analyses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."document_analyses" validate constraint "document_analyses_user_id_fkey";

alter table "public"."document_sections" add constraint "document_sections_document_id_fkey" FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE not valid;

alter table "public"."document_sections" validate constraint "document_sections_document_id_fkey";

alter table "public"."document_sections" add constraint "valid_section_type" CHECK (((section_type)::text = ANY ((ARRAY['governance'::character varying, 'risk'::character varying, 'instruction'::character varying, 'assessment'::character varying, 'data'::character varying, 'vendor'::character varying, 'accessibility'::character varying])::text[]))) not valid;

alter table "public"."document_sections" validate constraint "valid_section_type";

alter table "public"."documents" add constraint "documents_org_id_fkey" FOREIGN KEY (org_id) REFERENCES institutions(id) ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_org_id_fkey";

alter table "public"."documents" add constraint "valid_document_status" CHECK (((status)::text = ANY ((ARRAY['uploaded'::character varying, 'processed'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."documents" validate constraint "valid_document_status";

alter table "public"."framework_changes" add constraint "fk_framework_changes_framework" FOREIGN KEY (framework_id) REFERENCES framework_metadata(id) ON DELETE CASCADE not valid;

alter table "public"."framework_changes" validate constraint "fk_framework_changes_framework";

alter table "public"."framework_changes" add constraint "framework_changes_change_type_check" CHECK (((change_type)::text = ANY ((ARRAY['major'::character varying, 'minor'::character varying, 'patch'::character varying, 'hotfix'::character varying])::text[]))) not valid;

alter table "public"."framework_changes" validate constraint "framework_changes_change_type_check";

alter table "public"."framework_changes" add constraint "framework_changes_impact_level_check" CHECK (((impact_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."framework_changes" validate constraint "framework_changes_impact_level_check";

alter table "public"."framework_controls" add constraint "framework_controls_framework_id_fkey" FOREIGN KEY (framework_id) REFERENCES compliance_frameworks(id) ON DELETE CASCADE not valid;

alter table "public"."framework_controls" validate constraint "framework_controls_framework_id_fkey";

alter table "public"."framework_metadata" add constraint "framework_metadata_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'deprecated'::character varying, 'draft'::character varying])::text[]))) not valid;

alter table "public"."framework_metadata" validate constraint "framework_metadata_status_check";

alter table "public"."framework_monitoring_config" add constraint "fk_monitoring_config_framework" FOREIGN KEY (framework_id) REFERENCES framework_metadata(id) ON DELETE CASCADE not valid;

alter table "public"."framework_monitoring_config" validate constraint "fk_monitoring_config_framework";

alter table "public"."framework_monitoring_config" add constraint "framework_monitoring_config_framework_id_key" UNIQUE using index "framework_monitoring_config_framework_id_key";

alter table "public"."framework_monitoring_config" add constraint "framework_monitoring_config_impact_threshold_check" CHECK (((impact_threshold)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."framework_monitoring_config" validate constraint "framework_monitoring_config_impact_threshold_check";

alter table "public"."framework_scores" add constraint "framework_scores_assessment_id_fkey" FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE not valid;

alter table "public"."framework_scores" validate constraint "framework_scores_assessment_id_fkey";

alter table "public"."framework_scores" add constraint "framework_scores_assessment_id_framework_control_id_key" UNIQUE using index "framework_scores_assessment_id_framework_control_id_key";

alter table "public"."framework_scores" add constraint "valid_framework" CHECK (((framework)::text = ANY ((ARRAY['AIRIX'::character varying, 'AIRS'::character varying, 'AICS'::character varying, 'AIMS'::character varying, 'AIPS'::character varying, 'AIBS'::character varying])::text[]))) not valid;

alter table "public"."framework_scores" validate constraint "valid_framework";

alter table "public"."gap_analysis_results" add constraint "gap_analysis_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."gap_analysis_results" validate constraint "gap_analysis_results_user_id_fkey";

alter table "public"."implementation_roadmaps" add constraint "implementation_roadmaps_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."implementation_roadmaps" validate constraint "implementation_roadmaps_user_id_fkey";

alter table "public"."institution_memberships" add constraint "institution_memberships_institution_id_fkey" FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE not valid;

alter table "public"."institution_memberships" validate constraint "institution_memberships_institution_id_fkey";

alter table "public"."institution_memberships" add constraint "institution_memberships_institution_id_user_id_key" UNIQUE using index "institution_memberships_institution_id_user_id_key";

alter table "public"."institution_memberships" add constraint "institution_memberships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."institution_memberships" validate constraint "institution_memberships_user_id_fkey";

alter table "public"."institutions" add constraint "institutions_owner_user_id_fkey" FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."institutions" validate constraint "institutions_owner_user_id_fkey";

alter table "public"."institutions" add constraint "institutions_slug_key" UNIQUE using index "institutions_slug_key";

alter table "public"."pii_detections" add constraint "pii_detections_document_id_fkey" FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE not valid;

alter table "public"."pii_detections" validate constraint "pii_detections_document_id_fkey";

alter table "public"."policy_control_mappings" add constraint "policy_control_mappings_control_id_fkey" FOREIGN KEY (control_id) REFERENCES framework_controls(id) ON DELETE CASCADE not valid;

alter table "public"."policy_control_mappings" validate constraint "policy_control_mappings_control_id_fkey";

alter table "public"."policy_control_mappings" add constraint "policy_control_mappings_coverage_percentage_check" CHECK (((coverage_percentage >= 0) AND (coverage_percentage <= 100))) not valid;

alter table "public"."policy_control_mappings" validate constraint "policy_control_mappings_coverage_percentage_check";

alter table "public"."policy_control_mappings" add constraint "policy_control_mappings_mapped_by_fkey" FOREIGN KEY (mapped_by) REFERENCES auth.users(id) not valid;

alter table "public"."policy_control_mappings" validate constraint "policy_control_mappings_mapped_by_fkey";

alter table "public"."policy_control_mappings" add constraint "policy_control_mappings_mapping_strength_check" CHECK (((mapping_strength)::text = ANY ((ARRAY['full'::character varying, 'partial'::character varying, 'related'::character varying])::text[]))) not valid;

alter table "public"."policy_control_mappings" validate constraint "policy_control_mappings_mapping_strength_check";

alter table "public"."policy_redline_packs" add constraint "fk_redline_packs_change" FOREIGN KEY (framework_change_id) REFERENCES framework_changes(id) ON DELETE CASCADE not valid;

alter table "public"."policy_redline_packs" validate constraint "fk_redline_packs_change";

alter table "public"."policy_redline_packs" add constraint "policy_redline_packs_generated_by_check" CHECK (((generated_by)::text = ANY ((ARRAY['system'::character varying, 'manual'::character varying])::text[]))) not valid;

alter table "public"."policy_redline_packs" validate constraint "policy_redline_packs_generated_by_check";

alter table "public"."policy_redline_packs" add constraint "policy_redline_packs_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'sent_for_approval'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."policy_redline_packs" validate constraint "policy_redline_packs_status_check";

alter table "public"."policy_update_job_logs" add constraint "policy_update_job_logs_job_id_key" UNIQUE using index "policy_update_job_logs_job_id_key";

alter table "public"."policy_update_notifications" add constraint "fk_policy_notifications_change" FOREIGN KEY (framework_change_id) REFERENCES framework_changes(id) ON DELETE CASCADE not valid;

alter table "public"."policy_update_notifications" validate constraint "fk_policy_notifications_change";

alter table "public"."policy_update_notifications" add constraint "fk_policy_notifications_redline" FOREIGN KEY (redline_pack_id) REFERENCES policy_redline_packs(id) ON DELETE CASCADE not valid;

alter table "public"."policy_update_notifications" validate constraint "fk_policy_notifications_redline";

alter table "public"."policy_update_notifications" add constraint "policy_update_notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['redline_generated'::character varying, 'approval_required'::character varying, 'framework_updated'::character varying])::text[]))) not valid;

alter table "public"."policy_update_notifications" validate constraint "policy_update_notifications_type_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_approval_recommendation_check" CHECK ((approval_recommendation = ANY (ARRAY['approve'::text, 'conditional_approval'::text, 'reject'::text, 'needs_more_info'::text]))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_approval_recommendation_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_assessment_type_check" CHECK ((assessment_type = ANY (ARRAY['initial'::text, 'annual'::text, 'incident'::text, 'change_request'::text]))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_assessment_type_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_compliance_risk_score_check" CHECK (((compliance_risk_score >= 0) AND (compliance_risk_score <= 100))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_compliance_risk_score_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_financial_risk_score_check" CHECK (((financial_risk_score >= 0) AND (financial_risk_score <= 100))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_financial_risk_score_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_intake_form_id_fkey" FOREIGN KEY (intake_form_id) REFERENCES vendor_intake_forms(id) ON DELETE CASCADE not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_intake_form_id_fkey";

alter table "public"."risk_assessments" add constraint "risk_assessments_operational_risk_score_check" CHECK (((operational_risk_score >= 0) AND (operational_risk_score <= 100))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_operational_risk_score_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_overall_risk_score_check" CHECK (((overall_risk_score >= 0) AND (overall_risk_score <= 100))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_overall_risk_score_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_pedagogical_risk_score_check" CHECK (((pedagogical_risk_score >= 0) AND (pedagogical_risk_score <= 100))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_pedagogical_risk_score_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_privacy_risk_score_check" CHECK (((privacy_risk_score >= 0) AND (privacy_risk_score <= 100))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_privacy_risk_score_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_risk_level_check" CHECK ((risk_level = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text, 'Critical'::text]))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_risk_level_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_security_risk_score_check" CHECK (((security_risk_score >= 0) AND (security_risk_score <= 100))) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_security_risk_score_check";

alter table "public"."risk_assessments" add constraint "risk_assessments_tool_id_fkey" FOREIGN KEY (tool_id) REFERENCES vendor_tools(id) not valid;

alter table "public"."risk_assessments" validate constraint "risk_assessments_tool_id_fkey";

alter table "public"."streamlined_assessment_responses" add constraint "streamlined_assessment_responses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."streamlined_assessment_responses" validate constraint "streamlined_assessment_responses_user_id_fkey";

alter table "public"."team_members" add constraint "team_members_role_check" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'contributor'::character varying, 'reviewer'::character varying, 'viewer'::character varying])::text[]))) not valid;

alter table "public"."team_members" validate constraint "team_members_role_check";

alter table "public"."team_members" add constraint "team_members_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE not valid;

alter table "public"."team_members" validate constraint "team_members_team_id_fkey";

alter table "public"."team_members" add constraint "team_members_team_id_user_id_key" UNIQUE using index "team_members_team_id_user_id_key";

alter table "public"."team_members" add constraint "team_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."team_members" validate constraint "team_members_user_id_fkey";

alter table "public"."teams" add constraint "teams_audience_check" CHECK (((audience)::text = ANY ((ARRAY['k12'::character varying, 'highered'::character varying, 'both'::character varying])::text[]))) not valid;

alter table "public"."teams" validate constraint "teams_audience_check";

alter table "public"."uploaded_documents" add constraint "uploaded_documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."uploaded_documents" validate constraint "uploaded_documents_user_id_fkey";

alter table "public"."usage_analytics" add constraint "usage_analytics_period_type_check" CHECK ((period_type = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'quarterly'::text]))) not valid;

alter table "public"."usage_analytics" validate constraint "usage_analytics_period_type_check";

alter table "public"."usage_analytics" add constraint "usage_analytics_tool_id_analytics_date_period_type_key" UNIQUE using index "usage_analytics_tool_id_analytics_date_period_type_key";

alter table "public"."usage_analytics" add constraint "usage_analytics_tool_id_fkey" FOREIGN KEY (tool_id) REFERENCES approved_tools_catalog(id) ON DELETE CASCADE not valid;

alter table "public"."usage_analytics" validate constraint "usage_analytics_tool_id_fkey";

alter table "public"."user_activity_log" add constraint "user_activity_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_activity_log" validate constraint "user_activity_log_user_id_fkey";

alter table "public"."user_payments" add constraint "user_payments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_payments" validate constraint "user_payments_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_institution_id_fkey" FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_institution_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_institution_size_check" CHECK ((institution_size = ANY (ARRAY['Small'::text, 'Medium'::text, 'Large'::text, 'Extra Large'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_institution_size_check";

alter table "public"."user_profiles" add constraint "user_profiles_institution_type_check" CHECK ((institution_type = ANY (ARRAY['K12'::text, 'HigherEd'::text, 'District'::text, 'University'::text, 'Community College'::text, 'Trade School'::text, 'default'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_institution_type_check";

alter table "public"."user_profiles" add constraint "user_profiles_preferred_mode_check" CHECK ((preferred_mode = ANY (ARRAY['quick'::text, 'comprehensive'::text, 'full'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_preferred_mode_check";

alter table "public"."user_profiles" add constraint "user_profiles_subscription_status_check" CHECK ((subscription_status = ANY (ARRAY['active'::text, 'inactive'::text, 'trial'::text, 'expired'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_subscription_status_check";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_key" UNIQUE using index "user_profiles_user_id_key";

alter table "public"."vendor_assessments" add constraint "vendor_assessments_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES vendor_intakes(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_assessments" validate constraint "vendor_assessments_vendor_id_fkey";

alter table "public"."vendor_assessments" add constraint "vendor_assessments_vendor_id_section_question_id_key" UNIQUE using index "vendor_assessments_vendor_id_section_question_id_key";

alter table "public"."vendor_audit_logs" add constraint "vendor_audit_logs_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES vendor_intakes(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_audit_logs" validate constraint "vendor_audit_logs_vendor_id_fkey";

alter table "public"."vendor_control_dependencies" add constraint "vendor_control_dependencies_control_id_fkey" FOREIGN KEY (control_id) REFERENCES framework_controls(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_control_dependencies" validate constraint "vendor_control_dependencies_control_id_fkey";

alter table "public"."vendor_control_dependencies" add constraint "vendor_control_dependencies_dependency_type_check" CHECK (((dependency_type)::text = ANY ((ARRAY['required'::character varying, 'supporting'::character varying, 'alternative'::character varying])::text[]))) not valid;

alter table "public"."vendor_control_dependencies" validate constraint "vendor_control_dependencies_dependency_type_check";

alter table "public"."vendor_control_dependencies" add constraint "vendor_control_dependencies_risk_impact_check" CHECK (((risk_impact)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."vendor_control_dependencies" validate constraint "vendor_control_dependencies_risk_impact_check";

alter table "public"."vendor_data_flows" add constraint "vendor_data_flows_flow_type_check" CHECK (((flow_type)::text = ANY ((ARRAY['inbound'::character varying, 'outbound'::character varying, 'bidirectional'::character varying, 'none'::character varying])::text[]))) not valid;

alter table "public"."vendor_data_flows" validate constraint "vendor_data_flows_flow_type_check";

alter table "public"."vendor_data_flows" add constraint "vendor_data_flows_frequency_check" CHECK (((frequency)::text = ANY ((ARRAY['real-time'::character varying, 'daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'on-demand'::character varying])::text[]))) not valid;

alter table "public"."vendor_data_flows" validate constraint "vendor_data_flows_frequency_check";

alter table "public"."vendor_data_flows" add constraint "vendor_data_flows_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES vendor_intakes(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_data_flows" validate constraint "vendor_data_flows_vendor_id_fkey";

alter table "public"."vendor_data_flows" add constraint "vendor_data_flows_volume_check" CHECK (((volume)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))) not valid;

alter table "public"."vendor_data_flows" validate constraint "vendor_data_flows_volume_check";

alter table "public"."vendor_decision_briefs" add constraint "vendor_decision_briefs_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES vendor_intakes(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_decision_briefs" validate constraint "vendor_decision_briefs_vendor_id_fkey";

alter table "public"."vendor_intake_forms" add constraint "vendor_intake_forms_priority_level_check" CHECK ((priority_level = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))) not valid;

alter table "public"."vendor_intake_forms" validate constraint "vendor_intake_forms_priority_level_check";

alter table "public"."vendor_intake_forms" add constraint "vendor_intake_forms_review_status_check" CHECK ((review_status = ANY (ARRAY['submitted'::text, 'assigned'::text, 'screening'::text, 'risk_assessment'::text, 'security_review'::text, 'privacy_review'::text, 'compliance_check'::text, 'board_review'::text, 'approved'::text, 'conditional'::text, 'rejected'::text, 'on_hold'::text]))) not valid;

alter table "public"."vendor_intake_forms" validate constraint "vendor_intake_forms_review_status_check";

alter table "public"."vendor_intakes" add constraint "vendor_intakes_requested_urgency_check" CHECK (((requested_urgency)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))) not valid;

alter table "public"."vendor_intakes" validate constraint "vendor_intakes_requested_urgency_check";

alter table "public"."vendor_intakes" add constraint "vendor_intakes_risk_level_check" CHECK (((risk_level)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."vendor_intakes" validate constraint "vendor_intakes_risk_level_check";

alter table "public"."vendor_intakes" add constraint "vendor_intakes_risk_score_check" CHECK (((risk_score >= 0) AND (risk_score <= 100))) not valid;

alter table "public"."vendor_intakes" validate constraint "vendor_intakes_risk_score_check";

alter table "public"."vendor_intakes" add constraint "vendor_intakes_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'under_review'::character varying, 'approved'::character varying, 'rejected'::character varying, 'conditional'::character varying])::text[]))) not valid;

alter table "public"."vendor_intakes" validate constraint "vendor_intakes_status_check";

alter table "public"."vendor_mitigations" add constraint "vendor_mitigations_mitigation_type_check" CHECK (((mitigation_type)::text = ANY ((ARRAY['technical'::character varying, 'procedural'::character varying, 'contractual'::character varying, 'policy'::character varying])::text[]))) not valid;

alter table "public"."vendor_mitigations" validate constraint "vendor_mitigations_mitigation_type_check";

alter table "public"."vendor_mitigations" add constraint "vendor_mitigations_risk_flag_check" CHECK (((risk_flag)::text = ANY ((ARRAY['FERPA'::character varying, 'COPPA'::character varying, 'PPRA'::character varying, 'GDPR'::character varying, 'CCPA'::character varying, 'SOX'::character varying, 'HIPAA'::character varying])::text[]))) not valid;

alter table "public"."vendor_mitigations" validate constraint "vendor_mitigations_risk_flag_check";

alter table "public"."vendor_mitigations" add constraint "vendor_mitigations_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'implemented'::character varying, 'verified'::character varying])::text[]))) not valid;

alter table "public"."vendor_mitigations" validate constraint "vendor_mitigations_status_check";

alter table "public"."vendor_mitigations" add constraint "vendor_mitigations_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES vendor_intakes(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_mitigations" validate constraint "vendor_mitigations_vendor_id_fkey";

alter table "public"."vendor_profiles" add constraint "vendor_profiles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."vendor_profiles" validate constraint "vendor_profiles_created_by_fkey";

alter table "public"."vendor_profiles" add constraint "vendor_profiles_review_status_check" CHECK ((review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'conditional'::text, 'rejected'::text, 'suspended'::text]))) not valid;

alter table "public"."vendor_profiles" validate constraint "vendor_profiles_review_status_check";

alter table "public"."vendor_profiles" add constraint "vendor_profiles_risk_score_check" CHECK (((risk_score >= 0) AND (risk_score <= 100))) not valid;

alter table "public"."vendor_profiles" validate constraint "vendor_profiles_risk_score_check";

alter table "public"."vendor_profiles" add constraint "vendor_profiles_size_category_check" CHECK ((size_category = ANY (ARRAY['Startup'::text, 'SMB'::text, 'Enterprise'::text, 'PublicCompany'::text]))) not valid;

alter table "public"."vendor_profiles" validate constraint "vendor_profiles_size_category_check";

alter table "public"."vendor_profiles" add constraint "vendor_profiles_trust_level_check" CHECK ((trust_level = ANY (ARRAY['unverified'::text, 'basic'::text, 'verified'::text, 'trusted'::text, 'preferred'::text]))) not valid;

alter table "public"."vendor_profiles" validate constraint "vendor_profiles_trust_level_check";

alter table "public"."vendor_profiles" add constraint "vendor_profiles_vendor_name_key" UNIQUE using index "vendor_profiles_vendor_name_key";

alter table "public"."vendor_tools" add constraint "vendor_tools_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'conditional'::text, 'rejected'::text, 'deprecated'::text]))) not valid;

alter table "public"."vendor_tools" validate constraint "vendor_tools_status_check";

alter table "public"."vendor_tools" add constraint "vendor_tools_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_tools" validate constraint "vendor_tools_vendor_id_fkey";

alter table "public"."vendor_tools" add constraint "vendor_tools_vendor_id_tool_name_key" UNIQUE using index "vendor_tools_vendor_id_tool_name_key";

alter table "public"."vendor_vetting_audit" add constraint "vendor_vetting_audit_action_type_check" CHECK ((action_type = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text, 'approve'::text, 'reject'::text, 'suspend'::text, 'reactivate'::text, 'review'::text]))) not valid;

alter table "public"."vendor_vetting_audit" validate constraint "vendor_vetting_audit_action_type_check";

alter table "public"."vendor_vetting_audit" add constraint "vendor_vetting_audit_entity_type_check" CHECK ((entity_type = ANY (ARRAY['vendor_profile'::text, 'vendor_tool'::text, 'intake_form'::text, 'risk_assessment'::text, 'decision_brief'::text, 'approved_tool'::text, 'compliance_monitoring'::text]))) not valid;

alter table "public"."vendor_vetting_audit" validate constraint "vendor_vetting_audit_entity_type_check";

alter table "public"."vendor_vetting_audit" add constraint "vendor_vetting_audit_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."vendor_vetting_audit" validate constraint "vendor_vetting_audit_user_id_fkey";

alter table "public"."user_payments" add constraint "user_payments_role_check" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'contributor'::character varying, 'reviewer'::character varying, 'viewer'::character varying])::text[]))) not valid;

alter table "public"."user_payments" validate constraint "user_payments_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_audit_trail()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_by_email(email_input text)
 RETURNS TABLE(id uuid, email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email
  FROM auth.users au
  WHERE au.email = email_input
  LIMIT 1;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_vendor_compliance_report()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW vendor_compliance_report;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_ai_readiness_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_approval_approvers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_approval_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_profile_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create or replace view "public"."user_profile_with_institution" as  SELECT up.id,
    up.user_id,
    up.full_name,
    up.email,
    up.phone,
    up.job_title,
    up.department,
    up.institution_id,
    up.institution_name,
    up.institution_type,
    up.institution_size,
    up.student_count,
    up.faculty_count,
    up.staff_count,
    up.annual_budget,
    up.city,
    up.state,
    up.country,
    up.timezone,
    up.preferred_mode,
    up.assessment_context,
    up.onboarding_completed,
    up.onboarding_step,
    up.onboarding_data,
    up.subscription_tier,
    up.subscription_status,
    up.trial_ends_at,
    up.created_at,
    up.updated_at,
    up.last_login_at,
    up.preferences,
    up.metadata,
    i.name AS institution_full_name,
    i.slug AS institution_slug,
    i.org_type AS institution_org_type,
    i.headcount AS institution_headcount,
    i.budget AS institution_budget
   FROM (user_profiles up
     LEFT JOIN institutions i ON ((up.institution_id = i.id)));


create materialized view "public"."vendor_compliance_report" as  SELECT date_trunc('month'::text, created_at) AS month,
    status,
    risk_level,
    count(*) AS vendor_count,
    avg(risk_score) AS avg_risk_score,
    sum(
        CASE
            WHEN ((risk_flags)::text ~~ '%FERPA%'::text) THEN 1
            ELSE 0
        END) AS ferpa_flagged,
    sum(
        CASE
            WHEN ((risk_flags)::text ~~ '%COPPA%'::text) THEN 1
            ELSE 0
        END) AS coppa_flagged,
    sum(
        CASE
            WHEN ((risk_flags)::text ~~ '%PPRA%'::text) THEN 1
            ELSE 0
        END) AS ppra_flagged,
    avg((EXTRACT(epoch FROM (decision_approved_at - created_at)) / (86400)::numeric)) AS avg_decision_days
   FROM vendor_intakes vi
  WHERE (created_at >= (date_trunc('year'::text, now()) - '2 years'::interval))
  GROUP BY (date_trunc('month'::text, created_at)), status, risk_level
  ORDER BY (date_trunc('month'::text, created_at)) DESC, status, risk_level;


CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_events(retention_days integer DEFAULT 365)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_events 
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_community_stats(target_audience text DEFAULT NULL::text)
 RETURNS TABLE(total_join_requests bigint, pending_requests bigint, successful_joins bigint, join_rate numeric, requests_by_audience jsonb, recent_activity jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_expert_session_stats(target_audience text DEFAULT NULL::text)
 RETURNS TABLE(total_bookings bigint, confirmed_bookings bigint, completed_sessions bigint, total_revenue numeric, average_rating numeric, bookings_by_audience jsonb, popular_sessions jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_analytics_summary()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_summary;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create policy "Anyone can read AI policy templates"
on "public"."ai_policy_templates"
as permissive
for select
to public
using (true);


create policy "Allow anonymous AI readiness submissions"
on "public"."ai_readiness_assessments"
as permissive
for insert
to public
with check (true);


create policy "Users can read own AI readiness assessments"
on "public"."ai_readiness_assessments"
as permissive
for select
to public
using (((auth.uid() IS NULL) OR (user_id IS NULL) OR (user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM ai_readiness_team_members
  WHERE ((ai_readiness_team_members.assessment_id = ai_readiness_assessments.id) AND (ai_readiness_team_members.user_id = auth.uid()))))));


create policy "Users can update own AI readiness assessments"
on "public"."ai_readiness_assessments"
as permissive
for update
to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM ai_readiness_team_members
  WHERE ((ai_readiness_team_members.assessment_id = ai_readiness_assessments.id) AND (ai_readiness_team_members.user_id = auth.uid()))))));


create policy "Users can read own AI payments"
on "public"."ai_readiness_payments"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM ai_readiness_assessments
  WHERE ((ai_readiness_assessments.id = ai_readiness_payments.assessment_id) AND (ai_readiness_assessments.user_id = auth.uid())))));


create policy "Team members can read team info"
on "public"."ai_readiness_team_members"
as permissive
for select
to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM ai_readiness_teams
  WHERE ((ai_readiness_teams.id = ai_readiness_team_members.team_id) AND (ai_readiness_teams.created_by = auth.uid()))))));


create policy "Team creators can manage teams"
on "public"."ai_readiness_teams"
as permissive
for all
to public
using ((created_by = auth.uid()));


create policy "Approvers can update their own decisions"
on "public"."approval_approvers"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Only approval creators can manage approvers"
on "public"."approval_approvers"
as permissive
for all
to public
using ((approval_id IN ( SELECT approvals.id
   FROM approvals
  WHERE (approvals.created_by = auth.uid()))));


create policy "Users can view approver info for their approvals"
on "public"."approval_approvers"
as permissive
for select
to public
using ((approval_id IN ( SELECT approvals.id
   FROM approvals
  WHERE ((approvals.created_by = auth.uid()) OR (approvals.id IN ( SELECT approval_approvers_1.approval_id
           FROM approval_approvers approval_approvers_1
          WHERE (approval_approvers_1.user_id = auth.uid())))))));


create policy "System can create audit logs"
on "public"."approval_audit_logs"
as permissive
for insert
to public
with check (true);


create policy "Users can view audit logs for their approvals"
on "public"."approval_audit_logs"
as permissive
for select
to public
using ((approval_id IN ( SELECT approvals.id
   FROM approvals
  WHERE ((approvals.created_by = auth.uid()) OR (approvals.id IN ( SELECT approval_approvers.approval_id
           FROM approval_approvers
          WHERE (approval_approvers.user_id = auth.uid())))))));


create policy "Users can add comments to their approvals"
on "public"."approval_comments"
as permissive
for insert
to public
with check (((user_id = auth.uid()) AND (approval_id IN ( SELECT approvals.id
   FROM approvals
  WHERE ((approvals.created_by = auth.uid()) OR (approvals.id IN ( SELECT approval_approvers.approval_id
           FROM approval_approvers
          WHERE (approval_approvers.user_id = auth.uid()))))))));


create policy "Users can view comments for their approvals"
on "public"."approval_comments"
as permissive
for select
to public
using ((approval_id IN ( SELECT approvals.id
   FROM approvals
  WHERE ((approvals.created_by = auth.uid()) OR (approvals.id IN ( SELECT approval_approvers.approval_id
           FROM approval_approvers
          WHERE (approval_approvers.user_id = auth.uid())))))));


create policy "Users can add events to their approvals"
on "public"."approval_events"
as permissive
for insert
to public
with check (((who = auth.uid()) AND (approval_id IN ( SELECT approvals.id
   FROM approvals
  WHERE ((approvals.created_by = auth.uid()) OR (approvals.id IN ( SELECT approval_approvers.approval_id
           FROM approval_approvers
          WHERE (approval_approvers.user_id = auth.uid()))))))));


create policy "Users can view events for their approvals"
on "public"."approval_events"
as permissive
for select
to public
using ((approval_id IN ( SELECT approvals.id
   FROM approvals
  WHERE ((approvals.created_by = auth.uid()) OR (approvals.id IN ( SELECT approval_approvers.approval_id
           FROM approval_approvers
          WHERE (approval_approvers.user_id = auth.uid())))))));


create policy "System can create notifications"
on "public"."approval_notifications"
as permissive
for insert
to public
with check (true);


create policy "Users can view their notifications"
on "public"."approval_notifications"
as permissive
for select
to public
using ((recipient_id = auth.uid()));


create policy "Only creators can update approval metadata"
on "public"."approvals"
as permissive
for update
to public
using ((auth.uid() = created_by));


create policy "Users can create approvals"
on "public"."approvals"
as permissive
for insert
to public
with check ((auth.uid() = created_by));


create policy "Users can view approvals they created or are approvers for"
on "public"."approvals"
as permissive
for select
to public
using (((auth.uid() = created_by) OR (auth.uid() IN ( SELECT approval_approvers.user_id
   FROM approval_approvers
  WHERE (approval_approvers.approval_id = approvals.id)))));


create policy "Users can view approved tools"
on "public"."approved_tools_catalog"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Artifacts access by org membership"
on "public"."artifacts"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM institution_memberships im
  WHERE ((im.institution_id = artifacts.org_id) AND (im.user_id = auth.uid()) AND (im.active = true)))));


create policy "Enable read for authenticated users"
on "public"."assessment_metrics"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Assessments access by org membership"
on "public"."assessments"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM institution_memberships im
  WHERE ((im.institution_id = assessments.org_id) AND (im.user_id = auth.uid()) AND (im.active = true)))));


create policy "service role only"
on "public"."auth_password_setup_tokens"
as permissive
for all
to service_role
using (true);


create policy "user can view own valid token"
on "public"."auth_password_setup_tokens"
as permissive
for select
to authenticated
using (((auth.uid() = user_id) AND (used_at IS NULL) AND (expires_at > now())));


create policy "Users can delete own document analyses"
on "public"."document_analyses"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can insert own document analyses"
on "public"."document_analyses"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own document analyses"
on "public"."document_analyses"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own document analyses"
on "public"."document_analyses"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Sections access by document ownership"
on "public"."document_sections"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM (documents d
     JOIN institution_memberships im ON ((im.institution_id = d.org_id)))
  WHERE ((d.id = document_sections.document_id) AND (im.user_id = auth.uid()) AND (im.active = true)))));


create policy "Documents access by org membership"
on "public"."documents"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM institution_memberships im
  WHERE ((im.institution_id = documents.org_id) AND (im.user_id = auth.uid()) AND (im.active = true)))));


create policy "Enable read for authenticated users"
on "public"."enterprise_algorithm_changelog"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "select-own"
on "public"."enterprise_algorithm_results"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "service-role-full-access"
on "public"."enterprise_algorithm_results"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text))
with check ((auth.role() = 'service_role'::text));


create policy "Framework scores access by assessment ownership"
on "public"."framework_scores"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM (assessments a
     JOIN institution_memberships im ON ((im.institution_id = a.org_id)))
  WHERE ((a.id = framework_scores.assessment_id) AND (im.user_id = auth.uid()) AND (im.active = true)))));


create policy "Users can view own gap analysis"
on "public"."gap_analysis_results"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can view own roadmaps"
on "public"."implementation_roadmaps"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Admins can delete memberships"
on "public"."institution_memberships"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM institution_memberships im
  WHERE ((im.user_id = auth.uid()) AND (im.institution_id = institution_memberships.institution_id) AND (im.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))));


create policy "Admins can modify memberships"
on "public"."institution_memberships"
as permissive
for update
to public
using (((auth.uid() IS NOT NULL) AND ((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM institution_memberships im
  WHERE ((im.user_id = auth.uid()) AND (im.institution_id = institution_memberships.institution_id) AND (im.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))));


create policy "Enable read for authenticated users"
on "public"."institution_memberships"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Users can create their own membership"
on "public"."institution_memberships"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())));


create policy "Admins can update institutions"
on "public"."institutions"
as permissive
for update
to public
using (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM institution_memberships im
  WHERE ((im.user_id = auth.uid()) AND (im.institution_id = institutions.id) AND (im.role = ANY (ARRAY['admin'::text, 'super_admin'::text])))))));


create policy "Enable read for authenticated users"
on "public"."institutions"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Super admins can delete institutions"
on "public"."institutions"
as permissive
for delete
to public
using (((auth.uid() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM auth.users u
  WHERE ((u.id = auth.uid()) AND ((u.raw_user_meta_data ->> 'role'::text) = 'super_admin'::text))))));


create policy "Users can create institutions"
on "public"."institutions"
as permissive
for insert
to public
with check ((auth.uid() IS NOT NULL));


create policy "Users can read institutions"
on "public"."institutions"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Users can read their institutions"
on "public"."institutions"
as permissive
for select
to public
using (((auth.uid() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM institution_memberships im
  WHERE ((im.user_id = auth.uid()) AND (im.institution_id = institutions.id)))) OR (auth.uid() IS NOT NULL))));


create policy "PII access by document ownership"
on "public"."pii_detections"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM (documents d
     JOIN institution_memberships im ON ((im.institution_id = d.org_id)))
  WHERE ((d.id = pii_detections.document_id) AND (im.user_id = auth.uid()) AND (im.active = true)))));


create policy "Reviewers can manage risk assessments"
on "public"."risk_assessments"
as permissive
for all
to public
using (((auth.jwt() ->> 'user_role'::text) = ANY (ARRAY['admin'::text, 'privacy_officer'::text, 'technology_director'::text, 'reviewer'::text])));


create policy "Users can view own assessment responses"
on "public"."streamlined_assessment_responses"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can view own documents"
on "public"."uploaded_documents"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can view own activity"
on "public"."user_activity_log"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Service role can manage all payment records"
on "public"."user_payments"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text));


create policy "Users can claim unlinked payment"
on "public"."user_payments"
as permissive
for update
to public
using (((user_id IS NULL) AND (lower((email)::text) = lower((auth.jwt() ->> 'email'::text)))))
with check ((auth.uid() = user_id));


create policy "Users can view user_payments (owned or unlinked email)"
on "public"."user_payments"
as permissive
for select
to public
using (((auth.uid() = user_id) OR ((user_id IS NULL) AND (lower((email)::text) = lower((auth.jwt() ->> 'email'::text))))));


create policy "Users can create their own profile"
on "public"."user_profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own profile"
on "public"."user_profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own profile"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can submit intake forms"
on "public"."vendor_intake_forms"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Users can view their own intake forms"
on "public"."vendor_intake_forms"
as permissive
for select
to public
using (((auth.role() = 'authenticated'::text) AND ((auth.email() = submitter_email) OR ((auth.jwt() ->> 'user_role'::text) = ANY (ARRAY['admin'::text, 'privacy_officer'::text, 'technology_director'::text])))));


create policy "Authorized users can update vendor intakes"
on "public"."vendor_intakes"
as permissive
for update
to public
using ((((created_by)::text = current_setting('app.user_id'::text, true)) OR (current_setting('app.user_role'::text, true) = ANY (ARRAY['admin'::text, 'compliance_officer'::text, 'security_lead'::text]))));


create policy "Users can create vendor intakes"
on "public"."vendor_intakes"
as permissive
for insert
to public
with check (((created_by)::text = current_setting('app.user_id'::text, true)));


create policy "Users can view vendor intakes they created or are assigned to r"
on "public"."vendor_intakes"
as permissive
for select
to public
using ((((created_by)::text = current_setting('app.user_id'::text, true)) OR ((reviewed_by)::text = current_setting('app.user_id'::text, true)) OR (current_setting('app.user_role'::text, true) = ANY (ARRAY['admin'::text, 'compliance_officer'::text, 'security_lead'::text]))));


create policy "Users can view mitigations for accessible vendors"
on "public"."vendor_mitigations"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM vendor_intakes v
  WHERE ((v.id = vendor_mitigations.vendor_id) AND (((v.created_by)::text = current_setting('app.user_id'::text, true)) OR ((v.reviewed_by)::text = current_setting('app.user_id'::text, true)) OR (current_setting('app.user_role'::text, true) = ANY (ARRAY['admin'::text, 'compliance_officer'::text, 'security_lead'::text])))))));


create policy "Admins can manage vendor vetting"
on "public"."vendor_profiles"
as permissive
for all
to public
using (((auth.jwt() ->> 'user_role'::text) = ANY (ARRAY['admin'::text, 'privacy_officer'::text, 'technology_director'::text])));


create policy "Admins can manage vendor tools"
on "public"."vendor_tools"
as permissive
for all
to public
using (((auth.jwt() ->> 'user_role'::text) = ANY (ARRAY['admin'::text, 'privacy_officer'::text, 'technology_director'::text])));


CREATE TRIGGER update_ai_readiness_assessments_updated_at BEFORE UPDATE ON public.ai_readiness_assessments FOR EACH ROW EXECUTE FUNCTION update_ai_readiness_updated_at();

CREATE TRIGGER trigger_update_approval_approvers_updated_at BEFORE UPDATE ON public.approval_approvers FOR EACH ROW EXECUTE FUNCTION update_approval_approvers_updated_at();

CREATE TRIGGER trigger_update_approval_updated_at BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();

CREATE TRIGGER update_approved_tool_catalog_updated_at BEFORE UPDATE ON public.approved_tool_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_approved_tools_catalog AFTER INSERT OR DELETE OR UPDATE ON public.approved_tools_catalog FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

CREATE TRIGGER update_approved_tools_catalog_updated_at BEFORE UPDATE ON public.approved_tools_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frameworks_updated_at BEFORE UPDATE ON public.compliance_frameworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_monitoring_updated_at BEFORE UPDATE ON public.compliance_monitoring FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracking_updated_at BEFORE UPDATE ON public.compliance_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_decision_briefs AFTER INSERT OR DELETE OR UPDATE ON public.decision_briefs FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

CREATE TRIGGER update_decision_briefs_updated_at BEFORE UPDATE ON public.decision_briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER enterprise_algorithm_results_set_updated_at BEFORE UPDATE ON public.enterprise_algorithm_results FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER audit_risk_assessments AFTER INSERT OR DELETE OR UPDATE ON public.risk_assessments FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON public.risk_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_analytics_updated_at BEFORE UPDATE ON public.usage_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_payments_updated_at BEFORE UPDATE ON public.user_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_timestamp BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_user_profile_timestamp();

CREATE TRIGGER update_vendor_intake_forms_updated_at BEFORE UPDATE ON public.vendor_intake_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_intakes_updated_at BEFORE UPDATE ON public.vendor_intakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_mitigations_updated_at BEFORE UPDATE ON public.vendor_mitigations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_vendor_profiles AFTER INSERT OR DELETE OR UPDATE ON public.vendor_profiles FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON public.vendor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_vendor_tools AFTER INSERT OR DELETE OR UPDATE ON public.vendor_tools FOR EACH ROW EXECUTE FUNCTION create_audit_trail();

CREATE TRIGGER update_vendor_tools_updated_at BEFORE UPDATE ON public.vendor_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER on_auth_user_created_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_user_profile();


