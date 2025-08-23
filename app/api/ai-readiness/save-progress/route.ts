import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      assessmentId, 
      responses, 
      currentIndex, 
      lastSaved, 
      tier, 
      questionCount 
    } = body;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }

    // Try to save to database (with fallback to localStorage only)
    try {
      const { data, error } = await supabase
        .from('assessment_progress')
        .upsert({
          assessment_id: assessmentId,
          responses: responses,
          current_question_index: currentIndex,
          last_saved: lastSaved,
          tier: tier,
          question_count: questionCount,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'assessment_id'
        });

      if (error) {
        console.error('Database save error:', error);
        // Return success anyway - localStorage is the primary backup
        return NextResponse.json({ 
          success: true, 
          message: 'Saved locally (database unavailable)',
          savedToDatabase: false
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Progress saved successfully',
        savedToDatabase: true
      });

    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return success - localStorage handles persistence
      return NextResponse.json({ 
        success: true, 
        message: 'Saved locally (database unavailable)',
        savedToDatabase: false
      });
    }

  } catch (error) {
    console.error('Save progress error:', error);
    return NextResponse.json({ 
      error: 'Failed to save progress',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }

    // Try to load from database
    try {
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('assessment_id', assessmentId)
        .single();

      if (error || !data) {
        return NextResponse.json({ 
          success: false, 
          message: 'No saved progress found in database' 
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          responses: data.responses,
          currentIndex: data.current_question_index,
          lastSaved: data.last_saved,
          tier: data.tier,
          questionCount: data.question_count
        }
      });

    } catch (dbError) {
      console.error('Database load error:', dbError);
      return NextResponse.json({ 
        success: false, 
        message: 'Database unavailable' 
      });
    }

  } catch (error) {
    console.error('Load progress error:', error);
    return NextResponse.json({ 
      error: 'Failed to load progress',
      success: false 
    }, { status: 500 });
  }
}
