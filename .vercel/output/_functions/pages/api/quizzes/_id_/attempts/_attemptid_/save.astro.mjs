import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../../../assets/rate-limiter.2jfgRwga.js";
import { renderers } from "../../../../../../renderers.mjs";
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
    const attemptId = parseInt(params.attemptId);
    if (isNaN(quizId) || isNaN(attemptId)) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz or attempt ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await request.json();
    if (!body.answers || !Array.isArray(body.answers)) {
      return new Response(
        JSON.stringify({ error: "Invalid answers format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: attempt, error: attemptError } = await supabase.from("quiz_attempts").select("*").eq("id", attemptId).eq("quiz_id", quizId).eq("user_id", user.id).single();
    if (attemptError || !attempt) {
      return new Response(
        JSON.stringify({ error: "Attempt not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    if (attempt.submitted_at) {
      return new Response(
        JSON.stringify({ error: "Cannot save draft for submitted attempt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const answersJson = body.answers.map((ans) => ({
      question_id: ans.questionId,
      answer: ans.answer,
      is_correct: null,
      // Not graded yet
      points_earned: 0,
      feedback: null
    }));
    const { error: updateError } = await supabase.from("quiz_attempts").update({
      answers_json: answersJson
    }).eq("id", attemptId);
    if (updateError) {
      console.error("Error saving draft:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save draft" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Draft saved successfully"
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
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
