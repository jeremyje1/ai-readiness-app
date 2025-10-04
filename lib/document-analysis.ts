import { createClient } from '@/lib/supabase/client';
import OpenAI from 'openai';

// Document analysis types
export interface DocumentAnalysisResult {
    documentType: string;
    keyThemes: string[];
    aiReadinessIndicators: string[];
    alignmentOpportunities: string[];
    confidenceScore: number;
    gaps?: string[];
    recommendations?: string[];
    rawAnalysis?: any; // Full AI response for paid users
}

export interface AnalysisOptions {
    userId: string;
    fileName: string;
    fileContent: string;
    institutionType?: string;
    isPaidUser: boolean;
}

// Initialize OpenAI (only if API key is available)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Check if user has active subscription
export async function checkUserSubscription(userId: string): Promise<boolean> {
    try {
        const supabase = createClient();

        // Check for active subscription
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

        return !!subscription;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}

// Extract text from various document formats
export async function extractTextFromDocument(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            // Extract text from PDF
            const pdf = await import('pdf-parse');
            const data = await pdf.default(buffer);
            return data.text;
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.toLowerCase().endsWith('.docx')
        ) {
            // Extract text from DOCX
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            // Extract text from TXT
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(buffer);
        } else {
            throw new Error(`Unsupported file type: ${file.type}`);
        }
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error('Failed to extract text from document');
    }
}

