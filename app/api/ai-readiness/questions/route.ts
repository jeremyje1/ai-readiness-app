/**
 * AI Readiness Questions API Endpoint
 * Serves AI readiness questions based on tier selection and domain context
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  AI_READINESS_QUESTIONS,
  AI_DOMAINS,
  AI_TIERS,
  getQuestionsForTier
} from '@/lib/ai-readiness-questions';

// Function to load questions based on institution type
async function getQuestionsForInstitutionType(institutionType: string) {
  if (institutionType === 'K12') {
    try {
      const k12Questions = await import('@/data/ai-readiness-questions-k12.json');
      return k12Questions.default;
    } catch (error) {
      console.warn('K-12 questions not found, falling back to default');
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const segment = searchParams.get('segment');
    
    // Detect institution type from headers (set by middleware) or domain
    const institutionType = request.headers.get('x-institution-type') || 'default';
    const domainContext = request.headers.get('x-domain-context') || 'default';
    
    console.log(`🎯 Questions API - Institution Type: ${institutionType}, Domain: ${domainContext}`);

    // Load appropriate question set
    let questionsData = null;
    if (institutionType === 'K12') {
      questionsData = await getQuestionsForInstitutionType('K12');
    }
    
    // Use default questions if no specific version found
    if (!questionsData) {
      questionsData = {
        aiReadinessQuestions: AI_READINESS_QUESTIONS,
        domains: AI_DOMAINS,
        tiers: AI_TIERS
      };
    }

    // If tier is specified, return questions for that tier
    if (tier) {
      const tierQuestions = (questionsData && 'tiers' in questionsData && questionsData.tiers && questionsData.tiers[tier as keyof typeof questionsData.tiers]) ? 
        questionsData.aiReadinessQuestions : 
        getQuestionsForTier(tier);
      
      return NextResponse.json({
        success: true,
        data: {
          questions: tierQuestions,
          tierInfo: (questionsData && 'tiers' in questionsData && questionsData.tiers && questionsData.tiers[tier as keyof typeof questionsData.tiers]) || AI_TIERS[tier as keyof typeof AI_TIERS],
          domains: (questionsData && 'domains' in questionsData && questionsData.domains) || AI_DOMAINS,
          institutionType,
          domainContext,
          metadata: {
            total: tierQuestions.length,
            tier: tier,
            timestamp: new Date().toISOString()
          }
        }
      });
    }

    // Return all questions if no tier specified
    return NextResponse.json({
      success: true,
      data: {
        questions: AI_READINESS_QUESTIONS,
        domains: AI_DOMAINS,
        tiers: AI_TIERS,
        metadata: {
          total: AI_READINESS_QUESTIONS.length,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('AI Readiness Questions API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch AI readiness questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, filters } = body;

    let questions = tier ? getQuestionsForTier(tier) : AI_READINESS_QUESTIONS;

    // Apply filters if provided
    if (filters) {
      if (filters.section) {
        questions = questions.filter(q => q.section === filters.section);
      }
      if (filters.required !== undefined) {
        questions = questions.filter(q => q.required === filters.required);
      }
      if (filters.type) {
        questions = questions.filter(q => q.type === filters.type);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        questions,
        metadata: {
          total: questions.length,
          filtered: !!filters,
          tier: tier || 'all',
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('AI Readiness Questions POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process AI readiness questions request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
