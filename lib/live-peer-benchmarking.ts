// Live Peer Benchmarking and Comparative Analysis
export interface PeerInstitution {
  id: string;
  name: string;
  sector: string;
  size: string;
  geographic: string;
  overallScore: number;
  sectionScores: Record<string, number>;
  lastAssessmentDate: string;
  isAnonymized: boolean;
  similarityScore: number; // 0-1, how similar to target institution
}

export interface BenchmarkingCohort {
  targetInstitution: string;
  cohortSize: number;
  selectionCriteria: {
    sector: string;
    sizeRange: string[];
    geographic: string[];
    scoreRange: [number, number];
  };
  peers: PeerInstitution[];
  cohortStatistics: {
    averageScore: number;
    medianScore: number;
    standardDeviation: number;
    scoreDistribution: { range: string; count: number }[];
  };
  bestPractices: {
    topPerformers: PeerInstitution[];
    commonSuccessFactors: string[];
    improvementStrategies: string[];
  };
}

export interface CompetitiveIntelligence {
  marketPosition: {
    overall: { rank: number; percentile: number };
    bySection: Record<string, { rank: number; percentile: number }>;
  };
  gapAnalysis: {
    strengthsVsPeers: string[];
    improvementOpportunities: string[];
    competitiveAdvantages: string[];
  };
  benchmarkTargets: {
    aspirationalPeers: PeerInstitution[];
    achievableBenchmarks: Record<string, number>;
    stretchGoals: Record<string, number>;
  };
}

export class LivePeerBenchmarking {
  
  async findSimilarPeers(
    targetInstitution: any,
    maxCohortSize: number = 25,
    similarityThreshold: number = 0.7
  ): Promise<BenchmarkingCohort> {
    
    console.log(`Finding peer cohort for ${targetInstitution.name}`);

    // Multi-criteria peer selection
    const potentialPeers = await this.queryPeerDatabase(targetInstitution);
    const scoredPeers = this.calculateSimilarityScores(targetInstitution, potentialPeers);
    const selectedPeers = this.selectOptimalCohort(scoredPeers, maxCohortSize, similarityThreshold);

    const cohortStatistics = this.calculateCohortStatistics(selectedPeers);
    const bestPractices = await this.identifyBestPractices(selectedPeers);

    return {
      targetInstitution: targetInstitution.id,
      cohortSize: selectedPeers.length,
      selectionCriteria: {
        sector: targetInstitution.sector,
        sizeRange: [targetInstitution.size],
        geographic: [targetInstitution.geographic],
        scoreRange: [targetInstitution.score - 0.5, targetInstitution.score + 0.5]
      },
      peers: selectedPeers,
      cohortStatistics,
      bestPractices
    };
  }

  async generateCompetitiveIntelligence(
    targetInstitution: any,
    peerCohort: BenchmarkingCohort
  ): Promise<CompetitiveIntelligence> {

    const marketPosition = this.calculateMarketPosition(targetInstitution, peerCohort);
    const gapAnalysis = this.performGapAnalysis(targetInstitution, peerCohort);
    const benchmarkTargets = this.setBenchmarkTargets(targetInstitution, peerCohort);

    return {
      marketPosition,
      gapAnalysis,
      benchmarkTargets
    };
  }

  private async queryPeerDatabase(targetInstitution: any): Promise<PeerInstitution[]> {
    // In production, this would query your live assessment database
    // For now, we'll simulate with realistic peer data
    
    const query = `
      SELECT 
        institution_id,
        institution_name,
        sector,
        institution_size,
        geographic_location,
        overall_score,
        section_scores,
        last_assessment_date,
        opt_in_benchmarking
      FROM institution_assessments 
      WHERE sector = $1 
        AND institution_size IN ($2, $3)
        AND last_assessment_date > $4
        AND opt_in_benchmarking = true
        AND institution_id != $5
      ORDER BY last_assessment_date DESC
      LIMIT 100
    `;

    // Simulate database results
    return this.generateSimulatedPeers(targetInstitution);
  }

