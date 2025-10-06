/**
 * Resources API Route
 * Provides audience-filtered resources with authentication and tier checks
 */

import { getAudienceCookie } from '@/lib/audience/cookie';
import { Audience, isValidAudience } from '@/lib/audience/deriveAudience';
import {
  getCategories,
  getFeaturedResources,
  getResourcesByAudience,
  getResourcesByCategory,
  getTags,
  hasAccessToResource,
  Resource,
  searchResources
} from '@/lib/resources/catalog';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get audience from cookie or query parameter
    let audience = getAudienceCookie(request);
    const audienceParam = searchParams.get('audience');

    if (audienceParam && isValidAudience(audienceParam)) {
      audience = audienceParam as Audience;
    }

    // Default to k12 if no audience detected
    if (!audience) {
      audience = 'k12';
    }

    // Get query parameters
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const featured = searchParams.get('featured') === 'true';
    const type = searchParams.get('type');
    const meta = searchParams.get('meta') === 'true';

    // Authentication check
    const authHeader = request.headers.get('authorization');
    let isAuthenticated = false;
    let userTier: 'basic' | 'comprehensive' | 'enterprise' | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      // For now, just check if a token is present
      isAuthenticated = true;
      userTier = 'comprehensive'; // Default for authenticated users
    }

    // Handle metadata requests
    if (meta) {
      return NextResponse.json({
        categories: getCategories(audience),
        tags: getTags(audience),
        audience,
        isAuthenticated
      });
    }

    // Get resources based on parameters
    let resources: Resource[] = [];

    if (featured) {
      resources = getFeaturedResources(audience);
    } else if (query) {
      resources = searchResources(query, audience);
    } else if (category) {
      resources = getResourcesByCategory(category, audience);
    } else {
      resources = getResourcesByAudience(audience);
    }

    // Filter by type if specified
    if (type) {
      resources = resources.filter(resource => resource.type === type);
    }

    // Filter by access permissions
    const accessibleResources = resources.filter(resource =>
      hasAccessToResource(resource, userTier, isAuthenticated)
    );

    // Add access metadata to resources
    const enrichedResources = accessibleResources.map(resource => ({
      ...resource,
      hasAccess: hasAccessToResource(resource, userTier, isAuthenticated),
      requiresUpgrade: resource.tierRequired && (!userTier || !hasRequiredTier(userTier, resource.tierRequired)),
      isAuthenticated
    }));

    return NextResponse.json({
      resources: enrichedResources,
      total: enrichedResources.length,
      audience,
      filters: {
        category,
        query,
        featured,
        type
      },
      meta: {
        isAuthenticated,
        userTier,
        totalAvailable: resources.length
      }
    });

  } catch (error) {
    console.error('Resources API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to check tier requirements
 */
function hasRequiredTier(
  userTier: 'basic' | 'comprehensive' | 'enterprise',
  requiredTier: 'basic' | 'comprehensive' | 'enterprise'
): boolean {
  const tierLevels = { basic: 1, comprehensive: 2, enterprise: 3 };
  return tierLevels[userTier] >= tierLevels[requiredTier];
}