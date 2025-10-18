import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface QuickWin {
    priority: string;
    title: string;
    rationale: string;
    timeframe: string;
    category: string;
}

interface Results {
    overallScore: number;
    readinessLevel: string;
    categoryScores: Record<string, number>;
    quickWins: QuickWin[];
    estimatedImpact: {
        costSavings: string;
        timeSaved: string;
        efficiencyGain: string;
    };
    percentile: number;
}

interface LeadData {
    first_name: string;
    last_name: string;
    email: string;
    institution_name: string;
    institution_type: string;
    role: string;
}

function generateUserResultsHTML(leadData: LeadData, results: Results): string {
    const topQuickWins = results.quickWins.slice(0, 3);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Readiness Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 800;">
                Congratulations, ${leadData.first_name}!
              </h1>
              <p style="color: #ffffff; margin: 0; font-size: 16px; opacity: 0.95;">
                Your AI Readiness Results Are Ready
              </p>
            </td>
          </tr>
          
          <!-- Score Section -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); width: 180px; height: 180px; border-radius: 50%; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 20px;">
                      <div style="color: #ffffff; font-size: 64px; font-weight: 800; line-height: 1;">
                        ${results.overallScore}
                      </div>
                      <div style="color: #ffffff; font-size: 14px; opacity: 0.9;">
                        Overall Score
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: 700;">
                      ${results.readinessLevel} Institution
                    </h2>
                    <p style="color: #6b7280; margin: 0; font-size: 16px;">
                      You're ahead of ${results.percentile}% of similar institutions
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Category Scores -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">
                Your Readiness by Category
              </h3>
              ${Object.entries(results.categoryScores).map(([category, score]) => `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #1f2937; font-weight: 600; font-size: 14px;">
                      ${category}
                    </span>
                    <span style="color: #3b82f6; font-weight: 700; font-size: 18px;">
                      ${score}%
                    </span>
                  </div>
                  <div style="width: 100%; height: 10px; background-color: #e5e7eb; border-radius: 999px; overflow: hidden;">
                    <div style="width: ${score}%; height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); border-radius: 999px;"></div>
                  </div>
                </div>
              `).join('')}
            </td>
          </tr>
          
          <!-- Estimated Impact -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px;">
                <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">
                  💡 Estimated Annual Impact
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 10px 0;">
                      <div style="color: #047857; font-size: 12px; font-weight: 600;">Cost Savings</div>
                      <div style="color: #047857; font-size: 24px; font-weight: 800;">${results.estimatedImpact.costSavings}</div>
                    </td>
                    <td style="padding: 10px 0;">
                      <div style="color: #047857; font-size: 12px; font-weight: 600;">Time Saved</div>
                      <div style="color: #047857; font-size: 24px; font-weight: 800;">${results.estimatedImpact.timeSaved}</div>
                    </td>
                    <td style="padding: 10px 0;">
                      <div style="color: #047857; font-size: 12px; font-weight: 600;">Efficiency Gain</div>
                      <div style="color: #047857; font-size: 24px; font-weight: 800;">${results.estimatedImpact.efficiencyGain}</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Top 3 Quick Wins -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">
                🎯 Your Top 3 Quick Wins
              </h3>
              <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 14px;">
                Take these actions in the next 30 days to accelerate your AI readiness:
              </p>
              ${topQuickWins.map((win, index) => `
                <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                  <div style="display: inline-block; background: ${win.priority === 'HIGH' ? '#fee2e2' : win.priority === 'MEDIUM' ? '#fef3c7' : '#dbeafe'}; color: ${win.priority === 'HIGH' ? '#991b1b' : win.priority === 'MEDIUM' ? '#92400e' : '#1e40af'}; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">
                    ${win.priority} PRIORITY
                  </div>
                  <h4 style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">
                    ${index + 1}. ${win.title}
                  </h4>
                  <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 13px;">
                    ${win.rationale}
                  </p>
                  <div style="color: #9ca3af; font-size: 12px;">
                    ⏱️ ${win.timeframe} • 📂 ${win.category}
                  </div>
                </div>
              `).join('')}
            </td>
          </tr>
          
          <!-- CTA Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 30px; text-align: center;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px; font-weight: 700;">
                  Ready to Transform Your AI Strategy?
                </h3>
                <p style="color: #6b7280; margin: 0 0 25px 0; font-size: 14px;">
                  Schedule a personalized demo to see how Education AI Blueprint can accelerate your institution's AI readiness journey.
                </p>
                <a href="https://calendly.com/jeremyestrella/30min" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 15px;">
                  📅 Schedule Demo (30 min)
                </a>
                <br>
                <a href="mailto:info@northpathstrategies.org" style="display: inline-block; background: #f3f4f6; color: #374151; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; border: 2px solid #d1d5db;">
                  ✉️ Email Questions
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 12px; text-align: center;">
                This assessment was completed by ${leadData.first_name} ${leadData.last_name}<br>
                ${leadData.institution_name} • ${leadData.institution_type}
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                Questions? Reply to this email or contact us at 
                <a href="mailto:info@northpathstrategies.org" style="color: #3b82f6;">info@northpathstrategies.org</a>
              </p>
              <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 11px; text-align: center;">
                © 2025 NorthPath Strategies | Education AI Blueprint<br>
                <a href="https://educationaiblueprint.com/privacy" style="color: #9ca3af;">Privacy Policy</a> • 
                <a href="https://educationaiblueprint.com/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
    try {
        const { leadData, results }: { leadData: LeadData; results: Results } = await request.json();

        const htmlContent = generateUserResultsHTML(leadData, results);

        // Send via SendGrid
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: leadData.email, name: `${leadData.first_name} ${leadData.last_name}` }],
                    subject: `Your AI Readiness Results: ${results.overallScore}% (${results.readinessLevel})`
                }],
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL || 'info@northpathstrategies.org',
                    name: 'Jeremy Estrella - Education AI Blueprint'
                },
                reply_to: {
                    email: 'info@northpathstrategies.org',
                    name: 'NorthPath Strategies'
                },
                content: [{
                    type: 'text/html',
                    value: htmlContent
                }]
            })
        });

        if (!sendGridResponse.ok) {
            const errorText = await sendGridResponse.text();
            console.error('SendGrid error:', errorText);
            throw new Error('Failed to send email via SendGrid');
        }

        return NextResponse.json({
            success: true,
            message: 'User results email sent successfully'
        });
    } catch (error) {
        console.error('Error sending user results email:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send user results email'
            },
            { status: 500 }
        );
    }
}
