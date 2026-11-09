/**
 * Small fixed-window rate limiter.
 *
 * This is intentionally in-process: it protects a single Bun instance from
 * cheap abuse (pairing-code brute force, alert spam). If you run multiple
 * instances, back this with Redis instead — the API is the same.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
let callsSinceSweep = 0;

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true when the request is allowed, false when the caller exceeded
 * `limit` requests in `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (++callsSinceSweep >= 500) {
    callsSinceSweep = 0;
    sweep(now);
    if (buckets.size > MAX_BUCKETS) {
      // Hard cap: drop the oldest half rather than grow without bound.
      const keys = [...buckets.keys()].slice(0, Math.floor(buckets.size / 2));
      for (const k of keys) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}
