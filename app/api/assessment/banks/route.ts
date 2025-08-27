/**
 * Assessment Banks API Route
 * Serves audience-specific assessment question banks with authentication checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';
import fs from 'fs';
import path from 'path';

// Assessment bank interfaces
interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: AssessmentQuestion[];
}

interface AssessmentQuestion {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'text';
  question: string;
  options?: Array<{
    value: string;
    text: string;
    score: number;
  }>;
  scale?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  required: boolean;
  category: string;
}

interface AssessmentBank {
  bankId: string;
  version: string;
  audience: Audience;
  title: string;
  description: string;
  lastUpdated: string;
  estimatedDuration: string;
  sections: AssessmentSection[];
  scoringRubric: {
    maxScore: number;
    levels: Array<{
      level: string;
      range: { min: number; max: number };
      description: string;
      recommendations: string[];
    }>;
  };
  focusAreas: string[];
}

/**
 * Load assessment bank for audience
 */
async function loadAssessmentBank(audience: Audience): Promise<AssessmentBank | null> {
  try {
    const bankPath = path.join(process.cwd(), 'lib', 'assessment', 'banks', `${audience}.json`);
    
    if (!fs.existsSync(bankPath)) {
      console.warn(`Assessment bank not found for audience: ${audience}`);
      return null;
    }

    const bankData = fs.readFileSync(bankPath, 'utf-8');
    const bank = JSON.parse(bankData) as AssessmentBank;
    
    // Validate bank structure
    if (!bank.sections || !Array.isArray(bank.sections)) {
      throw new Error('Invalid bank structure: missing sections array');
    }

    return bank;

  } catch (error) {
    console.error(`Error loading assessment bank for ${audience}:`, error);
    return null;
  }
}

/**
 * Filter questions based on user tier/access level
 */
function filterQuestionsByAccess(
  sections: AssessmentSection[], 
  userTier?: 'basic' | 'comprehensive' | 'enterprise'
): AssessmentSection[] {
  // For now, return all questions - could implement tier-based filtering later
  return sections;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get audience from cookie or query parameter
    let audience = getAudienceCookie(request);
    const audienceParam = searchParams.get('audience');
    
    if (audienceParam && isValidAudience(audienceParam)) {
      audience = audienceParam as Audience;
    }
    
    // Default to k12 if no audience detected
    if (!audience) {
      audience = 'k12';
    }

    // Get query parameters
    const format = searchParams.get('format') || 'full'; // 'full' | 'summary' | 'metadata'
    const sectionId = searchParams.get('section');
    
    // Load assessment bank
    const bank = await loadAssessmentBank(audience);
    
    if (!bank) {
      return NextResponse.json(
        { error: `Assessment bank not found for audience: ${audience}` },
        { status: 404 }
      );
    }

    // Authentication check - for future enhancement
    const authHeader = request.headers.get('authorization');
    let userTier: 'basic' | 'comprehensive' | 'enterprise' | undefined;
    
    if (authHeader?.startsWith('Bearer ')) {
      // TODO: Implement authentication validation
      userTier = 'comprehensive'; // Default for now
    }

    // Filter questions by access level
    const filteredSections = filterQuestionsByAccess(bank.sections, userTier);

    // Handle specific section request
    if (sectionId) {
      const section = filteredSections.find(s => s.id === sectionId);
      if (!section) {
        return NextResponse.json(
          { error: `Section not found: ${sectionId}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        audience,
        bankId: bank.bankId,
        section,
        metadata: {
          totalSections: filteredSections.length,
          totalQuestions: filteredSections.reduce((sum, s) => sum + s.questions.length, 0),
          estimatedDuration: bank.estimatedDuration
        }
      });
    }

    // Return format-specific response
    switch (format) {
      case 'metadata':
        return NextResponse.json({
          bankId: bank.bankId,
          version: bank.version,
          audience: bank.audience,
          title: bank.title,
          description: bank.description,
          lastUpdated: bank.lastUpdated,
          estimatedDuration: bank.estimatedDuration,
          focusAreas: bank.focusAreas,
          sectionsCount: filteredSections.length,
          questionsCount: filteredSections.reduce((sum, s) => sum + s.questions.length, 0),
          maxScore: bank.scoringRubric.maxScore,
          levels: bank.scoringRubric.levels.map(l => ({ 
            level: l.level, 
            range: l.range 
          }))
        });
        
      case 'summary':
        return NextResponse.json({
          audience,
          bankId: bank.bankId,
          title: bank.title,
          sections: filteredSections.map(section => ({
            id: section.id,
            title: section.title,
            description: section.description,
            weight: section.weight,
            questionCount: section.questions.length,
            categories: [...new Set(section.questions.map(q => q.category))]
          })),
          totalQuestions: filteredSections.reduce((sum, s) => sum + s.questions.length, 0),
          estimatedDuration: bank.estimatedDuration
        });
        
      case 'full':
      default:
        return NextResponse.json({
          audience,
          bank: {
            ...bank,
            sections: filteredSections
          },
          metadata: {
            requestedAudience: audienceParam,
            derivedAudience: audience,
            userTier,
            generatedAt: new Date().toISOString()
          }
        });
    }

  } catch (error) {
    console.error('Assessment banks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment bank' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for custom assessment bank requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audience, customFilters } = body;
    
    if (!audience || !isValidAudience(audience)) {
      return NextResponse.json(
        { error: 'Valid audience is required' },
        { status: 400 }
      );
    }
    
    // Load assessment bank
    const bank = await loadAssessmentBank(audience);
    
    if (!bank) {
      return NextResponse.json(
        { error: `Assessment bank not found for audience: ${audience}` },
        { status: 404 }
      );
    }

    let filteredSections = bank.sections;
    
    // Apply custom filters if provided
    if (customFilters) {
      if (customFilters.sections && Array.isArray(customFilters.sections)) {
        filteredSections = filteredSections.filter(section => 
          customFilters.sections.includes(section.id)
        );
      }
      
      if (customFilters.categories && Array.isArray(customFilters.categories)) {
        filteredSections = filteredSections.map(section => ({
          ...section,
          questions: section.questions.filter(q => 
            customFilters.categories.includes(q.category)
          )
        })).filter(section => section.questions.length > 0);
      }
      
      if (customFilters.onlyRequired) {
        filteredSections = filteredSections.map(section => ({
          ...section,
          questions: section.questions.filter(q => q.required)
        })).filter(section => section.questions.length > 0);
      }
    }
    
    return NextResponse.json({
      audience,
      bankId: bank.bankId,
      customFilters,
      sections: filteredSections,
      totalQuestions: filteredSections.reduce((sum, s) => sum + s.questions.length, 0),
      appliedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing custom assessment filters:', error);
    return NextResponse.json(
      { error: 'Error processing custom filters' },
      { status: 500 }
    );
  }
}