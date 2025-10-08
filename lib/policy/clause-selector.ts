/**
 * Policy Clause Selection Engine
 * Intelligent clause selection based on context and requirements
 * @version 1.0.0
 */

import { CLAUSE_WEIGHTS, POLICY_CLAUSES } from './templates'
import {
  ClauseSelectionInput,
  PolicyClause,
  RiskLevel,
  SelectedClause,
  ToolUseMode
} from './types'

export class ClauseSelector {
  private clauses: PolicyClause[]
  private weights: typeof CLAUSE_WEIGHTS

  constructor() {
    this.clauses = POLICY_CLAUSES
    this.weights = CLAUSE_WEIGHTS
  }

  /**
   * Select appropriate clauses based on input criteria
   */
  async selectClauses(input: ClauseSelectionInput): Promise<SelectedClause[]> {
    console.log('Selecting clauses for:', input)

    // Filter clauses by audience and jurisdiction
    const candidateClauses = this.clauses.filter(clause => {
      // Audience filter
      if (clause.audience && !clause.audience.includes(input.audience)) {
        return false
      }

      // Jurisdiction filter
      if (input.jurisdiction && clause.jurisdictions &&
        !clause.jurisdictions.includes(input.jurisdiction)) {
        return false
      }

      // Tool use mode filter
      if (clause.toolUseModes && !clause.toolUseModes.includes(input.toolUseMode)) {
        return false
      }

      return true
    })

    // Calculate scores for each clause
    const scoredClauses = candidateClauses.map(clause => {
      const score = this.calculateClauseScore(clause, input)
      return {
        clause,
        score,
        reasons: this.generateSelectionReasons(clause, input, score)
      }
    })

    // Sort by score descending
    scoredClauses.sort((a, b) => b.score - a.score)

    // Apply dependencies and conflicts
    const selectedClauses = this.resolveDependenciesAndConflicts(scoredClauses, input)

    // Apply manual overrides
    const finalClauses = this.applyManualOverrides(selectedClauses, input)

    return finalClauses.map((item, index) => ({
      ...item.clause,
      selected: true,
      reason: item.reasons.join('; '),
      priority: index + 1
    }))
  }

  /**
   * Calculate relevance score for a clause based on input parameters
   */
  private calculateClauseScore(clause: PolicyClause, input: ClauseSelectionInput): number {
    let score = 0.5 // Base score

    // Risk level alignment
    const riskScore = this.getRiskScore(clause, input.riskProfile)
    score += riskScore * 0.3

    // Tool use mode alignment
    const toolModeScore = this.getToolModeScore(clause, input.toolUseMode)
    score += toolModeScore * 0.25

    // Audience specificity bonus
    if (clause.audience?.includes(input.audience)) {
      score += 0.2
    }

    // Tag matching
    const tagScore = this.getTagScore(clause, input)
    score += tagScore * 0.15

    // State/jurisdiction specificity
    if (input.state && clause.jurisdictions?.includes(input.state)) {
      score += 0.1
    }

    return Math.min(score, 1.0)
  }

  /**
   * Calculate risk-based scoring
   */
  private getRiskScore(clause: PolicyClause, riskProfile: RiskLevel): number {
    const riskLevels = ['low', 'medium', 'high', 'critical']
    const clauseRiskIndex = riskLevels.indexOf(clause.riskLevel)
    const inputRiskIndex = riskLevels.indexOf(riskProfile)

    // Higher risk profiles should include lower risk clauses
    if (clauseRiskIndex <= inputRiskIndex) {
      return 1.0 - (inputRiskIndex - clauseRiskIndex) * 0.2
    }

    // Clause is higher risk than profile - lower relevance
    return Math.max(0.3, 1.0 - (clauseRiskIndex - inputRiskIndex) * 0.3)
  }

  /**
   * Calculate tool use mode scoring
   */
  private getToolModeScore(clause: PolicyClause, toolUseMode: ToolUseMode): number {
    if (!clause.toolUseModes) return 0.5

    if (clause.toolUseModes.includes(toolUseMode)) {
      return 1.0
    }

    // Partial matches based on mode progression
    const modes = ['prohibited', 'restricted', 'permitted', 'encouraged']
    const clauseModes = clause.toolUseModes.map(mode => modes.indexOf(mode))
    const inputModeIndex = modes.indexOf(toolUseMode)

    const closestMatch = clauseModes.reduce((closest, modeIndex) => {
      const distance = Math.abs(modeIndex - inputModeIndex)
      return distance < Math.abs(closest - inputModeIndex) ? modeIndex : closest
    }, clauseModes[0])

    const distance = Math.abs(closestMatch - inputModeIndex)
    return Math.max(0.2, 1.0 - distance * 0.3)
  }

  /**
   * Calculate tag-based scoring
   */
  private getTagScore(clause: PolicyClause, input: ClauseSelectionInput): number {
    if (!input.customTags || input.customTags.length === 0) return 0.5

    const matchingTags = clause.tags.filter(tag =>
      input.customTags!.some(customTag =>
        tag.toLowerCase().includes(customTag.toLowerCase()) ||
        customTag.toLowerCase().includes(tag.toLowerCase())
      )
    )

    return matchingTags.length / Math.max(clause.tags.length, input.customTags.length)
  }

