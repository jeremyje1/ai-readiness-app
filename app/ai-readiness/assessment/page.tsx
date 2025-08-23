/**
 * AI Readiness Assessment Page - Basic Version for Testing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Progress } from '@/components/progress';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  section: string;
  prompt: string;
  type: string;
  required: boolean;
  helpText?: string;
}

export default function AIReadinessAssessmentPage() {
  const searchParams = useSearchParams();
  const rawTier = searchParams.get('tier') || 'comprehensive';
  
  // Clean up tier parameter
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
  
  // Assessment state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institutionType, setInstitutionType] = useState<string>('default');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

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

  // Load saved progress when assessment ID becomes available
  useEffect(() => {
    if (assessmentId && questions.length > 0) {
      loadSavedProgress();
    }
  }, [assessmentId, questions.length]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (assessmentId && Object.keys(responses).length > 0) {
      const interval = setInterval(async () => {
        await saveProgress();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [assessmentId, responses, currentQuestionIndex]);

  const saveProgress = async () => {
    if (!assessmentId) return;
    
    try {
      setAutoSaving(true);
      
      // Save to localStorage
      const progressData = {
        responses,
        currentIndex: currentQuestionIndex,
        lastSaved: new Date().toISOString(),
        tier,
        questionCount: questions.length
      };
      
      localStorage.setItem(`assessment-progress-${assessmentId}`, JSON.stringify(progressData));
      
      // Also save to database
      try {
        await fetch('/api/ai-readiness/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId,
            ...progressData
          })
        });
      } catch (dbError) {
        console.warn('Database save failed, using localStorage only');
      }
      
      setLastSaved(new Date());
      console.log('✅ Progress saved:', progressData);
    } catch (error) {
      console.error('❌ Save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const loadSavedProgress = () => {
    if (!assessmentId) return;
    
    try {
      const saved = localStorage.getItem(`assessment-progress-${assessmentId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setResponses(data.responses || {});
        setCurrentQuestionIndex(data.currentIndex || 0);
        setLastSaved(data.lastSaved ? new Date(data.lastSaved) : null);
        console.log('📥 Progress loaded:', data);
      }
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('Fetching questions for tier:', tier);
      const response = await fetch(`/api/ai-readiness/questions?tier=${tier}`);
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.data.questions);
        console.log('Questions set:', data.data.questions.length);
        
        // Load saved progress after questions are loaded and assessment ID is set
        if (assessmentId) {
          loadSavedProgress();
        }
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
      
      // Save progress before submitting
      await saveProgress();
      
      const submissionData = {
        responses,
        tier,
        institutionName: 'Educational Institution',
        contactEmail: 'admin@institution.edu',
        contactName: 'Assessment Administrator',
        industry: 'higher-education',
        userId: `user-${Date.now()}`,
        uploadedFiles: [],
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
  
  // Calculate section-based progress
  const totalSections = [...new Set(questions.map(q => q.section))].length;
  const currentSectionIndex = questions.findIndex(q => q.section === currentQuestion?.section);
  const questionsInCurrentSection = questions.filter(q => q.section === currentQuestion?.section).length;
  const currentPositionInSection = questions.slice(0, currentQuestionIndex + 1).filter(q => q.section === currentQuestion?.section).length;
  
  // Milestone achievements
  const getMilestone = (progress: number) => {
    if (progress >= 100) return { emoji: '🎉', text: 'Assessment Complete!', color: 'text-green-600' };
    if (progress >= 75) return { emoji: '🏁', text: 'Final Quarter - Almost Done!', color: 'text-green-600' };
    if (progress >= 50) return { emoji: '⭐', text: 'Halfway There - Great Progress!', color: 'text-blue-600' };
    if (progress >= 25) return { emoji: '🚀', text: 'Quarter Complete - Keep Going!', color: 'text-purple-600' };
    return { emoji: '💪', text: 'Getting Started - You\'ve Got This!', color: 'text-blue-600' };
  };
  
  const milestone = getMilestone(progress);

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
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length} • {Object.keys(responses).length} answered
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-blue-600">{Math.round(progress)}% Complete</span>
                    <span className={`${milestone.color} flex items-center gap-1`}>
                      <span>{milestone.emoji}</span>
                      <span className="hidden sm:inline">{milestone.text}</span>
                    </span>
                  </div>
                </div>
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
                </div>
                {/* Manual Save Button */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={saveProgress}
                  disabled={autoSaving}
                  className="flex items-center gap-1 text-xs"
                >
                  Save Now
                </Button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Section: {currentQuestion?.section}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              {/* Milestone markers */}
              <div className="absolute top-0 left-1/4 w-1 h-3 bg-purple-400 rounded-full opacity-60"></div>
              <div className="absolute top-0 left-1/2 w-1 h-3 bg-blue-400 rounded-full opacity-60"></div>
              <div className="absolute top-0 left-3/4 w-1 h-3 bg-green-400 rounded-full opacity-60"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              
              {/* Value reinforcement - show periodically */}
              {(currentQuestionIndex + 1) % 15 === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-lg">💡</div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Your Personalized Insights Are Building</h4>
                      <p className="text-blue-800 text-sm">
                        Each thoughtful response helps us create more precise, actionable recommendations specifically for your organization. 
                        The thorough assessment you're completing will generate a customized AI transformation roadmap worth thousands in consulting value.
                      </p>
                    </div>
                  </div>
                </div>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6 py-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allQuestionsAnswered || saving}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-6 py-2"
                  >
                    {saving ? 'Submitting...' : 'Complete Assessment'}
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
