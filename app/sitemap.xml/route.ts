import { NextResponse } from 'next/server';

// Consolidated sitemap after higher-ed domain merge.
// Expand by discovering dynamic routes if required.

const CANONICAL = 'https://aiblueprint.k12aiblueprint.com';

const STATIC_PATHS: string[] = [
  '/',
  '/pricing',
  '/start',
  '/assessment',
  '/dashboard/personalized',
  '/auth/login',
  '/contact',
  '/privacy',
  '/terms'
];

export async function GET() {
  const urls = STATIC_PATHS.map(p => `  <url><loc>${CANONICAL}${p}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new NextResponse(body, { status: 200, headers: { 'Content-Type': 'application/xml' } });
}
