/**
 * Cache header utilities for HTTP response caching
 * @module lib/cache
 */

export interface CacheHeaders {
  'Cache-Control': string;
  'Vary': string;
  [key: string]: string;
}

/**
 * Generate HTTP cache headers for cacheable responses
 * @param maxAge - Maximum age in seconds
 * @param staleWhileRevalidate - Stale-while-revalidate time in seconds
 * @returns Cache headers object
 */
export function getCacheHeaders(
  maxAge: number,
  staleWhileRevalidate: number
): CacheHeaders {
  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'Vary': 'Accept, Accept-Encoding',
    'CDN-Cache-Control': `max-age=${maxAge * 2}`,
  };
}

/**
 * Generate HTTP headers to prevent caching
 * @returns No-cache headers object
 */
export function getNoCacheHeaders(): CacheHeaders {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Vary': 'Accept, Accept-Encoding',
  };
}

/**
 * Generate ETag from content
 * @param content - Content to hash
 * @returns ETag string
 */
export function generateETag(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

/**
 * Check if request has matching ETag
 * @param requestETag - ETag from If-None-Match header
 * @param contentETag - Generated ETag from content
 * @returns True if ETags match
 */
export function matchesETag(requestETag: string | null, contentETag: string): boolean {
  if (!requestETag) return false;
  return requestETag === contentETag || requestETag === `W/${contentETag}`;
}
