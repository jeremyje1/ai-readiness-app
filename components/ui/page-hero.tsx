import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHero({ title, subtitle, icon, children, className }: PageHeroProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-br from-nps-blue-50 via-white to-nps-blue-50",
        "rounded-3xl p-12 md:p-16 text-center mb-16",
        "shadow-xl shadow-nps-blue-100/50",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-nps-blue-50/30 to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="text-6xl md:text-7xl mb-6"
          >
            {icon}
          </motion.div>
        )}
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-nps-blue mb-6 leading-tight"
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-nps-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
        
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