  /**
   * Generate human-readable reasons for clause selection
   */
  private generateSelectionReasons(
    clause: PolicyClause,
    input: ClauseSelectionInput,
    score: number
  ): string[] {
    const reasons: string[] = []

    // Risk alignment
    if (clause.riskLevel === input.riskProfile) {
      reasons.push(`Matches ${input.riskProfile} risk profile`)
    } else if (clause.riskLevel === 'critical' && input.riskProfile === 'high') {
      reasons.push('Critical clause recommended for high-risk environment')
    }

    // Audience specificity
    if (clause.audience?.includes(input.audience)) {
      reasons.push(`Specifically designed for ${input.audience} institutions`)
    }

    // Tool use mode alignment
    if (clause.toolUseModes?.includes(input.toolUseMode)) {
      reasons.push(`Applicable to ${input.toolUseMode} tool use policy`)
    }

    // Jurisdiction
    if (input.state && clause.jurisdictions?.includes(input.state)) {
      reasons.push(`Includes ${input.state} jurisdiction requirements`)
    }

    // High relevance score
    if (score > 0.8) {
      reasons.push('High relevance to your policy context')
    }

    // Tag matching
    if (input.customTags) {
      const matchingTags = clause.tags.filter(tag =>
        input.customTags!.some(customTag =>
          tag.toLowerCase().includes(customTag.toLowerCase())
        )
      )
      if (matchingTags.length > 0) {
        reasons.push(`Addresses: ${matchingTags.join(', ')}`)
      }
    }

    return reasons.length > 0 ? reasons : ['Standard policy component']
  }

  /**
   * Resolve clause dependencies and conflicts
   */
  private resolveDependenciesAndConflicts(
    scoredClauses: Array<{ clause: PolicyClause; score: number; reasons: string[] }>,
    input: ClauseSelectionInput
  ): Array<{ clause: PolicyClause; score: number; reasons: string[] }> {
    const selected = new Set<string>()
    const result: Array<{ clause: PolicyClause; score: number; reasons: string[] }> = []

    // Select clauses starting with highest scores
    for (const item of scoredClauses) {
      const clause = item.clause

      // Check if already selected
      if (selected.has(clause.id)) continue

      // Check conflicts
      if (clause.conflicts) {
        const hasConflict = clause.conflicts.some(conflictId => selected.has(conflictId))
        if (hasConflict) {
          console.log(`Skipping ${clause.id} due to conflict`)
          continue
        }
      }

      // Add clause
      selected.add(clause.id)
      result.push(item)

      // Add dependencies
      if (clause.dependencies) {
        for (const depId of clause.dependencies) {
          if (!selected.has(depId)) {
            const depClause = this.clauses.find(c => c.id === depId)
            if (depClause) {
              selected.add(depId)
              result.push({
                clause: depClause,
                score: 0.9, // High score for dependencies
                reasons: [`Required dependency for ${clause.title}`]
              })
            }
          }
        }
      }
    }

    return result
  }

  /**
   * Apply manual include/exclude overrides
   */
  private applyManualOverrides(
    clauses: Array<{ clause: PolicyClause; score: number; reasons: string[] }>,
    input: ClauseSelectionInput
  ): Array<{ clause: PolicyClause; score: number; reasons: string[] }> {
    let result = [...clauses]

    // Apply exclusions
    if (input.excludeClauses) {
      result = result.filter(item => !input.excludeClauses!.includes(item.clause.id))
    }

    // Apply inclusions
    if (input.includeClauses) {
      for (const includeId of input.includeClauses) {
        const existingIndex = result.findIndex(item => item.clause.id === includeId)
        if (existingIndex === -1) {
          const clause = this.clauses.find(c => c.id === includeId)
          if (clause) {
            result.push({
              clause,
              score: 1.0,
              reasons: ['Manually included']
            })
          }
        }
      }
    }

    return result
  }

  /**
   * Get available clauses filtered by criteria
   */
  getAvailableClauses(audience?: string, tags?: string[]): PolicyClause[] {
    return this.clauses.filter(clause => {
      if (audience && clause.audience && !clause.audience.includes(audience as any)) {
        return false
      }
      if (tags && tags.length > 0) {
        return tags.some(tag => clause.tags.includes(tag))
      }
      return true
    })
  }

  /**
   * Get clause by ID
   */
  getClauseById(id: string): PolicyClause | undefined {
    return this.clauses.find(clause => clause.id === id)
  }

  /**
   * Search clauses by text
   */
  searchClauses(query: string): PolicyClause[] {
    const lowercaseQuery = query.toLowerCase()
    return this.clauses.filter(clause =>
      clause.title.toLowerCase().includes(lowercaseQuery) ||
      clause.body.toLowerCase().includes(lowercaseQuery) ||
      clause.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }
}

export default ClauseSelector
