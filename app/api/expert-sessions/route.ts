/**
 * Expert Sessions API Route
 * Provides audience-specific expert consultation sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';

interface ExpertSession {
  id: string;
  title: string;
  description: string;
  duration: number;
  audience: 'k12' | 'highered' | 'both';
  expertName: string;
  expertTitle: string;
  expertBio: string;
  calendlyUrl: string;
  fallbackUrl?: string;
  topics: string[];
  sessionType: 'consultation' | 'workshop' | 'demo' | 'strategy';
  price: number;
  availability: 'available' | 'limited' | 'waitlist';
  rating: number;
  reviewCount: number;
  prerequisites?: string[];
}

/**
 * Sample expert sessions data
 * In a real implementation, this would come from a database
 */
const expertSessions: ExpertSession[] = [
  // K-12 Focused Sessions
  {
    id: 'k12-district-strategy',
    title: 'District-Wide AI Strategy Planning',
    description: 'Develop a comprehensive AI implementation roadmap for your district, including policy development, staff training, and student safety considerations.',
    duration: 90,
    audience: 'k12',
    expertName: 'Dr. Sarah Chen',
    expertTitle: 'Former Superintendent & AI Education Consultant',
    expertBio: '15+ years in K-12 leadership, specializing in technology integration and district transformation.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/k12-strategy',
    fallbackUrl: 'mailto:experts@aiblueprint.com?subject=K12 Strategy Session',
    topics: ['District Policy', 'Staff Training', 'Budget Planning', 'Student Safety', 'Community Engagement'],
    sessionType: 'strategy',
    price: 299,
    availability: 'available',
    rating: 4.9,
    reviewCount: 47,
    prerequisites: ['Completed AI Readiness Assessment', 'Leadership team availability for follow-up']
  },
  
  {
    id: 'k12-teacher-training',
    title: 'Teacher AI Integration Workshop',
    description: 'Design professional development programs that help teachers effectively and safely integrate AI tools into their instruction.',
    duration: 60,
    audience: 'k12',
    expertName: 'Maria Rodriguez',
    expertTitle: 'K-12 Instructional Technology Specialist',
    expertBio: 'Former classroom teacher with expertise in EdTech implementation and teacher professional development.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/k12-teacher-training',
    topics: ['Professional Development', 'Classroom Integration', 'AI Tools', 'Student Engagement', 'Assessment'],
    sessionType: 'workshop',
    price: 199,
    availability: 'limited',
    rating: 4.8,
    reviewCount: 73
  },

  {
    id: 'k12-policy-review',
    title: 'AI Policy Development Consultation',
    description: 'Review and refine your district\'s AI policies with guidance on best practices, legal compliance, and stakeholder engagement.',
    duration: 45,
    audience: 'k12',
    expertName: 'James Thompson',
    expertTitle: 'Education Policy Attorney & Former School Board Member',
    expertBio: 'Specializes in education law and policy development for technology integration in K-12 schools.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/k12-policy',
    fallbackUrl: '/contact?service=policy-consultation',
    topics: ['Policy Development', 'Legal Compliance', 'Stakeholder Engagement', 'Risk Management'],
    sessionType: 'consultation',
    price: 149,
    availability: 'available',
    rating: 4.7,
    reviewCount: 62
  },

  // Higher Education Sessions
  {
    id: 'he-institutional-strategy',
    title: 'Institutional AI Governance & Strategy',
    description: 'Develop comprehensive AI governance frameworks and strategic plans for academic and administrative AI integration.',
    duration: 90,
    audience: 'highered',
    expertName: 'Dr. Robert Kim',
    expertTitle: 'Former Provost & Higher Ed AI Consultant',
    expertBio: '20+ years in higher education administration, with deep expertise in academic technology and institutional change.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/he-strategy',
    topics: ['Governance Framework', 'Academic Integration', 'Faculty Development', 'Research Ethics', 'Accreditation'],
    sessionType: 'strategy',
    price: 399,
    availability: 'available',
    rating: 4.9,
    reviewCount: 31,
    prerequisites: ['Senior leadership participation', 'Completed institutional assessment']
  },

  {
    id: 'he-faculty-development',
    title: 'Faculty AI Development Program Design',
    description: 'Create effective faculty development programs for AI integration in teaching and research.',
    duration: 75,
    audience: 'highered',
    expertName: 'Dr. Lisa Park',
    expertTitle: 'Faculty Development Director & AI Researcher',
    expertBio: 'Former faculty development director with research focus on AI in higher education pedagogy.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/he-faculty',
    topics: ['Faculty Training', 'Pedagogical Integration', 'Research Applications', 'Grant Writing', 'Change Management'],
    sessionType: 'workshop',
    price: 249,
    availability: 'limited',
    rating: 4.8,
    reviewCount: 44
  },

  {
    id: 'he-research-ethics',
    title: 'AI Research Ethics & Compliance',
    description: 'Navigate the ethical and compliance landscape for AI use in academic research and institutional operations.',
    duration: 60,
    audience: 'highered',
    expertName: 'Dr. Michael Davis',
    expertTitle: 'Research Ethics Consultant & Former IRB Chair',
    expertBio: 'Ethics expert with extensive experience in research compliance and AI ethics frameworks.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/he-ethics',
    fallbackUrl: 'mailto:ethics@aiblueprint.com?subject=Research Ethics Consultation',
    topics: ['Research Ethics', 'IRB Considerations', 'Compliance Framework', 'Data Governance'],
    sessionType: 'consultation',
    price: 199,
    availability: 'available',
    rating: 4.9,
    reviewCount: 28
  },

  // Cross-Audience Sessions
  {
    id: 'ai-vendor-evaluation',
    title: 'AI Vendor Evaluation & Selection',
    description: 'Learn how to effectively evaluate and select AI vendors and tools for educational environments.',
    duration: 60,
    audience: 'both',
    expertName: 'Jennifer Walsh',
    expertTitle: 'EdTech Procurement Specialist',
    expertBio: 'Former CTO with expertise in educational technology procurement and vendor management.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/vendor-eval',
    topics: ['Vendor Evaluation', 'Procurement Process', 'Contract Negotiation', 'Privacy Assessment', 'Implementation Planning'],
    sessionType: 'consultation',
    price: 179,
    availability: 'available',
    rating: 4.6,
    reviewCount: 55
  },

  {
    id: 'ai-budget-planning',
    title: 'AI Implementation Budget Planning',
    description: 'Develop realistic budgets and funding strategies for AI initiatives in educational institutions.',
    duration: 45,
    audience: 'both',
    expertName: 'David Chen',
    expertTitle: 'Education Finance Consultant',
    expertBio: 'Former CFO specializing in technology budget planning and grant acquisition for educational institutions.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/budget',
    fallbackUrl: '/contact?service=budget-planning',
    topics: ['Budget Planning', 'Grant Opportunities', 'ROI Analysis', 'Cost Management', 'Funding Strategies'],
    sessionType: 'consultation',
    price: 129,
    availability: 'available',
    rating: 4.7,
    reviewCount: 39
  },

  // Free/Demo Sessions
  {
    id: 'ai-readiness-demo',
    title: 'AI Readiness Platform Demo',
    description: 'Get a personalized demonstration of the AI Blueprint platform and learn how it can support your organization.',
    duration: 30,
    audience: 'both',
    expertName: 'Platform Team',
    expertTitle: 'AI Blueprint Customer Success',
    expertBio: 'Our customer success team specializes in helping organizations maximize their AI readiness journey.',
    calendlyUrl: 'https://calendly.com/ai-blueprint/demo',
    topics: ['Platform Overview', 'Assessment Process', 'Resource Library', 'Implementation Support'],
    sessionType: 'demo',
    price: 0,
    availability: 'available',
    rating: 4.8,
    reviewCount: 156
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get audience from cookie or query parameter
    let audience = getAudienceCookie(request);
    const audienceParam = searchParams.get('audience');
    const sessionType = searchParams.get('type');
    const priceRange = searchParams.get('price');
    
    if (audienceParam && isValidAudience(audienceParam)) {
      audience = audienceParam as Audience;
    }
    
    // Default to k12 if no audience detected
    if (!audience) {
      audience = 'k12';
    }

    let filteredSessions = expertSessions;

    // Filter by audience (show both audience-specific and cross-audience sessions)
    filteredSessions = filteredSessions.filter(session => 
      session.audience === audience || session.audience === 'both'
    );

    // Filter by session type if specified
    if (sessionType) {
      filteredSessions = filteredSessions.filter(session => 
        session.sessionType === sessionType
      );
    }

    // Filter by price range if specified
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(p => parseInt(p) || 0);
      filteredSessions = filteredSessions.filter(session => 
        session.price >= minPrice && (maxPrice ? session.price <= maxPrice : true)
      );
    }

    // Sort sessions by audience relevance, then by rating
    filteredSessions.sort((a, b) => {
      // Prioritize audience-specific sessions
      if (a.audience === audience && b.audience !== audience) return -1;
      if (b.audience === audience && a.audience !== audience) return 1;
      
      // Then sort by rating
      return b.rating - a.rating;
    });

    return NextResponse.json({
      success: true,
      sessions: filteredSessions,
      total: filteredSessions.length,
      audience,
      filters: {
        sessionType,
        priceRange
      },
      meta: {
        requestedAudience: audienceParam,
        derivedAudience: audience,
        availableTypes: [...new Set(expertSessions.map(s => s.sessionType))],
        priceRanges: [
          { label: 'Free', value: '0-0' },
          { label: 'Under $200', value: '0-199' },
          { label: '$200-$300', value: '200-300' },
          { label: 'Over $300', value: '300-999' }
        ]
      }
    });

  } catch (error) {
    console.error('Expert sessions API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch expert sessions',
        sessions: []
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for booking sessions or custom requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userInfo, customRequest } = body;
    
    if (customRequest) {
      // Handle custom session requests
      return NextResponse.json({
        success: true,
        message: 'Custom session request received',
        requestId: `custom_${Date.now()}`,
        followUp: 'Our team will contact you within 24 hours to discuss your requirements.'
      });
    }
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const session = expertSessions.find(s => s.id === sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would:
    // 1. Create a booking record in the database
    // 2. Send confirmation emails
    // 3. Integrate with calendar systems
    // 4. Handle payment processing if needed
    
    return NextResponse.json({
      success: true,
      booking: {
        id: `booking_${Date.now()}`,
        sessionId,
        status: 'confirmed',
        calendlyUrl: session.calendlyUrl,
        expertName: session.expertName,
        duration: session.duration,
        price: session.price
      },
      message: 'Booking confirmed. You will receive a calendar invite shortly.',
      nextSteps: [
        'Check your email for the calendar invite',
        'Prepare any specific questions or materials',
        'Review the session prerequisites if applicable'
      ]
    });
    
  } catch (error) {
    console.error('Expert sessions booking API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process booking request' 
      },
      { status: 500 }
    );
  }
}