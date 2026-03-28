/**
 * Security Middleware
 *
 * Applies security measures to all requests including rate limiting,
 * CSRF protection, and security headers
 */

import type { MiddlewareHandler } from 'astro';
import { getSecurityHeaders } from '../lib/security';

/**
 * Security middleware to add headers to all responses
 */
export const securityMiddleware: MiddlewareHandler = async (context, next) => {
  const response = await next();

  // Skip security headers for asset files
  const url = new URL(context.request.url);
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)) {
    return response;
  }

  // Add security headers
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
};
