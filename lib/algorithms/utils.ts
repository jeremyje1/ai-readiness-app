/**
 * Algorithm Utilities - Enterprise Suite
 * Shared utility functions for NorthPath Strategies organizational algorithms
 * 
 * This module provides common utilities for algorithm calculations, data processing,
 * scoring functions, and validation across the enterprise algorithm suite.
 * 
 * @version 2.1.0
 * @author NorthPath Strategies
 * @enterprise true
 */

// Core Utility Types
export interface AlgorithmConfig {
  version: string;
  weights: Record<string, number>;
  thresholds: Record<string, number>;
  parameters: Record<string, any>;
}

export interface ScoreMetrics {
  score: number;
  confidence: number;
  percentile: number;
  variance: number;
  reliability: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataQuality: number;
}

export interface WeightedScoreInput {
  value: number;
  weight: number;
}

/**
 * Calculate weighted score from multiple inputs
 * @param inputs Array of value-weight pairs
 * @returns Weighted average score (0-1)
 */
export function calculateWeightedScore(inputs: WeightedScoreInput[]): number {
  if (inputs.length === 0) return 0;
  
  let totalWeightedValue = 0;
  let totalWeight = 0;
  
  for (const input of inputs) {
    totalWeightedValue += input.value * input.weight;
    totalWeight += input.weight;
  }
  
  return totalWeight > 0 ? totalWeightedValue / totalWeight : 0;
}

/**
 * Normalize score to 0-1 range
 * @param value Raw score value
 * @param min Minimum possible value
 * @param max Maximum possible value
 * @returns Normalized score (0-1)
 */
export function normalizeScore(value: number, min: number = 0, max: number = 5): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calculate percentile rank for a score within a distribution
 * @param score Target score
 * @param distribution Array of comparison scores
 * @returns Percentile rank (0-100)
 */
export function calculatePercentileRank(score: number, distribution: number[]): number {
  if (distribution.length === 0) return 50;
  
  const sortedDistribution = distribution.sort((a, b) => a - b);
  const lowerCount = sortedDistribution.filter(s => s < score).length;
  const equalCount = sortedDistribution.filter(s => s === score).length;
  
  // Use midpoint method for percentile calculation
  const percentile = ((lowerCount + equalCount / 2) / sortedDistribution.length) * 100;
  return Math.max(0, Math.min(100, percentile));
}

/**
 * Aggregate multiple metrics into a composite score
 * @param metrics Array of individual metric scores
 * @param weights Optional weights for each metric (defaults to equal weights)
 * @returns Aggregated composite score
 */
export function aggregateMetrics(metrics: number[], weights?: number[]): ScoreMetrics {
  if (metrics.length === 0) {
    return {
      score: 0,
      confidence: 0,
      percentile: 0,
      variance: 0,
      reliability: 0
    };
  }
  
  // Use equal weights if not provided
  const actualWeights = weights || Array(metrics.length).fill(1 / metrics.length);
  
  // Calculate weighted score
  const score = calculateWeightedScore(
    metrics.map((metric, index) => ({ value: metric, weight: actualWeights[index] }))
  );
  
  // Calculate variance and confidence metrics
  const mean = metrics.reduce((sum, metric) => sum + metric, 0) / metrics.length;
  const variance = metrics.reduce((sum, metric) => sum + Math.pow(metric - mean, 2), 0) / metrics.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Confidence decreases with higher variance
  const confidence = Math.max(0, 1 - (standardDeviation / Math.max(mean, 0.1)));
  
  // Reliability based on consistency of metrics
  const reliability = 1 - (standardDeviation / (mean + 0.1));
  
  return {
    score,
    confidence,
    percentile: 50, // Default percentile, should be calculated against benchmark
    variance,
    reliability: Math.max(0, Math.min(1, reliability))
  };
}

/**
 * Generate insights from algorithm results
 * @param scores Algorithm output scores
 * @param thresholds Performance thresholds
 * @param benchmarks Industry benchmark data
 * @returns Array of insight strings
 */
