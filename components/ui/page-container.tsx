import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn(
      "max-w-7xl mx-auto px-6 py-8 space-y-12",
      "md:px-8 md:py-12 md:space-y-16",
      "lg:px-12 lg:py-16 lg:space-y-20",
      "xl:px-16",
      className
    )}>
      {children}
    </div>
  );
}
