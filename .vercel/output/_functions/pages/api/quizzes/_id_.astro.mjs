import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../assets/rate-limiter.2jfgRwga.js";
import { s as sanitizeHTML } from "../../../assets/security.GL57UUuL.js";
import { v as validateQuiz } from "../../../assets/quiz-grading.bHyb2QYv.js";
import { renderers } from "../../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const GET = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.read);
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
    const { data: quiz, error: quizError } = await supabase.from("quizzes").select(`
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
      `).eq("id", quizId).single();
    if (quizError || !quiz) {
      return new Response(
        JSON.stringify({ error: "Quiz not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const course = quiz.lessons?.modules?.courses;
    const isTeacher = course?.created_by === user.id;
    let isEnrolled = false;
    if (!isTeacher) {
      const { data: enrollment } = await supabase.from("enrollments").select("id").eq("course_id", course.id).eq("user_id", user.id).eq("status", "active").single();
      isEnrolled = !!enrollment;
    }
    if (!isTeacher && !isEnrolled) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: questions, error: questionsError } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("order_index", { ascending: true });
    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
    }
    let questionsForResponse = questions || [];
    if (!isTeacher && quiz.is_published) {
      const { data: attempts } = await supabase.from("quiz_attempts").select("*").eq("quiz_id", quizId).eq("user_id", user.id).order("created_at", { ascending: false });
      const hasCompletedAttempt = attempts?.some((a) => a.submitted_at !== null);
      if (!quiz.show_correct_answers || !hasCompletedAttempt) {
        questionsForResponse = questionsForResponse.map((q) => ({
          ...q,
          correct_answer: void 0
        }));
      }
    }
    let userAttempts = void 0;
    if (!isTeacher) {
      const { data: attempts } = await supabase.from("quiz_attempts").select("*").eq("quiz_id", quizId).eq("user_id", user.id).order("attempt_number", { ascending: false });
      userAttempts = attempts || [];
    }
    const submittedAttempts = userAttempts?.filter((a) => a.submitted_at !== null).length || 0;
    const canAttempt = quiz.is_published && (quiz.max_attempts === 0 || submittedAttempts < quiz.max_attempts);
    return new Response(
      JSON.stringify({
        success: true,
        quiz,
        questions: questionsForResponse,
        userAttempts,
        canAttempt,
        attemptsRemaining: quiz.max_attempts > 0 ? Math.max(0, quiz.max_attempts - submittedAttempts) : null
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const PUT = async ({ request, params }) => {
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
    const body = await request.json();
    const { data: existingQuiz, error: quizError } = await supabase.from("quizzes").select(`
        *,
        lessons!inner(
          modules!inner(
            courses!inner(
              created_by
            )
          )
        )
      `).eq("id", quizId).single();
    if (quizError || !existingQuiz) {
      return new Response(
        JSON.stringify({ error: "Quiz not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const course = existingQuiz.lessons?.modules?.courses;
    if (course?.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const updates = {};
    if (body.title !== void 0) {
      updates.title = sanitizeHTML(body.title, []);
    }
    if (body.description !== void 0) {
      updates.description = body.description ? sanitizeHTML(body.description) : null;
    }
    if (body.instructions !== void 0) {
      updates.instructions = body.instructions ? sanitizeHTML(body.instructions) : null;
    }
    if (body.timeLimit !== void 0) {
      updates.time_limit = body.timeLimit;
    }
    if (body.passingScore !== void 0) {
      updates.passing_score = body.passingScore;
    }
    if (body.maxAttempts !== void 0) {
      updates.max_attempts = body.maxAttempts;
    }
    if (body.shuffleQuestions !== void 0) {
      updates.randomize_questions = body.shuffleQuestions;
    }
    if (body.showCorrectAnswers !== void 0) {
      updates.show_correct_answers = body.showCorrectAnswers;
    }
    if (body.availableFrom !== void 0) {
      updates.available_from = body.availableFrom;
    }
    if (body.availableUntil !== void 0) {
      updates.available_until = body.availableUntil;
    }
    if (body.published !== void 0) {
      updates.is_published = body.published;
    }
    const quizValidation = validateQuiz(updates);
    if (!quizValidation.valid) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: quizValidation.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: updatedQuiz, error: updateError } = await supabase.from("quizzes").update(updates).eq("id", quizId).select().single();
    if (updateError) {
      console.error("Error updating quiz:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update quiz" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        quiz: updatedQuiz
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
const DELETE = async ({ request, params }) => {
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
    const { data: quiz, error: quizError } = await supabase.from("quizzes").select(`
        *,
        lessons!inner(
          modules!inner(
            courses!inner(
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
    if (course?.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const { error: deleteError } = await supabase.from("quizzes").delete().eq("id", quizId);
    if (deleteError) {
      console.error("Error deleting quiz:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete quiz" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Quiz deleted successfully"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
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
  DELETE,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
