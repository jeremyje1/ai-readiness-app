import { rateLimitAsync } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Check if the current authenticated user needs to set up their password
 * This endpoint checks for unused password setup tokens for the authenticated user
 */
export async function GET(req: NextRequest) {
    try {
        // Rate limiting to prevent abuse
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const rl = await rateLimitAsync(`password-check|${ip}`, 10, 60_000); // 10 requests per minute
        if (!rl.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Admin client unavailable' }, { status: 500 });
        }

        // Get user session from Authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
        }

        const accessToken = authHeader.slice(7);

        // Validate the session using the access token
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.getUser(accessToken);

        if (sessionError || !sessionData.user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const userId = sessionData.user.id;
        const userEmail = sessionData.user.email;

        // Check for unused password setup tokens for this user
        const { data: tokens, error: tokenError } = await supabaseAdmin
            .from('auth_password_setup_tokens')
            .select('token, created_at, expires_at')
            .eq('user_id', userId)
            .is('used_at', null) // Only unused tokens
            .gt('expires_at', new Date().toISOString()) // Only non-expired tokens
            .order('created_at', { ascending: false })
            .limit(1);

        if (tokenError) {
            console.error('Error checking password setup tokens:', tokenError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        const hasUnusedToken = tokens && tokens.length > 0;

        // Additional check: Look at user metadata to see if they were created via methods that don't set passwords
        const userMetadata = sessionData.user.user_metadata || {};
        const createdVia = userMetadata.created_via;
        const wasCreatedWithoutPassword = (
            createdVia === 'stripe_webhook' ||
            createdVia === 'stripe_checkout' ||
            createdVia === 'manual_grant' ||
            !createdVia // Users created before we added created_via tracking
        );

        const needsPasswordSetup = hasUnusedToken && wasCreatedWithoutPassword;

        return NextResponse.json({
            needsPasswordSetup,
            hasUnusedToken,
            userEmail,
            userId,
            debug: {
                tokenCount: tokens?.length || 0,
                createdVia,
                wasCreatedWithoutPassword
            }
        });

    } catch (error: any) {
        console.error('Password check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}