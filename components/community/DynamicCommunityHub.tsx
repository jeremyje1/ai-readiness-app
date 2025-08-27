/**
 * Dynamic Community Hub Component
 * Fresh, regularly updated content and events for member retention
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAudience } from '@/lib/audience/AudienceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Download,
  Star,
  Users,
  Clock,
  PlayCircle,
  Bookmark,
  TrendingUp,
  Bell,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Eye,
  Award,
  Zap,
  FileText,
  Video,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DynamicCommunityHubProps {
  userId?: string;
  userTier?: 'basic' | 'comprehensive' | 'enterprise';
}

interface PremiumContent {
  id: string;
  title: string;
  description: string;
  type: 'report' | 'template' | 'webinar' | 'case_study' | 'toolkit' | 'masterclass';
  releaseDate: string;
  downloadUrl: string;
  author: string;
  tags: string[];
  stats: { downloads: number; views: number; rating: number; reviews: number };
  isNew: boolean;
  tier: 'basic' | 'comprehensive' | 'enterprise';
}

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  type: string;
  host: { name: string; title: string; bio: string };
  registrationUrl: string;
  currentParticipants: number;
  maxParticipants?: number;
  isRegistered?: boolean;
  canRegister?: boolean;
  spotsRemaining?: number;
  hostPhotoUrl?: string;
  materials: Array<{ title: string; url: string; type: string }>;
  tier: 'all' | 'premium' | 'enterprise';
}

interface CommunityInsight {
  id: string;
  title: string;
  summary: string;
  type: string;
  publishedDate: string;
  author: string;
  readTime: number;
  tags: string[];
  url: string;
  featured: boolean;
  memberExclusive: boolean;
}

export function DynamicCommunityHub({ userId, userTier = 'basic' }: DynamicCommunityHubProps) {
  const { audience, config } = useAudience();
  const { toast } = useToast();

  const [premiumContent, setPremiumContent] = useState<PremiumContent[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [insights, setInsights] = useState<CommunityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    loadCommunityData();
  }, [audience, userId, userTier]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);

      const [contentRes, eventsRes, insightsRes] = await Promise.all([
        fetch(`/api/community/premium-content?audience=${audience}&tier=${userTier}&userId=${userId}`),
        fetch(`/api/community/events?audience=${audience}&userId=${userId}&recordings=true`),
        fetch(`/api/community/insights?audience=${audience}&userId=${userId}`)
      ]);

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setPremiumContent(contentData.content || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setLiveEvents(eventsData.events || []);
      }

      // Mock insights for now since we don't have the insights API yet
      setInsights([
        {
          id: 'insight_1',
          title: `${audience === 'k12' ? 'District' : 'Institution'} AI Adoption Trends Report`,
          summary: `Latest data shows ${audience === 'k12' ? 'school districts' : 'higher education institutions'} are increasing AI adoption by 47% this quarter.`,
          type: 'trend_report',
          publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: 'AI Blueprint Research Team',
          readTime: 6,
          tags: ['trends', 'data', 'adoption'],
          url: '/community/insights/adoption-trends',
          featured: true,
          memberExclusive: true
        },
        {
          id: 'insight_2',
          title: 'Community Q&A: Top Implementation Questions',
          summary: 'Member questions and expert answers on the most common AI implementation challenges.',
          type: 'q_and_a',
          publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          author: 'Community Team',
          readTime: 4,
          tags: ['qa', 'community', 'implementation'],
          url: '/community/insights/qa-session',
          featured: false,
          memberExclusive: false
        }
      ]);

    } catch (error) {
      console.error('Failed to load community data:', error);
      toast({
        title: "Loading Error",
        description: "Could not load community content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (content: PremiumContent) => {
    try {
      // Track download interaction
      await fetch('/api/community/premium-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'download',
          contentId: content.id,
          userId
        })
      });

      // Trigger download
      window.open(content.downloadUrl, '_blank');

      toast({
        title: "Download Started",
        description: `${content.title} is being downloaded.`
      });

    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const handleEventRegistration = async (event: LiveEvent) => {
    if (event.isRegistered) {
      // Open event directly
      window.open(event.registrationUrl, '_blank');
      return;
    }

    try {
      const response = await fetch('/api/community/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          eventId: event.id,
          userId,
          registrationData: { audience, tier: userTier }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setLiveEvents(prev => prev.map(e => 
          e.id === event.id ? { ...e, isRegistered: true } : e
        ));

        toast({
          title: "Registration Successful!",
          description: "You're registered for the event. Check your email for details."
        });
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'report': return <FileText className="w-5 h-5" />;
      case 'template': return <BookOpen className="w-5 h-5" />;
      case 'webinar': return <Video className="w-5 h-5" />;
      case 'masterclass': return <PlayCircle className="w-5 h-5" />;
      case 'toolkit': return <Award className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'comprehensive': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {config.name} Community Hub
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Exclusive content, live events, and community insights for {config.nouns.org.toLowerCase()} leaders
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Updated {userTier === 'basic' ? 'Monthly' : userTier === 'comprehensive' ? 'Bi-weekly' : 'Weekly'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-green-600" />
            <span>{audience === 'k12' ? '1,200+' : '800+'} members</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">
            Premium Content
            {premiumContent.filter(c => c.isNew).length > 0 && (
              <Badge className="ml-2 bg-red-500 text-xs">
                {premiumContent.filter(c => c.isNew).length} New
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="events">
            Live Events
            {liveEvents.length > 0 && (
              <Badge className="ml-2 bg-blue-500 text-xs">
                {liveEvents.length} Upcoming
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights">Community Insights</TabsTrigger>
        </TabsList>

        {/* Premium Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Latest Premium Resources</h2>
            <p className="text-gray-600">
              Fresh content delivered {userTier === 'basic' ? 'monthly' : userTier === 'comprehensive' ? 'bi-weekly' : 'weekly'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumContent.map((content) => (
              <Card key={content.id} className="relative h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      {getContentIcon(content.type)}
                      <Badge className={getTierBadgeColor(content.tier)}>
                        {content.tier}
                      </Badge>
                      {content.isNew && (
                        <Badge className="bg-red-500 text-white text-xs">NEW</Badge>
                      )}
                    </div>
                    <Bookmark className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {content.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>By {content.author}</span>
                      <span>{new Date(content.releaseDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{content.stats.downloads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{content.stats.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{content.stats.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {content.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => handleDownload(content)}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
            <p className="text-gray-600">
              Join live discussions with {audience === 'k12' ? 'district leaders' : 'academic leaders'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveEvents.map((event) => (
              <Card key={event.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{event.type}</Badge>
                        {event.tier !== 'all' && (
                          <Badge className={getTierBadgeColor(event.tier)}>
                            {event.tier}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </div>
                    <img 
                      src={event.hostPhotoUrl} 
                      alt={event.host.name}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.duration} min</span>
                    </div>
                    {event.spotsRemaining && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event.spotsRemaining} spots left</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.host.name}</p>
                    <p className="text-xs text-gray-600">{event.host.title}</p>
                  </div>

                  <Button 
                    onClick={() => handleEventRegistration(event)}
                    className="w-full"
                    disabled={!event.canRegister && !event.isRegistered}
                  >
                    {event.isRegistered ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Join Event
                      </>
                    ) : event.canRegister ? (
                      'Register Now'
                    ) : (
                      'Event Full'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Community Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Community Insights</h2>
            <p className="text-gray-600">
              Latest trends and insights from your peers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{insight.type.replace('_', ' ')}</Badge>
                        {insight.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                        )}
                        {insight.memberExclusive && (
                          <Badge className="bg-purple-100 text-purple-800">Members Only</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <CardDescription>{insight.summary}</CardDescription>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>By {insight.author}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{insight.readTime} min read</span>
                      </div>
                      <span>{new Date(insight.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {insight.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read Full Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Member Benefits Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              🎉 Exclusive Member Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium">Early Access</h4>
                <p className="text-sm text-gray-600">Get new resources 7 days before public release</p>
              </div>
              <div className="text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Direct Support</h4>
                <p className="text-sm text-gray-600">Monthly consultation with implementation experts</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">Premium Content</h4>
                <p className="text-sm text-gray-600">Access to masterclasses and case studies</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}