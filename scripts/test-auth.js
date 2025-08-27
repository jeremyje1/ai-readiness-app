import { createClient } from '@supabase/supabase-js'

// Test Supabase authentication
async function testAuth() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔍 Testing Supabase Configuration:')
    console.log('URL:', supabaseUrl)
    console.log('Key format:', supabaseKey.substring(0, 20) + '...')

    try {
        // Test connection
        const { data, error } = await supabase.auth.getSession()
        console.log('✅ Connection test:', { hasData: !!data, error: error?.message })

        // Test sign up (to see if auth is working at all)
        const testEmail = 'test-' + Date.now() + '@example.com'
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TestPassword123!'
        })
        console.log('🔐 Sign up test:', {
            success: !signUpError,
            error: signUpError?.message,
            needsConfirmation: signUpData?.user && !signUpData?.session
        })

        // Test with your actual email
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'jeremy.estrella@gmail.com',
            password: 'dummy-password' // Just to see the error type
        })
        console.log('🔐 Sign in test:', {
            error: signInError?.message,
            errorCode: signInError?.status
        })

    } catch (err: any) {
        console.error('❌ Test failed:', err.message)
    }
}

testAuth()
