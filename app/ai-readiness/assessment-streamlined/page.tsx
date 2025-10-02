'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Save,
  Send
} from 'lucide-react';
import { streamlinedQuestions, getCategoryLabel, getCategoryDescription, type StreamlinedQuestion } from '@/lib/assessment/streamlined-questions';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

export default function StreamlinedAssessment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, updateProfile } = useUserProfile();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalQuestions = streamlinedQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const question = streamlinedQuestions[currentQuestion];

  // Load saved responses from user profile
  useEffect(() => {
    if (profile?.assessment_context) {
      setResponses(profile.assessment_context);
    }
  }, [profile]);

  // Auto-save progress
  const saveProgress = async () => {
    if (!profile) return;

    setIsSaving(true);
    await updateProfile({
      assessment_context: responses
    });
    setIsSaving(false);
  };

  // Save on response change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      const timeoutId = setTimeout(saveProgress, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [responses]);

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultiSelect = (questionId: string, option: string) => {
    const current = responses[questionId] || [];
    const updated = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    handleResponse(questionId, updated);
  };

  const isQuestionAnswered = (q: StreamlinedQuestion) => {
    if (!q.required) return true;
    const answer = responses[q.id];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === 'string') return answer.trim().length > 0;
    if (typeof answer === 'number') return answer >= 0;
    return false;
  };

  const canProceed = isQuestionAnswered(question);

  const handleNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Save final responses to profile
      await updateProfile({
        assessment_context: responses
      });

      // Submit to assessment API
      const response = await fetch('/api/ai-readiness/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          tier: 'ai-readiness-comprehensive',
          mode: 'streamlined',
          institutionName: profile?.institution_name,
          contactEmail: profile?.email,
          contactName: profile?.full_name,
          userId: profile?.user_id,
          assessmentType: 'streamlined'
        })
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/ai-readiness/results?id=${result.id}`);
      } else {
        throw new Error(result.error || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Assessment submission error:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'textarea':
        return (
          <Textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={6}
            className="w-full text-base"
          />
        );

      case 'select':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleResponse(question.id, option)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  responses[question.id] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{option}</span>
                  {responses[question.id] === option && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const selected = (responses[question.id] || []).includes(option);
              return (
                <button
                  key={option}
                  onClick={() => handleMultiSelect(question.id, option)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selected} />
                    <span className="text-base">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponse(question.id, parseInt(e.target.value) || 0)}
            placeholder={question.placeholder}
            className="w-full text-base"
            min="0"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">AI Readiness Assessment</h1>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Save className="w-4 h-4 animate-pulse" />
                <span>Saving...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline" className="text-base px-4 py-1">
              {getCategoryLabel(question.category)}
            </Badge>
            <span className="text-gray-600">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {question.question}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h2>
                {question.helpText && (
                  <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{question.helpText}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {renderQuestionInput()}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="flex items-center gap-2"
          >
            {currentQuestion === totalQuestions - 1 ? (
              <>
                {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                <Send className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Category Progress */}
        <div className="mt-12 p-6 bg-white rounded-lg border">
          <h3 className="font-semibold mb-4">Assessment Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['leadership', 'infrastructure', 'skills', 'policy', 'implementation'].map((cat) => {
              const categoryQuestions = streamlinedQuestions.filter(q => q.category === cat);
              const answeredCount = categoryQuestions.filter(q => isQuestionAnswered(q)).length;
              const isCurrentCategory = question.category === cat;

              return (
                <div
                  key={cat}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCurrentCategory
                      ? 'border-blue-500 bg-blue-50'
                      : answeredCount === categoryQuestions.length
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{getCategoryLabel(cat)}</div>
                  <div className="text-xs text-gray-600">
                    {answeredCount}/{categoryQuestions.length} answered
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
