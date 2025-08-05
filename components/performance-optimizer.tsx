/**
 * Lazy Loading and Performance Optimization Component
 */
'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './loading-spinner';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
  className?: string;
}

export function LazySection({ 
  children, 
  fallback, 
  delay = 0, 
  className = "" 
}: LazyComponentProps) {
  const [shouldRender, setShouldRender] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!shouldRender) {
    return fallback || <div className={className} />;
  }

  return (
    <Suspense
      fallback={
        fallback || (
          <div className={`flex items-center justify-center p-8 ${className}`}>
            <LoadingSpinner size="md" variant="gradient" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

interface InViewAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export function InViewAnimation({
  children,
  className = "",
  delay = 0,
  direction = 'up',
  distance = 30
}: InViewAnimationProps) {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref]);

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      default:
        return { y: distance, x: 0 };
    }
  };

  return (
    <motion.div
      ref={setRef}
      className={className}
      initial={{ 
        opacity: 0, 
        ...getInitialPosition()
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : {}}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality: _quality = 85
}: ImageOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-slate-800/50 animate-pulse flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? 'eager' : 'lazy'}
        initial={{ scale: 1.1 }}
        animate={{ scale: isLoaded ? 1 : 1.1 }}
        transition={{ duration: 0.6 }}
      />
      
      {error && (
        <div className="absolute inset-0 bg-slate-800/50 flex items-center justify-center">
          <span className="text-slate-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

export function PreloadAssets() {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/images/recreated-optimized-60.jpg',
      '/images/pages-background-60.jpg',
      '/images/jeremy-estrella.jpg'
    ];

    criticalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Preload critical fonts
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  return null;
}

// Performance monitoring hooks
interface PerformanceMetrics {
  cls: number | null
  fcp: number | null
  fid: number | null
  lcp: number | null
  ttfb: number | null
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    fcp: null,
    fid: null,
    lcp: null,
    ttfb: null,
  })

  useEffect(() => {
    // Use web-vitals library if available, otherwise fallback to basic metrics
    if (typeof window !== 'undefined') {
      // Basic performance metrics collection
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: navigation.loadEventEnd - navigation.fetchStart,
        }))
      }

      // Monitor LCP using PerformanceObserver
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
        })
        
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch {
          // LCP not supported
        }

        return () => lcpObserver.disconnect()
      }
    }
  }, [])

  return metrics
}

export function useBundleAnalyzer() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Log bundle size information
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          const resourceEntry = entry as PerformanceResourceTiming
          console.log(`Bundle: ${entry.name}`, {
            size: resourceEntry.transferSize || 0,
            loadTime: resourceEntry.responseEnd - resourceEntry.responseStart,
          })
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['resource'] })
    } catch {
      // Performance observer not supported
    }

    return () => observer.disconnect()
  }, [])
}

// Critical resource preloader
export function CriticalResourcePreloader() {
  useEffect(() => {
    // Preconnect to critical domains
    const criticalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.stripe.com',
    ]

    criticalDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      document.head.appendChild(link)
    })

    // Prefetch critical resources during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const criticalResources = [
          '/api/health',
          '/manifest.json',
          '/about',
          '/services',
          '/contact',
        ]

        criticalResources.forEach(resource => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = resource
          document.head.appendChild(link)
        })
      })
    }
  }, [])

  return null
}
