/**
 * Analytics Utility - Integration with Google Analytics 4
 * 
 * This module provides a centralized interface for tracking user interactions
 * across the application. It handles:
 * - GA4 initialization and configuration
 * - Standard page view tracking
 * - Custom event tracking
 * - Form submission tracking
 * - Conversion/funnel tracking
 * - Respects user's cookie preferences (GDPR compliance)
 */

import ReactGA from 'react-ga4';

// Event categories for consistent tracking
export enum EventCategory {
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  NAVIGATION = 'navigation',
  FORM = 'form',
  CONTENT = 'content',
  ERROR = 'error',
  ASSESSMENT = 'assessment',
  ACCOUNT = 'account',
}

// Define common user actions
export enum UserAction {
  CLICK = 'click',
  VIEW = 'view',
  SUBMIT = 'submit',
  START = 'start',
  COMPLETE = 'complete',
  DOWNLOAD = 'download',
  SHARE = 'share',
  SIGNUP = 'signup',
  LOGIN = 'login',
  UPGRADE = 'upgrade',
  ERROR = 'error',
}

// Define conversion funnels
export enum ConversionFunnel {
  ASSESSMENT_FUNNEL = 'assessment_funnel',
  SIGNUP_FUNNEL = 'signup_funnel',
  CHECKOUT_FUNNEL = 'checkout_funnel',
  DEMO_FUNNEL = 'demo_funnel',
}

// Interface for event parameters
export interface EventParams {
  [key: string]: string | number | boolean | null | undefined;
}

// Cookie consent status
export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  PENDING = 'pending',
}

// Analytics configuration state
let analyticsInitialized = false;
let cookieConsentStatus: ConsentStatus = ConsentStatus.PENDING;

/**
 * Initialize Google Analytics with the provided tracking ID
 * @param measurementId - GA4 measurement ID
 * @param consentGranted - Whether consent has been granted
 * @param options - Additional configuration options
 */
export const initializeAnalytics = (
  measurementId: string,
  consentGranted = false,
  options?: {
    debug?: boolean;
    gtagOptions?: Record<string, any>;
  }
): void => {
  // Only initialize if consent is granted or if in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!measurementId) {
    console.warn('Analytics: No measurement ID provided');
    return;
  }

  if (!consentGranted && !isDev) {
    console.info('Analytics: Consent not granted, analytics not initialized');
    cookieConsentStatus = ConsentStatus.DENIED;
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      testMode: isDev,
      gaOptions: {
        anonymize_ip: true,
        cookie_expires: 60 * 60 * 24 * 365, // 1 year
        debug_mode: options?.debug || false,
        ...options?.gtagOptions,
      },
    });
    
    analyticsInitialized = true;
    cookieConsentStatus = ConsentStatus.GRANTED;
    console.info('Analytics: Successfully initialized');
  } catch (error) {
    console.error('Analytics: Failed to initialize', error);
  }
};

/**
 * Update cookie consent status and reinitialize analytics if needed
 * @param status - New consent status
 */
export const updateConsentStatus = (status: ConsentStatus): void => {
  cookieConsentStatus = status;
  
  // If consent is granted and analytics isn't initialized yet, initialize it
  if (status === ConsentStatus.GRANTED && !analyticsInitialized) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      initializeAnalytics(measurementId, true);
    }
  }
};

/**
 * Track page view with optional custom parameters
 * @param path - Page path (defaults to current path)
 * @param title - Page title
 * @param params - Additional parameters
 */
export const trackPageView = (
  path?: string, 
  title?: string,
  params?: EventParams
): void => {
  if (!analyticsInitialized) return;

  try {
    ReactGA.send({
      hitType: 'pageview',
      page: path || window.location.pathname,
      title: title || document.title,
      ...params,
    });
  } catch (error) {
    console.error('Analytics: Error tracking page view', error);
  }
};

/**
 * Track custom event with GA4
 * @param category - Event category
 * @param action - Action performed
 * @param params - Additional event parameters
 */
export const trackEvent = (
  category: EventCategory | string,
  action: UserAction | string,
  params?: EventParams
): void => {
  if (!analyticsInitialized) return;

  try {
    ReactGA.event(action, {
      event_category: category,
      ...params,
    });
  } catch (error) {
    console.error('Analytics: Error tracking event', error);
  }
};

/**
 * Track form submission events
 * @param formName - Name of the form
 * @param success - Whether submission was successful
 * @param params - Additional parameters
 */
export const trackFormSubmission = (
  formName: string,
  success: boolean,
  params?: EventParams
): void => {
  trackEvent(
    EventCategory.FORM,
    UserAction.SUBMIT,
    {
      form_name: formName,
      success: success,
      ...params,
    }
  );
};

/**
 * Track user conversion through specific funnel stages
 * @param funnel - Conversion funnel identifier
 * @param stage - Current stage in the funnel (e.g., 'view', 'start', 'complete')
 * @param params - Additional parameters
 */
export const trackFunnelStage = (
  funnel: ConversionFunnel | string,
  stage: string,
  params?: EventParams
): void => {
  trackEvent(
    EventCategory.CONVERSION,
    stage as UserAction,
    {
      funnel: funnel,
      funnel_stage: stage,
      ...params,
    }
  );
};

/**
 * Track button/CTA click
 * @param buttonName - Name or identifier of the button
 * @param buttonLocation - Location of button (e.g., 'header', 'hero', 'pricing')
 * @param params - Additional parameters
 */
export const trackButtonClick = (
  buttonName: string,
  buttonLocation: string,
  params?: EventParams
): void => {
  trackEvent(
    EventCategory.ENGAGEMENT,
    UserAction.CLICK,
    {
      button_name: buttonName,
      button_location: buttonLocation,
      ...params,
    }
  );
};

/**
 * Track content engagement (e.g., video plays, downloads)
 * @param contentType - Type of content (video, pdf, etc.)
 * @param contentName - Name of the content
 * @param action - Action performed with content
 * @param params - Additional parameters
 */
export const trackContentEngagement = (
  contentType: string,
  contentName: string,
  action: UserAction,
  params?: EventParams
): void => {
  trackEvent(
    EventCategory.CONTENT,
    action,
    {
      content_type: contentType,
      content_name: contentName,
      ...params,
    }
  );
};

/**
 * Track errors that users encounter
 * @param errorType - Type of error
 * @param errorMessage - Error message
 * @param params - Additional parameters
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  params?: EventParams
): void => {
  trackEvent(
    EventCategory.ERROR,
    UserAction.ERROR,
    {
      error_type: errorType,
      error_message: errorMessage,
      ...params,
    }
  );
};

/**
 * Check if analytics is initialized
 */
export const isAnalyticsInitialized = (): boolean => {
  return analyticsInitialized;
};

/**
 * Get current consent status
 */
export const getConsentStatus = (): ConsentStatus => {
  return cookieConsentStatus;
};

/**
 * Set user ID for cross-device tracking once user is authenticated
 * @param userId - Unique user identifier
 */
export const setUserId = (userId: string): void => {
  if (!analyticsInitialized) return;
  ReactGA.set({ user_id: userId });
};
