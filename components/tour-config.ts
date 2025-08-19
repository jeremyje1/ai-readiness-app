/**
 * Tour Configuration Settings
 * 
 * This file contains configuration options for the onboarding tour component
 */

export const tourConfig = {
  // Default behavior settings
  defaults: {
    autoStart: true,        // Whether to start the tour automatically for first-time users
    showProgress: true,     // Show the step progress indicator
    showStepCount: true,    // Show step count (e.g., "Step 2 of 5")
    showSkip: true,         // Show skip button on first step
    storageKey: 'onboarding-tour-completed', // Local storage key to track tour completion
  },
  
  // Animation settings
  animations: {
    duration: 0.2,         // Animation duration in seconds
    initialScale: 0.9,     // Initial scale for entrance animation
  },
  
  // Appearance settings
  appearance: {
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    highlightColor: 'rgba(59, 130, 246, 0.5)',
    tooltipBackgroundColor: 'white',
    tooltipBorderColor: 'var(--np-primary-blue, #3b82f6)',
    tooltipBorderWidth: '2px',
    tooltipBorderRadius: '0.5rem',
    tooltipShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
    tooltipMaxWidth: '400px',
    tooltipPadding: '1.5rem',
    arrowSize: '8px',
  },
  
  // Mobile settings
  mobile: {
    tooltipPosition: 'bottom',  // Position of tooltip on mobile (bottom, center)
    bottomOffset: '5rem',       // Distance from bottom of screen
    fullWidthTooltip: true,     // Whether tooltip should be full width on mobile
    mobileBreakpoint: '640px',  // Mobile breakpoint
    minTouchTargetSize: '44px', // Minimum size for touch targets
  },
  
  // Accessibility settings
  a11y: {
    ariaLabelPrefix: 'Tour step',
    focusTrapping: true,         // Trap focus within the tour tooltip
    autoFocus: true,             // Auto-focus the tooltip when shown
    escToExit: true,             // Allow pressing Escape to exit the tour
  }
};

// Default copy text
export const tourCopy = {
  skipButton: 'Skip',
  nextButton: 'Next',
  backButton: 'Back',
  finishButton: 'Finish',
  stepCounter: 'Step {current} of {total}',
  closeAriaLabel: 'Close tour',
};

// Additional helper functions
export function getStoredTourState(storageKey = tourConfig.defaults.storageKey) {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(storageKey);
}

export function setStoredTourState(state: 'completed' | 'skipped' | null, storageKey = tourConfig.defaults.storageKey) {
  if (typeof window === 'undefined') return;
  
  if (state === null) {
    localStorage.removeItem(storageKey);
  } else {
    localStorage.setItem(storageKey, state);
  }
}

export function resetTourState(storageKey = tourConfig.defaults.storageKey) {
  setStoredTourState(null, storageKey);
}
