interface MonthlyTrendsData {
    userName: string;
    institutionName: string;
    month: string;
    keyInsights: {
        title: string;
        impact: 'high' | 'medium' | 'low';
        description: string;
    }[];
    competitivePosition: {
        metric: string;
        yourScore: number;
        peerAverage: number;
    }[];
    recommendedActions: {
        action: string;
        deadline: string;
        effort: 'low' | 'medium' | 'high';
    }[];
    newPolicies: string[];
}

export const premiumMonthlyTrendsTemplate = (data: MonthlyTrendsData) => ({
    subject: `🚀 Your ${data.month} AI Trends Report is Ready!`,
    htmlBody: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">${data.month} AI Trends Report</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 18px;">Personalized insights for ${data.institutionName}</p>
      </div>
      
      <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hi ${data.userName},</p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
          Your monthly AI trends report is ready! We've analyzed the latest developments in educational AI 
          and identified key opportunities specifically relevant to your institution.
        </p>

        <!-- Key Insights -->
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #1e40af; font-size: 20px;">🎯 Key Insights This Month</h2>
          ${data.keyInsights.map(insight => `
            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #dbeafe;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-weight: bold; color: #1e40af;">${insight.title}</span>
                <span style="background: ${insight.impact === 'high' ? '#dc2626' :
            insight.impact === 'medium' ? '#f59e0b' :
                '#10b981'
        }; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                  ${insight.impact.toUpperCase()} IMPACT
                </span>
              </div>
              <p style="margin: 0; color: #3730a3; font-size: 14px;">${insight.description}</p>
            </div>
          `).join('')}
        </div>

        <!-- Competitive Position -->
        <div style="margin-bottom: 24px;">
          <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">📊 Your Competitive Position</h2>
          ${data.competitivePosition.map(metric => {
            const percentage = Math.round((metric.yourScore / metric.peerAverage) * 100);
            const isAbove = percentage >= 100;
            return `
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #4b5563;">${metric.metric}</span>
                  <span style="color: ${isAbove ? '#10b981' : '#ef4444'}; font-weight: bold;">
                    ${isAbove ? '+' : ''}${percentage - 100}% vs peers
                  </span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background: ${isAbove ? '#10b981' : '#ef4444'}; height: 100%; width: ${Math.min(percentage, 150)}%; max-width: 100%;"></div>
                </div>
              </div>
            `;
        }).join('')}
        </div>

        <!-- Recommended Actions -->
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #92400e; font-size: 20px;">✅ Recommended Actions</h2>
          ${data.recommendedActions.map(action => `
            <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
              <div style="flex: 1;">
                <p style="margin: 0; color: #92400e; font-weight: 500;">${action.action}</p>
                <p style="margin: 4px 0 0 0; color: #b45309; font-size: 14px;">
                  By ${action.deadline} • ${action.effort} effort
                </p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- New Policies -->
        ${data.newPolicies.length > 0 ? `
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #065f46; font-size: 18px;">📄 New Policy Templates Added</h3>
          <ul style="margin: 0; padding-left: 20px; color: #047857;">
            ${data.newPolicies.map(policy => `<li style="margin-bottom: 4px;">${policy}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- CTA -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://aiblueprint.educationaiblueprint.com/reports/ai-trends" 
             style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View Full Trends Report
          </a>
        </div>

        <!-- Expert Session Reminder -->
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">
            💡 Want to discuss these trends?
          </p>
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
            Your monthly expert session is included with premium.
          </p>
          <a href="https://aiblueprint.educationaiblueprint.com/expert-sessions/schedule" 
             style="color: #667eea; text-decoration: none; font-weight: bold;">
            Book Your Session →
          </a>
        </div>
      </div>
    </div>
  `,
    textBody: `
${data.month} AI Trends Report - ${data.institutionName}

Hi ${data.userName},

Your monthly AI trends report is ready! We've analyzed the latest developments in educational AI and identified key opportunities specifically relevant to your institution.

KEY INSIGHTS THIS MONTH:
${data.keyInsights.map(insight => `• ${insight.title} (${insight.impact} impact)
  ${insight.description}`).join('\n\n')}

YOUR COMPETITIVE POSITION:
${data.competitivePosition.map(metric => {
        const percentage = Math.round((metric.yourScore / metric.peerAverage) * 100);
        return `• ${metric.metric}: ${percentage >= 100 ? '+' : ''}${percentage - 100}% vs peer average`;
    }).join('\n')}

RECOMMENDED ACTIONS:
${data.recommendedActions.map(action =>
        `• ${action.action}\n  By ${action.deadline} (${action.effort} effort)`
    ).join('\n')}

${data.newPolicies.length > 0 ? `\nNEW POLICY TEMPLATES ADDED:
${data.newPolicies.map(policy => `• ${policy}`).join('\n')}` : ''}

View Full Trends Report: https://aiblueprint.educationaiblueprint.com/reports/ai-trends

Want to discuss these trends? Your monthly expert session is included with premium.
Book Your Session: https://aiblueprint.educationaiblueprint.com/expert-sessions/schedule

Best regards,
The AI Blueprint Team
  `
});