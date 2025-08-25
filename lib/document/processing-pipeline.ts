/**
 * Document Processing Pipeline for Assessment 2.0
 * Handles PII scanning, text extraction, framework mapping, and analysis
 * 
 * @version 1.0.0
 * @author Staff Software Engineer
 */

import { PiiScanner, PiiScanResult } from '@/lib/security/pii-scanner';
import { VirusScanner } from '@/lib/security/virus-scanner';
import { TextExtractor } from '@/lib/document/text-extractor';
import { FrameworkMapper } from '@/lib/ai/framework-mapper';
import { GapAnalyzer } from '@/lib/ai/gap-analyzer';
import { PolicyRedliner } from '@/lib/ai/policy-redliner';
import { ArtifactGenerator } from '@/lib/artifacts/artifact-generator';
import { db } from '@/lib/db';
import { readFile } from 'fs/promises';

export interface ProcessingContext {
  uploadId: string;
  filePath: string;
  documentType: 'policy' | 'handbook' | 'contract';
  institutionId: string;
  userId: string;
  priority: 'low' | 'normal' | 'high';
}

export interface ProcessingStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  error?: string;
  progress?: number;
}

export interface ProcessingResult {
  success: boolean;
  stages: ProcessingStage[];
  extractedText?: string;
  piiScanResult?: PiiScanResult;
  frameworks: string[];
  entities: Record<string, any>;
  gapAnalyses: any[];
  policyRedlines: any[];
  artifacts: any[];
  totalTimeMs: number;
  error?: string;
}

export class DocumentProcessingPipeline {
  private piiScanner: PiiScanner;
  private virusScanner: VirusScanner;
  private textExtractor: TextExtractor;
  private frameworkMapper: FrameworkMapper;
  private gapAnalyzer: GapAnalyzer;
  private policyRedliner: PolicyRedliner;
  private artifactGenerator: ArtifactGenerator;

  constructor() {
    this.piiScanner = new PiiScanner();
    this.virusScanner = new VirusScanner();
    this.textExtractor = new TextExtractor();
    this.frameworkMapper = new FrameworkMapper();
    this.gapAnalyzer = new GapAnalyzer();
    this.policyRedliner = new PolicyRedliner();
    this.artifactGenerator = new ArtifactGenerator();
  }

