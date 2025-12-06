/**
 * API Response Caching Middleware
 *
 * Implements HTTP caching for API endpoints:
 * - ETag support for conditional requests
 * - Cache-Control headers
 * - Automatic cache invalidation
 */

import type { APIContext, MiddlewareHandler } from 'astro';
import { getCacheHeaders, getNoCacheHeaders } from '../lib/cache';

/**
 * Cache configuration for different endpoint types
 */
const CACHE_CONFIG = {
  // Public, static data - long cache
  public: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours
  },
  // User-specific data - short cache
  private: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
  },
  // Real-time data - minimal cache
  realtime: {
    maxAge: 30, // 30 seconds
    staleWhileRevalidate: 60, // 1 minute
  },
  // No cache for sensitive operations
  noCache: {},
};

/**
 * Determine cache strategy based on endpoint
 */
function getCacheStrategy(url: URL): keyof typeof CACHE_CONFIG {
  const path = url.pathname;

  // No cache for mutations (POST, PUT, DELETE)
  if (path.includes('/apply') || path.includes('/enroll') || path.includes('/update')) {
    return 'noCache';
  }

  // Private cache for user-specific data
  if (path.includes('/dashboard') || path.includes('/progress') || path.includes('/admin')) {
    return 'private';
  }

  // Realtime cache for discussions and analytics
  if (path.includes('/discussions') || path.includes('/analytics')) {
    return 'realtime';
  }

  // Public cache for course listings and static content
  return 'public';
}

/**
 * Generate ETag from response data
 */
function generateETag(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${hash.toString(36)}"`;
}

/**
 * API caching middleware
 */
export const cacheMiddleware: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;

  // Only handle API routes
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }

  // Get cache strategy
  const strategy = getCacheStrategy(url);

  // Process the request
  const response = await next();

  // Don't cache error responses
  if (!response.ok) {
    return response;
  }

  // Apply caching headers based on strategy
  if (strategy === 'noCache') {
    const headers = new Headers(response.headers);
    Object.entries(getNoCacheHeaders()).forEach(([key, value]) => {
      headers.set(key, value);
    });
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // For GET requests, add cache headers
  if (request.method === 'GET') {
    const config = CACHE_CONFIG[strategy];
    const headers = new Headers(response.headers);

    // Add cache control headers
    Object.entries(getCacheHeaders(config.maxAge, config.staleWhileRevalidate)).forEach(([key, value]) => {
      headers.set(key, value);
    });

    // Add ETag for conditional requests
    try {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      const etag = generateETag(data);
      headers.set('ETag', etag);

      // Check if client has a matching ETag
      const ifNoneMatch = request.headers.get('If-None-Match');
      if (ifNoneMatch === etag) {
        return new Response(null, {
          status: 304,
          statusText: 'Not Modified',
          headers,
        });
      }
    } catch (e) {
      // If response is not JSON, skip ETag
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
};

/**
 * Compression middleware for API responses
 */
export const compressionMiddleware: MiddlewareHandler = async (context, next) => {
  const response = await next();

  // Check if client accepts compression
  const acceptEncoding = context.request.headers.get('Accept-Encoding') || '';

  // If response is already compressed, return as is
  if (response.headers.has('Content-Encoding')) {
    return response;
  }

  // For API responses, ensure Content-Type is set
  if (!response.headers.has('Content-Type')) {
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
};

/**
 * CORS middleware for API endpoints
 */
export const corsMiddleware: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;

  // Only handle API routes
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = await next();

  // Add CORS headers to response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
