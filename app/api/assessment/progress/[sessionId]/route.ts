/**
 * Assessment Progress Session API Route
 * Handles deletion of assessment progress by session ID
 */

import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Delete assessment progress by session ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Delete progress record
    const { error } = await supabase
      .from('assessment_progress')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('Database error deleting assessment progress:', error);
      return NextResponse.json(
        { error: 'Failed to delete assessment progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Assessment progress delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get specific assessment progress by session ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
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
    const progress = {
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
    console.error('Assessment progress get API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}