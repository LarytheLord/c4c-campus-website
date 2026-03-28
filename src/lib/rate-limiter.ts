/**
 * Rate Limiting System
 * 
 * Implements sliding window rate limiting with in-memory storage.
 * Used to protect API endpoints from abuse.
 */

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export const RateLimitPresets = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 },      // 5 requests per 15 minutes
  forms: { windowMs: 60 * 1000, max: 5 },          // 5 requests per minute
  api: { windowMs: 60 * 1000, max: 60 },           // 60 requests per minute
  read: { windowMs: 60 * 1000, max: 120 },         // 120 requests per minute
  expensive: { windowMs: 60 * 60 * 1000, max: 10 } // 10 requests per hour
};

interface RateLimitEntry {
  timestamps: number[];
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if a request is allowed based on the rate limit options
   */
  async checkLimit(identifier: string, options: RateLimitOptions): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Get existing entry or create new
    let entry = this.store.get(identifier);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(identifier, entry);
    }

    // Filter out expired timestamps
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

    // Check if limit exceeded
    const allowed = entry.timestamps.length < options.max;
    const remaining = Math.max(0, options.max - entry.timestamps.length - (allowed ? 1 : 0));
    
    // Calculate reset time (time when the oldest request expires)
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetAt = oldestTimestamp + options.windowMs;

    // Add current request timestamp if allowed
    if (allowed) {
      entry.timestamps.push(now);
    }

    // Cleanup empty entries to prevent memory leaks
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
      // We don't know the window for each entry without context, 
      // so we'll just remove empty ones or very old ones (e.g. > 24h)
      // This is a basic cleanup strategy.
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      } else {
        // Remove timestamps older than 24 hours as a safety net
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        entry.timestamps = entry.timestamps.filter(ts => ts > oneDayAgo);
        if (entry.timestamps.length === 0) {
          this.store.delete(key);
        }
      }
    }
  }
}

// Singleton instance
const limiter = new RateLimiter();

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => limiter.cleanup(), 60 * 60 * 1000);
}

/**
 * Rate limit helper for API routes
 * Returns a Response object if limit exceeded, null otherwise
 */
export async function rateLimit(request: Request, options: RateLimitOptions): Promise<Response | null> {
  // Get client identifier
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  // Use a combination of IP and User-Agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const identifier = `${clientIp}:${userAgent}`;

  const result = await limiter.checkLimit(identifier, options);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': options.max.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
          'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString()
        }
      }
    );
  }

  return null;
}
