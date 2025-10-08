import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

function getProjectRefCookieCandidates(): string[] {
    const candidates = ['sb-aiblueprint-auth-token', 'sb:token'];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        return candidates;
    }

    try {
        const host = new URL(supabaseUrl).host;
        const projectRef = host.split('.supabase.co')[0];
        if (projectRef) {
            candidates.unshift(`sb-${projectRef}-auth-token.1`);
            candidates.unshift(`sb-${projectRef}-auth-token.0`);
            candidates.unshift(`sb-${projectRef}-auth-token`);
        }
    } catch (_error) {
        // Ignore malformed URLs – fallback candidates still apply
    }

    return candidates;
}

const COOKIE_CANDIDATES = getProjectRefCookieCandidates();

function extractBearerToken(request?: NextRequest): string | null {
    if (!request) {
        return null;
    }

    const authorizationHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
    if (authorizationHeader && authorizationHeader.toLowerCase().startsWith('bearer ')) {
        const token = authorizationHeader.slice(7).trim();
        if (token) {
            return token;
        }
    }

    const altHeader = request.headers.get('x-supabase-access-token') ?? request.headers.get('X-Supabase-Access-Token');
    if (altHeader && altHeader.trim().length > 0) {
        return altHeader.trim();
    }

    for (const name of COOKIE_CANDIDATES) {
        const cookieValue = request.cookies.get(name)?.value;
        if (!cookieValue) {
            continue;
        }

        try {
            const decoded = decodeURIComponent(cookieValue);
            const parsed = JSON.parse(decoded);

            if (parsed?.currentSession?.access_token) {
                return parsed.currentSession.access_token;
            }

            if (parsed?.access_token) {
                return parsed.access_token;
            }
        } catch (_error) {
            // Ignore JSON parse errors – cookie may not contain structured data
        }
    }

    return null;
}

export async function resolveServerUser<T>(
    supabase: SupabaseClient<T>,
    request?: NextRequest
): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
        return { user: data.user, error: null };
    }

    const token = extractBearerToken(request);
    if (!token) {
        return { user: null, error: error ?? null };
    }

    const { data: tokenData, error: tokenError } = await supabase.auth.getUser(token);
    if (tokenData?.user) {
        return { user: tokenData.user, error: null };
    }

    return { user: null, error: tokenError ?? error ?? null };
}
