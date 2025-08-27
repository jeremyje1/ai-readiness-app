/**
 * Resources Download API with Email Delivery
 * Streams files immediately and sends email backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResourceById, hasAccessToResource } from '@/lib/resources/catalog';
import { trackResourceDownload } from '@/lib/metrics/events';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { supabase } from '@/lib/supabase';
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

interface DownloadRequest {
  resourceId: string;
  userId?: string;
  email?: string;
  sendEmailBackup?: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return handleDownload({
    resourceId: searchParams.get('id') || '',
    userId: searchParams.get('userId') || undefined,
    email: searchParams.get('email') || undefined,
    sendEmailBackup: searchParams.get('emailBackup') === 'true'
  }, request);
}

export async function POST(request: NextRequest) {
  const body = await request.json() as DownloadRequest;
  return handleDownload(body, request);
}

async function handleDownload(
  { resourceId, userId, email, sendEmailBackup = true }: DownloadRequest,
  request: NextRequest
) {
  try {
    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
    }

    // Get resource
    const resource = getResourceById(resourceId);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Get audience from cookie
    const audience = getAudienceCookie(request) || 'k12';

    // Check access permissions
    const userTier = await getUserTier(userId);
    const isAuthenticated = !!userId;
    
    if (!hasAccessToResource(resource, userTier, isAuthenticated)) {
      return NextResponse.json({ 
        error: 'Access denied',
        details: {
          requiresAuth: resource.requiresAuth,
          tierRequired: resource.tierRequired,
          userTier,
          isAuthenticated
        }
      }, { status: 403 });
    }

    // Track download event
    trackResourceDownload({
      resourceId: resource.id,
      resourceType: resource.type,
      resourceTitle: resource.title,
      userId,
      audience
    });

    // Get file path
    if (!resource.file) {
      return NextResponse.json({ error: 'Resource file not available' }, { status: 404 });
    }

    const filePath = join(process.cwd(), 'public', resource.file);
    
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    // Get file stats
    const stats = statSync(filePath);
    const fileSize = stats.size;

    // Set response headers for download
    const fileName = getFileName(resource);
    const mimeType = getMimeType(resource.format);

    const headers = new Headers({
      'Content-Type': mimeType,
      'Content-Length': fileSize.toString(),
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, max-age=0',
      'X-Resource-Id': resource.id,
      'X-Resource-Type': resource.type,
    });

    // Send email backup asynchronously (don't wait for it)
    if (sendEmailBackup && (email || userId)) {
      sendEmailBackup(resource, { userId, email }).catch(error => {
        console.error('Failed to send email backup:', error);
      });
    }

    // Log successful download
    console.log(`📥 Resource download:`, {
      resourceId: resource.id,
      title: resource.title,
      userId: userId || 'anonymous',
      audience,
      fileSize
    });

    // Stream file
    const stream = createReadStream(filePath);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to download resource' },
      { status: 500 }
    );
  }
}

/**
 * Get user tier from database
 */
async function getUserTier(userId?: string): Promise<'basic' | 'comprehensive' | 'enterprise' | undefined> {
  if (!userId) return undefined;

  try {
    const { data: payment } = await supabase
      .from('user_payments')
      .select('tier, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return payment?.tier as 'basic' | 'comprehensive' | 'enterprise' | undefined;
  } catch (error) {
    console.warn('Could not fetch user tier:', error);
    return 'basic'; // Default fallback
  }
}

/**
 * Generate appropriate filename
 */
function getFileName(resource: any): string {
  const sanitizedTitle = resource.title
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  const extension = getFileExtension(resource.format);
  const version = resource.version ? `_v${resource.version}` : '';
  
  return `${sanitizedTitle}${version}.${extension}`;
}

/**
 * Get file extension from format
 */
function getFileExtension(format: string): string {
  const extensions = {
    'pdf': 'pdf',
    'docx': 'docx',
    'xlsx': 'xlsx',
    'pptx': 'pptx',
    'zip': 'zip',
    'txt': 'txt'
  };
  return extensions[format as keyof typeof extensions] || 'pdf';
}

/**
 * Get MIME type from format
 */
function getMimeType(format: string): string {
  const mimeTypes = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'zip': 'application/zip',
    'txt': 'text/plain'
  };
  return mimeTypes[format as keyof typeof mimeTypes] || 'application/octet-stream';
}

/**
 * Send email backup of resource
 */
async function sendEmailBackup(resource: any, options: { userId?: string; email?: string }): Promise<void> {
  try {
    let userEmail = options.email;

    // Get user email if not provided
    if (!userEmail && options.userId) {
      const { data: user } = await supabase.auth.admin.getUserById(options.userId);
      userEmail = user?.user?.email;
    }

    if (!userEmail) {
      console.warn('No email available for backup delivery');
      return;
    }

    // Prepare email data
    const emailData = {
      to: userEmail,
      subject: `Your ${resource.title} - AI Blueprint Resource`,
      html: generateEmailHTML(resource),
      attachments: [{
        filename: getFileName(resource),
        path: join(process.cwd(), 'public', resource.file),
        contentType: getMimeType(resource.format)
      }]
    };

    // TODO: Replace with your email service (SendGrid, Postmark, etc.)
    await sendEmail(emailData);

    console.log(`📧 Email backup sent:`, {
      resourceId: resource.id,
      email: userEmail,
      title: resource.title
    });

  } catch (error) {
    console.error('Email backup failed:', error);
    throw error;
  }
}

/**
 * Generate email HTML content
 */
function generateEmailHTML(resource: any): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e3a8a;">AI Blueprint Resources</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #374151; margin-top: 0;">${resource.title}</h2>
          <p style="color: #6b7280; margin-bottom: 15px;">${resource.description}</p>
          
          <div style="display: flex; gap: 20px; margin-bottom: 15px;">
            <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${resource.type.toUpperCase()}
            </span>
            <span style="background: #f3f4f6; color: #4b5563; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${resource.format.toUpperCase()}
            </span>
            ${resource.pageCount ? `<span style="background: #f3f4f6; color: #4b5563; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${resource.pageCount} pages</span>` : ''}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>Category:</strong> ${resource.category}<br>
            <strong>Last Updated:</strong> ${new Date(resource.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Resource Attached</h3>
          <p style="color: #6b7280;">
            Your requested resource is attached to this email. You can also access it anytime through your AI Blueprint dashboard.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Thank you for using AI Blueprint Resources</p>
          <p>Questions? Contact us at support@ai-blueprint.com</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email using configured email service
 */
async function sendEmail(emailData: any): Promise<void> {
  // TODO: Replace with actual email service implementation
  
  if (process.env.POSTMARK_API_TOKEN) {
    // Example using Postmark
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_API_TOKEN
      },
      body: JSON.stringify({
        From: process.env.POSTMARK_FROM_EMAIL || 'resources@ai-blueprint.com',
        To: emailData.to,
        Subject: emailData.subject,
        HtmlBody: emailData.html,
        // Note: Postmark handles attachments differently
        // You might need to upload to cloud storage and link instead
      })
    });

    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`);
    }
  } else {
    // Mock email sending for development
    console.log('📧 Mock email sent:', {
      to: emailData.to,
      subject: emailData.subject,
      attachments: emailData.attachments?.length || 0
    });
  }
}