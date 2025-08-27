/**
 * Audience-Aware Dashboard Metrics API
 * Provides dashboard data tailored to K-12 vs Higher Ed audiences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  assessmentScore: {
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    level: 'emerging' | 'developing' | 'proficient' | 'advanced';
  };
  completionRate: {
    percentage: number;
    completed: number;
    total: number;
  };
  audienceSpecificMetrics: {
    k12?: {
      districtsServed: number;
      studentsImpacted: number;
      staffTrained: number;
      policyImplementation: number;
    };
    highered?: {
      institutionsServed: number;
      facultyEngaged: number;
      programsLaunched: number;
      researchProjects: number;
    };
  };
  recentActivity: Array<{
    id: string;
    type: 'assessment' | 'resource' | 'training' | 'policy';
    title: string;
    timestamp: string;
    status: 'completed' | 'in_progress' | 'upcoming';
  }>;
  recommendations: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    resourceId?: string;
  }>;
  benchmarking: {
    percentile: number;
    peerComparison: 'above' | 'below' | 'average';
    sampleSize: number;
  };
}

/**
 * Get assessment score level based on numeric score
 */
function getScoreLevel(score: number): 'emerging' | 'developing' | 'proficient' | 'advanced' {
  if (score >= 86) return 'advanced';
  if (score >= 66) return 'proficient';
  if (score >= 41) return 'developing';
  return 'emerging';
}

/**
 * Calculate trend based on current vs previous scores
 */
function calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  if (Math.abs(diff) < 2) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

/**
 * Get audience-specific recommendations
 */
function getAudienceRecommendations(audience: Audience, score: number): DashboardMetrics['recommendations'] {
  if (audience === 'k12') {
    const recommendations = [
      {
        id: 'k12_policy_dev',
        priority: 'high' as const,
        category: 'Policy Development',
        title: 'Develop District AI Policy',
        description: 'Create comprehensive AI usage guidelines for students and staff',
        resourceId: 'k12-district-policy-pack'
      },
      {
        id: 'k12_pd',
        priority: 'medium' as const,
        category: 'Professional Development',
        title: 'Teacher AI Training Program',
        description: 'Launch professional development sessions on AI integration',
        resourceId: 'k12-classroom-integration-guide'
      },
      {
        id: 'k12_parent_comm',
        priority: 'medium' as const,
        category: 'Community Engagement',
        title: 'Parent Communication Plan',
        description: 'Inform families about district AI initiatives and policies',
        resourceId: 'k12-parent-communication-templates'
      },
      {
        id: 'k12_digital_citizenship',
        priority: 'high' as const,
        category: 'Student Development',
        title: 'AI Digital Citizenship Curriculum',
        description: 'Teach students responsible AI use and digital ethics',
        resourceId: 'k12-digital-citizenship-curriculum'
      }
    ];

    // Prioritize based on score level
    if (score < 50) {
      return recommendations.filter(r => r.priority === 'high').slice(0, 3);
    }
    return recommendations.slice(0, 4);
  } else {
    const recommendations = [
      {
        id: 'he_strategy',
        priority: 'high' as const,
        category: 'Strategic Planning',
        title: 'Institutional AI Strategy',
        description: 'Develop comprehensive AI integration strategy for academics and operations',
        resourceId: 'he-ai-ethics-policy'
      },
      {
        id: 'he_faculty_dev',
        priority: 'high' as const,
        category: 'Faculty Development',
        title: 'Faculty AI Integration Training',
        description: 'Support faculty in incorporating AI tools into teaching and research',
        resourceId: 'he-faculty-ai-curriculum'
      },
      {
        id: 'he_research',
        priority: 'medium' as const,
        category: 'Research & Innovation',
        title: 'AI Research Guidelines',
        description: 'Establish ethical guidelines for AI use in research activities',
        resourceId: 'he-research-ai-guidelines'
      },
      {
        id: 'he_accreditation',
        priority: 'medium' as const,
        category: 'Compliance',
        title: 'Accreditation Preparation',
        description: 'Address AI considerations in accreditation self-studies',
        resourceId: 'he-accreditation-checklist'
      }
    ];

    // Prioritize based on score level
    if (score < 50) {
      return recommendations.filter(r => r.priority === 'high').slice(0, 3);
    }
    return recommendations.slice(0, 4);
  }
}

/**
 * Generate recent activity based on audience
 */
