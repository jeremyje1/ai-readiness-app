// Historical Trend Analysis Engine
export interface HistoricalDataPoint {
  assessmentId: string;
  institutionId: string;
  timestamp: string;
  overallScore: number;
  sectionScores: Record<string, number>;
  tier: string;
  recommendations: string[];
  implementationStatus?: 'not_started' | 'in_progress' | 'completed';
}

export interface TrendAnalysis {
  overallTrend: {
    direction: 'improving' | 'declining' | 'stable';
    rate: number; // percentage change over time
    significance: 'high' | 'medium' | 'low';
  };
  sectionTrends: Record<string, {
    direction: 'improving' | 'declining' | 'stable';
    rate: number;
    ranking: number; // 1 = most improved, higher = less improved
  }>;
  milestones: {
    achievements: string[];
    setbacks: string[];
    keyDates: { date: string; event: string; impact: number }[];
  };
  predictiveInsights: {
    projectedScore6Months: number;
    projectedScore12Months: number;
    riskFactors: string[];
    opportunityAreas: string[];
  };
}

export class HistoricalTrendAnalyzer {
  
  async getInstitutionHistory(institutionId: string, timeframe: '6m' | '1y' | '2y' | 'all'): Promise<HistoricalDataPoint[]> {
    // In production, this would query your database
    const cutoffDate = this.calculateCutoffDate(timeframe);
    
    // Query historical assessments
    const query = `
      SELECT 
        assessment_id,
        institution_id,
        created_at,
        overall_score,
        section_scores,
        tier,
        recommendations,
        implementation_status
      FROM assessments 
      WHERE institution_id = $1 
        AND created_at >= $2 
      ORDER BY created_at DESC
    `;
    
    // This would be actual database call
    // const results = await db.query(query, [institutionId, cutoffDate]);
    // return results.rows;
    
    // Mock data for now
    return this.generateMockHistoricalData(institutionId, timeframe);
  }

  async analyzeTrends(institutionId: string, timeframe: '6m' | '1y' | '2y' | 'all' = '1y'): Promise<TrendAnalysis> {
    const historicalData = await this.getInstitutionHistory(institutionId, timeframe);
    
    if (historicalData.length < 2) {
      return this.generateFirstTimeAnalysis();
    }

    const overallTrend = this.calculateOverallTrend(historicalData);
    const sectionTrends = this.calculateSectionTrends(historicalData);
    const milestones = this.identifyMilestones(historicalData);
    const predictiveInsights = this.generatePredictiveInsights(historicalData);

    return {
      overallTrend,
      sectionTrends,
      milestones,
      predictiveInsights
    };
  }

  async generateHistoricalAIInsights(institutionId: string, currentAnalysis: any): Promise<string> {
    const trendAnalysis = await this.analyzeTrends(institutionId);
    
    return `
    LONGITUDINAL PERFORMANCE ANALYSIS:
    
    Overall Trajectory: ${trendAnalysis.overallTrend.direction} at ${trendAnalysis.overallTrend.rate}% annually
    
    Historical Performance Patterns:
    - Most Improved Areas: ${Object.entries(trendAnalysis.sectionTrends)
      .sort(([,a], [,b]) => a.ranking - b.ranking)
      .slice(0, 3)
      .map(([section, data]) => `${section} (+${data.rate}%)`)
      .join(', ')}
    
    Key Achievements: ${trendAnalysis.milestones.achievements.join(', ')}
    
    Predictive Projections:
    - 6-month outlook: ${trendAnalysis.predictiveInsights.projectedScore6Months}/5.0
    - 12-month outlook: ${trendAnalysis.predictiveInsights.projectedScore12Months}/5.0
    
    Strategic Continuity Assessment:
    Based on your organization's historical performance trajectory, we recommend...
    `;
  }

  private calculateOverallTrend(data: HistoricalDataPoint[]): TrendAnalysis['overallTrend'] {
    const scores = data.map(d => d.overallScore);
    const timePoints = data.map(d => new Date(d.timestamp).getTime());
    
    // Linear regression for trend
    const slope = this.calculateSlope(timePoints, scores);
    const annualizedRate = (slope * 365 * 24 * 60 * 60 * 1000) / (scores[0] || 1) * 100;
    
    return {
      direction: slope > 0.01 ? 'improving' : slope < -0.01 ? 'declining' : 'stable',
      rate: Math.abs(annualizedRate),
      significance: Math.abs(annualizedRate) > 5 ? 'high' : Math.abs(annualizedRate) > 2 ? 'medium' : 'low'
    };
  }

