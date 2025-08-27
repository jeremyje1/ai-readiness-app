/**
 * Expert Session Button Component
 * Calendly popup with fallback to same-tab redirect
 * Audience-aware URLs and messaging
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useAudience, useAudienceUrls } from '@/lib/audience/AudienceContext';
import { useMetricsTracker } from '@/lib/metrics/events';
import { Calendar, ExternalLink, Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface ExpertSessionButtonProps {
  variant?: 'default' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  userId?: string;
}

export function ExpertSessionButton({ 
  variant = 'default', 
  size = 'md',
  className = '',
  userId
}: ExpertSessionButtonProps) {
  const { audience, config } = useAudience();
  const { trackExpertSession } = useMetricsTracker();
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const calendlyUrl = config.calendlyUrl;

  const handleBookSession = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Track the attempt
      trackExpertSession({
        sessionType: audience === 'k12' ? 'K-12 Strategy Session' : 'Higher Ed Strategy Session',
        calendlyUrl,
        success: false, // Will be updated on success
        userId,
        audience
      });

      // Attempt popup first
      const popup = window.open(
        calendlyUrl, 
        'calendly-popup',
        'width=800,height=700,scrollbars=yes,resizable=yes,toolbar=no,location=no'
      );

      // Check if popup was blocked after a short delay
      setTimeout(() => {
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          setShowFallback(true);
          console.log('Popup blocked, showing fallback option');
        } else {
          // Track successful popup
          trackExpertSession({
            sessionType: audience === 'k12' ? 'K-12 Strategy Session' : 'Higher Ed Strategy Session',
            calendlyUrl,
            success: true,
            userId,
            audience
          });

          // Monitor popup for completion (optional)
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              console.log('Calendly popup was closed');
            }
          }, 1000);
        }
      }, 100);

    } catch (error) {
      console.error('Error opening Calendly:', error);
      setShowFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [calendlyUrl, audience, userId, trackExpertSession]);

  const handleFallbackClick = useCallback(() => {
    // Track fallback usage
    trackExpertSession({
      sessionType: audience === 'k12' ? 'K-12 Strategy Session (Fallback)' : 'Higher Ed Strategy Session (Fallback)',
      calendlyUrl,
      success: true,
      userId,
      audience
    });

    // Redirect in same tab
    window.location.href = calendlyUrl;
  }, [calendlyUrl, audience, userId, trackExpertSession]);

  if (variant === 'card') {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {config.copy.expertSessionTitle}
          </CardTitle>
          <CardDescription>
            {config.copy.expertSessionDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>30 minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>1-on-1 session</span>
            </div>
          </div>

          {!showFallback ? (
            <Button 
              onClick={handleBookSession} 
              disabled={isLoading}
              className="w-full"
              size={size}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Opening Calendar...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Your Session
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <strong>Popup blocked?</strong> No problem! Click below to open Calendly in a new tab.
              </div>
              <Button 
                onClick={handleFallbackClick}
                variant="outline"
                className="w-full"
                size={size}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Calendar in New Tab
              </Button>
              <Button
                onClick={() => setShowFallback(false)}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                Try Popup Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600">
          Need guidance?
        </span>
        {!showFallback ? (
          <Button 
            onClick={handleBookSession} 
            disabled={isLoading}
            variant="link"
            size="sm"
            className="p-0 h-auto"
          >
            {isLoading ? (
              'Opening...'
            ) : (
              <>
                Book a strategy session
                <ArrowRight className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleFallbackClick}
            variant="link" 
            size="sm"
            className="p-0 h-auto"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Book a strategy session
          </Button>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <div className={`space-y-2 ${className}`}>
      {!showFallback ? (
        <Button 
          onClick={handleBookSession} 
          disabled={isLoading}
          size={size}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Opening...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              {audience === 'k12' ? 'Book District Strategy Session' : 'Book Institution Strategy Session'}
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-amber-600 text-center">
            Popup blocked? Click below to open in a new tab.
          </div>
          <Button 
            onClick={handleFallbackClick}
            variant="outline"
            size={size}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Calendly
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Expert Sessions showcase component
 */
export function ExpertSessionsShowcase({ userId }: { userId?: string }) {
  const { audience, config } = useAudience();

  const expertTypes = audience === 'k12' ? [
    {
      title: 'Superintendent Strategy Session',
      description: 'District-wide AI implementation planning',
      duration: '30 minutes',
      topics: ['Policy Development', 'Budget Planning', 'Change Management', 'Community Engagement']
    },
    {
      title: 'Curriculum Integration Consultation',
      description: 'AI integration in teaching and learning',
      duration: '45 minutes', 
      topics: ['Curriculum Alignment', 'Teacher Training', 'Student Assessment', 'Digital Citizenship']
    },
    {
      title: 'Technology Infrastructure Review',
      description: 'Technical readiness and implementation',
      duration: '30 minutes',
      topics: ['Infrastructure Assessment', 'Security Planning', 'Vendor Selection', 'Rollout Strategy']
    }
  ] : [
    {
      title: 'Provost Strategy Session',
      description: 'Institution-wide academic AI integration',
      duration: '30 minutes',
      topics: ['Academic Strategy', 'Faculty Development', 'Policy Framework', 'Accreditation Prep']
    },
    {
      title: 'Faculty Development Consultation', 
      description: 'AI integration in teaching and research',
      duration: '45 minutes',
      topics: ['Pedagogical Integration', 'Research Applications', 'Ethics Training', 'Assessment Methods']
    },
    {
      title: 'Research & Innovation Planning',
      description: 'AI in research and institutional innovation',
      duration: '30 minutes',
      topics: ['Research Guidelines', 'Innovation Strategy', 'Ethical Frameworks', 'Grant Opportunities']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {config.copy.expertSessionTitle}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {config.copy.expertSessionDescription}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expertTypes.map((expert, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{expert.title}</CardTitle>
              <CardDescription>{expert.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{expert.duration}</span>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Topics Covered:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {expert.topics.map((topic, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-blue-600 rounded-full" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <ExpertSessionButton variant="card" size="lg" userId={userId} className="mx-auto" />
      </div>
    </div>
  );
}