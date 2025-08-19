'use client';

import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/auth-helpers-nextjs';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import {
  Brain,
  FileText,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Download,
  Plus,
  ArrowRight
} from 'lucide-react';

// All client-side dashboard components
function WelcomeBanner({ user }: { user: Pick<Session['user'], 'email' | 'user_metadata'> }) {
  const displayName = (user.user_metadata as any)?.name ?? user.email;
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/20">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {displayName}</h1>
          <p className="text-blue-200">Here&apos;s your dashboard overview</p>
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => window.location.href = '/assessment/onboarding'}
          className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
        >
          <FileText className="h-6 w-6 text-white mb-2" />
          <span className="text-white text-sm">New Assessment</span>
        </button>
        <button 
          onClick={() => window.location.href = '/results'}
          className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
        >
          <BarChart3 className="h-6 w-6 text-white mb-2" />
          <span className="text-white text-sm">View Reports</span>
        </button>
        <button 
          onClick={() => window.location.href = '/settings'}
          className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
        >
          <Settings className="h-6 w-6 text-white mb-2" />
          <span className="text-white text-sm">Settings</span>
        </button>
        <button 
          onClick={() => window.location.href = '/secure/workspaces'}
          className="p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
        >
          <Download className="h-6 w-6 text-white mb-2" />
          <span className="text-white text-sm">Export Data</span>
        </button>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
          <Clock className="h-5 w-5 text-blue-300" />
          <div>
            <p className="text-white text-sm">Assessment completed</p>
            <p className="text-blue-200 text-xs">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
          <Target className="h-5 w-5 text-green-300" />
          <div>
            <p className="text-white text-sm">Report generated</p>
            <p className="text-blue-200 text-xs">1 day ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
          <BookOpen className="h-5 w-5 text-purple-300" />
          <div>
            <p className="text-white text-sm">New insights available</p>
            <p className="text-blue-200 text-xs">3 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-300" />
          <div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-blue-200 text-sm">Assessments</p>
          </div>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-300" />
          <div>
            <p className="text-2xl font-bold text-white">8.4</p>
            <p className="text-blue-200 text-sm">Avg Score</p>
          </div>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-purple-300" />
          <div>
            <p className="text-2xl font-bold text-white">156</p>
            <p className="text-blue-200 text-sm">Team Members</p>
          </div>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-orange-300" />
          <div>
            <p className="text-2xl font-bold text-white">94%</p>
            <p className="text-blue-200 text-sm">Completion</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [supabase] = useState(() => createPagesBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen hero-background text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // For development, show demo dashboard instead of requiring authentication
    const demoUser = {
      email: 'demo@northpathstrategies.org',
      user_metadata: { name: 'Demo User' }
    };
    
    return (
      <main className="min-h-screen hero-background text-white px-4 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4 mb-6">
            <p className="text-orange-200 text-sm">
              ⚠️ Demo Mode - This is a preview of the dashboard interface
            </p>
          </div>
          <WelcomeBanner user={demoUser} />
          <QuickActions />
          <StatsOverview />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentActivity />
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Plus className="h-5 w-5 text-green-300" />
                  <div>
                    <p className="text-white text-sm font-medium">Start New Assessment</p>
                    <p className="text-blue-200 text-xs">Begin organizational analysis</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-300 ml-auto" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-300" />
                  <div>
                    <p className="text-white text-sm font-medium">Review Analytics</p>
                    <p className="text-blue-200 text-xs">View performance insights</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-300 ml-auto" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-300" />
                  <div>
                    <p className="text-white text-sm font-medium">Configure Settings</p>
                    <p className="text-blue-200 text-xs">Customize your experience</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-300 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated view
  return (
    <main className="min-h-screen hero-background text-white px-4 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto">
        <WelcomeBanner user={session.user} />
        <QuickActions />
        <StatsOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity />
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Plus className="h-5 w-5 text-green-300" />
                <div>
                  <p className="text-white text-sm font-medium">Start New Assessment</p>
                  <p className="text-blue-200 text-xs">Begin organizational analysis</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-300 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="text-white text-sm font-medium">Review Analytics</p>
                  <p className="text-blue-200 text-xs">View performance insights</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-300 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Settings className="h-5 w-5 text-purple-300" />
                <div>
                  <p className="text-white text-sm font-medium">Configure Settings</p>
                  <p className="text-blue-200 text-xs">Customize your experience</p>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-300 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardClient() {
  return <DashboardContent />;
}
