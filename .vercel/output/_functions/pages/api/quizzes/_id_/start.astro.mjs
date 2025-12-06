import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../assets/rate-limiter.2jfgRwga.js";
import { c as checkQuizAvailability, s as shuffleQuestions } from "../../../../assets/quiz-grading.bHyb2QYv.js";
import { renderers } from "../../../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const POST = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const quizId = parseInt(params.id);
    if (isNaN(quizId)) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await request.json().catch(() => ({}));
    const { data: quiz, error: quizError } = await supabase.from("quizzes").select(`
        *,
        lessons!inner(
          id,
          modules!inner(
            id,
            courses!inner(
              id,
              created_by
            )
          )
        )
      `).eq("id", quizId).single();
    if (quizError || !quiz) {
      return new Response(
        JSON.stringify({ error: "Quiz not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const course = quiz.lessons?.modules?.courses;
    const { data: enrollment } = await supabase.from("enrollments").select("id, status").eq("course_id", course.id).eq("user_id", user.id).single();
    if (!enrollment || enrollment.status !== "active") {
      return new Response(
        JSON.stringify({ error: "You must be enrolled in this course to take the quiz" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: existingAttempts, error: attemptsError } = await supabase.from("quiz_attempts").select("id, submitted_at").eq("quiz_id", quizId).eq("user_id", user.id);
    if (attemptsError) {
      console.error("Error fetching attempts:", attemptsError);
      return new Response(
        JSON.stringify({ error: "Failed to check existing attempts" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const unsubmittedAttempt = existingAttempts?.find((a) => !a.submitted_at);
    if (unsubmittedAttempt) {
      return new Response(
        JSON.stringify({
          error: "You have an incomplete attempt. Please complete or abandon it first.",
          attemptId: unsubmittedAttempt.id
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const submittedCount = existingAttempts?.filter((a) => a.submitted_at).length || 0;
    const availability = checkQuizAvailability(quiz, submittedCount);
    if (!availability.available) {
      return new Response(
        JSON.stringify({ error: availability.reason }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: questions, error: questionsError } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index", { ascending: true });
    if (questionsError || !questions || questions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Quiz has no questions" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    let questionsForStudent = quiz.randomize_questions ? shuffleQuestions(questions, true) : questions;
    const attemptNumber = submittedCount + 1;
    const { data: attempt, error: attemptError } = await supabase.from("quiz_attempts").insert([
      {
        quiz_id: quizId,
        user_id: user.id,
        cohort_id: body.cohortId || null,
        attempt_number: attemptNumber,
        total_points: totalPoints,
        answers_json: [],
        score: 0,
        points_earned: 0,
        passed: false,
        grading_status: "pending"
      }
    ]).select().single();
    if (attemptError) {
      console.error("Error creating attempt:", attemptError);
      return new Response(
        JSON.stringify({ error: "Failed to create quiz attempt" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const questionsForResponse = questionsForStudent.map((q, idx) => ({
      id: q.id,
      type: q.question_type,
      questionText: q.question_text,
      questionImageUrl: q.question_image_url,
      options: q.options,
      points: q.points,
      orderIndex: idx
      // Use shuffled order
    }));
    const response = {
      success: true,
      attempt: {
        id: attempt.id,
        attemptNumber: attempt.attempt_number,
        startedAt: attempt.started_at,
        timeLimit: quiz.time_limit
      },
      questions: questionsForResponse
    };
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
