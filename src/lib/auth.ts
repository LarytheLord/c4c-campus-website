/**
 * Shared Authentication Module
 *
 * Centralizes JWT verification, cookie parsing, and role checks
 * used across all server-side API routes and middleware.
 *
 * Uses the `jose` library for cryptographic JWT signature verification.
 * This prevents forged JWTs from being accepted by service-role API routes
 * (which bypass RLS and therefore bypass PostgREST's built-in JWT check).
 *
 * Verification: JWKS endpoint (Supabase JWT Signing Keys — ES256/RS256)
 * Returns null on failure (fail-closed)
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cached JWKS resolver — created once per server lifetime.
 * `createRemoteJWKSet` fetches keys on first use, then caches them.
 * This is NOT per-request like setSession/getUser — it's a one-time fetch.
 */
let jwksResolver: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKSResolver(): ReturnType<typeof createRemoteJWKSet> | null {
  if (jwksResolver) return jwksResolver;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const jwksUrl = new URL('/auth/v1/.well-known/jwks.json', supabaseUrl);
  jwksResolver = createRemoteJWKSet(jwksUrl);
  return jwksResolver;
}

/**
 * Verify a JWT's signature and decode its claims using the Supabase JWKS endpoint.
 * jose's jwtVerify automatically checks expiration.
 *
 * Returns the payload on success, null on any failure (expired, bad signature, malformed).
 */
export async function verifyJWT(token: string): Promise<{ sub: string; email?: string; exp?: number } | null> {
  const resolver = getJWKSResolver();
  if (!resolver) {
    console.error('[auth] No JWKS resolver available — PUBLIC_SUPABASE_URL not configured');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, resolver);
    if (!payload.sub) return null;
    return { sub: payload.sub, email: payload.email as string | undefined, exp: payload.exp };
  } catch {
    return null;
  }
}

/**
 * Extract the Supabase access token from request cookies.
 *
 * Handles all cookie format variants:
 * - Raw JSON: {"access_token":"...","refresh_token":"..."}
 * - Base64-encoded JSON
 * - URL-encoded JSON
 * - "base64-" prefixed values (some Supabase versions)
 * - Array format: ["access_token","refresh_token"]
 */
export function extractAccessToken(request: Request): string | null {
  const cookies = request.headers.get('cookie') || '';
  const authCookieMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);

  if (!authCookieMatch) return null;

  try {
    let decoded = decodeURIComponent(authCookieMatch[1]);

    // Remove "base64-" prefix if present (some Supabase versions)
    if (decoded.startsWith('base64-')) {
      decoded = decoded.substring(7);
    }

    let tokenData;
    try {
      // First try parsing as raw JSON
      tokenData = JSON.parse(decoded);
    } catch {
      // If that fails, try base64 decoding
      try {
        if (/^[A-Za-z0-9+/=]+$/.test(decoded)) {
          tokenData = JSON.parse(atob(decoded));
        }
      } catch {
        // Not valid base64 JSON either
        return null;
      }
    }

    if (!tokenData) return null;

    // Handle both object format and array format
    return tokenData.access_token || tokenData[0] || null;
  } catch {
    return null;
  }
}

/**
 * Authenticate an API request: extract token, verify JWT, return user or error Response.
 *
 * Usage in API routes:
 * ```
 * const authResult = await authenticateRequest(request);
 * if (authResult instanceof Response) return authResult;
 * const { user, token } = authResult;
 * ```
 */
export async function authenticateRequest(
  request: Request
): Promise<{ user: { id: string }; token: string } | Response> {
  const accessToken = extractAccessToken(request);
  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: No authentication token found' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const jwtPayload = await verifyJWT(accessToken);
  if (!jwtPayload) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return {
    user: { id: jwtPayload.sub },
    token: accessToken,
  };
}

/**
 * Create a Supabase client with the service role key (bypasses RLS).
 * Only use this AFTER authenticating the request with verifyJWT.
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error: Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Verify that a user has teacher or admin role.
 */
export async function verifyTeacherOrAdminAccess(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: application } = await supabase
    .from('applications')
    .select('role')
    .eq('user_id', userId)
    .single();

  return !!application && (application.role === 'teacher' || application.role === 'admin');
}

/**
 * Verify that a user has admin role.
 */
export async function verifyAdminAccess(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: application } = await supabase
    .from('applications')
    .select('role')
    .eq('user_id', userId)
    .single();

  return !!application && application.role === 'admin';
}
