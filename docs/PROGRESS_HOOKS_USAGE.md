# Progress Hooks Usage Guide

This document demonstrates how to use the improved progress hooks in the survey application.

## Available Hooks

### 1. `useProgress` - Basic Step Progress Tracking

```typescript
import { useProgress } from '@/hooks/useProgress';

function MyWizard() {
  const {
    progress,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    getProgressPercentage,
    addError,
    clearErrors
  } = useProgress(5); // 5 total steps

  return (
    <div>
      <div>Step {progress.currentStep + 1} of {progress.totalSteps}</div>
      <div>Progress: {getProgressPercentage()}%</div>
      
      <button onClick={prevStep} disabled={!canGoPrev}>
        Previous
      </button>
      <button onClick={nextStep} disabled={!canGoNext}>
        Next
      </button>
    </div>
  );
}
```

### 2. `useSurveyProgress` - Advanced Survey Navigation

```typescript
import { useSurveyProgress, createSectionValidator } from '@/hooks/useProgress';

function SurveyComponent() {
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const requiredQuestions = ['q1', 'q2', 'q3'];
  
  const validator = createSectionValidator(requiredQuestions, answeredQuestions);
  
  const {
    currentSection,
    progressPercentage,
    goToNext,
    goToPrev,
    validationErrors,
    canGoNext,
    canGoPrev
  } = useSurveyProgress(3, validator);

  return (
    <div>
      <div>Section {currentSection + 1}</div>
      <div>Progress: {progressPercentage}%</div>
      
      {validationErrors.length > 0 && (
        <div className="error">
          {validationErrors.map(error => <div key={error}>{error}</div>)}
        </div>
      )}
      
      <button onClick={goToPrev} disabled={!canGoPrev}>
        Previous Section
      </button>
      <button onClick={goToNext} disabled={!canGoNext}>
        Next Section
      </button>
    </div>
  );
}
```

### 3. `useAutoSave` - Automatic Data Persistence

```typescript
import { useAutoSave } from '@/hooks/useProgress';

function SurveyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const {
    isSaving,
    lastSaved,
    saveError,
    loadDraft,
    clearDraft,
    forceSave
  } = useAutoSave(formData, 2000); // Auto-save every 2 seconds

  useEffect(() => {
    // Load draft on component mount
    const draft = loadDraft();
    if (draft) {
      setFormData(draft);
    }
  }, [loadDraft]);

  return (
    <div>
      {isSaving && <div>Saving...</div>}
      {saveError && <div className="error">{saveError}</div>}
      {lastSaved && <div>Last saved: {lastSaved.toLocaleTimeString()}</div>}
      
      <input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />
      
      <button onClick={forceSave}>Save Now</button>
      <button onClick={clearDraft}>Clear Draft</button>
    </div>
  );
}
```

### 4. `useFormValidation` - Form Field Validation

```typescript
import { useFormValidation, validationRules } from '@/hooks/useProgress';

function ValidatedForm() {
  const {
    values,
    errors,
    setValue,
    setTouched,
    validateAll,
    isValid,
    isDirty
  } = useFormValidation(
    { email: '', password: '' },
    {
      email: validationRules.email,
      password: validationRules.minLength(8)
    }
  );

  const handleSubmit = () => {
    if (validateAll()) {
      console.log('Form is valid:', values);
    }
  };

  return (
    <form>
      <input
        type="email"
        value={values.email}
        onChange={(e) => setValue('email', e.target.value)}
        onBlur={() => setTouched('email')}
      />
      {errors.email && <div className="error">{errors.email}</div>}
      
      <input
        type="password"
        value={values.password}
        onChange={(e) => setValue('password', e.target.value)}
        onBlur={() => setTouched('password')}
      />
      {errors.password && <div className="error">{errors.password}</div>}
      
      <button onClick={handleSubmit} disabled={!isValid}>
        Submit {isDirty && '(Modified)'}
      </button>
    </form>
  );
}
```

### 5. `useSurveyForm` - Complete Survey Form Management

```typescript
import { useSurveyForm } from '@/hooks/useProgress';

function CompleteSurveyForm() {
  const {
    formData,
    updateField,
    updateFields,
    isDirty,
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    loadDraft
  } = useSurveyForm(
    { responses: {}, demographics: {} },
    { delay: 3000, storageKey: 'survey_responses' }
  );

  return (
    <div>
      {hasUnsavedChanges && (
        <div className="warning">You have unsaved changes</div>
      )}
      
      <input
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Your name"
      />
      
      <button onClick={() => updateFields({ section1: 'completed' })}>
        Mark Section Complete
      </button>
      
      {isSaving && <div>Auto-saving...</div>}
      {lastSaved && <div>Saved at {lastSaved.toLocaleTimeString()}</div>}
    </div>
  );
}
```

## Utility Functions

### Survey Progress Calculation

```typescript
import { calculateCompletionPercentage, getSurveyStatus } from '@/hooks/useProgress';

const answered = new Set(['q1', 'q2', 'q3']);
const total = 10;

const percentage = calculateCompletionPercentage(answered, total); // 30%
const status = getSurveyStatus(percentage); // "In Progress"
```

### Storage Utilities

```typescript
import { storageUtils } from '@/hooks/useProgress';

// Save data
storageUtils.save('myKey', { user: 'data' });

// Load data (with 48-hour expiry)
const data = storageUtils.load('myKey', 48);

// Check if storage is available
if (storageUtils.isAvailable()) {
  // Use localStorage features
}
```

## Integration with Existing Survey Page

The improved hooks can be integrated with the existing survey page to provide:

1. **Better progress tracking** with validation
2. **Auto-save functionality** for user responses
3. **Form validation** for required fields
4. **Section-based navigation** with completion tracking

Example integration:

```typescript
// In your survey page component
const surveyProgress = useSurveyProgress(
  sections.length,
  (sectionIndex) => validateSection(sectionIndex, answeredQuestions)
);

const autoSave = useAutoSave(responses, 2000);

// Use surveyProgress.goToNext() instead of manual navigation
// Benefit from autoSave.isSaving status and error handling
```

This provides a more robust and user-friendly survey experience.
