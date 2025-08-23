/**
 * AI Readiness Assessmexport default function AIReadinessAssessmentPage() {
  const searchParams = useSearchParams();
  const rawTier = searchParams.get('tier') || 'comprehensive';
  
  // Map tier variations to valid tier names
  const tierMapping: Record<string, string> = {
    'comprehensive': 'ai-readiness-comprehensive',
    'ai-readiness-comprehensive': 'ai-readiness-comprehensive',
    'blueprint': 'ai-transformation-blueprint',
    'ai-transformation-blueprint': 'ai-transformation-blueprint',
    'pulse': 'higher-ed-ai-pulse-check',
    'higher-ed-ai-pulse-check': 'higher-ed-ai-pulse-check',
    'enterprise': 'ai-enterprise-partnership',
    'ai-enterprise-partnership': 'ai-enterprise-partnership'
  };
  
  const tier = tierMapping[rawTier] || 'ai-readiness-comprehensive';
  
  const [questions, setQuestions] = useState<Question[]>();age  
 * Main assessment interface for AI readiness evaluation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
// import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/progress';
import { EnhancedFileUpload } from '@/components/enhanced-file-upload';
import { CheckCircle, Clock, FileText, ArrowRight, Upload } from 'lucide-react';

interface Question {
  id: string;
  section: string;
  prompt: string;
  type: string;
  required: boolean;
  helpText?: string;
  enableContext?: boolean;
  contextPrompt?: string;
}

export default function AIReadinessAssessmentPage() {
  const searchParams = useSearchParams();
  const rawTier = searchParams.get('tier') || 'comprehensive';
  
  // Clean up tier parameter (remove any query string contamination)
  const cleanTier = rawTier.split('?')[0].split('&')[0];
  
  // Map tier variations to valid tier names
  const tierMapping: Record<string, string> = {
    'comprehensive': 'ai-readiness-comprehensive',
    'ai-readiness-comprehensive': 'ai-readiness-comprehensive',
    'blueprint': 'ai-transformation-blueprint',
    'ai-transformation-blueprint': 'ai-transformation-blueprint',
    'pulse': 'higher-ed-ai-pulse-check',
    'higher-ed-ai-pulse-check': 'higher-ed-ai-pulse-check',
    'enterprise': 'ai-enterprise-partnership',
    'ai-enterprise-partnership': 'ai-enterprise-partnership'
  };
  
  const tier = tierMapping[cleanTier] || 'ai-readiness-comprehensive';
  
  console.log('🎯 Tier processing:', { rawTier, cleanTier, finalTier: tier });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institutionType, setInstitutionType] = useState<string>('default');

  useEffect(() => {
    // Detect domain context
    const hostname = window.location.hostname;
    if (hostname.includes('k12aiblueprint.com')) {
      setInstitutionType('K12');
    } else if (hostname.includes('higheredaiblueprint.com')) {
      setInstitutionType('HigherEd');
    }
    
    fetchQuestions();
  }, [tier]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('Fetching questions for tier:', tier);
      const response = await fetch(`/api/ai-readiness/questions?tier=${tier}`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setQuestions(data.data.questions);
        console.log('Questions set:', data.data.questions.length);
      } else {
        console.error('API returned error:', data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Add more robust submission data
      const submissionData = {
        responses,
        tier,
        institutionName: 'Educational Institution',
        contactEmail: 'admin@institution.edu',
        contactName: 'Assessment Administrator',
        industry: 'higher-education',
        userId: `user-${Date.now()}`,
        uploadedFiles: uploadedDocuments,
        testMode: false,
        assessmentType: 'ai-readiness'
      };
      
      console.log('📤 Submitting assessment:', { tier, responseCount: Object.keys(responses).length });
      
      const response = await fetch('/api/ai-readiness/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Assessment submitted successfully:', result);
        
        // Redirect to results page instead of dashboard
        window.location.href = `/ai-readiness/results?id=${result.id}`;
      } else {
        console.error('❌ Assessment submission failed:', result);
        alert(`Failed to submit assessment: ${result.error || 'Unknown error'}. Please try again.`);
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isAnswered = currentQuestion ? responses[currentQuestion.id] !== undefined : false;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = Object.keys(responses).length === questions.length;
  const showDocuments = allQuestionsAnswered && (tier === 'ai-readiness-comprehensive' || tier === 'ai-transformation-blueprint');
  const requiresDocuments = tier === 'ai-readiness-comprehensive' || tier === 'ai-transformation-blueprint';

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No questions available for this tier.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {institutionType === 'K12' ? 'K-12 AI Readiness Assessment' : 
                 institutionType === 'HigherEd' ? 'Higher Education AI Readiness Assessment' : 
                 'AI Readiness Assessment'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Question {currentQuestionIndex + 1} of {questions.length} • {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Progress</div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <Card className="p-8">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-2">{currentQuestion.section}</div>
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                    {currentQuestion.prompt}
                  </h2>
                  {currentQuestion.helpText && (
                    <p className="text-sm text-gray-600 mt-3">{currentQuestion.helpText}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Response Options */}
            <div className="mb-8">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 5, label: 'Strongly Agree / Fully ready', color: 'green' },
                  { value: 4, label: 'Agree / Mostly ready', color: 'blue' },
                  { value: 3, label: 'Neutral / Somewhat ready', color: 'yellow' },
                  { value: 2, label: 'Disagree / Minimally ready', color: 'orange' },
                  { value: 1, label: 'Strongly Disagree / Not at all ready', color: 'red' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleResponse(currentQuestion.id, option.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      responses[currentQuestion.id] === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {responses[currentQuestion.id] === option.value && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Context Input (if enabled) */}
            {currentQuestion.enableContext && isAnswered && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {currentQuestion.contextPrompt || 'Additional context (optional)'}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Provide additional details or context..."
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                onClick={handlePrevious}
                variant="outline"
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                {Object.keys(responses).length} of {questions.length} answered
              </div>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isAnswered || saving}
                  className="min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Complete Assessment'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="min-w-[120px]"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
