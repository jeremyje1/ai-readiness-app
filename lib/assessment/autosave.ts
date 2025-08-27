/**
 * Assessment Autosave Service
 * Handles automatic saving and resuming of assessment progress
 */

import { Audience } from '../audience/deriveAudience';

export interface AssessmentProgress {
  assessmentId: string;
  audience: Audience;
  userId?: string;
  sessionId: string;
  currentSection: string;
  currentQuestion: string;
  responses: Record<string, any>;
  completedSections: string[];
  startedAt: string;
  lastSavedAt: string;
  progressPercent: number;
  isComplete: boolean;
  metadata: {
    userAgent?: string;
    referrer?: string;
    source?: string;
  };
}

export interface AutosaveOptions {
  debounceMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  enableOptimisticUI?: boolean;
}

const DEFAULT_OPTIONS: Required<AutosaveOptions> = {
  debounceMs: 250,
  retryAttempts: 3,
  retryDelayMs: 1000,
  enableOptimisticUI: true
};

/**
 * Assessment Autosave Service
 */
export class AssessmentAutosave {
  private options: Required<AutosaveOptions>;
  private saveTimeout: NodeJS.Timeout | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;
  private pendingProgress: AssessmentProgress | null = null;
  private isSaving: boolean = false;
  private retryCount: number = 0;

  constructor(options: AutosaveOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Save assessment progress with debouncing
   */
  public async saveProgress(
    progress: AssessmentProgress,
    immediate: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    this.pendingProgress = progress;

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    if (immediate) {
      return this.performSave(progress);
    }

    // Debounced save
    return new Promise((resolve) => {
      this.saveTimeout = setTimeout(async () => {
        const result = await this.performSave(progress);
        resolve(result);
      }, this.options.debounceMs);
    });
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(
    progress: AssessmentProgress
  ): Promise<{ success: boolean; error?: string }> {
    if (this.isSaving) {
      return { success: false, error: 'Save already in progress' };
    }

    this.isSaving = true;
    
    try {
      const response = await fetch('/api/assessment/save', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...progress,
          lastSavedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Reset retry count on success
      this.retryCount = 0;
      this.isSaving = false;
      
      // Clear retry timeout if exists
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }

      console.log('✅ Assessment progress saved:', {
        sessionId: progress.sessionId,
        progressPercent: progress.progressPercent,
        currentQuestion: progress.currentQuestion
      });

      return { success: true };

    } catch (error) {
      this.isSaving = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ Assessment save failed:', errorMessage);

      // Retry logic
      if (this.retryCount < this.options.retryAttempts) {
        this.retryCount++;
        
        console.log(`🔄 Retrying save (attempt ${this.retryCount}/${this.options.retryAttempts})...`);
        
        return new Promise((resolve) => {
          this.retryTimeout = setTimeout(async () => {
            const result = await this.performSave(progress);
            resolve(result);
          }, this.options.retryDelayMs * this.retryCount); // Exponential backoff
        });
      }

      // Max retries exceeded
      this.retryCount = 0;
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Load saved progress for resume
   */
  public async loadProgress(
    sessionId: string,
    userId?: string
  ): Promise<AssessmentProgress | null> {
    try {
      const params = new URLSearchParams();
      params.append('sessionId', sessionId);
      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/assessment/progress?${params.toString()}`);
      
      if (response.status === 404) {
        return null; // No saved progress
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const progress = await response.json();
      
      console.log('📄 Assessment progress loaded:', {
        sessionId: progress.sessionId,
        progressPercent: progress.progressPercent,
        currentQuestion: progress.currentQuestion
      });

      return progress;

    } catch (error) {
      console.error('❌ Failed to load assessment progress:', error);
      return null;
    }
  }

  /**
   * Clear saved progress
   */
  public async clearProgress(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/assessment/progress/${sessionId}`, {
        method: 'DELETE'
      });

      return response.ok;

    } catch (error) {
      console.error('❌ Failed to clear assessment progress:', error);
      return false;
    }
  }

  /**
   * Force save any pending progress
   */
  public async forceSave(): Promise<{ success: boolean; error?: string }> {
    if (this.pendingProgress) {
      return this.performSave(this.pendingProgress);
    }
    return { success: true };
  }

  /**
   * Check if there's unsaved progress
   */
  public hasPendingChanges(): boolean {
    return this.pendingProgress !== null && this.saveTimeout !== null;
  }

  /**
   * Get current save status
   */
  public getSaveStatus(): {
    isSaving: boolean;
    hasPending: boolean;
    retryCount: number;
  } {
    return {
      isSaving: this.isSaving,
      hasPending: this.hasPendingChanges(),
      retryCount: this.retryCount
    };
  }

  /**
   * Cleanup timeouts
   */
  public cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.pendingProgress = null;
    this.isSaving = false;
    this.retryCount = 0;
  }
}

/**
 * Create assessment autosave instance
 */
export function createAutosave(options?: AutosaveOptions): AssessmentAutosave {
  return new AssessmentAutosave(options);
}

/**
 * Generate unique session ID for assessment
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}`;
}

/**
 * Calculate assessment progress percentage
 */
export function calculateProgress(
  responses: Record<string, any>,
  totalQuestions: number
): number {
  const answeredCount = Object.keys(responses).length;
  return Math.round((answeredCount / totalQuestions) * 100);
}

/**
 * Hook for React components
 */
export function useAssessmentAutosave(options?: AutosaveOptions) {
  const [autosave] = useState(() => createAutosave(options));
  const [saveStatus, setSaveStatus] = useState(autosave.getSaveStatus());
  
  // Update save status
  const updateSaveStatus = useCallback(() => {
    setSaveStatus(autosave.getSaveStatus());
  }, [autosave]);

  // Save progress with status update
  const saveProgress = useCallback(async (
    progress: AssessmentProgress,
    immediate?: boolean
  ) => {
    updateSaveStatus();
    const result = await autosave.saveProgress(progress, immediate);
    updateSaveStatus();
    return result;
  }, [autosave, updateSaveStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autosave.cleanup();
    };
  }, [autosave]);

  return {
    saveProgress,
    loadProgress: autosave.loadProgress.bind(autosave),
    clearProgress: autosave.clearProgress.bind(autosave),
    forceSave: autosave.forceSave.bind(autosave),
    saveStatus,
    updateSaveStatus
  };
}

// Import React hooks if available
let useState: any, useCallback: any, useEffect: any;
try {
  const React = require('react');
  useState = React.useState;
  useCallback = React.useCallback;
  useEffect = React.useEffect;
} catch (e) {
  // React not available in this context
}