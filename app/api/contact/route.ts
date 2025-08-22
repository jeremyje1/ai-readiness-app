import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { name, email, organization, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Basic email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const to = process.env.ADMIN_NOTIFICATION_EMAIL || 'info@northpathstrategies.org';
    // Re-use existing email service generic sender if available; else send a simple templated message.
  const sent = await emailService.sendContactEmail({ name, email, organization, message });
  return NextResponse.json({ success: true, sent });
  } catch (e:any) {
    return NextResponse.json({ error: 'Server error', details: e.message }, { status: 500 });
  }
}
