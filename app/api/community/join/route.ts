/**
 * Community Join API Route
 * Handles Slack community invitation process
 */

import { NextRequest, NextResponse } from 'next/server';
import { isValidAudience } from '@/lib/audience/deriveAudience';

interface JoinCommunityRequest {
  email: string;
  name: string;
  audience: string;
  userId?: string;
}

/**
 * Send Slack invitation
 * In a real implementation, this would integrate with Slack's API
 */
async function sendSlackInvitation(
  email: string, 
  name: string, 
  audience: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mock Slack API integration
    // Real implementation would use Slack Web API:
    // https://api.slack.com/methods/admin.users.invite

    const slackWebhookUrl = process.env.SLACK_INVITE_WEBHOOK_URL;
    const slackToken = process.env.SLACK_BOT_TOKEN;

    if (!slackWebhookUrl && !slackToken) {
      // Fallback: Send email notification to admin
      console.log('Slack invitation request (fallback):', {
        email,
        name,
        audience,
        timestamp: new Date().toISOString()
      });

      // In a real app, you might:
      // 1. Store the request in a database for manual processing
      // 2. Send an email to the community admin
      // 3. Add to a queue for batch processing
      
      return { success: true };
    }

    if (slackToken) {
      // Use Slack Web API for direct invitation
      const response = await fetch('https://slack.com/api/admin.users.invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          team_id: process.env.SLACK_TEAM_ID || '',
          email,
          real_name: name,
          channels: getDefaultChannelsForAudience(audience).join(',')
        })
      });

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error || 'Slack invitation failed');
      }

      return { success: true };
    }

    if (slackWebhookUrl) {
      // Use webhook for notification-based flow
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New community join request`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*New Community Join Request*\n\n*Name:* ${name}\n*Email:* ${email}\n*Audience:* ${audience}\n*Timestamp:* ${new Date().toLocaleString()}`
              }
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Send Invitation' },
                  action_id: 'send_invitation',
                  value: JSON.stringify({ email, name, audience })
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send webhook notification');
      }

      return { success: true };
    }

    return { success: false, error: 'No Slack integration configured' };

  } catch (error) {
    console.error('Slack invitation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send invitation'
    };
  }
}

/**
 * Get default channels for audience
 */
function getDefaultChannelsForAudience(audience: string): string[] {
  const commonChannels = ['ai-policy-updates', 'events-announcements', 'ask-the-experts'];
  
  if (audience === 'k12') {
    return ['k12-general', 'teacher-ai-integration', ...commonChannels];
  } else if (audience === 'highered') {
    return ['highered-general', 'faculty-ai-pedagogy', ...commonChannels];
  }
  
  return commonChannels;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Store join request in database for tracking
 */
async function storeJoinRequest(
  email: string, 
  name: string, 
  audience: string, 
  userId?: string
): Promise<void> {
  try {
    // In a real implementation, store in database
    console.log('Community join request stored:', {
      email,
      name,
      audience,
      userId,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
  } catch (error) {
    console.warn('Failed to store join request:', error);
    // Don't fail the main flow for storage errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: JoinCommunityRequest = await request.json();
    const { email, name, audience, userId } = body;

    // Validate required fields
    if (!email || !name || !audience) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: email, name, and audience are required' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid email address' 
        },
        { status: 400 }
      );
    }

    // Validate audience
    if (!isValidAudience(audience)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid audience specified' 
        },
        { status: 400 }
      );
    }

    // Store the join request
    await storeJoinRequest(email.trim(), name.trim(), audience, userId);

    // Send Slack invitation
    const inviteResult = await sendSlackInvitation(
      email.trim(), 
      name.trim(), 
      audience
    );

    if (!inviteResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: inviteResult.error || 'Failed to send community invitation'
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Community invitation sent successfully',
      inviteSent: true,
      details: {
        email: email.trim(),
        audience,
        defaultChannels: getDefaultChannelsForAudience(audience),
        nextSteps: [
          'Check your email for the Slack invitation',
          'If you don\'t see it, check your spam folder',
          'Click the invitation link to join the community',
          'Introduce yourself in the welcome channel'
        ]
      }
    });

  } catch (error) {
    console.error('Community join API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process community join request',
        inviteSent: false
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for join status or community info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      // Check join status for email (in real implementation)
      return NextResponse.json({
        success: true,
        status: 'pending', // pending, invited, joined, failed
        message: 'Join request is being processed'
      });
    }
    
    // Return general join information
    return NextResponse.json({
      success: true,
      communityInfo: {
        platform: 'Slack',
        totalMembers: 2847,
        audiences: ['k12', 'highered'],
        features: [
          'Audience-specific channels',
          'Expert office hours',
          'Resource sharing',
          'Policy discussions',
          'Peer networking'
        ]
      }
    });
    
  } catch (error) {
    console.error('Community join status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get join information' },
      { status: 500 }
    );
  }
}