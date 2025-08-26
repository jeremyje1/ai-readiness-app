/**
 * Policy Engine Snapshot Tests
 * Test template rendering and diff correctness
 * @version 1.0.0
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { ClauseSelector } from '../lib/policy/clause-selector'
import PolicyDiffer from '../lib/policy/policy-differ'
import { PolicyRenderer } from '../lib/policy/policy-renderer'
import {
    ClauseSelectionInput,
    PolicyRenderOptions,
    SelectedClause
} from '../lib/policy/types'

describe('Policy Engine Integration Tests', () => {
    let clauseSelector: ClauseSelector
    let policyRenderer: PolicyRenderer
    let policyDiffer: PolicyDiffer

    beforeEach(() => {
        clauseSelector = new ClauseSelector()
        policyRenderer = new PolicyRenderer()
        policyDiffer = new PolicyDiffer()
    })

    describe('Clause Selection', () => {
        it('should select appropriate clauses for K-12 prohibited mode', async () => {
            const input: ClauseSelectionInput = {
                audience: 'k12',
                riskProfile: 'high',
                toolUseMode: 'prohibited',
                state: 'CA'
            }

            const selectedClauses = await clauseSelector.selectClauses(input)

            expect(selectedClauses).toMatchSnapshot('k12-prohibited-clauses')
            expect(selectedClauses.length).toBeGreaterThan(0)
            expect(selectedClauses.every(clause => clause.selected)).toBe(true)
            expect(selectedClauses.every(clause => clause.reason.length > 0)).toBe(true)
        })

        it('should select appropriate clauses for Higher Ed permitted mode', async () => {
            const input: ClauseSelectionInput = {
                audience: 'highered',
                riskProfile: 'medium',
                toolUseMode: 'permitted',
                customTags: ['privacy', 'data-protection']
            }

            const selectedClauses = await clauseSelector.selectClauses(input)

            expect(selectedClauses).toMatchSnapshot('highered-permitted-clauses')
            expect(selectedClauses.length).toBeGreaterThan(0)

            // Should include privacy-related clauses
            const hasPrivacyClause = selectedClauses.some(clause =>
                clause.tags.includes('privacy') || clause.tags.includes('data-protection')
            )
            expect(hasPrivacyClause).toBe(true)
        })

        it('should handle low risk encouraged mode', async () => {
            const input: ClauseSelectionInput = {
                audience: 'k12',
                riskProfile: 'low',
                toolUseMode: 'encouraged'
            }

            const selectedClauses = await clauseSelector.selectClauses(input)

            expect(selectedClauses).toMatchSnapshot('k12-low-risk-encouraged')
            expect(selectedClauses.length).toBeGreaterThan(0)

            // Should have lower priority scores for low risk
            const avgPriority = selectedClauses.reduce((sum, clause) => sum + clause.priority, 0) / selectedClauses.length
            expect(avgPriority).toBeLessThan(50) // Assuming 100 is max priority
        })

        it('should respect clause dependencies', async () => {
            const input: ClauseSelectionInput = {
                audience: 'highered',
                riskProfile: 'high',
                toolUseMode: 'restricted',
                includeClauses: ['governance-001'] // This has dependencies
            }

            const selectedClauses = await clauseSelector.selectClauses(input)

            expect(selectedClauses).toMatchSnapshot('dependency-resolution')

            // Should include governance oversight clause
            const hasGovernance = selectedClauses.some(clause => clause.id === 'governance-001')
            expect(hasGovernance).toBe(true)
        })

        it('should handle clause exclusions', async () => {
            const input: ClauseSelectionInput = {
                audience: 'k12',
                riskProfile: 'medium',
                toolUseMode: 'restricted',
                excludeClauses: ['training-001', 'vendor-001']
            }

            const selectedClauses = await clauseSelector.selectClauses(input)

            expect(selectedClauses).toMatchSnapshot('clause-exclusions')

            // Should not include excluded clauses
            const hasExcluded = selectedClauses.some(clause =>
                clause.id === 'training-001' || clause.id === 'vendor-001'
            )
            expect(hasExcluded).toBe(false)
        })
    })

    describe.skip('Document Rendering', () => {
        let sampleClauses: SelectedClause[]

        beforeEach(async () => {
            const input: ClauseSelectionInput = {
                audience: 'k12',
                riskProfile: 'medium',
                toolUseMode: 'restricted'
            }
            sampleClauses = await clauseSelector.selectClauses(input)
        })

        it('should render HTML policy document', async () => {
            const html = await policyRenderer.renderPolicyHtml(
                'k12-standard',
                sampleClauses.map(c => c.id),
                'Sample K-12 District'
            )

            expect(html).toMatchSnapshot('k12-policy-html')
            expect(html).toContain('Sample K-12 District')
            expect(html).toContain('<!DOCTYPE html>')
            expect(html).toContain('AI Readiness Policy')

            // Should contain policy sections
            expect(html).toContain('Purpose and Scope')
            expect(html).toContain('AI Governance Committee')
        })

        it('should render DOCX policy document', async () => {
            const renderOptions: PolicyRenderOptions = {
                templateId: 'k12-standard',
                selectedClauses: sampleClauses.map(c => c.id),
                format: 'docx',
                headerFooter: {
                    organizationName: 'Test School District',
                    effectiveDate: '2024-01-01',
                    version: '1.0'
                }
            }

            const docxBuffer = await policyRenderer.renderPolicyDocx(renderOptions)

            expect(docxBuffer).toBeInstanceOf(Buffer)
            expect(docxBuffer.length).toBeGreaterThan(1000) // Should be substantial

            // Snapshot the first 100 bytes as a basic structure check
            const headerBytes = Array.from(docxBuffer.slice(0, 100))
            expect(headerBytes).toMatchSnapshot('docx-header-bytes')
        })

        it('should include metadata in rendered documents', async () => {
            const html = await policyRenderer.renderPolicyHtml(
                'highered-standard',
                sampleClauses.map(c => c.id),
                'University of Testing'
            )

            expect(html).toMatchSnapshot('policy-with-metadata')
            expect(html).toContain('Generated by: AI Readiness Policy Engine')
            expect(html).toContain(new Date().getFullYear().toString())
        })
    })

    describe.skip('Policy Diffing', () => {
        let basePolicy: string
        let modifiedPolicy: string

        beforeEach(() => {
            basePolicy = `
# AI Usage Policy

## Purpose
This policy establishes guidelines for the use of artificial intelligence tools in educational settings.

## Permitted Uses
- Research assistance
- Content generation with supervision
- Administrative task automation

## Prohibited Uses
- Student assessment without human oversight
- Personal data processing without consent
      `.trim()

            modifiedPolicy = `
# AI Usage Policy

## Purpose
This policy establishes comprehensive guidelines for the responsible use of artificial intelligence tools in educational settings.

## Permitted Uses
- Research assistance with proper attribution
- Content generation with faculty supervision
- Administrative task automation
- Educational content development

## Prohibited Uses
- Student assessment without human oversight
- Personal data processing without explicit consent
- Automated decision-making affecting student outcomes
      `.trim()
        })

        it('should generate policy diffs', () => {
            const diffs = policyDiffer.diffPolicies(basePolicy, modifiedPolicy)

            expect(diffs).toMatchSnapshot('policy-diffs')
            expect(diffs.length).toBeGreaterThan(0)

            // Should detect additions
            const additions = diffs.filter(diff => diff.type === 'addition')
            expect(additions.length).toBeGreaterThan(0)

            // Should detect deletions or additions (modifications might be represented as separate add/delete)
            const changes = diffs.filter(diff => diff.type === 'addition' || diff.type === 'deletion')
            expect(changes.length).toBeGreaterThan(0)
        })

        it('should generate redline changes', () => {
            const redlineChanges = policyDiffer.generateRedlineChanges(
                basePolicy,
                modifiedPolicy,
                'Policy Committee'
            )

            expect(redlineChanges).toMatchSnapshot('redline-changes')
            expect(redlineChanges.length).toBeGreaterThan(0)

            // All changes should have proper metadata
            redlineChanges.forEach(change => {
                expect(change.id).toBeDefined()
                expect(change.author).toBe('Policy Committee')
                expect(change.timestamp).toBeDefined()
                expect(change.position).toBeDefined()
            })
        })

        it('should render redline HTML', () => {
            const redlineChanges = policyDiffer.generateRedlineChanges(
                basePolicy,
                modifiedPolicy,
                'System'
            )

            const redlineHtml = policyDiffer.renderRedlineHtml(
                basePolicy,
                redlineChanges,
                'Policy Comparison'
            )

            expect(redlineHtml).toMatchSnapshot('redline-html')
            expect(redlineHtml).toContain('<!DOCTYPE html>')
            expect(redlineHtml).toContain('Policy Comparison')
            expect(redlineHtml).toContain('redline-insert')
            expect(redlineHtml).toContain('redline-delete')
        })

        it('should handle word-level granularity', () => {
            const diffs = policyDiffer.diffPolicies(
                basePolicy,
                modifiedPolicy,
                { granularity: 'word' }
            )

            expect(diffs).toMatchSnapshot('word-level-diffs')
            expect(diffs.length).toBeGreaterThan(0)
        })

        it('should handle sentence-level granularity', () => {
            const diffs = policyDiffer.diffPolicies(
                basePolicy,
                modifiedPolicy,
                { granularity: 'sentence' }
            )

            expect(diffs).toMatchSnapshot('sentence-level-diffs')
            expect(diffs.length).toBeGreaterThan(0)
        })

        it('should ignore case when requested', () => {
            const upperPolicy = basePolicy.toUpperCase()
            const diffs = policyDiffer.diffPolicies(
                basePolicy,
                upperPolicy,
                { ignoreCase: true }
            )

            expect(diffs).toMatchSnapshot('case-ignored-diffs')
            // Should have fewer diffs when ignoring case
            expect(diffs.length).toBeLessThan(10)
        })
    })

    describe.skip('End-to-End Workflows', () => {
        it('should complete full policy generation workflow', async () => {
            // Step 1: Select clauses
            const input: ClauseSelectionInput = {
                audience: 'k12',
                riskProfile: 'high',
                toolUseMode: 'prohibited',
                state: 'NY'
            }

            const selectedClauses = await clauseSelector.selectClauses(input)
            expect(selectedClauses.length).toBeGreaterThan(0)

            // Step 2: Render HTML
            const html = await policyRenderer.renderPolicyHtml(
                'k12-standard',
                selectedClauses.map(c => c.id),
                'New York School District'
            )
            expect(html).toContain('New York School District')

            // Step 3: Render DOCX
            const renderOptions: PolicyRenderOptions = {
                templateId: 'k12-standard',
                selectedClauses: selectedClauses.map(c => c.id),
                format: 'docx',
                headerFooter: {
                    organizationName: 'New York School District',
                    effectiveDate: '2024-01-01'
                }
            }

            const docxBuffer = await policyRenderer.renderPolicyDocx(renderOptions)
            expect(docxBuffer.length).toBeGreaterThan(1000)

            // Complete workflow snapshot
            const workflow = {
                input,
                selectedClauseCount: selectedClauses.length,
                htmlLength: html.length,
                docxSize: docxBuffer.length,
                clauseIds: selectedClauses.map(c => c.id).sort()
            }

            expect(workflow).toMatchSnapshot('complete-k12-workflow')
        })

        it('should handle policy comparison workflow', async () => {
            // Generate two different policies
            const input1: ClauseSelectionInput = {
                audience: 'highered',
                riskProfile: 'low',
                toolUseMode: 'encouraged'
            }

            const input2: ClauseSelectionInput = {
                audience: 'highered',
                riskProfile: 'high',
                toolUseMode: 'prohibited'
            }

            const clauses1 = await clauseSelector.selectClauses(input1)
            const clauses2 = await clauseSelector.selectClauses(input2)

            const policy1 = await policyRenderer.renderPolicyHtml(
                'highered-standard',
                clauses1.map(c => c.id),
                'Liberal University'
            )

            const policy2 = await policyRenderer.renderPolicyHtml(
                'highered-standard',
                clauses2.map(c => c.id),
                'Conservative University'
            )

            // Compare policies
            const diffs = policyDiffer.diffPolicies(policy1, policy2)
            const redlineChanges = policyDiffer.generateRedlineChanges(policy1, policy2, 'Comparison Tool')

            const comparison = {
                policy1Length: policy1.length,
                policy2Length: policy2.length,
                diffCount: diffs.length,
                redlineCount: redlineChanges.length,
                additionCount: diffs.filter(d => d.type === 'addition').length,
                deletionCount: diffs.filter(d => d.type === 'deletion').length
            }

            expect(comparison).toMatchSnapshot('policy-comparison-workflow')
            expect(diffs.length).toBeGreaterThan(0)
            expect(redlineChanges.length).toBeGreaterThan(0)
        })
    })

    describe('Error Handling', () => {
        it('should handle invalid clause selection inputs', async () => {
            const invalidInput = {
                audience: 'invalid',
                riskProfile: 'unknown',
                toolUseMode: 'forbidden'
            } as any

            const selectedClauses = await clauseSelector.selectClauses(invalidInput)
            expect(selectedClauses).toMatchSnapshot('invalid-input-clauses')
            // Should gracefully handle invalid inputs
            expect(Array.isArray(selectedClauses)).toBe(true)
        })

        it('should handle missing template IDs', async () => {
            await expect(async () => {
                await policyRenderer.renderPolicyHtml(
                    'nonexistent_template',
                    ['definitions-001'],
                    'Test Org'
                )
            }).rejects.toThrow('Template not found')
        })

        it('should handle missing clause IDs', async () => {
            await expect(async () => {
                const renderOptions: PolicyRenderOptions = {
                    templateId: 'k12-standard',
                    selectedClauses: ['nonexistent_clause'],
                    format: 'docx'
                }
                await policyRenderer.renderPolicyDocx(renderOptions)
            }).rejects.toThrow('Clause not found')
        })

        it('should handle empty diff inputs', () => {
            const diffs = policyDiffer.diffPolicies('', '')
            expect(diffs).toMatchSnapshot('empty-diff')
            expect(diffs.length).toBe(0)
        })
    })
})