export function generateInsights(
  scores: Record<string, number>,
  thresholds: Record<string, number>,
  benchmarks?: Record<string, number>
): string[] {
  const insights: string[] = [];
  
  // Identify strengths and weaknesses
  for (const [metric, score] of Object.entries(scores)) {
    const threshold = thresholds[metric];
    const benchmark = benchmarks?.[metric];
    
    if (threshold) {
      if (score >= threshold * 1.2) {
        insights.push(`Strong performance in ${metric} (${(score * 100).toFixed(1)}%)`);
      } else if (score < threshold * 0.8) {
        insights.push(`Improvement opportunity in ${metric} (${(score * 100).toFixed(1)}%)`);
      }
    }
    
    if (benchmark) {
      const variance = score - benchmark;
      if (Math.abs(variance) > 0.1) {
        const direction = variance > 0 ? 'above' : 'below';
        insights.push(`${metric} is ${Math.abs(variance * 100).toFixed(1)}% ${direction} industry benchmark`);
      }
    }
  }
  
  return insights;
}

/**
 * Validate assessment data quality and completeness
 * @param data Assessment data to validate
 * @returns Validation result with errors and warnings
 */
export function validateAssessmentData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required fields
  if (!data) {
    errors.push('Assessment data is missing');
    return { isValid: false, errors, warnings, dataQuality: 0 };
  }
  
  if (!data.responses || !Array.isArray(data.responses)) {
    errors.push('Assessment responses are missing or invalid');
  }
  
  if (!data.organizationId) {
    warnings.push('Organization ID is missing');
  }
  
  if (!data.timestamp) {
    warnings.push('Assessment timestamp is missing');
  }
  
  // Check response data quality
  let validResponses = 0;
  let totalResponses = 0;
  
  if (data.responses && Array.isArray(data.responses)) {
    totalResponses = data.responses.length;
    
    for (const response of data.responses) {
      if (response.question && (response.value !== undefined && response.value !== null)) {
        validResponses++;
      } else {
        warnings.push(`Invalid response: ${JSON.stringify(response)}`);
      }
      
      // Check for reasonable value ranges
      if (typeof response.value === 'number') {
        if (response.value < 1 || response.value > 5) {
          warnings.push(`Response value out of expected range (1-5): ${response.value}`);
        }
      }
    }
  }
  
  // Calculate data quality score
  const dataQuality = totalResponses > 0 ? validResponses / totalResponses : 0;
  
  if (dataQuality < 0.7) {
    warnings.push(`Low data quality: ${(dataQuality * 100).toFixed(1)}% valid responses`);
  }
  
  const isValid = errors.length === 0 && dataQuality >= 0.5;
  
  return {
    isValid,
    errors,
    warnings,
    dataQuality
  };
}

/**
 * Calculate confidence interval for a score
 * @param score Primary score value
 * @param sampleSize Number of data points
 * @param standardError Standard error of measurement
 * @param confidenceLevel Confidence level (default 95%)
 * @returns Confidence interval bounds
 */
export function calculateConfidenceInterval(
  score: number,
  sampleSize: number,
  standardError: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number; margin: number } {
  // Z-score for confidence levels
  const zScores = {
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };
  
  const zScore = zScores[confidenceLevel as keyof typeof zScores] || 1.96;
  const margin = zScore * standardError / Math.sqrt(sampleSize);
  
  return {
    lower: Math.max(0, score - margin),
    upper: Math.min(1, score + margin),
    margin
  };
}

