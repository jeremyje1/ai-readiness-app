// filepath: /lib/algorithm/score.ts
// v2.1 scoring: segment-based weights, confidence intervals, peer benchmarks, explainability
import { AssessmentResponse } from '../realignment-engine';

export type Segment = 'HIGHER_ED' | 'NON_PROFIT' | 'HEALTHCARE' | 'GOVERNMENT' | 'FOR_PROFIT';

export interface FactorWeight {
  spanControl: number;
  culture: number;
  techFit: number;
  readiness: number;
}

export interface AlgoInput {
  answers: Record<string, number>; // 0-4 Likert scale
  segment: Segment;
}

export interface AlgoOutput {
  score: number; // 0-1
  tier: string; // Updated to string for flexible tier names
  ci: number; // ± confidence interval
  peerPercentile: number; // 0-100
  percentile: number; // Alias for peerPercentile for test compatibility
  confidence: {
    overall: number;
    sections: Record<string, [number, number]>;
  };
  explainability: Record<string, string>;
  sectionScores: Record<string, number>;
}

export interface ScoreResult extends AlgoOutput {
  totalScore: number;
  confidenceIntervals: Record<string, [number, number]>;
  peerBenchmark: Record<string, number>;
}

// Segment-based weights according to v2.1 specification
const SEGMENT_WEIGHTS: Record<Segment, FactorWeight> = {
  HIGHER_ED: { spanControl: 0.25, culture: 0.25, techFit: 0.20, readiness: 0.30 },
  NON_PROFIT: { spanControl: 0.20, culture: 0.30, techFit: 0.20, readiness: 0.30 },
  HEALTHCARE: { spanControl: 0.30, culture: 0.20, techFit: 0.25, readiness: 0.25 },
  GOVERNMENT: { spanControl: 0.35, culture: 0.15, techFit: 0.20, readiness: 0.30 },
  FOR_PROFIT: { spanControl: 0.30, culture: 0.20, techFit: 0.30, readiness: 0.20 },
};

// Peer benchmarks by segment (should be loaded from db in production)
const _PEER_BENCHMARKS: Record<Segment, Record<string, number>> = {
  HIGHER_ED: {
    'spanControl': 0.61,
    'culture': 0.68,
    'techFit': 0.55,
    'readiness': 0.62,
  },
  NON_PROFIT: {
    'spanControl': 0.58,
    'culture': 0.72,
    'techFit': 0.52,
    'readiness': 0.65,
  },
  HEALTHCARE: {
    'spanControl': 0.65,
    'culture': 0.60,
    'techFit': 0.63,
    'readiness': 0.58,
  },
  GOVERNMENT: {
    'spanControl': 0.55,
    'culture': 0.50,
    'techFit': 0.48,
    'readiness': 0.53,
  },
  FOR_PROFIT: {
    'spanControl': 0.70,
    'culture': 0.65,
    'techFit': 0.72,
    'readiness': 0.68,
  },
};

// Helper functions for v2.1 algorithm
function normalizeLikert(answers: Record<string, number>): Record<string, number> {
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(answers)) {
    normalized[key] = value / 4; // Convert 0-4 to 0-1
  }
  return normalized;
}

function countBlanks(answers: Record<string, number>): number {
  // Count mandatory questions left blank (assuming all are mandatory for now)
  return Object.values(answers).filter(v => v === 0 || v === undefined || v === null).length;
}

function calcConfidenceInterval(normalized: Record<string, number>, blanks: number): number {
  const values = Object.values(normalized);
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Confidence interval penalized by missing data
  const baseCI = stdDev * 1.96; // 95% confidence
  const blankPenalty = blanks * 0.02; // Additional uncertainty for missing data
  return baseCI + blankPenalty;
}

// Enhanced peer percentile calculation with statistical distribution
export function calculatePeerPercentile(score: number, segment: Segment): number {
  // Simulated peer data distribution (in production, this would query actual database)
  // Using normal distribution approximation for peer scores by segment
  const PEER_DISTRIBUTIONS: Record<Segment, { mean: number; stdDev: number; sampleSize: number }> = {
    HIGHER_ED: { mean: 0.58, stdDev: 0.18, sampleSize: 487 },
    NON_PROFIT: { mean: 0.54, stdDev: 0.21, sampleSize: 203 },
    HEALTHCARE: { mean: 0.62, stdDev: 0.16, sampleSize: 341 },
    GOVERNMENT: { mean: 0.51, stdDev: 0.19, sampleSize: 156 },
    FOR_PROFIT: { mean: 0.64, stdDev: 0.17, sampleSize: 672 }
  };

  const distribution = PEER_DISTRIBUTIONS[segment];
  
  // Calculate z-score
  const zScore = (score - distribution.mean) / distribution.stdDev;
  
  // Convert to percentile using cumulative distribution function approximation
  const percentile = Math.round(normalCDF(zScore) * 100);
  
  // Ensure percentile is within valid range
  return Math.max(1, Math.min(99, percentile));
}

// Normal cumulative distribution function approximation
function normalCDF(z: number): number {
  // Abramowitz and Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  if (z > 0) {
    prob = 1 - prob;
  }
  
  return prob;
}