  private generateSimulatedPeers(targetInstitution: any): PeerInstitution[] {
    const peers: PeerInstitution[] = [];
    const sectorPeers = {
      higher_education: [
        'Regional State University', 'Community College System', 'Private Liberal Arts College',
        'Technical Institute', 'Research University', 'Urban Community College'
      ],
      healthcare: [
        'Regional Medical Center', 'Community Hospital', 'Specialty Care Center',
        'Rural Health System', 'Academic Medical Center', 'Rehabilitation Hospital'
      ],
      nonprofit: [
        'Community Foundation', 'Social Services Agency', 'Arts Organization',
        'Environmental Group', 'Youth Development Center', 'Senior Services'
      ]
    };

    const names = sectorPeers[targetInstitution.sector as keyof typeof sectorPeers] || sectorPeers.higher_education;
    
    names.forEach((name, index) => {
      const baseScore = targetInstitution.score + (Math.random() - 0.5) * 1.0;
      const sectionScores: Record<string, number> = {};
      
      Object.keys(targetInstitution.sectionScores || {}).forEach(section => {
        sectionScores[section] = Math.max(0, Math.min(5, baseScore + (Math.random() - 0.5) * 0.8));
      });

      peers.push({
        id: `peer_${index + 1}`,
        name: `${name} ${index + 1}`,
        sector: targetInstitution.sector,
        size: targetInstitution.size,
        geographic: Math.random() > 0.7 ? 'mixed' : targetInstitution.geographic,
        overallScore: Math.max(0, Math.min(5, baseScore)),
        sectionScores,
        lastAssessmentDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        isAnonymized: Math.random() > 0.3,
        similarityScore: 0 // Will be calculated
      });
    });

    return peers;
  }

  private calculateSimilarityScores(
    targetInstitution: any,
    potentialPeers: PeerInstitution[]
  ): PeerInstitution[] {
    
    return potentialPeers.map(peer => {
      let similarityScore = 0;
      let factors = 0;

      // Sector match (high weight)
      if (peer.sector === targetInstitution.sector) {
        similarityScore += 0.3;
      }
      factors++;

      // Size similarity
      if (peer.size === targetInstitution.size) {
        similarityScore += 0.2;
      }
      factors++;

      // Geographic similarity
      if (peer.geographic === targetInstitution.geographic || peer.geographic === 'mixed') {
        similarityScore += 0.15;
      }
      factors++;

      // Score similarity (closer scores = more similar)
      const scoreDiff = Math.abs(peer.overallScore - targetInstitution.score);
      const scoreSimiliarity = Math.max(0, 1 - (scoreDiff / 2)); // Normalize to 0-1
      similarityScore += scoreSimiliarity * 0.25;
      factors++;

      // Section score patterns similarity
      if (targetInstitution.sectionScores && peer.sectionScores) {
        const sectionSimilarity = this.calculateSectionSimilarity(
          targetInstitution.sectionScores,
          peer.sectionScores
        );
        similarityScore += sectionSimilarity * 0.1;
      }
      factors++;

      return {
        ...peer,
        similarityScore: similarityScore
      };
    });
  }

  private calculateSectionSimilarity(
    targetScores: Record<string, number>,
    peerScores: Record<string, number>
  ): number {
    const commonSections = Object.keys(targetScores).filter(section => 
      section in peerScores
    );

    if (commonSections.length === 0) return 0;

    const similarities = commonSections.map(section => {
      const diff = Math.abs(targetScores[section] - peerScores[section]);
      return Math.max(0, 1 - (diff / 5)); // Normalize to 0-1
    });

    return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }

  private selectOptimalCohort(
    scoredPeers: PeerInstitution[],
    maxSize: number,
    threshold: number
  ): PeerInstitution[] {
    
    // Filter by similarity threshold
    const qualifyingPeers = scoredPeers.filter(peer => 
      peer.similarityScore >= threshold
    );

    // Sort by similarity score (highest first)
    qualifyingPeers.sort((a, b) => b.similarityScore - a.similarityScore);

    // Ensure diversity in the cohort while maintaining similarity
    const selectedPeers: PeerInstitution[] = [];
    const usedGeographics = new Set<string>();
    const usedScoreRanges = new Set<string>();

    for (const peer of qualifyingPeers) {
      if (selectedPeers.length >= maxSize) break;

      const scoreRange = this.getScoreRange(peer.overallScore);
      
      // Prefer some diversity in geography and score ranges
      const geographicDiversity = !usedGeographics.has(peer.geographic) || usedGeographics.size < 3;
      const scoreDiversity = !usedScoreRanges.has(scoreRange) || usedScoreRanges.size < 4;

      if (geographicDiversity || scoreDiversity || selectedPeers.length < maxSize * 0.7) {
        selectedPeers.push(peer);
        usedGeographics.add(peer.geographic);
        usedScoreRanges.add(scoreRange);
      }
    }

    return selectedPeers;
  }

