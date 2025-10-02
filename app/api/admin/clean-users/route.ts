import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  // Simple auth check - you should add proper admin authentication
  const authHeader = req.headers.get('x-admin-key');
  if (authHeader !== 'cleanup-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
  }

  try {
    const results: {
      tablesCleared: string[];
      usersDeleted: number;
      errors: string[];
    } = {
      tablesCleared: [],
      usersDeleted: 0,
      errors: []
    };

    // Step 1: Clear related tables
    console.log('Clearing related tables...');

    // Clear tables (ignoring "no rows" errors)
    const tables = [
      'auth_password_setup_tokens',
      'user_payments',
      'user_profiles',
      'streamlined_assessment_responses',
      'uploaded_documents',
      'gap_analysis_results',
      'implementation_roadmaps',
      'user_activity_log'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error && error.code !== 'PGRST116') {
          results.errors.push(`${table}: ${error.message}`);
        } else {
          results.tablesCleared.push(table);
        }
      } catch (e: any) {
        results.errors.push(`${table}: ${e.message}`);
      }
    }

    // Step 2: Delete all users
    console.log('Listing users...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      results.errors.push(`List users: ${listError.message}`);
    } else if (users) {
      console.log(`Found ${users.length} users to delete`);

      for (const user of users) {
        try {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          if (deleteError) {
            results.errors.push(`Delete user ${user.email}: ${deleteError.message}`);
          } else {
            results.usersDeleted++;
          }
        } catch (e: any) {
          results.errors.push(`Delete user ${user.email}: ${e.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database cleaned',
      results
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json({
      error: 'Cleanup failed',
      details: error.message
    }, { status: 500 });
  }
}