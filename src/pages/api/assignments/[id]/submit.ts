/**
 * API: Submit Assignment
 * POST - Submit file for assignment (students only)
 *
 * Uses the create_assignment_submission RPC for atomic permission check,
 * submission_number calculation, and record creation to prevent race conditions.
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import { uploadFile, validateFile } from '@/lib/file-upload';
import { sendAssignmentSubmittedEmail } from '@/lib/email-notifications';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Maps database error codes from create_assignment_submission RPC to API responses
 */
function mapSubmissionError(error: { code?: string; message?: string }): {
  status: number;
  error: string;
  code: string;
} {
  const errorMessage = error.message || '';
  const errorCodeMatch = errorMessage.match(/^([A-Z_]+):/);
  const errorCodeFromMessage = errorCodeMatch ? errorCodeMatch[1] : null;

  // Map PostgreSQL error codes and message prefixes to HTTP responses
  // Error codes: P0002=ASSIGNMENT_NOT_FOUND, P0003=ASSIGNMENT_NOT_PUBLISHED,
  //              P0004=SUBMISSIONS_CLOSED, P0005=RESUBMISSION_NOT_ALLOWED,
  //              P0006=MAX_SUBMISSIONS_REACHED
  if (error.code === 'P0002' || errorCodeFromMessage === 'ASSIGNMENT_NOT_FOUND') {
    return {
      status: 404,
      error: 'Assignment not found',
      code: 'ASSIGNMENT_NOT_FOUND'
    };
  }

  if (error.code === 'P0003' || errorCodeFromMessage === 'ASSIGNMENT_NOT_PUBLISHED') {
    return {
      status: 403,
      error: 'This assignment is not available',
      code: 'ASSIGNMENT_NOT_PUBLISHED'
    };
  }

  if (error.code === 'P0004' || errorCodeFromMessage === 'SUBMISSIONS_CLOSED') {
    return {
      status: 403,
      error: 'Submissions are closed for this assignment',
      code: 'SUBMISSIONS_CLOSED'
    };
  }

  if (error.code === 'P0005' || errorCodeFromMessage === 'RESUBMISSION_NOT_ALLOWED') {
    return {
      status: 403,
      error: 'Resubmissions are not allowed for this assignment',
      code: 'RESUBMISSION_NOT_ALLOWED'
    };
  }

  if (error.code === 'P0006' || errorCodeFromMessage === 'MAX_SUBMISSIONS_REACHED') {
    // Extract limit from message if available
    const limitMatch = errorMessage.match(/\((\d+)\)/);
    const limit = limitMatch ? limitMatch[1] : 'maximum';
    return {
      status: 403,
      error: `Maximum submission limit (${limit}) reached`,
      code: 'MAX_SUBMISSIONS_REACHED'
    };
  }

  // Unique constraint violation (race condition fallback)
  if (error.code === '23505') {
    return {
      status: 409,
      error: 'Submission already exists. Please try again.',
      code: 'DUPLICATE_SUBMISSION'
    };
  }

  // Unknown error
  return {
    status: 500,
    error: 'Failed to create submission',
    code: 'SUBMISSION_FAILED'
  };
}

/**
 * POST - Submit assignment file
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

    // Assignment ID is a UUID string per schema.sql
    const assignmentId = params.id;
    if (!assignmentId) {
      return new Response(
        JSON.stringify({ error: 'Assignment ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get assignment details for file validation and notification
    // We still need this for file type/size validation before upload
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        lessons(
          id, title, module_id,
          modules(
            id, title, course_id,
            courses(id, title, created_by)
          )
        )
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return new Response(
        JSON.stringify({ error: 'Assignment not found', code: 'ASSIGNMENT_NOT_FOUND' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'File is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file before upload
    const validation = validateFile(file, {
      maxSizeMB: assignment.max_file_size_mb,
      allowedTypes: assignment.allowed_file_types
    });

    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upload file to storage
    const uploadResult = await uploadFile(
      file,
      user.id,
      assignmentId
    );

    if (!uploadResult.success) {
      return new Response(
        JSON.stringify({ error: uploadResult.error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use atomic RPC to create submission record
    // This combines permission check, submission_number calculation, and insert
    // to prevent race conditions in concurrent submissions
    const { data: submission, error: submissionError } = await supabase
      .rpc('create_assignment_submission', {
        p_assignment_id: assignmentId,
        p_user_id: user.id,
        p_file_url: uploadResult.path!,
        p_file_name: file.name,
        p_file_size_bytes: file.size,
        p_file_type: validation.fileExtension!
      });

    if (submissionError) {
      console.error('Submission error:', submissionError);

      // Map database error codes to API responses
      const errorResponse = mapSubmissionError(submissionError);
      return new Response(
        JSON.stringify({ error: errorResponse.error, code: errorResponse.code }),
        { status: errorResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile for email notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Get teacher email for notification
    const teacherId = (assignment.lessons as any)?.modules?.courses?.created_by;
    if (teacherId && profile) {
      const { data: teacherProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', teacherId)
        .single();

      if (teacherProfile?.email) {
        await sendAssignmentSubmittedEmail(teacherProfile.email, {
          studentName: profile.full_name || 'Student',
          studentEmail: profile.email || user.email!,
          assignmentTitle: assignment.title,
          courseName: (assignment.lessons as any)?.modules?.courses?.title || 'Course',
          submittedAt: new Date().toLocaleString(),
          isLate: submission.is_late
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: submission
      }),
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
