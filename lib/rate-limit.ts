// Distributed rate limiter with Upstash Redis (if configured) + in-memory fallback.
// Maintains the existing return signature: { allowed, remaining, reset }.
// Environment variables (optional):
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, RATE_LIMIT_REDIS_PREFIX

type RLResult = { allowed: boolean; remaining: number; reset: number };

const memoryBuckets: Record<string, { count: number; reset: number }> = {};

async function redisRateLimit(key: string, limit: number, windowMs: number): Promise<RLResult | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;
  const prefix = process.env.RATE_LIMIT_REDIS_PREFIX || 'rl';
  const redisKey = `${prefix}:${key}`;
  try {
    // Step 1: INCR
    const incrRes = await fetch(`${base}/incr/${encodeURIComponent(redisKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!incrRes.ok) throw new Error('INCR failed');
    const count = await incrRes.json();
    // count is number of requests in window (if no TTL set yet, we will set it)
    if (count === 1) {
      // Set expiry only on first increment
      const expSec = Math.ceil(windowMs / 1000);
      await fetch(`${base}/expire/${encodeURIComponent(redisKey)}/${expSec}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
    }
    // Step 2: TTL (ms)
    const ttlRes = await fetch(`${base}/pttl/${encodeURIComponent(redisKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    let pttl = windowMs;
    if (ttlRes.ok) {
      const ttlJson = await ttlRes.json();
      // Upstash returns -2 if key does not exist, -1 if no expire
      if (typeof ttlJson === 'number' && ttlJson > 0) pttl = ttlJson;
    }
    if (count > limit) {
      return { allowed: false, remaining: 0, reset: Date.now() + pttl };
    }
    return { allowed: true, remaining: Math.max(0, limit - count), reset: Date.now() + pttl };
  } catch (e) {
    // Fallback to memory if Redis fails
    return null;
  }
}

function memoryRateLimit(key: string, limit: number, windowMs: number): RLResult {
  const now = Date.now();
  const entry = memoryBuckets[key];
  if (!entry || entry.reset < now) {
    memoryBuckets[key] = { count: 1, reset: now + windowMs };
    return { allowed: true, remaining: limit - 1, reset: memoryBuckets[key].reset };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.reset };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, reset: entry.reset };
}

export async function rateLimitAsync(key: string, limit = 10, windowMs = 60_000): Promise<RLResult> {
  const redisResult = await redisRateLimit(key, limit, windowMs);
  if (redisResult) return redisResult;
  return memoryRateLimit(key, limit, windowMs);
}

// Backwards-compatible sync wrapper for existing usage (will block on async with deopt if Redis enabled).
// Prefer migrating call sites to rateLimitAsync, but keep sync for now.
export function rateLimit(key: string, limit = 10, windowMs = 60_000): RLResult {
  // If Redis env present, we cannot truly do sync; we optimistically fall back to memory.
  const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (hasRedis) {
    // Intentionally not awaiting network; use memory fallback to avoid changing call signatures.
    // Consider refactor to async in future.
    return memoryRateLimit(key, limit, windowMs);
  }
  return memoryRateLimit(key, limit, windowMs);
}

// Utility to expose whether Redis is configured
export function rateLimitBackend() {
  return (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ? 'redis' : 'memory';
}
