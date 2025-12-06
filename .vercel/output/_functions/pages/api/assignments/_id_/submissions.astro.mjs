import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../assets/rate-limiter.2jfgRwga.js";
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
    const assignmentId = params.id;
    if (!assignmentId) {
      return new Response(
        JSON.stringify({ error: "Assignment ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: assignment } = await supabase.from("assignments").select(`
        id,
        lessons(
          id,
          modules(
            id,
            courses(id, created_by)
          )
        )
      `).eq("id", assignmentId).single();
    if (!assignment || assignment.lessons?.modules?.courses?.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: submissions, error: submissionsError } = await supabase.from("assignment_submissions").select(`
        *,
        profiles:user_id(id, full_name, email)
      `).eq("assignment_id", assignmentId).order("submitted_at", { ascending: false });
    if (submissionsError) {
      console.error("Database error:", submissionsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch submissions" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: stats } = await supabase.rpc("get_assignment_stats", {
      assignment_id_param: parseInt(assignmentId)
    });
    return new Response(
      JSON.stringify({
        success: true,
        data: submissions,
        stats: stats || {
          total_submissions: 0,
          graded_submissions: 0,
          average_grade: null,
          late_submissions: 0,
          on_time_submissions: 0
        }
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
