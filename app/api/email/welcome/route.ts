import { sendWelcomeEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, organization, institutionType, assessmentData } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        await sendWelcomeEmail({
            email,
            name: name || '',
            organization: organization || '',
            institutionType: institutionType || 'K12',
            assessmentData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in welcome email endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to send welcome email' },
            { status: 500 }
        );
    }
}