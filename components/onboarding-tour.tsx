'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useBreakpoint, useTouchDevice } from './responsive-utils';
import { Button } from './button';
import { Progress } from './progress';
import { cn } from '@/lib/utils';
import {
  X as CloseIcon,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  RefreshCw
} from 'lucide-react';

// ==========================================================
// Types and Context
// ==========================================================

export type TourStep = {
  target: string; // CSS selector for the target element
  title: string;
  content: React.ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  disableOverlay?: boolean;
  offset?: { x?: number; y?: number };
};

type TourContextValue = {
  currentStep: number;
  totalSteps: number;
  isOpen: boolean;
  startTour: (fromStep?: number) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  registerTour: (tourSteps: TourStep[]) => void;
};

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

// ==========================================================
// Tour Provider Component
// ==========================================================

interface TourProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
  onSkip?: () => void;
  storageKey?: string; // Used to save tour completion status
  disableAutoScrolling?: boolean;
}

export function TourProvider({
  children,
  onComplete,
  onSkip,
  storageKey = 'onboarding-tour-completed',
  disableAutoScrolling = false,
}: TourProviderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const breakpoint = useBreakpoint();
  const isTouch = useTouchDevice();

  // Check if tour has been completed before
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const tourCompleted = localStorage.getItem(storageKey);
      if (!tourCompleted && tourSteps.length > 0) {
        // Auto start tour if it hasn't been completed before
        setTimeout(() => {
          setIsOpen(true);
        }, 1000);
      }
    }
  }, [storageKey, tourSteps]);

  const startTour = (fromStep = 0) => {
    setCurrentStep(fromStep);
    setIsOpen(true);
  };

  const endTour = () => {
    setIsOpen(false);
    setCurrentStep(0);
    
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  const skipTour = () => {
    setIsOpen(false);
    setCurrentStep(0);
    
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'skipped');
    }
    
    if (onSkip) {
      onSkip();
    }
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < tourSteps.length) {
      setCurrentStep(step);
    }
  };

  const registerTour = (steps: TourStep[]) => {
    setTourSteps(steps);
  };

  // Scroll target element into view when step changes
  useEffect(() => {
    if (isOpen && tourSteps[currentStep] && !disableAutoScrolling) {
      const targetElement = document.querySelector(tourSteps[currentStep].target);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentStep, isOpen, tourSteps, disableAutoScrolling]);

  const contextValue: TourContextValue = {
    currentStep,
    totalSteps: tourSteps.length,
    isOpen,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    registerTour,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      {typeof window !== 'undefined' && isOpen && tourSteps.length > 0 && createPortal(
        <TourOverlay 
          currentStep={currentStep} 
          tourSteps={tourSteps}
          nextStep={nextStep}
          prevStep={prevStep}
          skipTour={skipTour}
          endTour={endTour}
          isTouch={isTouch}
          breakpoint={breakpoint}
        />,
        document.body
      )}
    </TourContext.Provider>
  );
}

// ==========================================================
// Tour Overlay Component
// ==========================================================

interface TourOverlayProps {
  currentStep: number;
  tourSteps: TourStep[];
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  isTouch?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
}

