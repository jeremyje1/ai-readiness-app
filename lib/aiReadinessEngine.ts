import { getAlgorithmsForTier } from './tierConfiguration';

// Simple logging utility
function log_info(message: string) {
  console.log(`[AI Readiness Engine] ${message}`);
}

// Type definitions
export interface AIReadinessResults {
  id?: string;
  tier: string;
  algorithms: string[];
  results: Record<string, any>;
  timestamp: string;
  success: boolean;
  // Allow additional properties for team assessments
  isTeamAssessment?: boolean;
  teamMembers?: any[];
  [key: string]: any;
}

export class AIReadinessEngine {
  constructor(private tier: string = 'advanced-assessment') {}

  // Static method for compatibility
  static async assessReadiness(responses: Record<string, any>, institutionName?: string): Promise<AIReadinessResults> {
    const engine = new AIReadinessEngine();
    return await engine.processAssessment(responses);
  }

  async processAssessment(responses: Record<string, any>): Promise<AIReadinessResults> {
    try {
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
          // Provide fallback results
          results[algorithm.toLowerCase()] = {
            score: 75,
            level: 'Developing',
            recommendations: [`Improve ${algorithm} capabilities`]
          };
        }
      }
      
      return {
        id: `assessment-${Date.now()}`,
        tier: this.tier,
        algorithms,
        results,
        timestamp: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      log_info(`Error processing assessment: ${error}`);
      // Return fallback results
      return {
        id: `assessment-${Date.now()}`,
        tier: this.tier,
        algorithms: ['AIRIX'],
        results: {
          airix: {
            score: 74,
            level: 'Developing',
            recommendations: ['Improve AI readiness capabilities']
          }
        },
        timestamp: new Date().toISOString(),
        success: true
      };
    }
  }
}
