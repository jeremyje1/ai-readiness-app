import {
    BlueprintGoals,
    DepartmentGoal,
    DepartmentPlan,
    ImplementationPhase,
    MitigationStrategy,
    PhaseTask,
    QuickWin,
    RecommendedTool,
    Risk,
    SuccessMetric,
    TrainingRequirement,
    ValueProposition
} from '@/types/blueprint';
import OpenAI from 'openai';

type DepartmentStage = 'foundation' | 'pilot' | 'rollout' | 'measurement' | 'innovation';

export class BlueprintGenerator {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateVisionStatement(goals: BlueprintGoals, metrics: any): Promise<string> {
        const prompt = `Generate a compelling vision statement for an educational institution's AI implementation based on:
    Primary Goals: ${goals.primary_goals.join(', ')}
    Implementation Style: ${goals.implementation_style}
    Timeline: ${goals.timeline_preference}
    Readiness Level: ${metrics.overall}%
    
    The vision statement should be inspiring, specific to education, and approximately 2-3 sentences.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 150,
                temperature: 0.7,
            });

            return response.choices[0]?.message?.content || 'Transforming education through strategic AI implementation.';
        } catch (error) {
            console.error('Error generating vision statement:', error);
            return 'Empowering educators and students through thoughtful AI integration that enhances learning outcomes while maintaining human-centered educational values.';
        }
    }

    async generateExecutiveSummary(goals: BlueprintGoals, metrics: any, maturityLevel: string): Promise<string> {
        const prompt = `Generate an executive summary for an AI implementation blueprint based on:
    Institution Maturity Level: ${maturityLevel}
    Overall Readiness: ${metrics.airix?.overallScore || metrics.overall || 0}%
    Primary Goals: ${goals.primary_goals.join(', ')}
    Timeline: ${goals.timeline_preference}
    Budget Range: ${goals.budget_range}
    Key Strengths: ${this.getKeyStrengthsText(metrics)}
    
