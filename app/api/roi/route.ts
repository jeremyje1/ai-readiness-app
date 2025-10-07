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
        const period = url.searchParams.get('period') || 'current_month';
        
        // Get user's institution
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('institution_id')
            .eq('user_id', user.id)
            .single();

        const institutionId = profile?.institution_id || user.id;

        // Calculate date ranges
        const now = new Date();
        let startDate: Date;
        let endDate = now;

        switch (period) {
            case 'current_month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last_month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Get ROI metrics
        const { data: metrics, error: metricsError } = await supabase
            .from('roi_metrics')
            .select('*')
            .eq('institution_id', institutionId)
            .gte('metric_date', startDate.toISOString())
            .lte('metric_date', endDate.toISOString())
            .order('metric_date', { ascending: true });

        if (metricsError) {
            console.error('Error fetching ROI metrics:', metricsError);
        }

        // Calculate aggregates
        const aggregates = metrics?.reduce((acc, metric) => {
            acc.totalHoursSaved += parseFloat(metric.hours_saved_total || 0);
            acc.totalCostReduction += parseFloat(metric.cost_reduction_total || 0);
            acc.tasksAutomated += metric.tasks_automated || 0;
            acc.processesOptimized += metric.processes_optimized || 0;
            return acc;
        }, {
            totalHoursSaved: 0,
            totalCostReduction: 0,
            tasksAutomated: 0,
            processesOptimized: 0
        }) || {
            totalHoursSaved: 0,
            totalCostReduction: 0,
            tasksAutomated: 0,
            processesOptimized: 0
        };

        // Calculate ROI
        const monthlySubscriptionCost = 199;
        const monthsInPeriod = Math.max(1, metrics?.length || 1);
        const totalCost = monthlySubscriptionCost * monthsInPeriod;
        const roiPercentage = totalCost > 0 ? ((aggregates.totalCostReduction - totalCost) / totalCost) * 100 : 0;
        const paybackPeriodMonths = aggregates.totalCostReduction > 0 ? totalCost / (aggregates.totalCostReduction / monthsInPeriod) : 0;

        // Get latest calculation
        const { data: latestCalculation } = await supabase
            .from('roi_calculations')
            .select('*')
            .eq('institution_id', institutionId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return NextResponse.json({
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                label: period
            },
            current: {
                hoursSaved: aggregates.totalHoursSaved,
                costReduction: aggregates.totalCostReduction,
                tasksAutomated: aggregates.tasksAutomated,
                processesOptimized: aggregates.processesOptimized,
                roiPercentage: Math.round(roiPercentage),
                paybackPeriodMonths: Math.round(paybackPeriodMonths)
            },
            projections: {
                annualSavings: (aggregates.totalCostReduction / monthsInPeriod) * 12,
                annualROI: ((aggregates.totalCostReduction / monthsInPeriod) * 12 - monthlySubscriptionCost * 12) / (monthlySubscriptionCost * 12) * 100
            },
            trends: metrics || [],
            lastCalculation: latestCalculation
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
        const {
            metric_date = new Date().toISOString().split('T')[0],
            hours_saved_automation = 0,
            hours_saved_efficiency = 0,
            cost_reduction_staff = 0,
            cost_reduction_tools = 0,
            cost_reduction_errors = 0,
            tasks_automated = 0,
            processes_optimized = 0,
            satisfaction_score = 0
        } = body;

        // Get user's institution
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('institution_id')
            .eq('user_id', user.id)
            .single();

        const institutionId = profile?.institution_id || user.id;

        // Insert or update ROI metrics
        const { data: metric, error: metricError } = await supabase
            .from('roi_metrics')
            .upsert({
                institution_id: institutionId,
                metric_date,
                hours_saved_automation,
                hours_saved_efficiency,
                cost_reduction_staff,
                cost_reduction_tools,
                cost_reduction_errors,
                tasks_automated,
                processes_optimized,
                satisfaction_score,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'institution_id,metric_date'
            })
            .select()
            .single();

        if (metricError) {
            console.error('Error saving ROI metric:', metricError);
            return NextResponse.json({ error: 'Failed to save ROI metric' }, { status: 500 });
        }

        // Calculate and store ROI calculation
        const totalSavings = parseFloat(metric.cost_reduction_total || '0');
        const monthlyROI = totalSavings - 199; // Monthly subscription cost
        const roiPercentage = monthlyROI > 0 ? (monthlyROI / 199) * 100 : 0;

        await supabase
            .from('roi_calculations')
            .insert({
                institution_id: institutionId,
                calculation_date: metric_date,
                monthly_savings: totalSavings,
                annual_projection: totalSavings * 12,
                payback_period_months: totalSavings > 0 ? Math.ceil(199 / totalSavings) : null,
                roi_percentage: roiPercentage,
                calculation_details: {
                    hours_saved: metric.hours_saved_total,
                    cost_breakdown: {
                        staff: metric.cost_reduction_staff,
                        tools: metric.cost_reduction_tools,
                        errors: metric.cost_reduction_errors
                    }
                }
            });

        return NextResponse.json(metric);

    } catch (error) {
        console.error('Error saving ROI metric:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}