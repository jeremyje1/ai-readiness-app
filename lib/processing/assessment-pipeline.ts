/**
 * Assessment 2.0 Processing Pipeline
 * Orchestrates document-in, policy-out workflow
 * @version 2.0.0
 */

import { createClient } from '@supabase/supabase-js'
import ArtifactGenerator, { GeneratedArtifact } from '../artifacts/artifact-generator'
import { DocumentProcessor } from '../document/document-processor'
import { FrameworkMapper } from '../frameworks/framework-mapper'
import EnhancedPIIScanner from '../security/enhanced-pii-scanner'

export interface ProcessingRequest {
    documentId: string
    file: {
        buffer: Buffer
        originalName: string
        mimeType: string
        size: number
    }
    organizationId: string
    userId: string
    settings?: {
        enablePIIRedaction: boolean
        frameworks: string[]
        artifactTypes: string[]
        strictMode: boolean
    }
}

export interface ProcessingResult {
    success: boolean
    assessmentId: string
    documentId: string
    summary: {
        documentProcessed: boolean
        piiDetected: number
        frameworksAnalyzed: string[]
        artifactsGenerated: number
        overallScore: number
        complianceLevel: 'critical' | 'partial' | 'substantial' | 'full'
    }
    results: {
        document: any
        piiScan: any
        frameworkMappings: any[]
        artifacts: GeneratedArtifact[]
    }
    errors?: string[]
    processingTimeMs: number
}

export class AssessmentPipeline {
    private documentProcessor: DocumentProcessor
    private piiScanner: EnhancedPIIScanner
    private frameworkMapper: FrameworkMapper
    private artifactGenerator: ArtifactGenerator
    private supabase: any

    constructor() {
        this.documentProcessor = new DocumentProcessor()
        this.piiScanner = new EnhancedPIIScanner()
        this.frameworkMapper = new FrameworkMapper()
        this.artifactGenerator = new ArtifactGenerator()

        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    }

    async processAssessment(request: ProcessingRequest): Promise<ProcessingResult> {
        const startTime = Date.now()
        const errors: string[] = []

        console.log(`Starting Assessment 2.0 processing for document: ${request.documentId}`)

        try {
            // Initialize assessment record
            const assessmentId = await this.initializeAssessment(request)

            // Step 1: Process Document (OCR, text extraction, section classification)
            console.log('Step 1: Processing document...')
            const documentResult = await this.processDocument(request, assessmentId)

            if (!documentResult.success) {
                throw new Error(`Document processing failed: ${documentResult.error}`)
            }

            // Step 2: PII Detection and Risk Assessment
            console.log('Step 2: Scanning for PII...')
            const piiResult = await this.scanForPII(documentResult.data, assessmentId, request.settings?.enablePIIRedaction)

            // Step 3: Framework Mapping and Gap Analysis
            console.log('Step 3: Mapping to AI governance frameworks...')
            const frameworkResult = await this.mapToFrameworks(
                documentResult.data,
                piiResult,
                assessmentId,
                request.settings?.frameworks || ['AIRIX', 'AIRS', 'AICS', 'AIMS', 'AIPS', 'AIBS']
            )

            // Step 4: Generate Artifacts
            console.log('Step 4: Generating artifacts...')
            const artifactResult = await this.generateArtifacts(
                assessmentId,
                request.organizationId,
                {
                    document: documentResult.data,
                    piiScan: piiResult,
                    mappings: frameworkResult.mappings,
                    scores: frameworkResult.scores,
                    recommendations: frameworkResult.recommendations
                },
                request.settings?.artifactTypes || ['gap-report', 'policy-redline', 'board-deck']
            )

            // Step 5: Finalize Assessment
            const summary = await this.finalizeAssessment(assessmentId, {
                documentResult,
                piiResult,
                frameworkResult,
                artifactResult,
                organizationId: request.organizationId
            })

            return {
                success: true,
                assessmentId,
                documentId: request.documentId,
                summary,
                results: {
                    document: documentResult.data,
                    piiScan: piiResult,
                    frameworkMappings: frameworkResult.mappings,
                    artifacts: artifactResult
                },
                errors: errors.length > 0 ? errors : undefined,
                processingTimeMs: Date.now() - startTime
            }

        } catch (error) {
            console.error('Assessment processing failed:', error)

            return {
                success: false,
                assessmentId: '',
                documentId: request.documentId,
                summary: {
                    documentProcessed: false,
                    piiDetected: 0,
                    frameworksAnalyzed: [],
                    artifactsGenerated: 0,
                    overallScore: 0,
                    complianceLevel: 'critical'
                },
                results: {
                    document: null,
                    piiScan: null,
                    frameworkMappings: [],
                    artifacts: []
                },
                errors: [error instanceof Error ? error.message : 'Unknown error'],
                processingTimeMs: Date.now() - startTime
            }
        }
    }

