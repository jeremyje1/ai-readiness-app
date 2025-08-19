'use client';

import React, { Suspense } from 'react';
import PowerBIEmbed from '@/components/PowerBIEmbed';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { PageHero } from '@/components/PageHero';

// Prevent static generation
export const dynamic = 'force-dynamic';

function DashboardContent() {
  const session = useSession();
  
  // Handle loading state and undefined session
  if (!session || session.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (session.status === 'unauthenticated' || !session.data) {
    redirect('/auth');
  }

  // Check if user has enterprise tier access (this would be handled by middleware in production)
  const userTier = (session.data as any)?.tier || 'INDIVIDUAL';
  if (userTier !== 'ENTERPRISE') {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHero 
          title="Access Denied"
          subtitle="Enterprise Dashboard requires Enterprise tier access"
        />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enterprise Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need Enterprise tier access to view this dashboard. 
              Please contact your administrator or upgrade your subscription.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
              <a 
                href="/upgrade"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to Enterprise
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero 
        title="Enterprise Dashboard"
        subtitle="Comprehensive organizational analytics and insights"
      />
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Power BI Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Real-time organizational metrics and performance indicators
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Export Data
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Power BI Dashboard */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Organizational Performance Dashboard
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Interactive Power BI reports and analytics
            </p>
          </div>
          
          <div className="p-6">
            <PowerBIEmbed
              embedUrl={`https://app.powerbi.com/reportEmbed?reportId=${process.env.NEXT_PUBLIC_POWERBI_REPORT_ID || 'sample-report-id'}&groupId=${process.env.NEXT_PUBLIC_POWERBI_WORKSPACE_ID || 'sample-workspace-id'}`}
              reportId={process.env.NEXT_PUBLIC_POWERBI_REPORT_ID || 'sample-report-id'}
              groupId={process.env.NEXT_PUBLIC_POWERBI_WORKSPACE_ID}
              height="800px"
              width="100%"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Reports</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className="text-2xl font-semibold text-gray-900">8.4/10</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-semibold text-gray-900">156</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnterpriseDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
