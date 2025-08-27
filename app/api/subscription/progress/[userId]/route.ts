import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Decode the userId parameter in case it's URL encoded
    const userIdentifier = decodeURIComponent(params.userId);
    console.log('🔄 Looking up progress for:', userIdentifier);
    
    // Determine if userIdentifier is an email or UUID
    const isEmail = userIdentifier.includes('@');
    console.log('📧 Is email lookup:', isEmail);
    
    // Get user's subscription start date and assessments
    let userData, userError;
    
    if (isEmail) {
      // Look up by email - first get user ID from auth.users or use email directly in query
      const { data, error } = await supabase
        .from('ai_readiness_assessments')
        .select('*')
        .eq('email', userIdentifier)
        .order('created_at', { ascending: false });
      userData = data;
      userError = error;
    } else {
      // Look up by user ID
      const { data, error } = await supabase
        .from('ai_readiness_assessments')
        .select('*')
        .eq('user_id', userIdentifier)
        .order('created_at', { ascending: false });
      userData = data;
      userError = error;
    }

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ 
        error: 'Failed to fetch user data', 
        details: userError.message 
      }, { status: 500 });
    }

    console.log('📊 Found assessments:', userData?.length || 0);
    
    if (!userData || userData.length === 0) {
      console.log('❌ No assessments found for user:', userIdentifier);
      return NextResponse.json({ 
        error: 'No assessments found', 
        userIdentifier,
        isEmail 
      }, { status: 404 });
    }

    const latestAssessment = userData[0];
    const subscriptionStart = new Date(latestAssessment.created_at);
    const now = new Date();
    const daysActive = Math.floor((now.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate reassessment due date (90 days from last assessment)
    const reassessmentDue = new Date(subscriptionStart);
    reassessmentDue.setDate(reassessmentDue.getDate() + 90);

    // Mock implementation progress calculation
    // In production, this would track actual implementation tasks completed
    const implementationProgress = Math.min(100, Math.floor(daysActive * 1.2 + Math.random() * 10));

    // Get expert sessions data (mock for now)
    const expertSessionsUsed = Math.floor(daysActive / 30); // 1 per month
    const expertSessionsTotal = Math.ceil(daysActive / 30) || 1;

    // Mock community engagement
    const communityPosts = Math.floor(Math.random() * 5);
    const templatesDownloaded = Math.floor(daysActive / 7) + Math.floor(Math.random() * 3);

    // Determine next milestone
    const nextMilestone = implementationProgress < 25 
      ? "Complete stakeholder alignment workshop"
      : implementationProgress < 50
      ? "Deploy pilot AI tools in one department"
      : implementationProgress < 75
      ? "Conduct staff training and change management"
      : "Measure ROI and scale successful initiatives";

    const progressData = {
      implementationProgress,
      daysActive,
      nextMilestone,
      reassessmentDue: reassessmentDue.toISOString(),
      expertSessionsUsed,
      expertSessionsTotal,
      communityPosts,
      templatesDownloaded,
      subscriptionValue: {
        assessmentsCompleted: userData.length,
        lastAssessmentDate: latestAssessment.created_at,
        progressSinceStart: implementationProgress,
        daysUntilReassessment: Math.max(0, Math.ceil((reassessmentDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      }
    };

    console.log('✅ Progress data calculated successfully for:', userIdentifier);
    return NextResponse.json(progressData);

  } catch (error) {
    console.error('Error calculating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint to update progress manually
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { action, value } = body;

    // Update specific progress metrics
    switch (action) {
      case 'complete_milestone':
        // In production, track milestone completion
        return NextResponse.json({ success: true, message: 'Milestone completed' });
      
      case 'schedule_expert_session':
        // In production, integrate with calendar API
        return NextResponse.json({ success: true, message: 'Expert session scheduled' });
      
      case 'download_template':
        // In production, track template downloads
        return NextResponse.json({ success: true, message: 'Template download tracked' });
      
      case 'community_interaction':
        // In production, track community engagement
        return NextResponse.json({ success: true, message: 'Community interaction tracked' });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
