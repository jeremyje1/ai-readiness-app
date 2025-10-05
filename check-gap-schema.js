/**
 * Check gap_analysis_results column types
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

async function checkSchema() {
    console.log('🔍 Checking gap_analysis_results schema...\n');
    
    // Try inserting with text recommendations
    const testData1 = {
        user_id: '1dbe2f11-69cc-49dd-b340-75ac0e502dd5',
        overall_score: 75,
        maturity_level: 'Developing',
        govern_score: 80,
        govern_strengths: ['Strength 1', 'Strength 2'],
        govern_recommendations: 'This is a text recommendation',
        priority_actions: ['Action 1', 'Action 2']
    };
    
    console.log('Test 1: Inserting with TEXT recommendations...');
    const { error: error1 } = await supabase
        .from('gap_analysis_results')
        .insert(testData1);
    
    if (error1) {
        console.log('❌ TEXT failed:', error1.message);
        console.log('   Trying ARRAY format...\n');
        
        // Try with array
        const testData2 = {
            user_id: '1dbe2f11-69cc-49dd-b340-75ac0e502dd5',
            overall_score: 75,
            maturity_level: 'Developing',
            govern_score: 80,
            govern_strengths: ['Strength 1', 'Strength 2'],
            govern_recommendations: ['Recommendation 1', 'Recommendation 2'],
            priority_actions: ['Action 1', 'Action 2']
        };
        
        const { data: data2, error: error2 } = await supabase
            .from('gap_analysis_results')
            .insert(testData2)
            .select();
        
        if (error2) {
            console.log('❌ ARRAY also failed:', error2.message);
        } else {
            console.log('✅ ARRAY format works!');
            console.log('✅ Columns expect ARRAY[], not TEXT');
            
            // Cleanup
            await supabase.from('gap_analysis_results').delete().eq('id', data2[0].id);
        }
    } else {
        console.log('✅ TEXT format works!');
        console.log('✅ Columns expect TEXT, not ARRAY[]');
    }
}

checkSchema();
