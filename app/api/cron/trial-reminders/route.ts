import { createClient } from '@/lib/supabase/server';
import { emailTouchpoints } from '@/lib/email-touchpoints';
import { NextResponse } from 'next/server';

/**
 * Cron Job: Send trial ending reminder emails
 * Runs daily at 9 AM
 * Finds users with trials ending in 3 days and sends reminder
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting trial reminder cron job...');
    const supabase = await createClient();

    // Calculate date 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(23, 59, 59, 999); // End of day

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    console.log(`📅 Looking for trials ending between ${today.toISOString()} and ${threeDaysFromNow.toISOString()}`);

    // Find users with trials ending in 3 days
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('user_id, email, full_name, institution_name, institution_type, trial_ends_at')
      .eq('subscription_status', 'trial')
      .gte('trial_ends_at', today.toISOString())
      .lte('trial_ends_at', threeDaysFromNow.toISOString());

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      console.log('ℹ️ No users found with trials ending soon');
      return NextResponse.json({ 
        sent: 0, 
        message: 'No trials ending soon',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📧 Found ${users.length} user(s) with trials ending soon`);

    let sent = 0;
    let failed = 0;
    const results = [];

    for (const user of users) {
      try {
        const daysRemaining = Math.ceil(
          (new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        console.log(`📤 Sending trial reminder to ${user.email} (${daysRemaining} days remaining)`);

        const success = await emailTouchpoints.sendTrialEndingSoonEmail(
          {
            email: user.email,
            name: user.full_name || 'User',
            institutionName: user.institution_name,
            institutionType: user.institution_type
          },
          daysRemaining
        );

        if (success) {
          sent++;
          results.push({
            email: user.email,
            status: 'sent',
            daysRemaining
          });
          console.log(`✅ Email sent to ${user.email}`);
        } else {
          failed++;
          results.push({
            email: user.email,
            status: 'failed',
            daysRemaining
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

    console.log(`✅ Trial reminder cron job complete: ${sent} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: users.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fatal error in trial reminder cron:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
