var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const RateLimitPresets = {
  auth: { windowMs: 15 * 60 * 1e3, max: 5 },
  // 5 requests per 15 minutes
  forms: { windowMs: 60 * 1e3, max: 5 },
  // 5 requests per minute
  api: { windowMs: 60 * 1e3, max: 60 },
  // 60 requests per minute
  read: { windowMs: 60 * 1e3, max: 120 },
  // 120 requests per minute
  expensive: { windowMs: 60 * 60 * 1e3, max: 10 }
  // 10 requests per hour
};
class RateLimiter {
  constructor() {
    __publicField(this, "store", /* @__PURE__ */ new Map());
  }
  /**
   * Check if a request is allowed based on the rate limit options
   */
  async checkLimit(identifier, options) {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    let entry = this.store.get(identifier);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(identifier, entry);
    }
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
    const allowed = entry.timestamps.length < options.max;
    const remaining = Math.max(0, options.max - entry.timestamps.length - (allowed ? 1 : 0));
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetAt = oldestTimestamp + options.windowMs;
    if (allowed) {
      entry.timestamps.push(now);
    }
    if (entry.timestamps.length === 0) {
      this.store.delete(identifier);
    }
    return { allowed, remaining, resetAt };
  }
  /**
   * Clean up all expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      } else {
        const oneDayAgo = now - 24 * 60 * 60 * 1e3;
        entry.timestamps = entry.timestamps.filter((ts) => ts > oneDayAgo);
        if (entry.timestamps.length === 0) {
          this.store.delete(key);
        }
      }
    }
  }
}
const limiter = new RateLimiter();
if (typeof setInterval !== "undefined") {
  setInterval(() => limiter.cleanup(), 60 * 60 * 1e3);
}
async function rateLimit(request, options) {
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const identifier = `${clientIp}:${userAgent}`;
  const result = await limiter.checkLimit(identifier, options);
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1e3)
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": options.max.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
          "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1e3).toString()
        }
      }
    );
  }
  return null;
}
export {
  RateLimitPresets as R,
  rateLimit as r
};
