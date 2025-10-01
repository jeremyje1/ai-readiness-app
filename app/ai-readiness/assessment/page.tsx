/**
 * AI Readiness Assessment Page - Basic Version for Testing
 */

'use client';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Progress } from '@/components/progress';
import { Textarea } from '@/components/textarea';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Question {
  id: string;
  section: string;
  question: string;
  type: 'scale_with_context' | 'open_ended' | 'upload';
  required: boolean;
  helpText?: string;
  scaleLabels?: {
    low: string;
    high: string;
  };
}

export default function AIReadinessAssessmentPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'quick';

  // Assessment state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { value?: number; context?: string; text?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [institutionType, setInstitutionType] = useState<string>('default');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

  // Initialize assessment ID and load questions
  useEffect(() => {
    // First check localStorage for saved institution type
    const savedType = localStorage.getItem('ai_blueprint_institution_type');
    if (savedType === 'K12' || savedType === 'HigherEd') {
      setInstitutionType(savedType);
    } else {
      // Then check onboarding data
      const onboardingData = localStorage.getItem('ai_readiness_onboarding');
      if (onboardingData) {
        try {
          const parsed = JSON.parse(onboardingData);
          const orgType = parsed.organizationType;
          if (orgType === 'K12' || orgType === 'District') {
            setInstitutionType('K12');
            localStorage.setItem('ai_blueprint_institution_type', 'K12');
          } else if (orgType === 'HigherEd' || orgType === 'University' || orgType === 'Community College') {
            setInstitutionType('HigherEd');
            localStorage.setItem('ai_blueprint_institution_type', 'HigherEd');
          }
        } catch (e) {
          console.error('Failed to parse onboarding data:', e);
        }
      }
      
      // Finally fall back to domain detection
      const hostname = window.location.hostname;
      if (hostname.includes('k12')) {
        setInstitutionType('K12');
        localStorage.setItem('ai_blueprint_institution_type', 'K12');
      } else if (hostname.includes('highered')) {
        setInstitutionType('HigherEd');
        localStorage.setItem('ai_blueprint_institution_type', 'HigherEd');
      }
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
  }, [mode]);

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
        mode,
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

      // Get mode from URL params or onboarding data
      const mode = searchParams.get('mode') || 'quick';

      console.log('Fetching questions for mode:', mode);
      const response = await fetch(`/api/ai-readiness/questions?mode=${mode}`);
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
        console.log('Questions loaded:', data.questions.length);

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

  const handleResponse = (questionId: string, value?: number, context?: string, text?: string) => {
    console.log('🔄 Response updated:', { questionId, value, context, text });
    setResponses(prev => {
      const updated = {
        ...prev,
        [questionId]: { value, context, text }
      };

      // Immediate save to localStorage on every answer
      if (assessmentId) {
        const progressData = {
          responses: updated,
          currentIndex: currentQuestionIndex,
          lastSaved: new Date().toISOString(),
          questionCount: questions.length
        };
        localStorage.setItem(`assessment-progress-${assessmentId}`, JSON.stringify(progressData));
        console.log('💾 Answer auto-saved immediately');
      }

      return updated;
    });

    // Also trigger async database save (non-blocking)
    setTimeout(() => saveProgress(), 100);
  };

  // Add beforeunload protection to save on page exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (assessmentId && Object.keys(responses).length > 0) {
        // Final save attempt
        const progressData = {
          responses,
          currentIndex: currentQuestionIndex,
          lastSaved: new Date().toISOString(),
          mode,
          questionCount: questions.length
        };
        localStorage.setItem(`assessment-progress-${assessmentId}`, JSON.stringify(progressData));

        // Show warning for unsaved changes
        e.preventDefault();
        e.returnValue = 'Your progress has been saved. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [assessmentId, responses, currentQuestionIndex, mode, questions.length]);

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
        mode,
        institutionName: 'Educational Institution',
        contactEmail: 'admin@institution.edu',
        contactName: 'Assessment Administrator',
        industry: 'higher-education',
        userId: `user-${Date.now()}`,
        uploadedFiles: [],
        testMode: false,
        assessmentType: 'ai-readiness'
      };

      console.log('📤 Submitting assessment:', { mode, responseCount: Object.keys(responses).length });

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

  // Updated validation logic for new question types
  const isAnswered = currentQuestion ? (() => {
    const response = responses[currentQuestion.id];
    if (!response) return false;

    if (currentQuestion.type === 'scale_with_context') {
      return response.value !== undefined;
    } else if (currentQuestion.type === 'open_ended') {
      return response.text && response.text.trim().length > 0;
    }
    return false;
  })() : false;

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Check if all questions are answered
  const allQuestionsAnswered = questions.every(q => {
    const response = responses[q.id];
    if (!response) return false;

    if (q.type === 'scale_with_context') {
      return response.value !== undefined;
    } else if (q.type === 'open_ended') {
      return response.text && response.text.trim().length > 0;
    }
    return false;
  });

  // Enhanced section-based progress with time estimates
  const sections = [...new Set(questions.map(q => q.section))];
  const currentSectionName = currentQuestion?.section || '';
  const currentSectionIndex = sections.indexOf(currentSectionName);
  const questionsInCurrentSection = questions.filter(q => q.section === currentSectionName).length;
  const answeredInCurrentSection = questions.slice(0, currentQuestionIndex + 1).filter(q => q.section === currentSectionName).length;
  const sectionProgress = questionsInCurrentSection > 0 ? (answeredInCurrentSection / questionsInCurrentSection) * 100 : 0;

  // Time estimates per section (rough estimates)
  const getSectionTimeEstimate = (sectionName: string, questionCount: number) => {
    const baseTime = Math.ceil(questionCount * 1.5); // 1.5 minutes per question
    return `${baseTime}-${baseTime + 5} min`;
  };

  // Section completion rewards
  const getSectionMilestone = (sectionIndex: number, totalSections: number) => {
    const sectionNames = [
      'Foundation', 'Strategy', 'Implementation', 'Culture', 'Compliance'
    ];
    return {
      name: sectionNames[sectionIndex] || `Section ${sectionIndex + 1}`,
      emoji: ['🏗️', '🎯', '⚡', '🤝', '🛡️'][sectionIndex] || '📋',
      completion: `${sectionIndex + 1}/${totalSections} sections`,
      motivational: [
        'Building strong foundations!',
        'Strategic planning excellence!',
        'Implementation ready!',
        'Culture transformation!',
        'Risk management mastery!'
      ][sectionIndex] || 'Great progress!'
    };
  };

  const currentSectionMilestone = getSectionMilestone(currentSectionIndex, sections.length);

  // Overall milestone achievements
  const getMilestone = (progress: number, sectionIndex: number, totalSections: number) => {
    if (progress >= 100) return { emoji: '🎉', text: 'Assessment Complete!', color: 'text-green-600' };
    if (progress >= 75) return { emoji: '🏁', text: 'Final Quarter - Almost Done!', color: 'text-green-600' };
    if (progress >= 50) return { emoji: '⭐', text: 'Halfway There - Great Progress!', color: 'text-blue-600' };
    if (progress >= 25) return { emoji: '🚀', text: 'Quarter Complete - Keep Going!', color: 'text-purple-600' };

    // Section-based encouragement for early progress
    if (sectionIndex === 0) return { emoji: '🏗️', text: 'Foundation Building - Excellent Start!', color: 'text-blue-600' };
    if (sectionIndex === 1) return { emoji: '🎯', text: 'Strategy Development - You\'re Focused!', color: 'text-purple-600' };

    return { emoji: '💪', text: 'Making Great Progress!', color: 'text-blue-600' };
  };

  const milestone = getMilestone(progress, currentSectionIndex, sections.length);

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

          {/* Enhanced Progress Bar with Section Details */}
          <div className="mt-4 space-y-3">
            {/* Section Progress Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentSectionMilestone.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">
                      {currentSectionMilestone.name} ({currentSectionMilestone.completion})
                    </h4>
                    <p className="text-blue-700 text-xs">{currentSectionMilestone.motivational}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-900">{Math.round(sectionProgress)}%</div>
                  <div className="text-xs text-blue-600">section</div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-blue-600 mb-1">
                <span>{answeredInCurrentSection} of {questionsInCurrentSection} questions</span>
                <span>~{getSectionTimeEstimate(currentSectionName, questionsInCurrentSection)}</span>
              </div>
              <Progress value={sectionProgress} className="h-2 bg-blue-100" />
            </div>

            {/* Overall Progress */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress: Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              {/* Section markers instead of arbitrary percentages */}
              {sections.map((_, index) => {
                const sectionStart = (index / sections.length) * 100;
                return (
                  <div
                    key={index}
                    className={`absolute top-0 w-1 h-3 rounded-full opacity-60 ${index <= currentSectionIndex ? 'bg-green-400' : 'bg-gray-300'
                      }`}
                    style={{ left: `${sectionStart}%` }}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              {sections.map((section, index) => (
                <span key={index} className={index <= currentSectionIndex ? 'text-green-600' : ''}>
                  {section.split(' ')[0]}
                </span>
              ))}
            </div>

            {/* Next Section Preview (when close to section completion) */}
            {sectionProgress > 75 && currentSectionIndex < sections.length - 1 && (
              <div className="mt-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">🎯</span>
                  <div className="text-sm">
                    <span className="font-semibold text-green-800">Almost done with {currentSectionName}!</span>
                    <span className="text-green-700 ml-2">
                      Next: {sections[currentSectionIndex + 1]}
                    </span>
                  </div>
                </div>
              </div>
            )}
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
                {currentQuestion.question}
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
            <div className="space-y-6">
              {currentQuestion.type === 'scale_with_context' && (
                <>
                  {/* Scale Response */}
                  <div className="space-y-3">
                    {[
                      { value: 1, label: currentQuestion.scaleLabels?.low || "Low", color: "bg-red-100 border-red-300 text-red-700" },
                      { value: 2, label: "Below Average", color: "bg-orange-100 border-orange-300 text-orange-700" },
                      { value: 3, label: "Average", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
                      { value: 4, label: "Above Average", color: "bg-blue-100 border-blue-300 text-blue-700" },
                      { value: 5, label: currentQuestion.scaleLabels?.high || "High", color: "bg-green-100 border-green-300 text-green-700" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleResponse(
                          currentQuestion.id,
                          option.value,
                          responses[currentQuestion.id]?.context,
                          responses[currentQuestion.id]?.text
                        )}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${responses[currentQuestion.id]?.value === option.value
                            ? option.color
                            : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {responses[currentQuestion.id]?.value === option.value && (
                            <CheckCircle className="w-5 h-5 text-current" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Context Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please provide additional context or specific examples (optional):
                    </label>
                    <Textarea
                      value={responses[currentQuestion.id]?.context || ''}
                      onChange={(e) => handleResponse(
                        currentQuestion.id,
                        responses[currentQuestion.id]?.value,
                        e.target.value,
                        responses[currentQuestion.id]?.text
                      )}
                      placeholder="Share specific examples, challenges, or additional details..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {currentQuestion.type === 'open_ended' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response:
                  </label>
                  <Textarea
                    value={responses[currentQuestion.id]?.text || ''}
                    onChange={(e) => handleResponse(
                      currentQuestion.id,
                      undefined,
                      undefined,
                      e.target.value
                    )}
                    placeholder="Please provide a detailed response..."
                    rows={6}
                    className="w-full"
                  />
                </div>
              )}

              {currentQuestion.type === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="space-y-3">
                      <div className="text-gray-400 text-4xl">📄</div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop files here, or click to browse
                        </p>
                        <input
                          type="file"
                          id={`file-upload-${currentQuestion.id}`}
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              handleResponse(
                                currentQuestion.id,
                                undefined,
                                undefined,
                                `Uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`file-upload-${currentQuestion.id}`}
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                          Browse Files
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported: PDF, DOC, DOCX, TXT, PPT, PPTX
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show uploaded file info or option to skip */}
                  {responses[currentQuestion.id]?.text ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-green-800 font-medium">Files uploaded</p>
                          <p className="text-xs text-green-700 mt-1">{responses[currentQuestion.id].text}</p>
                        </div>
                        <button
                          onClick={() => handleResponse(currentQuestion.id, undefined, undefined, undefined)}
                          className="text-xs text-green-600 hover:text-green-700 underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={() => handleResponse(
                          currentQuestion.id,
                          undefined,
                          undefined,
                          'No files available - will provide later'
                        )}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Skip - I don't have these materials yet
                      </button>
                    </div>
                  )}
                </div>
              )}
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
