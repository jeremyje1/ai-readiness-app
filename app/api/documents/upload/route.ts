import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const userId = formData.get('user_id') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!documentType) {
      return NextResponse.json({ error: 'No document type provided' }, { status: 400 });
    }

    // Validate user ID matches authenticated user
    if (userId !== user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and Word documents are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${documentType}/${timestamp}_${sanitizedFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
    }

    // Create database record
    const { data: docRecord, error: dbError } = await supabase
      .from('uploaded_documents')
      .insert({
        user_id: userId,
        document_type: documentType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        processing_status: 'pending',
        upload_date: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([filePath]);
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
    }

    // Trigger background processing (non-blocking)
    fetch(`${request.nextUrl.origin}/api/documents/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: docRecord.id,
        user_id: userId
      })
    }).catch(err => {
      console.error('Failed to trigger document processing:', err);
    });

    return NextResponse.json({
      success: true,
      document: docRecord
    }, { status: 200 });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error.message
    }, { status: 500 });
  }
}
