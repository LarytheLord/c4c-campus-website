import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import type { Cohort } from '@/types';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/cohorts/[id]
 * Get a specific cohort by ID
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({ error: 'Invalid cohort ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Fetch cohort (RLS will handle access control)
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('*')
      .eq('id', id)
      .single();

    if (cohortError || !cohort) {
      return new Response(
        JSON.stringify({ error: 'Cohort not found or access denied' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Optionally fetch enrollment count
    const { count: enrollmentCount } = await supabase
      .from('cohort_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', id);

    return new Response(
      JSON.stringify({
        cohort,
        enrollment_count: enrollmentCount || 0,
      }),
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
 * PATCH /api/cohorts/[id]
 * Update a cohort (teachers/admins only)
 * Body can include:
 *   - name?: string
 *   - start_date?: string (ISO date)
 *   - end_date?: string (ISO date)
 *   - max_students?: number
 *   - status?: string
 */
export const PATCH: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({ error: 'Invalid cohort ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Fetch existing cohort to check permissions
    const { data: existingCohort, error: fetchError } = await supabase
      .from('cohorts')
      .select('*, courses!inner(created_by)')
      .eq('id', id)
      .single();

    if (fetchError || !existingCohort) {
      return new Response(
        JSON.stringify({ error: 'Cohort not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is the course creator (teacher)
    if (existingCohort.courses.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only course teachers can update cohorts' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, start_date, end_date, max_students, status } = body;

    // Validation
    const errors: string[] = [];
    const updates: Partial<Cohort> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        errors.push('name must be a non-empty string');
      } else {
        // Check for duplicate name
        const { data: duplicateCohort } = await supabase
          .from('cohorts')
          .select('id')
          .eq('course_id', existingCohort.course_id)
          .eq('name', name.trim())
          .neq('id', id)
          .single();

        if (duplicateCohort) {
          errors.push('A cohort with this name already exists for this course');
        } else {
          updates.name = name.trim();
        }
      }
    }

    if (start_date !== undefined) {
      const startDateObj = new Date(start_date);
      if (isNaN(startDateObj.getTime())) {
        errors.push('start_date must be a valid ISO date string');
      } else {
        updates.start_date = start_date;
      }
    }

    if (end_date !== undefined) {
      if (end_date === null) {
        updates.end_date = null;
      } else {
        const endDateObj = new Date(end_date);
        if (isNaN(endDateObj.getTime())) {
          errors.push('end_date must be a valid ISO date string');
        } else {
          // Check that end_date is after start_date
          const effectiveStartDate = start_date || existingCohort.start_date;
          const startDateObj = new Date(effectiveStartDate);
          if (endDateObj <= startDateObj) {
            errors.push('end_date must be after start_date');
          } else {
            updates.end_date = end_date;
          }
        }
      }
    }

    if (max_students !== undefined) {
      if (max_students === null) {
        updates.max_students = null;
      } else if (!Number.isInteger(max_students) || max_students < 1) {
        errors.push('max_students must be a positive integer');
      } else {
        updates.max_students = max_students;
      }
    }

    if (status !== undefined) {
      const validStatuses = ['upcoming', 'active', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        errors.push('status must be one of: upcoming, active, completed, archived');
      } else {
        updates.status = status;
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

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No fields to update' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update cohort
    const { data: cohort, error: updateError } = await supabase
      .from('cohorts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating cohort:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update cohort: ' + updateError.message }),
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
        message: 'Cohort updated successfully',
      }),
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
 * DELETE /api/cohorts/[id]
 * Delete a cohort (teachers/admins only)
 */
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({ error: 'Invalid cohort ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

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

    // Fetch existing cohort to check permissions
    const { data: existingCohort, error: fetchError } = await supabase
      .from('cohorts')
      .select('*, courses!inner(created_by)')
      .eq('id', id)
      .single();

    if (fetchError || !existingCohort) {
      return new Response(
        JSON.stringify({ error: 'Cohort not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is the course creator (teacher)
    if (existingCohort.courses.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only course teachers can delete cohorts' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete cohort (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('cohorts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting cohort:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete cohort: ' + deleteError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cohort deleted successfully',
      }),
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
