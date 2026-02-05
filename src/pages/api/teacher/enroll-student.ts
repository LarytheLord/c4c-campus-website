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
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

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

export const prerender = false;

function checkConfiguration(): { valid: boolean; error?: string } {
  if (!supabaseUrl) {
    console.error('[enroll-student] Missing PUBLIC_SUPABASE_URL');
    return { valid: false, error: 'Server configuration error' };
  }
  if (!supabaseServiceKey) {
    console.error('[enroll-student] Missing SUPABASE_SERVICE_ROLE_KEY');
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const configCheck = checkConfiguration();
    if (!configCheck.valid) {
      return new Response(JSON.stringify({ error: configCheck.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Parse auth cookie (same pattern as approved-students.ts)
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
        console.error('[enroll-student] Failed to parse auth cookie', e);
      }
    }

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const jwtPayload = decodeJWTPayload(accessToken);
    if (!jwtPayload || !jwtPayload.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = { id: jwtPayload.sub as string };

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
