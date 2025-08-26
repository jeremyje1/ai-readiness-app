/**
 * Document Processing Pipeline
 * Orchestrates the complete document analysis workflow
 * @version 1.0.0
 */

import { FrameworkMapper } from '@/lib/ai/framework-mapper'
import { GapAnalyzer } from '@/lib/ai/gap-analyzer'
import { PolicyRedliner } from '@/lib/ai/policy-redliner'
import { ArtifactGenerator } from '@/lib/artifacts/artifact-generator'
import { TextExtractor } from '@/lib/document/text-extractor'
import { PiiScanner } from '@/lib/security/pii-scanner'
import { VirusScanner } from '@/lib/security/virus-scanner'

export interface ProcessingContext {
    uploadId: string
    filePath: string
    userId: string
    institutionId: string
    documentType: string
}

export interface ProcessingResult {
    success: boolean
    stages: Record<string, { status: string; completedAt?: string; error?: string }>
    artifactIds: string[]
    summary: {
        criticalGaps: number
        totalGaps: number
        complianceScore: number
    }
}

export class DocumentProcessingPipeline {
    async processDocument(context: ProcessingContext): Promise<ProcessingResult> {
        const result: ProcessingResult = {
            success: false,
            stages: {},
            artifactIds: [],
            summary: {
                criticalGaps: 0,
                totalGaps: 0,
                complianceScore: 0,
            },
        }

        try {
            console.log('Starting document processing pipeline for:', context.uploadId)

            // Stage 1: Virus Scan
            result.stages.virus_scan = { status: 'processing' }
            const virusScanner = new VirusScanner()
            const fileBuffer = await import('fs').then(fs => fs.readFileSync(context.filePath))
            const virusScanResult = await virusScanner.scan(fileBuffer)

            if (virusScanResult.infected) {
                result.stages.virus_scan = {
                    status: 'failed',
                    error: 'Virus detected',
                    completedAt: new Date().toISOString()
                }
                return result
            }

            result.stages.virus_scan = {
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            // Stage 2: Text Extraction
            result.stages.text_extraction = { status: 'processing' }
            const textExtractor = new TextExtractor()
            const extractedText = await textExtractor.extract(context.filePath)
            result.stages.text_extraction = {
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            // Stage 3: PII Detection
            result.stages.pii_detection = { status: 'processing' }
            const piiScanner = new PiiScanner()
            const piiResults = await piiScanner.scan(extractedText.text)
            result.stages.pii_detection = {
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            // Stage 4: Framework Mapping
            result.stages.framework_mapping = { status: 'processing' }
            const frameworkMapper = new FrameworkMapper()
            const frameworkResults = await frameworkMapper.mapFrameworks(
                extractedText.text,
                context.documentType,
                'K12' // Default institution type
            )
            result.stages.framework_mapping = {
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            // Stage 5: Gap Analysis
            result.stages.gap_analysis = { status: 'processing' }
            const gapAnalyzer = new GapAnalyzer()
            const gapResults = await gapAnalyzer.analyze(
                extractedText.text,
                frameworkResults,
                {} // Empty entities object
            )
            result.stages.gap_analysis = {
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            // Stage 6: Policy Redlining
            result.stages.policy_redlining = { status: 'processing' }
            const policyRedliner = new PolicyRedliner()
            const gapResultsForRedline = gapResults.map(gap => ({
                requirement: gap.requirement,
                status: gap.gap,
                riskLevel: gap.riskLevel
            }))
            const redlineResults = await policyRedliner.redlinePolicy(
                { id: context.uploadId, content: extractedText.text, type: context.documentType },
                gapResultsForRedline
            )
            result.stages.policy_redlining = {
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            // Stage 7: Artifact Generation
            result.stages.artifact_generation = { status: 'processing' }
            const artifactGenerator = new ArtifactGenerator()
            const artifactResults = await artifactGenerator.generateArtifactPack({
                documentId: context.uploadId,
                gapAnalysis: gapResults,
                redlines: redlineResults,
                frameworks: frameworkResults,
            })
            result.stages.artifact_generation = {
                status: 'completed',
                completedAt: new Date().toISOString()
            }

            // Calculate summary from gap results
            const criticalGaps = gapResults.filter(gap => gap.riskLevel === 'critical').length
            const totalGaps = gapResults.length
            const complianceScore = Math.max(0, 100 - (criticalGaps * 20 + (totalGaps - criticalGaps) * 5))

            // Update summary
            result.summary = {
                criticalGaps,
                totalGaps,
                complianceScore,
            }

            result.artifactIds = artifactResults.artifacts.map(a => a.id)
            result.success = true

            console.log('Document processing completed successfully:', context.uploadId)
            return result

        } catch (error) {
            console.error('Document processing failed:', error)

            // Mark current stage as failed
            const currentStage = Object.keys(result.stages).find(
                stage => result.stages[stage].status === 'processing'
            )
            if (currentStage) {
                result.stages[currentStage] = {
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    completedAt: new Date().toISOString()
                }
            }

            return result
        }
    }
}

export default DocumentProcessingPipeline
