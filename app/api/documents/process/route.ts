import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mammoth from 'mammoth';

// Dynamic import for pdf-parse to avoid build issues
let pdfParse: any = null;
try {
  pdfParse = require('pdf-parse');
} catch (error) {
  console.warn('pdf-parse not available, PDF processing will be skipped');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { document_id, user_id } = await request.json();

    if (!document_id || !user_id) {
      return NextResponse.json({ error: 'Missing document_id or user_id' }, { status: 400 });
    }

    // Get document record
    const { data: document, error: docError } = await supabase
      .from('uploaded_documents')
      .select('*')
      .eq('id', document_id)
      .eq('user_id', user_id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update status to processing
    await supabase
      .from('uploaded_documents')
      .update({ processing_status: 'processing' })
      .eq('id', document_id);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      await supabase
        .from('uploaded_documents')
        .update({
          processing_status: 'failed',
          error_message: 'Failed to download file'
        })
        .eq('id', document_id);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Extract text based on file type
    let extractedText = '';
    try {
      const buffer = Buffer.from(await fileData.arrayBuffer());

      if (document.file_name.toLowerCase().endsWith('.pdf')) {
        if (pdfParse) {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } else {
          extractedText = '[PDF processing not available - please use DOCX format]';
        }
      } else if (document.file_name.toLowerCase().endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (document.file_name.toLowerCase().endsWith('.doc')) {
        // For older .doc files, just store a placeholder
        // In production, would use a library like antiword or textract
        extractedText = '[Legacy Word document - text extraction requires additional libraries]';
      } else {
        extractedText = '[Unsupported file format for text extraction]';
      }
    } catch (extractError: any) {
      console.error('Text extraction error:', extractError);
      await supabase
        .from('uploaded_documents')
        .update({
          processing_status: 'failed',
          error_message: `Text extraction failed: ${extractError.message}`
        })
        .eq('id', document_id);
      return NextResponse.json({ error: 'Text extraction failed' }, { status: 500 });
    }

    // Update document with extracted text
    await supabase
      .from('uploaded_documents')
      .update({
        processing_status: 'completed',
        extracted_text: extractedText,
        processed_at: new Date().toISOString()
      })
      .eq('id', document_id);

    return NextResponse.json({
      success: true,
      document_id,
      text_length: extractedText.length
    });

  } catch (error: any) {
    console.error('Document processing error:', error);
    return NextResponse.json({
      error: 'Processing failed',
      details: error.message
    }, { status: 500 });
  }
}
