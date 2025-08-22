import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { supabaseAdmin } from '@/lib/supabase';

// Basic in-memory (per lambda instance) rate limiter bucket
const SUBMISSION_WINDOW_MS = 60_000; // 1 minute window
const MAX_PER_WINDOW = 3;
const recentSubmissions: Record<string, number[]> = {};

function rateLimit(key: string) {
  const now = Date.now();
  const arr = (recentSubmissions[key] ||= []);
  // drop old
  while (arr.length && now - arr[0] > SUBMISSION_WINDOW_MS) arr.shift();
  if (arr.length >= MAX_PER_WINDOW) return false;
  arr.push(now);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const honeypotField = process.env.CONTACT_HONEYPOT_FIELD || 'company_website';
    const { name, email, organization, message } = body;
    const honeypot = body[honeypotField];
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }
    // Basic email format check
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
    const ua = req.headers.get('user-agent') || '';
    const rateKey = `${ip}`;
    if (!rateLimit(rateKey)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }
    // Simple spam heuristics
    let spamScore = 0;
    if (/(https?:\/\/|<a\b)/i.test(message)) spamScore += 2; // links
    if ((message.match(/\b(?:viagra|casino|crypto)\b/gi) || []).length) spamScore += 5;
    if (honeypot && String(honeypot).trim().length > 0) spamScore += 10;
    if (name.split(' ').length > 6) spamScore += 2;

    // Persist (best effort) if admin client exists
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('contact_messages').insert({
          name: name.toString().slice(0,200),
          email: email.toString().toLowerCase().slice(0,320),
          organization: organization ? organization.toString().slice(0,255) : null,
          message: message.toString(),
          user_agent: ua.slice(0,500),
          ip_address: ip,
          spam_score: spamScore,
          honeypot_tripped: !!honeypot && String(honeypot).trim().length > 0
        });
      } catch (e) {
        console.error('Failed to persist contact message', e);
      }
    }

    if (spamScore >= 10) {
      // Do not send email for obvious spam
      return NextResponse.json({ success: true, queued: false, filtered: true });
    }
    const sent = await emailService.sendContactEmail({ name, email, organization, message });
    return NextResponse.json({ success: true, sent, spamScore });
  } catch (e:any) {
    return NextResponse.json({ error: 'Server error', details: e.message }, { status: 500 });
  }
}
