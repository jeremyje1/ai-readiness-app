/**
 * Premium Content API Route
 * Provides dynamic, regularly updated premium content for members
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';
import { contentManager } from '@/lib/community/content-manager';
import { supabase } from '@/lib/supabase';

interface PremiumContentRequest {
  audience?: Audience;
  tier?: 'basic' | 'comprehensive' | 'enterprise';
  limit?: number;
  type?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters
    let audience = getAudienceCookie(request) || searchParams.get('audience') as Audience;
    if (!isValidAudience(audience)) {
      audience = 'k12';
    }
    
    const tier = (searchParams.get('tier') as 'basic' | 'comprehensive' | 'enterprise') || 'basic';
    const limit = parseInt(searchParams.get('limit') || '6');
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    // Verify user access level if userId provided
    let userTier = tier;
    if (userId) {
      userTier = await getUserTier(userId) || tier;
    }

    // Get latest premium content
    let premiumContent = contentManager.getLatestPremiumContent(audience, userTier, limit);

    // Filter by type if specified
    if (type) {
      premiumContent = premiumContent.filter(content => content.type === type);
    }

    // Track content views for analytics
    if (userId && premiumContent.length > 0) {
      trackContentViews(userId, audience, premiumContent.map(c => c.id));
    }

    // Add member-specific metadata
    const enrichedContent = premiumContent.map(content => ({
      ...content,
      canAccess: true, // Already filtered by tier
      isBookmarked: false, // TODO: Check user bookmarks
      lastViewed: null, // TODO: Get from user activity
      downloadCount: content.stats.downloads
    }));

    return NextResponse.json({
      success: true,
      content: enrichedContent,
      total: enrichedContent.length,
      audience,
      userTier,
      lastUpdated: new Date().toISOString(),
      nextUpdate: getNextUpdateDate()
    });

  } catch (error) {
    console.error('Premium content API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch premium content',
        content: []
      },
      { status: 500 }
    );
  }
}

/**
 * Get user's subscription tier
 */
async function getUserTier(userId: string): Promise<'basic' | 'comprehensive' | 'enterprise' | null> {
  try {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return subscription?.tier || 'basic';
  } catch (error) {
    console.warn('Could not fetch user tier:', error);
    return null;
  }
}

/**
 * Track content views for analytics
 */
async function trackContentViews(userId: string, audience: Audience, contentIds: string[]): Promise<void> {
  try {
    const viewData = contentIds.map(contentId => ({
      user_id: userId,
      content_id: contentId,
      audience,
      viewed_at: new Date().toISOString(),
      content_type: 'premium_content'
    }));

    await supabase
      .from('content_views')
      .upsert(viewData, { 
        onConflict: 'user_id,content_id',
        ignoreDuplicates: false 
      });

  } catch (error) {
    console.warn('Failed to track content views:', error);
  }
}

/**
 * Calculate next content update date (1st of next month)
 */
function getNextUpdateDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

/**
 * POST handler for content interactions (bookmark, download, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contentId, userId } = body;

    if (!userId || !contentId) {
      return NextResponse.json(
        { success: false, error: 'userId and contentId are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'bookmark':
        await toggleBookmark(userId, contentId);
        break;
      case 'download':
        await trackDownload(userId, contentId);
        break;
      case 'rate':
        await recordRating(userId, contentId, body.rating);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Content interaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process interaction' },
      { status: 500 }
    );
  }
}

async function toggleBookmark(userId: string, contentId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('content_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .single();

  if (existing) {
    await supabase
      .from('content_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);
  } else {
    await supabase
      .from('content_bookmarks')
      .insert({
        user_id: userId,
        content_id: contentId,
        created_at: new Date().toISOString()
      });
  }
}

async function trackDownload(userId: string, contentId: string): Promise<void> {
  await supabase
    .from('content_downloads')
    .insert({
      user_id: userId,
      content_id: contentId,
      downloaded_at: new Date().toISOString()
    });
}

async function recordRating(userId: string, contentId: string, rating: number): Promise<void> {
  await supabase
    .from('content_ratings')
    .upsert({
      user_id: userId,
      content_id: contentId,
      rating,
      rated_at: new Date().toISOString()
    }, { onConflict: 'user_id,content_id' });
}