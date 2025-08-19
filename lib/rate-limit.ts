// Simple in-memory rate limiter (best-effort; resets on redeploy)
// key format: route|ip
const buckets: Record<string, { count: number; reset: number }> = {};

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = buckets[key];
  if (!entry || entry.reset < now) {
    buckets[key] = { count: 1, reset: now + windowMs };
    return { allowed: true, remaining: limit - 1, reset: buckets[key].reset };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.reset };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, reset: entry.reset };
}
