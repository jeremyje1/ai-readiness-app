'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Mobile Bottom Navigation Component
 * 
 * A touch-friendly mobile navigation component that appears at the bottom of the screen
 * on small devices (mobile phones) and provides large touch targets.
 */

interface MobileBottomNavProps {
  items: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
  }>;
  className?: string;
}

export function MobileBottomNav({ items, className }: MobileBottomNavProps) {
  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-2 z-50 md:hidden",
        className
      )}
    >
      <div className="flex justify-around items-center">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg",
              "min-w-[64px] min-h-[64px]", // Touch-friendly size (44px minimum)
              item.active 
                ? "text-primary-600 dark:text-primary-400" 
                : "text-gray-600 dark:text-gray-400",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            )}
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/**
 * ModalMobileMenu component
 * 
 * A full-screen modal menu for mobile navigation that slides in from the side
 * with swipe gesture support
 */

interface ModalMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ModalMobileMenu({ 
  isOpen, 
  onClose, 
  children, 
  className 
}: ModalMobileMenuProps) {
  // Handle swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const diff = currentX - startX;
      
      // If swiping left (common mobile pattern to close)
      if (diff < -70) {
        onClose();
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu */}
      <div 
        className={cn(
          "fixed top-0 bottom-0 right-0 w-3/4 bg-white dark:bg-gray-900 p-6",
          "flex flex-col overflow-y-auto",
          className
        )}
        onTouchStart={handleTouchStart}
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="mt-12">
          {children}
        </div>
      </div>
    </div>
  );
}