/**
 * Calculate correlation between two score arrays
 * @param scores1 First score array
 * @param scores2 Second score array
 * @returns Pearson correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(scores1: number[], scores2: number[]): number {
  if (scores1.length !== scores2.length || scores1.length === 0) {
    return 0;
  }
  
  const n = scores1.length;
  const mean1 = scores1.reduce((sum, score) => sum + score, 0) / n;
  const mean2 = scores2.reduce((sum, score) => sum + score, 0) / n;
  
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = scores1[i] - mean1;
    const diff2 = scores2[i] - mean2;
    
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(denominator1 * denominator2);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Apply statistical smoothing to reduce noise in scores
 * @param scores Array of scores
 * @param windowSize Smoothing window size
 * @returns Smoothed scores
 */
export function applySmoothingFilter(scores: number[], windowSize: number = 3): number[] {
  if (scores.length <= windowSize) return [...scores];
  
  const smoothed: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < scores.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(scores.length, i + halfWindow + 1);
    const window = scores.slice(start, end);
    const average = window.reduce((sum, score) => sum + score, 0) / window.length;
    smoothed.push(average);
  }
  
  return smoothed;
}

/**
 * Generate algorithm performance metrics
 * @param predicted Predicted scores
 * @param actual Actual scores
 * @returns Performance metrics object
 */
export function calculateAlgorithmPerformance(
  predicted: number[],
  actual: number[]
): {
  accuracy: number;
  meanSquaredError: number;
  meanAbsoluteError: number;
  r2Score: number;
} {
  if (predicted.length !== actual.length || predicted.length === 0) {
    return { accuracy: 0, meanSquaredError: 1, meanAbsoluteError: 1, r2Score: 0 };
  }
  
  const n = predicted.length;
  
  // Calculate Mean Squared Error
  const mse = predicted.reduce((sum, pred, i) => {
    return sum + Math.pow(pred - actual[i], 2);
  }, 0) / n;
  
  // Calculate Mean Absolute Error
  const mae = predicted.reduce((sum, pred, i) => {
    return sum + Math.abs(pred - actual[i]);
  }, 0) / n;
  
  // Calculate R² Score
  const actualMean = actual.reduce((sum, val) => sum + val, 0) / n;
  const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
  const residualSumSquares = predicted.reduce((sum, pred, i) => {
    return sum + Math.pow(actual[i] - pred, 2);
  }, 0);
  
  const r2 = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
  
  // Calculate accuracy as inverse of normalized error
  const accuracy = Math.max(0, 1 - mae);
  
  return {
    accuracy,
    meanSquaredError: mse,
    meanAbsoluteError: mae,
    r2Score: r2
  };
}

/**
 * Create a benchmark comparison report
 * @param scores Current organization scores
 * @param benchmarks Industry benchmark scores
 * @returns Comparison report with gaps and recommendations
 */
export function createBenchmarkComparison(
  scores: Record<string, number>,
  benchmarks: Record<string, number>
): {
  gaps: Record<string, number>;
  ranking: 'below' | 'at' | 'above';
  recommendations: string[];
} {
  const gaps: Record<string, number> = {};
  let totalGap = 0;
  let metricCount = 0;
  
  // Calculate gaps for each metric
  for (const [metric, score] of Object.entries(scores)) {
    if (benchmarks[metric] !== undefined) {
      gaps[metric] = score - benchmarks[metric];
      totalGap += gaps[metric];
      metricCount++;
    }
  }
  
  // Determine overall ranking
  const averageGap = metricCount > 0 ? totalGap / metricCount : 0;
  let ranking: 'below' | 'at' | 'above';
  
  if (averageGap > 0.05) ranking = 'above';
  else if (averageGap < -0.05) ranking = 'below';
  else ranking = 'at';
  
  // Generate recommendations based on gaps
  const recommendations: string[] = [];
  
  for (const [metric, gap] of Object.entries(gaps)) {
    if (gap < -0.1) {
      recommendations.push(`Focus on improving ${metric} - significant gap below benchmark`);
    } else if (gap > 0.1) {
      recommendations.push(`Leverage strength in ${metric} - significantly above benchmark`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance is generally aligned with industry benchmarks');
  }
  
  return { gaps, ranking, recommendations };
}
