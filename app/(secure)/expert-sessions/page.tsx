/**
 * Expert Sessions Page
 * Book audience-specific expert consultations
 */

import React from 'react';
import { Metadata } from 'next';
import { ExpertSessions } from '@/components/expert-sessions/ExpertSessions';

export const metadata: Metadata = {
  title: 'Expert Sessions | AI Blueprint Platform',
  description: 'Connect with AI education experts for personalized consultations, workshops, and strategic planning sessions tailored to your organization.',
  keywords: ['AI experts', 'education consultants', 'AI strategy', 'professional development']
};

export default function ExpertSessionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ExpertSessions />
    </div>
  );
}