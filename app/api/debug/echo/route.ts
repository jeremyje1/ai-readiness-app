import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const headersObj: Record<string,string> = {};
  for (const [k,v] of request.headers.entries()) {
    if (k.toLowerCase() === 'authorization') {
      const preview = v.length > 40 ? v.slice(0, 20) + '…' + v.slice(-12) : v;
      headersObj[k] = preview;
    } else {
      headersObj[k] = v;
    }
  }
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  return NextResponse.json({
    route: '/api/debug/echo',
    method: request.method,
    url: request.url,
    query: Object.fromEntries(url.searchParams.entries()),
    hasAuth: Boolean(auth),
    authHeaderLength: auth?.length || 0,
    headers: headersObj,
  });
}
