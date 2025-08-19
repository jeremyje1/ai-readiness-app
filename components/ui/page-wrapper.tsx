'use client'

import { ReactNode, Suspense } from 'react'
import { ScrollProgress, BackToTop, SmoothScroll } from '@/components/ui/scroll-effects'
import { PageLoadingSkeleton } from '@/components/ui/loading'
import { motion, AnimatePresence } from 'framer-motion'

interface PageWrapperProps {
  children: ReactNode
  showScrollProgress?: boolean
  showBackToTop?: boolean
  className?: string
}

export function PageWrapper({ 
  children, 
  showScrollProgress = true,
  showBackToTop = true,
  className = ''
}: PageWrapperProps) {
  return (
    <>
      {showScrollProgress && <ScrollProgress />}
      <SmoothScroll />
      
      <motion.div
        className={`min-h-screen ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<PageLoadingSkeleton />}>
          {children}
        </Suspense>
      </motion.div>
      
      {showBackToTop && <BackToTop />}
    </>
  )
}

export function PageTransitionWrapper({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
