/**
 * Audience-Aware Dashboard Page
 * Main dashboard with audience-specific metrics and insights
 */

import { AudienceAwareDashboard } from '@/components/dashboard/AudienceAwareDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Readiness Dashboard | AI Blueprint Platform',
  description: 'Monitor your organization\'s AI integration progress with audience-specific insights and recommendations',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AudienceAwareDashboard />
    </div>
  );
}