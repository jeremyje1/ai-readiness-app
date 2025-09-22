'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowRight,
    Building,
    CheckCircle,
    Clock,
    FileText,
    Lightbulb,
    Target,
    Upload,
    Users
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface OnboardingData {
    // Organization Info
    organizationName: string;
    organizationType: 'K12' | 'HigherEd' | 'District' | 'University' | 'Community College' | 'Other';
    role: string;
    department: string;

    // Contact Info
    name: string;
    email: string;
    phone?: string;

    // Context & Goals
    currentAIUse: string;
    primaryGoals: string;
    challenges: string;
    timeline: string;

    // Document Uploads
    uploadedFiles: File[];
}

export default function AIReadinessOnboarding() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const assessmentMode = searchParams.get('mode') || 'quick';
    const [currentStep, setCurrentStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        organizationName: '',
        organizationType: 'K12',
        role: '',
        department: '',
        name: '',
        email: '',
        phone: '',
        currentAIUse: '',
        primaryGoals: '',
        challenges: '',
        timeline: '',
        uploadedFiles: []
    });
    const [isDragOver, setIsDragOver] = useState(false);

    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    useEffect(() => {
        // Auto-detect institution type from URL/domain
        const hostname = window.location.hostname;
        if (hostname.includes('highered')) {
            setData(prev => ({ ...prev, organizationType: 'HigherEd' }));
        }
    }, []);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg'
    ];

    const validateAndAddFiles = (files: File[]) => {
        const validFiles: File[] = [];
        const errors: string[] = [];

        files.forEach(file => {
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name} is too large (max 10MB)`);
            } else if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`${file.name} is not a supported file type`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            alert('Some files could not be uploaded:\n' + errors.join('\n'));
        }

        if (validFiles.length > 0) {
            setData(prev => ({
                ...prev,
                uploadedFiles: [...prev.uploadedFiles, ...validFiles]
            }));
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        validateAndAddFiles(files);
        // Reset the input so the same file can be selected again if needed
        event.target.value = '';
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        const files = Array.from(event.dataTransfer.files || []);
        validateAndAddFiles(files);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const removeFile = (index: number) => {
        setData(prev => ({
            ...prev,
            uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
        }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            // Save onboarding data and proceed to assessment (client-side only)
            if (typeof window !== 'undefined') {
                localStorage.setItem('ai_readiness_onboarding', JSON.stringify(data));
                
                // Save institution type separately for persistence
                const institutionType = (data.organizationType === 'K12' || data.organizationType === 'District') ? 'K12' : 'HigherEd';
                localStorage.setItem('ai_blueprint_institution_type', institutionType);
            }
            router.push(`/ai-readiness/assessment?mode=${assessmentMode}&tier=ai-readiness-comprehensive&onboarded=true`);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return data.organizationName && data.organizationType && data.role;
            case 2:
                return data.name && data.email;
            case 3:
                return data.primaryGoals && data.currentAIUse;
            case 4:
                return true; // Document upload is optional
            default:
                return false;
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Building className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Tell Us About Your Organization</h2>
                            <p className="text-gray-600">Help us customize the assessment for your specific context</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Organization Name *</label>
                                <Input
                                    value={data.organizationName}
                                    onChange={(e) => setData(prev => ({ ...prev, organizationName: e.target.value }))}
                                    placeholder="e.g., Riverside School District, Central State University"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Organization Type *</label>
                                <select
                                    value={data.organizationType}
                                    onChange={(e) => setData(prev => ({ ...prev, organizationType: e.target.value as any }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="K12">K-12 School District</option>
                                    <option value="HigherEd">Higher Education</option>
                                    <option value="University">University</option>
                                    <option value="Community College">Community College</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Your Role *</label>
                                <Input
                                    value={data.role}
                                    onChange={(e) => setData(prev => ({ ...prev, role: e.target.value }))}
                                    placeholder="e.g., Superintendent, CIO, Technology Director, Dean"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Department/Division</label>
                                <Input
                                    value={data.department}
                                    onChange={(e) => setData(prev => ({ ...prev, department: e.target.value }))}
                                    placeholder="e.g., Information Technology, Academic Affairs"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
                            <p className="text-gray-600">We'll use this to send your personalized results</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name *</label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address *</label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="your.email@organization.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                                <Input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <Target className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">AI Context & Goals</h2>
                            <p className="text-gray-600">Help us understand your current situation and objectives</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Current AI Use *</label>
                                <Textarea
                                    value={data.currentAIUse}
                                    onChange={(e) => setData(prev => ({ ...prev, currentAIUse: e.target.value }))}
                                    placeholder="Describe any AI tools, platforms, or initiatives your organization currently uses. If none, write 'None currently.'"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Primary Goals & Objectives *</label>
                                <Textarea
                                    value={data.primaryGoals}
                                    onChange={(e) => setData(prev => ({ ...prev, primaryGoals: e.target.value }))}
                                    placeholder="What do you hope to achieve with AI? (e.g., improve student outcomes, streamline administration, enhance teaching)"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Key Challenges</label>
                                <Textarea
                                    value={data.challenges}
                                    onChange={(e) => setData(prev => ({ ...prev, challenges: e.target.value }))}
                                    placeholder="What obstacles or concerns do you have regarding AI adoption? (e.g., budget, training, policy)"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Implementation Timeline</label>
                                <select
                                    value={data.timeline}
                                    onChange={(e) => setData(prev => ({ ...prev, timeline: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select timeframe...</option>
                                    <option value="immediate">Immediate (0-3 months)</option>
                                    <option value="short">Short-term (3-6 months)</option>
                                    <option value="medium">Medium-term (6-12 months)</option>
                                    <option value="long">Long-term (1+ years)</option>
                                    <option value="exploring">Just exploring options</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <FileText className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Supporting Documents</h2>
                            <p className="text-gray-600">Upload relevant documents to enhance your assessment (Optional)</p>
                        </div>

                        <div className="space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 hover:border-blue-400'
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                                <p className="text-lg font-medium mb-2">
                                    {isDragOver ? 'Drop files here' : 'Upload Supporting Documents'}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    {isDragOver ? 'Release to upload' : 'Drag and drop files here, or click to browse'}
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Button type="button" variant="outline" className="pointer-events-none">
                                        Choose Files
                                    </Button>
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    Supports PDF, Word, Text, and Image files (Max 10MB each)
                                </p>
                            </div>

                            {data.uploadedFiles.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-900">Uploaded Files ({data.uploadedFiles.length}):</h4>
                                    {data.uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex">
                                    <Lightbulb className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-1">Helpful Documents Include:</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Strategic technology plans</li>
                                            <li>• Current AI or technology policies</li>
                                            <li>• Budget allocations for technology</li>
                                            <li>• Staff training documentation</li>
                                            <li>• Data governance policies</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Readiness Assessment Setup
                    </h1>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-lg text-gray-600">
                            {assessmentMode === 'quick' ? '8-10 minutes' : '25-35 minutes'} • Step {currentStep} of {totalSteps}
                        </span>
                    </div>
                    <Progress value={progress} className="w-full max-w-md mx-auto" />
                </div>

                {/* Main Content */}
                <Card className="p-8 mb-8">
                    {renderStep()}
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2"
                    >
                        ← Previous
                    </Button>

                    <div className="text-sm text-gray-500">
                        Step {currentStep} of {totalSteps}
                    </div>

                    <Button
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className="flex items-center gap-2"
                    >
                        {currentStep === totalSteps ? 'Start Assessment' : 'Next'}
                        {currentStep === totalSteps ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Assessment Info */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <Card className="p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Personalized Results</h3>
                        <p className="text-sm text-gray-600">
                            Your responses will generate customized recommendations for your organization
                        </p>
                    </Card>

                    <Card className="p-6 text-center">
                        <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Focused Questions</h3>
                        <p className="text-sm text-gray-600">
                            Streamlined assessment covering the most critical AI readiness factors
                        </p>
                    </Card>

                    <Card className="p-6 text-center">
                        <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Actionable Report</h3>
                        <p className="text-sm text-gray-600">
                            Receive a detailed report with specific next steps and implementation guidance
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
