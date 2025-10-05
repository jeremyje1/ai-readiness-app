/**
 * Email Service using Postmark
 * Handles sending emails for assessments, registrations, and notifications
 */

import { ServerClient } from 'postmark';

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  from?: string;
  replyTo?: string;
}

class EmailService {
  private client: ServerClient | null = null;
  private initialized: boolean = false;

  constructor() {
    // Initialize synchronously in constructor
    this.initializeSync();
  }

  private initializeSync(): void {
    const postmarkToken = process.env.POSTMARK_API_TOKEN || process.env.POSTMARK_SERVER_TOKEN;
    
    console.log('🔧 Email service initialization...');
    console.log('📧 Postmark token exists:', !!postmarkToken);
    console.log('📧 From email:', process.env.FROM_EMAIL || process.env.POSTMARK_FROM_EMAIL);
    console.log('📧 Reply to:', process.env.REPLY_TO_EMAIL || process.env.POSTMARK_REPLY_TO);
    
    if (!postmarkToken) {
      console.error('❌ No Postmark token found in environment variables');
      return;
    }

    try {
      this.client = new ServerClient(postmarkToken);
      this.initialized = true;
      console.log('✅ Email service initialized with Postmark');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized || !this.client) {
      console.log('📧 Email service not initialized. Logging email instead:');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('Email content prepared but not sent');
      return false;
    }

    try {
      const fromEmail = (options.from || process.env.POSTMARK_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@northpathstrategies.org').trim();
      const replyToEmail = (options.replyTo || process.env.POSTMARK_REPLY_TO || process.env.REPLY_TO_EMAIL || 'info@northpathstrategies.org').trim();
      
      const result = await this.client.sendEmail({
        From: fromEmail,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.htmlBody,
        TextBody: options.textBody,
        ReplyTo: replyToEmail,
        MessageStream: process.env.POSTMARK_MESSAGE_STREAM || 'aiblueprint-transactional'
      });

      console.log(`✅ Email sent successfully to ${options.to}, MessageID: ${result.MessageID}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      console.error('❌ Email details:', {
        to: options.to,
        from: (options.from || process.env.POSTMARK_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@northpathstrategies.org').trim(),
        messageStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound'
      });
      return false;
    }
  }

  async sendAssessmentNotification(params: {
    userEmail: string;
    userName: string;
    institutionName: string;
    assessmentId: string;
    tier: string;
    overallScore: number;
    maturityLevel: string;
    dashboardUrl?: string;
    baseUrl?: string;
    institutionType?: 'K12' | 'HigherEd' | 'default';
    domainContext?: string;
  }): Promise<{ clientSent: boolean; adminSent: boolean }> {
    const { 
      userEmail, 
      userName, 
      institutionName, 
      assessmentId, 
      tier, 
      overallScore, 
      maturityLevel, 
      dashboardUrl, 
      baseUrl, 
      institutionType,
      domainContext 
    } = params;

    // Determine the appropriate domain based on institution type
    const getContextualDomain = () => {
      if (baseUrl && !baseUrl.includes('vercel.app')) {
        return baseUrl; // Use provided baseUrl if it's not a Vercel URL
      }
      
      // Use context-specific domains
      switch (institutionType) {
        case 'K12':
          return 'https://k12aiblueprint.com';
        case 'HigherEd':
          return 'https://aiblueprint.k12aiblueprint.com';
        default:
          // Fallback based on domain context string
          if (domainContext === 'k12') {
            return 'https://k12aiblueprint.com';
          } else if (domainContext === 'higher-ed') {
            return 'https://aiblueprint.k12aiblueprint.com';
          }
          return process.env.NEXT_PUBLIC_BASE_URL || 'https://aiblueprint.k12aiblueprint.com';
      }
    };

    const domain = getContextualDomain();
    const clientDashboardUrl = dashboardUrl || `${domain}/dashboard/personalized`;
    const adminAssessmentUrl = `${domain}/admin/assessment/${assessmentId}`;
    const adminDashboardUrl = `${domain}/admin`;

    // Get branded titles based on institution type
    const getBrandedTitle = () => {
      switch (institutionType) {
        case 'K12':
          return 'K-12 AI Blueprint';
        case 'HigherEd':
          return 'AI Blueprint for Higher Education';
        default:
          return 'AI Blueprint';
      }
    };

    const brandedTitle = getBrandedTitle();

    // Client email template
    const clientEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #4F46E5; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .cta-button { 
            display: inline-block; 
            background: #4F46E5; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: bold;
        }
        .footer { padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; }
        .score-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .score { font-size: 2em; font-weight: bold; color: #4F46E5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your ${brandedTitle} Assessment is Complete!</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <p>Great news! Your AI readiness assessment for <strong>${institutionName}</strong> has been completed and your personalized Blueprint is ready.</p>
            
            <div class="score-box">
                <div class="score">${overallScore}%</div>
                <p><strong>AI Readiness Level: ${maturityLevel}</strong></p>
                <p>Assessment Tier: ${tier}</p>
            </div>
            
            <p>Your assessment includes:</p>
            <ul>
                <li>📊 Comprehensive analysis across 6 patent-pending algorithms</li>
                <li>🎯 Priority action items with timeline</li>
                <li>📈 Benchmarking against peer institutions</li>
                <li>🛠️ Implementation roadmap and resource recommendations</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="${clientDashboardUrl}" class="cta-button">
                    View Your Complete Blueprint →
                </a>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ol>
                <li>Review your detailed assessment report</li>
                <li>Prioritize recommendations based on your institutional goals</li>
                <li>Share insights with your leadership team</li>
                <li>Begin implementation with our suggested timeline</li>
            </ol>
            
            <p>Questions? Our team is here to help you maximize the value of your AI transformation journey.</p>
            
            <p>Best regards,<br>
            <strong>The ${brandedTitle} Team</strong><br>
            AI Transformation Specialists</p>
        </div>
        <div class="footer">
            <p><strong>Need help?</strong> Reply to this email or visit <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://aiblueprint.k12aiblueprint.com'}/contact">our contact page</a>.</p>
            <p>This email was sent regarding your AI Blueprint assessment for ${institutionName}</p>
        </div>
    </div>
</body>
</html>`;

    // Admin email template
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; background: white; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .info-table td:first-child { font-weight: bold; background: #f9fafb; width: 40%; }
        .actions { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .action-button { 
            display: inline-block; 
            background: #059669; 
            color: white !important; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 5px 10px 5px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 New AI Assessment Completed</h1>
        </div>
        <div class="content">
            <p>A new AI readiness assessment has been completed and requires your attention.</p>
            
            <table class="info-table">
                <tr><td>Institution</td><td>${institutionName}</td></tr>
                <tr><td>Contact</td><td>${userName}</td></tr>
                <tr><td>User Email</td><td>${userEmail}</td></tr>
                <tr><td>Assessment Tier</td><td>${tier}</td></tr>
                <tr><td>Overall Score</td><td>${overallScore}%</td></tr>
                <tr><td>Maturity Level</td><td>${maturityLevel}</td></tr>
                <tr><td>Assessment ID</td><td>${assessmentId}</td></tr>
                <tr><td>Completed</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
            
            <div class="actions">
                <h3>Quick Actions:</h3>
                <a href="${adminAssessmentUrl}" class="action-button">View Assessment Details</a>
                <a href="${adminDashboardUrl}" class="action-button">Admin Dashboard</a>
                <a href="mailto:${userEmail}" class="action-button">Contact Client</a>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
                <li>Review the detailed assessment results</li>
                <li>Prepare follow-up recommendations if needed</li>
                <li>Schedule a consultation call if this was a premium tier</li>
                <li>Update CRM with engagement status</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    // Send both emails
    const clientSent = await this.sendEmail({
      to: userEmail,
      subject: `🎉 Your AI Blueprint Assessment Results - ${institutionName}`,
      htmlBody: clientEmailHtml
    });

    const adminSent = await this.sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || 'info@northpathstrategies.org',
      subject: `🎯 New AI Assessment Completed - ${institutionName} (${tier})`,
      htmlBody: adminEmailHtml
    });

    return { clientSent, adminSent };
  }

  async sendWelcomeEmail(params: {
    userEmail: string;
    userName: string;
    institutionName: string;
    userId?: string;
    baseUrl?: string;
    institutionType?: 'K12' | 'HigherEd' | 'default';
    domainContext?: string;
  }): Promise<boolean> {
    const { userEmail, userName, institutionName, userId, baseUrl, institutionType, domainContext } = params;

    // Determine the appropriate domain based on institution type
    const getContextualDomain = () => {
      if (baseUrl && !baseUrl.includes('vercel.app')) {
        return baseUrl; // Use provided baseUrl if it's not a Vercel URL
      }
      
      // Use context-specific domains
      switch (institutionType) {
        case 'K12':
          return 'https://k12aiblueprint.com';
        case 'HigherEd':
          return 'https://aiblueprint.k12aiblueprint.com';
        default:
          // Fallback based on domain context string
          if (domainContext === 'k12') {
            return 'https://k12aiblueprint.com';
          } else if (domainContext === 'higher-ed') {
            return 'https://aiblueprint.k12aiblueprint.com';
          }
          return process.env.NEXT_PUBLIC_BASE_URL || 'https://aiblueprint.k12aiblueprint.com';
      }
    };

    const domain = getContextualDomain();
    const dashboardUrl = `${domain}/dashboard/personalized`;

    // Get branded titles based on institution type
    const getBrandedTitle = () => {
      switch (institutionType) {
        case 'K12':
          return 'K-12 AI Blueprint';
        case 'HigherEd':
          return 'AI Blueprint for Higher Education';
        default:
          return 'AI Blueprint';
      }
    };

    const brandedTitle = getBrandedTitle();

    const welcomeEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #4F46E5; color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .cta-button { 
            display: inline-block; 
            background: #4F46E5; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: bold;
        }
        .footer { padding: 20px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to ${brandedTitle}!</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <p>Welcome to ${brandedTitle}! We're excited to help ${institutionName} navigate your AI transformation journey.</p>
            
            <p><strong>Your account has been created successfully.</strong> You can now access your personalized dashboard and begin your AI readiness assessment.</p>
            
            <p><strong>What you'll get:</strong></p>
            <ul>
                <li>🎯 Comprehensive AI readiness assessment</li>
                <li>📊 Detailed analysis with 6 patent-pending algorithms</li>
                <li>🛠️ Personalized implementation roadmap</li>
                <li>📈 Benchmarking against peer institutions</li>
                <li>💡 Priority action items with timeline</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="${dashboardUrl}" class="cta-button">
                    Access Your Dashboard →
                </a>
            </div>
            
            <p><strong>Ready to get started?</strong> Your assessment typically takes 20-45 minutes depending on the tier you selected. You can save your progress and return anytime.</p>
            
            <p>If you have any questions, our team is here to help you succeed.</p>
            
            <p>Best regards,<br>
            <strong>The ${brandedTitle} Team</strong></p>
        </div>
        <div class="footer">
            <p><strong>Need help?</strong> Visit <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://aiblueprint.k12aiblueprint.com'}/contact">our contact page</a> or reply to this email.</p>
            <p>AI Blueprint by NorthPath Strategies</p>
        </div>
    </div>
</body>
</html>`;

    return await this.sendEmail({
      to: userEmail,
      subject: `🚀 Welcome to ${brandedTitle} - Let's Transform ${institutionName}!`,
      htmlBody: welcomeEmailHtml
    });
  }

  /**
   * Send onboarding email with dashboard + password setup + optional magic link
   */
  async sendOnboardingEmail(params: {
    to: string;
    name: string;
    dashboardUrl: string;
    passwordSetupUrl: string;
    magicLinkUrl?: string;
    tier?: string;
  loginUrl?: string;
  passwordResetUrl?: string;
  }): Promise<boolean> {
  const { to, name, dashboardUrl, passwordSetupUrl, magicLinkUrl, tier, loginUrl, passwordResetUrl } = params;
    const subject = `Welcome to AI Blueprint${tier ? ' – ' + tier.replace(/-/g, ' ') : ''}`;
    const htmlBody = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
        <h2 style="color:#111;margin-bottom:8px;">Payment Confirmed ✅</h2>
        <p style="color:#444;font-size:15px;">Hi ${name || 'there'}, welcome to <strong>AI Blueprint™ Assessment Platform</strong>.</p>
        <p style="color:#444;font-size:15px;">Your account is active. Use the quick links below to get started:</p>
        <ul style="color:#444;font-size:14px;line-height:1.5;">
          <li><a href="${dashboardUrl}" style="color:#2563eb;">Open your Dashboard</a></li>
          <li><a href="${passwordSetupUrl}" style="color:#2563eb;">Set / Create Your Password</a></li>
          ${magicLinkUrl ? `<li><a href="${magicLinkUrl}" style="color:#2563eb;">One‑Click Magic Login</a> (valid once)</li>` : ''}
      ${loginUrl ? `<li><a href="${loginUrl}" style="color:#2563eb;">Standard Login Page</a></li>`: ''}
      ${passwordResetUrl ? `<li><a href="${passwordResetUrl}" style="color:#2563eb;">Forgot / Reset Password</a></li>`: ''}
        </ul>
        <p style="color:#444;font-size:14px;">For security, the magic link and password setup links expire. After setting a password you can log in directly anytime.</p>
        <p style="margin-top:32px;color:#555;font-size:12px;">If you did not authorize this, contact support immediately.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, htmlBody });
  }

