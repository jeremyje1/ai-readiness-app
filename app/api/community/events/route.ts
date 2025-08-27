/**
 * Community Events API Route
 * Provides community events and activities
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  type: 'webinar' | 'discussion' | 'workshop' | 'networking';
  audience: 'k12' | 'highered' | 'both';
  host: string;
  registrationUrl?: string;
  maxParticipants?: number;
  currentParticipants: number;
}

/**
 * Generate upcoming community events
 * In a real implementation, this would come from a database or calendar system
 */
function generateCommunityEvents(): CommunityEvent[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    // K-12 Events
    {
      id: 'k12-policy-workshop',
      title: 'AI Policy Development Workshop for Districts',
      description: 'Interactive workshop on creating comprehensive AI policies for K-12 districts, including student use guidelines and staff training requirements.',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      duration: 90,
      type: 'workshop',
      audience: 'k12',
      host: 'Dr. Sarah Chen, Former Superintendent',
      registrationUrl: 'https://events.aiblueprint.com/k12-policy-workshop',
      maxParticipants: 50,
      currentParticipants: 34
    },
    {
      id: 'k12-superintendent-roundtable',
      title: 'Monthly Superintendent Roundtable',
      description: 'Exclusive discussion for superintendents sharing AI implementation experiences and challenges.',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      type: 'discussion',
      audience: 'k12',
      host: 'AI Blueprint Community Team',
      registrationUrl: 'https://events.aiblueprint.com/superintendent-roundtable',
      maxParticipants: 25,
      currentParticipants: 18
    },
    {
      id: 'k12-teacher-training-webinar',
      title: 'Teacher AI Integration: Best Practices Webinar',
      description: 'Learn effective strategies for supporting teachers in AI tool integration and professional development.',
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      type: 'webinar',
      audience: 'k12',
      host: 'Maria Rodriguez, Instructional Technology Specialist',
      registrationUrl: 'https://events.aiblueprint.com/teacher-ai-training',
      currentParticipants: 127
    },

    // Higher Ed Events
    {
      id: 'he-faculty-development',
      title: 'Faculty AI Development: Institutional Strategies',
      description: 'Design effective faculty development programs for AI integration in higher education teaching and research.',
      date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 75,
      type: 'workshop',
      audience: 'highered',
      host: 'Dr. Lisa Park, Faculty Development Director',
      registrationUrl: 'https://events.aiblueprint.com/he-faculty-dev',
      maxParticipants: 40,
      currentParticipants: 29
    },
    {
      id: 'he-research-ethics',
      title: 'AI Research Ethics Forum',
      description: 'Navigate ethical considerations and compliance requirements for AI use in academic research.',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      type: 'discussion',
      audience: 'highered',
      host: 'Dr. Michael Davis, Research Ethics Consultant',
      registrationUrl: 'https://events.aiblueprint.com/research-ethics',
      currentParticipants: 67
    },
    {
      id: 'he-provost-networking',
      title: 'Provost AI Leadership Network',
      description: 'Networking and strategy sharing among academic leaders implementing AI initiatives.',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 90,
      type: 'networking',
      audience: 'highered',
      host: 'Dr. Robert Kim, Former Provost',
      registrationUrl: 'https://events.aiblueprint.com/provost-network',
      maxParticipants: 30,
      currentParticipants: 22
    },

    // Cross-Audience Events
    {
      id: 'ai-policy-updates',
      title: 'Monthly AI Policy & Regulation Updates',
      description: 'Stay informed about the latest AI policy developments, regulatory changes, and industry frameworks.',
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      type: 'webinar',
      audience: 'both',
      host: 'AI Blueprint Policy Team',
      registrationUrl: 'https://events.aiblueprint.com/policy-updates',
      currentParticipants: 284
    },
    {
      id: 'vendor-showcase',
      title: 'AI Vendor Showcase & Community Reviews',
      description: 'Vendor presentations followed by community Q&A and honest reviews from real users.',
      date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      type: 'workshop',
      audience: 'both',
      host: 'Community Vendor Review Team',
      registrationUrl: 'https://events.aiblueprint.com/vendor-showcase',
      maxParticipants: 100,
      currentParticipants: 76
    },
    {
      id: 'success-stories-celebration',
      title: 'AI Implementation Success Stories',
      description: 'Celebrate community wins and learn from successful AI implementation case studies.',
      date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      type: 'discussion',
      audience: 'both',
      host: 'AI Blueprint Community',
      registrationUrl: 'https://events.aiblueprint.com/success-stories',
      currentParticipants: 156
    }
  ].filter(event => new Date(event.date) > now) // Only future events
   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get audience from cookie or query parameter
    let audience = getAudienceCookie(request);
    const audienceParam = searchParams.get('audience');
    const eventType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (audienceParam && isValidAudience(audienceParam)) {
      audience = audienceParam as Audience;
    }
    
    // Default to k12 if no audience detected
    if (!audience) {
      audience = 'k12';
    }

    let events = generateCommunityEvents();

    // Filter by audience (show both audience-specific and cross-audience events)
    events = events.filter(event => 
      event.audience === audience || event.audience === 'both'
    );

    // Filter by event type if specified
    if (eventType) {
      events = events.filter(event => event.type === eventType);
    }

    // Limit results
    events = events.slice(0, limit);

    return NextResponse.json({
      success: true,
      events,
      total: events.length,
      audience,
      filters: {
        eventType,
        limit
      },
      meta: {
        requestedAudience: audienceParam,
        derivedAudience: audience,
        availableTypes: ['webinar', 'workshop', 'discussion', 'networking'],
        nextEvent: events.length > 0 ? events[0] : null
      }
    });

  } catch (error) {
    console.error('Community events API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch community events',
        events: []
      },
      { status: 500 }
    );
  }
}