'use client';

import React, { useState, useEffect } from 'react';
import { AdminAuth } from '@/components/AdminAuth';
import Link from 'next/link';

interface DashboardStats {
  totalAssessments: number;
  completedAssessments: number;
  activeUsers: number;
  revenue: number;
  conversionRate: number;
  avgCompletionTime: number;
  topTier: string;
  growthRate: number;
}

interface RecentActivity {
  id: string;
  type: 'assessment_completed' | 'user_registered' | 'payment_processed';
  description: string;
  timestamp: string;
  value?: number;
  tier?: string;
}

interface TierPerformance {
  tier: string;
  type: 'organizational' | 'ai-readiness';
  completions: number;
  revenue: number;
  avgScore: number;
  conversionRate: number;
}

function BusinessDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    completedAssessments: 0,
    activeUsers: 0,
    revenue: 0,
    conversionRate: 0,
    avgCompletionTime: 0,
    topTier: '',
    growthRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [tierPerformance, setTierPerformance] = useState<TierPerformance[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes, performanceRes] = await Promise.all([
        fetch(`/api/admin/dashboard/stats?timeframe=${timeframe}`, {
          headers: { 'Authorization': 'Bearer admin-token stardynamics1124*' }
        }),
        fetch(`/api/admin/dashboard/activity?limit=20`, {
          headers: { 'Authorization': 'Bearer admin-token stardynamics1124*' }
        }),
        fetch(`/api/admin/dashboard/tier-performance?timeframe=${timeframe}`, {
          headers: { 'Authorization': 'Bearer admin-token stardynamics1124*' }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.activities || []);
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setTierPerformance(performanceData.tiers || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Mock data for development
      setStats({
        totalAssessments: 347,
        completedAssessments: 285,
        activeUsers: 198,
        revenue: 1756209, // Higher revenue reflecting AI Blueprint pricing
        conversionRate: 82.1,
        avgCompletionTime: 38,
        topTier: 'AI Transformation Blueprint™',
        growthRate: 34.7
      });

      setRecentActivity([
        {
          id: '1',
          type: 'assessment_completed',
          description: 'AI Transformation Blueprint™ completed by University of California',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          tier: 'ai-transformation-blueprint'
        },
        {
          id: '2',
          type: 'payment_processed',
          description: 'Payment processed for AI Readiness Comprehensive',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          value: 4995
        },
        {
          id: '3',
          type: 'user_registered',
          description: 'New user registered: MIT Administration',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: '4',
          type: 'assessment_completed',
          description: 'Higher Ed AI Pulse Check completed by Stanford University',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          tier: 'higher-ed-ai-pulse-check'
        },
        {
          id: '5',
          type: 'payment_processed',
          description: 'Enterprise Partnership consultation booked',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          value: 24500
        },
        {
          id: '6',
          type: 'assessment_completed',
          description: 'AI Readiness Comprehensive completed by Harvard University',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          tier: 'ai-readiness-comprehensive'
        }
      ]);

      setTierPerformance([
        {
          tier: 'AI Transformation Blueprint™',
          type: 'ai-readiness',
          completions: 45,
          revenue: 1102500, // $24,500 × 45
          avgScore: 82.3,
          conversionRate: 91.2
        },
        {
          tier: 'AI Readiness Comprehensive',
          type: 'ai-readiness',
          completions: 78,
          revenue: 389610, // $4,995 × 78
          avgScore: 75.8,
          conversionRate: 85.4
        },
        {
          tier: 'Higher Ed AI Pulse Check',
          type: 'ai-readiness',
          completions: 124,
          revenue: 248000, // $2,000 × 124
          avgScore: 68.2,
          conversionRate: 78.9
        },
        {
          tier: 'Comprehensive Package',
          type: 'organizational',
          completions: 38,
          revenue: 9466,
          avgScore: 68.7,
          conversionRate: 75.4
        },
        {
          tier: 'Monthly Subscription',
          type: 'organizational',
          completions: 67,
          revenue: 6633,
          avgScore: 65.1,
          conversionRate: 72.1
        }
      ]);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment_completed':
        return '✅';
      case 'payment_processed':
        return '💳';
      case 'user_registered':
        return '👤';
      default:
        return '📊';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
          <p className="text-gray-600">Complete overview of your assessment business performance</p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Link
            href="/admin/testing/unified"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Test Assessments
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">💰</span>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-1">+{formatPercentage(stats.growthRate)} from last period</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assessments Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAssessments}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📊</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">of {stats.totalAssessments} total started</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.conversionRate)}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600">🎯</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Avg completion time: {stats.avgCompletionTime}min</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600">👥</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Top tier: {stats.topTier}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                      {activity.value && (
                        <span className="text-xs font-medium text-green-600">
                          {formatCurrency(activity.value)}
                        </span>
                      )}
                      {activity.tier && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                          {activity.tier}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tier Performance */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tier Performance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {tierPerformance.map(tier => (
                <div key={`${tier.tier}-${tier.type}`} className="border-l-4 border-indigo-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{tier.tier}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tier.type === 'organizational' 
                        ? 'text-blue-700 bg-blue-100'
                        : 'text-green-700 bg-green-100'
                    }`}>
                      {tier.type === 'organizational' ? 'ORG' : 'AI'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Completions:</span>
                      <span className="ml-2 font-medium">{tier.completions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-2 font-medium">{formatCurrency(tier.revenue)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Score:</span>
                      <span className="ml-2 font-medium">{tier.avgScore.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversion:</span>
                      <span className="ml-2 font-medium">{formatPercentage(tier.conversionRate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/assessments"
          className="bg-indigo-600 text-white p-4 rounded-lg text-center hover:bg-indigo-700 transition-colors"
        >
          <h3 className="font-semibold mb-1">View All Assessments</h3>
          <p className="text-sm opacity-90">Browse and manage assessment results</p>
        </Link>
        <Link
          href="/admin/users"
          className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
        >
          <h3 className="font-semibold mb-1">User Management</h3>
          <p className="text-sm opacity-90">Manage users and permissions</p>
        </Link>
        <Link
          href="/admin/analytics"
          className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
        >
          <h3 className="font-semibold mb-1">Advanced Analytics</h3>
          <p className="text-sm opacity-90">Deep dive into performance metrics</p>
        </Link>
        <Link
          href="/admin/settings"
          className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700 transition-colors"
        >
          <h3 className="font-semibold mb-1">System Settings</h3>
          <p className="text-sm opacity-90">Configure system and security</p>
        </Link>
      </div>
    </div>
  );
}

export default function EnhancedBusinessDashboard() {
  return (
    <AdminAuth>
      <BusinessDashboard />
    </AdminAuth>
  );
}
