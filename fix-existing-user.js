/**
 * Fix Existing User - Creates missing institution and profile for a user
 * Usage: node fix-existing-user.js <user-email>
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUser(email) {
    console.log(`🔍 Looking up user: ${email}`);

    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('❌ User not found:', email);
        return;
    }

    console.log('✅ Found user:', user.id);

    // Check for existing profile
    const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (existingProfile) {
        console.log('✅ Profile already exists');
    } else {
        console.log('📝 Creating profile...');

        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);

        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                email: user.email,
                name: user.email.split('@')[0],
                organization: user.email.split('@')[1]?.split('.')[0] || 'My Institution',
                institution_type: 'higher_ed',
                subscription_tier: 'trial',
                subscription_status: 'trialing',
                trial_ends_at: trialEndsAt.toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('❌ Failed to create profile:', profileError);
        } else {
            console.log('✅ Profile created');
        }
    }

    // Check for existing membership
    const { data: existingMembership } = await supabase
        .from('institution_memberships')
        .select('*, institutions(*)')
        .eq('user_id', user.id)
        .single();

    if (existingMembership) {
        console.log('✅ Membership already exists for institution:', existingMembership.institutions.name);
    } else {
        console.log('📝 Creating institution and membership...');

        // Create institution
        const orgName = user.email.split('@')[1]?.split('.')[0] || 'My Institution';
        const { data: institution, error: instError } = await supabase
            .from('institutions')
            .insert({
                name: orgName,
                slug: `${orgName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
                headcount: '100-500',
                budget: 'Under $1M',
                org_type: 'higher_ed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (instError) {
            console.error('❌ Failed to create institution:', instError);
            return;
        }

        console.log('✅ Institution created:', institution.id);

        // Create membership
        const { error: membershipError } = await supabase
            .from('institution_memberships')
            .insert({
                user_id: user.id,
                institution_id: institution.id,
                role: 'admin',
                active: true,
                created_at: new Date().toISOString()
            });

        if (membershipError) {
            console.error('❌ Failed to create membership:', membershipError);
        } else {
            console.log('✅ Membership created');
        }
    }

    console.log('✨ User fix complete!');
}

// Get email from command line
const email = process.argv[2];

if (!email) {
    console.error('Usage: node fix-existing-user.js <user-email>');
    process.exit(1);
}

fixUser(email)
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
