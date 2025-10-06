interface WeeklyProgressData {
  userName: string;
  institutionName: string;
  weekNumber: number;
  tasksCompleted: number;
  tasksTotal: number;
  progressPercentage: number;
  quickWins: string[];
  upcomingMilestones: string[];
  teamActivity: {
    name: string;
    action: string;
  }[];
  roiSaved: number;
  timeSaved: number;
}

export const premiumWeeklyProgressTemplate = (data: WeeklyProgressData) => ({
  subject: `Week ${data.weekNumber} Progress Report - ${data.progressPercentage}% Complete 📊`,
  htmlBody: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Week ${data.weekNumber} Progress Report</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">${data.institutionName}</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">Hi ${data.userName},</p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
          Great progress this week! Here's your AI implementation summary:
        </p>

        <!-- Progress Bar -->
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: bold; color: #1f2937;">Overall Progress</span>
            <span style="font-weight: bold; color: #667eea;">${data.progressPercentage}%</span>
          </div>
          <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
            <div style="background: linear-gradient(to right, #667eea, #764ba2); height: 100%; width: ${data.progressPercentage}%; border-radius: 10px; transition: width 0.3s;"></div>
          </div>
          <p style="margin-top: 8px; color: #6b7280; font-size: 14px;">${data.tasksCompleted} of ${data.tasksTotal} tasks completed</p>
        </div>

        <!-- Quick Wins -->
        ${data.quickWins.length > 0 ? `
        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #065f46; font-size: 18px;">🎉 Quick Wins This Week</h3>
          <ul style="margin: 0; padding-left: 20px; color: #047857;">
            ${data.quickWins.map(win => `<li style="margin-bottom: 8px;">${win}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- Team Activity -->
        ${data.teamActivity.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 12px;">👥 Team Activity</h3>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
            ${data.teamActivity.map(activity => `
              <p style="margin: 0 0 8px 0; color: #4b5563;">
                <strong>${activity.name}</strong> ${activity.action}
              </p>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- ROI Impact -->
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px;">💰 Value Delivered</h3>
          <div style="display: flex; gap: 20px;">
            <div style="flex: 1;">
              <p style="margin: 0; color: #92400e; font-size: 24px; font-weight: bold;">$${data.roiSaved.toLocaleString()}</p>
              <p style="margin: 0; color: #b45309; font-size: 14px;">Cost Savings</p>
            </div>
            <div style="flex: 1;">
              <p style="margin: 0; color: #92400e; font-size: 24px; font-weight: bold;">${data.timeSaved}h</p>
              <p style="margin: 0; color: #b45309; font-size: 14px;">Time Saved</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Milestones -->
        ${data.upcomingMilestones.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 12px;">📅 Upcoming Milestones</h3>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            ${data.upcomingMilestones.map(milestone => `<li style="margin-bottom: 8px;">${milestone}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- CTA Buttons -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://aiblueprint.educationaiblueprint.com/dashboard/premium" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 12px;">
            View Full Dashboard
          </a>
          <a href="https://aiblueprint.educationaiblueprint.com/reports/ai-trends" 
             style="display: inline-block; background: white; color: #667eea; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 2px solid #667eea;">
            Check AI Trends
          </a>
        </div>

        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Keep up the great work! Your next expert session is available to book.
          </p>
        </div>
      </div>
    </div>
  `,
  textBody: `
Week ${data.weekNumber} Progress Report - ${data.institutionName}

Hi ${data.userName},

Great progress this week! Here's your AI implementation summary:

OVERALL PROGRESS: ${data.progressPercentage}%
Tasks Completed: ${data.tasksCompleted} of ${data.tasksTotal}

${data.quickWins.length > 0 ? `QUICK WINS THIS WEEK:
${data.quickWins.map(win => `• ${win}`).join('\n')}` : ''}

${data.teamActivity.length > 0 ? `\nTEAM ACTIVITY:
${data.teamActivity.map(activity => `• ${activity.name} ${activity.action}`).join('\n')}` : ''}

VALUE DELIVERED:
• Cost Savings: $${data.roiSaved.toLocaleString()}
• Time Saved: ${data.timeSaved} hours

${data.upcomingMilestones.length > 0 ? `\nUPCOMING MILESTONES:
${data.upcomingMilestones.map(milestone => `• ${milestone}`).join('\n')}` : ''}

View Full Dashboard: https://aiblueprint.educationaiblueprint.com/dashboard/premium
Check AI Trends: https://aiblueprint.educationaiblueprint.com/reports/ai-trends

Keep up the great work! Your next expert session is available to book.

Best regards,
The AI Blueprint Team
  `
});