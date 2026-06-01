/**
 * Lightweight in-memory sliding-window rate limiter keyed by IP.
 * Protects the research endpoint from bot abuse / runaway API costs.
 */
function buckets() {
  if (!globalThis.__alphalensRate) {
    globalThis.__alphalensRate = new Map(); // ip -> number[] (timestamps ms)
  }
  return globalThis.__alphalensRate;
}

/**
 * @returns {boolean} true if the request is allowed, false if it should be 429'd
 */
export function checkRateLimit(ip, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const map = buckets();
  const recent = (map.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    map.set(ip, recent);
    return false;
  }
  recent.push(now);
  map.set(ip, recent);
  return true;
}

export function getClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
