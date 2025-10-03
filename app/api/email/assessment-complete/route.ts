import { sendAssessmentCompletionEmail, sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'info@northpathstrategies.org';

export async function POST(request: Request) {
    console.log('📧 Assessment completion email endpoint called');
    try {
        const body = await request.json();
        const { email, name, organization, assessmentData } = body;

        console.log('📧 Assessment completion email request:', { email, name, organization });

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Send customer email - wrap in try-catch to prevent blocking
        try {
            await sendAssessmentCompletionEmail({
                email,
                name: name || '',
                organization: organization || '',
                assessmentData: assessmentData || {},
            });
            console.log('✅ Assessment completion email sent to user');
        } catch (emailError) {
            console.error('⚠️ Failed to send assessment completion email to user:', emailError);
            // Don't fail the entire request if user email fails
        }

        // Send admin notification
        const adminHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Assessment Completed!</h1>
            </div>
            <div class="content">
              <h2>User Completed Assessment</h2>
              <div class="info-box">
                <p><strong>Name:</strong> ${name || 'Not provided'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
                <p><strong>Completed At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <h3>Assessment Results</h3>
              <div class="info-box">
                <p><strong>Institution Type:</strong> ${assessmentData.institutionType || 'Not specified'}</p>
                <p><strong>Institution Size:</strong> ${assessmentData.institutionSize || 'Not specified'}</p>
                <p><strong>State:</strong> ${assessmentData.institutionState || 'Not specified'}</p>
                <p><strong>AI Journey Stage:</strong> ${assessmentData.aiJourneyStage || 'Not specified'}</p>
                <p><strong>Biggest Challenge:</strong> ${assessmentData.biggestChallenge || 'Not specified'}</p>
                <p><strong>Top Priorities:</strong> ${assessmentData.topPriorities?.join(', ') || 'Not specified'}</p>
                <p><strong>Timeline:</strong> ${assessmentData.implementationTimeline || 'Not specified'}</p>
                <p><strong>Special Considerations:</strong> ${assessmentData.specialConsiderations || 'None'}</p>
              </div>
              
              <p><strong>Contact Details:</strong></p>
              <div class="info-box">
                <p><strong>Role:</strong> ${assessmentData.contactRole || 'Not specified'}</p>
                <p><strong>Preferred Consultation Time:</strong> ${assessmentData.preferredConsultationTime || 'Not specified'}</p>
              </div>
              
              <p>This user may be ready for a consultation or upgrade to a paid plan.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        try {
            await sendEmail({
                to: ADMIN_EMAIL,
                subject: `Assessment Completed: ${organization || email}`,
                html: adminHtml,
            });
            console.log('✅ Admin notification email sent');
        } catch (adminEmailError) {
            console.error('⚠️ Failed to send admin notification email:', adminEmailError);
            // Don't fail the entire request if admin email fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Error in assessment completion email endpoint:', error);
        // Return success anyway since the assessment is saved
        // Email failures shouldn't block the user
        return NextResponse.json({
            success: true,
            warning: 'Assessment saved but email notification may have failed'
        });
    }
}