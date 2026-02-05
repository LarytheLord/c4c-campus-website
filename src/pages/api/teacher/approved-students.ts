/**
 * Approved Students API
 * GET /api/teacher/approved-students?cohortId=<uuid>&search=<text>
 * Returns approved students not yet enrolled in the given cohort.
 * Uses service role key to bypass RLS on applications table.
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const prerender = false;

function checkConfiguration(): { valid: boolean; error?: string } {
  if (!supabaseUrl) {
    console.error('[approved-students] Missing PUBLIC_SUPABASE_URL');
    return { valid: false, error: 'Server configuration error' };
  }
  if (!supabaseServiceKey) {
    console.error('[approved-students] Missing SUPABASE_SERVICE_ROLE_KEY');
    return { valid: false, error: 'Server configuration error' };
  }
  return { valid: true };
}

async function verifyTeacherOrAdminAccess(supabase: any, userId: string): Promise<boolean> {
  const { data: application } = await supabase
    .from('applications')
    .select('role')
    .eq('user_id', userId)
    .single();

  return application && (application.role === 'teacher' || application.role === 'admin');
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const configCheck = checkConfiguration();
    if (!configCheck.valid) {
      return new Response(JSON.stringify({ error: configCheck.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Parse auth cookie (same pattern as admin/reviewers.ts)
    const cookies = request.headers.get('cookie') || '';
    const authCookieMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (authCookieMatch) {
      try {
        const decoded = decodeURIComponent(authCookieMatch[1]);
        let tokenData;
        try {
          tokenData = JSON.parse(decoded);
        } catch {
          tokenData = JSON.parse(atob(decoded));
        }
        accessToken = tokenData.access_token || tokenData[0];
        refreshToken = tokenData.refresh_token || tokenData[1];
      } catch (e) {
        console.error('[approved-students] Failed to parse auth cookie', e);
      }
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: { session }, error: authError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (authError || !session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = session.user;

    const isTeacherOrAdmin = await verifyTeacherOrAdminAccess(supabase, user.id);
    if (!isTeacherOrAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Teacher access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse query params
    const url = new URL(request.url);
    const cohortId = url.searchParams.get('cohortId');
    const search = url.searchParams.get('search')?.trim().toLowerCase() || '';

    if (!cohortId) {
      return new Response(JSON.stringify({ error: 'cohortId parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch approved students
    const { data: approvedStudents, error: studentsError } = await supabase
      .from('applications')
      .select('user_id, name, email')
      .eq('status', 'approved')
      .eq('role', 'student')
      .order('name', { ascending: true });

    if (studentsError) {
      console.error('[approved-students] Error fetching students:', studentsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch students' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch existing enrollments for this cohort
    const { data: enrollments, error: enrollError } = await supabase
      .from('cohort_enrollments')
      .select('user_id')
      .eq('cohort_id', cohortId);

    if (enrollError) {
      console.error('[approved-students] Error fetching enrollments:', enrollError);
      return new Response(JSON.stringify({ error: 'Failed to fetch enrollments' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const enrolledUserIds = new Set((enrollments || []).map(e => e.user_id));

    // Filter out already-enrolled students and apply search
    let students = (approvedStudents || []).filter(s => !enrolledUserIds.has(s.user_id));

    if (search) {
      students = students.filter(s =>
        (s.name || '').toLowerCase().includes(search) ||
        (s.email || '').toLowerCase().includes(search)
      );
    }

    return new Response(JSON.stringify({ students }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[approved-students] Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
