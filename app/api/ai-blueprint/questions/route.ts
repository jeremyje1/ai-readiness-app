/**
 * AI Blueprint Questions API Endpoint
 * Serves tier-appropriate questions with enhanced filtering
 * 
 * @version 2.0.0
 * @author NorthPath Strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import type { AIBlueprintTier } from '@/lib/ai-blueprint-tier-configuration';
import { 
  getEnhancedQuestionsForTier, 
  validateTierQuestionCount, 
  getExpectedQuestionCount,
  getQuestionTypeDistribution,
  type EnhancedQuestion
} from '@/lib/ai-blueprint-question-filter';

// Import the enhanced question bank
import enhancedQuestions from '@/data/ai_blueprint_questions_enhanced.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier') as AIBlueprintTier;
    const format = searchParams.get('format') || 'full'; // 'full' | 'summary' | 'count'
    
    if (!tier) {
      return NextResponse.json(
        { error: 'Tier parameter is required' },
        { status: 400 }
      );
    }
    
    // Validate tier
    const validTiers: AIBlueprintTier[] = [
      'higher-ed-ai-pulse-check',
      'ai-readiness-comprehensive',
      'ai-transformation-blueprint',
      'ai-enterprise-partnership'
    ];
    
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }
    
    // Get tier-specific questions
    const allQuestions = enhancedQuestions.questions as EnhancedQuestion[];
    const tierQuestions = getEnhancedQuestionsForTier(tier, allQuestions);
    const questionCount = tierQuestions.length;
    const expectedCount = getExpectedQuestionCount(tier);
    
    // Validate question count
    const isValidCount = validateTierQuestionCount(tier, tierQuestions);
    if (!isValidCount) {
      console.warn(`Question count mismatch for ${tier}: expected ${expectedCount}, got ${questionCount}`);
    }
    
    // Return format-specific response
    switch (format) {
      case 'count':
        return NextResponse.json({
          tier,
          questionCount,
          expectedCount,
          isValid: isValidCount,
          distribution: getQuestionTypeDistribution(tier)
        });
        
      case 'summary':
        const summary = tierQuestions.map(q => ({
          id: q.id,
          domain: q.domain,
          type: q.type,
          priority: q.priority,
          required: q.required
        }));
        
        return NextResponse.json({
          tier,
          questionCount,
          expectedCount,
          isValid: isValidCount,
          questions: summary,
          distribution: getQuestionTypeDistribution(tier)
        });
        
      case 'full':
      default:
        return NextResponse.json({
          tier,
          questionCount,
          expectedCount,
          isValid: isValidCount,
          questions: tierQuestions,
          distribution: getQuestionTypeDistribution(tier),
          metadata: {
            version: '2.0.0',
            generatedAt: new Date().toISOString(),
            includesDocumentUploads: tierQuestions.some(q => q.type === 'file_upload'),
            includesOpenEnded: tierQuestions.some(q => q.type === 'open_ended'),
            includesScenarios: tierQuestions.some(q => q.context?.includes('scenario'))
          }
        });
    }
    
  } catch (error) {
    console.error('Error serving AI Blueprint questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, customFilters } = body;
    
    if (!tier) {
      return NextResponse.json(
        { error: 'Tier is required in request body' },
        { status: 400 }
      );
    }
    
    // Get base questions for tier
    const allQuestions = enhancedQuestions.questions as EnhancedQuestion[];
    let tierQuestions = getEnhancedQuestionsForTier(tier, allQuestions);
    
    // Apply custom filters if provided
    if (customFilters) {
      if (customFilters.domains) {
        tierQuestions = tierQuestions.filter(q => 
          customFilters.domains.includes(q.domain)
        );
      }
      
      if (customFilters.types) {
        tierQuestions = tierQuestions.filter(q => 
          customFilters.types.includes(q.type)
        );
      }
      
      if (customFilters.excludeFileUploads) {
        tierQuestions = tierQuestions.filter(q => q.type !== 'file_upload');
      }
      
      if (customFilters.onlyRequired) {
        tierQuestions = tierQuestions.filter(q => q.required);
      }
    }
    
    return NextResponse.json({
      tier,
      questionCount: tierQuestions.length,
      questions: tierQuestions,
      customFilters,
      appliedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing custom question filters:', error);
    return NextResponse.json(
      { error: 'Error processing custom filters' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