  private getScoreRange(score: number): string {
    if (score >= 4.0) return 'excellent';
    if (score >= 3.5) return 'strong';
    if (score >= 3.0) return 'good';
    if (score >= 2.5) return 'fair';
    return 'developing';
  }

  private calculateCohortStatistics(peers: PeerInstitution[]) {
    const scores = peers.map(p => p.overallScore);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const sortedScores = scores.sort((a, b) => a - b);
    const median = sortedScores[Math.floor(sortedScores.length / 2)];
    
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    const scoreDistribution = [
      { range: '4.0-5.0', count: scores.filter(s => s >= 4.0).length },
      { range: '3.5-3.9', count: scores.filter(s => s >= 3.5 && s < 4.0).length },
      { range: '3.0-3.4', count: scores.filter(s => s >= 3.0 && s < 3.5).length },
      { range: '2.5-2.9', count: scores.filter(s => s >= 2.5 && s < 3.0).length },
      { range: '0.0-2.4', count: scores.filter(s => s < 2.5).length }
    ];

    return {
      averageScore: average,
      medianScore: median,
      standardDeviation,
      scoreDistribution
    };
  }

  private async identifyBestPractices(peers: PeerInstitution[]) {
    // Identify top 25% performers
    const sortedPeers = peers.sort((a, b) => b.overallScore - a.overallScore);
    const topQuartileSize = Math.max(1, Math.floor(peers.length * 0.25));
    const topPerformers = sortedPeers.slice(0, topQuartileSize);

    // Analyze common success factors among top performers
    const successFactors = this.analyzeSuccessPatterns(topPerformers);
    const improvementStrategies = this.deriveImprovementStrategies(topPerformers, peers);

    return {
      topPerformers,
      commonSuccessFactors: successFactors,
      improvementStrategies
    };
  }

  private analyzeSuccessPatterns(topPerformers: PeerInstitution[]): string[] {
    // Analyze what top performers have in common
    const patterns = [
      'Strong governance frameworks with clear decision-making processes',
      'Consistent investment in technology infrastructure and training',
      'Proactive stakeholder engagement and communication strategies',
      'Data-driven decision making and performance monitoring',
      'Cultural emphasis on continuous improvement and innovation'
    ];

    return patterns;
  }

  private deriveImprovementStrategies(topPerformers: PeerInstitution[], allPeers: PeerInstitution[]): string[] {
    return [
      'Benchmark top performer practices in weakest assessment areas',
      'Implement systematic approach to organizational development',
      'Establish peer learning networks and collaboration opportunities',
      'Focus on incremental improvements in 2-3 priority areas',
      'Regular assessment and comparison with peer cohort progress'
    ];
  }

  private calculateMarketPosition(targetInstitution: any, cohort: BenchmarkingCohort) {
    const allScores = [targetInstitution.score, ...cohort.peers.map(p => p.overallScore)];
    allScores.sort((a, b) => b - a);
    
    const rank = allScores.indexOf(targetInstitution.score) + 1;
    const percentile = Math.round((1 - (rank - 1) / allScores.length) * 100);

    const bySection: Record<string, { rank: number; percentile: number }> = {};
    
    Object.keys(targetInstitution.sectionScores || {}).forEach(section => {
      const sectionScores = [
        targetInstitution.sectionScores[section],
        ...cohort.peers.map(p => p.sectionScores[section]).filter(Boolean)
      ].sort((a, b) => b - a);
      
      const sectionRank = sectionScores.indexOf(targetInstitution.sectionScores[section]) + 1;
      const sectionPercentile = Math.round((1 - (sectionRank - 1) / sectionScores.length) * 100);
      
      bySection[section] = { rank: sectionRank, percentile: sectionPercentile };
    });

    return {
      overall: { rank, percentile },
      bySection
    };
  }

