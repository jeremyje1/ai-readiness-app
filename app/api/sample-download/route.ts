import { NextRequest, NextResponse } from 'next/server';

interface DownloadRequest {
  email: string;
  type: string;
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, type, context = 'K12' }: DownloadRequest = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Define sample types and their corresponding downloads
    const sampleTypes: Record<string, { name: string; description: string; files: string[] }> = {
      // K-12 Samples
      'gap-analysis': {
        name: 'K-12 Gap Analysis Report',
        description: 'COPPA/FERPA compliance analysis from Riverside USD',
        files: ['K12_Gap_Analysis_Sample.pdf', 'Implementation_Checklist.pdf']
      },
      'policy-redlines': {
        name: 'K-12 Policy Redlines',
        description: 'AI policy revisions from Mesa Public Schools',
        files: ['K12_Policy_Redlines_Sample.pdf', 'Legal_Annotation_Guide.pdf']
      },
      'board-deck': {
        name: 'K-12 School Board Presentation',
        description: 'Complete board deck from Austin ISD',
        files: ['K12_Board_Presentation_Sample.pdf', 'Speaking_Notes.pdf']
      },
      // Higher Ed Samples
      'university-gap-analysis': {
        name: 'University Gap Analysis',
        description: 'Institutional compliance analysis from State University System',
        files: ['HigherEd_Gap_Analysis_Sample.pdf', 'Accreditation_Checklist.pdf']
      },
      'faculty-policy-redlines': {
        name: 'Faculty Handbook Redlines',
        description: 'Policy revisions from Regional University',
        files: ['HigherEd_Policy_Redlines_Sample.pdf', 'Academic_Freedom_Framework.pdf']
      },
      'cabinet-deck': {
        name: 'Academic Cabinet Presentation',
        description: 'Leadership presentation from Metropolitan University',
        files: ['HigherEd_Cabinet_Presentation_Sample.pdf', 'Implementation_Strategy.pdf']
      }
    };

    const sample = sampleTypes[type];
    if (!sample) {
      return NextResponse.json({ error: 'Invalid sample type' }, { status: 400 });
    }

    // Log the download request for analytics
    console.log(`Sample download request: ${email} requested ${type} (${context})`);

    // Here you would typically:
    // 1. Store the email in your database/CRM
    // 2. Send the sample files via email service (Postmark, etc.)
    // 3. Track conversion metrics

    // Mock email sending (replace with actual email service)
    const emailContent = generateSampleEmail(email, sample, context);
    
    // In production, you'd send actual files:
    // await sendSampleEmail(email, sample.files, emailContent);

    // For now, just log the request
    console.log('Sample email would be sent:', {
      to: email,
      subject: `Your ${sample.name} Sample - AI Blueprint`,
      files: sample.files,
      context
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Sample artifacts will be sent to your email within 5 minutes'
    });

  } catch (error) {
    console.error('Sample download error:', error);
    return NextResponse.json({ 
      error: 'Failed to process download request' 
    }, { status: 500 });
  }
}

function generateSampleEmail(email: string, sample: any, context: string) {
  const institutionType = context === 'HigherEd' ? 'university' : 'school district';
  const leadershipTerm = context === 'HigherEd' ? 'academic cabinet' : 'school board';
  
  return `
Hi there,

Thank you for your interest in AI Blueprint! As requested, here are your sample artifacts:

📋 ${sample.name}
${sample.description}

These samples show exactly what our AI platform generates for ${institutionType}s like yours:
• Real policy analysis and redlines with legal annotations
• Ready-to-present ${leadershipTerm} materials
• Implementation frameworks and strategic guidance

What's included:
${sample.files.map((file: string) => `• ${file}`).join('\n')}

Ready to see what our platform can do for your ${institutionType}? 
Start your 7-day free trial: https://aiblueprint.k12aiblueprint.com/start?billing=monthly&context=${context}

Questions? Reply to this email - we're here to help!

Best regards,
The AI Blueprint Team

P.S. These samples represent just a fraction of what you'll receive each month. Our 95% AI automation + 5% expert strategy approach ensures you get comprehensive analysis with strategic insights you can trust.
  `;
}

// In production, you'd implement actual email sending:
/*
async function sendSampleEmail(email: string, files: string[], content: string) {
  // Use your email service (Postmark, SendGrid, etc.)
  // Attach the actual sample files
  // Track delivery and engagement
}
*/