  async process(context: ProcessingContext): Promise<ProcessingResult> {
    const startTime = Date.now();
    const stages: ProcessingStage[] = [
      { name: 'virus-scan', status: 'pending' },
      { name: 'text-extraction', status: 'pending' },
      { name: 'pii-detection', status: 'pending' },
      { name: 'entity-recognition', status: 'pending' },
      { name: 'framework-mapping', status: 'pending' },
      { name: 'gap-analysis', status: 'pending' },
      { name: 'policy-redlining', status: 'pending' },
      { name: 'artifact-generation', status: 'pending' },
    ];

    try {
      // Update status to processing
      await this.updateUploadStatus(context.uploadId, 'PROCESSING');

      // Stage 1: Virus Scan
      await this.runStage(stages, 'virus-scan', async () => {
        const buffer = await readFile(context.filePath);
        const scanResult = await this.virusScanner.scan(buffer);
        
        if (scanResult.infected) {
          throw new Error(`Security threat detected: ${scanResult.threats.map(t => t.name).join(', ')}`);
        }
        
        return { scanResult };
      });

      // Stage 2: Text Extraction
      const extractionResult = await this.runStage(stages, 'text-extraction', async () => {
        const result = await this.textExtractor.extract(context.filePath);
        
        if (!result.text || result.text.length < 100) {
          throw new Error('Insufficient text content extracted from document');
        }
        
        return result;
      });

      // Stage 3: PII Detection
      const piiResult = await this.runStage(stages, 'pii-detection', async () => {
        const result = await this.piiScanner.scan(extractionResult.text);
        
        // Update database with PII detection results
        await db.documentUpload.update({
          where: { id: context.uploadId },
          data: { 
            piiDetected: result.hasPii,
            piiRedactedUrl: result.redactedText ? await this.saveRedactedText(context, result.redactedText) : null,
          },
        });
        
        return result;
      });

      // Stage 4: Entity Recognition
      const entities = await this.runStage(stages, 'entity-recognition', async () => {
        // Use de-identified text for entity recognition
        const textToAnalyze = piiResult.redactedText || extractionResult.text;
        return await this.extractEntities(textToAnalyze);
      });

      // Stage 5: Framework Mapping
      const frameworks = await this.runStage(stages, 'framework-mapping', async () => {
        const institution = await db.institution.findUnique({
          where: { id: context.institutionId },
          select: { type: true, metadata: true },
        });
        
        return await this.frameworkMapper.mapFrameworks(
          extractionResult.text,
          context.documentType,
          institution?.type || 'K12'
        );
      });

      // Stage 6: Gap Analysis
      const gapAnalyses = await this.runStage(stages, 'gap-analysis', async () => {
        const textToAnalyze = piiResult.redactedText || extractionResult.text;
        return await this.gapAnalyzer.analyze(textToAnalyze, frameworks, entities);
      });

      // Stage 7: Policy Redlining
      const policyRedlines = await this.runStage(stages, 'policy-redlining', async () => {
        const textToAnalyze = piiResult.redactedText || extractionResult.text;
        return await this.policyRedliner.generateRedlines(textToAnalyze, frameworks, gapAnalyses);
      });

      // Save processing results to database
      const processingResult = await db.processingResult.create({
        data: {
          uploadId: context.uploadId,
          extractedText: piiResult.redactedText || extractionResult.text,
          extractedTextHash: this.hashText(extractionResult.text),
          entities,
          frameworks,
          processingTimeMs: Date.now() - startTime,
          gapAnalyses: {
            create: gapAnalyses.map((gap, index) => ({
              section: gap.section,
              requirement: gap.requirement,
              currentState: gap.currentState,
              gap: gap.gap,
              riskLevel: gap.riskLevel,
              remediation: gap.remediation,
              framework: gap.framework,
              sortOrder: index,
            })),
          },
          policyRedlines: {
            create: policyRedlines.map((redline, index) => ({
              section: redline.section,
              originalText: redline.originalText,
              suggestedText: redline.suggestedText,
              rationale: redline.rationale,
              framework: redline.framework,
              confidenceScore: redline.confidenceScore,
              sortOrder: index,
            })),
          },
        },
        include: {
          gapAnalyses: true,
          policyRedlines: true,
        },
      });

      // Stage 8: Artifact Generation
      const artifacts = await this.runStage(stages, 'artifact-generation', async () => {
        return await this.artifactGenerator.generateAll({
          upload: await db.documentUpload.findUnique({ where: { id: context.uploadId } }),
          processingResult,
          institution: await db.institution.findUnique({ where: { id: context.institutionId } }),
        });
      });

      // Save artifacts to database
      for (const artifact of artifacts) {
        await db.generatedArtifact.create({
          data: {
            resultId: processingResult.id,
            type: artifact.type,
            format: artifact.format,
            title: artifact.title,
            description: artifact.description,
            storageUrl: artifact.storageUrl,
            fileSize: artifact.fileSize,
            metadata: artifact.metadata,
          },
        });
      }

      // Mark as completed
      await this.updateUploadStatus(context.uploadId, 'COMPLETE', new Date());

      const totalTime = Date.now() - startTime;

      return {
        success: true,
        stages,
        extractedText: extractionResult.text,
        piiScanResult: piiResult,
        frameworks,
        entities,
        gapAnalyses,
        policyRedlines,
        artifacts,
        totalTimeMs: totalTime,
      };

    } catch (error) {
      console.error('Document processing error:', error);

      // Mark current stage as failed
      const currentStage = stages.find(s => s.status === 'running');
      if (currentStage) {
        currentStage.status = 'failed';
        currentStage.error = error instanceof Error ? error.message : 'Unknown error';
        currentStage.endTime = new Date();
      }

      // Update database
      await this.updateUploadStatus(context.uploadId, 'FAILED');
      
      // Save error details
      await db.processingResult.upsert({
        where: { uploadId: context.uploadId },
        create: {
          uploadId: context.uploadId,
          errorMessage: error instanceof Error ? error.message : 'Processing failed',
          processingTimeMs: Date.now() - startTime,
          entities: {},
          frameworks: [],
        },
        update: {
          errorMessage: error instanceof Error ? error.message : 'Processing failed',
          processingTimeMs: Date.now() - startTime,
        },
      });

      return {
        success: false,
        stages,
        frameworks: [],
        entities: {},
        gapAnalyses: [],
        policyRedlines: [],
        artifacts: [],
        totalTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Processing failed',
      };
    }
  }

  private async runStage<T>(
    stages: ProcessingStage[],
    stageName: string,
    handler: () => Promise<T>
  ): Promise<T> {
    const stage = stages.find(s => s.name === stageName);
    if (!stage) throw new Error(`Stage ${stageName} not found`);

    try {
      stage.status = 'running';
      stage.startTime = new Date();

      const result = await handler();

      stage.status = 'completed';
      stage.endTime = new Date();
      stage.progress = 100;

      return result;

    } catch (error) {
      stage.status = 'failed';
      stage.endTime = new Date();
      stage.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private async updateUploadStatus(
    uploadId: string, 
    status: 'UPLOADED' | 'SCANNING' | 'PROCESSING' | 'COMPLETE' | 'FAILED',
    processedAt?: Date
  ): Promise<void> {
    await db.documentUpload.update({
      where: { id: uploadId },
      data: { 
        status,
        processedAt,
      },
    });
  }

  private async saveRedactedText(context: ProcessingContext, redactedText: string): Promise<string> {
    // Save redacted text to secure storage
    const fileName = `${context.uploadId}-redacted.txt`;
    const filePath = `redacted/${fileName}`;
    
    // In production, save to secure cloud storage
    // For now, return a placeholder URL
    return `/api/files/redacted/${fileName}`;
  }

  private hashText(text: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  private async extractEntities(text: string): Promise<Record<string, any>> {
    // Entity extraction using NLP
    // This is a simplified implementation
    const entities = {
      organizations: this.extractPatterns(text, /\b[A-Z][a-z]+ (?:University|College|School|District|Institute)\b/g),
      policies: this.extractPatterns(text, /\b[A-Z][a-z]+ (?:Policy|Procedure|Guidelines?)\b/g),
      dates: this.extractPatterns(text, /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g),
      roles: this.extractPatterns(text, /\b(?:Principal|Superintendent|Teacher|Student|Administrator|Director)\b/g),
      technologies: this.extractPatterns(text, /\b(?:AI|artificial intelligence|machine learning|ChatGPT|Google|Microsoft|Apple|Zoom)\b/gi),
    };

    return entities;
  }

  private extractPatterns(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern);
    return matches ? [...new Set(matches)] : [];
  }
}
