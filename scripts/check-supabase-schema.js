#!/usr/bin/env node

/**
 * Comprehensive Supabase schema verifier.
 *
 * Usage: node scripts/check-supabase-schema.js
 *
 * The script parses the latest schema dump (supabase-schema-*.sql)
 * and validates that every application-critical table and column exists.
 */

const fs = require('fs');
const path = require('path');

const WORKDIR = process.cwd();

function findLatestSchemaDump() {
    const files = fs.readdirSync(WORKDIR)
        .filter((file) => file.startsWith('supabase-schema-') && file.endsWith('.sql'))
        .map((file) => ({ file, mtime: fs.statSync(path.join(WORKDIR, file)).mtime }))
        .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
        throw new Error('No supabase-schema-*.sql schema dump found. Run `supabase db dump --linked --schema public --file supabase-schema-<date>.sql` first.');
    }

    return path.join(WORKDIR, files[0].file);
}

function parseSchema(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    const tableRegex = /CREATE TABLE IF NOT EXISTS "public"\."([^"]+)" \(([^;]+?)\n\);/g;

    /** @type {Record<string, Set<string>>} */
    const tables = {};

    let match;
    while ((match = tableRegex.exec(sql)) !== null) {
        const [, tableName, columnChunk] = match;
        const columnSet = new Set();

        const lines = columnChunk.split('\n');
        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;
            if (!line.startsWith('"')) continue;
            const columnName = line.split('"')[1];
            if (columnName) {
                columnSet.add(columnName);
            }
        }

        tables[tableName] = columnSet;
    }

    return tables;
}

/**
 * Tables and columns required for full application functionality.
 * Columns were curated from API handlers, hooks, and migrations.
 */
