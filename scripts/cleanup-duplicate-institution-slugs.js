/*
 * Institution Slug Duplicate Cleanup Script
 * 
 * This script fixes duplicate slug issues in the institutions table
 * by finding duplicates and renaming them with unique suffixes.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDuplicateSlugs() {
    console.log('🔍 Checking for duplicate institution slugs...');
    
    try {
        // Find all institutions
        const { data: institutions, error } = await supabase
            .from('institutions')
            .select('id, name, slug')
            .order('created_at', { ascending: true });
            
        if (error) {
            throw error;
        }
        
        console.log(`📋 Found ${institutions.length} institutions`);
        
        // Group by slug to find duplicates
        const slugGroups = {};
        institutions.forEach(inst => {
            if (!slugGroups[inst.slug]) {
                slugGroups[inst.slug] = [];
            }
            slugGroups[inst.slug].push(inst);
        });
        
        // Process duplicates
        let duplicatesFound = 0;
        let duplicatesFixed = 0;
        
        for (const [slug, group] of Object.entries(slugGroups)) {
            if (group.length > 1) {
                duplicatesFound++;
                console.log(`🔍 Found ${group.length} institutions with slug "${slug}"`);
                
                // Keep the first one, rename the rest
                for (let i = 1; i < group.length; i++) {
                    const institution = group[i];
                    const newSlug = `${slug}-${i}`;
                    
                    console.log(`   Renaming "${institution.name}" to slug "${newSlug}"`);
                    
                    const { error: updateError } = await supabase
                        .from('institutions')
                        .update({ slug: newSlug })
                        .eq('id', institution.id);
                        
                    if (updateError) {
                        console.error(`   ❌ Failed to update ${institution.id}:`, updateError.message);
                    } else {
                        duplicatesFixed++;
                        console.log(`   ✅ Updated "${institution.name}" to slug "${newSlug}"`);
                    }
                }
            }
        }
        
        console.log('');
        console.log('📊 Cleanup Results:');
        console.log(`   Duplicate groups found: ${duplicatesFound}`);
        console.log(`   Institutions fixed: ${duplicatesFixed}`);
        
        if (duplicatesFound === 0) {
            console.log('✅ No duplicate slugs found - database is clean!');
        } else {
            console.log('✅ Duplicate slug cleanup completed successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
}

// Run the cleanup
cleanupDuplicateSlugs();
