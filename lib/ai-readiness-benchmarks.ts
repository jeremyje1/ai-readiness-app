/**
 * AI Readiness Benchmarking System
 * Provides peer comparison and industry benchmarking capabilities
 */

import { AI_DOMAINS, AI_TIERS } from './ai-readiness-questions';

export interface BenchmarkData {
  institutionSize: 'small' | 'medium' | 'large' | 'very-large';
  institutionType: 'community-college' | 'public-university' | 'private-university' | 'research-institution';
  location: string;
  studentCount?: number;
}

export interface BenchmarkResults {
  overallPercentile: number;
  domainPercentiles: Record<string, number>;
  peerComparison: {
    averageScore: number;
    topPerformer: number;
    institutionCount: number;
  };
  industryComparison: {
    higherEdAverage: number;
    sectorLeader: number;
    nationalAverage: number;
  };
  recommendations: string[];
  improvementAreas: Array<{
    domain: string;
    currentScore: number;
    peerAverage: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export class AIReadinessBenchmarkEngine {
  
  /**
   * Generate benchmark analysis for an institution
   */
  static generateBenchmarkAnalysis(
    scores: Record<string, number>,
    institutionData: BenchmarkData,
    tier: string
  ): BenchmarkResults {
    
    const overallScore = this.calculateOverallScore(scores);
    
    // Get peer institutions data (mock data - replace with actual database)
    const peerData = this.getPeerInstitutions(institutionData);
    const industryData = this.getIndustryAverages(institutionData.institutionType);
    
    // Calculate percentiles
    const overallPercentile = this.calculatePercentile(overallScore, peerData.scores);
    const domainPercentiles = this.calculateDomainPercentiles(scores, peerData.domainScores);
    
    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(scores, peerData.domainAverages);
    
    // Generate recommendations
    const recommendations = this.generateBenchmarkRecommendations(
      improvementAreas,
      tier,
      institutionData
    );
    
    return {
      overallPercentile,
      domainPercentiles,
      peerComparison: {
        averageScore: peerData.averageScore,
        topPerformer: peerData.topScore,
        institutionCount: peerData.count
      },
      industryComparison: {
        higherEdAverage: industryData.average,
        sectorLeader: industryData.leader,
        nationalAverage: industryData.national
      },
      recommendations,
      improvementAreas
    };
  }
  
  /**
   * Get peer institutions based on institution characteristics
   */
  private static getPeerInstitutions(institutionData: BenchmarkData) {
    // Mock data - replace with actual database queries
    const peerProfiles = {
      'community-college': {
        scores: [45, 52, 48, 61, 55, 43, 58, 49, 53, 47],
        domainScores: {
          'ai_strategy': [48, 52, 45, 58, 51],
          'pedagogical_integration': [42, 49, 46, 55, 48],
          'technology_infrastructure': [51, 58, 52, 63, 56],
          'organizational_readiness': [46, 53, 49, 59, 52],
          'compliance_risk': [44, 50, 47, 57, 49]
        }
      },
      'public-university': {
        scores: [58, 65, 61, 74, 68, 56, 71, 62, 66, 60],
        domainScores: {
          'ai_strategy': [61, 68, 58, 75, 64],
          'pedagogical_integration': [55, 62, 59, 71, 65],
          'technology_infrastructure': [64, 71, 65, 78, 69],
          'organizational_readiness': [59, 66, 62, 73, 67],
          'compliance_risk': [57, 64, 61, 72, 66]
        }
      },
      'private-university': {
        scores: [62, 69, 65, 78, 72, 60, 75, 66, 70, 64],
        domainScores: {
          'ai_strategy': [65, 72, 62, 79, 68],
          'pedagogical_integration': [59, 66, 63, 75, 69],
          'technology_infrastructure': [68, 75, 69, 82, 73],
          'organizational_readiness': [63, 70, 66, 77, 71],
          'compliance_risk': [61, 68, 65, 76, 70]
        }
      },
      'research-institution': {
        scores: [71, 78, 74, 87, 81, 69, 84, 75, 79, 73],
        domainScores: {
          'ai_strategy': [74, 81, 71, 88, 77],
          'pedagogical_integration': [68, 75, 72, 84, 78],
          'technology_infrastructure': [77, 84, 78, 91, 82],
          'organizational_readiness': [72, 79, 75, 86, 80],
          'compliance_risk': [70, 77, 74, 85, 79]
        }
      }
    };
    
    const profile = peerProfiles[institutionData.institutionType] || peerProfiles['public-university'];
    
    return {
      scores: profile.scores,
      domainScores: profile.domainScores,
      domainAverages: Object.entries(profile.domainScores).reduce((acc, [domain, scores]) => {
        acc[domain] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return acc;
      }, {} as Record<string, number>),
      averageScore: profile.scores.reduce((sum, score) => sum + score, 0) / profile.scores.length,
      topScore: Math.max(...profile.scores),
      count: profile.scores.length
    };
  }
  
  /**
   * Get industry averages
   */
  private static getIndustryAverages(institutionType: string) {
    const industryData = {
      'community-college': { average: 51, leader: 78, national: 49 },
      'public-university': { average: 64, leader: 85, national: 62 },
      'private-university': { average: 68, leader: 88, national: 66 },
      'research-institution': { average: 77, leader: 92, national: 75 }
    };
    
    return industryData[institutionType as keyof typeof industryData] || industryData['public-university'];
  }
  
  /**
   * Calculate overall score from domain scores
   */
  private static calculateOverallScore(scores: Record<string, number>): number {
    const domainWeights = Object.values(AI_DOMAINS).reduce((acc, domain) => {
      acc[domain.name] = domain.weight;
      return acc;
    }, {} as Record<string, number>);
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(scores).forEach(([domain, score]) => {
      const weight = domainWeights[domain] || 0.2; // Default weight
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }
  
  /**
   * Calculate percentile ranking
   */
  private static calculatePercentile(score: number, peerScores: number[]): number {
    const sortedScores = [...peerScores].sort((a, b) => a - b);
    const rank = sortedScores.filter(s => s <= score).length;
    return Math.round((rank / sortedScores.length) * 100);
  }
  
  /**
   * Calculate domain percentiles
   */
  private static calculateDomainPercentiles(
    scores: Record<string, number>,
    peerDomainScores: Record<string, number[]>
  ): Record<string, number> {
    const percentiles: Record<string, number> = {};
    
    Object.entries(scores).forEach(([domain, score]) => {
      const peerScores = peerDomainScores[domain] || [];
      if (peerScores.length > 0) {
        percentiles[domain] = this.calculatePercentile(score, peerScores);
      }
    });
    
    return percentiles;
  }
  
  /**
   * Identify areas needing improvement compared to peers
   */
  private static identifyImprovementAreas(
    scores: Record<string, number>,
    peerAverages: Record<string, number>
  ) {
    const improvementAreas: Array<{
      domain: string;
      currentScore: number;
      peerAverage: number;
      gap: number;
      priority: 'high' | 'medium' | 'low';
    }> = [];
    
    Object.entries(scores).forEach(([domain, score]) => {
      const peerAverage = peerAverages[domain];
      if (peerAverage && score < peerAverage) {
        const gap = peerAverage - score;
        let priority: 'high' | 'medium' | 'low' = 'low';
        
        if (gap >= 15) priority = 'high';
        else if (gap >= 8) priority = 'medium';
        
        improvementAreas.push({
          domain,
          currentScore: score,
          peerAverage,
          gap,
          priority
        });
      }
    });
    
    return improvementAreas.sort((a, b) => b.gap - a.gap);
  }
  
  /**
   * Generate benchmark-based recommendations
   */
  private static generateBenchmarkRecommendations(
    improvementAreas: any[],
    tier: string,
    institutionData: BenchmarkData
  ): string[] {
    const recommendations: string[] = [];
    
    // High priority improvements
    const highPriorityAreas = improvementAreas.filter(area => area.priority === 'high');
    if (highPriorityAreas.length > 0) {
      recommendations.push(
        `Focus immediately on ${highPriorityAreas[0].domain} - you're ${highPriorityAreas[0].gap} points below peer average`
      );
    }
    
    // Institution type specific recommendations
    const typeRecommendations = {
      'community-college': [
        'Consider forming partnerships with 4-year institutions for AI resource sharing',
        'Focus on workforce development AI applications relevant to your community',
        'Leverage state and federal funding opportunities for technology infrastructure'
      ],
      'public-university': [
        'Explore inter-campus AI initiatives and resource sharing',
        'Align AI strategy with state higher education technology plans',
        'Consider public-private partnerships for AI implementation'
      ],
      'private-university': [
        'Leverage alumni networks for AI expertise and funding',
        'Position AI capabilities as competitive differentiators',
        'Consider selective high-impact AI implementations'
      ],
      'research-institution': [
        'Leverage existing research capabilities for AI development',
        'Create faculty-led AI innovation committees',
        'Explore AI research commercialization opportunities'
      ]
    };
    
    const specificRecs = typeRecommendations[institutionData.institutionType] || [];
    recommendations.push(...specificRecs.slice(0, 2));
    
    // Tier-specific recommendations
    if (tier === 'comprehensive' || tier === 'transformation') {
      recommendations.push('Consider advanced AI pilot programs in your strongest domains');
      recommendations.push('Develop cross-institutional AI learning communities');
    }
    
    return recommendations.slice(0, 5);
  }
  
  /**
   * Generate peer comparison report
   */
  static generatePeerComparisonReport(
    institutionData: BenchmarkData,
    benchmarkResults: BenchmarkResults
  ): string {
    const institutionTypeLabel = institutionData.institutionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `
## Peer Institution Comparison

Your institution ranks in the **${benchmarkResults.overallPercentile}th percentile** among similar ${institutionTypeLabel} institutions.

### Key Statistics:
- **Peer Average**: ${benchmarkResults.peerComparison.averageScore}%
- **Top Performer**: ${benchmarkResults.peerComparison.topPerformer}%
- **Comparison Pool**: ${benchmarkResults.peerComparison.institutionCount} similar institutions
- **Industry Average**: ${benchmarkResults.industryComparison.higherEdAverage}%

### Performance vs Peers:
${Object.entries(benchmarkResults.domainPercentiles).map(([domain, percentile]) => 
  `- **${domain}**: ${percentile}th percentile`
).join('\n')}

### Priority Improvement Areas:
${benchmarkResults.improvementAreas.slice(0, 3).map((area, index) => 
  `${index + 1}. **${area.domain}**: ${area.gap} point gap (${area.priority} priority)`
).join('\n')}
    `;
  }
}
