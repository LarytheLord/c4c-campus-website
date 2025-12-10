/**
 * Quiz Management API - Create Quiz
 * POST /api/quizzes - Create a new quiz
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import { validateRequest, sanitizeHTML, type ValidationRule } from '@/lib/security';
import { validateQuiz } from '@/lib/quiz-grading';
import type { CreateQuizRequest, Quiz } from '@/types/quiz';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST - Create a new quiz
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Authentication
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

    // Parse and validate request
    const body: CreateQuizRequest = await request.json();

    const validationRules: ValidationRule[] = [
      { field: 'lessonId', required: true, type: 'number', min: 1 },
      { field: 'title', required: true, type: 'string', minLength: 1, maxLength: 200 },
      { field: 'description', required: false, type: 'string', maxLength: 2000 },
      { field: 'timeLimit', required: false, type: 'number', min: 1 },
      { field: 'passingScore', required: false, type: 'number', min: 0, max: 100 },
      { field: 'maxAttempts', required: false, type: 'number', min: 0 },
    ];

    const validation = validateRequest(body, validationRules);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify teacher owns the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        modules!inner(
          id,
          courses!inner(
            id,
            created_by
          )
        )
      `)
      .eq('id', body.lessonId)
      .single();

    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: 'Lesson not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is the course creator
    const course = (lesson as any).modules?.courses;
    if (!course || course.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied. You must be the course creator.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedTitle = sanitizeHTML(body.title, []);
    const sanitizedDescription = body.description ? sanitizeHTML(body.description) : null;

    // Validate quiz data
    const quizValidation = validateQuiz({
      title: sanitizedTitle,
      passing_score: body.passingScore,
      max_attempts: body.maxAttempts,
      time_limit_minutes: body.timeLimit, // Use correct field name
      available_from: body.availableFrom,
      available_until: body.availableUntil,
    });

    if (!quizValidation.valid) {
      return new Response(
        JSON.stringify({ error: 'Quiz validation failed', details: quizValidation.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get course_id from lesson's module
    const courseId = (lesson as any).modules?.courses?.id;
    if (!courseId) {
      return new Response(
        JSON.stringify({ error: 'Could not determine course for lesson' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create quiz - use schema column names exactly
    const { data: quiz, error: createError } = await supabase
      .from('quizzes')
      .insert([
        {
          course_id: courseId, // Required FK to courses table
          lesson_id: body.lessonId,
          module_id: (lesson as any).modules?.id || null,
          title: sanitizedTitle,
          description: sanitizedDescription,
          time_limit_minutes: body.timeLimit || null, // Correct schema column name
          passing_score: body.passingScore ?? 70,
          max_attempts: body.maxAttempts ?? 3,
          randomize_questions: body.shuffleQuestions ?? false,
          show_correct_answers: body.showCorrectAnswers ?? true,
          show_results_immediately: true, // Default from schema
          available_from: body.availableFrom || null,
          available_until: body.availableUntil || null,
          is_published: body.published ?? false,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating quiz:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create quiz' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        quiz,
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
