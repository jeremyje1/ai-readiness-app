import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NpsCardProps {
  children?: React.ReactNode;
  className?: string;
  icon?: string;
  title?: string;
  description?: string;
  index?: number;
}

export function NpsCard({ children, className, icon, title, description, index = 0 }: NpsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "group relative bg-white rounded-3xl p-8",
        "shadow-xl shadow-nps-blue-100/50",
        "flex flex-col items-center text-center space-y-6",
        "hover:shadow-2xl hover:shadow-nps-blue-200/60",
        "transition-all duration-300 ease-out",
        "border border-nps-blue-100/50",
        "overflow-hidden",
        className
      )}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-nps-blue-50/30 via-transparent to-nps-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {icon && (
          <motion.div 
            className="text-5xl text-nps-blue group-hover:scale-110 transition-transform duration-300"
            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
          >
            {icon}
          </motion.div>
        )}
        
        {title && (
          <h3 className="text-2xl font-bold text-nps-slate group-hover:text-nps-blue transition-colors duration-300">
            {title}
          </h3>
        )}
        
        {description && (
          <p className="text-lg text-nps-slate-600 leading-relaxed">
            {description}
          </p>
        )}
        
        {children && (
          <div className="w-full">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
