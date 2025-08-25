/**
 * Document Upload and Processing API Endpoint
 * Handles file uploads and initiates processing pipeline
 * 
 * @version 2.0.0
 * @author NorthPath Strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessingPipeline, DocumentUpload } from '@/lib/document-processing-pipeline';
import { supabase } from '@/lib/supabase';

// Supported file types and their processing methods
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'text/html': 'html',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image'
} as const;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES_PER_UPLOAD = 20;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const institutionType = formData.get('institutionType') as 'K12' | 'HigherEd' || 'K12';
    const assessmentId = formData.get('assessmentId') as string;

    // Validation
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_FILES_PER_UPLOAD} files allowed` },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} exceeds 50MB limit` },
          { status: 400 }
        );
      }

      if (!SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]) {
        return NextResponse.json(
          { success: false, error: `File type ${file.type} not supported` },
          { status: 400 }
        );
      }
    }

    // Process each file
    const pipeline = new DocumentProcessingPipeline(institutionType);
    const results = [];

    for (const file of files) {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const content = await extractTextContent(file);
      
      const documentUpload: DocumentUpload = {
        id: documentId,
        filename: file.name,
        type: SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES],
        content,
        metadata: {
          size: file.size,
          author: undefined,
          createdDate: undefined,
          modifiedDate: new Date()
        },
        institutionType,
        uploadedAt: new Date()
      };

      // Store document in database
      const { error: dbError } = await supabase
        .from('document_uploads')
        .insert({
          id: documentId,
          assessment_id: assessmentId,
          filename: file.name,
          file_type: documentUpload.type,
          file_size: file.size,
          institution_type: institutionType,
          upload_status: 'processing',
          uploaded_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error:', dbError);
      }

      // Process document
      const processingResult = await pipeline.processDocument(documentUpload);
      
      // Update database with results
      await supabase
        .from('document_uploads')
        .update({
          upload_status: processingResult.status,
          processing_time: processingResult.processingTime,
          pii_detected: processingResult.piiDetections.length > 0,
          frameworks_analyzed: processingResult.frameworkMappings.length,
          artifacts_generated: processingResult.outputArtifacts.length,
          airix_score: processingResult.algorithmicScoring.airix,
          airs_score: processingResult.algorithmicScoring.airs,
          aics_score: processingResult.algorithmicScoring.aics,
          aims_score: processingResult.algorithmicScoring.aims,
          aips_score: processingResult.algorithmicScoring.aips,
          aibs_score: processingResult.algorithmicScoring.aibs,
          composite_score: processingResult.algorithmicScoring.composite
        })
        .eq('id', documentId);

      results.push({
        documentId,
        filename: file.name,
        status: processingResult.status,
        piiDetected: processingResult.piiDetections.length,
        artifactsGenerated: processingResult.outputArtifacts.length,
        processingTime: processingResult.processingTime,
        scores: processingResult.algorithmicScoring,
        artifacts: processingResult.outputArtifacts.map(artifact => ({
          type: artifact.type,
          title: artifact.title,
          format: artifact.format,
          downloadUrl: artifact.downloadUrl
        }))
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        filesProcessed: files.length,
        results,
        summary: {
          totalPiiDetections: results.reduce((sum, r) => sum + r.piiDetected, 0),
          totalArtifacts: results.reduce((sum, r) => sum + r.artifactsGenerated, 0),
          averageProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0) / results.length,
          overallScore: results.reduce((sum, r) => sum + r.scores.composite, 0) / results.length
        }
      }
    });

  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process documents' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const documentId = searchParams.get('documentId');

    if (documentId) {
      // Get specific document results
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Document not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

    if (assessmentId) {
      // Get all documents for assessment
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch documents' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { success: false, error: 'assessmentId or documentId required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * Extract text content from uploaded file
 * In production, this would use proper libraries for each file type
 */
async function extractTextContent(file: File): Promise<string> {
  const fileType = file.type;
  
  if (fileType.includes('text') || fileType.includes('html')) {
    return await file.text();
  }
  
  if (fileType.includes('pdf')) {
    // In production, would use pdf-parse or similar
    return `[PDF Content from ${file.name}] - PDF parsing would be implemented here with proper libraries`;
  }
  
  if (fileType.includes('word') || fileType.includes('docx')) {
    // In production, would use mammoth or similar
    return `[DOCX Content from ${file.name}] - Word document parsing would be implemented here`;
  }
  
  if (fileType.includes('presentation') || fileType.includes('pptx')) {
    // In production, would use proper PPTX parser
    return `[PPTX Content from ${file.name}] - PowerPoint parsing would be implemented here`;
  }
  
  if (fileType.includes('spreadsheet') || fileType.includes('xlsx') || fileType.includes('csv')) {
    // In production, would use xlsx or csv-parse
    return `[Spreadsheet Content from ${file.name}] - Excel/CSV parsing would be implemented here`;
  }
  
  if (fileType.includes('image')) {
    // In production, would use OCR (Tesseract.js or cloud OCR)
    return `[Image Content from ${file.name}] - OCR text extraction would be implemented here`;
  }
  
  return `[Unknown file type: ${fileType}] - Content extraction not implemented for this type`;
}
