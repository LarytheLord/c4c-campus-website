import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../../assets/rate-limiter.2jfgRwga.js";
import { renderers } from "../../../../../renderers.mjs";
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
    const attemptId = parseInt(params.attemptId);
    if (isNaN(quizId) || isNaN(attemptId)) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz or attempt ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: attempt, error: attemptError } = await supabase.from("quiz_attempts").select("*").eq("id", attemptId).eq("quiz_id", quizId).single();
    if (attemptError || !attempt) {
      return new Response(
        JSON.stringify({ error: "Attempt not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: quiz } = await supabase.from("quizzes").select(`
        *,
        lessons!inner(
          modules!inner(
            courses!inner(
              created_by
            )
          )
        )
      `).eq("id", quizId).single();
    if (!quiz) {
      return new Response(
        JSON.stringify({ error: "Quiz not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const course = quiz.lessons?.modules?.courses;
    const isTeacher = course?.created_by === user.id;
    const isOwner = attempt.user_id === user.id;
    if (!isTeacher && !isOwner) {
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
    if (!attempt.submitted_at && !isTeacher) {
      questionsForResponse = questionsForResponse.map((q) => ({
        ...q,
        correct_answer: void 0,
        correct_answers_json: void 0,
        explanation: void 0
      }));
    }
    return new Response(
      JSON.stringify({
        success: true,
        attempt,
        questions: questionsForResponse,
        quiz
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
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
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
