/**
 * Approved Students API
 * GET /api/teacher/approved-students?cohortId=<uuid>&search=<text>
 * Returns approved students not yet enrolled in the given cohort.
 * Uses service role key to bypass RLS on applications table.
 */

import type { APIRoute } from 'astro';
import {
  authenticateRequest,
  verifyTeacherOrAdminAccess,
  createServiceClient,
} from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Authenticate: verify JWT signature + extract user
    const authResult = await authenticateRequest(request);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const supabase = createServiceClient();

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
      .or('role.eq.student,role.is.null')
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
