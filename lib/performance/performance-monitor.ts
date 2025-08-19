/* filepath: /lib/performance/performance-monitor.ts */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  id: string;
  navigationType: string;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    overallScore: number;
    recommendations: string[];
    criticalIssues: string[];
  };
  systemInfo: {
    userAgent: string;
    connection: any;
    memory: any;
    timing: any;
  };
  customMetrics: Record<string, number>;
}

export interface PerformanceBudget {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

/**
 * Advanced Performance Monitoring System
 * Tracks Core Web Vitals and custom metrics with real-time analysis
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private customMetrics: Record<string, number> = {};
  private budget: PerformanceBudget;
  private isMonitoring = false;
  private callbacks: Array<(metric: PerformanceMetric) => void> = [];

  constructor(budget?: Partial<PerformanceBudget>) {
    this.budget = {
      lcp: 2500, // Good: ≤2.5s
      fid: 100,  // Good: ≤100ms
      cls: 0.1,  // Good: ≤0.1
      fcp: 1800, // Good: ≤1.8s
      ttfb: 800, // Good: ≤800ms
      ...budget,
    };
  }

  /**
   * Start monitoring performance metrics
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.initializeWebVitals();
    this.initializeCustomObservers();
    this.trackResourceTiming();
    this.trackNavigationTiming();
    this.trackMemoryUsage();
  }

  /**
   * Stop monitoring and clean up observers
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Initialize Core Web Vitals tracking
   */
  private initializeWebVitals(): void {
    // Largest Contentful Paint
    onLCP((metric) => {
      this.addMetric({
        name: 'LCP',
        value: metric.value,
        rating: this.getRating('lcp', metric.value),
        timestamp: Date.now(),
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // First Input Delay (replaced with Interaction to Next Paint in web-vitals v3)
    onINP((metric) => {
      this.addMetric({
        name: 'INP',
        value: metric.value,
        rating: this.getRating('fid', metric.value), // Use FID rating for INP
        timestamp: Date.now(),
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // Cumulative Layout Shift
    onCLS((metric) => {
      this.addMetric({
        name: 'CLS',
        value: metric.value,
        rating: this.getRating('cls', metric.value),
        timestamp: Date.now(),
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // First Contentful Paint
    onFCP((metric) => {
      this.addMetric({
        name: 'FCP',
        value: metric.value,
        rating: this.getRating('fcp', metric.value),
        timestamp: Date.now(),
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // Time to First Byte
    onTTFB((metric) => {
      this.addMetric({
        name: 'TTFB',
        value: metric.value,
        rating: this.getRating('ttfb', metric.value),
        timestamp: Date.now(),
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });
  }

  /**
   * Initialize custom performance observers
   */
  private initializeCustomObservers(): void {
    // Long Task Observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.addMetric({
                name: 'Long Task',
                value: entry.duration,
                rating: entry.duration > 200 ? 'poor' : entry.duration > 100 ? 'needs-improvement' : 'good',
                timestamp: Date.now(),
                id: `long-task-${Date.now()}`,
                navigationType: 'reload',
              });
            }
          }
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long Task Observer not supported');
      }

      // Layout Shift Observer
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              this.customMetrics['layoutShifts'] = (this.customMetrics['layoutShifts'] || 0) + entry.value;
            }
          }
        });
        
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (e) {
        console.warn('Layout Shift Observer not supported');
      }

      // Element Timing Observer
      try {
        const elementTimingObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.addMetric({
              name: `Element: ${(entry as any).identifier}`,
              value: (entry as any).renderTime || (entry as any).loadTime,
              rating: 'good',
              timestamp: Date.now(),
              id: `element-${(entry as any).identifier}`,
              navigationType: 'reload',
            });
          }
        });
        
        elementTimingObserver.observe({ entryTypes: ['element'] });
        this.observers.push(elementTimingObserver);
      } catch (e) {
        console.warn('Element Timing Observer not supported');
      }
    }
  }

  /**
   * Track resource loading performance
   */
  private trackResourceTiming(): void {
    if (!('performance' in window)) return;

    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resource.duration > 1000) {
          this.addMetric({
            name: `Slow Resource: ${resource.name.split('/').pop()}`,
            value: resource.duration,
            rating: resource.duration > 3000 ? 'poor' : 'needs-improvement',
            timestamp: Date.now(),
            id: `resource-${Date.now()}`,
            navigationType: 'reload',
          });
        }

        // Track resource types
        this.customMetrics[`${resource.initiatorType}_count`] = 
          (this.customMetrics[`${resource.initiatorType}_count`] || 0) + 1;
        this.customMetrics[`${resource.initiatorType}_duration`] = 
          (this.customMetrics[`${resource.initiatorType}_duration`] || 0) + resource.duration;
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(): void {
    if (!('performance' in window) || !performance.getEntriesByType) return;

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      
      // DNS lookup time
      const dnsTime = nav.domainLookupEnd - nav.domainLookupStart;
      this.customMetrics['dns_time'] = dnsTime;
      
      // TCP connection time
      const tcpTime = nav.connectEnd - nav.connectStart;
      this.customMetrics['tcp_time'] = tcpTime;
      
      // Server response time
      const serverTime = nav.responseEnd - nav.requestStart;
      this.customMetrics['server_time'] = serverTime;
      
      // DOM processing time
      const domTime = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
      this.customMetrics['dom_time'] = domTime;
      
      // Page load time
      const loadTime = nav.loadEventEnd - nav.loadEventStart;
      this.customMetrics['load_time'] = loadTime;
    }
  }

  /**
   * Track memory usage (if available)
   */
  private trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.customMetrics['memory_used'] = memory.usedJSHeapSize;
      this.customMetrics['memory_total'] = memory.totalJSHeapSize;
      this.customMetrics['memory_limit'] = memory.jsHeapSizeLimit;
    }
  }

  /**
   * Add a performance metric
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.callbacks.forEach(callback => callback(metric));
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Get rating for a metric value
   */
  private getRating(metric: keyof PerformanceBudget, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.budget[metric];
    
    switch (metric) {
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'fcp':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      case 'ttfb':
        return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
      default:
        return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'needs-improvement' : 'poor';
    }
  }

  /**
   * Mark custom timing
   */
  markTiming(name: string): void {
    if ('performance' in window && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure custom timing between marks
   */
  measureTiming(name: string, startMark: string, endMark?: string): number {
    if ('performance' in window && performance.measure) {
      try {
        if (endMark) {
          performance.measure(name, startMark, endMark);
        } else {
          performance.measure(name, startMark);
        }
        
        const measures = performance.getEntriesByName(name, 'measure');
        if (measures.length > 0) {
          const duration = measures[measures.length - 1].duration;
          this.customMetrics[name] = duration;
          return duration;
        }
      } catch (e) {
        console.warn('Failed to measure timing:', e);
      }
    }
    return 0;
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const duration = performance.now() - startTime;
    
    this.customMetrics[`${componentName}_render`] = duration;
    
    if (duration > 16) { // Longer than one frame (60fps)
      this.addMetric({
        name: `Slow Render: ${componentName}`,
        value: duration,
        rating: duration > 50 ? 'poor' : 'needs-improvement',
        timestamp: Date.now(),
        id: `render-${componentName}-${Date.now()}`,
        navigationType: 'reload',
      });
    }
  }

  /**
   * Subscribe to metric updates
   */
  onMetric(callback: (metric: PerformanceMetric) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get custom metrics
   */
  getCustomMetrics(): Record<string, number> {
    return { ...this.customMetrics };
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const coreWebVitals = this.metrics.filter(m => 
      ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].includes(m.name)
    );

    const poorMetrics = coreWebVitals.filter(m => m.rating === 'poor');
    const needsImprovementMetrics = coreWebVitals.filter(m => m.rating === 'needs-improvement');

    const overallScore = coreWebVitals.length > 0 
      ? Math.round((coreWebVitals.filter(m => m.rating === 'good').length / coreWebVitals.length) * 100)
      : 0;

    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // Generate recommendations based on metrics
    poorMetrics.forEach(metric => {
      criticalIssues.push(`${metric.name} is poor (${metric.value})`);
      
      switch (metric.name) {
        case 'LCP':
          recommendations.push('Optimize largest contentful paint by reducing server response times and optimizing images');
          break;
        case 'FID':
          recommendations.push('Reduce first input delay by minimizing JavaScript execution time');
          break;
        case 'CLS':
          recommendations.push('Improve cumulative layout shift by adding size attributes to images and avoiding dynamic content insertion');
          break;
        case 'FCP':
          recommendations.push('Improve first contentful paint by optimizing critical rendering path');
          break;
        case 'TTFB':
          recommendations.push('Reduce time to first byte by optimizing server response times');
          break;
      }
    });

    needsImprovementMetrics.forEach(metric => {
      recommendations.push(`Consider optimizing ${metric.name} (current: ${metric.value})`);
    });

    return {
      metrics: this.metrics,
      summary: {
        overallScore,
        recommendations,
        criticalIssues,
      },
      systemInfo: {
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection || null,
        memory: (performance as any).memory || null,
        timing: performance.timing || null,
      },
      customMetrics: this.customMetrics,
    };
  }

  /**
   * Export metrics for analytics
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      url: window.location.href,
      report: this.generateReport(),
    }, null, 2);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in browser
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}
