// Test API endpoints functionality
const testEndpoints = [
    'http://localhost:3001/api/vendors',
    'http://localhost:3001/api/assessment-2',
    'http://localhost:3001/api/ai-readiness'
];

async function testAPIEndpoints() {
    console.log('🚀 Testing API Endpoints...\n');

    for (const endpoint of testEndpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(`${endpoint}: ${response.status} ${response.statusText}`);

            if (response.status === 200) {
                const data = await response.text();
                console.log(`   Response length: ${data.length} characters`);
            }
        } catch (error) {
            console.log(`${endpoint}: ❌ ${error.message}`);
        }
    }

    console.log('\n✅ API endpoint testing completed!');
}

testAPIEndpoints();
