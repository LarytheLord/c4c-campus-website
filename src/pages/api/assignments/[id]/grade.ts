/**
 * API: Grade Assignment Submission
 * POST - Grade a student's submission (teachers only)
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import { validateRequest, type ValidationRule } from '@/lib/security';
import { sendAssignmentGradedEmail } from '@/lib/email-notifications';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST - Grade submission
 */
export const POST: APIRoute = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
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
    const body = await request.json();

    // Validate input
    const validationRules: ValidationRule[] = [
      { field: 'submission_id', required: true, type: 'string' },
      { field: 'score', required: true, type: 'number', min: 0 },
      { field: 'feedback', required: false, type: 'string', maxLength: 5000 }
    ];

    const validation = validateRequest(body, validationRules);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get submission and verify teacher owns the course
    const { data: submission, error: submissionError } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignments(
          id, title, max_points,
          lessons(
            id, name,
            modules(
              id, title,
              courses(id, title, created_by)
            )
          )
        ),
        profiles:user_id(id, full_name, email)
      `)
      .eq('id', body.submission_id)
      .eq('assignment_id', assignmentId)
      .single();

    if (submissionError || !submission) {
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const assignment = submission.assignments as any;
    const courseCreatedBy = assignment?.lessons?.modules?.courses?.created_by;

    if (courseCreatedBy !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate score doesn't exceed max points
    if (body.score > assignment.max_points) {
      return new Response(
        JSON.stringify({ error: `Score cannot exceed ${assignment.max_points} points` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update submission with score
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('assignment_submissions')
      .update({
        score: body.score,
        feedback: body.feedback || null,
        status: 'graded',
        graded_at: new Date().toISOString(),
        graded_by: user.id
      })
      .eq('id', body.submission_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to grade submission' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send email notification to student
    const studentProfile = submission.profiles as any;
    if (studentProfile?.email) {
      await sendAssignmentGradedEmail({
        studentName: studentProfile.full_name || 'Student',
        studentEmail: studentProfile.email,
        assignmentTitle: assignment.title,
        courseName: assignment.lessons?.modules?.courses?.title || 'Course',
        grade: updatedSubmission.score,
        maxPoints: assignment.max_points,
        feedback: body.feedback,
        gradedAt: new Date().toLocaleString()
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedSubmission
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
