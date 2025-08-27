#!/usr/bin/env node
// Quick email/password verification against current Supabase environment
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

function readEnv() {
    let url, anon
    try {
        const raw = fs.readFileSync('.env.local', 'utf8')
        raw.split('\n').forEach(l => {
            if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].replace(/['"]/g, '').trim()
            if (l.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) anon = l.split('=')[1].replace(/['"]/g, '').trim()
        })
    } catch (e) { }
    url = process.env.NEXT_PUBLIC_SUPABASE_URL || url
    anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || anon
    if (!url || !anon) {
        console.error('❌ Missing Supabase env (URL or anon key)')
        process.exit(1)
    }
    return { url, anon }
}

function parseArgs() {
    const args = process.argv.slice(2)
    const out = {}
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const k = args[i].replace(/^--/, '')
            const v = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true'
            out[k] = v
        }
    }
    return out
}

; (async () => {
    const { email, password } = parseArgs()
    if (!email || !password) {
        console.log('Usage: node scripts/verify-password.js --email user@example.com --password "Secret123!"')
        process.exit(1)
    }
    const { url, anon } = readEnv()
    console.log('🔍 Verifying credentials...')
    console.log('   Supabase URL:', url)
    const supabase = createClient(url, anon)
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            console.log('❌ Login failed:', error.message)
            process.exit(2)
        }
        console.log('✅ Login success for user id:', data.user.id)
    } catch (e) {
        console.error('❌ Unexpected error:', e.message)
        process.exit(3)
    }
})()
