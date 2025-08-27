/**
 * Community Stats API Route
 * Provides community statistics and channel information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';

interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  dailyMessages: number;
  weeklyEvents: number;
  audienceBreakdown: {
    k12: number;
    highered: number;
  };
  topChannels: Array<{
    name: string;
    description: string;
    memberCount: number;
    audience: 'k12' | 'highered' | 'both';
  }>;
}

/**
 * Generate mock community stats
 * In a real implementation, this would come from Slack API or database
 */
function generateCommunityStats(audience: Audience): CommunityStats {
  const baseStats = {
    totalMembers: 2847,
    activeMembers: 456,
    dailyMessages: 127,
    weeklyEvents: 4,
    audienceBreakdown: {
      k12: 1620,
      highered: 1227
    }
  };

  const allChannels = [
    // K-12 Channels
    {
      name: 'k12-general',
      description: 'General discussion for K-12 district leaders and administrators',
      memberCount: 892,
      audience: 'k12' as const
    },
    {
      name: 'k12-policy-development',
      description: 'Collaborative space for developing district AI policies and guidelines',
      memberCount: 567,
      audience: 'k12' as const
    },
    {
      name: 'teacher-ai-integration',
      description: 'Teachers sharing AI integration strategies and classroom experiences',
      memberCount: 743,
      audience: 'k12' as const
    },
    {
      name: 'k12-student-safety',
      description: 'Discussion on student safety, digital citizenship, and responsible AI use',
      memberCount: 634,
      audience: 'k12' as const
    },
    {
      name: 'superintendent-roundtable',
      description: 'Private channel for superintendents and district leaders',
      memberCount: 128,
      audience: 'k12' as const
    },
    
    // Higher Ed Channels
    {
      name: 'highered-general',
      description: 'General discussion for higher education leaders and faculty',
      memberCount: 675,
      audience: 'highered' as const
    },
    {
      name: 'faculty-ai-pedagogy',
      description: 'Faculty discussing AI integration in teaching and learning',
      memberCount: 489,
      audience: 'highered' as const
    },
    {
      name: 'research-ai-ethics',
      description: 'Academic research ethics and AI compliance discussion',
      memberCount: 312,
      audience: 'highered' as const
    },
    {
      name: 'provost-cabinet',
      description: 'Private channel for provosts and academic leadership',
      memberCount: 87,
      audience: 'highered' as const
    },
    {
      name: 'institutional-strategy',
      description: 'Strategic planning for AI integration at the institutional level',
      memberCount: 234,
      audience: 'highered' as const
    },
    
    // Cross-Audience Channels
    {
      name: 'ai-policy-updates',
      description: 'Latest updates on AI regulations, frameworks, and industry news',
      memberCount: 1456,
      audience: 'both' as const
    },
    {
      name: 'vendor-reviews',
      description: 'Community reviews and discussions about AI tools and vendors',
      memberCount: 823,
      audience: 'both' as const
    },
    {
      name: 'success-stories',
      description: 'Share your AI implementation wins and celebrate achievements',
      memberCount: 691,
      audience: 'both' as const
    },
    {
      name: 'ask-the-experts',
      description: 'Q&A with AI education experts and industry thought leaders',
      memberCount: 1203,
      audience: 'both' as const
    },
    {
      name: 'events-announcements',
      description: 'Community events, webinars, and workshop announcements',
      memberCount: 2104,
      audience: 'both' as const
    }
  ];

  // Filter and sort channels by relevance to audience
  const relevantChannels = allChannels
    .filter(channel => channel.audience === audience || channel.audience === 'both')
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 8); // Top 8 channels

  return {
    ...baseStats,
    topChannels: relevantChannels
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get audience from cookie or query parameter
    let audience = getAudienceCookie(request);
    const audienceParam = searchParams.get('audience');
    
    if (audienceParam && isValidAudience(audienceParam)) {
      audience = audienceParam as Audience;
    }
    
    // Default to k12 if no audience detected
    if (!audience) {
      audience = 'k12';
    }

    const stats = generateCommunityStats(audience);

    return NextResponse.json({
      success: true,
      stats,
      audience,
      meta: {
        requestedAudience: audienceParam,
        derivedAudience: audience,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Community stats API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch community stats',
        stats: null
      },
      { status: 500 }
    );
  }
}