function generateRecentActivity(audience: Audience): DashboardMetrics['recentActivity'] {
  const baseActivities = [
    {
      id: '1',
      type: 'assessment' as const,
      title: 'AI Readiness Assessment Completed',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      status: 'completed' as const
    },
    {
      id: '2',
      type: 'resource' as const,
      title: 'Downloaded Policy Template',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      status: 'completed' as const
    },
    {
      id: '3',
      type: 'training' as const,
      title: audience === 'k12' ? 'Staff Training Session Scheduled' : 'Faculty Workshop Planned',
      timestamp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      status: 'upcoming' as const
    }
  ];

  return baseActivities;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get audience from cookie or query parameter
    let audience = getAudienceCookie(request);
    const audienceParam = searchParams.get('audience');
    const userId = searchParams.get('userId');
    
    if (audienceParam && isValidAudience(audienceParam)) {
      audience = audienceParam as Audience;
    }
    
    // Default to k12 if no audience detected
    if (!audience) {
      audience = 'k12';
    }

    // Mock assessment data - in real implementation, fetch from database
    let assessmentScore: DashboardMetrics['assessmentScore'] = {
      current: 72,
      previous: 68,
      trend: 'up',
      level: 'proficient'
    };

    // Try to get actual assessment data if user ID provided
    if (userId) {
      try {
        const { data: assessments } = await supabase
          .from('ai_readiness_assessments')
          .select('final_score, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(2);

        if (assessments && assessments.length > 0) {
          const current = assessments[0].final_score || 0;
          const previous = assessments.length > 1 ? assessments[1].final_score || 0 : current;
          
          assessmentScore = {
            current,
            previous,
            trend: calculateTrend(current, previous),
            level: getScoreLevel(current)
          };
        }
      } catch (error) {
        console.warn('Could not fetch assessment data:', error);
      }
    }

    // Calculate completion rate based on assessment progress
    const completionRate = {
      percentage: Math.min(100, Math.round((assessmentScore.current / 100) * 100)),
      completed: Math.round(assessmentScore.current / 20), // Assuming 5 sections
      total: 5
    };

    // Generate audience-specific metrics
    const audienceSpecificMetrics: DashboardMetrics['audienceSpecificMetrics'] = {};
    
    if (audience === 'k12') {
      audienceSpecificMetrics.k12 = {
        districtsServed: Math.floor(Math.random() * 50) + 10,
        studentsImpacted: Math.floor(Math.random() * 10000) + 5000,
        staffTrained: Math.floor(Math.random() * 200) + 50,
        policyImplementation: Math.floor(assessmentScore.current * 0.8)
      };
    } else {
      audienceSpecificMetrics.highered = {
        institutionsServed: Math.floor(Math.random() * 20) + 5,
        facultyEngaged: Math.floor(Math.random() * 500) + 100,
        programsLaunched: Math.floor(Math.random() * 10) + 2,
        researchProjects: Math.floor(Math.random() * 15) + 3
      };
    }

    // Generate benchmarking data
    const benchmarking = {
      percentile: Math.min(95, Math.max(5, assessmentScore.current + Math.floor(Math.random() * 20) - 10)),
      peerComparison: (assessmentScore.current > 70 ? 'above' : assessmentScore.current < 50 ? 'below' : 'average') as 'above' | 'below' | 'average',
      sampleSize: audience === 'k12' ? 1247 : 892
    };

    const metrics: DashboardMetrics = {
      assessmentScore,
      completionRate,
      audienceSpecificMetrics,
      recentActivity: generateRecentActivity(audience),
      recommendations: getAudienceRecommendations(audience, assessmentScore.current),
      benchmarking
    };

    // Track API call for analytics
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Log metrics request for analytics
      console.log('Dashboard metrics requested:', {
        audience,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      metrics,
      lastUpdated: new Date().toISOString(),
      audience,
      meta: {
        userId,
        requestedAudience: audienceParam,
        derivedAudience: audience
      }
    });

  } catch (error) {
    console.error('Dashboard metrics API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for custom metric queries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audience, dateRange, filters, userId } = body;
    
    if (!audience || !isValidAudience(audience)) {
      return NextResponse.json(
        { success: false, error: 'Valid audience is required' },
        { status: 400 }
      );
    }

    // This would implement custom metric queries based on filters
    // For now, return the same as GET but acknowledge the custom filters
    
    const response = await fetch(`${request.url}?audience=${audience}&userId=${userId || ''}`, {
      method: 'GET',
      headers: request.headers
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      ...data,
      customFilters: filters,
      dateRange,
      appliedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Custom dashboard metrics API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process custom metrics query' 
      },
      { status: 500 }
    );
  }
}