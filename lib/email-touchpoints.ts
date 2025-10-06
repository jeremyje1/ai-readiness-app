/**
 * Email Templates for AI Blueprint Customer Journey
 * Comprehensive touchpoint system for new and existing customers
 */

import { emailService } from './email-service';

interface UserInfo {
  email: string;
  name: string;
  institutionName?: string;
  institutionType?: 'K12' | 'HigherEd' | 'District' | 'University' | 'Community College' | 'default';
}

interface AssessmentInfo {
  id: string;
  completedAt: string;
  overallScore: number;
  maturityLevel: string;
}

interface BlueprintInfo {
  id: string;
  title: string;
  generatedAt: string;
  status: string;
}

export class EmailTouchpoints {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiblueprint.educationaiblueprint.com';
  }

  /**
   * 1. Welcome Email - Sent immediately after signup
   */
  async sendWelcomeEmail(user: UserInfo, hasPassword: boolean = false): Promise<boolean> {
    const subject = `🎉 Welcome to AI Blueprint™ - Let's Transform ${user.institutionName || 'Your Institution'}!`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <!-- Header -->
        <div style="text-align:center;margin-bottom:40px;">
            <h1 style="color:#4f46e5;margin:0;font-size:32px;">AI Blueprint™</h1>
            <p style="color:#6b7280;margin:8px 0 0;font-size:14px;">Transform Education with AI</p>
        </div>

        <!-- Main Content -->
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="color:#111827;margin:0 0 16px;font-size:24px;">Welcome, ${user.name}! 👋</h2>
            
            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Thank you for joining AI Blueprint™. We're excited to help ${user.institutionName || 'your institution'} 
                navigate the transformative journey of AI implementation in education.
            </p>

            <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:16px;margin:24px 0;border-radius:4px;">
                <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.5;">
                    <strong>🎯 What's Next?</strong><br/>
                    Complete your AI readiness assessment to get personalized insights and a custom implementation blueprint.
                </p>
            </div>

            <h3 style="color:#111827;font-size:18px;margin:24px 0 12px;">Getting Started:</h3>
            <ol style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
                ${!hasPassword ? '<li><strong>Set your password</strong> - Check your inbox for the password setup link</li>' : ''}
                <li><strong>Complete the assessment</strong> - Takes 15-20 minutes, save progress anytime</li>
                <li><strong>Review your results</strong> - Get your AI readiness score and maturity level</li>
                <li><strong>Generate your blueprint</strong> - Receive a personalized AI implementation plan</li>
                <li><strong>Track your progress</strong> - Monitor milestones and measure success</li>
            </ol>

            <div style="text-align:center;margin:32px 0;">
                <a href="${this.baseUrl}/assessment" 
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
                    Start Your Assessment →
                </a>
            </div>

            <h3 style="color:#111827;font-size:18px;margin:24px 0 12px;">What You'll Get:</h3>
            <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
                <li><strong>AI Readiness Score</strong> - Comprehensive evaluation across 4 key dimensions</li>
                <li><strong>Maturity Assessment</strong> - Know where you stand and where to go next</li>
                <li><strong>Custom Blueprint</strong> - Phased implementation plan tailored to your needs</li>
                <li><strong>Gap Analysis</strong> - Identify strengths and areas for improvement</li>
                <li><strong>Quick Wins</strong> - Immediate actions you can take today</li>
                <li><strong>Resource Library</strong> - 50+ policy templates and best practices</li>
            </ul>
        </div>

        <!-- Help Section -->
        <div style="background:#f9fafb;border-radius:8px;padding:24px;margin-top:24px;">
            <h3 style="color:#111827;font-size:16px;margin:0 0 12px;">Need Help?</h3>
            <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 12px;">
                Our team is here to support you every step of the way:
            </p>
            <ul style="color:#4b5563;font-size:14px;line-height:1.6;margin:0;padding-left:20px;">
                <li>📧 Email: <a href="mailto:info@northpathstrategies.org" style="color:#4f46e5;">info@northpathstrategies.org</a></li>
                <li>📚 Help Center: <a href="${this.baseUrl}/help" style="color:#4f46e5;">Visit Help Center</a></li>
                <li>💬 Contact Us: <a href="${this.baseUrl}/contact" style="color:#4f46e5;">Get in Touch</a></li>
            </ul>
        </div>

        <!-- Footer -->
        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">
                © 2025 AI Blueprint™ by NorthPath Strategies. All rights reserved.
            </p>
            <p style="color:#9ca3af;font-size:11px;margin:0;">
                You're receiving this email because you signed up for AI Blueprint™.
            </p>
        </div>
    </div>
</body>
</html>`;

    return emailService.sendEmail({
      to: user.email,
      subject,
      htmlBody
    });
  }

  /**
   * 2. Assessment Started Email - Sent when user starts assessment
   */
  async sendAssessmentStartedEmail(user: UserInfo): Promise<boolean> {
    const subject = `📊 Your AI Readiness Assessment Has Started`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="color:#111827;margin:0 0 16px;">Assessment In Progress 📊</h2>
            
            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Hi ${user.name},
            </p>
            
            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Great job starting your AI readiness assessment! Your progress has been saved.
            </p>

            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:24px 0;border-radius:4px;">
                <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
                    <strong>💡 Pro Tip:</strong> Take your time and answer thoughtfully. The more accurate your responses, 
                    the more valuable your personalized blueprint will be.
                </p>
            </div>

            <h3 style="color:#111827;font-size:18px;margin:24px 0 12px;">Assessment Sections:</h3>
            <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
                <li><strong>GOVERN</strong> - Leadership, policies, and governance frameworks</li>
                <li><strong>MAP</strong> - Current AI systems and processes</li>
                <li><strong>MEASURE</strong> - Metrics, monitoring, and evaluation</li>
                <li><strong>MANAGE</strong> - Risk management and mitigation strategies</li>
            </ul>

            <div style="text-align:center;margin:32px 0;">
                <a href="${this.baseUrl}/assessment" 
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
                    Continue Assessment →
                </a>
            </div>

            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0;">
                Don't worry - your progress is automatically saved. You can return anytime to complete it.
            </p>
        </div>

        <div style="text-align:center;margin-top:24px;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
                Questions? <a href="${this.baseUrl}/contact" style="color:#4f46e5;">Contact our support team</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    return emailService.sendEmail({
      to: user.email,
      subject,
      htmlBody
    });
  }

  /**
   * 3. Assessment Completed Email - Sent when assessment is finished
   */
  async sendAssessmentCompletedEmail(
    user: UserInfo, 
    assessment: AssessmentInfo
  ): Promise<boolean> {
    const subject = `🎉 Assessment Complete! Your AI Readiness Score: ${assessment.overallScore}%`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:24px;font-size:14px;font-weight:600;">
                    ✅ ASSESSMENT COMPLETE
                </div>
            </div>

            <h2 style="color:#111827;margin:0 0 16px;text-align:center;">Congratulations, ${user.name}! 🎉</h2>
            
            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;text-align:center;">
                You've completed your AI readiness assessment. Here's your snapshot:
            </p>

            <!-- Score Card -->
            <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:12px;padding:32px;color:#ffffff;text-align:center;margin:24px 0;">
                <div style="font-size:48px;font-weight:bold;margin-bottom:8px;">${assessment.overallScore}%</div>
                <div style="font-size:18px;opacity:0.9;">Overall AI Readiness Score</div>
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.3);">
                    <div style="font-size:24px;font-weight:600;">${assessment.maturityLevel}</div>
                    <div style="font-size:14px;opacity:0.9;">Maturity Level</div>
                </div>
            </div>

            <h3 style="color:#111827;font-size:18px;margin:32px 0 16px;">🎯 What's Next?</h3>
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Now that you have your assessment results, it's time to create your personalized AI implementation blueprint:
            </p>

            <ol style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;margin:0 0 24px;">
                <li><strong>Review your detailed results</strong> on your dashboard</li>
                <li><strong>Generate your AI Blueprint</strong> - Get a phased implementation plan</li>
                <li><strong>Access policy templates</strong> and best practices</li>
                <li><strong>Track your progress</strong> as you implement</li>
            </ol>

            <div style="text-align:center;margin:32px 0;">
                <a href="${this.baseUrl}/dashboard/personalized" 
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;margin:0 8px 8px 0;">
                    View Dashboard →
                </a>
                <a href="${this.baseUrl}/blueprint/new" 
                   style="display:inline-block;background:#10b981;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;margin:0 8px 8px 0;">
                    Generate Blueprint →
                </a>
            </div>

            <div style="background:#eff6ff;border-left:4px solid:#3b82f6;padding:16px;margin:24px 0;border-radius:4px;">
                <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.5;">
                    <strong>🚀 Pro Tip:</strong> Your blueprint will provide specific, actionable steps tailored to your 
                    institution's readiness level and goals. It's like having an AI implementation consultant in your pocket!
                </p>
            </div>
        </div>

        <div style="background:#f9fafb;border-radius:8px;padding:24px;margin-top:24px;">
            <h3 style="color:#111827;font-size:16px;margin:0 0 12px;">📚 Resources Available Now:</h3>
            <ul style="color:#4b5563;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
                <li><a href="${this.baseUrl}/resources/templates" style="color:#4f46e5;">50+ AI Policy Templates</a></li>
                <li><a href="${this.baseUrl}/resources/guides" style="color:#4f46e5;">Implementation Guides</a></li>
                <li><a href="${this.baseUrl}/resources/case-studies" style="color:#4f46e5;">Case Studies</a></li>
            </ul>
        </div>

        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:12px;margin:0;">
                © 2025 AI Blueprint™ by NorthPath Strategies
            </p>
        </div>
    </div>
</body>
</html>`;

    return emailService.sendEmail({
      to: user.email,
      subject,
      htmlBody
    });
  }

  /**
   * 4. Blueprint Generated Email - Sent when blueprint is created
   */
  async sendBlueprintGeneratedEmail(
    user: UserInfo,
    blueprint: BlueprintInfo
  ): Promise<boolean> {
    const subject = `🚀 Your AI Implementation Blueprint is Ready!`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:64px;margin-bottom:16px;">🎯</div>
                <h2 style="color:#111827;margin:0 0 8px;font-size:28px;">Your Blueprint is Ready!</h2>
                <p style="color:#6b7280;font-size:14px;margin:0;">Generated ${new Date(blueprint.generatedAt).toLocaleDateString()}</p>
            </div>

            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Hi ${user.name},
            </p>

            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Great news! Your personalized AI implementation blueprint "<strong>${blueprint.title}</strong>" has been generated 
                and is ready for review.
            </p>

            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:24px;color:#ffffff;margin:24px 0;">
                <h3 style="margin:0 0 16px;font-size:20px;">Your Blueprint Includes:</h3>
                <ul style="margin:0;padding-left:20px;line-height:1.8;">
                    <li><strong>Phased Implementation Plan</strong> - Step-by-step roadmap</li>
                    <li><strong>Department Strategies</strong> - Tailored for each team</li>
                    <li><strong>Quick Wins</strong> - Immediate actions to take</li>
                    <li><strong>Risk Mitigation</strong> - Address challenges proactively</li>
                    <li><strong>Tool Recommendations</strong> - Specific AI tools for your needs</li>
                    <li><strong>Progress Tracking</strong> - Monitor implementation success</li>
                </ul>
            </div>

            <div style="text-align:center;margin:32px 0;">
                <a href="${this.baseUrl}/blueprint/${blueprint.id}" 
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:8px;font-weight:600;font-size:18px;box-shadow:0 4px 6px rgba(79,70,229,0.3);">
                    View Your Blueprint →
                </a>
            </div>

            <h3 style="color:#111827;font-size:18px;margin:32px 0 16px;">🎯 Next Steps:</h3>
            <ol style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;margin:0 0 24px;">
                <li><strong>Review your blueprint</strong> - Explore all sections and phases</li>
                <li><strong>Share with your team</strong> - Invite stakeholders to collaborate</li>
                <li><strong>Start Phase 1 tasks</strong> - Begin with your quick wins</li>
                <li><strong>Track progress</strong> - Update task status as you implement</li>
                <li><strong>Refine as needed</strong> - Adjust timeline and priorities</li>
            </ol>

            <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px;margin:24px 0;border-radius:4px;">
                <p style="margin:0;color:#065f46;font-size:14px;line-height:1.5;">
                    <strong>💡 Team Collaboration:</strong> You can share your blueprint publicly or invite specific team members 
                    via email to collaborate on implementation together.
                </p>
            </div>

            <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:24px 0;">
                <h4 style="color:#111827;font-size:16px;margin:0 0 12px;">Need Help?</h4>
                <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0;">
                    Our team is available for consulting services if you need hands-on support with implementation, 
                    training workshops, or strategic planning sessions.
                </p>
                <div style="margin-top:12px;">
                    <a href="${this.baseUrl}/contact?subject=consulting" style="color:#4f46e5;text-decoration:none;font-weight:600;font-size:14px;">
                        Learn About Consulting Services →
                    </a>
                </div>
            </div>
        </div>

        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:12px;margin:0 0 8px;">
                © 2025 AI Blueprint™ by NorthPath Strategies
            </p>
            <p style="color:#9ca3af;font-size:11px;margin:0;">
                <a href="${this.baseUrl}/dashboard/personalized" style="color:#6b7280;">Dashboard</a> • 
                <a href="${this.baseUrl}/resources/templates" style="color:#6b7280;">Resources</a> • 
                <a href="${this.baseUrl}/contact" style="color:#6b7280;">Contact</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    return emailService.sendEmail({
      to: user.email,
      subject,
      htmlBody
    });
  }

  /**
   * 5. Trial Ending Soon Email - Sent 3 days before trial ends
   */
  async sendTrialEndingSoonEmail(
    user: UserInfo,
    daysRemaining: number
  ): Promise<boolean> {
    const subject = `⏰ Your AI Blueprint Trial Ends in ${daysRemaining} Days`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <div style="background:#fef3c7;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
                <div style="font-size:48px;margin-bottom:8px;">⏰</div>
                <h2 style="color:#92400e;margin:0;font-size:24px;">Trial Ending Soon</h2>
            </div>

            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Hi ${user.name},
            </p>

            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Your 14-day free trial of AI Blueprint™ will end in <strong>${daysRemaining} days</strong>. 
                We hope you've found value in our platform!
            </p>

            <div style="background:#f0f9ff;border:2px solid #3b82f6;border-radius:8px;padding:24px;margin:24px 0;">
                <h3 style="color:#1e40af;margin:0 0 16px;font-size:20px;">Continue Your AI Journey</h3>
                <p style="color:#1e3a8a;font-size:15px;line-height:1.6;margin:0 0 16px;">
                    Subscribe now to keep access to:
                </p>
                <ul style="color:#1e3a8a;font-size:15px;line-height:1.8;margin:0;padding-left:20px;">
                    <li>Unlimited AI Blueprint generation</li>
                    <li>Progress tracking & collaboration tools</li>
                    <li>50+ policy templates & resources</li>
                    <li>Gap analysis & recommendations</li>
                    <li>Priority email support</li>
                    <li>Monthly expert webinars</li>
                </ul>
            </div>

            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:24px;color:#ffffff;text-align:center;margin:32px 0;">
                <div style="font-size:14px;opacity:0.9;margin-bottom:8px;">SPECIAL OFFER</div>
                <div style="font-size:32px;font-weight:bold;margin-bottom:8px;">$199/month</div>
                <div style="font-size:16px;opacity:0.9;margin-bottom:16px;">Everything included • Unlimited users</div>
                <div style="background:rgba(255,255,255,0.2);border-radius:6px;padding:12px;margin-top:16px;">
                    <div style="font-size:14px;">💰 Save $400/year with annual plan</div>
                </div>
            </div>

            <div style="text-align:center;margin:32px 0;">
                <a href="${this.baseUrl}/pricing" 
                   style="display:inline-block;background:#10b981;color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:8px;font-weight:600;font-size:18px;box-shadow:0 4px 6px rgba(16,185,129,0.3);">
                    Subscribe Now →
                </a>
            </div>

            <div style="text-align:center;margin:24px 0;">
                <p style="color:#6b7280;font-size:14px;margin:0;">
                    Questions? <a href="${this.baseUrl}/contact" style="color:#4f46e5;">Contact our team</a> or 
                    <a href="${this.baseUrl}/demo" style="color:#4f46e5;">schedule a demo</a>
                </p>
            </div>
        </div>

        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
                Don't want to receive trial reminders? <a href="${this.baseUrl}/settings" style="color:#6b7280;">Update preferences</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    return emailService.sendEmail({
      to: user.email,
      subject,
      htmlBody
    });
  }

  /**
   * 6. Progress Update Email - Sent weekly for active users
   */
  async sendWeeklyProgressEmail(
    user: UserInfo,
    stats: {
      blueprintsCreated: number;
      tasksCompleted: number;
      progressPercentage: number;
      lastActivity: string;
    }
  ): Promise<boolean> {
    const subject = `📊 Your Weekly AI Implementation Progress`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="color:#111827;margin:0 0 16px;">Your Weekly Progress 📊</h2>
            
            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Hi ${user.name}, here's your AI implementation progress for the week:
            </p>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0;">
                <div style="background:#f0f9ff;border-radius:8px;padding:20px;text-align:center;">
                    <div style="font-size:36px;font-weight:bold;color:#2563eb;">${stats.blueprintsCreated}</div>
                    <div style="color:#1e40af;font-size:14px;margin-top:4px;">Blueprints</div>
                </div>
                <div style="background:#f0fdf4;border-radius:8px;padding:20px;text-align:center;">
                    <div style="font-size:36px;font-weight:bold;color:#10b981;">${stats.tasksCompleted}</div>
                    <div style="color:#065f46;font-size:14px;margin-top:4px;">Tasks Completed</div>
                </div>
            </div>

            <div style="margin:24px 0;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span style="color:#374151;font-size:14px;">Overall Progress</span>
                    <span style="color:#111827;font-size:14px;font-weight:600;">${stats.progressPercentage}%</span>
                </div>
                <div style="background:#e5e7eb;height:12px;border-radius:6px;overflow:hidden;">
                    <div style="background:linear-gradient(90deg,#667eea 0%,#764ba2 100%);height:100%;width:${stats.progressPercentage}%;transition:width 0.3s;"></div>
                </div>
            </div>

            <div style="text-align:center;margin:32px 0;">
                <a href="${this.baseUrl}/dashboard/personalized" 
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
                    View Full Dashboard →
                </a>
            </div>

            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0;">
                Last activity: ${new Date(stats.lastActivity).toLocaleDateString()}
            </p>
        </div>
    </div>
</body>
</html>`;

    return emailService.sendEmail({
      to: user.email,
      subject,
      htmlBody
    });
  }

  /**
   * 7. Re-engagement Email - Sent to inactive users after 7 days
   */
  async sendReEngagementEmail(user: UserInfo, daysSinceLastLogin: number): Promise<boolean> {
    const subject = `We Miss You! Your AI Implementation Journey Awaits 🚀`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:64px;margin-bottom:16px;">👋</div>
                <h2 style="color:#111827;margin:0;">We Miss You, ${user.name}!</h2>
            </div>

            <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px;">
                It's been ${daysSinceLastLogin} days since we last saw you on AI Blueprint™. 
                Your AI transformation journey is waiting!
            </p>

            <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:24px 0;border-radius:4px;">
                <p style="margin:0;color:#92400e;font-size:14px;line-height:1.5;">
                    <strong>Did you know?</strong> Institutions that complete their AI blueprint within the first month 
                    are 3x more likely to successfully implement AI initiatives.
                </p>
            </div>

            <h3 style="color:#111827;font-size:18px;margin:24px 0 16px;">Pick Up Where You Left Off:</h3>
            <ul style="color:#374151;font-size:15px;line-height:1.8;padding-left:20px;">
                <li>Complete your assessment (if not done)</li>
                <li>Generate your personalized blueprint</li>
                <li>Access 50+ policy templates</li>
                <li>Track your implementation progress</li>
            </ul>

            <div style="text-align:center;margin:32px 0;">
                <a href="${this.baseUrl}/dashboard/personalized" 
                   style="display:inline-block;background:#4f46e5;color:#ffffff;padding:16px 48px;text-decoration:none;border-radius:8px;font-weight:600;font-size:18px;">
                    Continue Your Journey →
                </a>
            </div>

            <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:24px 0 0;text-align:center;">
                Need help getting started? <a href="${this.baseUrl}/contact" style="color:#4f46e5;">Reach out to our team</a>
            </p>
        </div>
    </div>
</body>
</html>`;

    return emailService.sendEmail({
      to: user.email,
      subject,
      htmlBody
    });
  }
}

// Export singleton instance
export const emailTouchpoints = new EmailTouchpoints();
export default emailTouchpoints;
