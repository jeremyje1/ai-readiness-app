// Test the webhook endpoint directly
const crypto = require('crypto');

async function testWebhookEndpoint() {
    const webhookURL = 'https://ai-readiness-bta3opkci-jeremys-projects-73929cad.vercel.app/api/stripe/webhooks';
    
    // Create a test webhook payload
    const testPayload = {
        id: 'evt_test_' + Date.now(),
        object: 'event',
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test_' + Date.now(),
                object: 'checkout.session',
                customer_email: 'test@example.com',
                metadata: {
                    return_to: 'highered',
                    service: 'ai-readiness-complete'
                },
                mode: 'subscription',
                subscription: 'sub_test_' + Date.now()
            }
        }
    };

    const payload = JSON.stringify(testPayload);
    // Note: Webhook secret removed for security - this test will fail signature validation
    
    try {
        console.log('🧪 Testing webhook endpoint...');
        console.log('📍 URL:', webhookURL);
        console.log('📦 Payload size:', payload.length, 'bytes');
        
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': 'test-signature'  // This will fail validation but we can see if endpoint responds
            },
            body: payload
        });
        
        console.log('📈 Response status:', response.status);
        console.log('📄 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📝 Response body:', responseText);
        
        if (response.status === 400 && responseText.includes('signature')) {
            console.log('✅ Webhook endpoint is reachable (signature validation working as expected)');
        } else {
            console.log('❓ Unexpected response - check webhook configuration');
        }
        
    } catch (error) {
        console.error('❌ Error testing webhook:', error.message);
    }
}

// Also test the email endpoint directly
async function testEmailEndpoint() {
    const emailURL = 'https://ai-readiness-bta3opkci-jeremys-projects-73929cad.vercel.app/api/send-welcome-email';
    
    const testEmailPayload = {
        email: 'test@example.com',
        implementationType: 'highered',
        institutionId: 'test-institution-123'
    };
    
    try {
        console.log('\n📧 Testing email endpoint...');
        console.log('📍 URL:', emailURL);
        
        const response = await fetch(emailURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testEmailPayload)
        });
        
        console.log('📈 Response status:', response.status);
        const responseText = await response.text();
        console.log('📝 Response body:', responseText);
        
        if (response.status === 200) {
            console.log('✅ Email endpoint is working');
        } else {
            console.log('❌ Email endpoint returned error');
        }
        
    } catch (error) {
        console.error('❌ Error testing email endpoint:', error.message);
    }
}

testWebhookEndpoint();
testEmailEndpoint();