// Enhanced confidence interval calculation
export function calculateConfidenceIntervals(
  answers: Record<string, number>,
  sectionScores: Record<string, number>
): { overall: number; sections: Record<string, [number, number]> } {
  // Handle empty data
  if (Object.keys(answers).length === 0) {
    return {
      overall: 0,
      sections: {}
    };
  }

  // Count responses for sample size calculation
  const responseCount = Object.keys(answers).length;
  
  // Calculate standard error based on response consistency and sample size
  const inconsistency = calculateResponseInconsistency(answers);
  const baseError = 0.08; // Base 8% error
  const sampleSizeAdjustment = Math.sqrt(20 / Math.max(responseCount, 1)); // Adjust for sample size
  const consistencyAdjustment = 1 + inconsistency; // Adjust for inconsistency
  
  const overallConfidenceInterval = baseError * sampleSizeAdjustment * consistencyAdjustment;
  
  // Calculate section-specific confidence intervals
  const sectionIntervals: Record<string, [number, number]> = {};
  Object.keys(sectionScores).forEach(section => {
    const sectionResponses = Object.keys(answers).filter(key => key.includes(section)).length;
    const sectionError = baseError * Math.sqrt(5 / Math.max(sectionResponses, 1)) * consistencyAdjustment;
    const score = sectionScores[section];
    sectionIntervals[section] = [
      Math.max(0, score - sectionError),
      Math.min(1, score + sectionError)
    ];
  });
  
  return {
    overall: Math.min(0.15, overallConfidenceInterval), // Cap at 15%
    sections: sectionIntervals
  };
}

// Calculate response inconsistency for confidence adjustment
function calculateResponseInconsistency(answers: Record<string, number>): number {
  const values = Object.values(answers);
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Normalize inconsistency to 0-1 scale (0 = very consistent, 1 = very inconsistent)
  return Math.min(1, standardDeviation / 2); // Assuming max std dev of 2 for 0-4 scale
}

// Enhanced tier assignment with more granular categories
export function assignTier(score: number, confidenceInterval: number, peerPercentile: number): string {
  // Consider both absolute score and peer performance
  const adjustedScore = score * 0.7 + (peerPercentile / 100) * 0.3;
  
  if (adjustedScore >= 0.80) {
    return 'TRANSFORMING'; // Top tier performance
  } else if (adjustedScore >= 0.65) {
    return 'GROWING'; // Strong performance with growth opportunities
  } else if (adjustedScore >= 0.50) {
    return 'DEVELOPING'; // Moderate performance requiring focused attention
  } else if (adjustedScore >= 0.35) {
    return 'ESTABLISHING'; // Foundational performance needing support
  } else {
    return 'EMERGING'; // Early-stage performance requiring comprehensive development
  }
}

// Main v2.1 algorithm implementation
export async function calcScoreV21(input: AlgoInput): Promise<AlgoOutput> {
  const { answers, segment } = input;
  const w = SEGMENT_WEIGHTS[segment];
  const n = normalizeLikert(answers);

  // Group normalized answers by factor (better classification)
  const factors = {
    spanControl: Object.entries(n).filter(([key]) => 
      key.toLowerCase().includes('span') || 
      key.toLowerCase().includes('control') || 
      key.toLowerCase().includes('oversight') ||
      key.toLowerCase().includes('governance')
    ).map(([, value]) => value),
    
    culture: Object.entries(n).filter(([key]) => 
      key.toLowerCase().includes('culture') || 
      key.toLowerCase().includes('team') ||
      key.toLowerCase().includes('collab') ||
      key.toLowerCase().includes('comm')
    ).map(([, value]) => value),
    
    techFit: Object.entries(n).filter(([key]) => 
      key.toLowerCase().includes('tech') || 
      key.toLowerCase().includes('digital') ||
      key.toLowerCase().includes('system') ||
      key.toLowerCase().includes('tool')
    ).map(([, value]) => value),
    
    readiness: Object.entries(n).filter(([key]) => 
      key.toLowerCase().includes('ready') || 
      key.toLowerCase().includes('change') ||
      key.toLowerCase().includes('adapt') ||
      key.toLowerCase().includes('transform')
    ).map(([, value]) => value),
  };

  // If no specific categorization, distribute evenly across factors
  const allValues = Object.values(n);
  if (factors.spanControl.length === 0 && factors.culture.length === 0 && 
      factors.techFit.length === 0 && factors.readiness.length === 0) {
    // Default distribution when no specific factors are detected
    const quarter = Math.ceil(allValues.length / 4);
    factors.spanControl = allValues.slice(0, quarter);
    factors.culture = allValues.slice(quarter, quarter * 2);
    factors.techFit = allValues.slice(quarter * 2, quarter * 3);
    factors.readiness = allValues.slice(quarter * 3);
  }

  // Calculate factor scores
  const factorScores = {
    spanControl: factors.spanControl.length > 0 ? factors.spanControl.reduce((a, b) => a + b, 0) / factors.spanControl.length : 0.5,
    culture: factors.culture.length > 0 ? factors.culture.reduce((a, b) => a + b, 0) / factors.culture.length : 0.5,
    techFit: factors.techFit.length > 0 ? factors.techFit.reduce((a, b) => a + b, 0) / factors.techFit.length : 0.5,
    readiness: factors.readiness.length > 0 ? factors.readiness.reduce((a, b) => a + b, 0) / factors.readiness.length : 0.5,
  };

  // Calculate weighted base score
  const base = w.spanControl * factorScores.spanControl +
               w.culture * factorScores.culture +
               w.techFit * factorScores.techFit +
               w.readiness * factorScores.readiness;

  // Apply penalty for blanks
  const blanks = countBlanks(answers);
  const penalty = blanks * 0.05;
  const score = Math.max(0, base - penalty);

  // Calculate confidence interval
  const ci = calcConfidenceInterval(n, blanks);

  // Calculate peer percentile using enhanced algorithm
  const peerPercentile = calculatePeerPercentile(score, segment);

  // Enhanced tier assignment
  const tier = assignTier(score, ci, peerPercentile);

  // Create explainability
  const explainability = {
    'Overall Score': `${(score * 100).toFixed(1)}% based on weighted factors for ${segment} segment`,
    'Span of Control': `Weight: ${w.spanControl}, Score: ${(factorScores.spanControl * 100).toFixed(1)}%`,
    'Culture': `Weight: ${w.culture}, Score: ${(factorScores.culture * 100).toFixed(1)}%`,
    'Tech Fit': `Weight: ${w.techFit}, Score: ${(factorScores.techFit * 100).toFixed(1)}%`,
    'Readiness': `Weight: ${w.readiness}, Score: ${(factorScores.readiness * 100).toFixed(1)}%`,
    'Confidence': `±${(ci * 100).toFixed(1)}% (${blanks} missing answers)`,
    'Peer Comparison': `${peerPercentile.toFixed(0)}th percentile in ${segment} segment`,
  };

  // Calculate enhanced confidence intervals
  const confidenceData = calculateConfidenceIntervals(answers, factorScores);

  return {
    score,
    tier,
    ci,
    peerPercentile,
    percentile: peerPercentile, // Alias for test compatibility
    confidence: confidenceData,
    explainability,
    sectionScores: factorScores,
  };
}

