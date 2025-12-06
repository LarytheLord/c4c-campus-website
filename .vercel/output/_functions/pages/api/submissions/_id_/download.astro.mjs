import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../assets/rate-limiter.2jfgRwga.js";
import { g as getSignedDownloadUrl } from "../../../../assets/file-upload.CTMOKnGT.js";
import { renderers } from "../../../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const GET = async ({ request, params }) => {
  try {
    const rateLimitResponse = await rateLimit(request, RateLimitPresets.read);
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
    const submissionId = params.id;
    if (!submissionId) {
      return new Response(
        JSON.stringify({ error: "Submission ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: submission, error: submissionError } = await supabase.from("assignment_submissions").select(`
        *,
        assignments(
          id,
          lessons(
            id,
            modules(
              id,
              courses(id, created_by)
            )
          )
        )
      `).eq("id", submissionId).single();
    if (submissionError || !submission) {
      return new Response(
        JSON.stringify({ error: "Submission not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const isOwner = submission.user_id === user.id;
    const isTeacher = submission.assignments?.lessons?.modules?.courses?.created_by === user.id;
    if (!isOwner && !isTeacher) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const urlResult = await getSignedDownloadUrl(submission.file_url, token, 3600);
    if (!urlResult.success) {
      return new Response(
        JSON.stringify({ error: urlResult.error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        url: urlResult.url,
        file_name: submission.file_name,
        file_size_bytes: submission.file_size_bytes
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
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