// Perform real AI analysis using OpenAI
export async function performAIAnalysis(
    textContent: string,
    options: {
        fileName: string;
        institutionType?: string;
    }
): Promise<DocumentAnalysisResult> {
    if (!openai) {
        throw new Error('OpenAI API key not configured');
    }

    const prompt = `
Analyze this educational institution document for AI readiness assessment.

Institution Type: ${options.institutionType || 'Not specified'}
Document Name: ${options.fileName}

Document Content:
${textContent.substring(0, 8000)} // Limit to prevent token overflow

Please provide a structured analysis with the following:

1. Document Type Classification (e.g., Strategic Plan, Policy Document, Academic Program, etc.)
2. Key Themes - List 5-7 main themes or topics covered
3. AI Readiness Indicators - Specific mentions or implications for AI adoption (technology initiatives, data usage, innovation goals, etc.)
4. Alignment Opportunities - How this document's goals could benefit from AI implementation
5. Gaps or Concerns - What's missing for AI readiness
6. Specific Recommendations - 3-5 actionable recommendations based on the document

Also provide a confidence score (0-100) based on:
- Document completeness and relevance
- Clarity of AI-related opportunities
- Alignment with educational AI best practices

Format your response as JSON with the following structure:
{
  "documentType": "string",
  "keyThemes": ["string array"],
  "aiReadinessIndicators": ["string array"],
  "alignmentOpportunities": ["string array"],
  "gaps": ["string array"],
  "recommendations": ["string array"],
  "confidenceScore": number,
  "summary": "brief summary paragraph"
}
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are an AI readiness assessment expert for educational institutions. Analyze documents to identify AI implementation opportunities aligned with the NIST AI Risk Management Framework."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3, // Lower temperature for more consistent analysis
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(completion.choices[0].message.content || '{}');

        return {
            documentType: analysis.documentType || 'General Document',
            keyThemes: analysis.keyThemes || [],
            aiReadinessIndicators: analysis.aiReadinessIndicators || [],
            alignmentOpportunities: analysis.alignmentOpportunities || [],
            confidenceScore: analysis.confidenceScore || 70,
            gaps: analysis.gaps,
            recommendations: analysis.recommendations,
            rawAnalysis: analysis
        };
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to perform AI analysis');
    }
}

// Calculate confidence score based on various factors
export function calculateConfidenceScore(factors: {
    documentLength: number;
    hasAIKeywords: boolean;
    hasStrategyContent: boolean;
    documentType: string;
    aiMentions: number;
}): number {
    let score = 50; // Base score

    // Document completeness (up to 20 points)
    if (factors.documentLength > 5000) score += 20;
    else if (factors.documentLength > 2000) score += 15;
    else if (factors.documentLength > 500) score += 10;
    else score += 5;

    // AI relevance (up to 25 points)
    if (factors.hasAIKeywords) score += 15;
    score += Math.min(factors.aiMentions * 2, 10); // Up to 10 points for AI mentions

    // Document type relevance (up to 15 points)
    const highValueTypes = ['strategic plan', 'technology plan', 'ai policy', 'digital strategy'];
    if (highValueTypes.some(type => factors.documentType.toLowerCase().includes(type))) {
        score += 15;
    } else if (factors.documentType.toLowerCase().includes('policy') ||
        factors.documentType.toLowerCase().includes('plan')) {
        score += 10;
    } else {
        score += 5;
    }

    // Strategy content (up to 10 points)
    if (factors.hasStrategyContent) score += 10;

    // Cap at 95% (never 100% certain)
    return Math.min(Math.round(score), 95);
}

// Main analysis function that routes to appropriate method
export async function analyzeDocument(
    file: File,
    userId: string
): Promise<DocumentAnalysisResult> {
    try {
        // Check if user is paid subscriber
        const isPaidUser = await checkUserSubscription(userId);

        if (!isPaidUser) {
            // Return mock analysis for free users
            return getMockAnalysis(file);
        }

        // Extract text content
        const textContent = await extractTextFromDocument(file);

        if (!textContent || textContent.length < 100) {
            throw new Error('Document appears to be empty or too short for analysis');
        }

        // Get user's institution type for context
        const supabase = createClient();
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('institution_type')
            .eq('user_id', userId)
            .single();

        // Perform AI analysis
        const analysis = await performAIAnalysis(textContent, {
            fileName: file.name,
            institutionType: profile?.institution_type
        });

        // Store analysis results
        await storeAnalysisResults(userId, file.name, analysis);

        return analysis;
    } catch (error) {
        console.error('Document analysis error:', error);

        // Fallback to mock for errors
        return {
            ...getMockAnalysis(file),
            documentType: 'Analysis Error',
            keyThemes: ['Error occurred during analysis'],
            confidenceScore: 0
        };
    }
}

// Store analysis results in database
async function storeAnalysisResults(
    userId: string,
    fileName: string,
    analysis: DocumentAnalysisResult
): Promise<void> {
    try {
        const supabase = createClient();

        await supabase.from('document_analyses').insert({
            user_id: userId,
            file_name: fileName,
            document_type: analysis.documentType,
            key_themes: analysis.keyThemes,
            ai_readiness_indicators: analysis.aiReadinessIndicators,
            alignment_opportunities: analysis.alignmentOpportunities,
            confidence_score: analysis.confidenceScore,
            gaps: analysis.gaps,
            recommendations: analysis.recommendations,
            analysis_data: analysis.rawAnalysis,
            analyzed_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error storing analysis results:', error);
        // Don't throw - analysis can still be used even if storage fails
    }
}

// Get mock analysis for free users (existing logic)
export function getMockAnalysis(file: File): DocumentAnalysisResult {
    const fileName = file.name.toLowerCase();

    if (fileName.includes('strategic') || fileName.includes('plan')) {
        return {
            documentType: 'Strategic Plan (Demo)',
            keyThemes: [
                'Digital transformation initiatives',
                'Innovation and technology adoption',
                'Student success metrics'
            ],
            aiReadinessIndicators: [
                'References to emerging technologies',
                'Data-driven decision making emphasis'
            ],
            alignmentOpportunities: [
                'Integrate AI initiatives into digital transformation goals',
                'Leverage AI for student success analytics'
            ],
            confidenceScore: 85
        };
    } else if (fileName.includes('policy') || fileName.includes('governance')) {
        return {
            documentType: 'Policy Document (Demo)',
            keyThemes: [
                'Governance frameworks',
                'Compliance requirements',
                'Risk management protocols'
            ],
            aiReadinessIndicators: [
                'Technology governance structures',
                'Data privacy considerations'
            ],
            alignmentOpportunities: [
                'Develop AI-specific governance policies',
                'Integrate AI ethics into existing frameworks'
            ],
            confidenceScore: 72
        };
    } else {
        return {
            documentType: 'General Document (Demo)',
            keyThemes: [
                'Institutional priorities',
                'Operational procedures'
            ],
            aiReadinessIndicators: [
                'Technology references',
                'Innovation mentions'
            ],
            alignmentOpportunities: [
                'Identify AI integration opportunities',
                'Assess technology readiness'
            ],
            confidenceScore: 60
        };
    }
}