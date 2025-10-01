import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Quick payment check endpoint for new users
// Returns immediately if no payment exists, avoiding timeout issues
export async function GET(request: Request) {
    try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
            return NextResponse.json({ hasPayment: false, error: 'Not authenticated' }, { status: 401 });
        }

        const userId = session.user.id;

        // Quick check - just see if ANY payment exists for this user
        // Using count is faster than fetching full records
        const { count, error } = await supabase
            .from('user_payments')
            .select('*', { count: 'exact', head: true }) // Only count, don't fetch data
            .eq('user_id', userId)
            .eq('access_granted', true)
            .limit(1);

        if (error) {
            console.error('[Quick Payment Check] Query error:', error);
            return NextResponse.json({ hasPayment: false, error: 'Query failed' }, { status: 500 });
        }

        return NextResponse.json({
            hasPayment: (count || 0) > 0,
            userId,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('[Quick Payment Check] Unexpected error:', error);
        return NextResponse.json({ hasPayment: false, error: 'Server error' }, { status: 500 });
    }
}