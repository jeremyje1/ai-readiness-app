'use client';

import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Textarea } from '@/components/textarea';
import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Plus,
    Target,
    Users,
    X
} from 'lucide-react';
import { useState } from 'react';

interface Department {
    department: string;
    challenges: string[];
    outcomes: string[];
    budget: number;
    timeline: string;
}

interface LearningObjective {
    grade: string;
    subject: string;
    currentMetrics: Record<string, number>;
    targetMetrics: Record<string, number>;
}

interface GoalSettingWizardProps {
    assessmentId: string;
    onComplete: (goalsId: string) => void;
    onCancel?: () => void;
}

const timelineOptions = [
    { value: '3months', label: '3 Months (Fast Track)' },
    { value: '6months', label: '6 Months (Recommended)' },
    { value: '1year', label: '1 Year (Comprehensive)' },
    { value: '18months', label: '18 Months (Gradual)' }
];

const recommendedDepartmentTemplates: Department[] = [
    {
        department: 'Academic Affairs',
        challenges: [
            'Align curriculum with AI competencies and accreditation standards',
            'Build faculty confidence in AI-enhanced pedagogy'
        ],
        outcomes: [
            'AI-ready curricula with measurable learning outcomes',
            'Faculty development pathways for AI integration'
        ],
        budget: 60000,
        timeline: '6months'
    },
    {
        department: 'Information Technology',
        challenges: [
            'Integrate AI tools with legacy systems securely',
            'Ensure data pipelines and governance support AI usage'
        ],
        outcomes: [
            'Scalable AI infrastructure and integration playbooks',
            'Automated monitoring and security for AI workloads'
        ],
        budget: 90000,
        timeline: '6months'
    },
    {
        department: 'Student Services',
        challenges: [
            'Provide 24/7 support without overextending teams',
            'Identify and assist at-risk students earlier'
        ],
        outcomes: [
            'AI-powered advising workflows and chatbot support',
            'Predictive analytics to trigger timely student interventions'
        ],
        budget: 45000,
        timeline: '6months'
    }
];

const cloneDepartment = (template: Department): Department => ({
    department: template.department,
    challenges: [...template.challenges],
    outcomes: [...template.outcomes],
    budget: template.budget,
    timeline: template.timeline
});

