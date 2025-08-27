// Temporary debug endpoint placeholder. Remove or expand with real diagnostics.
import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'auth-env placeholder' })
}
