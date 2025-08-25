/**
 * Assessment 2.0 Document Upload API
 * Handles file upload with security scanning and processing
 * 
 * @version 1.0.0
 * @author Staff Software Engineer
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DocumentProcessingQueue } from '@/lib/queues/document-processing';
import { PiiScanner } from '@/lib/security/pii-scanner';
import { VirusScanner } from '@/lib/security/virus-scanner';

const uploadSchema = z.object({
  institutionId: z.string().uuid(),
  documentType: z.enum(['policy', 'handbook', 'contract']),
});

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const institutionId = formData.get('institutionId') as string;
    const documentType = formData.get('documentType') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validation = uploadSchema.safeParse({ institutionId, documentType });
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 50MB.' 
      }, { status: 400 });
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, Word documents, and text files are allowed.' 
      }, { status: 400 });
    }

    // Verify user access to institution
    const institutionUser = await db.institutionUser.findFirst({
      where: {
        institutionId,
        userId: session.user.id,
        active: true,
      },
    });

    if (!institutionUser) {
      return NextResponse.json({ 
        error: 'Access denied to institution' 
      }, { status: 403 });
    }

    // Generate unique file ID and storage path
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${fileId}.${fileExtension}`;
    const uploadDir = join(process.cwd(), 'uploads', 'documents');
    const filePath = join(uploadDir, fileName);

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());

    // Virus scan first
    const virusScanner = new VirusScanner();
    const virusScanResult = await virusScanner.scan(buffer);
    
    if (virusScanResult.infected) {
      return NextResponse.json({ 
        error: 'File failed security scan',
        reason: 'malware_detected'
      }, { status: 400 });
    }

    // Write file to disk
    await writeFile(filePath, buffer);

    // Create database record
    const upload = await db.documentUpload.create({
      data: {
        id: fileId,
        userId: session.user.id,
        institutionId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storageUrl: filePath,
        status: 'UPLOADED',
        metadata: {
          originalName: file.name,
          documentType,
          uploadedAt: new Date().toISOString(),
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      },
    });

    // Queue for processing
    const queue = new DocumentProcessingQueue();
    await queue.add('process-document', {
      uploadId: fileId,
      filePath,
      documentType,
      priority: 'normal',
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        institutionId,
        action: 'DOCUMENT_UPLOADED',
        resourceType: 'document_upload',
        resourceId: fileId,
        newValues: {
          fileName: file.name,
          fileSize: file.size,
          documentType,
        },
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        status: upload.status,
        createdAt: upload.createdAt,
      },
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ 
        error: 'Institution ID required' 
      }, { status: 400 });
    }

    // Verify access
    const institutionUser = await db.institutionUser.findFirst({
      where: {
        institutionId,
        userId: session.user.id,
        active: true,
      },
    });

    if (!institutionUser) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    // Get uploads for institution
    const uploads = await db.documentUpload.findMany({
      where: { institutionId },
      include: {
        processingResult: {
          include: {
            gapAnalyses: true,
            policyRedlines: true,
            generatedArtifacts: true,
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ uploads });

  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
