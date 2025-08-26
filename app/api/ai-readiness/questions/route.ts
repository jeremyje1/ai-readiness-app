/**
 * AI Readiness Questions API Endpoint
 * Serves streamlined AI readiness questions with context capture
 */

import {
  COMPREHENSIVE_MODE_QUESTIONS,
  QUESTION_SECTIONS,
  QUICK_MODE_QUESTIONS
} from '@/lib/streamlined-ai-questions';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'quick';
    const section = searchParams.get('section');

    // Detect institution type from headers (set by middleware) or domain
    const institutionType = request.headers.get('x-institution-type') || 'default';
    const domainContext = request.headers.get('x-domain-context') || 'default';

    console.log(`🎯 Questions API - Institution Type: ${institutionType}, Domain: ${domainContext}, Mode: ${mode}`);

    // Select appropriate question set based on mode
    let questions = mode === 'comprehensive' ? COMPREHENSIVE_MODE_QUESTIONS : QUICK_MODE_QUESTIONS;

    // Filter by section if specified
    if (section) {
      questions = questions.filter(q => q.section === section);
    }

    // Build response
    const response = {
      success: true,
      mode,
      institutionType,
      questions,
      sections: QUESTION_SECTIONS,
      metadata: {
        total: questions.length,
        sections: [...new Set(questions.map(q => q.section))],
        estimatedTime: mode === 'comprehensive' ? '25-35 minutes' : '8-10 minutes'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Questions API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load questions',
        questions: [],
        sections: QUESTION_SECTIONS
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode = 'quick', filters } = body;

    // Get questions based on mode
    let questions = mode === 'comprehensive' ? COMPREHENSIVE_MODE_QUESTIONS : QUICK_MODE_QUESTIONS;

    // Apply filters if provided
    if (filters) {
      if (filters.section) {
        questions = questions.filter(q => q.section === filters.section);
      }
      if (filters.type) {
        questions = questions.filter(q => q.type === filters.type);
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      questions,
      sections: QUESTION_SECTIONS,
      metadata: {
        total: questions.length,
        filtered: !!filters,
        estimatedTime: mode === 'comprehensive' ? '25-35 minutes' : '8-10 minutes'
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
