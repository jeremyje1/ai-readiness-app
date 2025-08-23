/**
 * AI Readiness Assessment Page
 * Main assessment interface for AI readiness evaluation with auto-save functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Progress } from '@/components/progress';
import { EnhancedFileUpload } from '@/components/enhanced-file-upload';
import { CheckCircle, Clock, FileText, ArrowRight, Upload, Save } from 'lucide-react';
import { useAssessmentPersistence } from '@/hooks/useAssessmentPersistence';

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
  
  // Assessment state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institutionType, setInstitutionType] = useState<string>('default');
  const [assessmentId, setAssessmentId] = useState<string>('');

  // Initialize assessment persistence
  const {
    isLoaded,
    responses,
    currentQuestionIndex,
    lastSaved,
    autoSaving,
    hasUnsavedChanges,
    updateResponse,
    updateCurrentIndex,
    saveProgress
  } = useAssessmentPersistence(assessmentId, tier);

  // Initialize assessment ID and load questions
  useEffect(() => {
    // Detect domain context
    const hostname = window.location.hostname;
    if (hostname.includes('k12aiblueprint.com')) {
      setInstitutionType('K12');
    } else if (hostname.includes('higheredaiblueprint.com')) {
      setInstitutionType('HigherEd');
    }
    
    // Generate or retrieve assessment ID
    const storedAssessmentId = localStorage.getItem('assessment-id');
    if (storedAssessmentId) {
      setAssessmentId(storedAssessmentId);
    } else {
      const newAssessmentId = `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setAssessmentId(newAssessmentId);
      localStorage.setItem('assessment-id', newAssessmentId);
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
    console.log('🔄 Response updated:', { questionId, value });
    updateResponse(questionId, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      console.log('➡️ Moving to next question:', newIndex);
      updateCurrentIndex(newIndex);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      console.log('⬅️ Moving to previous question:', newIndex);
      updateCurrentIndex(newIndex);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Save progress before submitting
      await saveProgress();
      
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
        
        // Clear saved progress
        localStorage.removeItem(`assessment-progress-${assessmentId}`);
        localStorage.removeItem('assessment-id');
        
        // Redirect to results page
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

  if (loading || !isLoaded) {
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
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length} • {Object.keys(responses).length} answered
                </p>
                {/* Save Status */}
                <div className="flex items-center gap-2 text-xs">
                  {autoSaving && (
                    <span className="text-blue-600 flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  )}
                  {lastSaved && !autoSaving && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  {hasUnsavedChanges && !autoSaving && (
                    <span className="text-orange-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Unsaved changes
                    </span>
                  )}
                </div>
                {/* Manual Save Button */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={saveProgress}
                  disabled={autoSaving || !hasUnsavedChanges}
                  className="flex items-center gap-1 text-xs"
                >
                  <Save className="w-3 h-3" />
                  Save Now
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showDocuments ? (
          /* Question Display */
          <Card className="p-8">
            <div className="space-y-6">
              {/* Section Badge */}
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                {currentQuestion.section}
              </div>
              
              {/* Question */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {currentQuestion.prompt}
                </h2>
                
                {currentQuestion.helpText && (
                  <p className="text-gray-600 text-sm mb-4">
                    {currentQuestion.helpText}
                  </p>
                )}
              </div>

              {/* Response Options */}
              <div className="space-y-3">
                {[
                  { value: 1, label: "Strongly Disagree", color: "bg-red-100 border-red-300 text-red-700" },
                  { value: 2, label: "Disagree", color: "bg-orange-100 border-orange-300 text-orange-700" },
                  { value: 3, label: "Neutral", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
                  { value: 4, label: "Agree", color: "bg-blue-100 border-blue-300 text-blue-700" },
                  { value: 5, label: "Strongly Agree", color: "bg-green-100 border-green-300 text-green-700" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleResponse(currentQuestion.id, option.value)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      responses[currentQuestion.id] === option.value
                        ? option.color
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {responses[currentQuestion.id] === option.value && (
                        <CheckCircle className="w-5 h-5 text-current" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                
                <div className="flex gap-3">
                  {!isLastQuestion ? (
                    <Button
                      onClick={handleNext}
                      disabled={!isAnswered}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      {!requiresDocuments ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!allQuestionsAnswered || saving}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        >
                          {saving ? 'Submitting...' : 'Complete Assessment'}
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setShowDocumentUpload(true)}
                          disabled={!allQuestionsAnswered}
                          className="flex items-center gap-2"
                        >
                          Continue to Document Upload
                          <Upload className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          /* Document Upload */
          <div className="space-y-6">
            <Card className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Optional Document Upload
                </h2>
                <p className="text-gray-600">
                  Upload relevant documents to enhance your AI readiness analysis.
                  This step is optional but will provide more personalized insights.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <EnhancedFileUpload
                onFilesUploaded={(files) => {
                  setUploadedDocuments(files);
                }}
              />
              
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDocumentUpload(false)}
                >
                  Back to Questions
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  {saving ? 'Submitting...' : 'Complete Assessment'}
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
