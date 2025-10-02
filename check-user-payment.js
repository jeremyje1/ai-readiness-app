const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://jocigzsthcpspxfdfxae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvY2lnenN0aGNwc3B4ZmRmeGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzExNzYsImV4cCI6MjA2ODgwNzE3Nn0.krJk0mzZQ3wmo_isokiYkm5eCTfMpIZcGP6qfSKYrHA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserPayment(email) {
    console.log(`🔍 Checking payment status for: ${email}`);

    try {
        // First, find the user
        const { data: authUser, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: 'password123' // You'll need to know the password
        });

        if (authError) {
            console.error('❌ Auth error:', authError.message);
            return;
        }

        const userId = authUser.user?.id;
        if (!userId) {
            console.error('❌ No user ID found');
            return;
        }

        console.log(`✅ User authenticated: ${userId}`);

        // Check payments table
        const { data: payments, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId);

        if (paymentError) {
            console.error('❌ Error checking payments:', paymentError.message);
        } else {
            console.log(`\n💰 Payments found: ${payments?.length || 0}`);
            if (payments && payments.length > 0) {
                payments.forEach((payment, index) => {
                    console.log(`\nPayment ${index + 1}:`);
                    console.log(`  - ID: ${payment.id}`);
                    console.log(`  - Amount: ${payment.amount}`);
                    console.log(`  - Status: ${payment.status}`);
                    console.log(`  - Created: ${payment.created_at}`);
                });
            }
        }

        // Check stripe_customers table
        const { data: stripeCustomer, error: stripeError } = await supabase
            .from('stripe_customers')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (stripeError && stripeError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('❌ Error checking stripe customers:', stripeError.message);
        } else if (stripeCustomer) {
            console.log(`\n💳 Stripe Customer:`);
            console.log(`  - Customer ID: ${stripeCustomer.stripe_customer_id}`);
            console.log(`  - Created: ${stripeCustomer.created_at}`);
        } else {
            console.log(`\n💳 No Stripe customer record found`);
        }

        // Sign out
        await supabase.auth.signOut();

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
    console.log('Usage: node check-user-payment.js <email>');
    console.log('Example: node check-user-payment.js jeremy.estrella@gmail.com');
    process.exit(1);
}

checkUserPayment(email);