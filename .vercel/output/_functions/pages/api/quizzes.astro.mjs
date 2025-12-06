import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../assets/rate-limiter.2jfgRwga.js";
import { v as validateRequest, s as sanitizeHTML } from "../../assets/security.GL57UUuL.js";
import { v as validateQuiz } from "../../assets/quiz-grading.bHyb2QYv.js";
import { renderers } from "../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const POST = async ({ request }) => {
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
    const body = await request.json();
    const validationRules = [
      { field: "lessonId", required: true, type: "number", min: 1 },
      { field: "title", required: true, type: "string", minLength: 1, maxLength: 200 },
      { field: "description", required: false, type: "string", maxLength: 2e3 },
      { field: "instructions", required: false, type: "string", maxLength: 5e3 },
      { field: "timeLimit", required: false, type: "number", min: 1 },
      { field: "passingScore", required: false, type: "number", min: 0, max: 100 },
      { field: "maxAttempts", required: false, type: "number", min: 0 }
    ];
    const validation = validateRequest(body, validationRules);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validation.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: lesson, error: lessonError } = await supabase.from("lessons").select(`
        id,
        modules!inner(
          id,
          courses!inner(
            id,
            created_by
          )
        )
      `).eq("id", body.lessonId).single();
    if (lessonError || !lesson) {
      return new Response(
        JSON.stringify({ error: "Lesson not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const course = lesson.modules?.courses;
    if (!course || course.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied. You must be the course creator." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const sanitizedTitle = sanitizeHTML(body.title, []);
    const sanitizedDescription = body.description ? sanitizeHTML(body.description) : null;
    const sanitizedInstructions = body.instructions ? sanitizeHTML(body.instructions) : null;
    const quizValidation = validateQuiz({
      title: sanitizedTitle,
      passing_score: body.passingScore,
      max_attempts: body.maxAttempts,
      time_limit: body.timeLimit,
      available_from: body.availableFrom,
      available_until: body.availableUntil
    });
    if (!quizValidation.valid) {
      return new Response(
        JSON.stringify({ error: "Quiz validation failed", details: quizValidation.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: quiz, error: createError } = await supabase.from("quizzes").insert([
      {
        lesson_id: body.lessonId,
        title: sanitizedTitle,
        description: sanitizedDescription,
        instructions: sanitizedInstructions,
        time_limit: body.timeLimit || null,
        passing_score: body.passingScore ?? 70,
        max_attempts: body.maxAttempts ?? 3,
        randomize_questions: body.shuffleQuestions ?? false,
        show_correct_answers: body.showCorrectAnswers ?? true,
        available_from: body.availableFrom || null,
        available_until: body.availableUntil || null,
        is_published: body.published ?? false,
        created_by: user.id
      }
    ]).select().single();
    if (createError) {
      console.error("Error creating quiz:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create quiz" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        quiz
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
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
