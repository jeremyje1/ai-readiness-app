/**
 * Audience-Aware Assessment Component
 * Modern assessment interface with audience-specific questions and autosave
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAssessment } from '@/lib/assessment/useAssessment';
import { useAudience } from '@/lib/audience/AudienceContext';
import { useAudienceAnalytics } from '@/lib/analytics/audienceAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Clock,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Users,
  GraduationCap
} from 'lucide-react';

interface AudienceAwareAssessmentProps {
  userId?: string;
  sessionId?: string;
  onComplete?: (results: any) => void;
}

export function AudienceAwareAssessment({ 
  userId, 
  sessionId, 
  onComplete 
}: AudienceAwareAssessmentProps) {
  const { audience, config } = useAudience();
  const analytics = useAudienceAnalytics(audience, userId);
  const assessment = useAssessment(userId);
  
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  // Initialize assessment
  useEffect(() => {
    assessment.loadAssessment(sessionId);
    
    // Track assessment start
    if (assessment.state.bank) {
      analytics.trackAssessment('started', {
        assessmentId: assessment.state.bank.bankId,
        sessionId: assessment.state.sessionId
      });
    }
  }, [sessionId, assessment.state.bank?.bankId]);

  // Load current answer when question changes
  useEffect(() => {
    if (assessment.currentQuestionData) {
      const savedAnswer = assessment.state.responses[assessment.currentQuestionData.id];
      setCurrentAnswer(savedAnswer || null);
    }
  }, [assessment.currentQuestionData, assessment.state.responses]);

  // Show save indicator when saving
  useEffect(() => {
    if (assessment.saveStatus.isSaving) {
      setShowSaveIndicator(true);
      const timeout = setTimeout(() => setShowSaveIndicator(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [assessment.saveStatus.isSaving]);

  // Handle answer submission
  const handleAnswer = async (answer: any) => {
    if (!assessment.currentQuestionData) return;
    
    setCurrentAnswer(answer);
    await assessment.answerQuestion(assessment.currentQuestionData.id, answer);
    
    // Track question answered
    analytics.trackAssessment('question_answered', {
      assessmentId: assessment.state.bank?.bankId,
      sectionId: assessment.currentSectionData?.id,
      questionId: assessment.currentQuestionData.id,
      questionType: assessment.currentQuestionData.type
    });
  };

  // Handle navigation
  const handleNext = async () => {
    if (assessment.currentQuestionData && currentAnswer !== null) {
      await assessment.answerQuestion(assessment.currentQuestionData.id, currentAnswer);
    }
    
    // Check if this completes a section
    const currentSection = assessment.currentSectionData;
    const isLastQuestion = currentSection && assessment.state.currentQuestion >= currentSection.questions.length - 1;
    
    if (isLastQuestion) {
      analytics.trackAssessment('section_completed', {
        assessmentId: assessment.state.bank?.bankId,
        sectionId: currentSection.id,
        timeSpent: Date.now() // Could track actual time spent
      });
    }
    
    await assessment.nextQuestion();
    
    // Check if assessment is complete
    if (assessment.state.isComplete) {
      analytics.trackAssessment('completed', {
        assessmentId: assessment.state.bank?.bankId,
        finalScore: assessment.progressPercent,
        totalQuestions: assessment.totalQuestions
      });
    }
  };

  const handlePrevious = async () => {
    await assessment.previousQuestion();
  };

  // Render question input based on type
  const renderQuestionInput = () => {
    if (!assessment.currentQuestionData) return null;

    const question = assessment.currentQuestionData;

    switch (question.type) {
      case 'single_choice':
        return (
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_choice':
        const currentAnswers = currentAnswer || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={currentAnswers.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswer([...currentAnswers, option.value]);
                    } else {
                      handleAnswer(currentAnswers.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'scale':
        if (!question.scale) return null;
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.scale.minLabel}</span>
              <span>{question.scale.maxLabel}</span>
            </div>
            <Slider
              defaultValue={[currentAnswer || question.scale.min]}
              onValueChange={([value]) => handleAnswer(value)}
              min={question.scale.min}
              max={question.scale.max}
              step={1}
              className="w-full"
            />
            <div className="text-center text-lg font-medium">
              {currentAnswer || question.scale.min}
            </div>
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Enter your response..."
            className="min-h-[100px]"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  // Loading state
  if (assessment.state.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading assessment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (assessment.state.error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {assessment.state.error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No assessment loaded
  if (!assessment.state.bank) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center p-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assessment available for this audience.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completion state
  if (assessment.state.isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <CardDescription>
              Thank you for completing the {assessment.state.bank.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{assessment.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{assessment.progressPercent}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{assessment.state.completedSections.length}</div>
                <div className="text-sm text-gray-600">Sections</div>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <Button onClick={assessment.resetAssessment} variant="outline">
                Take Assessment Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bank = assessment.state.bank;
  const section = assessment.currentSectionData;
  const question = assessment.currentQuestionData;

  if (!section || !question) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No current question available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {audience === 'k12' ? (
            <GraduationCap className="w-6 h-6 text-blue-600" />
          ) : (
            <Users className="w-6 h-6 text-blue-600" />
          )}
          <Badge variant="outline" className="text-sm">
            {config.name} Assessment
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{bank.title}</h1>
        <p className="text-gray-600">{bank.description}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Est. {bank.estimatedDuration}</span>
          </span>
          <span className="flex items-center space-x-2">
            {showSaveIndicator && (
              <>
                <Save className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
            <span>{assessment.progressPercent}% Complete</span>
          </span>
        </div>
        <Progress value={assessment.progressPercent} className="h-2" />
      </div>

      {/* Current Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Section {assessment.state.currentSection + 1} of {bank.sections.length}
            </Badge>
            <Badge variant="outline">
              {assessment.state.currentQuestion + 1} of {section.questions.length}
            </Badge>
          </div>
          <CardTitle className="text-lg">{section.title}</CardTitle>
          <CardDescription>{section.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div>
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            {renderQuestionInput()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={assessment.state.currentSection === 0 && assessment.state.currentQuestion === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              Question {assessment.state.currentQuestion + 1} of {section.questions.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={question.required && (currentAnswer === null || currentAnswer === '')}
            >
              {assessment.state.currentSection === bank.sections.length - 1 && 
               assessment.state.currentQuestion === section.questions.length - 1 ? 
                'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {bank.sections.map((sectionItem, index) => (
              <Button
                key={sectionItem.id}
                variant={index === assessment.state.currentSection ? "default" : "outline"}
                size="sm"
                onClick={() => assessment.goToSection(index)}
                className="text-xs h-8"
              >
                {assessment.state.completedSections.includes(sectionItem.id) && (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {index + 1}. {sectionItem.title}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}