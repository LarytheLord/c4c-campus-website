import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import type { CohortSchedule } from '@/types';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/cohorts/[id]/schedule
 * Get the unlock schedule for a cohort
 * Note: cohort_id is a UUID string per schema.sql
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    // cohort_id is UUID per schema.sql, validate as non-empty string
    if (!id) {
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

    // Verify cohort exists and user has access (RLS will enforce)
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('id')
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

    // Fetch schedule (RLS will handle access control)
    const { data: schedule, error: scheduleError } = await supabase
      .from('cohort_schedules')
      .select('*, modules(id, title, order_index)')
      .eq('cohort_id', id)
      .order('unlock_date', { ascending: true });

    if (scheduleError) {
      console.error('Error fetching schedule:', scheduleError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch schedule: ' + scheduleError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ schedule: schedule || [] }),
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
 * POST /api/cohorts/[id]/schedule
 * Add or update module unlock schedule for a cohort (teachers only)
 * Body:
 *   - module_id: number (required)
 *   - unlock_date: string (required, ISO date)
 *   - lock_date?: string (optional, ISO date)
 * Note: cohort_id is a UUID string per schema.sql
 */
export const POST: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;

    // cohort_id is UUID per schema.sql, validate as non-empty string
    if (!id) {
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

    // Fetch cohort to check permissions
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('*, courses!inner(created_by, id)')
      .eq('id', id)
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

    // Check if user is the course creator (teacher)
    if (cohort.courses.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only course teachers can manage schedules' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { module_id, unlock_date, lock_date } = body;

    // Validation
    const errors: string[] = [];

    if (!module_id) {
      errors.push('module_id is required');
    } else if (!Number.isInteger(module_id) || module_id < 0) {
      errors.push('module_id must be a positive integer');
    }

    if (!unlock_date) {
      errors.push('unlock_date is required');
    } else {
      const unlockDateObj = new Date(unlock_date);
      if (isNaN(unlockDateObj.getTime())) {
        errors.push('unlock_date must be a valid ISO date string');
      }
    }

    if (lock_date) {
      const lockDateObj = new Date(lock_date);
      if (isNaN(lockDateObj.getTime())) {
        errors.push('lock_date must be a valid ISO date string');
      } else {
        const unlockDateObj = new Date(unlock_date);
        if (lockDateObj <= unlockDateObj) {
          errors.push('lock_date must be after unlock_date');
        }
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

    // Verify module belongs to the same course
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id, course_id')
      .eq('id', module_id)
      .single();

    if (moduleError || !module) {
      return new Response(
        JSON.stringify({ error: 'Module not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (module.course_id !== cohort.courses.id) {
      return new Response(
        JSON.stringify({ error: 'Module does not belong to this cohort\'s course' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if schedule entry already exists
    const { data: existingSchedule } = await supabase
      .from('cohort_schedules')
      .select('id')
      .eq('cohort_id', id)
      .eq('module_id', module_id)
      .single();

    let result;
    if (existingSchedule) {
      // Update existing schedule
      const { data, error } = await supabase
        .from('cohort_schedules')
        .update({
          unlock_date,
          lock_date: lock_date || null,
        })
        .eq('id', existingSchedule.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // Create new schedule entry
      // cohort_id is UUID per schema.sql - pass as string directly
      const { data, error } = await supabase
        .from('cohort_schedules')
        .insert([{
          cohort_id: id,
          module_id,
          unlock_date,
          lock_date: lock_date || null,
        }])
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Error creating/updating schedule:', result.error);
      return new Response(
        JSON.stringify({ error: 'Failed to manage schedule: ' + result.error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        schedule: result.data,
        message: existingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully',
      }),
      {
        status: existingSchedule ? 200 : 201,
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
 * DELETE /api/cohorts/[id]/schedule?module_id=X
 * Remove a module from the cohort schedule (teachers only)
 * Note: cohort_id is a UUID string per schema.sql
 */
export const DELETE: APIRoute = async ({ request, params, url }) => {
  try {
    const { id } = params;
    const moduleId = url.searchParams.get('module_id');

    // cohort_id is UUID per schema.sql, validate as non-empty string
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Invalid cohort ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!moduleId || isNaN(Number(moduleId))) {
      return new Response(
        JSON.stringify({ error: 'module_id query parameter is required and must be a number' }),
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

    // Fetch cohort to check permissions
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('*, courses!inner(created_by)')
      .eq('id', id)
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

    // Check if user is the course creator (teacher)
    if (cohort.courses.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Only course teachers can manage schedules' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Delete schedule entry
    const { error: deleteError } = await supabase
      .from('cohort_schedules')
      .delete()
      .eq('cohort_id', id)
      .eq('module_id', moduleId);

    if (deleteError) {
      console.error('Error deleting schedule:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete schedule: ' + deleteError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Schedule entry deleted successfully',
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
