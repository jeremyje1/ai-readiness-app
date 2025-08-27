// Placeholder debug endpoint listing password setup tokens (unimplemented)
import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'list-password-tokens placeholder' })
}
