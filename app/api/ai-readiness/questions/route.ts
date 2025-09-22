/**
 * AI Readiness Questions API Endpoint
 * Serves tier-appropriate questions with proper question counts
 */

import { getQuestionsForTier } from '@/lib/ai-readiness-questions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const tier = searchParams.get('tier') || 'higher-ed-ai-pulse-check';
    const section = searchParams.get('section');
    
    // Map mode to appropriate tier/question set
    let questionSet = tier;
    if (mode === 'quick') {
      questionSet = 'higher-ed-ai-pulse-check'; // 50 questions for quick assessment
    } else if (mode === 'full' || mode === 'comprehensive') {
      questionSet = 'ai-readiness-comprehensive'; // Full 105 questions
    }

    // Detect institution type from headers (set by middleware) or domain
    const institutionType = request.headers.get('x-institution-type') || 'default';
    const domainContext = request.headers.get('x-domain-context') || 'default';

    console.log(`🎯 Questions API - Institution Type: ${institutionType}, Domain: ${domainContext}, Tier: ${tier}`);

    // Get tier-appropriate questions
    let questions = getQuestionsForTier(questionSet);

    // Filter by section if specified
    if (section) {
      questions = questions.filter(q => q.section === section);
    }

    // Convert to expected format for frontend - matching what the assessment page expects
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.prompt, // Changed from 'text' to 'question' to match frontend
      section: q.section,
      type: q.type === 'likert' ? 'scale_with_context' : 
            q.type === 'text' ? 'open_ended' : q.type,
      required: q.required,
      helpText: q.helpText,
      scaleLabels: q.type === 'likert' ? {
        low: 'Strongly Disagree',
        high: 'Strongly Agree'
      } : undefined
    }));

    // Calculate estimated time based on question count
    const estimatedMinutes = Math.ceil(formattedQuestions.length * 1.5); // 1.5 minutes per question

    // Build response - simplified to match what frontend expects
    const response = {
      success: true,
      questions: formattedQuestions, // Direct questions array
      tier: questionSet,
      institutionType,
      metadata: {
        total: formattedQuestions.length,
        sections: [...new Set(formattedQuestions.map(q => q.section))],
        estimatedTime: `${estimatedMinutes} minutes`,
        mode: mode || 'full'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Questions API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load questions',
        data: {
          questions: []
        },
        metadata: {
          total: 0,
          sections: [],
          estimatedTime: '0 minutes'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier = 'higher-ed-ai-pulse-check', filters } = body;

    // Get questions based on tier
    let questions = getQuestionsForTier(tier);

    // Apply filters if provided
    if (filters) {
      if (filters.section) {
        questions = questions.filter(q => q.section === filters.section);
      }
      if (filters.type) {
        questions = questions.filter(q => q.type === filters.type);
      }
    }

    // Convert to expected format
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.prompt,
      section: q.section,
      type: q.type,
      required: q.required,
      helpText: q.helpText,
      options: q.type === 'likert' ? [
        'Strongly Disagree',
        'Disagree',
        'Neutral',
        'Agree',
        'Strongly Agree'
      ] : undefined
    }));

    const estimatedMinutes = Math.ceil(formattedQuestions.length * 1.5);

    return NextResponse.json({
      success: true,
      tier,
      data: {
        questions: formattedQuestions
      },
      metadata: {
        total: formattedQuestions.length,
        filtered: !!filters,
        estimatedTime: `${estimatedMinutes} minutes`,
        tier: tier
      }
    });

  } catch (error) {
    console.error('Questions POST API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process questions request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
