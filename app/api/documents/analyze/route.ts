import { analyzeDocument } from '@/lib/document-analysis';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get form data with file
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type and size
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ];

        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        // Check by MIME type or file extension
        const isValidType = validTypes.includes(fileType) ||
            fileName.endsWith('.pdf') ||
            fileName.endsWith('.docx') ||
            fileName.endsWith('.doc') ||
            fileName.endsWith('.txt');

        if (!isValidType) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload PDF, DOCX, DOC, or TXT files.' },
                { status: 400 }
            );
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            );
        }

        // Log the analysis request
        await supabase.from('user_activity_log').insert({
            user_id: user.id,
            activity_type: 'document_analysis_requested',
            activity_data: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            }
        });

        // Perform analysis
        const analysis = await analyzeDocument(file, user.id);

        // Return results
        return NextResponse.json({
            success: true,
            fileName: file.name,
            analysis: analysis
        });

    } catch (error) {
        console.error('Document analysis API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to analyze document',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Helper endpoint to check if real analysis is available
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            return NextResponse.json({
                available: false,
                reason: 'Not authenticated'
            });
        }

        // Check subscription status
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

        // Check if OpenAI is configured
        const hasOpenAI = !!process.env.OPENAI_API_KEY;

        return NextResponse.json({
            available: !!subscription && hasOpenAI,
            isSubscribed: !!subscription,
            hasAIEnabled: hasOpenAI,
            userId: user.id
        });

    } catch (error) {
        return NextResponse.json({
            available: false,
            error: 'Failed to check availability'
        });
    }
}