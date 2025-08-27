/**
 * Community Hub Page
 * Join and participate in the AI education community
 */

import React from 'react';
import { Metadata } from 'next';
import { CommunityHub } from '@/components/community/CommunityHub';

export const metadata: Metadata = {
  title: 'AI Education Community | AI Blueprint Platform',
  description: 'Join thousands of educators in our Slack community. Connect with peers, share resources, and get expert guidance on AI integration.',
  keywords: ['AI education community', 'educator network', 'Slack community', 'peer learning']
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CommunityHub />
    </div>
  );
}