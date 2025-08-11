// Test the webhook endpoint on the custom domain
async function testCustomDomainEndpoint() {
    const webhookURL = 'https://aireadiness.northpathstrategies.org/api/stripe/webhooks';
    
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
    
    try {
        console.log('🧪 Testing CUSTOM DOMAIN webhook endpoint...');
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
        const responseText = await response.text();
        console.log('📝 Response body:', responseText);
        
        if (response.status === 400 && responseText.includes('signature')) {
            console.log('✅ Custom domain webhook endpoint is reachable and working!');
            console.log('');
            console.log('🎯 CORRECT WEBHOOK URL FOR STRIPE:');
            console.log('   https://aireadiness.northpathstrategies.org/api/stripe/webhooks');
        } else {
            console.log('❓ Unexpected response - check webhook configuration');
        }
        
    } catch (error) {
        console.error('❌ Error testing webhook:', error.message);
        console.log('');
        console.log('This might indicate a domain configuration issue.');
    }
}

// Also test the email endpoint on custom domain
async function testCustomDomainEmailEndpoint() {
    const emailURL = 'https://aireadiness.northpathstrategies.org/api/send-welcome-email';
    
    const testEmailPayload = {
        email: 'test@example.com',
        implementationType: 'highered',
        institutionId: 'test-institution-123'
    };
    
    try {
        console.log('\n📧 Testing CUSTOM DOMAIN email endpoint...');
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
            console.log('✅ Custom domain email endpoint is working!');
        } else {
            console.log('❌ Custom domain email endpoint returned error');
        }
        
    } catch (error) {
        console.error('❌ Error testing custom domain email endpoint:', error.message);
    }
}

testCustomDomainEndpoint();
testCustomDomainEmailEndpoint();
