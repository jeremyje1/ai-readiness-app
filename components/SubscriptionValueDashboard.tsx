import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  Target,
  BarChart3,
  BookOpen,
  MessageSquare,
  Award
} from 'lucide-react';

interface SubscriptionValueProps {
  userId: string;
  assessmentId?: string;
  tier: string;
}

interface ProgressData {
  implementationProgress: number;
  daysActive: number;
  nextMilestone: string;
  reassessmentDue: Date;
  expertSessionsUsed: number;
  expertSessionsTotal: number;
  communityPosts: number;
  templatesDownloaded: number;
}

export default function SubscriptionValueDashboard({ userId, assessmentId, tier }: SubscriptionValueProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [userId]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscription/progress/${userId}`);
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleExpertSession = () => {
    window.open('https://calendly.com/aiblueprint-expert/monthly-strategy', '_blank');
  };

  const joinCommunity = () => {
    window.open('https://aiblueprint-community.slack.com', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!progress) {
    return <div className="text-center text-gray-500">Unable to load progress data</div>;
  }

  const isReassessmentDue = progress.reassessmentDue && new Date() >= new Date(progress.reassessmentDue);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Days Active</p>
                <p className="text-2xl font-bold">{progress.daysActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Implementation</p>
                <p className="text-2xl font-bold">{progress.implementationProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Expert Sessions</p>
                <p className="text-2xl font-bold">{progress.expertSessionsUsed}/{progress.expertSessionsTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Templates Used</p>
                <p className="text-2xl font-bold">{progress.templatesDownloaded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reassessment Alert */}
      {isReassessmentDue && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              Quarterly Reassessment Due
            </CardTitle>
            <CardDescription className="text-orange-700">
              It's time to measure your AI readiness progress! Take your quarterly reassessment to see improvements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => window.location.href = '/ai-readiness/reassessment'}
            >
              Start Reassessment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Implementation Progress
          </CardTitle>
          <CardDescription>
            Your AI implementation journey progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Implementation</span>
              <span>{progress.implementationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${progress.implementationProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Next milestone: {progress.nextMilestone}</span>
          </div>
        </CardContent>
      </Card>

      {/* This Month's Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expert Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Expert Support
            </CardTitle>
            <CardDescription>
              Get personalized guidance from AI transformation experts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Monthly Sessions Used</span>
              <Badge variant={progress.expertSessionsUsed === 0 ? "destructive" : "default"}>
                {progress.expertSessionsUsed}/{progress.expertSessionsTotal}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={scheduleExpertSession}
                className="w-full"
                disabled={progress.expertSessionsUsed >= progress.expertSessionsTotal}
              >
                Schedule Expert Session
              </Button>
              <p className="text-xs text-gray-600 text-center">
                1-hour monthly strategy session included
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Community Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community & Resources
            </CardTitle>
            <CardDescription>
              Connect with peers and access exclusive content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Community Posts</span>
                <span>{progress.communityPosts} this month</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Templates Downloaded</span>
                <span>{progress.templatesDownloaded} total</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button onClick={joinCommunity} variant="outline" className="w-full">
                Join Community Discussion
              </Button>
              <Button 
                onClick={() => window.location.href = '/resources/templates'}
                variant="outline" 
                className="w-full"
              >
                Browse New Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            This Month's Features
          </CardTitle>
          <CardDescription>
            New content and tools added to your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm">New Policy Templates</h4>
              <p className="text-xs text-gray-600 mt-1">Updated FERPA compliance templates for 2025</p>
              <Button size="sm" variant="outline" className="mt-2">
                Download
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm">Webinar Replay</h4>
              <p className="text-xs text-gray-600 mt-1">"AI Ethics in Education" - January session</p>
              <Button size="sm" variant="outline" className="mt-2">
                Watch
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm">Peer Case Study</h4>
              <p className="text-xs text-gray-600 mt-1">Springfield District's AI implementation success</p>
              <Button size="sm" variant="outline" className="mt-2">
                Read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Benefits Reminder */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Your Subscription Includes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Quarterly reassessments with progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Monthly expert strategy sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Access to private peer community</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Monthly policy & template updates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Weekly office hours with experts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Peer benchmarking & industry insights</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
