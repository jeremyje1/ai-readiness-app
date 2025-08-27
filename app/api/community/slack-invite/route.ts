/**
 * Slack Community Invite API
 * Sends email-based Slack invitations with audience-specific messaging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';
import { getAudienceConfig } from '@/lib/audience/config';

interface SlackInviteRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  role?: string;
  audience?: Audience;
}

interface SlackInviteResponse {
  success: boolean;
  message: string;
  inviteId?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SlackInviteRequest = await request.json();
    const { email, firstName, lastName, organization, role, audience: bodyAudience } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        error: 'Valid email address is required'
      } as SlackInviteResponse, { status: 400 });
    }

    // Determine audience
    let audience = bodyAudience || getAudienceCookie(request) || 'k12';
    if (!isValidAudience(audience)) {
      audience = 'k12';
    }

    const audienceConfig = getAudienceConfig(audience);

    // Generate invite ID for tracking
    const inviteId = generateInviteId();

    // In a real implementation, you would:
    // 1. Use Slack Web API to send the invite
    // 2. Store the invite record in database
    // 3. Send a welcome email
    
    // For now, we'll simulate the process
    const inviteData = {
      id: inviteId,
      email,
      firstName,
      lastName,
      organization,
      role,
      audience,
      status: 'sent',
      timestamp: new Date().toISOString(),
      audienceSpecific: {
        communityName: audience === 'k12' ? 'K-12 AI Leaders' : 'Higher Ed AI Innovators',
        welcomeMessage: audienceConfig.copy.communityCopy,
        channels: getRecommendedChannels(audience)
      }
    };

    // TODO: Replace with actual Slack API call
    const slackResult = await sendSlackInvite(inviteData);

    if (!slackResult.success) {
      return NextResponse.json({
        success: false,
        error: slackResult.error || 'Failed to send Slack invite'
      } as SlackInviteResponse, { status: 500 });
    }

    // TODO: Store invite in database
    await storeInviteRecord(inviteData);

    // TODO: Send welcome email
    await sendWelcomeEmail(inviteData);

    console.log(`✅ Slack invite sent successfully:`, {
      email,
      audience,
      inviteId,
      organization
    });

    return NextResponse.json({
      success: true,
      message: getSuccessMessage(audience),
      inviteId
    } as SlackInviteResponse);

  } catch (error) {
    console.error('Slack invite API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as SlackInviteResponse, { status: 500 });
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate unique invite ID
 */
function generateInviteId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `slack_inv_${timestamp}_${random}`;
}

/**
 * Get recommended Slack channels based on audience
 */
function getRecommendedChannels(audience: Audience): string[] {
  if (audience === 'k12') {
    return [
      '#k12-general',
      '#superintendent-corner',
      '#curriculum-tech',
      '#policy-discussion',
      '#implementation-support',
      '#vendor-reviews'
    ];
  } else {
    return [
      '#highered-general',
      '#provost-leadership',
      '#faculty-innovation',
      '#research-ai',
      '#accreditation-prep',
      '#vendor-evaluation'
    ];
  }
}

/**
 * Get success message based on audience
 */
function getSuccessMessage(audience: Audience): string {
  if (audience === 'k12') {
    return 'Welcome to the K-12 AI Leaders community! Check your email for the Slack invitation and join hundreds of superintendents, principals, and education leaders.';
  } else {
    return 'Welcome to the Higher Ed AI Innovators community! Check your email for the Slack invitation and connect with provosts, deans, and academic leaders.';
  }
}

/**
 * Send Slack invite (mock implementation)
 * In production, use Slack Web API: https://api.slack.com/methods/admin.users.invite
 */
async function sendSlackInvite(inviteData: any): Promise<{ success: boolean; error?: string }> {
  // Mock implementation - replace with actual Slack API call
  
  if (process.env.SLACK_BOT_TOKEN) {
    try {
      // Example using Slack Web API (requires admin token)
      const response = await fetch('https://slack.com/api/admin.users.invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          team_id: process.env.SLACK_TEAM_ID,
          email: inviteData.email,
          real_name: `${inviteData.firstName || ''} ${inviteData.lastName || ''}`.trim(),
          channels: inviteData.audienceSpecific.channels.join(','),
          custom_message: inviteData.audienceSpecific.welcomeMessage
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Slack API error' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to call Slack API' };
    }
  }

  // Mock success for development
  console.log('📧 Mock Slack invite sent:', inviteData);
  return { success: true };
}

/**
 * Store invite record in database
 */
async function storeInviteRecord(inviteData: any): Promise<void> {
  // TODO: Implement database storage
  console.log('📝 Mock: Storing invite record:', {
    id: inviteData.id,
    email: inviteData.email,
    audience: inviteData.audience
  });
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(inviteData: any): Promise<void> {
  // TODO: Implement email service
  console.log('📧 Mock: Sending welcome email:', {
    to: inviteData.email,
    audience: inviteData.audience,
    subject: `Welcome to ${inviteData.audienceSpecific.communityName}!`
  });
}

/**
 * GET handler to check invite status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('inviteId');
    const email = searchParams.get('email');

    if (!inviteId && !email) {
      return NextResponse.json({
        error: 'Either inviteId or email is required'
      }, { status: 400 });
    }

    // TODO: Implement database lookup
    const mockStatus = {
      id: inviteId || 'unknown',
      email: email || 'unknown',
      status: 'sent',
      sentAt: new Date().toISOString(),
      joinedAt: null
    };

    return NextResponse.json({
      success: true,
      invite: mockStatus
    });

  } catch (error) {
    console.error('Slack invite status API error:', error);
    return NextResponse.json({
      error: 'Failed to check invite status'
    }, { status: 500 });
  }
}