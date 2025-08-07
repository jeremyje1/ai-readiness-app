import OpenAI from 'openai';

// Initialize OpenAI client lazily
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function runOpenAI(prompt: string, options?: {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  try {
    const openaiClient = getOpenAIClient();

    // Model fallback chain - try in order of preference
    const modelChain = [
      options?.model || 'gpt-4o',
      'gpt-4o-mini',
      'gpt-4',
      'gpt-3.5-turbo'
    ];

    let lastError: Error | null = null;
    
    for (const model of modelChain) {
      try {
        console.log(`Attempting OpenAI request with model: ${model}`);
        
        const completion = await openaiClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options?.maxTokens || 4000,
          temperature: options?.temperature || 0.7
        });

        const result = completion.choices[0]?.message?.content;
        if (!result) {
          throw new Error('No response content from OpenAI');
        }

        console.log(`OpenAI request successful with model: ${model}`);
        return result;
        
      } catch (error) {
        console.error(`OpenAI error with model ${model}:`, error);
        lastError = error as Error;
        
        // If it's a rate limit error, wait and try next model
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 429) {
            console.log('Rate limit hit, trying next model...');
            continue;
          }
          if (status === 404) {
            console.log('Model not found, trying next model...');
            continue;
          }
        }
        
        // For other errors, continue to next model
        continue;
      }
    }

    // If all models failed, throw the last error
    throw new Error(`All OpenAI models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    
  } catch (error) {
    console.error('OpenAI service error:', error);
    throw new Error(`OpenAI service temporarily unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateExecutiveSummary(scores: any): Promise<string> {
  const prompt = `
    Write a comprehensive 2-page executive summary for an organizational assessment report based on the following scores and data:
    
    ${JSON.stringify(scores, null, 2)}
    
    The summary should include:
    1. Executive Overview (2-3 paragraphs)
    2. Key Performance Indicators and Scores
    3. Critical Findings and Insights
    4. Strategic Recommendations
    5. Implementation Priorities
    6. Expected ROI and Business Impact
    
    Use professional business language appropriate for C-level executives. Focus on actionable insights and clear recommendations.
    Format the content with clear headings and structure suitable for a PDF report.
  `;

  return await runOpenAI(prompt, { maxTokens: 3000 });
}

export async function generateRecommendations(answers: any, scores: any): Promise<string> {
  const prompt = `
    Based on the following assessment answers and calculated scores, generate detailed recommendations:
    
    Assessment Answers:
    ${JSON.stringify(answers, null, 2)}
    
    Calculated Scores:
    ${JSON.stringify(scores, null, 2)}
    
    Provide:
    1. Top 5 Priority Actions
    2. Quick Wins (0-3 months)
    3. Medium-term Initiatives (3-12 months)
    4. Long-term Strategic Changes (1-3 years)
    5. Risk Mitigation Strategies
    
    Each recommendation should include specific actions, expected benefits, and implementation considerations.
  `;

  return await runOpenAI(prompt, { maxTokens: 2500 });
}
