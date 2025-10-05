#!/usr/bin/env node
/**
 * Test Script: Diagnose Dashboard 401 Errors
 * 
 * This script tests the API endpoints to see why they're returning 401 errors
 */

const https = require('https');

const BASE_URL = 'https://aiblueprint.educationaiblueprint.com';

// Test user credentials (you'll need to provide these)
const TEST_EMAIL = 'jeremy.estrella+tes1@gmail.com';
const TEST_PASSWORD = 'your-test-password-here';

console.log('🔍 Diagnosing API Authentication Issues\n');

async function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const req = https.request({
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function runDiagnostics() {
    try {
        // Test 1: Check /api/assessment/check without auth
        console.log('1️⃣ Testing /api/assessment/check (no auth)...');
        const assessmentCheck = await makeRequest('/api/assessment/check');
        console.log(`   Status: ${assessmentCheck.status}`);
        console.log(`   Expected: 401 (Unauthorized)`);
        console.log(`   Result: ${assessmentCheck.status === 401 ? '✅ PASS' : '❌ FAIL'}`);
        
        // Test 2: Check /api/blueprint without auth
        console.log('\n2️⃣ Testing /api/blueprint?limit=3 (no auth)...');
        const blueprintCheck = await makeRequest('/api/blueprint?limit=3');
        console.log(`   Status: ${blueprintCheck.status}`);
        console.log(`   Expected: 401 (Unauthorized)`);
        console.log(`   Result: ${blueprintCheck.status === 401 ? '✅ PASS' : '❌ FAIL'}`);
        
        console.log('\n📝 Analysis:');
        console.log('The 401 errors are expected because these API routes require authentication.');
        console.log('The issue is that client-side components are calling server-only API routes.');
        console.log('\n💡 Solution:');
        console.log('1. Move authentication checks to be client-side compatible');
        console.log('2. Use server components for data fetching');
        console.log('3. Pass data as props instead of fetching from client components');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runDiagnostics();
