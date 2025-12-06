/**
 * Quiz Attempt API - Save Draft
 * POST /api/quizzes/[id]/attempts/[attemptId]/save - Save draft answers
 */

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limiter';
import type { SaveAnswersRequest } from '@/types/quiz';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;

/**
 * POST - Save draft answers
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

    const quizId = parseInt(params.id!);
    const attemptId = parseInt(params.attemptId!);

    if (isNaN(quizId) || isNaN(attemptId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid quiz or attempt ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: SaveAnswersRequest = await request.json();

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
        JSON.stringify({ error: 'Cannot save draft for submitted attempt' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert answers to database format (just store without grading)
    const answersJson = body.answers.map(ans => ({
      question_id: ans.questionId,
      answer: ans.answer,
      is_correct: null, // Not graded yet
      points_earned: 0,
      feedback: null,
    }));

    // Update attempt with draft answers
    const { error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        answers_json: answersJson,
      })
      .eq('id', attemptId);

    if (updateError) {
      console.error('Error saving draft:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save draft' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Draft saved successfully',
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
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
