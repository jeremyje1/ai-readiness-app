/**
 * Assessment Hook
 * Integrates audience-specific assessment banks with autosave functionality
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAudience } from '@/lib/audience/AudienceContext';
import { 
  AssessmentProgress, 
  AssessmentAutosave, 
  generateSessionId, 
  calculateProgress 
} from './autosave';

// Assessment bank types
interface AssessmentQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'text';
  question: string;
  options?: Array<{
    value: string;
    text: string;
    score: number;
  }>;
  scale?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  required: boolean;
  category: string;
}

interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: AssessmentQuestion[];
}

interface AssessmentBank {
  bankId: string;
  version: string;
  audience: string;
  title: string;
  description: string;
  lastUpdated: string;
  estimatedDuration: string;
  sections: AssessmentSection[];
  scoringRubric: {
    maxScore: number;
    levels: Array<{
      level: string;
      range: { min: number; max: number };
      description: string;
      recommendations: string[];
    }>;
  };
  focusAreas: string[];
}

interface AssessmentState {
  bank: AssessmentBank | null;
  currentSection: number;
  currentQuestion: number;
  responses: Record<string, any>;
  completedSections: string[];
  sessionId: string;
  progress: AssessmentProgress | null;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
}

interface AssessmentHookReturn {
  // State
  state: AssessmentState;
  
  // Assessment data
  currentSectionData: AssessmentSection | null;
  currentQuestionData: AssessmentQuestion | null;
  progressPercent: number;
  totalQuestions: number;
  
  // Actions
  loadAssessment: (sessionId?: string) => Promise<void>;
  answerQuestion: (questionId: string, answer: any) => Promise<void>;
  nextQuestion: () => Promise<void>;
  previousQuestion: () => Promise<void>;
  goToSection: (sectionIndex: number) => Promise<void>;
  completeAssessment: () => Promise<void>;
  resetAssessment: () => void;
  
  // Autosave
  saveStatus: {
    isSaving: boolean;
    hasPending: boolean;
    retryCount: number;
  };
  forceSave: () => Promise<{ success: boolean; error?: string }>;
}

/**
 * Assessment hook with audience awareness and autosave
 */
