/**
 * Assessment 2.0 Processing Status API
 * Returns document processing status and results
 * 
 * @version 1.0.0
 * @author Staff Software Engineer
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId } = params;

    // Get upload with processing results
    const upload = await db.documentUpload.findUnique({
      where: { id: uploadId },
      include: {
        processingResult: {
          include: {
            gapAnalyses: {
              orderBy: { sortOrder: 'asc' },
            },
            policyRedlines: {
              orderBy: { sortOrder: 'asc' },
            },
            generatedArtifacts: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        institution: {
          select: { name: true, type: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!upload) {
      return NextResponse.json({ 
        error: 'Document not found' 
      }, { status: 404 });
    }

    // Verify access
    const hasAccess = upload.userId === session.user.id || 
      await db.institutionUser.findFirst({
        where: {
          institutionId: upload.institutionId,
          userId: session.user.id,
          active: true,
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Calculate processing progress
    let progressPercentage = 0;
    let currentStage = 'uploaded';
    
    if (upload.status === 'SCANNING') {
      progressPercentage = 20;
      currentStage = 'security-scan';
    } else if (upload.status === 'PROCESSING') {
      progressPercentage = 60;
      currentStage = 'analysis';
    } else if (upload.status === 'COMPLETE') {
      progressPercentage = 100;
      currentStage = 'complete';
    } else if (upload.status === 'FAILED') {
      progressPercentage = 0;
      currentStage = 'failed';
    }

    // Get processing metrics
    const result = upload.processingResult;
    const metrics = result ? {
      gapCount: result.gapAnalyses.length,
      criticalGaps: result.gapAnalyses.filter(g => g.riskLevel === 'CRITICAL').length,
      highRiskGaps: result.gapAnalyses.filter(g => g.riskLevel === 'HIGH').length,
      redlineCount: result.policyRedlines.length,
      artifactCount: result.generatedArtifacts.length,
      processingTimeMs: result.processingTimeMs,
      frameworks: result.frameworks,
    } : null;

    // Get latest artifacts with signed URLs
    const artifacts = result?.generatedArtifacts.map(artifact => ({
      id: artifact.id,
      type: artifact.type,
      format: artifact.format,
      title: artifact.title,
      description: artifact.description,
      fileSize: artifact.fileSize,
      createdAt: artifact.createdAt,
      downloadUrl: artifact.signedUrl && artifact.signedUrlExpiresAt > new Date() 
        ? artifact.signedUrl 
        : null,
    })) || [];

    return NextResponse.json({
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        status: upload.status,
        piiDetected: upload.piiDetected,
        createdAt: upload.createdAt,
        processedAt: upload.processedAt,
        institution: upload.institution,
        user: upload.user,
      },
      processing: {
        status: upload.status,
        progress: progressPercentage,
        currentStage,
        metrics,
        errorMessage: result?.errorMessage,
      },
      results: result ? {
        gapAnalyses: result.gapAnalyses.map(gap => ({
          id: gap.id,
          section: gap.section,
          requirement: gap.requirement,
          currentState: gap.currentState,
          gap: gap.gap,
          riskLevel: gap.riskLevel,
          remediation: gap.remediation,
          framework: gap.framework,
        })),
        policyRedlines: result.policyRedlines.map(redline => ({
          id: redline.id,
          section: redline.section,
          originalText: redline.originalText,
          suggestedText: redline.suggestedText,
          rationale: redline.rationale,
          framework: redline.framework,
          confidenceScore: redline.confidenceScore,
        })),
        frameworks: result.frameworks,
        extractedEntities: result.entities,
      } : null,
      artifacts,
    });

  } catch (error) {
    console.error('Get processing status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId } = params;
    const { action } = await request.json();

    // Get upload
    const upload = await db.documentUpload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      return NextResponse.json({ 
        error: 'Document not found' 
      }, { status: 404 });
    }

    // Verify access
    const hasAccess = upload.userId === session.user.id || 
      await db.institutionUser.findFirst({
        where: {
          institutionId: upload.institutionId,
          userId: session.user.id,
          active: true,
          role: { in: ['admin', 'owner'] },
        },
      });

    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Handle different actions
    switch (action) {
      case 'reprocess':
        if (upload.status !== 'FAILED') {
          return NextResponse.json({ 
            error: 'Document not in failed state' 
          }, { status: 400 });
        }

        // Reset status and queue for reprocessing
        await db.documentUpload.update({
          where: { id: uploadId },
          data: { 
            status: 'UPLOADED',
            processedAt: null,
          },
        });

        // Re-queue processing
        const queue = new DocumentProcessingQueue();
        await queue.add('process-document', {
          uploadId,
          filePath: upload.storageUrl,
          priority: 'high',
        });

        break;

      case 'delete':
        // Soft delete - mark as deleted but keep for audit
        await db.documentUpload.update({
          where: { id: uploadId },
          data: { 
            status: 'FAILED',
            metadata: {
              ...upload.metadata as object,
              deletedAt: new Date().toISOString(),
              deletedBy: session.user.id,
            },
          },
        });

        // Audit log
        await db.auditLog.create({
          data: {
            userId: session.user.id,
            institutionId: upload.institutionId,
            action: 'DOCUMENT_DELETED',
            resourceType: 'document_upload',
            resourceId: uploadId,
            oldValues: { status: upload.status },
            newValues: { status: 'FAILED', deleted: true },
          },
        });

        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Document action error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
