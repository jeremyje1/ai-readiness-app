import { describe, it, expect } from 'vitest';
import { rateLimit } from '../lib/rate-limit';

describe('rateLimit (memory fallback)', () => {
  it('allows first request and decrements remaining', () => {
    const r = rateLimit('test|1', 2, 1000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(1);
  });

  it('blocks after limit exceeded', () => {
    rateLimit('test|2', 1, 1000);
    const r2 = rateLimit('test|2', 1, 1000);
    expect(r2.allowed).toBe(false);
  });
});
