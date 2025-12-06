import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../assets/rate-limiter.2jfgRwga.js";
import { v as validateRequest } from "../../../../assets/security.GL57UUuL.js";
import { a as sendAssignmentGradedEmail } from "../../../../assets/email-notifications.DkLxyaDX.js";
import { renderers } from "../../../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const POST = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.forms);
    if (rateLimitResponse) return rateLimitResponse;
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
    const assignmentId = params.id;
    const body = await request.json();
    const validationRules = [
      { field: "submission_id", required: true, type: "number", min: 1 },
      { field: "score", required: true, type: "number", min: 0 },
      { field: "feedback", required: false, type: "string", maxLength: 5e3 }
    ];
    const validation = validateRequest(body, validationRules);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validation.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: submission, error: submissionError } = await supabase.from("assignment_submissions").select(`
        *,
        assignments(
          id, title, max_points,
          lessons(
            id, name,
            modules(
              id, name,
              courses(id, name, created_by)
            )
          )
        ),
        profiles:user_id(id, full_name, email)
      `).eq("id", body.submission_id).eq("assignment_id", assignmentId).single();
    if (submissionError || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const assignment = submission.assignments;
    const courseCreatedBy = assignment?.lessons?.modules?.courses?.created_by;
    if (courseCreatedBy !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    if (body.score > assignment.max_points) {
      return new Response(
        JSON.stringify({ error: `Score cannot exceed ${assignment.max_points} points` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: updatedSubmission, error: updateError } = await supabase.from("assignment_submissions").update({
      score: body.score,
      feedback: body.feedback || null,
      status: "graded",
      graded_at: (/* @__PURE__ */ new Date()).toISOString(),
      graded_by: user.id
    }).eq("id", body.submission_id).select().single();
    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to grade submission" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const studentProfile = submission.profiles;
    if (studentProfile?.email) {
      await sendAssignmentGradedEmail({
        studentName: studentProfile.full_name || "Student",
        studentEmail: studentProfile.email,
        assignmentTitle: assignment.title,
        courseName: assignment.lessons?.modules?.courses?.name || "Course",
        grade: updatedSubmission.score,
        maxPoints: assignment.max_points,
        feedback: body.feedback,
        gradedAt: (/* @__PURE__ */ new Date()).toLocaleString()
      });
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: updatedSubmission
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
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