export function useAssessment(userId?: string): AssessmentHookReturn {
  const { audience } = useAudience();
  
  const [state, setState] = useState<AssessmentState>({
    bank: null,
    currentSection: 0,
    currentQuestion: 0,
    responses: {},
    completedSections: [],
    sessionId: generateSessionId(),
    progress: null,
    isLoading: false,
    error: null,
    isComplete: false
  });
  
  const [autosave] = useState(() => new AssessmentAutosave({
    debounceMs: 500,
    retryAttempts: 3,
    enableOptimisticUI: true
  }));
  
  const [saveStatus, setSaveStatus] = useState(autosave.getSaveStatus());

  // Load assessment bank for current audience
  const loadAssessmentBank = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/assessment/banks?audience=${audience}&format=full`);
      
      if (!response.ok) {
        throw new Error(`Failed to load assessment bank: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        bank: data.bank,
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error loading assessment bank:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load assessment',
        isLoading: false
      }));
    }
  }, [audience]);

  // Load existing progress or start new assessment
  const loadAssessment = useCallback(async (existingSessionId?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const sessionId = existingSessionId || state.sessionId;
      
      // Try to load existing progress
      const progress = await autosave.loadProgress(sessionId, userId);
      
      if (progress) {
        // Resume existing assessment
        setState(prev => ({
          ...prev,
          sessionId,
          responses: progress.responses,
          completedSections: progress.completedSections,
          isComplete: progress.isComplete,
          progress,
          isLoading: false
        }));
        
        // Find current section and question indices
        if (state.bank) {
          const sectionIndex = state.bank.sections.findIndex(s => s.id === progress.currentSection);
          const section = state.bank.sections[sectionIndex];
          const questionIndex = section ? section.questions.findIndex(q => q.id === progress.currentQuestion) : 0;
          
          setState(prev => ({
            ...prev,
            currentSection: Math.max(0, sectionIndex),
            currentQuestion: Math.max(0, questionIndex)
          }));
        }
      } else {
        // Start new assessment
        setState(prev => ({
          ...prev,
          sessionId,
          isLoading: false
        }));
      }
      
    } catch (error) {
      console.error('Error loading assessment progress:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load progress',
        isLoading: false
      }));
    }
  }, [autosave, userId, state.sessionId, state.bank]);

  // Save progress
  const saveProgress = useCallback(async () => {
    if (!state.bank) return;
    
    const currentSection = state.bank.sections[state.currentSection];
    const currentQuestion = currentSection?.questions[state.currentQuestion];
    
    if (!currentSection || !currentQuestion) return;
    
    const totalQuestions = state.bank.sections.reduce((sum, s) => sum + s.questions.length, 0);
    const progressPercent = calculateProgress(state.responses, totalQuestions);
    
    const progress: AssessmentProgress = {
      assessmentId: state.bank.bankId,
      audience,
      userId,
      sessionId: state.sessionId,
      currentSection: currentSection.id,
      currentQuestion: currentQuestion.id,
      responses: state.responses,
      completedSections: state.completedSections,
      startedAt: state.progress?.startedAt || new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
      progressPercent,
      isComplete: state.isComplete,
      metadata: {
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        source: 'assessment-hook'
      }
    };
    
    const result = await autosave.saveProgress(progress);
    setSaveStatus(autosave.getSaveStatus());
    
    return result;
  }, [state, audience, userId, autosave]);

  // Answer question
  const answerQuestion = useCallback(async (questionId: string, answer: any) => {
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: answer
      }
    }));
    
    // Auto-save after answering
    setTimeout(() => saveProgress(), 100);
  }, [saveProgress]);

  // Navigation functions
  const nextQuestion = useCallback(async () => {
    if (!state.bank) return;
    
    const currentSection = state.bank.sections[state.currentSection];
    const isLastQuestion = state.currentQuestion >= currentSection.questions.length - 1;
    const isLastSection = state.currentSection >= state.bank.sections.length - 1;
    
    if (isLastQuestion && !isLastSection) {
      // Move to next section
      setState(prev => {
        const newCompletedSections = [...prev.completedSections];
        const currentSectionId = state.bank!.sections[prev.currentSection].id;
        if (!newCompletedSections.includes(currentSectionId)) {
          newCompletedSections.push(currentSectionId);
        }
        
        return {
          ...prev,
          currentSection: prev.currentSection + 1,
          currentQuestion: 0,
          completedSections: newCompletedSections
        };
      });
    } else if (!isLastQuestion) {
      // Move to next question
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    } else {
      // Complete assessment
      await completeAssessment();
    }
    
    await saveProgress();
  }, [state.bank, state.currentSection, state.currentQuestion, saveProgress]);

  const previousQuestion = useCallback(async () => {
    if (state.currentQuestion > 0) {
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
    } else if (state.currentSection > 0) {
      const previousSection = state.bank!.sections[state.currentSection - 1];
      setState(prev => ({
        ...prev,
        currentSection: prev.currentSection - 1,
        currentQuestion: previousSection.questions.length - 1
      }));
    }
    
    await saveProgress();
  }, [state.currentSection, state.currentQuestion, state.bank, saveProgress]);

  const goToSection = useCallback(async (sectionIndex: number) => {
    if (state.bank && sectionIndex >= 0 && sectionIndex < state.bank.sections.length) {
      setState(prev => ({
        ...prev,
        currentSection: sectionIndex,
        currentQuestion: 0
      }));
      
      await saveProgress();
    }
  }, [state.bank, saveProgress]);

  const completeAssessment = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isComplete: true
    }));
    
    await saveProgress();
  }, [saveProgress]);

  const resetAssessment = useCallback(() => {
    const newSessionId = generateSessionId();
    setState({
      bank: state.bank,
      currentSection: 0,
      currentQuestion: 0,
      responses: {},
      completedSections: [],
      sessionId: newSessionId,
      progress: null,
      isLoading: false,
      error: null,
      isComplete: false
    });
    
    // Clear saved progress
    autosave.clearProgress(state.sessionId);
  }, [state.bank, state.sessionId, autosave]);

  const forceSave = useCallback(async () => {
    const result = await autosave.forceSave();
    setSaveStatus(autosave.getSaveStatus());
    return result;
  }, [autosave]);

  // Load assessment bank when audience changes
  useEffect(() => {
    loadAssessmentBank();
  }, [loadAssessmentBank]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autosave.cleanup();
    };
  }, [autosave]);

  // Calculated values
  const currentSectionData = state.bank?.sections[state.currentSection] || null;
  const currentQuestionData = currentSectionData?.questions[state.currentQuestion] || null;
  const totalQuestions = state.bank?.sections.reduce((sum, s) => sum + s.questions.length, 0) || 0;
  const progressPercent = calculateProgress(state.responses, totalQuestions);

  return {
    state,
    currentSectionData,
    currentQuestionData,
    progressPercent,
    totalQuestions,
    loadAssessment,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToSection,
    completeAssessment,
    resetAssessment,
    saveStatus,
    forceSave
  };
}