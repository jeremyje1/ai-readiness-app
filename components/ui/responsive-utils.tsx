'use client';

import { useEffect, useState } from 'react';

// Breakpoint definitions
export const breakpoints = {
  sm: 480,  // Small mobile devices
  md: 768,  // Tablets and large phones
  lg: 1024, // Small laptops and landscape tablets
  xl: 1280, // Large laptops and desktops
};

// Hook to detect current breakpoint
export function useBreakpoint() {
  // Initialize with undefined during SSR
  const [breakpoint, setBreakpoint] = useState<
    'sm' | 'md' | 'lg' | 'xl' | undefined
  >(undefined);

  useEffect(() => {
    // Function to determine the current breakpoint
    const calculateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < breakpoints.sm) {
        return 'sm';
      } else if (width < breakpoints.md) {
        return 'md';
      } else if (width < breakpoints.lg) {
        return 'lg';
      } else {
        return 'xl';
      }
    };

    // Set initial breakpoint
    setBreakpoint(calculateBreakpoint());

    // Update breakpoint on window resize
    const handleResize = () => {
      setBreakpoint(calculateBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

// Touch detection hook
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    const isTouchDevice = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;
    
    setIsTouch(isTouchDevice);
  }, []);

  return isTouch;
}

// Swipe detection hook
export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useSwipe(ref: React.RefObject<HTMLElement>, handlers: SwipeHandlers, threshold = 50) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Check horizontal swipe first (most common)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          } else if (deltaX < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
          } else if (deltaY < 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, handlers, threshold]);
}

// Mobile navigation component (bottom tab bar)
export const MobileBottomNav: React.FC<{
  items: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
  }>;
}> = ({ items }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`
              flex flex-col items-center p-3 rounded-lg min-w-[64px] min-h-[64px]
              ${item.active 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-gray-600 dark:text-gray-400'}
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
            `}
            aria-label={item.label}
          >
            <div className="text-2xl">{item.icon}</div>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
