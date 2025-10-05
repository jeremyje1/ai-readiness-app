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

export default function GoalSettingWizard({ assessmentId, onComplete, onCancel }: GoalSettingWizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [primaryGoals, setPrimaryGoals] = useState<string[]>([]);
    const [customGoal, setCustomGoal] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);
    const [implementationStyle, setImplementationStyle] = useState<'aggressive' | 'moderate' | 'cautious'>('moderate');
    const [pilotPreference, setPilotPreference] = useState(true);
    const [trainingCapacity, setTrainingCapacity] = useState(5);
    const [timeline, setTimeline] = useState('6months');
    const [budgetRange, setBudgetRange] = useState('50k-100k');

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
        setDepartments([...departments, {
            department: '',
            challenges: [],
            outcomes: [],
            budget: 0,
            timeline: '6months'
        }]);
    };

    const removeDepartment = (index: number) => {
        setDepartments(departments.filter((_, i) => i !== index));
    };

    const updateDepartment = (index: number, field: keyof Department, value: any) => {
        const updated = [...departments];
        updated[index] = { ...updated[index], [field]: value };
        setDepartments(updated);
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
                                <option value="3months">3 Months (Fast Track)</option>
                                <option value="6months">6 Months (Recommended)</option>
                                <option value="1year">1 Year (Comprehensive)</option>
                                <option value="18months">18 Months (Gradual)</option>
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
                                    <div key={i} className="text-sm text-gray-600">
                                        • {dept.department}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Style:</span> {implementationStyle}
                            </div>
                            <div>
                                <span className="font-medium">Timeline:</span> {timeline}
                            </div>
                            <div>
                                <span className="font-medium">Budget:</span> {budgetRange}
                            </div>
                            <div>
                                <span className="font-medium">Training:</span> {trainingCapacity} hrs/week
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <p className="text-sm text-indigo-900">
                                <strong>Next Step:</strong> We'll generate a comprehensive AI implementation blueprint based on
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