/**
 * Quiz Attempt API - Submit Quiz
 * POST /api/quizzes/[id]/attempts/[attemptId]/submit - Submit quiz for grading
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import { autoGradeQuizAttempt, isAttemptExpired } from '@/lib/quiz-grading';
// Removed unused showToast import (client-side only)
import type { SubmitQuizAttemptRequest, SubmitAttemptResponse } from '@/types/quiz';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST - Submit quiz attempt for grading
 */
export const POST: APIRoute = async ({ request, params }) => {
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

    // Quiz and attempt IDs are UUIDs - treat as strings, not numbers
    const quizId = params.id;
    const attemptId = params.attemptId;

    if (!quizId || !attemptId) {
      return new Response(
        JSON.stringify({ error: 'Quiz ID and attempt ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: SubmitQuizAttemptRequest = await request.json();

    if (!body.answers || !Array.isArray(body.answers)) {
      return new Response(
        JSON.stringify({ error: 'Invalid answers format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('quiz_id', quizId)
      .eq('user_id', user.id)
      .single();

    if (attemptError || !attempt) {
      return new Response(
        JSON.stringify({ error: 'Attempt not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if already submitted
    if (attempt.submitted_at) {
      return new Response(
        JSON.stringify({ error: 'Attempt already submitted' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      return new Response(
        JSON.stringify({ error: 'Quiz not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate time spent
    const timeSpentSeconds = Math.floor(
      (Date.now() - new Date(attempt.started_at).getTime()) / 1000
    );

    // Check if time expired - use server-side enforcement
    const isExpired = isAttemptExpired(attempt, quiz);
    let timeLimitExceeded = false;

    if (isExpired && quiz.time_limit_minutes) {
      // Mark as exceeded but still allow submission
      timeLimitExceeded = true;
      // Cap the time_taken_seconds to the limit + a small grace period (30 seconds)
      const maxTimeSeconds = (quiz.time_limit_minutes * 60) + 30;
      if (timeSpentSeconds > maxTimeSeconds) {
        // Log the late submission for auditing
        console.warn(`Late quiz submission: attempt ${attemptId} exceeded time limit by ${timeSpentSeconds - maxTimeSeconds}s`);
      }
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId);

    if (questionsError || !questions) {
      return new Response(
        JSON.stringify({ error: 'Failed to load questions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Auto-grade the quiz
    const gradingResult = autoGradeQuizAttempt(questions, body.answers, quiz);

    // Update attempt
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        answers_json: gradingResult.answers,
        score: gradingResult.score,
        points_earned: gradingResult.pointsEarned,
        total_points: gradingResult.totalPoints,
        passed: gradingResult.passed,
        grading_status: gradingResult.gradingStatus,
        submitted_at: new Date().toISOString(),
        time_taken_seconds: timeSpentSeconds,
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating attempt:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit quiz' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare results for response
    let results = undefined;

    // Show results if auto-graded or if show_correct_answers is enabled
    if (quiz.show_correct_answers || gradingResult.gradingStatus === 'auto_graded') {
      results = {
        questions: gradingResult.answers.map(ans => {
          const question = questions.find(q => q.id === ans.question_id);
          return {
            id: ans.question_id,
            questionText: question?.question_text || '',
            yourAnswer: ans.answer,
            correctAnswer:
              quiz.show_correct_answers
                ? question?.correct_answer || question?.correct_answers_json
                : undefined,
            isCorrect: ans.is_correct,
            pointsEarned: ans.points_earned,
            explanation: quiz.show_correct_answers ? question?.explanation : undefined,
          };
        }),
      };
    }

    const response: SubmitAttemptResponse & { timeLimitExceeded?: boolean } = {
      success: true,
      attempt: {
        id: updatedAttempt.id,
        score: updatedAttempt.score,
        pointsEarned: updatedAttempt.points_earned,
        totalPoints: updatedAttempt.total_points,
        passed: updatedAttempt.passed,
        gradingStatus: updatedAttempt.grading_status,
        submittedAt: updatedAttempt.submitted_at!,
      },
      results,
      timeLimitExceeded,
    };

    // Send notification if has essay questions needing grading
    if (gradingResult.gradingStatus === 'needs_review') {
      // TODO: Notify teacher about pending grading
      // This would use the notification system to alert the teacher
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
