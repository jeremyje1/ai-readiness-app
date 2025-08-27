/**
 * Expert Sessions Component
 * Audience-aware expert consultation scheduling with Calendly integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAudience } from '@/lib/audience/AudienceContext';
import { useAudienceAnalytics } from '@/lib/analytics/audienceAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  Video,
  GraduationCap,
  Building,
  CheckCircle,
  Star,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  Phone
} from 'lucide-react';

interface ExpertSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  audience: 'k12' | 'highered' | 'both';
  expertName: string;
  expertTitle: string;
  expertBio: string;
  calendlyUrl: string;
  fallbackUrl?: string;
  topics: string[];
  sessionType: 'consultation' | 'workshop' | 'demo' | 'strategy';
  price: number;
  availability: 'available' | 'limited' | 'waitlist';
  rating: number;
  reviewCount: number;
  prerequisites?: string[];
}

interface ExpertSessionsProps {
  userId?: string;
  showBookingModal?: boolean;
  onBookingComplete?: (sessionId: string) => void;
}

export function ExpertSessions({ 
  userId, 
  showBookingModal = false, 
  onBookingComplete 
}: ExpertSessionsProps) {
  const { audience, config } = useAudience();
  const analytics = useAudienceAnalytics(audience, userId);
  
  const [sessions, setSessions] = useState<ExpertSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ExpertSession | null>(null);
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Load expert sessions
  useEffect(() => {
    fetchExpertSessions();
  }, [audience]);

  // Load Calendly widget script
  useEffect(() => {
    if (typeof window !== 'undefined' && !calendlyLoaded) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => setCalendlyLoaded(true);
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [calendlyLoaded]);

  const fetchExpertSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/expert-sessions?audience=${audience}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch expert sessions: ${response.statusText}`);
      }

      const data = await response.json();
      setSessions(data.sessions || []);

      // Track sessions view
      analytics.trackFeature('expert_sessions', 'accessed', {
        available_sessions: data.sessions?.length || 0,
        session_types: [...new Set(data.sessions?.map((s: ExpertSession) => s.sessionType) || [])]
      });

    } catch (err) {
      console.error('Expert sessions fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expert sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (session: ExpertSession) => {
    setSelectedSession(session);
    
    // Track booking attempt
    analytics.trackFeature('expert_sessions', 'accessed', {
      session_id: session.id,
      session_type: session.sessionType,
      expert: session.expertName,
      price: session.price
    });

    if (calendlyLoaded && (window as any).Calendly) {
      // Open Calendly popup
      (window as any).Calendly.initPopupWidget({
        url: session.calendlyUrl,
        prefill: {
          name: userId ? 'User' : '',
          customAnswers: {
            a1: audience,
            a2: session.id
          }
        },
        utm: {
          utmSource: 'ai-blueprint',
          utmMedium: 'expert-sessions',
          utmCampaign: audience
        }
      });

      // Track successful booking widget open
      analytics.trackConversion('expert_session_booking_started', session.price, {
        session_id: session.id,
        booking_method: 'calendly_widget'
      });
    } else {
      // Fallback to direct link
      const bookingUrl = session.calendlyUrl + `?utm_source=ai-blueprint&utm_medium=expert-sessions&utm_campaign=${audience}`;
      window.open(bookingUrl, '_blank');
      
      analytics.trackConversion('expert_session_booking_started', session.price, {
        session_id: session.id,
        booking_method: 'direct_link'
      });
    }
  };

  const handleFallbackContact = (session: ExpertSession) => {
    analytics.trackFeature('expert_sessions', 'accessed', {
      session_id: session.id,
      contact_method: 'fallback',
      reason: 'calendly_unavailable'
    });

    if (session.fallbackUrl) {
      window.open(session.fallbackUrl, '_blank');
    } else {
      // Default fallback - could be email or contact form
      window.open('/contact?session=' + session.id, '_blank');
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <MessageSquare className="w-5 h-5" />;
      case 'workshop': return <Users className="w-5 h-5" />;
      case 'demo': return <Video className="w-5 h-5" />;
      case 'strategy': return <GraduationCap className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-100 text-yellow-800">Limited Spots</Badge>;
      case 'waitlist':
        return <Badge className="bg-red-100 text-red-800">Waitlist Only</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true;
    if (activeTab === 'audience') return session.audience === audience || session.audience === 'both';
    return session.sessionType === activeTab;
  });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          {audience === 'k12' ? (
            <GraduationCap className="w-8 h-8 text-blue-600" />
          ) : (
            <Building className="w-8 h-8 text-blue-600" />
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            Expert Sessions for {config.name}
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-2">
          Connect with AI education experts tailored to your {audience === 'k12' ? 'district' : 'institution'}
        </p>
        <p className="text-sm text-gray-500">
          One-on-one consultations, workshops, and strategic planning sessions
        </p>
      </div>

      {/* Session Types Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="audience">{config.name} Only</TabsTrigger>
          <TabsTrigger value="consultation">Consultations</TabsTrigger>
          <TabsTrigger value="workshop">Workshops</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center p-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No sessions available
                </h3>
                <p className="text-gray-600 mb-4">
                  We're working on adding more expert sessions for {config.name}.
                </p>
                <Button variant="outline" onClick={() => window.open('/contact', '_blank')}>
                  Request Custom Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getSessionTypeIcon(session.sessionType)}
                        <Badge variant="outline" className="text-xs">
                          {session.sessionType}
                        </Badge>
                      </div>
                      {getAvailabilityBadge(session.availability)}
                    </div>
                    <CardTitle className="text-lg leading-tight">{session.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {session.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Expert Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{session.expertName}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{session.rating}</span>
                          <span className="text-xs text-gray-500">({session.reviewCount})</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{session.expertTitle}</div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{session.duration} minutes</span>
                      </div>
                      
                      {session.audience !== 'both' && (
                        <div className="flex items-center space-x-2">
                          {session.audience === 'k12' ? 
                            <GraduationCap className="w-4 h-4 text-gray-400" /> :
                            <Building className="w-4 h-4 text-gray-400" />
                          }
                          <span>{session.audience === 'k12' ? 'K-12 Focused' : 'Higher Ed Focused'}</span>
                        </div>
                      )}

                      {session.price > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-green-600">
                            ${session.price}
                          </span>
                        </div>
                      )}

                      {session.price === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Complimentary
                        </Badge>
                      )}
                    </div>

                    {/* Topics */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">Topics Covered:</div>
                      <div className="flex flex-wrap gap-1">
                        {session.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {session.topics.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{session.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {session.prerequisites && session.prerequisites.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs font-medium text-blue-800 mb-1">Prerequisites:</div>
                        <ul className="text-xs text-blue-700 space-y-1">
                          {session.prerequisites.map((prereq, index) => (
                            <li key={index} className="flex items-start space-x-1">
                              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{prereq}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Booking Button */}
                    <div className="mt-auto pt-4">
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleBookSession(session)}
                          disabled={session.availability === 'waitlist'}
                          className="w-full"
                        >
                          {session.availability === 'waitlist' ? (
                            <>Join Waitlist</>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-2" />
                              Book Session
                            </>
                          )}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        
                        {session.fallbackUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleFallbackContact(session)}
                            className="w-full"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Alternative Contact
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Why Book an Expert Session?
            </h3>
            <p className="text-gray-600">
              Get personalized guidance from AI education specialists who understand {audience === 'k12' ? 'K-12' : 'higher education'} challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Tailored Expertise</h4>
              <p className="text-sm text-gray-600">
                Experts specialized in {audience === 'k12' ? 'K-12 district' : 'higher education'} AI implementation
              </p>
            </div>
            
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Actionable Insights</h4>
              <p className="text-sm text-gray-600">
                Walk away with specific action items and implementation strategies
              </p>
            </div>
            
            <div className="text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">Proven Results</h4>
              <p className="text-sm text-gray-600">
                Learn from experts who have successfully guided similar organizations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}