  private calculateSectionTrends(data: HistoricalDataPoint[]): TrendAnalysis['sectionTrends'] {
    const sections = new Set<string>();
    data.forEach(d => Object.keys(d.sectionScores).forEach(s => sections.add(s)));
    
    const trends: Record<string, any> = {};
    
    sections.forEach(section => {
      const sectionScores = data
        .map(d => d.sectionScores[section])
        .filter(score => score !== undefined);
      
      if (sectionScores.length >= 2) {
        const slope = this.calculateSlope(
          data.map(d => new Date(d.timestamp).getTime()),
          sectionScores
        );
        const rate = slope * 100; // Convert to percentage
        
        trends[section] = {
          direction: slope > 0.01 ? 'improving' : slope < -0.01 ? 'declining' : 'stable',
          rate: Math.abs(rate),
          ranking: 0 // Will be calculated after all trends are computed
        };
      }
    });

    // Assign rankings
    const sortedTrends = Object.entries(trends)
      .sort(([,a], [,b]) => (b as any).rate - (a as any).rate);
    
    sortedTrends.forEach(([section], index) => {
      trends[section].ranking = index + 1;
    });

    return trends;
  }

  private calculateSlope(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private identifyMilestones(data: HistoricalDataPoint[]): TrendAnalysis['milestones'] {
    // Identify significant improvements and setbacks
    const achievements: string[] = [];
    const setbacks: string[] = [];
    const keyDates: { date: string; event: string; impact: number }[] = [];

    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      const scoreDiff = current.overallScore - previous.overallScore;

      if (scoreDiff > 0.3) {
        achievements.push(`Significant improvement in ${current.timestamp.split('T')[0]} (+${(scoreDiff * 100).toFixed(1)}%)`);
        keyDates.push({
          date: current.timestamp,
          event: 'Major Performance Improvement',
          impact: scoreDiff
        });
      } else if (scoreDiff < -0.2) {
        setbacks.push(`Performance decline in ${current.timestamp.split('T')[0]} (${(scoreDiff * 100).toFixed(1)}%)`);
        keyDates.push({
          date: current.timestamp,
          event: 'Performance Setback',
          impact: scoreDiff
        });
      }
    }

    return { achievements, setbacks, keyDates };
  }

  private generatePredictiveInsights(data: HistoricalDataPoint[]): TrendAnalysis['predictiveInsights'] {
    const recentScores = data.slice(0, 3).map(d => d.overallScore);
    const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    
    // Simple trend projection
    const trend = data.length > 1 ? 
      (data[0].overallScore - data[data.length - 1].overallScore) / (data.length - 1) : 0;

    return {
      projectedScore6Months: Math.max(0, Math.min(5, averageScore + trend * 2)),
      projectedScore12Months: Math.max(0, Math.min(5, averageScore + trend * 4)),
      riskFactors: this.identifyRiskFactors(data),
      opportunityAreas: this.identifyOpportunities(data)
    };
  }

  private identifyRiskFactors(data: HistoricalDataPoint[]): string[] {
    const risks: string[] = [];
    
    // Analyze patterns
    const recentDeclines = data.slice(0, 2).reduce((count, d, i) => {
      if (i > 0 && d.overallScore < data[i - 1].overallScore) count++;
      return count;
    }, 0);

    if (recentDeclines >= 1) {
      risks.push('Recent performance decline trend');
    }

    return risks;
  }

  private identifyOpportunities(data: HistoricalDataPoint[]): string[] {
    const opportunities: string[] = [];
    
    // Find consistently underperforming but stable areas
    const sectionPerformance = this.calculateSectionTrends(data);
    
    Object.entries(sectionPerformance).forEach(([section, trend]) => {
      if (trend.direction === 'stable' && trend.ranking > 5) {
        opportunities.push(`${section} shows stability and potential for targeted improvement`);
      }
    });

    return opportunities;
  }

  private calculateCutoffDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '6m': return new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case '2y': return new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      default: return new Date('2020-01-01');
    }
  }

  private generateMockHistoricalData(institutionId: string, timeframe: string): HistoricalDataPoint[] {
    // Mock data for demonstration
    return [];
  }

  private generateFirstTimeAnalysis(): TrendAnalysis {
    return {
      overallTrend: { direction: 'stable', rate: 0, significance: 'low' },
      sectionTrends: {},
      milestones: { achievements: [], setbacks: [], keyDates: [] },
      predictiveInsights: {
        projectedScore6Months: 0,
        projectedScore12Months: 0,
        riskFactors: ['No historical data available for trend analysis'],
        opportunityAreas: ['Establish baseline metrics for future comparison']
      }
    };
  }
}