const REQUIRED_SCHEMA = {
    user_payments: [
        'id',
        'user_id',
        'email',
        'name',
        'organization',
        'tier',
        'plan_type',
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_price_id',
        'stripe_session_id',
        'stripe_customer_email',
        'stripe_product_id',
        'payment_amount',
        'payment_status',
        'access_granted',
        'trial_ends_at',
        'created_at',
        'updated_at'
    ],
    user_profiles: [
        'id',
        'user_id',
        'email',
        'full_name',
        'institution_name',
        'institution_type',
        'subscription_status',
        'subscription_tier',
        'trial_ends_at',
        'onboarding_completed',
        'preferences',
        'metadata',
        'created_at',
        'updated_at'
    ],
    profiles: [
        'id',
        'email',
        'full_name',
        'preferred_name',
        'position',
        'organization',
        'created_at',
        'updated_at'
    ],
    team_members: [
        'id',
        'team_id',
        'user_id',
        'organization',
        'email',
        'full_name',
        'role',
        'permissions',
        'department',
        'status',
        'avatar_url',
        'is_active',
        'joined_at',
        'last_active_at',
        'created_at',
        'updated_at'
    ],
    team_activity: [
        'id',
        'team_member_id',
        'action_type',
        'action_details',
        'entity_type',
        'entity_id',
        'created_at'
    ],
    implementation_phases: [
        'id',
        'organization',
        'phase_name',
        'phase_order',
        'status',
        'created_at',
        'updated_at'
    ],
    implementation_tasks: [
        'id',
        'organization',
        'phase_id',
        'task_title',
        'description',
        'assigned_to',
        'priority',
        'status',
        'estimated_hours',
        'actual_hours',
        'due_date',
        'completed_date',
        'blockers',
        'dependencies',
        'created_at',
        'updated_at'
    ],
    task_comments: [
        'id',
        'organization',
        'task_id',
        'author_id',
        'content',
        'created_at',
        'updated_at'
    ],
    roi_metrics: [
        'id',
        'organization',
        'metric_type',
        'metric_value',
        'metric_date',
        'category',
        'description',
        'created_at',
        'updated_at'
    ],
    roi_calculations: [
        'id',
        'organization',
        'calculation_date',
        'monthly_savings',
        'annual_projection',
        'payback_period_months',
        'roi_percentage',
        'calculation_details',
        'created_at'
    ],
    roi_scenarios: [
        'id',
        'organization',
        'user_id',
        'name',
        'description',
        'assumptions',
        'results',
        'is_favorite',
        'last_used_at',
        'created_at',
        'updated_at'
    ],
    calendar_events: [
        'id',
        'organization',
        'title',
        'description',
        'event_type',
        'start_time',
        'end_time',
        'location',
        'meeting_url',
        'host_id',
        'attendee_ids',
        'max_attendees',
        'is_recurring',
        'recurrence_rule',
        'created_at',
        'updated_at'
    ],
    event_rsvps: [
        'id',
        'event_id',
        'team_member_id',
        'response',
        'responded_at',
        'created_at'
    ],
    team_documents: [
        'id',
        'organization',
        'title',
        'description',
        'storage_path',
        'tags',
        'created_by',
        'last_modified_by',
        'last_modified_at',
        'created_at'
    ],
    collaboration_rooms: [
        'id',
        'organization',
        'slug',
        'title',
        'content',
        'last_editor',
        'created_at',
        'updated_at'
    ],
    streamlined_assessment_responses: [
        'id',
        'user_id',
        'institution_type',
        'institution_size',
        'institution_state',
        'responses',
        'scores',
        'readiness_level',
        'ai_roadmap',
        'completed_at',
        'created_at',
        'updated_at'
    ],
    gap_analysis_results: [
        'id',
        'user_id',
        'overall_score',
        'govern_recommendations',
        'map_recommendations',
        'measure_recommendations',
        'manage_recommendations',
        'quick_wins',
        'risk_hotspots',
        'nist_alignment',
        'created_at'
    ],
    assessment_progress: [
        'session_id',
        'assessment_id',
        'audience',
        'user_id',
        'current_section',
        'current_question',
        'responses',
        'completed_sections',
        'progress_percent',
        'is_complete',
        'created_at',
        'updated_at'
    ],
    assessments: [
        'id',
        'org_id',
        'user_id',
        'scores',
        'findings',
        'recommendations',
        'assessment_date',
        'completion_status',
        'risk_score',
        'compliance_status',
        'algorithm_results',
        'created_at',
        'updated_at'
    ],
    blueprints: [
        'id',
        'user_id',
        'organization_id',
        'assessment_id',
        'goals_id',
        'title',
        'status',
        'version',
        'generated_at',
        'last_updated',
        'readiness_scores',
        'implementation_phases',
        'department_plans',
        'document_insights',
        'document_compliance',
        'recommended_policies',
        'share_token',
        'shared_with',
        'is_public'
    ],
    blueprint_goals: [
        'id',
        'user_id',
        'assessment_id',
        'primary_goals',
        'department_goals',
        'learning_objectives',
        'timeline_preference',
        'budget_range',
        'created_at',
        'updated_at'
    ],
    blueprint_phases: [
        'id',
        'blueprint_id',
        'phase_number',
        'title',
        'objectives',
        'key_outcomes',
        'success_criteria',
        'status',
        'progress_percentage',
        'created_at',
        'updated_at'
    ],
    blueprint_tasks: [
        'id',
        'blueprint_id',
        'phase_id',
        'task_title',
        'task_description',
        'task_type',
        'priority',
        'department',
        'assigned_to',
        'due_date',
        'dependencies',
        'deliverables',
        'status',
        'completion_percentage',
        'created_at',
        'updated_at'
    ],
    blueprint_progress: [
        'id',
        'blueprint_id',
        'overall_progress',
        'phases_completed',
        'tasks_completed',
        'tasks_total',
        'next_milestone',
        'last_updated'
    ],
    blueprint_comments: [
        'id',
        'blueprint_id',
        'task_id',
        'user_id',
        'comment_text',
        'created_at'
    ],
    contact_messages: [
        'id',
        'name',
        'email',
        'organization',
        'message',
        'user_agent',
        'ip_address',
        'spam_score',
        'honeypot_tripped',
        'processed',
        'created_at'
    ],
    institutions: [
        'id',
        'name',
        'slug',
        'headcount',
        'budget',
        'org_type',
        'created_at'
    ],
    institution_memberships: [
        'id',
        'institution_id',
        'user_id',
        'role',
        'active',
        'created_at',
        'updated_at'
    ],
    audit_logs: [
        'id',
        'user_id',
        'action',
        'resource_type',
        'resource_id',
        'metadata',
        'ip_address',
        'user_agent',
        'created_at'
    ],
    recommendations: [
        'id',
        'user_id',
        'category',
        'title',
        'description',
        'priority_score',
        'resource_id',
        'is_active',
        'created_at',
        'updated_at'
    ],
    user_activity_log: [
        'id',
        'user_id',
        'activity_type',
        'activity_data',
        'ip_address',
        'user_agent',
        'created_at'
    ],
    framework_metadata: [
        'id',
        'name',
        'version',
        'status',
        'last_updated',
        'changelog',
        'created_at',
        'updated_at'
    ],
    subscriptions: [
        'id',
        'user_id',
        'status',
        'tier',
        'trial_ends_at',
        'current_period_end',
        'stripe_customer_id',
        'stripe_subscription_id',
        'stripe_price_id',
        'metadata',
        'created_at',
        'updated_at'
    ],
    organizations: [
        'id',
        'name',
        'domain',
        'created_at'
    ]
};

function verifySchema(actualTables, requiredSchema) {
    const missingTables = [];
    const columnIssues = [];

    for (const [table, columns] of Object.entries(requiredSchema)) {
        if (!actualTables[table]) {
            missingTables.push(table);
            continue;
        }

        const actualColumns = actualTables[table];
        const missingColumns = columns.filter((col) => !actualColumns.has(col));
        if (missingColumns.length > 0) {
            columnIssues.push({ table, missingColumns });
        }
    }

    return { missingTables, columnIssues };
}

function main() {
    try {
        const schemaFile = findLatestSchemaDump();
        const tableMap = parseSchema(schemaFile);
        const { missingTables, columnIssues } = verifySchema(tableMap, REQUIRED_SCHEMA);

        console.log('📦 Latest schema dump:', path.basename(schemaFile));
        console.log('📊 Tables parsed:', Object.keys(tableMap).length);

        if (missingTables.length === 0 && columnIssues.length === 0) {
            console.log('\n✅ All required tables and columns are present.');
            return;
        }

        if (missingTables.length > 0) {
            console.log('\n❌ Missing tables:');
            missingTables.forEach((table) => console.log(`  - ${table}`));
        }

        if (columnIssues.length > 0) {
            console.log('\n⚠️  Missing columns:');
            columnIssues.forEach(({ table, missingColumns }) => {
                console.log(`  - ${table}: ${missingColumns.join(', ')}`);
            });
        }

        process.exitCode = 1;
    } catch (error) {
        console.error('💥 Schema verification failed:', error.message);
        process.exitCode = 1;
    }
}

main();
