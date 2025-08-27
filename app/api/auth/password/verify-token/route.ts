import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Admin client unavailable' }, { status: 500 });
        }

        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 });
        }

        // Check password setup tokens
        const { data, error } = await supabaseAdmin
            .from('auth_password_setup_tokens')
            .select('*')
            .eq('token', token)
            .limit(1)
            .maybeSingle();

        if (error || !data) {
            return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 200 });
        }

        // Check if token is expired or already used
        const isExpired = new Date(data.expires_at) < new Date();
        const isUsed = !!data.used_at;

        if (isExpired) {
            return NextResponse.json({ valid: false, error: 'Token expired' }, { status: 200 });
        }

        if (isUsed) {
            return NextResponse.json({ valid: false, error: 'Token already used' }, { status: 200 });
        }

        return NextResponse.json({
            valid: true,
            email: data.email,
            userId: data.user_id
        });

    } catch (e: any) {
        console.error('Token verification error:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
