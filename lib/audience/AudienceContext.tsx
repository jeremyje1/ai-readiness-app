/**
 * Audience Context Provider
 * Provides audience-aware state management for the application
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Audience } from './deriveAudience';
import { getAudienceConfig, AudienceConfig } from './config';
import { getAudienceCookieClient, setAudienceCookieClient } from './cookie';

export interface AudienceContextValue {
  audience: Audience;
  config: AudienceConfig;
  setAudience: (audience: Audience) => void;
  isHydrated: boolean;
  loading: boolean;
}

const AudienceContext = createContext<AudienceContextValue | undefined>(undefined);

export interface AudienceProviderProps {
  children: ReactNode;
  initialAudience?: Audience;
  allowClientOverride?: boolean;
}

/**
 * AudienceProvider component
 * Manages audience state and configuration across the application
 */
export function AudienceProvider({ 
  children, 
  initialAudience = 'k12',
  allowClientOverride = process.env.NODE_ENV !== 'production'
}: AudienceProviderProps) {
  const [audience, setAudienceState] = useState<Audience>(initialAudience);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from cookie on client side
  useEffect(() => {
    const cookieAudience = getAudienceCookieClient();
    
    if (cookieAudience && cookieAudience !== audience) {
      setAudienceState(cookieAudience);
    }
    
    setIsHydrated(true);
  }, [audience]);

  // Update cookie when audience changes
  const setAudience = (newAudience: Audience) => {
    if (newAudience !== audience) {
      setAudienceState(newAudience);
      setAudienceCookieClient(newAudience);
      
      // Optional: trigger analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'audience_change', {
          previous_audience: audience,
          new_audience: newAudience,
          source: 'manual_override'
        });
      }
    }
  };

  // Get current audience configuration
  const config = getAudienceConfig(audience);

  const value: AudienceContextValue = {
    audience,
    config,
    setAudience: allowClientOverride ? setAudience : () => {
      console.warn('Audience override disabled in production');
    },
    isHydrated,
    loading: !isHydrated
  };

  return (
    <AudienceContext.Provider value={value}>
      {children}
    </AudienceContext.Provider>
  );
}

/**
 * useAudience hook
 * Access current audience and configuration
 */
export function useAudience(): AudienceContextValue {
  const context = useContext(AudienceContext);
  
  if (context === undefined) {
    throw new Error('useAudience must be used within an AudienceProvider');
  }
  
  return context;
}

/**
 * useAudienceConfig hook
 * Access audience configuration directly
 */
export function useAudienceConfig(): AudienceConfig {
  const { config } = useAudience();
  return config;
}

/**
 * useAudienceCopy hook
 * Access audience-specific copy text
 */
export function useAudienceCopy() {
  const { config } = useAudience();
  return config.copy;
}

/**
 * useAudienceNouns hook  
 * Access audience-specific terminology
 */
export function useAudienceNouns() {
  const { config } = useAudience();
  return config.nouns;
}

/**
 * useAudienceRoles hook
 * Access audience-specific roles
 */
export function useAudienceRoles() {
  const { config } = useAudience();
  return config.roles;
}

/**
 * useAudienceUrls hook
 * Access audience-specific external URLs
 */
export function useAudienceUrls() {
  const { config } = useAudience();
  return {
    calendly: config.calendlyUrl,
    slack: config.slackInviteUrl,
  };
}

/**
 * useAudienceAssessment hook
 * Access audience-specific assessment configuration
 */
export function useAudienceAssessment() {
  const { config } = useAudience();
  return config.assessment;
}

/**
 * withAudience HOC
 * Wrap component with audience context access
 */
export function withAudience<P extends object>(
  Component: React.ComponentType<P & { audience: Audience; config: AudienceConfig }>
) {
  return function WithAudienceComponent(props: P) {
    const { audience, config } = useAudience();
    
    return <Component {...props} audience={audience} config={config} />;
  };
}

/**
 * AudienceGuard component
 * Conditionally render content based on audience
 */
export interface AudienceGuardProps {
  audiences: Audience[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function AudienceGuard({ audiences, children, fallback = null }: AudienceGuardProps) {
  const { audience } = useAudience();
  
  if (audiences.includes(audience)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * AudienceText component
 * Render different text based on audience
 */
export interface AudienceTextProps {
  k12?: string;
  highered?: string;
  fallback?: string;
}

export function AudienceText({ k12, highered, fallback }: AudienceTextProps) {
  const { audience } = useAudience();
  
  const text = audience === 'k12' ? k12 : audience === 'highered' ? highered : fallback;
  
  if (!text) {
    console.warn(`No text provided for audience: ${audience}`);
    return null;
  }
  
  return <>{text}</>;
}

/**
 * Debug component for development
 */
export function AudienceDebugInfo() {
  const { audience, config, isHydrated } = useAudience();
  
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Audience: {audience}</div>
      <div>Config: {config.shortName}</div>
      <div>Hydrated: {isHydrated ? '✅' : '❌'}</div>
    </div>
  );
}