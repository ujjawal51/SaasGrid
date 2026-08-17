/**
 * Lightweight, high-performance in-memory rate limiter for Next.js API Routes.
 * Protects auth and sensitive routes against brute-force, DDoS, and credential stuffing attacks.
 */

const rateLimitStore = new Map();

// Periodic cleanup of stale entries every 10 minutes
if (typeof globalThis.__rateLimitCleanupInterval === 'undefined') {
  globalThis.__rateLimitCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Check if a request exceeds rate limit.
 *
 * @param {Request} req - Next.js Request object
 * @param {string} routeName - Identifier for the endpoint (e.g. 'login', 'signup', 'admin-login')
 * @param {number} limit - Max requests allowed within window (default: 10)
 * @param {number} windowMs - Window timeframe in ms (default: 1 minute = 60,000ms)
 * @returns {{ isRateLimited: boolean, remaining: number, resetTime: number }}
 */
export function checkRateLimit(req, routeName = 'global', limit = 10, windowMs = 60 * 1000) {
  let ip = '127.0.0.1';
  try {
    if (req?.headers?.get) {
      ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1';
    } else if (typeof req === 'string') {
      ip = req;
    } else if (req?.ip) {
      ip = req.ip;
    }
  } catch {}

  const key = `${routeName}:${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Fresh window initialization
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { isRateLimited: false, remaining: limit - 1, resetTime: now + windowMs };
  }

  // Increment hit count
  record.count += 1;
  rateLimitStore.set(key, record);

  if (record.count > limit) {
    return { isRateLimited: true, remaining: 0, resetTime: record.resetTime };
  }

  return { isRateLimited: false, remaining: limit - record.count, resetTime: record.resetTime };
}

/**
 * Flexible rateLimit alias supporting object arguments.
 */
export function rateLimit(options = {}) {
  const ip = options.ip || '127.0.0.1';
  const routeName = options.routeName || 'default';
  const limit = options.limit || 10;
  const windowMs = options.windowMs || 60 * 1000;

  const res = checkRateLimit(ip, routeName, limit, windowMs);
  return {
    allowed: !res.isRateLimited,
    remaining: res.remaining,
    resetTime: Math.ceil((res.resetTime - Date.now()) / 1000),
  };
}

export default checkRateLimit;
