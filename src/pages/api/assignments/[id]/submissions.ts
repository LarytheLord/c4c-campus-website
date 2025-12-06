/**
 * API: List Assignment Submissions
 * GET - List all submissions for assignment (teachers only)
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET - List all submissions for an assignment
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.read);
    if (rateLimitResponse) return rateLimitResponse;

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

    const assignmentId = params.id;
    if (!assignmentId) {
      return new Response(
        JSON.stringify({ error: 'Assignment ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify teacher owns this assignment's course
    const { data: assignment } = await supabase
      .from('assignments')
      .select(`
        id,
        lessons(
          id,
          modules(
            id,
            courses(id, created_by)
          )
        )
      `)
      .eq('id', assignmentId)
      .single();

    if (!assignment || (assignment.lessons as any)?.modules?.courses?.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all submissions for this assignment
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        profiles:user_id(id, full_name, email)
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.error('Database error:', submissionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch submissions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get submission statistics
    const { data: stats } = await supabase
      .rpc('get_assignment_stats', {
        assignment_id_param: parseInt(assignmentId)
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: submissions,
        stats: stats || {
          total_submissions: 0,
          graded_submissions: 0,
          average_grade: null,
          late_submissions: 0,
          on_time_submissions: 0
        }
      }),
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
