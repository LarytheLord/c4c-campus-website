/**
 * Teacher Enroll Student API
 * POST /api/teacher/enroll-student
 * Body: { userId: string, courseId: number, cohortId: string }
 *
 * Creates an enrollment record in the enrollments table on behalf of a student.
 * Uses service role key to bypass RLS (the enrollments table only allows
 * users to insert their own enrollments, so teachers need elevated access).
 */

import type { APIRoute } from 'astro';
import {
  authenticateRequest,
  verifyTeacherOrAdminAccess,
  createServiceClient,
} from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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

    // Parse request body
    const body = await request.json();
    const { userId, courseId, cohortId } = body;

    if (!userId || courseId == null || !cohortId) {
      return new Response(JSON.stringify({ error: 'userId, courseId, and cohortId are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify teacher owns this course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, created_by')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (course.created_by !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden: You do not own this course' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for existing enrollment
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return new Response(JSON.stringify({ success: true, alreadyEnrolled: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create the enrollment (service role bypasses RLS)
    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert([{
        user_id: userId,
        course_id: courseId,
        cohort_id: cohortId,
        status: 'active',
      }]);

    if (enrollError) {
      console.error('[enroll-student] Error creating enrollment:', enrollError);
      return new Response(JSON.stringify({ error: 'Failed to create enrollment' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[enroll-student] Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
