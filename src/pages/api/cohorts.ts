import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import type { Cohort } from '@/types';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client for operations that require bypassing RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/cohorts
 * List cohorts - students see enrolled cohorts, teachers see their course cohorts
 * Query params:
 *   - course_id: filter by course
 *   - status: filter by status (upcoming, active, completed, archived)
 */
export const GET: APIRoute = async ({ request, url }) => {
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

    // Build query
    let query = supabase.from('cohorts').select('*');

    // Apply filters from query params
    const courseId = url.searchParams.get('course_id');
    if (courseId) {
      query = query.eq('course_id', parseInt(courseId));
    }

    const status = url.searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }

    // Order by start_date descending (newest first)
    query = query.order('start_date', { ascending: false });

    const { data: cohorts, error: cohortsError } = await query;

    if (cohortsError) {
      console.error('Error fetching cohorts:', cohortsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cohorts: ' + cohortsError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ cohorts }),
      {
        status: 200,
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

/**
 * POST /api/cohorts
 * Create a new cohort (teachers/admins only)
 * Body:
 *   - course_id: number (required)
 *   - name: string (required)
 *   - start_date: string (required, ISO date)
 *   - end_date?: string (optional, ISO date)
 *   - max_students?: number (optional)
 *   - status?: string (optional, defaults to 'upcoming')
 */
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
    const { course_id, name, start_date, end_date, max_students, status } = body;

    // Validation
    const errors: string[] = [];

    if (!course_id) {
      errors.push('course_id is required');
    } else if (!Number.isInteger(course_id) || course_id < 0) {
      errors.push('course_id must be a positive integer');
    }

    if (!name) {
      errors.push('name is required');
    } else if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('name must be a non-empty string');
    }

    if (!start_date) {
      errors.push('start_date is required');
    } else {
      // Validate date format
      const startDateObj = new Date(start_date);
      if (isNaN(startDateObj.getTime())) {
        errors.push('start_date must be a valid ISO date string');
      }
    }

    // Validate end_date if provided
    if (end_date) {
      const endDateObj = new Date(end_date);
      if (isNaN(endDateObj.getTime())) {
        errors.push('end_date must be a valid ISO date string');
      } else {
        // Check that end_date is after start_date
        const startDateObj = new Date(start_date);
        if (endDateObj <= startDateObj) {
          errors.push('end_date must be after start_date');
        }
      }
    }

    // Validate max_students if provided
    if (max_students !== undefined && max_students !== null) {
      if (!Number.isInteger(max_students) || max_students < 1) {
        errors.push('max_students must be a positive integer');
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['upcoming', 'active', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        errors.push('status must be one of: upcoming, active, completed, archived');
      }
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if course exists and user has permission (teacher of the course)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, created_by')
      .eq('id', course_id)
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

    // Check if user is the course creator (teacher)
    if (course.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only course teachers can create cohorts' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check for duplicate cohort name in the same course
    const { data: existingCohort } = await supabase
      .from('cohorts')
      .select('id')
      .eq('course_id', course_id)
      .eq('name', name)
      .single();

    if (existingCohort) {
      return new Response(
        JSON.stringify({ error: 'A cohort with this name already exists for this course' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create cohort
    const cohortData: Partial<Cohort> = {
      course_id,
      name: name.trim(),
      start_date,
      end_date: end_date || null,
      max_students: max_students || 50, // Default to 50 if not provided
      status: status || 'upcoming',
      created_by: user.id,
    };

    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .insert([cohortData])
      .select()
      .single();

    if (cohortError) {
      console.error('Error creating cohort:', cohortError);
      return new Response(
        JSON.stringify({ error: 'Failed to create cohort: ' + cohortError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        cohort,
        message: 'Cohort created successfully',
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
