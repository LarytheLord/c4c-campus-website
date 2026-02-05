/**
 * Certificates API - List User's Certificates
 * GET /api/certificates - Get all certificates for the authenticated user
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractAccessToken } from '../../../lib/auth';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET - List all certificates for the authenticated user
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const accessToken = extractAccessToken(request);
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT signature (defense-in-depth; PostgREST also validates via anon key)
    let userId: string;
    const jwtPayload = await verifyJWT(accessToken);

    if (jwtPayload) {
      userId = jwtPayload.sub;
    } else {
      // verifyJWT returned null — fall back to local decode since this route
      // uses an anon-key client (PostgREST validates the JWT on every DB query)
      try {
        const parts = accessToken.split('.');
        if (parts.length !== 3) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Invalid session' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
        if (!payload.sub) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Invalid session' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        userId = payload.sub;
      } catch {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid session' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create Supabase client with the access token for RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    });

    // Fetch certificates for the user
    // Schema: certificates table has fields as defined in schema.sql
    const { data: certificates, error: fetchError } = await supabase
      .from('certificates')
      .select(`
        id,
        user_id,
        course_id,
        template_id,
        certificate_code,
        issued_date,
        expiry_date,
        student_name,
        course_title,
        completion_date,
        final_grade,
        pdf_url,
        metadata,
        created_at
      `)
      .eq('user_id', userId)
      .order('issued_date', { ascending: false });

    if (fetchError) {
      console.error('Error fetching certificates:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch certificates' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        certificates: certificates || [],
        count: certificates?.length || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