export default function GoalSettingWizard({ assessmentId, onComplete, onCancel }: GoalSettingWizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [primaryGoals, setPrimaryGoals] = useState<string[]>([]);
    const [customGoal, setCustomGoal] = useState('');
    const [departments, setDepartments] = useState<Department[]>(() =>
        recommendedDepartmentTemplates.map((template) => cloneDepartment(template))
    );
    const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);
    const [implementationStyle, setImplementationStyle] = useState<'aggressive' | 'moderate' | 'cautious'>('moderate');
    const [pilotPreference, setPilotPreference] = useState(true);
    const [trainingCapacity, setTrainingCapacity] = useState(5);
    const [timeline, setTimeline] = useState('6months');
    const [budgetRange, setBudgetRange] = useState('50k-100k');

    const budgetRangeLabels: Record<string, string> = {
        under10k: 'Under $10,000',
        '10k-50k': '$10,000 - $50,000',
        '50k-100k': '$50,000 - $100,000',
        '100k-250k': '$100,000 - $250,000',
        over250k: 'Over $250,000'
    };

    const isTemplateActive = (template: Department) =>
        departments.some(
            (dept) => dept.department.toLowerCase() === template.department.toLowerCase()
        );

    const handleTemplateToggle = (template: Department) => {
        setDepartments((current) => {
            const exists = current.some(
                (dept) => dept.department.toLowerCase() === template.department.toLowerCase()
            );

            if (exists) {
                return current.filter(
                    (dept) => dept.department.toLowerCase() !== template.department.toLowerCase()
                );
            }

            return [...current, cloneDepartment(template)];
        });
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(Math.max(0, value || 0));

    const getTimelineLabel = (value: string) =>
        timelineOptions.find((option) => option.value === value)?.label || value;

    const predefinedGoals = [
        'Improve student learning outcomes',
        'Reduce administrative burden',
        'Enhance faculty productivity',
        'Improve decision-making with data',
        'Increase operational efficiency',
        'Attract and retain top talent',
        'Ensure responsible AI use',
        'Competitive advantage in education'
    ];

    const toggleGoal = (goal: string) => {
        if (primaryGoals.includes(goal)) {
            setPrimaryGoals(primaryGoals.filter(g => g !== goal));
        } else {
            setPrimaryGoals([...primaryGoals, goal]);
        }
    };

    const addCustomGoal = () => {
        if (customGoal.trim() && !primaryGoals.includes(customGoal.trim())) {
            setPrimaryGoals([...primaryGoals, customGoal.trim()]);
            setCustomGoal('');
        }
    };

    const addDepartment = () => {
        setDepartments((current) => [
            ...current,
            {
                department: '',
                challenges: [],
                outcomes: [],
                budget: 0,
                timeline
            }
        ]);
    };

    const removeDepartment = (index: number) => {
        setDepartments((current) => current.filter((_, i) => i !== index));
    };

    const updateDepartment = (index: number, field: keyof Department, value: any) => {
        setDepartments((current) =>
            current.map((dept, i) => {
                if (i !== index) return dept;

                switch (field) {
                    case 'budget': {
                        const numericValue =
                            typeof value === 'number'
                                ? value
                                : parseInt(String(value || 0), 10);
                        return {
                            ...dept,
                            budget: Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0
                        };
                    }
                    case 'timeline':
                        return { ...dept, timeline: value || '6months' };
                    case 'department':
                        return { ...dept, department: value };
                    case 'challenges':
                        return { ...dept, challenges: Array.isArray(value) ? value : [] };
                    case 'outcomes':
                        return { ...dept, outcomes: Array.isArray(value) ? value : [] };
                    default:
                        return dept;
                }
            })
        );
    };

    const handleSubmit = async () => {
        if (primaryGoals.length === 0) {
            alert('Please select at least one primary goal');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/blueprint/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessment_id: assessmentId,
                    primary_goals: primaryGoals,
                    department_goals: departments,
                    learning_objectives: learningObjectives,
                    implementation_style: implementationStyle,
                    pilot_preference: pilotPreference,
                    training_capacity: trainingCapacity,
                    timeline_preference: timeline,
                    budget_range: budgetRange
                })
            });

            if (!response.ok) throw new Error('Failed to save goals');

            const data = await response.json();
            onComplete(data.id);
        } catch (error) {
            console.error('Error saving goals:', error);
            alert('Failed to save goals. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && primaryGoals.length === 0) {
            alert('Please select at least one primary goal');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div
                            key={s}
                            className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step > s ? <CheckCircle2 className="h-6 w-6" /> : s}
                            </div>
                            {s < 4 && (
                                <div
                                    className={`flex-1 h-1 mx-2 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Goals</span>
                    <span>Departments</span>
                    <span>Preferences</span>
                    <span>Review</span>
                </div>
            </div>

            {/* Step 1: Primary Goals */}
            {step === 1 && (
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Target className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-2xl font-bold">What are your primary goals?</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Select all that apply. These will guide your AI implementation blueprint.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {predefinedGoals.map((goal) => (
                            <button
                                key={goal}
                                onClick={() => toggleGoal(goal)}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${primaryGoals.includes(goal)
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <div
                                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${primaryGoals.includes(goal)
                                            ? 'border-indigo-600 bg-indigo-600'
                                            : 'border-gray-300'
                                            }`}
                                    >
                                        {primaryGoals.includes(goal) && (
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <span className="font-medium">{goal}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="border-t pt-6">
                        <Label>Add Custom Goal (Optional)</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                value={customGoal}
                                onChange={(e) => setCustomGoal(e.target.value)}
                                placeholder="Enter a custom goal..."
                                onKeyPress={(e) => e.key === 'Enter' && addCustomGoal()}
                            />
                            <Button onClick={addCustomGoal} disabled={!customGoal.trim()}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {primaryGoals.length > 0 && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <p className="font-medium text-green-900 mb-2">
                                Selected Goals ({primaryGoals.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {primaryGoals.map((goal) => (
                                    <Badge key={goal} variant="default">
                                        {goal}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Step 2: Department Goals */}
            {step === 2 && (
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-2xl font-bold">Department-Specific Goals</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Add specific departments that will be involved in AI implementation (optional).
                    </p>

                    <div className="mb-6">
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Suggested Departments
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {recommendedDepartmentTemplates.map((template) => {
                                const active = isTemplateActive(template);
                                return (
                                    <button
                                        key={template.department}
                                        type="button"
                                        onClick={() => handleTemplateToggle(template)}
                                        className={`rounded-lg border-2 p-4 text-left transition-all ${active
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-dashed border-gray-300 hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">{template.department}</span>
                                            {active ? (
                                                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                            ) : (
                                                <Plus className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <p className="mt-2 text-xs text-gray-600">
                                            {template.outcomes[0]}
                                        </p>
                                        <p className="mt-3 text-xs text-gray-500">
                                            {formatCurrency(template.budget)} • {getTimelineLabel(template.timeline)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Toggle to include strategic teams like Academic Affairs, IT, and Student Services. You can add additional departments below.
                        </p>
                    </div>

                    {departments.length === 0 && (
                        <div className="mb-4 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                            No departments selected yet. Use the buttons above to include recommended teams or add your own below.
                        </div>
                    )}

                    {departments.map((dept, index) => (
                        <Card key={index} className="p-4 mb-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-4">
                                <Label>Department {index + 1}</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDepartment(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Department Name</Label>
                                    <Input
                                        value={dept.department}
                                        onChange={(e) => updateDepartment(index, 'department', e.target.value)}
                                        placeholder="e.g., Mathematics, Administration, IT"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Budget Allocation ($)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={dept.budget}
                                            onChange={(e) => updateDepartment(index, 'budget', e.target.value)}
                                            placeholder="e.g., 60000"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Estimated investment reserved for this department.
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Timeline Focus</Label>
                                        <select
                                            value={dept.timeline}
                                            onChange={(e) => updateDepartment(index, 'timeline', e.target.value)}
                                            className="w-full rounded-lg border p-3"
                                        >
                                            {timelineOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Key Challenges (comma-separated)</Label>
                                    <Textarea
                                        value={dept.challenges.join(', ')}
                                        onChange={(e) =>
                                            updateDepartment(
                                                index,
                                                'challenges',
                                                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                                            )
                                        }
                                        placeholder="Enter challenges this department faces..."
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label>Desired Outcomes (comma-separated)</Label>
                                    <Textarea
                                        value={dept.outcomes.join(', ')}
                                        onChange={(e) =>
                                            updateDepartment(
                                                index,
                                                'outcomes',
                                                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                                            )
                                        }
                                        placeholder="Enter desired outcomes..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Button onClick={addDepartment} variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Department
                    </Button>
                </Card>
            )}

            {/* Step 3: Implementation Preferences */}
            {step === 3 && (
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-2xl font-bold">Implementation Preferences</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label className="text-lg mb-3 block">Implementation Style</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {[
                                    { value: 'cautious', label: 'Cautious', desc: 'Slow and steady' },
                                    { value: 'moderate', label: 'Moderate', desc: 'Balanced approach' },
                                    { value: 'aggressive', label: 'Aggressive', desc: 'Fast implementation' }
                                ].map((style) => (
                                    <button
                                        key={style.value}
                                        onClick={() => setImplementationStyle(style.value as any)}
                                        className={`p-4 rounded-lg border-2 text-center ${implementationStyle === style.value
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <p className="font-bold">{style.label}</p>
                                        <p className="text-sm text-gray-600">{style.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="text-lg mb-3 block">Timeline Preference</Label>
                            <select
                                value={timeline}
                                onChange={(e) => setTimeline(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                            >
                                {timelineOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-lg mb-3 block">Budget Range</Label>
                            <select
                                value={budgetRange}
                                onChange={(e) => setBudgetRange(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                            >
                                <option value="under10k">Under $10,000</option>
                                <option value="10k-50k">$10,000 - $50,000</option>
                                <option value="50k-100k">$50,000 - $100,000</option>
                                <option value="100k-250k">$100,000 - $250,000</option>
                                <option value="over250k">Over $250,000</option>
                            </select>
                        </div>

                        <div>
                            <Label className="text-lg mb-3 block">Training Capacity</Label>
                            <p className="text-sm text-gray-600 mb-2">
                                Hours per week your team can dedicate to AI training
                            </p>
                            <Input
                                type="number"
                                value={trainingCapacity}
                                onChange={(e) => setTrainingCapacity(parseInt(e.target.value) || 0)}
                                min="1"
                                max="40"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="pilot"
                                checked={pilotPreference}
                                onChange={(e) => setPilotPreference(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <Label htmlFor="pilot" className="cursor-pointer">
                                Start with pilot programs before full implementation
                            </Label>
                        </div>
                    </div>
                </Card>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-2xl font-bold">Review Your Goals</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold mb-2">Primary Goals ({primaryGoals.length})</h3>
                            <div className="flex flex-wrap gap-2">
                                {primaryGoals.map((goal) => (
                                    <Badge key={goal} variant="default">{goal}</Badge>
                                ))}
                            </div>
                        </div>

                        {departments.length > 0 && (
                            <div>
                                <h3 className="font-bold mb-2">Departments ({departments.length})</h3>
                                {departments.map((dept, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm text-gray-600">
                                        <span>• {dept.department || 'Unnamed Department'}</span>
                                        <span className="text-gray-500">
                                            {formatCurrency(dept.budget)} • {getTimelineLabel(dept.timeline)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Style:</span>{' '}
                                {implementationStyle.charAt(0).toUpperCase() + implementationStyle.slice(1)}
                            </div>
                            <div>
                                <span className="font-medium">Timeline:</span> {getTimelineLabel(timeline)}
                            </div>
                            <div>
                                <span className="font-medium">Budget:</span> {budgetRangeLabels[budgetRange] || budgetRange}
                            </div>
                            <div>
                                <span className="font-medium">Training:</span> {trainingCapacity} hrs/week
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <p className="text-sm text-indigo-900">
                                <strong>Next Step:</strong> We&rsquo;ll generate a comprehensive AI implementation blueprint based on
                                your goals and your assessment results. This typically takes 2-3 minutes.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <Button
                    variant="outline"
                    onClick={step === 1 ? onCancel : prevStep}
                    disabled={isSubmitting}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {step === 1 ? 'Cancel' : 'Previous'}
                </Button>

                {step < 4 ? (
                    <Button onClick={nextStep}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating Blueprint...' : 'Generate Blueprint'}
                    </Button>
                )}
            </div>
        </div>
    );
}