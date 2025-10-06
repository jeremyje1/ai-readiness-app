import { calculateEnterpriseMetrics } from '@/lib/algorithms';
import { calculateAIReadinessMetrics } from '@/lib/ai-readiness-algorithms';
import { Blueprint, BlueprintGoals, ImplementationPhase, SuccessMetric } from '@/types/blueprint';
import { SupabaseClient } from '@supabase/supabase-js';
import { BlueprintGenerator } from './blueprint-generator';

export class BlueprintService {
    private supabase: SupabaseClient;
    private generator: BlueprintGenerator;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
        this.generator = new BlueprintGenerator();
    }

    async generateBlueprint(
        blueprintId: string,
        goals: BlueprintGoals,
        assessment: any,
        userId: string
    ): Promise<void> {
        try {
            console.log('Starting blueprint generation for:', blueprintId);

            // Step 1: Calculate readiness scores
            // Handle both old assessment format and new streamlined format
            const responses = assessment.assessment_responses || assessment.responses || [];

            // Create default organization metrics
            // TODO: These should ideally come from the assessment or institution profile
            const defaultOrgMetrics = {
                digitalMaturity: 0.5,
                systemIntegration: 0.5,
                collaborationIndex: 0.6,
                innovationCapacity: 0.5,
                strategicAgility: 0.5,
                leadershipEffectiveness: 0.6,
                decisionLatency: 0.4, // lower is better
                communicationEfficiency: 0.6,
                employeeEngagement: 0.5,
                changeReadiness: 0.5,
                futureReadiness: 0.5,
                processComplexity: 0.4, // lower is better
                operationalRisk: 0.3, // lower is better
                technologicalRisk: 0.3, // lower is better
                cybersecurityLevel: 0.6,
                resourceUtilization: 0.5,
                taskAutomationLevel: 0.4
            };

            // Calculate AI readiness metrics using AIRIX framework
            const aiMetrics = await calculateAIReadinessMetrics(responses);

            // Convert to 0-1 scale for consistency with existing code
            const overallScore = aiMetrics.airix.overallScore / 100;

            const readinessScores = {
                overall: overallScore,
                airs: { score: aiMetrics.airs.overallScore / 100, factors: aiMetrics.airs.factors },
                aics: { score: aiMetrics.aics.overallScore / 100, factors: aiMetrics.aics.factors },
                aims: { score: aiMetrics.aims.overallScore / 100, factors: aiMetrics.aims.factors },
                aips: { score: aiMetrics.aips.overallScore / 100, factors: aiMetrics.aips.factors },
                aibs: { score: aiMetrics.aibs.overallScore / 100, factors: aiMetrics.aibs.factors }
            };

            // Step 2: Determine maturity level
            const maturityLevel = this.determineMaturityLevel(overallScore);

            // Step 3: Generate vision and executive summary
            const visionStatement = await this.generator.generateVisionStatement(goals, aiMetrics);
            const executiveSummary = await this.generator.generateExecutiveSummary(goals, aiMetrics, maturityLevel);
            const valueProposition = await this.generator.generateValueProposition(goals, aiMetrics);

            // Step 4: Update blueprint with initial content
            await this.updateBlueprint(blueprintId, {
                readiness_scores: readinessScores,
                maturity_level: maturityLevel,
                vision_statement: visionStatement,
                executive_summary: executiveSummary,
                value_proposition: valueProposition
            });

            // Step 5: Generate implementation phases
            const phases = await this.generator.generateImplementationPhases(
                goals,
                aiMetrics,
                maturityLevel
            );

            // Step 6: Generate department plans
            const departmentPlans = await this.generator.generateDepartmentPlans(
                goals,
                phases,
                aiMetrics
            );

            // Step 7: Generate success metrics
            const successMetrics = await this.generator.generateSuccessMetrics(goals, departmentPlans);

            // Step 8: Generate risk assessment
            const riskAssessment = await this.generator.generateRiskAssessment(aiMetrics, maturityLevel);
            const mitigationStrategies = await this.generator.generateMitigationStrategies(riskAssessment);

            // Step 9: Calculate resource allocation and budget
            const resourceAllocation = await this.generator.calculateResourceAllocation(
                phases,
                departmentPlans,
                goals
            );
            const totalBudget = this.calculateTotalBudget(resourceAllocation);

            // Step 10: Generate quick wins
            const quickWins = await this.generator.generateQuickWins(aiMetrics, goals);

            // Step 11: Generate tool recommendations
            const recommendedTools = await this.generator.generateToolRecommendations(
                goals,
                aiMetrics,
                departmentPlans
            );

            // Step 12: Insert phases and tasks into database
            await this.insertPhasesAndTasks(blueprintId, phases);

            // Step 13: Final update with all content
            await this.updateBlueprint(blueprintId, {
                implementation_phases: phases,
                department_plans: departmentPlans,
                success_metrics: successMetrics,
                kpi_targets: this.generateKPITargets(successMetrics),
                risk_assessment: riskAssessment,
                mitigation_strategies: mitigationStrategies,
                resource_allocation: resourceAllocation,
                total_budget: totalBudget,
                quick_wins: quickWins,
                recommended_tools: recommendedTools,
                status: 'complete'
            });

            // Step 14: Generate PDFs (async, non-blocking)
            this.generatePDFs(blueprintId, userId).catch(console.error);

            console.log('Blueprint generation completed:', blueprintId);
        } catch (error) {
            console.error('Error generating blueprint:', error);
            throw error;
        }
    }

    private determineMaturityLevel(overallScore: number): string {
        if (overallScore >= 80) return 'Advanced';
        if (overallScore >= 60) return 'Developing';
        if (overallScore >= 40) return 'Emerging';
        return 'Beginning';
    }

    private calculateTotalBudget(allocation: any): number {
        return (
            allocation.training_budget +
            allocation.technology_budget +
            allocation.consulting_budget +
            allocation.contingency
        );
    }

    private generateKPITargets(metrics: SuccessMetric[]): Record<string, any> {
        const targets: Record<string, any> = {};
        metrics.forEach((metric) => {
            targets[metric.name.toLowerCase().replace(/\s+/g, '_')] = {
                baseline: metric.baseline,
                target: metric.target,
                measurement: metric.measurement_method,
                frequency: metric.frequency
            };
        });
        return targets;
    }

    private async insertPhasesAndTasks(blueprintId: string, phases: ImplementationPhase[]): Promise<void> {
        for (const phase of phases) {
            // Insert phase
            const { data: insertedPhase, error: phaseError } = await this.supabase
                .from('blueprint_phases')
                .insert({
                    blueprint_id: blueprintId,
                    phase_number: phase.phase,
                    title: phase.title,
                    duration: phase.duration,
                    objectives: phase.objectives,
                    deliverables: phase.deliverables,
                    budget: phase.budget,
                    required_resources: phase.required_resources,
                    success_criteria: phase.success_criteria
                })
                .select()
                .single();

            if (phaseError) {
                console.error('Error inserting phase:', phaseError);
                continue;
            }

            // Insert tasks for this phase
            if (phase.tasks && phase.tasks.length > 0) {
                const tasksToInsert = phase.tasks.map((task) => ({
                    blueprint_id: blueprintId,
                    phase_id: insertedPhase.id,
                    task_title: task.title,
                    task_description: task.description,
                    task_type: task.type,
                    priority: task.priority,
                    department: task.department || null,
                    estimated_hours: task.estimated_hours,
                    dependencies: task.dependencies || [],
                    status: 'pending',
                    completion_percentage: 0
                }));

                const { error: tasksError } = await this.supabase
                    .from('blueprint_tasks')
                    .insert(tasksToInsert);

                if (tasksError) {
                    console.error('Error inserting tasks:', tasksError);
                }
            }
        }
    }

    private async updateBlueprint(blueprintId: string, updates: Partial<Blueprint>): Promise<void> {
        const { error } = await this.supabase
            .from('blueprints')
            .update({
                ...updates,
                last_updated: new Date().toISOString()
            })
            .eq('id', blueprintId);

        if (error) {
            console.error('Error updating blueprint:', error);
            throw error;
        }
    }

    private async generatePDFs(blueprintId: string, userId: string): Promise<void> {
        // This will be implemented later to generate PDF versions
        // For now, we'll just log that PDFs would be generated
        console.log('PDF generation would happen here for blueprint:', blueprintId);
    }

    // Public methods for updating blueprints
    async updateBlueprintStatus(blueprintId: string, status: 'draft' | 'generating' | 'complete' | 'updated', userId: string): Promise<void> {
        // Verify ownership
        const { data: blueprint } = await this.supabase
            .from('blueprints')
            .select('user_id')
            .eq('id', blueprintId)
            .single();

        if (!blueprint || blueprint.user_id !== userId) {
            throw new Error('Blueprint not found or unauthorized');
        }

        await this.updateBlueprint(blueprintId, { status });
    }

    async approveBlueprint(blueprintId: string, approvedBy: string, userId: string): Promise<void> {
        // Verify ownership
        const { data: blueprint } = await this.supabase
            .from('blueprints')
            .select('user_id')
            .eq('id', blueprintId)
            .single();

        if (!blueprint || blueprint.user_id !== userId) {
            throw new Error('Blueprint not found or unauthorized');
        }

        await this.updateBlueprint(blueprintId, {
            approval_status: 'approved',
            approved_by: approvedBy,
            approved_at: new Date().toISOString()
        });
    }

    async regenerateSection(
        blueprintId: string,
        section: string,
        userId: string
    ): Promise<void> {
        // This method will allow regenerating specific sections of a blueprint
        // Implementation will depend on which section needs regeneration
        console.log('Section regeneration not yet implemented:', section);
    }
}