    The summary should be 3-4 paragraphs covering current state, proposed approach, and expected outcomes.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 400,
                temperature: 0.7,
            });

            return response.choices[0]?.message?.content || this.generateDefaultExecutiveSummary(metrics, maturityLevel);
        } catch (error) {
            console.error('Error generating executive summary:', error);
            return this.generateDefaultExecutiveSummary(metrics, maturityLevel);
        }
    }

    async generateValueProposition(goals: BlueprintGoals, metrics: any): Promise<ValueProposition> {
        const budgetToROI = {
            'under10k': '3-5x',
            '10k-50k': '4-6x',
            '50k-100k': '5-8x',
            '100k-250k': '6-10x',
            'over250k': '8-12x'
        };

        const timelineToValue = {
            '3months': '30-45 days',
            '6months': '45-60 days',
            '1year': '60-90 days',
            '18months': '90-120 days'
        };

        return {
            summary: `Strategic AI implementation designed to ${goals.primary_goals[0].toLowerCase()} while building sustainable capabilities for long-term success.`,
            key_benefits: [
                'Enhanced student learning outcomes through personalized AI-powered experiences',
                'Reduced administrative burden by 30-40% through intelligent automation',
                'Improved decision-making with data-driven insights and predictive analytics',
                'Competitive advantage in attracting and retaining students and faculty',
                'Cost savings through operational efficiency and resource optimization'
            ],
            expected_roi: budgetToROI[goals.budget_range] || '5-8x',
            timeline_to_value: timelineToValue[goals.timeline_preference] || '60-90 days'
        };
    }

    async generateImplementationPhases(
        goals: BlueprintGoals,
        metrics: any,
        maturityLevel: string
    ): Promise<ImplementationPhase[]> {
        const totalMonths = this.timelineToMonths(goals.timeline_preference);
        const desiredPhaseCount =
            maturityLevel === 'Beginning' ? 5 : maturityLevel === 'Emerging' ? 4 : 3;
        const monthsPerPhase = Math.max(1, Math.round(totalMonths / desiredPhaseCount));

        const basePhases: ImplementationPhase[] = [];

        const createPhase = (
            title: string,
            objectives: string[],
            tasks: PhaseTask[],
            deliverables: string[],
            requiredResources: string[],
            successCriteria: string[],
            durationMultiplier = 1
        ) => {
            basePhases.push({
                phase: basePhases.length + 1,
                title,
                duration: `${Math.max(1, Math.round(monthsPerPhase * durationMultiplier))} months`,
                objectives,
                tasks,
                deliverables,
                budget: 0,
                required_resources: requiredResources,
                success_criteria: successCriteria
            });
        };

        const primaryGoalSummary =
            goals.primary_goals && goals.primary_goals.length > 0
                ? goals.primary_goals[0]
                : 'your strategic priorities';

        createPhase(
            'Foundation & Governance',
            [
                'Establish AI governance, ethics, and risk policies',
                'Assess infrastructure, data, and security readiness',
                'Stand up cross-functional AI leadership team',
                `Define success measures tied to ${primaryGoalSummary}`
            ],
            [
                {
                    title: 'Develop AI governance framework',
                    description:
                        'Create policies covering responsible use, transparency, data privacy, and accountability for AI initiatives.',
                    type: 'policy',
                    priority: 'critical',
                    estimated_hours: 48,
                    dependencies: []
                },
                {
                    title: 'Conduct infrastructure & data readiness audit',
                    description:
                        'Evaluate current systems, integrations, and data pipelines needed to support AI pilots and scale.',
                    type: 'assessment',
                    priority: 'high',
                    estimated_hours: 32,
                    dependencies: []
                },
                {
                    title: 'Align leadership on AI priorities',
                    description:
                        'Facilitate working sessions with executive sponsors and department leaders to prioritize AI use cases.',
                    type: 'communication',
                    priority: 'high',
                    estimated_hours: 24,
                    dependencies: []
                }
            ],
            [
                'AI governance charter and policy playbook',
                'Infrastructure and data readiness assessment',
                'Executive steering committee with clear decision rights'
            ],
            [
                'Executive sponsor',
                'AI program manager',
                'Data governance lead',
                'Change management specialist'
            ],
            [
                'Policies approved by leadership',
                'Infrastructure gaps documented with remediation plan',
                'Success metrics and operating cadence defined'
            ]
        );

        if (goals.pilot_preference && basePhases.length < desiredPhaseCount) {
            createPhase(
                'Pilot Programs & Validation',
                [
                    'Select and launch high-impact AI pilot initiatives',
                    'Enable pilot teams with training and vendor support',
                    'Capture qualitative and quantitative feedback',
                    'Produce recommendations for scaling successful pilots'
                ],
                [
                    {
                        title: 'Prioritize pilot use cases',
                        description:
                            'Score potential AI pilots against impact, feasibility, and alignment with institutional goals.',
                        type: 'implementation',
                        priority: 'critical',
                        estimated_hours: 28,
                        dependencies: []
                    },
                    {
                        title: 'Deploy AI pilots and capture evidence',
                        description:
                            'Implement selected AI tools, monitor adoption, and document outcomes to inform the scale plan.',
                        type: 'technical',
                        priority: 'high',
                        estimated_hours: 60,
                        dependencies: []
                    },
                    {
                        title: 'Facilitate pilot enablement program',
                        description:
                            'Provide targeted training, office hours, and support for pilot participants and faculty champions.',
                        type: 'training',
                        priority: 'medium',
                        estimated_hours: 36,
                        dependencies: []
                    }
                ],
                [
                    'Pilot implementation backlog with resource plan',
                    'Pilot evaluation report with ROI and adoption findings',
                    'Refined blueprint for enterprise rollout'
                ],
                [
                    'Pilot coordinators',
                    'Department champions',
                    'Vendor success teams',
                    'IT support engineers'
                ],
                [
                    'Pilot objectives met or exceeded',
                    'Stakeholder satisfaction above 80%',
                    'Scale decision documented for each pilot'
                ]
            );
        }

        if (basePhases.length < desiredPhaseCount) {
            createPhase(
                'Department Rollout & Change Management',
                [
                    'Codify rollout playbooks and change stories per department',
                    'Scale AI workflows and integrations across priority teams',
                    'Build coaching and support structures for staff',
                    'Ensure policy, security, and compliance guardrails at scale'
                ],
                [
                    {
                        title: 'Publish department rollout playbooks',
                        description:
                            'Create prescriptive guidance covering process updates, communications, and role impacts for each department.',
                        type: 'implementation',
                        priority: 'high',
                        estimated_hours: 40,
                        dependencies: []
                    },
                    {
                        title: 'Execute change management campaign',
                        description:
                            'Deliver messaging, town halls, and feedback loops to drive adoption and address resistance.',
                        type: 'communication',
                        priority: 'high',
                        estimated_hours: 32,
                        dependencies: []
                    },
                    {
                        title: 'Integrate AI workflows into core systems',
                        description:
                            'Coordinate with IT to embed AI-enabled processes into LMS, SIS, or CRM platforms.',
                        type: 'technical',
                        priority: 'high',
                        estimated_hours: 54,
                        dependencies: []
                    }
                ],
                [
                    'Department rollout schedule and RACI',
                    'Training completion and adoption dashboards',
                    'Updated security and compliance sign-offs'
                ],
                [
                    'Training specialists',
                    'Systems integrators',
                    'Department change champions',
                    'Communications team'
                ],
                [
                    '80%+ staff trained within target departments',
                    'Critical workflows modernized with AI support',
                    'Change feedback loop operating with rapid iteration'
                ]
            );
        }

        if (basePhases.length < desiredPhaseCount) {
            createPhase(
                'Impact Measurement & Analytics',
                [
                    'Operationalize KPI tracking and ROI dashboards',
                    'Monitor ethical, compliance, and risk indicators',
                    'Adjust operating model based on performance insights',
                    'Communicate wins and lessons learned to stakeholders'
                ],
                [
                    {
                        title: 'Deploy AI performance dashboards',
                        description:
                            'Configure analytics to monitor adoption, experience, and outcome metrics across departments.',
                        type: 'assessment',
                        priority: 'medium',
                        estimated_hours: 30,
                        dependencies: []
                    },
                    {
                        title: 'Run benefits realization review',
                        description:
                            'Analyze ROI, cost savings, and qualitative impact data to validate business case.',
                        type: 'assessment',
                        priority: 'high',
                        estimated_hours: 28,
                        dependencies: []
                    },
                    {
                        title: 'Evolve governance based on insights',
                        description:
                            'Update policies, guardrails, and operating rhythms using measurement findings.',
                        type: 'policy',
                        priority: 'medium',
                        estimated_hours: 20,
                        dependencies: []
                    }
                ],
                [
                    'Executive-ready performance dashboards',
                    'Quarterly ROI and benefits realization brief',
                    'Updated risk and compliance log'
                ],
                [
                    'Business intelligence analysts',
                    'Financial planning team',
                    'Compliance officer',
                    'AI steering committee'
                ],
                [
                    'KPIs trending to targets within two quarters',
                    'Risks tracked with clear mitigation owners',
                    'Stakeholders informed of measurable outcomes'
                ]
            );
        }

        if (basePhases.length < desiredPhaseCount) {
            createPhase(
                'Innovation & Sustainability',
                [
                    'Institutionalize continuous improvement practices',
                    'Explore emerging AI opportunities and partnerships',
                    'Extend AI literacy and advanced training programs',
                    'Refresh resourcing and investment roadmap annually'
                ],
                [
                    {
                        title: 'Launch AI innovation guild',
                        description:
                            'Create cross-functional forum to surface new AI ideas, evaluate feasibility, and prioritize pilots.',
                        type: 'communication',
                        priority: 'medium',
                        estimated_hours: 24,
                        dependencies: []
                    },
                    {
                        title: 'Formalize continuous improvement cadence',
                        description:
                            'Establish quarterly retrospectives and backlog grooming for AI initiatives.',
                        type: 'implementation',
                        priority: 'medium',
                        estimated_hours: 18,
                        dependencies: []
                    },
                    {
                        title: 'Assess next-wave AI investments',
                        description:
                            'Evaluate new AI capabilities, vendors, and partnerships aligned to institutional strategy.',
                        type: 'assessment',
                        priority: 'low',
                        estimated_hours: 26,
                        dependencies: []
                    }
                ],
                [
                    'Innovation backlog with prioritized experiments',
                    'Annual AI investment and capability roadmap',
                    'Advanced upskilling program outline'
                ],
                [
                    'Innovation council or AI center of excellence',
                    'External research partners',
                    'Professional development team'
                ],
                [
                    'New AI initiatives introduced every 6 months',
                    'Advanced AI literacy above 60% in target roles',
                    'Roadmap refreshed with clear funding sources'
                ]
            );
        }

        const normalizedPhases = basePhases
            .slice(0, desiredPhaseCount)
            .map((phase, index) => ({ ...phase, phase: index + 1 }));

        const phasesWithDepartments = this.injectDepartmentTasks(normalizedPhases, goals);
        const phasesWithBudgets = this.distributePhaseBudgets(
            phasesWithDepartments,
            goals.budget_range
        );

        return phasesWithBudgets;
    }

    async generateDepartmentPlans(
        goals: BlueprintGoals,
        phases: ImplementationPhase[],
        metrics: any
    ): Promise<DepartmentPlan[]> {
        if (!goals.department_goals || goals.department_goals.length === 0) {
            return [];
        }

        const totalBudget = this.parseBudgetRange(goals.budget_range);
        const defaultBudget = totalBudget / Math.max(1, goals.department_goals.length);
        const tasksByDepartment: Record<string, PhaseTask[]> = {};

        phases.forEach((phase) => {
            (phase.tasks || []).forEach((task) => {
                if (!task.department) return;
                if (!tasksByDepartment[task.department]) {
                    tasksByDepartment[task.department] = [];
                }
                tasksByDepartment[task.department].push(task);
            });
        });

        const plans: DepartmentPlan[] = goals.department_goals.map((deptGoal) => {
            const profile = this.identifyDepartmentProfile(deptGoal.department);
            const startDate = new Date();
            const timelineMonths = this.timelineToMonths(
                deptGoal.timeline || goals.timeline_preference
            );
            const midpointDate = this.addMonths(
                startDate,
                Math.max(1, Math.floor(timelineMonths / 2))
            );
            const completionDate = this.addMonths(startDate, Math.max(1, timelineMonths));
            const departmentTasks = tasksByDepartment[deptGoal.department] || [];

            const kickoffDeliverables = departmentTasks.slice(0, 2).map((task) => task.title);
            const midDeliverables = departmentTasks.slice(2, 4).map((task) => task.title);
            const finalDeliverables = departmentTasks.slice(4).map((task) => task.title);

            return {
                department: deptGoal.department,
                overview: this.buildDepartmentOverview(deptGoal),
                specific_goals:
                    deptGoal.outcomes && deptGoal.outcomes.length > 0
                        ? deptGoal.outcomes
                        : this.buildDefaultDepartmentGoals(deptGoal),
                assigned_tasks: [],
                resources_needed: this.getDepartmentResources(profile),
                training_requirements: this.getDepartmentTraining(profile),
                timeline: {
                    start_date: startDate.toISOString(),
                    milestones: [
                        {
                            name: 'Kickoff & Alignment',
                            date: this.addMonths(startDate, 1).toISOString(),
                            deliverables:
                                kickoffDeliverables.length > 0
                                    ? kickoffDeliverables
                                    : [
                                        'Department AI charter approved',
                                        'Success measures finalized'
                                    ]
                        },
                        {
                            name: 'Pilot & Early Outcomes',
                            date: midpointDate.toISOString(),
                            deliverables:
                                midDeliverables.length > 0
                                    ? midDeliverables
                                    : ['Pilot validated', 'Scale plan approved']
                        },
                        {
                            name: 'Full Deployment & Measurement',
                            date: completionDate.toISOString(),
                            deliverables:
                                finalDeliverables.length > 0
                                    ? finalDeliverables
                                    : ['Full rollout complete', 'Impact dashboard live']
                        }
                    ],
                    completion_date: completionDate.toISOString()
                },
                budget_allocation:
                    deptGoal.budget && deptGoal.budget > 0
                        ? deptGoal.budget
                        : Math.round(defaultBudget),
                success_metrics: this.buildDepartmentSuccessMetrics(deptGoal, profile)
            };
        });

        return plans;
    }

    async generateSuccessMetrics(goals: BlueprintGoals, departmentPlans: DepartmentPlan[]): Promise<SuccessMetric[]> {
        const metrics: SuccessMetric[] = [
            {
                name: 'Overall AI Adoption Rate',
                description: 'Percentage of faculty and staff actively using AI tools',
                baseline: '5%',
                target: '75%',
                measurement_method: 'Monthly usage analytics and surveys',
                frequency: 'Monthly',
                owner: 'Chief Information Officer'
            },
            {
                name: 'Student Learning Outcomes',
                description: 'Improvement in student performance metrics',
                baseline: 'Current GPA average',
                target: '10% improvement',
                measurement_method: 'Academic performance data analysis',
                frequency: 'Semester',
                owner: 'Academic Affairs'
            },
            {
                name: 'Operational Efficiency',
                description: 'Time saved through AI automation',
                baseline: '0 hours',
                target: '1000 hours/month',
                measurement_method: 'Process timing studies and workflow analysis',
                frequency: 'Quarterly',
                owner: 'Operations Manager'
            },
            {
                name: 'Cost Savings',
                description: 'Reduced operational costs through AI implementation',
                baseline: '$0',
                target: '$50,000/year',
                measurement_method: 'Financial analysis and cost tracking',
                frequency: 'Quarterly',
                owner: 'CFO'
            }
        ];

        // Add department-specific metrics
        for (const plan of departmentPlans) {
            metrics.push({
                name: `${plan.department} AI Integration`,
                description: `AI tool adoption and effectiveness in ${plan.department}`,
                baseline: '0%',
                target: '80%',
                measurement_method: 'Department surveys and usage metrics',
                frequency: 'Monthly',
                owner: `${plan.department} Head`
            });
        }

        return metrics;
    }

    async generateRiskAssessment(metrics: any, maturityLevel: string): Promise<Risk[]> {
        const risks: Risk[] = [
            {
                id: 'risk-1',
                category: 'adoption',
                description: 'Faculty resistance to AI adoption due to fear of job displacement',
                probability: maturityLevel === 'Beginning' ? 'high' : 'medium',
                impact: 'high',
            },
            {
                id: 'risk-2',
                category: 'technical',
                description: 'Insufficient IT infrastructure to support AI tools at scale',
                probability: metrics.overall < 40 ? 'high' : 'medium',
                impact: 'high',
            },
            {
                id: 'risk-3',
                category: 'compliance',
                description: 'Data privacy and FERPA compliance challenges with AI systems',
                probability: 'medium',
                impact: 'high',
            },
            {
                id: 'risk-4',
                category: 'financial',
                description: 'Budget overruns due to underestimated implementation costs',
                probability: 'medium',
                impact: 'medium',
            },
            {
                id: 'risk-5',
                category: 'organizational',
                description: 'Lack of sustained leadership support throughout implementation',
                probability: 'low',
                impact: 'high',
            }
        ];

        return risks;
    }

    async generateMitigationStrategies(risks: Risk[]): Promise<MitigationStrategy[]> {
        const strategies: MitigationStrategy[] = risks.map((risk) => ({
            id: `mitigation-${risk.id}`,
            risk_id: risk.id,
            strategy: this.getMitigationStrategy(risk),
            owner: this.getMitigationOwner(risk.category),
            timeline: risk.probability === 'high' ? 'Immediate' : '30-60 days',
            resources_needed: this.getMitigationResources(risk.category)
        }));

        return strategies;
    }

    async calculateResourceAllocation(
        phases: ImplementationPhase[],
        departmentPlans: DepartmentPlan[],
        goals: BlueprintGoals
    ): Promise<any> {
        const totalBudget = this.parseBudgetRange(goals.budget_range);

        return {
            human_resources: [
                { role: 'AI Implementation Director', count: 1, hours_per_week: 40, duration: goals.timeline_preference },
                { role: 'Technical Specialists', count: 2, hours_per_week: 40, duration: goals.timeline_preference },
                { role: 'Training Coordinators', count: 2, hours_per_week: 30, duration: goals.timeline_preference },
                { role: 'Department Champions', count: departmentPlans.length, hours_per_week: 10, duration: goals.timeline_preference }
            ],
            technology_resources: [
                {
                    category: 'AI Platforms & Tools',
                    tools: ['LMS AI Integration', 'AI Writing Assistant', 'Analytics Platform'],
                    budget: totalBudget * 0.4,
                    procurement_timeline: '30-60 days'
                },
                {
                    category: 'Infrastructure Upgrades',
                    tools: ['Server capacity', 'Network improvements', 'Security enhancements'],
                    budget: totalBudget * 0.2,
                    procurement_timeline: '60-90 days'
                }
            ],
            training_budget: totalBudget * 0.2,
            technology_budget: totalBudget * 0.6,
            consulting_budget: totalBudget * 0.15,
            contingency: totalBudget * 0.05
        };
    }

    async generateQuickWins(metrics: any, goals: BlueprintGoals): Promise<QuickWin[]> {
        return [
            {
                title: 'AI Writing Assistant Deployment',
                description: 'Deploy AI writing tools for administrative staff to streamline communications',
                effort: 'low',
                impact: 'high',
                timeline: '2 weeks',
                owner: 'IT Department',
                resources: ['AI tool licenses', 'Basic training materials']
            },
            {
                title: 'Automated Grading Pilot',
                description: 'Implement AI-assisted grading for multiple choice assessments',
                effort: 'medium',
                impact: 'high',
                timeline: '4 weeks',
                owner: 'Academic Technology',
                resources: ['LMS integration', 'Faculty training']
            },
            {
                title: 'AI Chatbot for Student Services',
                description: 'Launch AI chatbot to handle common student inquiries 24/7',
                effort: 'medium',
                impact: 'high',
                timeline: '6 weeks',
                owner: 'Student Services',
                resources: ['Chatbot platform', 'Content development']
            },
            {
                title: 'Faculty AI Literacy Workshop',
                description: 'Host introductory AI workshops for all faculty members',
                effort: 'low',
                impact: 'medium',
                timeline: '2 weeks',
                owner: 'Faculty Development',
                resources: ['Workshop materials', 'External speaker']
            }
        ];
    }

    async generateToolRecommendations(
        goals: BlueprintGoals,
        metrics: any,
        departmentPlans: DepartmentPlan[]
    ): Promise<RecommendedTool[]> {
        const tools: RecommendedTool[] = [
            {
                name: 'Microsoft Copilot for Education',
                category: 'Productivity Suite',
                description: 'AI-powered assistant integrated with Microsoft 365 for education',
                use_cases: [
                    'Document creation and editing',
                    'Email drafting and management',
                    'Meeting summaries and action items',
                    'Data analysis in Excel'
                ],
                pricing: '$30/user/month',
                implementation_effort: 'low',
                training_required: true,
                vendor_support: 'Comprehensive training and 24/7 support'
            },
            {
                name: 'Turnitin AI Writing Detection',
                category: 'Academic Integrity',
                description: 'AI detection and feedback tools for academic writing',
                use_cases: [
                    'Plagiarism detection',
                    'AI writing detection',
                    'Writing feedback and improvement',
                    'Originality reports'
                ],
                pricing: '$3-5/student/year',
                implementation_effort: 'low',
                training_required: true,
                vendor_support: 'Training webinars and documentation'
            },
            {
                name: 'Gradescope',
                category: 'Assessment & Grading',
                description: 'AI-assisted grading platform for all types of assessments',
                use_cases: [
                    'Automated grading of exams',
                    'Rubric-based assessment',
                    'Assignment analytics',
                    'Feedback delivery'
                ],
                pricing: 'Contact for institutional pricing',
                implementation_effort: 'medium',
                training_required: true,
                vendor_support: 'Dedicated implementation team'
            }
        ];

        // Add department-specific recommendations
        if (departmentPlans.some(p => p.department.toLowerCase().includes('stem'))) {
            tools.push({
                name: 'Wolfram Alpha Pro',
                category: 'STEM Education',
                description: 'Computational intelligence for STEM subjects',
                use_cases: [
                    'Problem solving assistance',
                    'Step-by-step solutions',
                    'Data visualization',
                    'Research support'
                ],
                pricing: '$60/year/user',
                implementation_effort: 'low',
                training_required: false,
                vendor_support: 'Online resources and tutorials'
            });
        }

        return tools;
    }

    // Helper methods
    private timelineToMonths(timeline: string): number {
        const map: Record<string, number> = {
            '3months': 3,
            '6months': 6,
            '1year': 12,
            '18months': 18
        };
        return map[timeline] || 6;
    }

    private injectDepartmentTasks(phases: ImplementationPhase[], goals: BlueprintGoals): ImplementationPhase[] {
        if (!goals.department_goals || goals.department_goals.length === 0) {
            return phases;
        }

        return phases.map((phase) => {
            const stage = this.determineDepartmentStage(phase.title);
            if (!stage) {
                return phase;
            }

            const departmentTasks = goals.department_goals
                .map((deptGoal) => this.getDepartmentStageTask(deptGoal, stage))
                .filter((task): task is PhaseTask => Boolean(task));

            if (departmentTasks.length === 0) {
                return phase;
            }

            return {
                ...phase,
                tasks: [...(phase.tasks || []), ...departmentTasks]
            };
        });
    }

    private determineDepartmentStage(title: string): DepartmentStage | null {
        const normalized = (title || '').toLowerCase();
        if (normalized.includes('foundation') || normalized.includes('governance')) {
            return 'foundation';
        }
        if (normalized.includes('pilot')) {
            return 'pilot';
        }
        if (normalized.includes('rollout') || normalized.includes('change')) {
            return 'rollout';
        }
        if (normalized.includes('measurement') || normalized.includes('analytics') || normalized.includes('impact')) {
            return 'measurement';
        }
        if (normalized.includes('innovation') || normalized.includes('sustain')) {
            return 'innovation';
        }
        return null;
    }

    private getDepartmentStageTask(deptGoal: DepartmentGoal, stage: DepartmentStage): PhaseTask | null {
        const profile = this.identifyDepartmentProfile(deptGoal.department);
        const departmentName = deptGoal.department;
        const primaryChallenge =
            deptGoal.challenges && deptGoal.challenges.length > 0
                ? deptGoal.challenges[0]
                : `align stakeholders within ${departmentName}`;
        const primaryOutcome =
            deptGoal.outcomes && deptGoal.outcomes.length > 0
                ? deptGoal.outcomes[0]
                : `deliver measurable AI benefits for ${departmentName}`;

        const build = (config: {
            title: string;
            description: string;
            type: PhaseTask['type'];
            priority: PhaseTask['priority'];
            estimatedHours: number;
            dependencies?: string[];
        }) => this.makeDepartmentTask(departmentName, config);

        if (profile === 'academic') {
            switch (stage) {
                case 'foundation':
                    return build({
                        title: 'Curriculum alignment workshop',
                        description: `Partner with faculty leadership to map AI competencies to priority programs and address ${primaryChallenge}.`,
                        type: 'communication',
                        priority: 'high',
                        estimatedHours: 20
                    });
                case 'pilot':
                    return build({
                        title: 'Launch AI-enhanced course pilots',
                        description: `Introduce AI tools into select courses and capture impact on ${primaryOutcome}.`,
                        type: 'implementation',
                        priority: 'high',
                        estimatedHours: 36
                    });
                case 'rollout':
                    return build({
                        title: 'Faculty AI pedagogy development',
                        description: 'Deliver a coaching series and resource hub to scale AI-enabled teaching practices.',
                        type: 'training',
                        priority: 'high',
                        estimatedHours: 32
                    });
                case 'measurement':
                    return build({
                        title: 'Analyze AI course learning outcomes',
                        description: 'Evaluate assessment data, student feedback, and equity impacts to inform curriculum revisions.',
                        type: 'assessment',
                        priority: 'medium',
                        estimatedHours: 18
                    });
                case 'innovation':
                    return build({
                        title: 'Create instructional innovation community',
                        description: 'Establish an innovation guild to share exemplars, iterate on course design, and explore generative AI.',
                        type: 'communication',
                        priority: 'medium',
                        estimatedHours: 16
                    });
            }
        }

        if (profile === 'it') {
            switch (stage) {
                case 'foundation':
                    return build({
                        title: 'Assess AI infrastructure & security posture',
                        description: `Evaluate compute, integration, and security requirements to address ${primaryChallenge}.`,
                        type: 'assessment',
                        priority: 'high',
                        estimatedHours: 32
                    });
                case 'pilot':
                    return build({
                        title: 'Provision pilot sandbox environments',
                        description: 'Stand up controlled environments, data pipelines, and access controls for AI pilots.',
                        type: 'technical',
                        priority: 'high',
                        estimatedHours: 40
                    });
                case 'rollout':
                    return build({
                        title: 'Deploy production-ready AI integrations',
                        description: 'Harden infrastructure, automate deployments, and integrate AI workflows into enterprise systems.',
                        type: 'technical',
                        priority: 'high',
                        estimatedHours: 48
                    });
                case 'measurement':
                    return build({
                        title: 'Implement AI operations monitoring',
                        description: 'Set up observability, logging, and alerting for AI workloads to protect uptime and compliance.',
                        type: 'technical',
                        priority: 'medium',
                        estimatedHours: 24
                    });
                case 'innovation':
                    return build({
                        title: 'Evaluate emerging AI platforms',
                        description: 'Research new AI services, partnerships, and reference architectures to expand capabilities.',
                        type: 'assessment',
                        priority: 'medium',
                        estimatedHours: 20
                    });
            }
        }

        if (profile === 'student') {
            switch (stage) {
                case 'foundation':
                    return build({
                        title: 'Map student support workflows',
                        description: `Document advising, enrollment, and case management processes to address ${primaryChallenge}.`,
                        type: 'assessment',
                        priority: 'high',
                        estimatedHours: 24
                    });
                case 'pilot':
                    return build({
                        title: 'Pilot AI-powered student advising',
                        description: 'Deploy an AI assistant or triage workflow to support students and gather satisfaction feedback.',
                        type: 'implementation',
                        priority: 'high',
                        estimatedHours: 34
                    });
                case 'rollout':
                    return build({
                        title: 'Roll out AI engagement playbooks',
                        description: 'Launch messaging, nudges, and knowledge management to scale personalized student support.',
                        type: 'communication',
                        priority: 'high',
                        estimatedHours: 30
                    });
                case 'measurement':
                    return build({
                        title: 'Monitor student experience metrics',
                        description: 'Track satisfaction, response times, and equity indicators for AI-assisted services.',
                        type: 'assessment',
                        priority: 'medium',
                        estimatedHours: 18
                    });
                case 'innovation':
                    return build({
                        title: 'Design proactive student interventions',
                        description: 'Leverage predictive insights to trigger timely outreach and wraparound services.',
                        type: 'implementation',
                        priority: 'medium',
                        estimatedHours: 22
                    });
            }
        }

        switch (stage) {
            case 'foundation':
                return build({
                    title: `Define AI use cases for ${departmentName}`,
                    description: `Prioritize workflows and KPIs where AI can accelerate progress on ${primaryOutcome}.`,
                    type: 'assessment',
                    priority: 'high',
                    estimatedHours: 24
                });
            case 'pilot':
                return build({
                    title: `Pilot AI workflow within ${departmentName}`,
                    description: `Implement a focused proof of concept to validate AI impact and address ${primaryChallenge}.`,
                    type: 'implementation',
                    priority: 'high',
                    estimatedHours: 32
                });
            case 'rollout':
                return build({
                    title: `Scale AI processes across ${departmentName}`,
                    description: 'Deploy training, documentation, and support to embed the new AI-enabled workflow.',
                    type: 'implementation',
                    priority: 'high',
                    estimatedHours: 30
                });
            case 'measurement':
                return build({
                    title: `Review performance of AI initiatives`,
                    description: 'Monitor KPIs, adoption data, and stakeholder feedback to refine operations.',
                    type: 'assessment',
                    priority: 'medium',
                    estimatedHours: 18
                });
            case 'innovation':
                return build({
                    title: `Plan next-wave AI enhancements`,
                    description: `Identify additional automation and analytics opportunities for ${departmentName}.`,
                    type: 'implementation',
                    priority: 'medium',
                    estimatedHours: 20
                });
            default:
                return null;
        }
    }

    private makeDepartmentTask(
        department: string,
        config: {
            title: string;
            description: string;
            type: PhaseTask['type'];
            priority: PhaseTask['priority'];
            estimatedHours: number;
            dependencies?: string[];
        }
    ): PhaseTask {
        return {
            title: config.title,
            description: config.description,
            type: config.type,
            priority: config.priority,
            department,
            estimated_hours: config.estimatedHours,
            dependencies: config.dependencies ?? []
        };
    }

    private identifyDepartmentProfile(name: string): 'academic' | 'it' | 'student' | 'default' {
        const normalized = (name || '').toLowerCase();
        if (
            normalized.includes('academic') ||
            normalized.includes('curriculum') ||
            normalized.includes('instruction') ||
            normalized.includes('learning')
        ) {
            return 'academic';
        }
        if (
            normalized.includes('it') ||
            normalized.includes('technology') ||
            normalized.includes('tech') ||
            normalized.includes('information')
        ) {
            return 'it';
        }
        if (
            normalized.includes('student') ||
            normalized.includes('enrollment') ||
            normalized.includes('advis')
        ) {
            return 'student';
        }
        return 'default';
    }

    private distributePhaseBudgets(phases: ImplementationPhase[], budgetRange: string): ImplementationPhase[] {
        if (phases.length === 0) {
            return phases;
        }

        const baseWeights = [0.24, 0.26, 0.22, 0.18, 0.1];
        const normalizedWeights = phases.map((_, index) => baseWeights[index] ?? 1 / phases.length);
        const totalWeight = normalizedWeights.reduce((sum, weight) => sum + weight, 0) || 1;
        const totalBudget = this.parseBudgetRange(budgetRange);

        return phases.map((phase, index) => ({
            ...phase,
            budget: Math.floor((normalizedWeights[index] / totalWeight) * totalBudget)
        }));
    }

    private getDepartmentResources(profile: string): string[] {
        switch (profile) {
            case 'academic':
                return [
                    'Faculty AI champions',
                    'Instructional designers',
                    'Academic technology specialists',
                    'Learning analytics support'
                ];
            case 'it':
                return [
                    'Cloud architects',
                    'Data engineers',
                    'Security analysts',
                    'Integration specialists'
                ];
            case 'student':
                return [
                    'Advising leads',
                    'Student success analysts',
                    'Communications specialist',
                    'Support operations manager'
                ];
            default:
                return [
                    'Department leadership sponsor',
                    'Process owner',
                    'Project analyst',
                    'Training facilitator'
                ];
        }
    }

    private getDepartmentTraining(profile: string): TrainingRequirement[] {
        switch (profile) {
            case 'academic':
                return [
                    {
                        topic: 'AI-enhanced pedagogy and assessment',
                        audience: 'Faculty & instructional designers',
                        duration: '6 hours',
                        format: 'hybrid',
                        frequency: 'Quarterly'
                    },
                    {
                        topic: 'Learning analytics with AI',
                        audience: 'Department chairs & assessment leads',
                        duration: '4 hours',
                        format: 'online',
                        frequency: 'Biannual'
                    }
                ];
            case 'it':
                return [
                    {
                        topic: 'AI infrastructure & MLOps foundations',
                        audience: 'IT engineers & architects',
                        duration: '8 hours',
                        format: 'in-person',
                        frequency: 'Quarterly'
                    },
                    {
                        topic: 'Security & compliance for AI workloads',
                        audience: 'IT security & compliance teams',
                        duration: '4 hours',
                        format: 'online',
                        frequency: 'Quarterly'
                    }
                ];
            case 'student':
                return [
                    {
                        topic: 'AI-powered student success workflows',
                        audience: 'Advisors & student support staff',
                        duration: '4 hours',
                        format: 'hybrid',
                        frequency: 'Monthly refreshers'
                    },
                    {
                        topic: 'Responsible use of student data in AI tools',
                        audience: 'Student services leadership',
                        duration: '3 hours',
                        format: 'online',
                        frequency: 'Biannual'
                    }
                ];
            default:
                return [
                    {
                        topic: 'AI fundamentals for department leaders',
                        audience: 'Department leadership team',
                        duration: '4 hours',
                        format: 'hybrid',
                        frequency: 'Quarterly'
                    },
                    {
                        topic: 'Operationalizing AI initiatives',
                        audience: 'Project and operations managers',
                        duration: '5 hours',
                        format: 'in-person',
                        frequency: 'Quarterly'
                    }
                ];
        }
    }

    private buildDepartmentOverview(deptGoal: DepartmentGoal): string {
        const challenge =
            deptGoal.challenges && deptGoal.challenges.length > 0
                ? deptGoal.challenges[0]
                : 'drive adoption across teams';
        const outcome =
            deptGoal.outcomes && deptGoal.outcomes.length > 0
                ? deptGoal.outcomes[0]
                : 'deliver measurable AI benefits';
        return `AI roadmap for ${deptGoal.department} focused on resolving ${challenge} and achieving ${outcome}.`;
    }

    private buildDefaultDepartmentGoals(deptGoal: DepartmentGoal): string[] {
        return [
            `Define priority AI use cases for ${deptGoal.department}`,
            `Launch first AI-enabled workflow within ${deptGoal.department}`,
            `Establish change champions and support structures for ${deptGoal.department}`
        ];
    }

    private buildDepartmentSuccessMetrics(deptGoal: DepartmentGoal, profile: string): string[] {
        const metrics: string[] = [];

        (deptGoal.outcomes || []).slice(0, 2).forEach((outcome) => {
            metrics.push(`Progress toward: ${outcome}`);
        });

        switch (profile) {
            case 'academic':
                metrics.push('AI-supported courses increased by 30%');
                metrics.push('Faculty AI confidence above 80%');
                metrics.push('Student performance uplift of 10% in AI-enhanced courses');
                break;
            case 'it':
                metrics.push('AI platform uptime above 99%');
                metrics.push('Integration delivery cycle time reduced by 40%');
                metrics.push('Zero critical security incidents related to AI workloads');
                break;
            case 'student':
                metrics.push('Student response time under 5 minutes via AI channels');
                metrics.push('Student satisfaction with support services up by 15%');
                metrics.push('At-risk students identified two weeks earlier on average');
                break;
            default:
                metrics.push(`AI adoption within ${deptGoal.department} above 75%`);
                metrics.push('Documented ROI meets or exceeds forecast');
                metrics.push('Staff productivity improved by 20% through AI automation');
        }

        return Array.from(new Set(metrics));
    }

    private calculatePhaseBudget(budgetRange: string, percentage: number): number {
        const budget = this.parseBudgetRange(budgetRange);
        return Math.floor(budget * percentage);
    }

    private parseBudgetRange(range: string): number {
        const map: Record<string, number> = {
            'under10k': 8000,
            '10k-50k': 30000,
            '50k-100k': 75000,
            '100k-250k': 175000,
            'over250k': 300000
        };
        return map[range] || 75000;
    }

    private addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    private generateDefaultExecutiveSummary(metrics: any, maturityLevel: string): string {
        // Check if we have new AI metrics or legacy metrics
        const hasAIMetrics = metrics.airs && metrics.aics && metrics.aims && metrics.aips && metrics.aibs;

        if (hasAIMetrics) {
            return `This AI Implementation Blueprint provides a comprehensive roadmap for transforming your institution's educational delivery and operational efficiency through strategic AI adoption. 

    With an overall AI Readiness Index (AIRIX) score of ${Math.round(metrics.airix?.overallScore || 0)}% and a ${maturityLevel} maturity level, your institution is positioned to begin a thoughtful AI transformation journey. The assessment reveals key strengths in infrastructure and resources (${Math.round(metrics.airs.overallScore)}%), staff capabilities (${Math.round(metrics.aics.overallScore)}%), and implementation readiness (${Math.round(metrics.aims.overallScore)}%), while identifying opportunities for growth in policy frameworks (${Math.round(metrics.aips.overallScore)}%) and benefit realization (${Math.round(metrics.aibs.overallScore)}%).

    This blueprint outlines a phased approach to AI implementation that balances innovation with risk management, ensuring sustainable adoption while delivering measurable value. Through careful planning and execution, your institution can expect to see significant improvements in student outcomes, operational efficiency, and competitive positioning in the evolving educational landscape.`;
        } else {
            // Fallback for legacy metrics
            return `This AI Implementation Blueprint provides a comprehensive roadmap for transforming your institution's educational delivery and operational efficiency through strategic AI adoption. 

    With an overall readiness score of ${metrics.overall}% and a ${maturityLevel} maturity level, your institution is positioned to begin a thoughtful AI transformation journey. The assessment reveals key strengths in data systems (${metrics.dsch?.score}%) and leadership engagement (${metrics.lei?.score}%), while identifying opportunities for growth in change readiness (${metrics.crf?.score}%).

    This blueprint outlines a phased approach to AI implementation that balances innovation with risk management, ensuring sustainable adoption while delivering measurable value. Through careful planning and execution, your institution can expect to see significant improvements in student outcomes, operational efficiency, and competitive positioning in the evolving educational landscape.`;
        }
    }

    private getKeyStrengthsText(metrics: any): string {
        // Check if we have new AI metrics
        if (metrics.airs && metrics.aics && metrics.aims && metrics.aips && metrics.aibs) {
            const strengths = [];
            if (metrics.airs.overallScore > 60) strengths.push(`Infrastructure & Resources (${Math.round(metrics.airs.overallScore)}%)`);
            if (metrics.aics.overallScore > 60) strengths.push(`Capability & Competence (${Math.round(metrics.aics.overallScore)}%)`);
            if (metrics.aims.overallScore > 60) strengths.push(`Implementation Maturity (${Math.round(metrics.aims.overallScore)}%)`);
            if (metrics.aips.overallScore > 60) strengths.push(`Policy & Ethics (${Math.round(metrics.aips.overallScore)}%)`);
            if (metrics.aibs.overallScore > 60) strengths.push(`Benefits Realization (${Math.round(metrics.aibs.overallScore)}%)`);

            return strengths.length > 0 ? strengths.join(', ') : 'Building foundational capabilities across all domains';
        } else {
            // Fallback for legacy metrics
            return `DSCH (${metrics.dsch?.score || 0}%), LEI (${metrics.lei?.score || 0}%), CRF (${metrics.crf?.score || 0}%)`;
        }
    }

    private getMitigationStrategy(risk: Risk): string {
        const strategies: Record<string, Record<string, string>> = {
            adoption: {
                high: 'Implement comprehensive change management program with faculty champions and success stories',
                medium: 'Regular communication and training sessions highlighting AI as augmentation, not replacement',
                low: 'Ongoing support and feedback channels for addressing concerns'
            },
            technical: {
                high: 'Immediate infrastructure assessment and phased upgrade plan with cloud-based solutions',
                medium: 'Gradual infrastructure improvements aligned with implementation phases',
                low: 'Regular capacity monitoring and proactive scaling'
            },
            compliance: {
                high: 'Engage legal counsel and establish strict data governance protocols',
                medium: 'Develop comprehensive AI data privacy policies and training',
                low: 'Regular compliance audits and policy updates'
            },
            financial: {
                high: 'Detailed cost analysis and phased implementation with clear ROI milestones',
                medium: 'Regular budget reviews and contingency planning',
                low: 'Quarterly financial assessments and adjustments'
            },
            organizational: {
                high: 'Executive sponsor program and regular leadership briefings',
                medium: 'Monthly steering committee meetings and progress reports',
                low: 'Quarterly leadership reviews and celebrations of wins'
            }
        };

        return strategies[risk.category]?.[risk.probability] || 'Develop targeted mitigation plan';
    }

    private getMitigationOwner(category: string): string {
        const owners: Record<string, string> = {
            adoption: 'Change Management Lead',
            technical: 'Chief Technology Officer',
            compliance: 'Chief Compliance Officer',
            financial: 'Chief Financial Officer',
            organizational: 'Executive Sponsor'
        };
        return owners[category] || 'Project Manager';
    }

    private getMitigationResources(category: string): string[] {
        const resources: Record<string, string[]> = {
            adoption: ['Change management consultant', 'Communication materials', 'Training resources'],
            technical: ['IT team', 'Infrastructure budget', 'External consultants'],
            compliance: ['Legal counsel', 'Compliance tools', 'Training materials'],
            financial: ['Financial analyst', 'Budget tracking tools', 'Contingency funds'],
            organizational: ['Executive time', 'Communication channels', 'Success metrics']
        };
        return resources[category] || ['Project team', 'Budget allocation'];
    }
}