  async sendContactEmail(params: { name: string; email: string; organization?: string; message: string; }): Promise<boolean> {
    const { name, email, organization, message } = params;
    const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'info@northpathstrategies.org';
    const subject = `📩 New Contact Inquiry from ${name}`;
    const htmlBody = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 12px;font-size:20px;color:#111;">New Website Contact</h2>
        <p style="font-size:14px;color:#444;line-height:1.5;"><strong>Name:</strong> ${name}</p>
        <p style="font-size:14px;color:#444;line-height:1.5;"><strong>Email:</strong> ${email}</p>
        <p style="font-size:14px;color:#444;line-height:1.5;"><strong>Organization:</strong> ${organization || '—'}</p>
        <p style="font-size:14px;color:#444;line-height:1.5;"><strong>Message:</strong><br/>${message.replace(/</g,'&lt;')}</p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="font-size:12px;color:#666;">Reply directly to this email to respond. This notification was generated by the AI Blueprint contact form.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, htmlBody, replyTo: email });
  }

  /**
   * Send admin notification for new customer signup
   */
  async sendNewCustomerNotification(params: {
    customerEmail: string;
    customerName: string;
    tier: string;
    organization?: string;
    stripeSessionId: string;
    stripeCustomerId: string;
    dashboardUrl?: string;
  }): Promise<boolean> {
    const { customerEmail, customerName, tier, organization, stripeSessionId, stripeCustomerId, dashboardUrl } = params;
    const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'info@northpathstrategies.org';
    const subject = `🎉 New Customer: ${customerName} (${tier})`;
    
    const tierDisplay = tier.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://aiblueprint.k12aiblueprint.com';
    const adminDashboard = dashboardUrl || `${baseUrl}/admin/dashboard`;
    
    const htmlBody = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
        <div style="background:#10b981;color:white;padding:16px;border-radius:6px;text-align:center;margin-bottom:24px;">
          <h2 style="margin:0;font-size:24px;">🎉 New Customer Signup!</h2>
        </div>
        
        <div style="background:white;padding:20px;border-radius:6px;margin-bottom:16px;">
          <h3 style="margin:0 0 12px;color:#111;font-size:18px;">Customer Details</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#666;font-size:14px;"><strong>Name:</strong></td>
              <td style="padding:8px 0;color:#111;font-size:14px;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666;font-size:14px;"><strong>Email:</strong></td>
              <td style="padding:8px 0;color:#111;font-size:14px;"><a href="mailto:${customerEmail}" style="color:#2563eb;">${customerEmail}</a></td>
            </tr>
            ${organization ? `
            <tr>
              <td style="padding:8px 0;color:#666;font-size:14px;"><strong>Organization:</strong></td>
              <td style="padding:8px 0;color:#111;font-size:14px;">${organization}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding:8px 0;color:#666;font-size:14px;"><strong>Tier:</strong></td>
              <td style="padding:8px 0;color:#111;font-size:14px;"><span style="background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:4px;font-weight:600;">${tierDisplay}</span></td>
            </tr>
          </table>
        </div>
        
        <div style="background:white;padding:20px;border-radius:6px;margin-bottom:16px;">
          <h3 style="margin:0 0 12px;color:#111;font-size:18px;">Stripe Information</h3>
          <p style="font-size:14px;color:#444;margin:4px 0;"><strong>Session ID:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px;">${stripeSessionId}</code></p>
          <p style="font-size:14px;color:#444;margin:4px 0;"><strong>Customer ID:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-size:12px;">${stripeCustomerId}</code></p>
          <p style="margin-top:12px;">
            <a href="https://dashboard.stripe.com/customers/${stripeCustomerId}" style="color:#2563eb;text-decoration:none;font-size:14px;">View in Stripe Dashboard →</a>
          </p>
        </div>
        
        <div style="text-align:center;margin-top:24px;">
          <a href="${adminDashboard}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
            View Admin Dashboard
          </a>
        </div>
        
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="font-size:12px;color:#666;text-align:center;">This is an automated notification from AI Blueprint. Customer has been sent their welcome email with access credentials.</p>
      </div>
    `;
    
    console.log(`📧 Sending new customer notification to admin: ${to}`);
    return this.sendEmail({ to, subject, htmlBody });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
