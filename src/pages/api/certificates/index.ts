/**
 * Certificates API - List User's Certificates
 * GET /api/certificates - Get all certificates for the authenticated user
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

/** Decode a JWT payload locally without a network call */
function decodeJWTPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET - List all certificates for the authenticated user
 */
export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Get tokens from cookies (server-side auth)
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decode JWT locally instead of setSession (which makes a network call that can fail)
    const jwtPayload = decodeJWTPayload(accessToken);
    if (!jwtPayload || !jwtPayload.sub) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid session' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = jwtPayload.sub as string;

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
