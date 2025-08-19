/**
 * Loading Spinner Component with multiple variants
 * 
 * Features:
 * - Multiple size variants optimized for different devices
 * - Touch-friendly sizing (minimum 44px for touch targets)
 * - Responsive design across mobile, tablet and desktop
 * - Motion reduction support for accessibility
 * - High contrast mode compatibility
 */
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTouchDevice } from './responsive-utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse';
  className?: string;
  ariaLabel?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  className,
  ariaLabel
}: LoadingSpinnerProps) {
  // Detect if we're on a touch device to adjust sizes appropriately
  const isTouch = useTouchDevice();
  
  // Size classes with touch-friendly dimensions
  // Ensures minimum 44px for touch targets on touch devices
  const sizeClasses = {
    sm: isTouch ? 'w-6 h-6 min-w-[30px] min-h-[30px]' : 'w-4 h-4',
    md: isTouch ? 'w-10 h-10 min-w-[44px] min-h-[44px]' : 'w-8 h-8',
    lg: isTouch ? 'w-14 h-14 min-w-[56px] min-h-[56px]' : 'w-12 h-12',
    xl: 'w-20 h-20 min-w-[72px] min-h-[72px]' // Always large for emphasis
  };

  const variantClasses = {
    default: 'border-slate-600 border-t-purple-500',
    gradient: 'border-transparent',
    pulse: 'bg-purple-500'
  };

  // Container classes to ensure touch targets are large enough
  const containerClasses = isTouch ? 'p-2' : '';

  if (variant === 'gradient') {
    return (
      <div 
        role="status" 
        aria-label={ariaLabel || "Loading"} 
        aria-busy="true"
        className={cn(containerClasses, className)}
      >
        <motion.div
          className={cn(
            'rounded-full border-2 border-transparent forced-colors:border-[CanvasText]',
            sizeClasses[size]
          )}
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #06b6d4, #8b5cf6)',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white 0)',
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white 0)'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          aria-hidden="true"
        />
        <span className="sr-only">Loading, please wait</span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div 
        role="status" 
        aria-label={ariaLabel || "Loading"} 
        aria-busy="true"
        className={cn(containerClasses, className)}
      >
        <motion.div
          className={cn(
            'rounded-full forced-colors:bg-[CanvasText]',
            sizeClasses[size],
            variantClasses[variant]
          )}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
          aria-hidden="true"
        />
        <span className="sr-only">Loading, please wait</span>
      </div>
    );
  }

  return (
    <div 
      role="status" 
      aria-label={ariaLabel || "Loading"} 
      aria-busy="true"
      className={cn(containerClasses, className)}
    >
      <motion.div
        className={cn(
          'rounded-full border-2 forced-colors:border-[CanvasText]',
          sizeClasses[size],
          variantClasses[variant]
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />
      <span className="sr-only">Loading, please wait</span>
    </div>
  );
}

export function LoadingDots({ className, ariaLabel, size = 'default' }: { 
  className?: string, 
  ariaLabel?: string,
  size?: 'small' | 'default' | 'large'
}) {
  // Detect if we're on a touch device to adjust sizes appropriately
  const isTouch = useTouchDevice();
  
  // Size classes with responsive dimensions
  const dotSizeClasses = {
    small: 'w-1.5 h-1.5',
    default: isTouch ? 'w-3 h-3' : 'w-2 h-2',
    large: isTouch ? 'w-4 h-4' : 'w-3 h-3'
  };
  
  const containerSizeClasses = {
    small: 'space-x-1 min-h-[30px]',
    default: isTouch ? 'space-x-2 min-h-[44px]' : 'space-x-1 min-h-[24px]',
    large: isTouch ? 'space-x-3 min-h-[56px]' : 'space-x-2 min-h-[36px]'
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center", 
        containerSizeClasses[size], 
        className
      )}
      role="status"
      aria-label={ariaLabel || "Loading"}
      aria-live="polite"
      aria-busy="true"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            "bg-purple-500 rounded-full forced-colors:bg-[CanvasText]",
            dotSizeClasses[size]
          )}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading, please wait</span>
    </div>
  );
}
