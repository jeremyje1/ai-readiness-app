import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const period = url.searchParams.get('period') || '30d';

        // Get user's organization from user_payments
        const { data: payment } = await supabase
            .from('user_payments')
            .select('organization')
            .eq('user_id', user.id)
            .eq('access_granted', true)
            .single();

        if (!payment || !payment.organization) {
            return NextResponse.json({ error: 'No premium access found' }, { status: 404 });
        }

        const organization = payment.organization;

        // Calculate date ranges
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Get ROI metrics
        const { data: metrics, error: metricsError } = await supabase
            .from('roi_metrics')
            .select('*')
            .eq('organization', organization)
            .gte('metric_date', startDate.toISOString())
            .order('metric_date', { ascending: false });

        if (metricsError) {
            console.error('Error fetching ROI metrics:', metricsError);
            return NextResponse.json({ error: 'Failed to fetch ROI metrics' }, { status: 500 });
        }

        // Calculate aggregated values
        const totalSavings = metrics?.reduce((sum, m) => {
            if (m.metric_type === 'cost_savings' || m.metric_type === 'revenue_increase') {
                return sum + Number(m.metric_value);
            }
            return sum;
        }, 0) || 0;

        const totalProductivityHours = metrics?.reduce((sum, m) => {
            if (m.metric_type === 'productivity_hours') {
                return sum + Number(m.metric_value);
            }
            return sum;
        }, 0) || 0;

        // Calculate ROI
        const monthlySubscriptionCost = 199;
        const periodInMonths = period === '30d' ? 1 : period === '90d' ? 3 : 12;
        const totalCost = monthlySubscriptionCost * periodInMonths;
        const roiPercentage = totalCost > 0 ? ((totalSavings - totalCost) / totalCost) * 100 : 0;

        // Annual projection
        const monthsOfData = (now.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
        const monthlySavings = monthsOfData > 0 ? totalSavings / monthsOfData : 0;
        const annualProjection = monthlySavings * 12;
        const paybackPeriod = monthlySavings > monthlySubscriptionCost ? 1 :
            monthlySavings > 0 ? Math.ceil(monthlySubscriptionCost / monthlySavings) : null;

        // Group metrics by category
        const metricsByCategory: Record<string, number> = {};
        metrics?.forEach(m => {
            if (m.category) {
                metricsByCategory[m.category] = (metricsByCategory[m.category] || 0) + Number(m.metric_value);
            }
        });

        return NextResponse.json({
            metrics: metrics || [],
            summary: {
                totalSavings,
                totalProductivityHours,
                roiPercentage,
                monthlySavings,
                annualProjection,
                paybackPeriod,
                periodInMonths
            },
            byCategory: metricsByCategory,
            period
        });

    } catch (error) {
        console.error('Error in ROI API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { metric_type, metric_value, category, description } = body;

        // Get user's organization from user_payments
        const { data: payment } = await supabase
            .from('user_payments')
            .select('organization')
            .eq('user_id', user.id)
            .eq('access_granted', true)
            .single();

        if (!payment || !payment.organization) {
            return NextResponse.json({ error: 'No premium access found' }, { status: 404 });
        }

        const organization = payment.organization;

        // Check if user has permission to add metrics
        const { data: membership } = await supabase
            .from('team_members')
            .select('id, role')
            .eq('user_id', user.id)
            .eq('organization', organization)
            .single();

        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Add ROI metric
        const { data: metric, error: insertError } = await supabase
            .from('roi_metrics')
            .insert({
                organization,
                metric_type,
                metric_value,
                category,
                description,
                metric_date: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error adding ROI metric:', insertError);
            return NextResponse.json({ error: 'Failed to add ROI metric' }, { status: 500 });
        }

        // Log activity
        await supabase
            .from('team_activity')
            .insert({
                team_member_id: membership.id,
                action_type: 'metric_added',
                action_details: { metric_type, value: metric_value, category },
                entity_type: 'roi_metric',
                entity_id: metric.id
            });

        // Calculate updated ROI if needed
        const { data: monthMetrics } = await supabase
            .from('roi_metrics')
            .select('metric_type, metric_value')
            .eq('organization', organization)
            .gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const monthlyTotal = monthMetrics?.reduce((sum, m) => {
            if (m.metric_type === 'cost_savings' || m.metric_type === 'revenue_increase') {
                return sum + Number(m.metric_value);
            }
            return sum;
        }, 0) || 0;

        const roiPercentage = ((monthlyTotal - 199) / 199) * 100;

        // Save calculation
        await supabase
            .from('roi_calculations')
            .insert({
                organization,
                calculation_date: new Date().toISOString(),
                monthly_savings: monthlyTotal,
                annual_projection: monthlyTotal * 12,
                payback_period_months: monthlyTotal > 199 ? 1 : Math.ceil(199 / monthlyTotal),
                roi_percentage: roiPercentage,
                calculation_details: { metrics_count: monthMetrics?.length || 0 }
            });

        return NextResponse.json(metric);

    } catch (error) {
        console.error('Error adding ROI metric:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}