function TourOverlay({
  currentStep,
  tourSteps,
  nextStep,
  prevStep,
  skipTour,
  endTour,
  isTouch,
  breakpoint,
}: TourOverlayProps) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [overlayReady, setOverlayReady] = useState(false);
  const [tooltipPlacement, setTooltipPlacement] = useState<'top' | 'right' | 'bottom' | 'left' | 'center'>('bottom');
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  
  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const isMobile = breakpoint === 'sm';
  
  // Calculate position of the tooltip relative to the target element
  useEffect(() => {
    if (!currentTourStep) return;
    
    const targetElement = document.querySelector(currentTourStep.target) as HTMLElement;
    if (!targetElement || !tooltipRef.current) {
      // If target doesn't exist, position in center
      setTooltipPlacement('center');
      return;
    }
    
    const placement = currentTourStep.placement || 'bottom';
    setTooltipPlacement(placement);
    
    // Get position of target element
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Calculate tooltip position based on placement
    let top = 0;
    let left = 0;
    
    const offset = currentTourStep.offset || { x: 0, y: 0 };
    
    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10 + (offset.y || 0);
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + (offset.x || 0);
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + (offset.y || 0);
        left = targetRect.right + 10 + (offset.x || 0);
        break;
      case 'bottom':
        top = targetRect.bottom + 10 + (offset.y || 0);
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + (offset.x || 0);
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + (offset.y || 0);
        left = targetRect.left - tooltipRect.width - 10 + (offset.x || 0);
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipRect.height / 2 + (offset.y || 0);
        left = window.innerWidth / 2 - tooltipRect.width / 2 + (offset.x || 0);
        break;
    }
    
    // Ensure tooltip stays within viewport
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    
    if (top < 10) top = 10;
    if (top + tooltipRect.height > window.innerHeight - 10) {
      top = window.innerHeight - tooltipRect.height - 10;
    }
    
    setTooltipPosition({ top, left });
    setOverlayReady(true);
    
    // Create highlight effect for the target
    if (!currentTourStep.disableOverlay && targetElement) {
      targetElement.classList.add('tour-target');
    }
    
    return () => {
      if (targetElement) {
        targetElement.classList.remove('tour-target');
      }
    };
  }, [currentStep, currentTourStep]);

  // Handle keydown events for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep, endTour]);

  // Handle touch swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    
    // If swipe distance is significant enough (> 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, go to next step
        !isLastStep && nextStep();
      } else {
        // Swipe right, go to previous step
        !isFirstStep && prevStep();
      }
    }
    
    touchStartRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Overlay layer - semi-transparent background */}
      {!currentTourStep?.disableOverlay && (
        <div 
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={() => skipTour()}
          ref={overlayRef}
        />
      )}
      
      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`tour-step-${currentStep}`}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-[90vw] sm:max-w-[400px] pointer-events-auto',
            'border-2 border-np-primary-blue',
            isMobile ? 'bottom-20 left-1/2 transform -translate-x-1/2 w-[90vw] !fixed' : ''
          )}
          style={!isMobile ? { top: tooltipPosition.top, left: tooltipPosition.left } : undefined}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button 
            onClick={endTour}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close tour"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-np-deep-blue mb-1">
            {currentTourStep?.title}
          </h3>
          
          {/* Progress indicator */}
          <div className="mb-3 flex items-center text-xs text-gray-500">
            <span>Step {currentStep + 1} of {tourSteps.length}</span>
            <div className="ml-2 flex-1">
              <Progress 
                value={(currentStep + 1) / tourSteps.length * 100} 
                className="h-1 bg-gray-200" 
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="mb-4 text-sm text-gray-700">
            {currentTourStep?.content}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              {!isFirstStep ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={prevStep}
                  className={cn(
                    'min-h-[36px]',
                    isTouch ? 'min-w-[44px]' : ''
                  )}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={skipTour}
                  className={cn(
                    'min-h-[36px]',
                    isTouch ? 'min-w-[44px]' : ''
                  )}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              )}
            </div>
            <div>
              <Button 
                onClick={isLastStep ? endTour : nextStep}
                size="sm"
                className={cn(
                  'min-h-[36px]',
                  isTouch ? 'min-w-[44px]' : ''
                )}
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
          
          {/* Arrow pointing to element (unless center placement) */}
          {tooltipPlacement !== 'center' && !isMobile && (
            <div
              className={cn(
                'absolute w-4 h-4 rotate-45 bg-white border-np-primary-blue',
                tooltipPlacement === 'top' && 'border-b border-r bottom-[-8px] left-1/2 ml-[-8px]',
                tooltipPlacement === 'right' && 'border-b border-l left-[-8px] top-1/2 mt-[-8px]',
                tooltipPlacement === 'bottom' && 'border-t border-l top-[-8px] left-1/2 ml-[-8px]',
                tooltipPlacement === 'left' && 'border-t border-r right-[-8px] top-1/2 mt-[-8px]'
              )}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==========================================================
// Tour Button Component
// ==========================================================

interface TourButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function TourButton({
  className,
  children = 'Start Tour',
  variant = 'outline',
  size = 'default'
}: TourButtonProps) {
  const { startTour } = useTour();
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={() => startTour(0)}
      className={cn('flex items-center', className)}
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      {children}
    </Button>
  );
}

// ==========================================================
// Tour Component
// ==========================================================

interface TourProps {
  steps: TourStep[];
  children?: React.ReactNode;
}

export function Tour({ steps, children }: TourProps) {
  const { registerTour } = useTour();
  
  useEffect(() => {
    registerTour(steps);
  }, [steps, registerTour]);
  
  return <>{children}</>;
}

// Add global styles for tour highlighting
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .tour-target {
      position: relative;
      z-index: 10000;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
}
