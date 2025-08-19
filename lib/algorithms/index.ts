/**
 * AI Readiness Algorithm Suite - Enterprise Grade
 * Patent-Pending Algorithms for AI Implementation Assessment
 * 
 * This module exports AI readiness specific algorithms:
 * - AICS: AI Implementation Capacity Scoring
 * - AIMS: AI Implementation Maturity Scoring
 * - AIPS: AI Implementation Priority Scoring
 * - AIBS: AI Business Strategy Scoring
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 * @patent-pending true
 */

// AI Readiness Algorithm Exports
export * from './aics';
export * from './aims';
export * from './aips';
export * from './aibs';

// Utility functions
export * from './utils';

// Algorithm registry for dynamic access
export const AI_READINESS_ALGORITHMS = {
  AICS: 'aics',
  AIMS: 'aims', 
  AIPS: 'aips',
  AIBS: 'aibs'
} as const;

export type AIReadinessAlgorithmType = typeof AI_READINESS_ALGORITHMS[keyof typeof AI_READINESS_ALGORITHMS];
