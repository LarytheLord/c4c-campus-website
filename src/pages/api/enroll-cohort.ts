import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

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
    const { cohortId } = body;

    if (!cohortId) {
      return new Response(
        JSON.stringify({ error: 'Cohort ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if cohort exists and is active/upcoming
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('id, name, course_id, status, max_students, start_date, end_date')
      .eq('id', cohortId)
      .single();

    if (cohortError || !cohort) {
      return new Response(
        JSON.stringify({ error: 'Cohort not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify cohort is open for enrollment
    if (cohort.status !== 'upcoming' && cohort.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Cohort is not open for enrollment' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if already enrolled in this cohort
    const { data: existingCohortEnrollment } = await supabase
      .from('cohort_enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('cohort_id', cohortId)
      .single();

    if (existingCohortEnrollment) {
      return new Response(
        JSON.stringify({
          error: 'Already enrolled in this cohort',
          enrollment: existingCohortEnrollment,
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check capacity limits
    const { data: currentEnrollments, error: countError } = await supabase
      .from('cohort_enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('cohort_id', cohortId)
      .eq('status', 'active');

    if (countError) {
      console.error('Error checking enrollment capacity:', countError);
      return new Response(
        JSON.stringify({ error: 'Failed to check enrollment capacity' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the count from the response
    const enrollmentCount = currentEnrollments || 0;

    // Check if cohort is full
    if (cohort.max_students && enrollmentCount >= cohort.max_students) {
      return new Response(
        JSON.stringify({
          error: 'Cohort is full',
          max_students: cohort.max_students,
          current_enrollments: enrollmentCount
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if course is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, is_published')
      .eq('id', cohort.course_id)
      .single();

    if (courseError || !course || !course.is_published) {
      return new Response(
        JSON.stringify({ error: 'Course is not available' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create cohort enrollment
    const { data: cohortEnrollment, error: cohortEnrollError } = await supabase
      .from('cohort_enrollments')
      .insert([
        {
          user_id: user.id,
          cohort_id: cohortId,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (cohortEnrollError) {
      console.error('Cohort enrollment error:', cohortEnrollError);
      return new Response(
        JSON.stringify({ error: 'Failed to enroll in cohort: ' + cohortEnrollError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Also create a general course enrollment if not already enrolled
    const { data: existingCourseEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', cohort.course_id)
      .single();

    if (!existingCourseEnrollment) {
      // Create general course enrollment
      const { error: courseEnrollError } = await supabase
        .from('enrollments')
        .insert([
          {
            user_id: user.id,
            course_id: cohort.course_id,
            cohort_id: cohortId,
            status: 'active',
          },
        ]);

      if (courseEnrollError) {
        console.error('Course enrollment error:', courseEnrollError);
        // Continue anyway - cohort enrollment is more important
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        cohort_enrollment: cohortEnrollment,
        message: `Successfully enrolled in ${cohort.name}`,
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
