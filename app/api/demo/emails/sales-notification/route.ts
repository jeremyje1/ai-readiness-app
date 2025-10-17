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
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  institution_name: string;
  institution_type: string;
  role: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  lead_qualification?: string;
}

function generateTalkingPoints(leadData: LeadData, results: Results): string[] {
  const points: string[] = [];
  
  // Score-based talking points
  if (results.overallScore >= 75) {
    points.push(`Strong foundation - focus on advanced features and ROI acceleration`);
  } else if (results.overallScore >= 50) {
    points.push(`Mid-journey institution - emphasize structured roadmap and quick wins`);
  } else {
    points.push(`Early stage - position as comprehensive guidance from ground up`);
  }
  
  // Category-specific talking points
  const sortedCategories = Object.entries(results.categoryScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2);
  
  sortedCategories.forEach(([category, score]) => {
    if (category === 'Strategy & Vision' && score < 50) {
      points.push(`Needs help with AI strategic planning - discuss blueprint framework`);
    }
    if (category === 'Leadership & Governance' && score < 50) {
      points.push(`Governance gaps - emphasize cross-functional coordination tools`);
    }
    if (category === 'Faculty & Staff Readiness' && score < 50) {
      points.push(`Low faculty buy-in - highlight professional development resources`);
    }
    if (category === 'Technology Infrastructure' && score < 50) {
      points.push(`Infrastructure concerns - discuss integration capabilities`);
    }
    if (category === 'Data & Privacy' && score < 50) {
      points.push(`Privacy/compliance anxiety - emphasize FERPA-compliant policies`);
    }
  });
  
  // Role-based talking points
  if (leadData.role.includes('CIO') || leadData.role.includes('CTO')) {
    points.push(`Technical decision-maker - focus on integrations, security, scalability`);
  } else if (leadData.role.includes('President') || leadData.role.includes('Superintendent')) {
    points.push(`C-suite leader - emphasize strategic outcomes and institutional impact`);
  } else if (leadData.role.includes('Provost') || leadData.role.includes('Academic')) {
    points.push(`Academic leader - highlight pedagogy and learning outcomes`);
  }
  
  return points;
}

