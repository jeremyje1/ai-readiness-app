// Test script to check institutional data and create sample institution if needed
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Load environment variables manually
let envVars = {};
try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) {
    console.error('Could not read .env.local file');
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testInstitutionalData() {
    try {
        console.log('🏫 Testing institutional data structure...')

        // Check if institutions table exists and has data
        const { data: institutions, error: institutionsError } = await supabaseAdmin
            .from('institutions')
            .select('*')
            .limit(5)

        if (institutionsError) {
            console.error('❌ Error checking institutions table:', institutionsError)
            return
        }

        console.log(`✅ Found ${institutions?.length || 0} institutions`)
        if (institutions && institutions.length > 0) {
            console.log('Sample institutions:', institutions.map(i => ({ name: i.name, org_type: i.org_type })))
        }

        // Check if we have any users
        const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
        if (usersError) {
            console.error('❌ Error checking users:', usersError)
            return
        }

        console.log(`👥 Found ${users?.users?.length || 0} users`)

        // Check institution memberships
        const { data: memberships, error: membershipError } = await supabaseAdmin
            .from('institution_memberships')
            .select(`
        user_id,
        role,
        institutions (name, org_type)
      `)
            .limit(5)

        if (membershipError) {
            console.error('❌ Error checking memberships:', membershipError)
            return
        }

        console.log(`🤝 Found ${memberships?.length || 0} institution memberships`)

        // If we have users but no institutions, create a sample one
        if (users?.users?.length > 0 && (!institutions || institutions.length === 0)) {
            console.log('📝 Creating sample institution for testing...')

            const sampleInstitution = {
                slug: 'demo-district',
                name: 'Demo School District',
                headcount: 2500,
                budget: 15000000,
                org_type: 'K12',
                owner_user_id: users.users[0].id
            }

            const { data: newInstitution, error: createError } = await supabaseAdmin
                .from('institutions')
                .insert(sampleInstitution)
                .select()
                .single()

            if (createError) {
                console.error('❌ Error creating sample institution:', createError)
                return
            }

            console.log('✅ Created sample institution:', newInstitution.name)

            // Create membership for the first user
            const { error: membershipCreateError } = await supabaseAdmin
                .from('institution_memberships')
                .insert({
                    institution_id: newInstitution.id,
                    user_id: users.users[0].id,
                    role: 'admin'
                })

            if (membershipCreateError) {
                console.error('❌ Error creating membership:', membershipCreateError)
                return
            }

            console.log('✅ Created membership for user:', users.users[0].email)
        }

        console.log('🎉 Institutional data structure check complete!')

    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }
}

testInstitutionalData()
