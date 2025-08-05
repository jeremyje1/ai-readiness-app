'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/card';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalAssessments: number;
  averageScore: number;
  completionRate: number;
  topRecommendations: string[];
  tierDistribution: Record<string, number>;
  domainAverages: Record<string, number>;
  monthlyTrends: Array<{ month: string; assessments: number; avgScore: number }>;
  institutionTypes: Record<string, number>;
  benchmarkData: {
    percentile: number;
    peerAverage: number;
    industryAverage: number;
  };
}

export default function AIReadinessAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedTier, setSelectedTier] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedTier]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        range: dateRange,
        tier: selectedTier,
        action: 'analytics'
      });
      
      const response = await fetch(`/api/ai-readiness/analytics?${params}`);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/ai-readiness/analytics/export?range=${dateRange}&tier=${selectedTier}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-readiness-analytics-${dateRange}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Readiness Analytics</h1>
          <p className="text-gray-600">Comprehensive assessment insights and trends</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select 
            value={selectedTier} 
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Tiers</option>
            <option value="pulse-check">Pulse Check</option>
            <option value="comprehensive">Comprehensive</option>
            <option value="transformation">Transformation</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalAssessments}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}%</p>
              <Badge 
                variant={analytics.averageScore >= 70 ? "default" : analytics.averageScore >= 50 ? "secondary" : "destructive"}
                className="mt-1"
              >
                {analytics.benchmarkData.percentile}th percentile
              </Badge>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peer Comparison</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.benchmarkData.peerAverage > analytics.averageScore ? '-' : '+'}
                {Math.abs(analytics.benchmarkData.peerAverage - analytics.averageScore).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">vs peer average</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Assessment Trends</h3>
          <div className="space-y-2">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{trend.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{trend.assessments} assessments</span>
                  <Badge variant={trend.avgScore >= 70 ? "default" : "secondary"}>
                    {trend.avgScore}% avg
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Domain Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Domain Performance</h3>
          <div className="space-y-3">
            {Object.entries(analytics.domainAverages).map(([domain, score]) => (
              <div key={domain} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{domain}</span>
                  <span className="text-sm text-gray-600">{score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      score >= 70 ? 'bg-green-600' : 
                      score >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tier Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.tierDistribution).map(([tier, count]) => (
              <div key={tier} className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{tier.replace('-', ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${(count / analytics.totalAssessments) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Recommendations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Most Common Recommendations</h3>
          <div className="space-y-2">
            {analytics.topRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 text-xs">
                  {index + 1}
                </Badge>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