function generateSalesNotificationHTML(leadData: LeadData, results: Results): string {
  const talkingPoints = generateTalkingPoints(leadData, results);
  const qualification = leadData.lead_qualification || 'WARM';
  const qualificationColor = qualification === 'HOT' ? '#ef4444' : qualification === 'WARM' ? '#f59e0b' : '#6b7280';
  const qualificationEmoji = qualification === 'HOT' ? '🔥' : qualification === 'WARM' ? '⚡' : '❄️';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Demo Lead: ${leadData.institution_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 30px; border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">
                ${qualificationEmoji} New Demo Lead
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                Assessment completed ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </td>
          </tr>
          
          <!-- Lead Qualification Badge -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <div style="background: ${qualificationColor}; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: 700; font-size: 18px; letter-spacing: 0.05em;">
                ${qualification} LEAD
              </div>
            </td>
          </tr>
          
          <!-- Lead Information -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">
                Lead Information
              </h2>
              <table width="100%" cellpadding="8" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr style="background: #f9fafb;">
                  <td style="color: #6b7280; font-weight: 600; font-size: 13px; padding: 12px;">Name</td>
                  <td style="color: #1f2937; font-weight: 600; font-size: 14px; padding: 12px;">${leadData.first_name} ${leadData.last_name}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: 600; font-size: 13px; padding: 12px; border-top: 1px solid #e5e7eb;">Email</td>
                  <td style="color: #1f2937; font-size: 14px; padding: 12px; border-top: 1px solid #e5e7eb;">
                    <a href="mailto:${leadData.email}" style="color: #3b82f6; text-decoration: none;">${leadData.email}</a>
                  </td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="color: #6b7280; font-weight: 600; font-size: 13px; padding: 12px; border-top: 1px solid #e5e7eb;">Institution</td>
                  <td style="color: #1f2937; font-weight: 600; font-size: 14px; padding: 12px; border-top: 1px solid #e5e7eb;">${leadData.institution_name}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: 600; font-size: 13px; padding: 12px; border-top: 1px solid #e5e7eb;">Type</td>
                  <td style="color: #1f2937; font-size: 14px; padding: 12px; border-top: 1px solid #e5e7eb;">${leadData.institution_type}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="color: #6b7280; font-weight: 600; font-size: 13px; padding: 12px; border-top: 1px solid #e5e7eb;">Role</td>
                  <td style="color: #1f2937; font-size: 14px; padding: 12px; border-top: 1px solid #e5e7eb;">${leadData.role}</td>
                </tr>
                ${leadData.utm_source ? `
                <tr>
                  <td style="color: #6b7280; font-weight: 600; font-size: 13px; padding: 12px; border-top: 1px solid #e5e7eb;">Source</td>
                  <td style="color: #1f2937; font-size: 14px; padding: 12px; border-top: 1px solid #e5e7eb;">
                    ${leadData.utm_source}${leadData.utm_campaign ? ` / ${leadData.utm_campaign}` : ''}
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
          
          <!-- Assessment Results -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">
                Assessment Results
              </h2>
              
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                <div style="color: #ffffff; font-size: 48px; font-weight: 800; margin-bottom: 5px;">
                  ${results.overallScore}%
                </div>
                <div style="color: #ffffff; font-size: 18px; font-weight: 600; opacity: 0.95;">
                  ${results.readinessLevel} Institution
                </div>
                <div style="color: #ffffff; font-size: 14px; opacity: 0.9; margin-top: 5px;">
                  Top ${results.percentile}% percentile
                </div>
              </div>
              
              <!-- Category Breakdown -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 700;">
                  Category Scores
                </h3>
                ${Object.entries(results.categoryScores).map(([category, score]) => `
                  <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span style="color: #6b7280; font-size: 13px; font-weight: 600;">${category}</span>
                      <span style="color: #1f2937; font-size: 14px; font-weight: 700;">${score}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 999px;">
                      <div style="width: ${score}%; height: 100%; background: ${score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#10b981'}; border-radius: 999px;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </td>
          </tr>
          
          <!-- Talking Points -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">
                💡 Talking Points
              </h2>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                ${talkingPoints.map(point => `<li style="margin-bottom: 8px;">${point}</li>`).join('')}
              </ul>
            </td>
          </tr>
          
          <!-- Top Quick Wins Assigned -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">
                🎯 Quick Wins They Received
              </h2>
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${results.quickWins.slice(0, 3).map((win, index) => `
                  <div style="margin-bottom: ${index < 2 ? '12px' : '0'};">
                    <strong style="color: #1f2937; font-size: 14px;">${index + 1}. ${win.title}</strong>
                    <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">
                      <span style="background: ${win.priority === 'HIGH' ? '#fee2e2' : '#fef3c7'}; color: ${win.priority === 'HIGH' ? '#991b1b' : '#92400e'}; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 10px;">${win.priority}</span>
                      • ${win.timeframe} • ${win.category}
                    </div>
                  </div>
                `).join('')}
              </div>
            </td>
          </tr>
          
          <!-- Action Items -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">
                ⚡ Quick Actions
              </h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <a href="mailto:${leadData.email}?subject=Re: Your AI Readiness Assessment Results&body=Hi ${leadData.first_name},%0D%0A%0D%0AI reviewed your AI Readiness Assessment results and would love to discuss how Education AI Blueprint can help ${leadData.institution_name} achieve its AI goals.%0D%0A%0D%0AWould you be available for a brief 30-minute demo this week?%0D%0A%0D%0ABest regards,%0D%0AJeremy Estrella" 
                   style="display: block; background: #3b82f6; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; font-size: 14px;">
                  ✉️ Email Lead
                </a>
                <a href="https://aiblueprint.educationaiblueprint.com/admin/leads/${leadData.id}" 
                   style="display: block; background: #f3f4f6; color: #374151; padding: 14px 20px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; font-size: 14px; border: 2px solid #d1d5db;">
                  👤 View Profile
                </a>
              </div>
              <a href="https://calendly.com/jeremyestrella/30min" 
                 style="display: block; background: #10b981; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; font-size: 14px; margin-top: 12px;">
                📅 Schedule Follow-up Call
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; background: #f9fafb; border-radius: 0 0 16px 16px;">
              <p style="color: #6b7280; margin: 0; font-size: 12px; text-align: center;">
                🤖 This is an automated notification from the Education AI Blueprint demo assessment system.<br>
                Lead ID: ${leadData.id}
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
    
    const htmlContent = generateSalesNotificationHTML(leadData, results);
    const qualification = leadData.lead_qualification || 'WARM';
    const qualificationEmoji = qualification === 'HOT' ? '🔥' : qualification === 'WARM' ? '⚡' : '❄️';
    
    // Send via SendGrid to sales team
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [
            { 
              email: process.env.SENDGRID_TO_EMAIL || 'info@northpathstrategies.org',
              name: 'Jeremy Estrella'
            }
          ],
          subject: `${qualificationEmoji} ${qualification} Lead: ${leadData.institution_name} - ${results.overallScore}% Ready (${results.readinessLevel})`
        }],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'info@northpathstrategies.org',
          name: 'Education AI Blueprint Demo System'
        },
        reply_to: {
          email: leadData.email,
          name: `${leadData.first_name} ${leadData.last_name}`
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
      throw new Error('Failed to send sales notification via SendGrid');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sales notification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending sales notification email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send sales notification email'
      },
      { status: 500 }
    );
  }
}
