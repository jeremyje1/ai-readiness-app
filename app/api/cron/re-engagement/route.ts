import { createClient } from '@/lib/supabase/server';
import { emailTouchpoints } from '@/lib/email-touchpoints';
import { NextResponse } from 'next/server';

/**
 * Cron Job: Send re-engagement emails to inactive users
 * Runs daily at 10 AM
 * Finds users inactive for 7+ days and sends reminder
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting re-engagement cron job...');
    const supabase = await createClient();

    // Find users inactive for exactly 7 days (to avoid sending multiple times)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    eightDaysAgo.setHours(0, 0, 0, 0);

    console.log(`📅 Looking for users last active between ${eightDaysAgo.toISOString()} and ${sevenDaysAgo.toISOString()}`);

    // Find inactive users with trial or active subscription
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, full_name, institution_name, institution_type, last_login_at, updated_at')
      .in('subscription_status', ['trial', 'active'])
      .lte('last_login_at', sevenDaysAgo.toISOString())
      .gte('last_login_at', eightDaysAgo.toISOString());

    if (error) {
      console.error('❌ Error fetching inactive users:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      console.log('ℹ️ No inactive users found');
      return NextResponse.json({ 
        sent: 0, 
        message: 'No inactive users found',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📧 Found ${users.length} inactive user(s)`);

    let sent = 0;
    let failed = 0;
    const results = [];

    for (const user of users) {
      try {
        const lastActivity = user.last_login_at || user.updated_at;
        const daysSinceLastLogin = Math.floor(
          (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(`📤 Sending re-engagement email to ${user.email} (${daysSinceLastLogin} days inactive)`);

        const success = await emailTouchpoints.sendReEngagementEmail(
          {
            email: user.email,
            name: user.full_name || 'User',
            institutionName: user.institution_name,
            institutionType: user.institution_type
          },
          daysSinceLastLogin
        );

        if (success) {
          sent++;
          results.push({
            email: user.email,
            status: 'sent',
            daysSinceLastLogin
          });
          console.log(`✅ Email sent to ${user.email}`);
        } else {
          failed++;
          results.push({
            email: user.email,
            status: 'failed',
            daysSinceLastLogin
          });
          console.error(`❌ Failed to send email to ${user.email}`);
        }
      } catch (emailError) {
        failed++;
        results.push({
          email: user.email,
          status: 'error',
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
        console.error(`❌ Error sending to ${user.email}:`, emailError);
      }
    }

    console.log(`✅ Re-engagement cron job complete: ${sent} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: users.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fatal error in re-engagement cron:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