// Legacy function for backward compatibility
export function scoreAssessment(
  responses: AssessmentResponse[],
  segment: Segment
): ScoreResult {
  // Handle empty responses
  if (responses.length === 0) {
    return {
      totalScore: 0,
      sectionScores: {},
      confidenceIntervals: {},
      peerBenchmark: {},
      explainability: {},
      score: 0,
      tier: 'Strategic Assessment',
      ci: 0,
      peerPercentile: 0,
      percentile: 0,
      confidence: { overall: 0, sections: {} },
    };
  }

  // Convert responses to answers format
  const answers: Record<string, number> = {};
  responses.forEach(r => {
    answers[r.questionId] = r.value;
  });

  // Use sync version for compatibility
  const w = SEGMENT_WEIGHTS[segment];
  const n = normalizeLikert(answers);
  
  // Simplified factor grouping for legacy compatibility
  const sectionMap: Record<string, number[]> = {};
  responses.forEach(r => {
    if (!sectionMap[r.section]) sectionMap[r.section] = [];
    sectionMap[r.section].push(r.value / 4); // normalize
  });

  const sectionScores: Record<string, number> = {};
  const confidenceIntervals: Record<string, [number, number]> = {};
  const peerBenchmark: Record<string, number> = {};
  const explainability: Record<string, string> = {};
  let totalScore = 0;
  let totalWeight = 0;

  for (const section in sectionMap) {
    const values = sectionMap[section];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const weight = 1; // Default weight for legacy compatibility
    const score = avg * weight;
    sectionScores[section] = score;
    totalScore += score;
    totalWeight += weight;
    
    // Confidence interval (simple stddev, 95%)
    const mean = avg;
    const std = Math.sqrt(values.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / values.length);
    confidenceIntervals[section] = [mean - 2 * std, mean + 2 * std];
    
    // Peer benchmark (simplified)
    peerBenchmark[section] = 0.6; // Default peer benchmark
    
    // Explainability
    explainability[section] = `Score: ${(score * 100).toFixed(1)}% for ${section}`;
  }

  const blanks = countBlanks(answers);
  const ci = calcConfidenceInterval(n, blanks);
  const finalScore = totalWeight > 0 ? Math.max(0, totalScore / totalWeight - blanks * 0.05) : 0;
  
  const tier = finalScore >= 0.75 ? 'Implementation Support'
             : finalScore >= 0.50 ? 'Transformation Planning'
             : 'Strategic Assessment';

  const mockPercentile = finalScore > 0.6 ? 68 : 32;

  return {
    totalScore: finalScore,
    sectionScores,
    confidenceIntervals,
    peerBenchmark,
    explainability,
    score: finalScore,
    tier,
    ci,
    peerPercentile: mockPercentile,
    percentile: mockPercentile,
    confidence: { overall: ci, sections: confidenceIntervals },
  };
}
