import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NPSButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function NPSButton({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children,
  ...props 
}: NPSButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-nps-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";
  
  const variants = {
    primary: "bg-nps-blue text-white hover:bg-nps-blue-600 active:bg-nps-blue-700 shadow-lg shadow-nps-blue-500/25 hover:shadow-xl hover:shadow-nps-blue-500/40",
    secondary: "bg-nps-slate-100 text-nps-slate hover:bg-nps-slate-200 active:bg-nps-slate-300",
    outline: "border-2 border-nps-blue text-nps-blue hover:bg-nps-blue hover:text-white active:bg-nps-blue-600"
  };
  
  const sizes = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Ripple effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
