import { useEffect, useState } from 'react';

// Custom hook for persistent assessment state
export function useAssessmentPersistence(assessmentId: string, tier: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    if (!assessmentId || typeof window === 'undefined') return;
    
    const loadProgress = () => {
      try {
        const saved = localStorage.getItem(`assessment-progress-${assessmentId}`);
        if (saved) {
          const data = JSON.parse(saved);
          console.log('📥 Loading saved progress:', data);
          
          setResponses(data.responses || {});
          setCurrentQuestionIndex(data.currentIndex || 0);
          setLastSaved(data.lastSaved ? new Date(data.lastSaved) : null);
          setHasUnsavedChanges(false);
          
          console.log('✅ Progress restored:', {
            responseCount: Object.keys(data.responses || {}).length,
            currentIndex: data.currentIndex || 0
          });
        }
      } catch (error) {
        console.error('❌ Failed to load progress:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadProgress();
  }, [assessmentId]);

  // Auto-save function
  const saveProgress = async (forceManual = false) => {
    if (!assessmentId || (!hasUnsavedChanges && !forceManual)) return;

    try {
      if (!forceManual) setAutoSaving(true);
      
      const progressData = {
        responses,
        currentIndex: currentQuestionIndex,
        lastSaved: new Date().toISOString(),
        tier,
        questionCount: 0 // Will be updated by caller
      };

      // Always save to localStorage first (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment-progress-${assessmentId}`, JSON.stringify(progressData));
        console.log('💾 Progress saved to localStorage:', {
          responseCount: Object.keys(responses).length,
          currentIndex: currentQuestionIndex
        });
      }

      // Try to save to database
      try {
        const response = await fetch('/api/ai-readiness/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentId, ...progressData })
        });
        
        if (response.ok) {
          console.log('☁️ Progress saved to database');
        }
      } catch (dbError) {
        console.warn('⚠️ Database save failed, localStorage backup used');
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('❌ Save failed:', error);
      return false;
    } finally {
      if (!forceManual) setAutoSaving(false);
    }
  };

  // Update responses with immediate save trigger
  const updateResponse = (questionId: string, value: number) => {
    console.log('📝 Updating response:', { questionId, value });
    
    setResponses(prev => {
      const updated = { ...prev, [questionId]: value };
      console.log('📋 Updated responses:', updated);
      return updated;
    });
    
    setHasUnsavedChanges(true);
  };

  // Update current question index
  const updateCurrentIndex = (index: number) => {
    console.log('📍 Updating current index:', index);
    setCurrentQuestionIndex(index);
    setHasUnsavedChanges(true);
  };

  // Auto-save interval
  useEffect(() => {
    if (!isLoaded || !assessmentId) return;

    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        console.log('🔄 Auto-saving...');
        saveProgress();
      }
    }, 5000); // Save every 5 seconds for more responsive feel

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, isLoaded, assessmentId, responses, currentQuestionIndex]);

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    isLoaded,
    responses,
    currentQuestionIndex,
    lastSaved,
    autoSaving,
    hasUnsavedChanges,
    updateResponse,
    updateCurrentIndex,
    saveProgress: () => saveProgress(true)
  };
}
