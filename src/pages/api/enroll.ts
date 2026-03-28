import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

/**
 * LEGACY ENDPOINT: POST /api/enroll
 *
 * This endpoint creates direct course enrollments without cohort association.
 * For cohort-based courses, prefer using:
 *   - POST /api/cohorts/[id]/enroll (for cohort enrollment with capacity checks)
 *   - POST /api/enroll-cohort (alternative cohort enrollment endpoint)
 *
 * Body:
 *   - courseId: number (required) - Course ID to enroll in
 *   - cohortId?: string (optional) - UUID of cohort to associate enrollment with
 *
 * Use cases for this endpoint:
 *   - Self-paced courses without cohorts
 *   - Legacy enrollments migration
 *   - Direct course access without time-gating
 */

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get auth token from request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create supabase client with user's auth token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { courseId, cohortId } = body;

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: 'Course ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, is_published')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: 'Course not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!course.is_published) {
      return new Response(
        JSON.stringify({ error: 'Course is not published' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return new Response(
        JSON.stringify({
          error: 'Already enrolled',
          enrollment: existingEnrollment,
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create enrollment (RLS policy allows authenticated users to enroll themselves)
    const enrollmentData: {
      user_id: string;
      course_id: number;
      status: string;
      cohort_id?: string;
    } = {
      user_id: user.id,
      course_id: courseId,
      status: 'active',
    };

    // Optionally associate with a cohort
    if (cohortId) {
      enrollmentData.cohort_id = cohortId;
    }

    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert([enrollmentData])
      .select()
      .single();

    if (enrollError) {
      console.error('Enrollment error:', enrollError);
      return new Response(
        JSON.stringify({ error: 'Failed to enroll: ' + enrollError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        enrollment,
        message: `Successfully enrolled in ${course.title}`,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
