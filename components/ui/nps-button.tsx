import React from 'react';
import { cn } from '@/lib/utils';

interface NpsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NPSButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  ...props 
}: NpsButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:shadow-lg transform-gpu";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
  };
  
  const sizes = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        "hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200",
        className
      )}
      {...props}
    >
      {/* Ripple effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}