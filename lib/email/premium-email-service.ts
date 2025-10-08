import emailService from '@/lib/email-service';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { premiumMonthlyTrendsTemplate } from './templates/premium-monthly-trends';
import { premiumWeeklyProgressTemplate } from './templates/premium-weekly-progress';
import { premiumWelcomeTemplate } from './templates/premium-welcome';

export class PremiumEmailService {
    async sendPremiumWelcomeEmail(userId: string) {
        const supabase = await createServerClient();

        // Get user and institution data
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name, institution_name, email')
            .eq('user_id', userId)
            .single();

        if (!profile) return;

        const userName = `${profile.first_name} ${profile.last_name}`;
        const template = premiumWelcomeTemplate(userName, profile.institution_name);

        await emailService.sendEmail({
            to: profile.email,
            ...template
        });

        // Log email sent
        await supabase.from('email_logs').insert({
            user_id: userId,
            email_type: 'premium_welcome',
            sent_at: new Date().toISOString()
        });
    }

    async sendWeeklyProgressEmail(userId: string) {
        const supabase = await createServerClient();

        // Get user profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name, institution_name, email')
            .eq('user_id', userId)
            .single();

        if (!profile) return;

        // Get progress data
        const { data: blueprints } = await supabase
            .from('blueprints')
            .select('*')
            .eq('user_id', userId);

        // Calculate progress metrics
        const progressData = await this.calculateWeeklyProgress(userId, blueprints || []);

        const template = premiumWeeklyProgressTemplate({
            userName: `${profile.first_name} ${profile.last_name}`,
            institutionName: profile.institution_name,
            ...progressData
        });

        await emailService.sendEmail({
            to: profile.email,
            ...template
        });

        // Log email sent
        await supabase.from('email_logs').insert({
            user_id: userId,
            email_type: 'weekly_progress',
            sent_at: new Date().toISOString()
        });
    }

    async sendMonthlyTrendsEmail(userId: string) {
        const supabase = await createServerClient();

        // Get user profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!profile) return;

        // Generate trends data based on institution profile
        const trendsData = this.generateTrendsData(profile);

        const template = premiumMonthlyTrendsTemplate({
            userName: `${profile.first_name} ${profile.last_name}`,
            institutionName: profile.institution_name,
            month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            ...trendsData
        });

        await emailService.sendEmail({
            to: profile.email,
            ...template
        });

        // Log email sent
        await supabase.from('email_logs').insert({
            user_id: userId,
            email_type: 'monthly_trends',
            sent_at: new Date().toISOString()
        });
    }

    private async calculateWeeklyProgress(userId: string, blueprints: any[]) {
        // This is a simplified calculation - in production, you'd pull from actual task tracking
        const weekNumber = Math.ceil((new Date().getDate()) / 7);
        const tasksTotal = blueprints.reduce((acc, bp) => acc + (bp.phases?.length || 0) * 5, 0);
        const tasksCompleted = Math.floor(tasksTotal * 0.3); // Mock 30% completion

        return {
            weekNumber,
            tasksCompleted,
            tasksTotal,
            progressPercentage: Math.round((tasksCompleted / tasksTotal) * 100),
            quickWins: [
                'AI Ethics Policy draft completed',
                'Faculty training workshop scheduled',
                'Student guidelines published'
            ],
            upcomingMilestones: [
                'Board presentation on AI strategy',
                'Pilot program launch in Computer Science',
                'Vendor evaluation deadline'
            ],
            teamActivity: [
                { name: 'Sarah Johnson', action: 'completed policy review' },
                { name: 'Michael Chen', action: 'invited 3 new team members' }
            ],
            roiSaved: 12500,
            timeSaved: 40
        };
    }

    private generateTrendsData(profile: any) {
        const institutionType = profile.institution_type || 'university';

        // Generate relevant insights based on institution type
        const insights = institutionType === 'k12' ? [
            {
                title: 'AI Tutoring Systems See 40% Adoption Increase',
                impact: 'high' as const,
                description: 'K-12 schools adopting AI tutoring report 25% improvement in math scores'
            },
            {
                title: 'New State Guidelines for Student AI Use',
                impact: 'high' as const,
                description: 'Your state education department released updated AI usage guidelines'
            }
        ] : [
            {
                title: 'GPT-4 Integration in Research',
                impact: 'high' as const,
                description: 'Universities using AI for research see 3x publication rate increase'
            },
            {
                title: 'AI-Powered Admissions Screening',
                impact: 'medium' as const,
                description: 'New tools can reduce application review time by 60%'
            }
        ];

        return {
            keyInsights: insights,
            competitivePosition: [
                { metric: 'AI Tool Adoption', yourScore: 75, peerAverage: 60 },
                { metric: 'Faculty Training', yourScore: 85, peerAverage: 70 },
                { metric: 'Student Satisfaction', yourScore: 90, peerAverage: 80 }
            ],
            recommendedActions: [
                {
                    action: 'Review and update AI academic integrity policy',
                    deadline: 'End of month',
                    effort: 'medium' as const
                },
                {
                    action: 'Launch pilot AI writing assistant program',
                    deadline: 'Next quarter',
                    effort: 'high' as const
                }
            ],
            newPolicies: [
                'AI Tool Evaluation Checklist',
                'Student AI Disclosure Template',
                'Faculty AI Training Curriculum'
            ]
        };
    }
}

// Cron job functions to be called by your scheduling service
export async function sendWeeklyProgressEmails() {
    const supabase = await createServerClient();

    // Get all premium subscribers
    const { data: premiumUsers } = await supabase
        .from('user_payments')
        .select('user_id')
        .eq('payment_status', 'active')
        .eq('stripe_price_id', 'price_1SDnhlRMpSG47vNmDQr1WeJ3');

    if (!premiumUsers) return;

    // Send emails to each premium user
    const premiumEmailService = new PremiumEmailService();

    for (const user of premiumUsers) {
        try {
            await premiumEmailService.sendWeeklyProgressEmail(user.user_id);
        } catch (error) {
            console.error(`Failed to send weekly email to ${user.user_id}:`, error);
        }
    }
}

export async function sendMonthlyTrendsEmails() {
    const supabase = await createServerClient();

    // Get all premium subscribers
    const { data: premiumUsers } = await supabase
        .from('user_payments')
        .select('user_id')
        .eq('payment_status', 'active')
        .eq('stripe_price_id', 'price_1SDnhlRMpSG47vNmDQr1WeJ3');

    if (!premiumUsers) return;

    // Send emails to each premium user
    const premiumEmailService = new PremiumEmailService();

    for (const user of premiumUsers) {
        try {
            await premiumEmailService.sendMonthlyTrendsEmail(user.user_id);
        } catch (error) {
            console.error(`Failed to send monthly email to ${user.user_id}:`, error);
        }
    }
}