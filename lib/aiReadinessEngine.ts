import { getAlgorithmsForTier } from './tierConfiguration';

// Simple logging utility
function log_info(message: string) {
  console.log(`[AI Readiness Engine] ${message}`);
}

// Type definitions
export interface AIReadinessResults {
  tier: string;
  algorithms: string[];
  results: Record<string, any>;
  timestamp: string;
  // Allow additional properties for team assessments
  isTeamAssessment?: boolean;
  teamMembers?: any[];
  [key: string]: any;
}

export class EnhancedAIReadinessEngine {
  constructor(private tier: string = 'advanced-assessment') {}

  // Static method for compatibility
  static async assessReadiness(responses: Record<string, any>, institutionName?: string): Promise<AIReadinessResults> {
    const engine = new EnhancedAIReadinessEngine();
    return await engine.processAssessment(responses);
  }

  async processAssessment(responses: Record<string, any>) {
    const algorithms = getAlgorithmsForTier(this.tier);
    
    log_info(`Processing assessment with tier: ${this.tier}`);
    log_info(`Using algorithms: ${algorithms.join(', ')}`);
    
    const results: Record<string, any> = {};
    
    // Import and run tier-appropriate algorithms dynamically
    for (const algorithm of algorithms) {
      try {
        const algorithmModule = await import(`./algorithms/${algorithm.toLowerCase()}`);
        if (algorithmModule.calculate) {
          results[algorithm.toLowerCase()] = await algorithmModule.calculate(responses);
          log_info(`✅ ${algorithm} calculation complete`);
        }
      } catch (error) {
        console.warn(`⚠️ Algorithm ${algorithm} not available:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    return {
      tier: this.tier,
      algorithms: algorithms,
      results,
      timestamp: new Date().toISOString()
    };
  }
}

// Export compatibility aliases
export const AIReadinessEngine = EnhancedAIReadinessEngine;
export default EnhancedAIReadinessEngine;
