/**
 * Certificate Verification API
 * GET /api/certificates/verify/[code] - Verify a certificate by its code
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET - Verify a certificate by its unique code
 * This is a public endpoint - no authentication required
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const { code } = params;

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Certificate code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key if available for verification (public endpoint)
    // Fall back to anon key if service key not available
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey
    );

    // Look up certificate by code
    const { data: certificate, error: fetchError } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_code,
        issued_date,
        expiry_date,
        student_name,
        course_title,
        completion_date,
        final_grade,
        metadata,
        created_at
      `)
      .eq('certificate_code', code)
      .single();

    if (fetchError || !certificate) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: 'Certificate not found',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if certificate has expired
    const isExpired = certificate.expiry_date
      ? new Date(certificate.expiry_date) < new Date()
      : false;

    return new Response(
      JSON.stringify({
        valid: !isExpired,
        expired: isExpired,
        certificate: {
          certificate_code: certificate.certificate_code,
          student_name: certificate.student_name,
          course_title: certificate.course_title,
          issued_date: certificate.issued_date,
          completion_date: certificate.completion_date,
          expiry_date: certificate.expiry_date,
          final_grade: certificate.final_grade,
          hours: certificate.metadata?.hours,
        },
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
