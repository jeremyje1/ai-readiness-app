/**
 * Audience-Aware Dashboard
 * Dashboard with audience-specific metrics, terminology, and insights
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAudienceAnalytics } from '@/lib/analytics/audienceAnalytics';
import { useAudience } from '@/lib/audience/AudienceContext';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Building,
  CheckCircle,
  Clock,
  GraduationCap,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DashboardMetrics {
  assessmentScore: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    level: 'emerging' | 'developing' | 'proficient' | 'advanced';
  };
  completionRate: {
    percentage: number;
    completed: number;
    total: number;
  };
  audienceSpecificMetrics: {
    k12?: {
      districtsServed: number;
      studentsImpacted: number;
      staffTrained: number;
      policyImplementation: number;
    };
    highered?: {
      institutionsServed: number;
      facultyEngaged: number;
      programsLaunched: number;
      researchProjects: number;
    };
  };
  recentActivity: Array<{
    id: string;
    type: 'assessment' | 'resource' | 'training' | 'policy';
    title: string;
    timestamp: string;
    status: 'completed' | 'in_progress' | 'upcoming';
  }>;
  recommendations: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    resourceId?: string;
  }>;
  benchmarking: {
    percentile: number;
    peerComparison: 'above' | 'below' | 'average';
    sampleSize: number;
  };
  quickWins: Array<{
    id: string;
    title: string;
    pillar: string;
    rationale: string;
    timeframe: string;
    score: number;
  }>;
  riskHotspots: Array<{
    id: string;
    pillar: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    severityLabel: string;
    riskStatement: string;
    likelihood: string;
    impact: string;
    recommendedMitigation: string;
    nistReference: string;
    score: number;
  }>;
  nistAlignment: Array<{
    id: string;
    function: string;
    score: number;
    status: 'optimized' | 'progressing' | 'attention' | 'critical';
    statusLabel: string;
    requirement: string;
    guidance: string;
    priority: string;
  }>;
}

interface AudienceAwareDashboardProps {
  userId?: string;
}

export function AudienceAwareDashboard({ userId }: AudienceAwareDashboardProps) {
  const { audience, config } = useAudience();
  const analytics = useAudienceAnalytics(audience, userId);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const analyticsRef = useRef(analytics);

  useEffect(() => {
    analyticsRef.current = analytics;
  }, [analytics]);

  // Fetch audience-aware metrics
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        audience,
        ...(userId && { userId })
      });

      const response = await fetch(`/api/dashboard/metrics?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      setMetrics({
        ...data.metrics,
        quickWins: data.metrics.quickWins ?? [],
        riskHotspots: data.metrics.riskHotspots ?? [],
        nistAlignment: data.metrics.nistAlignment ?? []
      });
      setLastUpdated(new Date(data.lastUpdated));

      // Track dashboard view with audience analytics
      analyticsRef.current?.trackDashboardView?.({
        score: data.metrics.assessmentScore.current,
        level: data.metrics.assessmentScore.level,
        completion_rate: data.metrics.completionRate.percentage
      });

    } catch (err) {
      console.error('Dashboard metrics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [audience, userId]);

  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'proficient': return 'bg-blue-100 text-blue-800';
      case 'developing': return 'bg-yellow-100 text-yellow-800';
      case 'emerging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardMetrics}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No metrics available
  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="text-center p-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Welcome to your {config.name} dashboard
            </h3>
            <p className="text-gray-600 mb-6">
              Complete an assessment to see your AI readiness metrics and recommendations.
            </p>
            <Button onClick={() => window.location.href = '/assessment'}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const audienceMetrics = metrics.audienceSpecificMetrics;
  const quickWins = metrics.quickWins ?? [];
  const riskHotspotsRaw = metrics.riskHotspots ?? [];
  const nistAlignment = metrics.nistAlignment ?? [];

  const severityRank: Record<'critical' | 'high' | 'medium' | 'low', number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
  };

  const severityBadgeClasses: Record<'critical' | 'high' | 'medium' | 'low', string> = {
    critical: 'bg-red-100 text-red-800 border border-red-200',
    high: 'bg-orange-100 text-orange-800 border border-orange-200',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200',
    low: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  };

  const alignmentBadgeClasses: Record<'optimized' | 'progressing' | 'attention' | 'critical', string> = {
    optimized: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    progressing: 'bg-amber-100 text-amber-800 border border-amber-200',
    attention: 'bg-orange-100 text-orange-800 border border-orange-200',
    critical: 'bg-red-100 text-red-800 border border-red-200'
  };

  const riskHotspots = [...riskHotspotsRaw].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  const handleQuickWinNavigation = (win: DashboardMetrics['quickWins'][number]) => {
    analytics.trackFeature('quick_win', 'accessed', {
      pillar: win.pillar,
      timeframe: win.timeframe,
      score: win.score,
      source: 'quick_win_card'
    });
    analytics.trackNavigation('dashboard', 'quick-win');

    const pillarToken = win.pillar.toLowerCase().split(' ')[0];
    window.location.href = `/blueprint/new?from=quick-win&pillar=${encodeURIComponent(pillarToken)}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {audience === 'k12' ? (
              <GraduationCap className="w-8 h-8 text-blue-600" />
            ) : (
              <Building className="w-8 h-8 text-blue-600" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {config.name} AI Readiness Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Monitor your {config.nouns.org.toLowerCase()}’s AI integration progress and insights
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline">
            {config.name}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchDashboardMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Assessment Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Readiness Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(metrics.assessmentScore.current)}`}>
                  {metrics.assessmentScore.current}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  {metrics.assessmentScore.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : metrics.assessmentScore.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Target className="w-4 h-4 text-gray-600" />
                  )}
                  <Badge className={getLevelBadgeVariant(metrics.assessmentScore.level)}>
                    {metrics.assessmentScore.level}
                  </Badge>
                </div>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {metrics.completionRate.percentage}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {metrics.completionRate.completed} of {metrics.completionRate.total} sections
                </p>
                <Progress
                  value={metrics.completionRate.percentage}
                  className="mt-2 h-2"
                />
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Audience-Specific Metric 1 */}
        <Card>
          <CardContent className="p-6">
            {audience === 'k12' && audienceMetrics?.k12 ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students Impacted</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {audienceMetrics.k12.studentsImpacted.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Across {audienceMetrics.k12.districtsServed} districts
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            ) : audience === 'highered' && audienceMetrics?.highered ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faculty Engaged</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {audienceMetrics.highered.facultyEngaged.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    At {audienceMetrics.highered.institutionsServed} institutions
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Community</p>
                  <p className="text-3xl font-bold text-purple-600">-</p>
                  <p className="text-sm text-gray-500 mt-1">Data not available</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benchmarking */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peer Ranking</p>
                <p className="text-3xl font-bold text-orange-600">
                  {metrics.benchmarking.percentile}th
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  percentile ({metrics.benchmarking.sampleSize} peers)
                </p>
                <Badge variant="outline" className="mt-2">
                  {metrics.benchmarking.peerComparison} average
                </Badge>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Personalized Recommendations</span>
            </CardTitle>
            <CardDescription>
              AI-powered suggestions based on your {config.nouns.org.toLowerCase()}’s profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.recommendations.slice(0, 5).map((rec) => (
              <div key={rec.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                {getPriorityIcon(rec.priority)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  {rec.resourceId && (
                    <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                      View Resource
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest updates and progress across your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                {activity.type === 'assessment' && <BarChart3 className="w-5 h-5 text-blue-500" />}
                {activity.type === 'resource' && <BookOpen className="w-5 h-5 text-green-500" />}
                {activity.type === 'training' && <Users className="w-5 h-5 text-purple-500" />}
                {activity.type === 'policy' && <Shield className="w-5 h-5 text-orange-500" />}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    <Badge
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Win Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span>Quick Win Plays</span>
          </CardTitle>
          <CardDescription>
            Immediate actions pulled straight from your latest readiness assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quickWins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickWins.map((win) => (
                <div
                  key={win.id}
                  className="rounded-xl border border-yellow-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {win.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {win.pillar} • Score {Math.max(0, Math.round(win.score))}/100
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {win.timeframe}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">
                    {win.rationale}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <CheckCircle className="h-4 w-4 text-yellow-600" />
                      <span>Momentum-ready task</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleQuickWinNavigation(win)}
                    >
                      Plan this win
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-yellow-200 bg-yellow-50/70 p-8 text-center">
              <Sparkles className="h-6 w-6 text-yellow-600" />
              <p className="mt-4 text-sm text-yellow-800">
                Complete your AI readiness assessment to unlock personalized quick wins tailored to your {config.nouns.org.toLowerCase()}.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  analytics.trackNavigation('dashboard', 'assessment');
                  analytics.trackFeature('assessment', 'accessed');
                  window.location.href = '/assessment';
                }}
              >
                Start Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Mitigation Highlights */}
      {riskHotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-900">
              <ShieldAlert className="w-5 h-5" />
              <span>Risk Mitigation Highlights</span>
            </CardTitle>
            <CardDescription>
              Priority risk areas surfaced from your assessment with recommended mitigation steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskHotspots.map((risk) => (
              <div key={risk.id} className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold text-gray-900">{risk.pillar} • {risk.riskStatement}</p>
                    <p className="mt-2 text-sm text-gray-700">{risk.recommendedMitigation}</p>
                  </div>
                  <span className={`${severityBadgeClasses[risk.severity]} rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                    {risk.severityLabel}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    Likelihood: <strong className="font-medium text-gray-800">{risk.likelihood}</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    Impact: <strong className="font-medium text-gray-800">{risk.impact}</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    <Scale className="h-3.5 w-3.5 text-indigo-500" />
                    {risk.nistReference}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* NIST Gap Analysis */}
      {nistAlignment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <span>NIST Alignment Tracker</span>
            </CardTitle>
            <CardDescription>
              Snapshot of your alignment with the NIST AI RMF functions and recommended next moves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nistAlignment.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold text-gray-900">{item.function}</p>
                    <p className="mt-1 text-sm text-gray-600">{item.requirement}</p>
                  </div>
                  <span className={`${alignmentBadgeClasses[item.status]} rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                    {item.statusLabel}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                  <Progress value={item.score} className="h-2 flex-1" />
                  <span className="text-sm font-medium text-gray-800">{item.score}/100</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                  <p className="flex-1 min-w-[200px]">{item.guidance}</p>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}