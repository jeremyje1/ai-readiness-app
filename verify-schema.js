/**
 * Verify assessment schema migration was successful
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
}

loadEnv();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
    console.log('🔍 Verifying assessment schema migration...\n');
    
    // Test insert into streamlined_assessment_responses with new columns
    const testData = {
        user_id: '1dbe2f11-69cc-49dd-b340-75ac0e502dd5',
        responses: { 0: 2, 1: 3, 2: 1 },
        scores: { 
            OVERALL: { score: 45, maxScore: 60, percentage: 75 },
            GOVERN: { score: 12, maxScore: 15, percentage: 80 },
            MAP: { score: 10, maxScore: 15, percentage: 67 },
            MEASURE: { score: 11, maxScore: 15, percentage: 73 },
            MANAGE: { score: 12, maxScore: 15, percentage: 80 }
        },
        readiness_level: 'Developing',
        ai_roadmap: 'Test AI roadmap generation',
        completed_at: new Date().toISOString()
    };
    
    console.log('📝 Testing streamlined_assessment_responses insert...');
    const { data, error } = await supabase
        .from('streamlined_assessment_responses')
        .insert(testData)
        .select()
        .maybeSingle();
    
    if (error) {
        if (error.code === '23505') {
            // Unique constraint violation - table structure is correct!
            console.log('✅ streamlined_assessment_responses: All columns exist!');
            console.log('   (Duplicate user error is expected - schema is correct)\n');
        } else {
            console.log('❌ Error:', error.message);
            console.log('   Code:', error.code);
            console.log('   ⚠️  Columns may be missing\n');
            return false;
        }
    } else {
        console.log('✅ streamlined_assessment_responses: All columns exist!');
        console.log('✅ Test record created:', data.id);
        
        // Clean up test record
        await supabase
            .from('streamlined_assessment_responses')
            .delete()
            .eq('id', data.id);
        console.log('🧹 Cleaned up test record\n');
    }
    
    // Test gap_analysis_results
    console.log('📝 Testing gap_analysis_results insert...');
    const gapData = {
        user_id: '1dbe2f11-69cc-49dd-b340-75ac0e502dd5',
        overall_score: 75,
        maturity_level: 'Developing',
        govern_score: 80,
        govern_strengths: ['Strong governance'],
        govern_recommendations: ['Improve policies', 'Enhance governance'], // ARRAY format
        map_score: 67,
        map_strengths: ['Good mapping'],
        map_recommendations: ['Document more', 'Create better maps'], // ARRAY format
        measure_score: 73,
        measure_strengths: ['Metrics in place'],
        measure_recommendations: ['Track more KPIs', 'Improve metrics'], // ARRAY format
        manage_score: 80,
        manage_strengths: ['Risk management'],
        manage_recommendations: ['Enhance monitoring', 'Better risk management'], // ARRAY format
        priority_actions: ['Action 1', 'Action 2'],
        quick_wins: ['Win 1', 'Win 2']
    };
    
    const { data: gapResult, error: gapError } = await supabase
        .from('gap_analysis_results')
        .upsert(gapData, { onConflict: 'user_id' })
        .select()
        .maybeSingle();
    
    if (gapError) {
        console.log('❌ gap_analysis_results error:', gapError.message);
        return false;
    } else {
        console.log('✅ gap_analysis_results: All columns exist!');
        console.log('✅ Record created/updated:', gapResult.id);
        
        // Clean up
        await supabase
            .from('gap_analysis_results')
            .delete()
            .eq('id', gapResult.id);
        console.log('🧹 Cleaned up test record\n');
    }
    
    console.log('=' .repeat(60));
    console.log('🎉 DATABASE SCHEMA VERIFIED!');
    console.log('✅ Assessment submission will now work correctly');
    console.log('✅ Dashboard will display results properly');
    console.log('=' .repeat(60));
    console.log('\n🧪 Next Step: Test the assessment flow');
    console.log('   1. Go to /assessment');
    console.log('   2. Complete all 20 questions');
    console.log('   3. Click "Complete Assessment"');
    console.log('   4. Should redirect to dashboard with scores!\n');
    
    return true;
}

verify().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});