  private performGapAnalysis(targetInstitution: any, cohort: BenchmarkingCohort) {
    const targetScore = targetInstitution.score;
    const cohortAverage = cohort.cohortStatistics.averageScore;
    const topPerformerAverage = cohort.bestPractices.topPerformers.reduce((sum, p) => sum + p.overallScore, 0) / cohort.bestPractices.topPerformers.length;

    const strengthsVsPeers = [];
    const improvementOpportunities = [];
    const competitiveAdvantages = [];

    if (targetScore > cohortAverage) {
      strengthsVsPeers.push(`Overall performance exceeds peer average by ${((targetScore - cohortAverage) * 100 / cohortAverage).toFixed(1)}%`);
    }

    if (targetScore < topPerformerAverage) {
      improvementOpportunities.push(`Gap to top quartile: ${(topPerformerAverage - targetScore).toFixed(2)} points`);
    }

    // Analyze section-level gaps
    Object.entries(targetInstitution.sectionScores || {}).forEach(([section, score]) => {
      const peerSectionScores = cohort.peers.map(p => p.sectionScores[section]).filter(Boolean);
      const sectionAverage = peerSectionScores.reduce((sum, s) => sum + s, 0) / peerSectionScores.length;
      const numScore = Number(score);
      
      if (numScore > sectionAverage + 0.3) {
        competitiveAdvantages.push(`${section}: Significantly above peer average`);
      } else if (numScore < sectionAverage - 0.3) {
        improvementOpportunities.push(`${section}: Below peer average - priority improvement area`);
      }
    });

    return {
      strengthsVsPeers,
      improvementOpportunities,
      competitiveAdvantages
    };
  }

  private setBenchmarkTargets(targetInstitution: any, cohort: BenchmarkingCohort) {
    const topPerformers = cohort.bestPractices.topPerformers.slice(0, 3);
    const cohortMedian = cohort.cohortStatistics.medianScore;
    const topQuartileScore = cohort.peers.sort((a, b) => b.overallScore - a.overallScore)[Math.floor(cohort.peers.length * 0.25)].overallScore;

    const achievableBenchmarks: Record<string, number> = {};
    const stretchGoals: Record<string, number> = {};

    // Set achievable targets (realistic improvement)
    achievableBenchmarks['Overall Score'] = Math.min(5.0, Math.max(targetInstitution.score + 0.3, cohortMedian));
    
    // Set stretch goals (aspirational)
    stretchGoals['Overall Score'] = Math.min(5.0, topQuartileScore);

    Object.entries(targetInstitution.sectionScores || {}).forEach(([section, score]) => {
      const peerSectionScores = cohort.peers.map(p => p.sectionScores[section]).filter(Boolean);
      const sectionMedian = peerSectionScores.sort((a, b) => a - b)[Math.floor(peerSectionScores.length / 2)];
      const sectionTopQuartile = peerSectionScores.sort((a, b) => b - a)[Math.floor(peerSectionScores.length * 0.25)];
      const numScore = Number(score);

      achievableBenchmarks[section] = Math.min(5.0, Math.max(numScore + 0.2, sectionMedian));
      stretchGoals[section] = Math.min(5.0, sectionTopQuartile);
    });

    return {
      aspirationalPeers: topPerformers,
      achievableBenchmarks,
      stretchGoals
    };
  }

  async generatePeerBenchmarkingAI(
    targetInstitution: any,
    cohort: BenchmarkingCohort,
    competitiveIntel: CompetitiveIntelligence
  ): Promise<string> {
    return `
    LIVE PEER BENCHMARKING ANALYSIS:
    
    Peer Cohort Overview:
    - Cohort Size: ${cohort.cohortSize} similar institutions
    - Your Market Position: ${competitiveIntel.marketPosition.overall.rank} of ${cohort.cohortSize + 1} (${competitiveIntel.marketPosition.overall.percentile}th percentile)
    - Cohort Average: ${cohort.cohortStatistics.averageScore.toFixed(2)}/5.0
    - Your Score: ${targetInstitution.score}/5.0

    Competitive Advantages:
    ${competitiveIntel.gapAnalysis.competitiveAdvantages.map(adv => `- ${adv}`).join('\n')}

    Priority Improvement Areas:
    ${competitiveIntel.gapAnalysis.improvementOpportunities.slice(0, 3).map(opp => `- ${opp}`).join('\n')}

    Peer-Informed Benchmarks:
    Achievable Targets (6-12 months):
    ${Object.entries(competitiveIntel.benchmarkTargets.achievableBenchmarks).slice(0, 4).map(([area, target]) => `- ${area}: ${(target as number).toFixed(2)}/5.0`).join('\n')}

    Aspirational Goals (1-2 years):
    ${Object.entries(competitiveIntel.benchmarkTargets.stretchGoals).slice(0, 4).map(([area, target]) => `- ${area}: ${(target as number).toFixed(2)}/5.0`).join('\n')}

    Best Practice Insights from Top Performers:
    ${cohort.bestPractices.commonSuccessFactors.slice(0, 3).map(factor => `- ${factor}`).join('\n')}
    
    Strategic Recommendations Based on Peer Analysis:
    ${cohort.bestPractices.improvementStrategies.slice(0, 3).map(strategy => `- ${strategy}`).join('\n')}
    `;
  }
}
