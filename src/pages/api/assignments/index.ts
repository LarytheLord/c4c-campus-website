/**
 * API: Assignment Management
 * POST - Create new assignment (teachers only)
 * GET - List assignments for a lesson
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import { validateRequest, type ValidationRule } from '@/lib/security';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST - Create new assignment
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await request.json();

    const validationRules: ValidationRule[] = [
      { field: 'lesson_id', required: true, type: 'number', min: 1 },
      { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 200 },
      { field: 'description', required: false, type: 'string', maxLength: 500 },
      { field: 'instructions', required: false, type: 'string', maxLength: 10000 },
      { field: 'due_date', required: false, type: 'string' },
      { field: 'max_points', required: false, type: 'number', min: 1, max: 1000 },
      { field: 'max_file_size_mb', required: false, type: 'number', min: 1, max: 50 },
      { field: 'allow_late_submissions', required: false, type: 'boolean' },
      { field: 'late_penalty_percent', required: false, type: 'number', min: 0, max: 100 },
      { field: 'allow_resubmission', required: false, type: 'boolean' },
      { field: 'max_submissions', required: false, type: 'number', min: 1, max: 10 },
      { field: 'is_published', required: false, type: 'boolean' }
    ];

    const validation = validateRequest(body, validationRules);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify teacher owns the course for this lesson
    const { data: lesson } = await supabase
      .from('lessons')
      .select('module_id, modules(course_id, courses(created_by))')
      .eq('id', body.lesson_id)
      .single();

    if (!lesson || !(lesson.modules as any)?.courses?.created_by || (lesson.modules as any).courses.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to create assignments for this lesson' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create assignment
    const assignmentData: any = {
      lesson_id: body.lesson_id,
      title: body.title,
      description: body.description || null,
      instructions: body.instructions || null,
      due_date: body.due_date || null,
      max_points: body.max_points || 100,
      allowed_file_types: body.allowed_file_types || ['pdf', 'doc', 'docx', 'txt', 'zip'],
      max_file_size_mb: body.max_file_size_mb || 10,
      allow_late_submissions: body.allow_late_submissions ?? false,
      late_penalty_percent: body.late_penalty_percent || 0,
      allow_resubmission: body.allow_resubmission ?? false,
      max_submissions: body.max_submissions || 1,
      is_published: body.is_published ?? false,
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('assignments')
      .insert([assignmentData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create assignment' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * GET - List assignments for a lesson
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.read);
    if (rateLimitResponse) return rateLimitResponse;

    // Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get lesson_id from query params
    const lessonId = url.searchParams.get('lesson_id');
    if (!lessonId) {
      return new Response(
        JSON.stringify({ error: 'lesson_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Query assignments with RLS protection
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch assignments' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
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
