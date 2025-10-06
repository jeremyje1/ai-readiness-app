export const premiumWelcomeTemplate = (userName: string, institutionName: string) => ({
  subject: 'Welcome to AI Blueprint Premium! 🎉',
  htmlBody: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Premium!</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 18px;">Your AI implementation just got supercharged</p>
      </div>
      
      <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hi ${userName},</p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
          Welcome to AI Blueprint Premium! Your subscription for <strong>${institutionName}</strong> is now active, 
          unlocking powerful features to accelerate your AI implementation.
        </p>

        <h2 style="font-size: 20px; color: #1f2937; margin-top: 32px; margin-bottom: 16px;">🚀 Your Premium Benefits Include:</h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            <li style="margin-bottom: 12px;"><strong>Premium Dashboard</strong> - Track ROI and team progress in real-time</li>
            <li style="margin-bottom: 12px;"><strong>Monthly AI Trends Report</strong> - Personalized insights delivered monthly</li>
            <li style="margin-bottom: 12px;"><strong>Expert Strategy Sessions</strong> - Monthly 1-on-1 calls included ($500 value)</li>
            <li style="margin-bottom: 12px;"><strong>Policy Template Library</strong> - 50+ customizable AI policy templates</li>
            <li style="margin-bottom: 12px;"><strong>Team Collaboration</strong> - Invite unlimited team members</li>
          </ul>
        </div>

        <h2 style="font-size: 20px; color: #1f2937; margin-top: 32px; margin-bottom: 16px;">📅 Your First Month Action Plan:</h2>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>Week 1:</strong> Book your first expert strategy session</p>
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>Week 2:</strong> Invite your team and assign initial tasks</p>
          <p style="margin: 0 0 8px 0; color: #92400e;"><strong>Week 3:</strong> Review and customize policy templates</p>
          <p style="margin: 0; color: #92400e;"><strong>Week 4:</strong> Analyze your first AI Trends Report</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://aiblueprint.educationaiblueprint.com/dashboard/premium" 
             style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Access Premium Dashboard
          </a>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            <strong>Need help getting started?</strong>
          </p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Reply to this email or visit our help center for personalized support.
          </p>
        </div>
      </div>
    </div>
  `,
  textBody: `
Welcome to AI Blueprint Premium!

Hi ${userName},

Welcome to AI Blueprint Premium! Your subscription for ${institutionName} is now active, unlocking powerful features to accelerate your AI implementation.

YOUR PREMIUM BENEFITS INCLUDE:
• Premium Dashboard - Track ROI and team progress in real-time
• Monthly AI Trends Report - Personalized insights delivered monthly
• Expert Strategy Sessions - Monthly 1-on-1 calls included ($500 value)
• Policy Template Library - 50+ customizable AI policy templates
• Team Collaboration - Invite unlimited team members

YOUR FIRST MONTH ACTION PLAN:
Week 1: Book your first expert strategy session
Week 2: Invite your team and assign initial tasks
Week 3: Review and customize policy templates
Week 4: Analyze your first AI Trends Report

Access Premium Dashboard: https://aiblueprint.educationaiblueprint.com/dashboard/premium

Need help getting started? Reply to this email or visit our help center for personalized support.

Best regards,
The AI Blueprint Team
  `
});