/**
 * Quiz Management API - Individual Quiz Operations
 * GET /api/quizzes/[id] - Get quiz details
 * PUT /api/quizzes/[id] - Update quiz
 * DELETE /api/quizzes/[id] - Delete quiz
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import { validateRequest, sanitizeHTML, type ValidationRule } from '@/lib/security';
import { validateQuiz } from '@/lib/quiz-grading';
import type { UpdateQuizRequest } from '@/types/quiz';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET - Get quiz details with questions
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.read);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const quizId = parseInt(params.id!);
    if (isNaN(quizId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid quiz ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get quiz with questions
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        lessons!inner(
          id,
          title,
          modules!inner(
            id,
            courses!inner(
              id,
              created_by
            )
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return new Response(
        JSON.stringify({ error: 'Quiz not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check access: teacher or enrolled student
    const course = (quiz as any).lessons?.modules?.courses;
    const isTeacher = course?.created_by === user.id;

    let isEnrolled = false;
    if (!isTeacher) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', course.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      isEnrolled = !!enrollment;
    }

    if (!isTeacher && !isEnrolled) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
    }

    // For students, hide correct answers unless quiz is completed
    let questionsForResponse = questions || [];
    if (!isTeacher && quiz.is_published) {
      // Get user's attempts
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // If show_correct_answers is false or no completed attempts, hide answers
      const hasCompletedAttempt = attempts?.some(a => a.submitted_at !== null);
      if (!quiz.show_correct_answers || !hasCompletedAttempt) {
        questionsForResponse = questionsForResponse.map(q => ({
          ...q,
          correct_answer: undefined,
        }));
      }
    }

    // Get user's attempts (if student)
    let userAttempts = undefined;
    if (!isTeacher) {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .order('attempt_number', { ascending: false });

      userAttempts = attempts || [];
    }

    // Check if user can attempt
    const submittedAttempts = userAttempts?.filter(a => a.submitted_at !== null).length || 0;
    const canAttempt =
      quiz.is_published &&
      (quiz.max_attempts === 0 || submittedAttempts < quiz.max_attempts);

    return new Response(
      JSON.stringify({
        success: true,
        quiz,
        questions: questionsForResponse,
        userAttempts,
        canAttempt,
        attemptsRemaining:
          quiz.max_attempts > 0
            ? Math.max(0, quiz.max_attempts - submittedAttempts)
            : null,
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

/**
 * PUT - Update quiz
 */
export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const quizId = parseInt(params.id!);
    if (isNaN(quizId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid quiz ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: UpdateQuizRequest = await request.json();

    // Verify quiz exists and user is the teacher
    const { data: existingQuiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        lessons!inner(
          modules!inner(
            courses!inner(
              created_by
            )
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError || !existingQuiz) {
      return new Response(
        JSON.stringify({ error: 'Quiz not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const course = (existingQuiz as any).lessons?.modules?.courses;
    if (course?.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build update object
    const updates: any = {};

    if (body.title !== undefined) {
      updates.title = sanitizeHTML(body.title, []);
    }
    if (body.description !== undefined) {
      updates.description = body.description ? sanitizeHTML(body.description) : null;
    }
    if (body.instructions !== undefined) {
      updates.instructions = body.instructions ? sanitizeHTML(body.instructions) : null;
    }
    if (body.timeLimit !== undefined) {
      updates.time_limit = body.timeLimit;
    }
    if (body.passingScore !== undefined) {
      updates.passing_score = body.passingScore;
    }
    if (body.maxAttempts !== undefined) {
      updates.max_attempts = body.maxAttempts;
    }
    if (body.shuffleQuestions !== undefined) {
      updates.randomize_questions = body.shuffleQuestions;
    }
    if (body.showCorrectAnswers !== undefined) {
      updates.show_correct_answers = body.showCorrectAnswers;
    }
    if (body.availableFrom !== undefined) {
      updates.available_from = body.availableFrom;
    }
    if (body.availableUntil !== undefined) {
      updates.available_until = body.availableUntil;
    }
    if (body.published !== undefined) {
      updates.is_published = body.published;
    }

    // Validate updates
    const quizValidation = validateQuiz(updates);
    if (!quizValidation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: quizValidation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update quiz
    const { data: updatedQuiz, error: updateError } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', quizId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating quiz:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update quiz' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        quiz: updatedQuiz,
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

/**
 * DELETE - Delete quiz
 */
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const quizId = parseInt(params.id!);
    if (isNaN(quizId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid quiz ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify quiz exists and user is the teacher
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        lessons!inner(
          modules!inner(
            courses!inner(
              created_by
            )
          )
        )
      `)
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return new Response(
        JSON.stringify({ error: 'Quiz not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const course = (quiz as any).lessons?.modules?.courses;
    if (course?.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete quiz (cascade will delete questions and attempts)
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (deleteError) {
      console.error('Error deleting quiz:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete quiz' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Quiz deleted successfully',
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
