'use client'

import { useEffect } from 'react'

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
}

class AnalyticsTracker {
  private static instance: AnalyticsTracker
  private events: AnalyticsEvent[] = []

  private constructor() {
    // Initialize analytics services
    this.initializeGoogleAnalytics()
  }

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker()
    }
    return AnalyticsTracker.instance
  }

  private initializeGoogleAnalytics() {
    // Google Analytics 4 setup
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`
      script.async = true
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID)
    }
  }

  // Track conversion events
  trackEvent(event: string, properties?: Record<string, any>) {
    console.log('Analytics Event:', event, properties)
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        timestamp: new Date().toISOString()
      })
    }

    // Store for internal analytics
    this.events.push({ event, properties })
    
    // Send to your backend for analysis
    this.sendToBackend({ event, properties })
  }

  private async sendToBackend(eventData: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })
    } catch (error) {
      console.error('Failed to send analytics:', error)
    }
  }

  // Specific conversion tracking methods
  trackPricingPageView(billingPeriod?: string) {
    this.trackEvent('pricing_page_view', {
      page: '/pricing',
      billing_period: billingPeriod || 'monthly'
    })
  }

  trackCheckoutInitiated(billingPeriod: string, planValue: number) {
    this.trackEvent('checkout_initiated', {
      billing_period: billingPeriod,
      plan_value: planValue,
      currency: 'USD'
    })
  }

  trackTrialStarted(billingPeriod: string, planValue: number) {
    this.trackEvent('trial_started', {
      billing_period: billingPeriod,
      plan_value: planValue,
      trial_days: 7,
      currency: 'USD'
    })
  }

  trackSubscriptionCreated(billingPeriod: string, planValue: number, customerId: string) {
    this.trackEvent('subscription_created', {
      billing_period: billingPeriod,
      plan_value: planValue,
      customer_id: customerId,
      currency: 'USD'
    })
  }

  trackPortalAccessed(customerId: string) {
    this.trackEvent('customer_portal_accessed', {
      customer_id: customerId
    })
  }

  trackConsultationRequested(service: string) {
    this.trackEvent('consultation_requested', {
      service: service,
      type: 'paid_consultation'
    })
  }

  // Funnel analysis
  getFunnelData() {
    const funnelSteps = [
      'pricing_page_view',
      'checkout_initiated', 
      'trial_started',
      'subscription_created'
    ]
    
    return funnelSteps.map(step => ({
      step,
      count: this.events.filter(e => e.event === step).length
    }))
  }
}

// React hook for analytics
export function useAnalytics() {
  const analytics = AnalyticsTracker.getInstance()

  useEffect(() => {
    // Track page views automatically
    analytics.trackEvent('page_view', {
      page: window.location.pathname,
      referrer: document.referrer
    })
  }, [analytics])

  return analytics
}

// Export singleton instance
export const analytics = AnalyticsTracker.getInstance()

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
