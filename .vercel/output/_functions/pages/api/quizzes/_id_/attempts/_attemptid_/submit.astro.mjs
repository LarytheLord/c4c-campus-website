import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../../../assets/rate-limiter.2jfgRwga.js";
import { a as autoGradeQuizAttempt } from "../../../../../../assets/quiz-grading.bHyb2QYv.js";
import { renderers } from "../../../../../../renderers.mjs";
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
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
        JSON.stringify({ error: "Attempt already submitted" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: quiz, error: quizError } = await supabase.from("quizzes").select("*").eq("id", quizId).single();
    if (quizError || !quiz) {
      return new Response(
        JSON.stringify({ error: "Quiz not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const timeSpentSeconds = Math.floor(
      (Date.now() - new Date(attempt.started_at).getTime()) / 1e3
    );
    const { data: questions, error: questionsError } = await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId);
    if (questionsError || !questions) {
      return new Response(
        JSON.stringify({ error: "Failed to load questions" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const gradingResult = autoGradeQuizAttempt(questions, body.answers, quiz);
    const { data: updatedAttempt, error: updateError } = await supabase.from("quiz_attempts").update({
      answers_json: gradingResult.answers,
      score: gradingResult.score,
      points_earned: gradingResult.pointsEarned,
      total_points: gradingResult.totalPoints,
      passed: gradingResult.passed,
      grading_status: gradingResult.gradingStatus,
      submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
      time_spent_seconds: timeSpentSeconds
    }).eq("id", attemptId).select().single();
    if (updateError) {
      console.error("Error updating attempt:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to submit quiz" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    let results = void 0;
    if (quiz.show_correct_answers || gradingResult.gradingStatus === "auto_graded") {
      results = {
        questions: gradingResult.answers.map((ans) => {
          const question = questions.find((q) => q.id === ans.question_id);
          return {
            id: ans.question_id,
            questionText: question?.question_text || "",
            yourAnswer: ans.answer,
            correctAnswer: quiz.show_correct_answers ? question?.correct_answer || question?.correct_answers_json : void 0,
            isCorrect: ans.is_correct,
            pointsEarned: ans.points_earned,
            explanation: quiz.show_correct_answers ? question?.explanation : void 0
          };
        })
      };
    }
    const response = {
      success: true,
      attempt: {
        id: updatedAttempt.id,
        score: updatedAttempt.score,
        pointsEarned: updatedAttempt.points_earned,
        totalPoints: updatedAttempt.total_points,
        passed: updatedAttempt.passed,
        gradingStatus: updatedAttempt.grading_status,
        submittedAt: updatedAttempt.submitted_at
      },
      results
    };
    if (gradingResult.gradingStatus === "needs_review") {
    }
    return new Response(JSON.stringify(response), {
      status: 200,
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
