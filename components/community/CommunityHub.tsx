/**
 * Community Hub Component
 * Audience-aware community features with Slack integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAudience } from '@/lib/audience/AudienceContext';
import { useAudienceAnalytics } from '@/lib/analytics/audienceAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  ExternalLink,
  Slack,
  Mail,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Building,
  Star,
  Clock,
  AlertTriangle,
  UserPlus,
  Bell
} from 'lucide-react';

interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  dailyMessages: number;
  weeklyEvents: number;
  audienceBreakdown: {
    k12: number;
    highered: number;
  };
  topChannels: Array<{
    name: string;
    description: string;
    memberCount: number;
    audience: 'k12' | 'highered' | 'both';
  }>;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  type: 'webinar' | 'discussion' | 'workshop' | 'networking';
  audience: 'k12' | 'highered' | 'both';
  host: string;
  registrationUrl?: string;
  maxParticipants?: number;
  currentParticipants: number;
}

interface CommunityHubProps {
  userId?: string;
  showJoinModal?: boolean;
}

export function CommunityHub({ userId, showJoinModal = false }: CommunityHubProps) {
  const { audience, config, copy } = useAudience();
  const analytics = useAudienceAnalytics(audience, userId);
  
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'joining' | 'success' | 'error'>('idle');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinName, setJoinName] = useState('');

  // Load community data
  useEffect(() => {
    fetchCommunityData();
  }, [audience]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, eventsResponse] = await Promise.all([
        fetch(`/api/community/stats?audience=${audience}`),
        fetch(`/api/community/events?audience=${audience}`)
      ]);

      if (!statsResponse.ok || !eventsResponse.ok) {
        throw new Error('Failed to fetch community data');
      }

      const [statsData, eventsData] = await Promise.all([
        statsResponse.json(),
        eventsResponse.json()
      ]);

      setStats(statsData.stats);
      setEvents(eventsData.events || []);

      // Track community view
      analytics.trackFeature('community', 'accessed', {
        total_members: statsData.stats?.totalMembers || 0,
        upcoming_events: eventsData.events?.length || 0
      });

    } catch (err) {
      console.error('Community data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!joinEmail.trim() || !joinName.trim()) {
      setError('Please enter both your name and email address');
      return;
    }

    setJoinStatus('joining');
    setError(null);

    try {
      const response = await fetch('/api/community/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: joinEmail.trim(),
          name: joinName.trim(),
          audience,
          userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join community');
      }

      setJoinStatus('success');
      
      // Track successful community join
      analytics.trackConversion('community_joined', 0, {
        join_method: 'slack_invite',
        invite_sent: data.inviteSent || false
      });

    } catch (err) {
      console.error('Join community error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join community');
      setJoinStatus('error');
      
      // Track failed join attempt
      analytics.trackError(err instanceof Error ? err : 'Join community failed', 'community_join');
    }
  };

  const handleEventRegistration = (event: CommunityEvent) => {
    analytics.trackFeature('community', 'accessed', {
      event_id: event.id,
      event_type: event.type,
      event_audience: event.audience
    });

    if (event.registrationUrl) {
      window.open(event.registrationUrl, '_blank');
    } else {
      // Fallback registration
      window.open('/contact?event=' + event.id, '_blank');
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar': return <Calendar className="w-4 h-4" />;
      case 'workshop': return <Users className="w-4 h-4" />;
      case 'discussion': return <MessageSquare className="w-4 h-4" />;
      case 'networking': return <UserPlus className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
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
            {config.name} AI Community
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-2">
          Connect with fellow {copy.organizationType} leaders navigating AI integration
        </p>
        <p className="text-sm text-gray-500">
          Join discussions, share resources, and learn from peers in your field
        </p>
      </div>

      {/* Community Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalMembers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Members</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeMembers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Active This Week</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.dailyMessages.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Daily Messages</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {stats.weeklyEvents}
              </div>
              <div className="text-sm text-gray-600">Weekly Events</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="join" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="join">Join Community</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
        </TabsList>

        {/* Join Community Tab */}
        <TabsContent value="join" className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Slack className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-xl">
                    Join the {config.name} AI Community
                  </CardTitle>
                  <CardDescription>
                    Connect with {stats ? stats.totalMembers.toLocaleString() : '1,000+'} educators on Slack
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {joinStatus === 'success' ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Welcome to the community!</strong> Check your email for a Slack invitation link. 
                    If you don't see it, check your spam folder or contact us for help.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="join-name">Your Name</Label>
                      <Input
                        id="join-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        disabled={joinStatus === 'joining'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="join-email">Email Address</Label>
                      <Input
                        id="join-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={joinEmail}
                        onChange={(e) => setJoinEmail(e.target.value)}
                        disabled={joinStatus === 'joining'}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleJoinCommunity}
                    disabled={joinStatus === 'joining' || !joinEmail.trim() || !joinName.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {joinStatus === 'joining' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Slack className="w-5 h-5 mr-2" />
                        Get Slack Invitation
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Daily Discussions</h4>
                  <p className="text-xs text-gray-600">
                    Participate in ongoing conversations about AI implementation
                  </p>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Peer Learning</h4>
                  <p className="text-xs text-gray-600">
                    Learn from others facing similar challenges in {copy.organizationType}
                  </p>
                </div>
                <div className="text-center">
                  <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Expert Access</h4>
                  <p className="text-xs text-gray-600">
                    Connect with AI education experts and thought leaders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats?.topChannels.filter(channel => 
              channel.audience === audience || channel.audience === 'both'
            ).map((channel) => (
              <Card key={channel.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">#{channel.name}</CardTitle>
                      <CardDescription>{channel.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      {channel.memberCount} members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {channel.audience === 'k12' && <GraduationCap className="w-4 h-4 text-blue-600" />}
                      {channel.audience === 'highered' && <Building className="w-4 h-4 text-blue-600" />}
                      {channel.audience === 'both' && <Users className="w-4 h-4 text-purple-600" />}
                      <span className="text-sm text-gray-600">
                        {channel.audience === 'both' ? 'All Audiences' : 
                         channel.audience === 'k12' ? 'K-12 Focus' : 'Higher Ed Focus'}
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card className="col-span-2">
                <CardContent className="text-center p-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Join the community to explore channels</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.filter(event => 
                event.audience === audience || event.audience === 'both'
              ).map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getEventTypeIcon(event.type)}
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{event.duration} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.currentParticipants}
                              {event.maxParticipants && `/${event.maxParticipants}`} registered
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          Hosted by <strong>{event.host}</strong>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Button 
                          onClick={() => handleEventRegistration(event)}
                          size="sm"
                        >
                          Register
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center p-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No upcoming events
                </h3>
                <p className="text-gray-600 mb-4">
                  Check back soon for new community events and workshops.
                </p>
                <Button variant="outline">
                  <Bell className="w-4 h-4 mr-2" />
                  Get Notified
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}