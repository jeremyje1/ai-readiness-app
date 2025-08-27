/**
 * Assessment Progress Save API Route
 * Handles saving and retrieving assessment progress for autosave functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AssessmentProgress } from '@/lib/assessment/autosave';
import { isValidAudience } from '@/lib/audience/deriveAudience';

interface SaveAssessmentRequest {
  assessmentId: string;
  audience: string;
  userId?: string;
  sessionId: string;
  currentSection: string;
  currentQuestion: string;
  responses: Record<string, any>;
  completedSections: string[];
  startedAt: string;
  lastSavedAt: string;
  progressPercent: number;
  isComplete: boolean;
  metadata: {
    userAgent?: string;
    referrer?: string;
    source?: string;
  };
}

/**
 * Save assessment progress
 */
export async function PUT(request: NextRequest) {
  try {
    const body: SaveAssessmentRequest = await request.json();
    
    // Validate required fields
    if (!body.sessionId || !body.assessmentId || !body.audience) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, assessmentId, audience' },
        { status: 400 }
      );
    }

    // Validate audience
    if (!isValidAudience(body.audience)) {
      return NextResponse.json(
        { error: 'Invalid audience' },
        { status: 400 }
      );
    }

    // Prepare data for database
    const progressData = {
      session_id: body.sessionId,
      assessment_id: body.assessmentId,
      audience: body.audience,
      user_id: body.userId,
      current_section: body.currentSection,
      current_question: body.currentQuestion,
      responses: body.responses,
      completed_sections: body.completedSections,
      started_at: body.startedAt,
      last_saved_at: body.lastSavedAt,
      progress_percent: body.progressPercent,
      is_complete: body.isComplete,
      metadata: body.metadata,
      updated_at: new Date().toISOString()
    };

    // Upsert progress record
    const { data, error } = await supabase
      .from('assessment_progress')
      .upsert(progressData, {
        onConflict: 'session_id'
      })
      .select();

    if (error) {
      console.error('Database error saving assessment progress:', error);
      return NextResponse.json(
        { error: 'Failed to save assessment progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: body.sessionId,
      progressPercent: body.progressPercent,
      savedAt: body.lastSavedAt,
      data: data?.[0]
    });

  } catch (error) {
    console.error('Assessment save API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Load assessment progress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('assessment_progress')
      .select('*')
      .eq('session_id', sessionId);
    
    // Add user filter if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No matching row found
        return NextResponse.json(
          { error: 'Assessment progress not found' },
          { status: 404 }
        );
      }
      
      console.error('Database error loading assessment progress:', error);
      return NextResponse.json(
        { error: 'Failed to load assessment progress' },
        { status: 500 }
      );
    }

    // Transform database response to AssessmentProgress format
    const progress: AssessmentProgress = {
      assessmentId: data.assessment_id,
      audience: data.audience,
      userId: data.user_id,
      sessionId: data.session_id,
      currentSection: data.current_section,
      currentQuestion: data.current_question,
      responses: data.responses || {},
      completedSections: data.completed_sections || [],
      startedAt: data.started_at,
      lastSavedAt: data.last_saved_at,
      progressPercent: data.progress_percent || 0,
      isComplete: data.is_complete || false,
      metadata: data.metadata || {}
    };

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Assessment load API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}