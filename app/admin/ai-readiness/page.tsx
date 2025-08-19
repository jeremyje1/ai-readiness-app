import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import AIReadinessDashboard from '@/components/admin/AIReadinessDashboard';
import AIReadinessAnalyticsDashboard from '@/components/admin/AIReadinessAnalyticsDashboard';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">AI Readiness Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor assessments, analyze trends, and track institutional AI readiness
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Assessment Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AIReadinessDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AIReadinessAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
