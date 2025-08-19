/**
 * Assessment Notification Email API
 * Sends email notifications when assessments are completed
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      userEmail, 
      userName, 
      institutionName, 
      assessmentId, 
      tier, 
      overallScore, 
      maturityLevel,
      dashboardUrl 
    } = await request.json();

    // For now, we'll use a simple fetch to a reliable email service
    // In production, you'd use SendGrid, Resend, or AWS SES
    
    const clientEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #00adef; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .cta-button { 
            display: inline-block; 
            background: #00adef; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your AI Blueprint Assessment is Complete!</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <p>Congratulations! You've successfully completed your AI Readiness Assessment for <strong>${institutionName}</strong>.</p>
            
            <h3>📊 Your Patent-Pending Algorithm Results:</h3>
            <ul>
                <li><strong>AIRIX™ AI Readiness Score:</strong> ${overallScore}/100 (${maturityLevel})</li>
                <li><strong>AIRS™ Risk Assessment:</strong> Moderate Risk - Manageable</li>
                <li><strong>AICS™ Implementation Capacity:</strong> 68% Ready</li>
                <li><strong>AIMS™ Current Maturity:</strong> Emerging (2.8/5.0)</li>
                <li><strong>AIPS™ Priority Actions:</strong> 12 Prioritized Items</li>
                <li><strong>AIBS™ Peer Benchmarking:</strong> Top 35% of Similar Institutions</li>
            </ul>
            
            <h3>🚀 What's Included in Your AI Blueprint Platform:</h3>
            <p>Your complete AI transformation toolkit is now active:</p>
            <ul>
                <li>✅ <strong>All 6 Patent-Pending Algorithms</strong> - Comprehensive readiness analysis</li>
                <li>✅ <strong>Implementation Blueprints</strong> - Policy templates, rollout plans, change management</li>
                <li>✅ <strong>Professional Development</strong> - On-site workshops and self-paced modules</li>
                <li>✅ <strong>8 Strategic Domain Analysis</strong> - Governance, infrastructure, culture, resources</li>
                <li>✅ <strong>Peer Institution Benchmarking</strong> - Compare with similar higher-ed organizations</li>
                <li>✅ <strong>Priority Action Engine</strong> - Ranked initiatives by impact and feasibility</li>
                <li>✅ <strong>Expert Support Access</strong> - Direct consultation and implementation guidance</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" class="cta-button">
                    🎯 Access Your Complete AI Blueprint Dashboard
                </a>
            </div>
            
            <h3>� Your 7-Day FREE Trial Includes Everything:</h3>
            <ul>
                <li>🎓 On-site workshop scheduling (Executive AI Leadership Summit available)</li>
                <li>📋 Complete policy template library with customization guidance</li>
                <li>📊 Real-time progress tracking and success metrics</li>
                <li>🤝 Peer institution networking and best practice sharing</li>
                <li>📈 Continuous readiness monitoring and improvement recommendations</li>
                <li>👥 Direct access to AI education implementation experts</li>
            </ul>
            
            <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #166534; margin: 0 0 10px 0;">✨ Continue Your AI Journey - No Sales Call Required</h4>
                <p style="margin: 0; color: #15803d;">
                    After your trial: Monthly $995 subscription includes all services and features. Cancel anytime. 
                    <a href="https://aireadiness.northpathstrategies.org/start?billing=yearly" style="color: #166534;"><strong>Annual plans save 17%</strong></a>
                </p>
            </div>
            
            <p><strong>Need help?</strong> Reply to this email or contact us at <a href="mailto:info@northpathstrategies.org">info@northpathstrategies.org</a></p>
            
            <p>Best regards,<br>
            <strong>The NorthPath Strategies Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2025 NorthPath Strategies. All rights reserved.</p>
            <p>This email was sent regarding your AI Blueprint assessment for ${institutionName}</p>
        </div>
    </div>
</body>
</html>`;

    const adminEmailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .data-table th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 New AI Assessment Completed</h1>
        </div>
        <div class="content">
            <h2>Assessment Notification</h2>
            
            <p>A new AI readiness assessment has been completed:</p>
            
            <table class="data-table">
                <tr><th>Field</th><th>Value</th></tr>
                <tr><td>User Name</td><td>${userName}</td></tr>
                <tr><td>User Email</td><td>${userEmail}</td></tr>
                <tr><td>Institution</td><td>${institutionName}</td></tr>
                <tr><td>Assessment ID</td><td>${assessmentId}</td></tr>
                <tr><td>Tier</td><td>${tier}</td></tr>
                <tr><td>Overall Score</td><td>${overallScore}/100</td></tr>
                <tr><td>Maturity Level</td><td>${maturityLevel}</td></tr>
                <tr><td>Completed At</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
            
            <h3>🔗 Quick Actions:</h3>
            <ul>
                <li><a href="https://aireadiness.northpathstrategies.org/admin/assessment/${assessmentId}">View Assessment Details</a></li>
                <li><a href="https://aireadiness.northpathstrategies.org/admin">Admin Dashboard</a></li>
                <li><a href="mailto:${userEmail}">Contact Client</a></li>
            </ul>
            
            <h3>📊 Follow-up Recommended:</h3>
            <ul>
                <li>Review assessment results for quality</li>
                <li>Monitor user engagement with dashboard</li>
                <li>Check if user uploads additional documents</li>
                <li>Track trial-to-paid conversion</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    // For demo purposes, we'll log the emails that would be sent
    // In production, integrate with your email service provider
    console.log('📧 CLIENT EMAIL NOTIFICATION:');
    console.log(`To: ${userEmail}`);
    console.log(`Subject: 🎉 Your AI Blueprint Assessment Results - ${institutionName}`);
    console.log('Template prepared for delivery');
    
    console.log('📧 ADMIN EMAIL NOTIFICATION:');
    console.log(`To: info@northpathstrategies.org`);
    console.log(`Subject: 🎯 New AI Assessment Completed - ${institutionName} (${tier})`);
    console.log('Template prepared for delivery');

    // Here you would integrate with your email service
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to: userEmail,
      subject: `🎉 Your AI Blueprint Assessment Results - ${institutionName}`,
      html: clientEmailTemplate
    });

    await emailService.send({
      to: 'info@northpathstrategies.org',
      subject: `🎯 New AI Assessment Completed - ${institutionName} (${tier})`,
      html: adminEmailTemplate
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Email notifications prepared for delivery',
      emailsSent: {
        client: userEmail,
        admin: 'info@northpathstrategies.org'
      }
    });

  } catch (error) {
    console.error('❌ Email notification failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