    private async initializeAssessment(request: ProcessingRequest): Promise<string> {
        const { data, error } = await this.supabase
            .from('assessments')
            .insert({
                organization_id: request.organizationId,
                user_id: request.userId,
                document_id: request.documentId,
                status: 'processing',
                frameworks: request.settings?.frameworks || ['AIRIX', 'AIRS', 'AICS', 'AIMS', 'AIPS', 'AIBS'],
                settings: request.settings || {},
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw new Error(`Failed to initialize assessment: ${error.message}`)

        console.log(`Assessment initialized: ${data.id}`)
        return data.id
    }

    private async processDocument(request: ProcessingRequest, assessmentId: string) {
        try {
            const result = await this.documentProcessor.processDocument(
                request.file.buffer,
                request.file.mimeType,
                request.file.originalName
            )

            // Store document sections in database
            if (result.sections && result.sections.length > 0) {
                const sectionsData = result.sections.map((section: any) => ({
                    document_id: request.documentId,
                    assessment_id: assessmentId,
                    section_type: section.type,
                    title: section.title,
                    content: section.content,
                    page_number: section.page,
                    confidence: section.confidence,
                    metadata: section.metadata || {}
                }))

                await this.supabase
                    .from('document_sections')
                    .insert(sectionsData)
            }

            return {
                success: true,
                data: result
            }
        } catch (error) {
            console.error('Document processing error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Document processing failed'
            }
        }
    }

    private async scanForPII(documentData: any, assessmentId: string, enableRedaction = true) {
        try {
            const piiResult = await this.piiScanner.scan(documentData.extractedText)

            // Store PII detections in database
            if (piiResult.detections && piiResult.detections.length > 0) {
                const detectionsData = piiResult.detections.map((detection: any) => ({
                    assessment_id: assessmentId,
                    type: detection.type,
                    value_hash: detection.valueHash, // Store hash, not actual value
                    location: detection.location,
                    confidence: detection.confidence,
                    risk_level: detection.riskLevel,
                    redacted: enableRedaction
                }))

                await this.supabase
                    .from('pii_detections')
                    .insert(detectionsData)
            }

            return piiResult
        } catch (error) {
            console.error('PII scanning error:', error)
            return {
                detections: [],
                summary: {
                    totalDetections: 0,
                    highRiskCount: 0,
                    typesFound: []
                },
                redactedText: documentData.extractedText
            }
        }
    }

    private async mapToFrameworks(documentData: any, piiResult: any, assessmentId: string, frameworks: string[]) {
        try {
            const mappingResult = await this.frameworkMapper.analyzeDocument(
                documentData.sections || [],
                'K12' // Default to K12, could be configurable
            )

            // Store framework mappings in database
            if (mappingResult.mappings && mappingResult.mappings.length > 0) {
                const mappingsData = mappingResult.mappings.map((mapping: any) => ({
                    assessment_id: assessmentId,
                    framework: mapping.framework,
                    control_id: mapping.controlId,
                    section_content: mapping.sectionContent,
                    mapping_confidence: mapping.confidence,
                    evidence: mapping.evidence || [],
                    gaps: mapping.gaps || [],
                    score: mapping.score,
                    rationale: mapping.rationale
                }))

                await this.supabase
                    .from('framework_mappings')
                    .insert(mappingsData)
            }

            // Store framework scores
            if (mappingResult.overallScores) {
                const scoresData = Object.entries(mappingResult.overallScores).map(([framework, score]) => ({
                    assessment_id: assessmentId,
                    framework,
                    score: score as number,
                    max_score: 1.0,
                    compliance_level: this.getComplianceLevel(score as number)
                }))

                await this.supabase
                    .from('framework_scores')
                    .insert(scoresData)
            }

            return {
                mappings: mappingResult.mappings,
                scores: mappingResult.overallScores,
                recommendations: mappingResult.recommendations
            }
        } catch (error) {
            console.error('Framework mapping error:', error)
            return {
                mappings: [],
                scores: {},
                recommendations: ['Unable to complete framework mapping. Please review manually.']
            }
        }
    }

    private async generateArtifacts(
        assessmentId: string,
        organizationId: string,
        analysisData: any,
        artifactTypes: string[]
    ): Promise<GeneratedArtifact[]> {
        try {
            const artifacts: GeneratedArtifact[] = []

            for (const artifactType of artifactTypes) {
                if (['gap-report', 'policy-redline', 'board-deck'].includes(artifactType)) {
                    const artifact = await this.artifactGenerator.generateArtifact({
                        assessmentId,
                        organizationId,
                        type: artifactType as any,
                        format: this.getArtifactFormat(artifactType),
                        data: {
                            ...analysisData,
                            organization: { name: 'Your Organization' } // TODO: Fetch from DB
                        }
                    })

                    // Store artifact metadata in database
                    await this.supabase
                        .from('artifacts')
                        .insert({
                            assessment_id: assessmentId,
                            type: artifact.type,
                            format: artifact.format,
                            filename: artifact.filename,
                            file_size: artifact.buffer.length,
                            metadata: artifact.metadata,
                            created_at: new Date().toISOString()
                        })

                    artifacts.push(artifact)
                }
            }

            return artifacts
        } catch (error) {
            console.error('Artifact generation error:', error)
            return []
        }
    }

    private async finalizeAssessment(assessmentId: string, results: any) {
        const overallScore = this.calculateOverallScore(results.frameworkResult.scores)
        const complianceLevel = this.getComplianceLevel(overallScore)

        // Update assessment status
        await this.supabase
            .from('assessments')
            .update({
                status: 'completed',
                overall_score: overallScore,
                compliance_level: complianceLevel,
                completed_at: new Date().toISOString(),
                processing_summary: {
                    documentProcessed: results.documentResult.success,
                    piiDetected: results.piiResult.summary?.totalDetections || 0,
                    frameworksAnalyzed: Object.keys(results.frameworkResult.scores || {}),
                    artifactsGenerated: results.artifactResult.length
                }
            })
            .eq('id', assessmentId)

        // Trigger Slack celebration if enabled
        try {
            // Get organization name for celebration
            const { data: orgData } = await this.supabase
                .from('organizations')
                .select('name')
                .eq('id', results.organizationId)
                .single()

            const institutionName = orgData?.name || 'An Institution'

            // Send to Slack automation endpoint
            if (process.env.POLICY_UPDATE_SLACK_ENABLED === 'true') {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack-automation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'assessment_celebration',
                        data: {
                            institutionName,
                            score: overallScore
                        }
                    })
                }).catch(error => {
                    console.log('Slack notification failed (non-critical):', error.message)
                })
            }
        } catch (error) {
            console.log('Slack celebration failed (non-critical):', error)
        }

        return {
            documentProcessed: results.documentResult.success,
            piiDetected: results.piiResult.summary?.totalDetections || 0,
            frameworksAnalyzed: Object.keys(results.frameworkResult.scores || {}),
            artifactsGenerated: results.artifactResult.length,
            overallScore,
            complianceLevel
        }
    }

    private calculateOverallScore(scores: Record<string, number>): number {
        const scoreValues = Object.values(scores)
        if (scoreValues.length === 0) return 0
        return scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
    }

    private getComplianceLevel(score: number): 'critical' | 'partial' | 'substantial' | 'full' {
        if (score < 0.3) return 'critical'
        if (score < 0.6) return 'partial'
        if (score < 0.8) return 'substantial'
        return 'full'
    }

    private getArtifactFormat(type: string): 'pdf' | 'docx' | 'pptx' {
        switch (type) {
            case 'gap-report': return 'pdf'
            case 'policy-redline': return 'docx'
            case 'board-deck': return 'pptx'
            default: return 'pdf'
        }
    }

    // Public method to check processing status
    async getProcessingStatus(assessmentId: string) {
        const { data, error } = await this.supabase
            .from('assessments')
            .select(`
        id,
        status,
        overall_score,
        compliance_level,
        processing_summary,
        created_at,
        completed_at
      `)
            .eq('id', assessmentId)
            .single()

        if (error) throw new Error(`Failed to get assessment status: ${error.message}`)

        return data
    }

    // Batch processing for multiple documents
    async processBatch(requests: ProcessingRequest[]): Promise<ProcessingResult[]> {
        const results: ProcessingResult[] = []

        // Process sequentially to avoid overwhelming the system
        for (const request of requests) {
            try {
                const result = await this.processAssessment(request)
                results.push(result)
            } catch (error) {
                console.error(`Batch processing failed for ${request.documentId}:`, error)
                results.push({
                    success: false,
                    assessmentId: '',
                    documentId: request.documentId,
                    summary: {
                        documentProcessed: false,
                        piiDetected: 0,
                        frameworksAnalyzed: [],
                        artifactsGenerated: 0,
                        overallScore: 0,
                        complianceLevel: 'critical'
                    },
                    results: {
                        document: null,
                        piiScan: null,
                        frameworkMappings: [],
                        artifacts: []
                    },
                    errors: [error instanceof Error ? error.message : 'Unknown error'],
                    processingTimeMs: 0
                })
            }
        }

        return results
    }
}

export default AssessmentPipeline
