import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST: Share a blueprint
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { email, make_public } = body;

        // Verify ownership
        const { data: blueprint, error: fetchError } = await supabase
            .from('blueprints')
            .select('user_id, shared_with, is_public, share_token')
            .eq('id', id)
            .single();

        if (fetchError || !blueprint || blueprint.user_id !== user.id) {
            return NextResponse.json({ error: 'Blueprint not found or unauthorized' }, { status: 404 });
        }

        // Handle public sharing
        if (make_public !== undefined) {
            const { error: updateError } = await supabase
                .from('blueprints')
                .update({ is_public: make_public })
                .eq('id', id);

            if (updateError) {
                return NextResponse.json({ error: 'Failed to update sharing status' }, { status: 500 });
            }

            return NextResponse.json({
                message: make_public ? 'Blueprint is now public' : 'Blueprint is now private',
                share_url: make_public ? `${process.env.NEXT_PUBLIC_APP_URL}/blueprint/public/${blueprint.share_token}` : null
            });
        }

        // Handle user sharing
        if (email) {
            // Find user by email
            const { data: targetUser, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (userError || !targetUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Update shared_with array
            const currentShared = blueprint.shared_with || [];
            if (!currentShared.includes(targetUser.id)) {
                currentShared.push(targetUser.id);

                const { error: updateError } = await supabase
                    .from('blueprints')
                    .update({ shared_with: currentShared })
                    .eq('id', id);

                if (updateError) {
                    return NextResponse.json({ error: 'Failed to share blueprint' }, { status: 500 });
                }

                // TODO: Send email notification to the user
            }

            return NextResponse.json({
                message: `Blueprint shared with ${email}`,
                shared_count: currentShared.length
            });
        }

        return NextResponse.json({ error: 'No sharing action specified' }, { status: 400 });
    } catch (error) {
        console.error('Error in POST /api/blueprint/[id]/share:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Remove sharing
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        // Verify ownership
        const { data: blueprint, error: fetchError } = await supabase
            .from('blueprints')
            .select('user_id, shared_with')
            .eq('id', id)
            .single();

        if (fetchError || !blueprint || blueprint.user_id !== user.id) {
            return NextResponse.json({ error: 'Blueprint not found or unauthorized' }, { status: 404 });
        }

        if (userId) {
            // Remove specific user from shared_with
            const currentShared = blueprint.shared_with || [];
            const updatedShared = currentShared.filter((uid: string) => uid !== userId);

            const { error: updateError } = await supabase
                .from('blueprints')
                .update({ shared_with: updatedShared })
                .eq('id', id);

            if (updateError) {
                return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Sharing removed successfully' });
        } else {
            // Remove all sharing (make private)
            const { error: updateError } = await supabase
                .from('blueprints')
                .update({
                    shared_with: [],
                    is_public: false
                })
                .eq('id', id);

            if (updateError) {
                return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 });
            }

            return NextResponse.json({ message: 'Blueprint is now private' });
        }
    } catch (error) {
        console.error('Error in DELETE /api/blueprint/[id]/share:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}