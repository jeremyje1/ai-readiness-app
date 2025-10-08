/**
 * Integration tests using real data flow
 * These tests validate that actual customer data flows correctly through the system
 */

import { createClient } from '@/lib/supabase/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe.skip('Real Customer Data Flow', () => {
    let supabase: any;
    let testUserId: string;
    let testInstitutionId: string;

    beforeAll(async () => {
        // Use test database or test schema
        supabase = await createClient();

        // Create a real test institution
        const { data: institution, error: instError } = await supabase
            .from('institutions')
            .insert({
                name: 'Test School District',
                slug: 'test-school-district',
                headcount: 5000,
                budget: 10000000,
                org_type: 'K12'
            })
            .select()
            .single();

        if (instError) throw instError;
        testInstitutionId = institution.id;

        // Create a real test user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'test@testschool.edu',
            password: 'TestPassword123!',
            options: {
                data: {
                    name: 'Test Administrator',
                    institution_type: 'K12'
                }
            }
        });

        if (authError) throw authError;
        testUserId = authData.user!.id;

        // Create user profile (simulating what the signup hook does)
        await supabase.from('user_profiles').insert({
            user_id: testUserId,
            name: 'Test Administrator',
            title: 'Superintendent',
            institution_id: testInstitutionId,
            onboarding_completed: true,
            subscription_status: 'active'
        });
    });

    afterAll(async () => {
        // Clean up test data
        if (testUserId) {
            await supabase.from('assessments').delete().eq('user_id', testUserId);
            await supabase.from('user_profiles').delete().eq('user_id', testUserId);
            await supabase.auth.admin.deleteUser(testUserId);
        }
        if (testInstitutionId) {
            await supabase.from('institutions').delete().eq('id', testInstitutionId);
        }
    });

    it('should create and display real assessment data', async () => {
        // Submit a real assessment for the test user
        const assessmentResponses = {
            q1: 'We have basic AI awareness',
            q2: 'Limited implementation',
            q3: 'Some staff training',
            // ... real assessment questions
        };

        const { data: assessment, error } = await supabase
            .from('assessments')
            .insert({
                user_id: testUserId,
                assessment_date: new Date().toISOString(),
                completion_status: 'completed',
                responses: assessmentResponses,
                risk_score: 0.65,
                compliance_status: 'partial',
                algorithm_results: {
                    overall_score: 0.72,
                    dsch_score: 0.75,
                    crf_score: 0.68,
                    lei_score: 0.73
                }
            })
            .select()
            .single();

        expect(error).toBeNull();
        expect(assessment).toBeDefined();

        // Now test that the dashboard shows this real data
        const response = await fetch(`/api/dashboard/metrics?audience=k12&userId=${testUserId}`);
        const data = await response.json();

        // Verify the API returns the actual assessment score
        expect(data.metrics.assessmentScore.current).toBe(72); // 0.72 * 100
        expect(data.metrics.assessmentScore.level).toBe('proficient');
    });

    it('should track real user activity', async () => {
        // Simulate real user actions
        await supabase.from('audit_logs').insert([
            {
                user_id: testUserId,
                action: 'Completed AI Readiness Assessment',
                created_at: new Date().toISOString()
            },
            {
                user_id: testUserId,
                action: 'Downloaded Policy Template',
                created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            }
        ]);

        // Fetch dashboard metrics
        const response = await fetch(`/api/dashboard/metrics?audience=k12&userId=${testUserId}`);
        const data = await response.json();

        // Verify real activity is returned
        expect(data.metrics.recentActivity).toHaveLength(2);
        expect(data.metrics.recentActivity[0].title).toBe('Completed AI Readiness Assessment');
    });

    it('should generate personalized recommendations based on assessment', async () => {
        // Create recommendations based on the user's actual assessment results
        await supabase.from('recommendations').insert([
            {
                user_id: testUserId,
                title: 'Develop District-Wide AI Policy',
                description: 'Based on your assessment, creating a comprehensive AI policy should be your top priority',
                priority_score: 85,
                category: 'policy',
                is_active: true
            },
            {
                user_id: testUserId,
                title: 'Staff Training Program',
                description: 'Your assessment indicates need for systematic staff training on AI tools',
                priority_score: 70,
                category: 'training',
                is_active: true
            }
        ]);

        // Fetch dashboard metrics
        const response = await fetch(`/api/dashboard/metrics?audience=k12&userId=${testUserId}`);
        const data = await response.json();

        // Verify personalized recommendations
        expect(data.metrics.recommendations).toHaveLength(2);
        expect(data.metrics.recommendations[0].title).toBe('Develop District-Wide AI Policy');
        expect(data.metrics.recommendations[0].priority).toBe('high');

        // Quick wins should surface actionable tasks from recommendations
        expect(Array.isArray(data.metrics.quickWins)).toBe(true);
        expect(data.metrics.quickWins.length).toBeGreaterThan(0);
        expect(data.metrics.quickWins[0].title).toContain('AI Policy');
    });

    it('should calculate real benchmarking against peer institutions', async () => {
        // Create peer institution assessments for comparison
        const peerUserIds = [];

        for (let i = 0; i < 5; i++) {
            const { data: peerAuth } = await supabase.auth.signUp({
                email: `peer${i}@school.edu`,
                password: 'TestPassword123!'
            });

            if (peerAuth?.user) {
                peerUserIds.push(peerAuth.user.id);

                await supabase.from('assessments').insert({
                    user_id: peerAuth.user.id,
                    assessment_date: new Date().toISOString(),
                    completion_status: 'completed',
                    algorithm_results: {
                        overall_score: 0.5 + (i * 0.1) // Scores: 0.5, 0.6, 0.7, 0.8, 0.9
                    }
                });
            }
        }

        // Fetch dashboard metrics for our test user (score: 0.72)
        const response = await fetch(`/api/dashboard/metrics?audience=k12&userId=${testUserId}`);
        const data = await response.json();

        // With scores [50, 60, 70, 80, 90] and user at 72, percentile should be 60th
        expect(data.metrics.benchmarking.percentile).toBeGreaterThan(55);
        expect(data.metrics.benchmarking.percentile).toBeLessThan(65);
        expect(data.metrics.benchmarking.peerComparison).toBe('average');
        expect(data.metrics.benchmarking.sampleSize).toBe(5);

        // Clean up peer users
        for (const peerId of peerUserIds) {
            await supabase.auth.admin.deleteUser(peerId);
        }
    });

    it('should reflect real institution metrics', async () => {
        // Our test institution has 5000 headcount
        const response = await fetch(`/api/dashboard/metrics?audience=k12&userId=${testUserId}`);
        const data = await response.json();

        // Verify calculations based on real institution data
        expect(data.metrics.audienceSpecificMetrics.k12.studentsImpacted).toBe(5000);
        expect(data.metrics.audienceSpecificMetrics.k12.districtsServed).toBe(1); // 5000/5000
        expect(data.metrics.audienceSpecificMetrics.k12.staffTrained).toBe(500); // 10% of 5000
    });
});