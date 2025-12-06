/**
 * API: List Assignment Submissions
 * GET - List submissions for assignment
 *   - Teachers: See all submissions for assignments they created
 *   - Students: See only their own submissions
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET - List submissions for an assignment
 * Teachers see all submissions; students see only their own
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

    // Get assignment with course ownership info
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        id,
        title,
        max_points,
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

    if (assignmentError || !assignment) {
      return new Response(
        JSON.stringify({ error: 'Assignment not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is the teacher (course creator)
    const isTeacher = (assignment.lessons as any)?.modules?.courses?.created_by === user.id;

    // Get user's role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const canViewAll = isTeacher || isAdmin;

    // Build query based on role
    let query = supabase
      .from('assignment_submissions')
      .select(`
        id,
        assignment_id,
        user_id,
        submission_number,
        file_url,
        file_name,
        file_size_bytes,
        file_type,
        submitted_at,
        is_late,
        status,
        score,
        feedback,
        graded_by,
        graded_at,
        created_at,
        updated_at
      `)
      .eq('assignment_id', assignmentId)
      .order('submission_number', { ascending: false });

    // Students can only see their own submissions
    if (!canViewAll) {
      query = query.eq('user_id', user.id);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      console.error('Database error:', submissionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch submissions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // For teachers, include profile info
    let enrichedSubmissions = submissions || [];
    if (canViewAll && submissions && submissions.length > 0) {
      const userIds = [...new Set(submissions.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      enrichedSubmissions = submissions.map(s => ({
        ...s,
        profiles: profileMap.get(s.user_id) || null
      }));
    }

    // Get submission statistics (teachers only)
    let stats = null;
    if (canViewAll) {
      const { data: statsData } = await supabase
        .rpc('get_assignment_stats', {
          assignment_id_param: assignmentId
        });
      stats = statsData;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedSubmissions,
        stats: stats || undefined,
        role: canViewAll ? 'teacher' : 'student'
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
