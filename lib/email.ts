const POSTMARK_API_URL = 'https://api.postmarkapp.com/email';
const POSTMARK_TOKEN = process.env.POSTMARK_API_TOKEN || '455001d4-2657-4b12-bfc7-66c63734daf8';
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'info@northpathstrategies.org';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@northpathstrategies.org';
const MESSAGE_STREAM = process.env.POSTMARK_MESSAGE_STREAM || 'aiblueprint-transactional';

interface EmailData {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailData) {
    try {
        const response = await fetch(POSTMARK_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Postmark-Server-Token': POSTMARK_TOKEN,
            },
            body: JSON.stringify({
                From: FROM_EMAIL,
                To: to,
                Subject: subject,
                HtmlBody: html,
                TextBody: text,
                MessageStream: MESSAGE_STREAM,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Postmark API error:', error);
            throw new Error(`Failed to send email: ${error.Message || response.statusText}`);
        }

        const result = await response.json();
        console.log('Email sent successfully:', result.MessageID);
        return result;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

export async function sendWelcomeEmail(userData: {
    email: string;
    name: string;
    organization: string;
    institutionType: string;
    assessmentData?: any;
}) {
    const { email, name, organization, institutionType, assessmentData } = userData;

    // Customer welcome email
    const customerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .results-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AI Blueprint for Education!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name || 'there'}!</h2>
            <p>Thank you for signing up for AI Blueprint for Education. We're excited to help ${organization} on its AI transformation journey!</p>
            
            ${assessmentData ? `
              <div class="results-box">
                <h3>Your Quick Assessment Results</h3>
                <p><strong>Institution Type:</strong> ${institutionType === 'K12' ? 'K-12 School District' : 'Higher Education Institution'}</p>
                <p><strong>AI Journey Stage:</strong> ${assessmentData.aiJourneyStage || 'Getting Started'}</p>
                <p><strong>Top Priority:</strong> ${assessmentData.topPriorities?.[0] || 'Strategic Planning'}</p>
                <p><strong>Timeline:</strong> ${assessmentData.implementationTimeline || 'Planning Phase'}</p>
              </div>
            ` : ''}

            <h3>What AI Blueprint Offers:</h3>
            <ul>
              <li><strong>Comprehensive AI Readiness Assessment</strong> - Evaluate your institution's current AI capabilities</li>
              <li><strong>Personalized Dashboard</strong> - Track progress and get tailored recommendations</li>
              <li><strong>Policy Templates & Frameworks</strong> - Ready-to-use governance documents</li>
              <li><strong>Strategic Roadmaps</strong> - Clear implementation pathways for your institution</li>
              <li><strong>Expert Support</strong> - Guidance from education AI specialists</li>
            </ul>

            <h3>Your 7-Day Free Trial</h3>
            <p>You have full access to all features for the next 7 days. Explore the platform and discover how AI Blueprint can transform your institution.</p>
            
            <center>
              <a href="https://aiblueprint.educationaiblueprint.com/dashboard/personalized" class="button">View Your Dashboard</a>
            </center>

            <h3>Ready to Take the Next Step?</h3>
            <p>After exploring the platform, you can:</p>
            <ul>
              <li><strong>Upgrade to a paid plan</strong> for continued access ($199/month)</li>
              <li><strong>Schedule a consultation</strong> with our founder Jeremy Estrella to discuss AI implementation at your ${institutionType === 'K12' ? 'district' : 'institution'}</li>
            </ul>
            
            <center>
              <a href="https://calendly.com/jeremyestrella/30min" class="button">Schedule Free Consultation</a>
            </center>

            <p>Have questions? Feel free to reply to this email or reach out at info@northpathstrategies.org</p>
          </div>
          <div class="footer">
            <p>© 2025 NorthPath Strategies | AI Blueprint for Education</p>
            <p>Jeremy Estrella, Founder/CEO</p>
          </div>
        </div>
      </body>
    </html>
  `;

    // Admin notification email
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
            <h1>New AI Blueprint Sign-up!</h1>
          </div>
          <div class="content">
            <h2>New User Registration</h2>
            <div class="info-box">
              <p><strong>Name:</strong> ${name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
              <p><strong>Institution Type:</strong> ${institutionType === 'K12' ? 'K-12 School District' : 'Higher Education'}</p>
              <p><strong>Sign-up Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            ${assessmentData ? `
              <h3>Assessment Data</h3>
              <div class="info-box">
                <p><strong>AI Journey Stage:</strong> ${assessmentData.aiJourneyStage || 'Not specified'}</p>
                <p><strong>Biggest Challenge:</strong> ${assessmentData.biggestChallenge || 'Not specified'}</p>
                <p><strong>Top Priorities:</strong> ${assessmentData.topPriorities?.join(', ') || 'Not specified'}</p>
                <p><strong>Timeline:</strong> ${assessmentData.implementationTimeline || 'Not specified'}</p>
              </div>
            ` : '<p><em>User has not completed assessment yet.</em></p>'}
            
            <p><strong>Trial Status:</strong> 7-day free trial started</p>
          </div>
        </div>
      </body>
    </html>
  `;

    // Send both emails
    const emailPromises = [
        // Customer email
        sendEmail({
            to: email,
            subject: 'Welcome to AI Blueprint for Education - Your AI Transformation Journey Begins!',
            html: customerHtml,
        }),
        // Admin notification
        sendEmail({
            to: ADMIN_EMAIL,
            subject: `New AI Blueprint Sign-up: ${organization || email}`,
            html: adminHtml,
        }),
    ];

    try {
        await Promise.all(emailPromises);
        console.log('Welcome emails sent successfully');
    } catch (error) {
        console.error('Error sending welcome emails:', error);
        // Don't throw - we don't want email failures to break the signup flow
    }
}

export async function sendAssessmentCompletionEmail(userData: {
    email: string;
    name: string;
    organization: string;
    assessmentData: any;
}) {
    const { email, name, organization, assessmentData } = userData;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .results-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Assessment Complete!</h1>
          </div>
          <div class="content">
            <h2>Great job, ${name}!</h2>
            <p>You've completed the AI readiness assessment for ${organization}. Here's what we learned:</p>
            
            <div class="results-box">
              <h3>Your Assessment Summary</h3>
              <p><strong>AI Journey Stage:</strong> ${assessmentData.aiJourneyStage}</p>
              <p><strong>Top Priorities:</strong> ${assessmentData.topPriorities?.join(', ')}</p>
              <p><strong>Timeline:</strong> ${assessmentData.implementationTimeline}</p>
              <p><strong>Biggest Challenge:</strong> ${assessmentData.biggestChallenge}</p>
            </div>

            <p>Your personalized dashboard is now ready with tailored recommendations based on your assessment!</p>
            
            <center>
              <a href="https://aiblueprint.educationaiblueprint.com/dashboard/personalized" class="button">View Your Recommendations</a>
            </center>

            <h3>Next Steps</h3>
            <p>To continue your AI transformation journey after your trial:</p>
            <ul>
              <li>Subscribe to AI Blueprint for Education ($199/month)</li>
              <li>Schedule a consultation call to discuss implementation strategies</li>
            </ul>
            
            <center>
              <a href="https://calendly.com/jeremyestrella/30min" class="button">Schedule Consultation</a>
            </center>
          </div>
        </div>
      </body>
    </html>
  `;

    try {
        await sendEmail({
            to: email,
            subject: 'Your AI Blueprint Assessment Results Are Ready!',
            html: html,
        });
    } catch (error) {
        console.error('Error sending assessment completion email:', error);
    }
}