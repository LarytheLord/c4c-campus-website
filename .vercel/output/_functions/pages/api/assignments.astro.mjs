import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../assets/rate-limiter.2jfgRwga.js";
import { v as validateRequest } from "../../assets/security.GL57UUuL.js";
import { renderers } from "../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const POST = async ({ request }) => {
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
    const body = await request.json();
    const validationRules = [
      { field: "lesson_id", required: true, type: "number", min: 1 },
      { field: "title", required: true, type: "string", minLength: 1, maxLength: 200 },
      { field: "description", required: false, type: "string", maxLength: 500 },
      { field: "instructions", required: false, type: "string", maxLength: 1e4 },
      { field: "due_date", required: false, type: "string" },
      { field: "max_points", required: false, type: "number", min: 1, max: 1e3 },
      { field: "max_file_size_mb", required: false, type: "number", min: 1, max: 50 },
      { field: "allow_late_submissions", required: false, type: "boolean" },
      { field: "late_penalty_percent", required: false, type: "number", min: 0, max: 100 },
      { field: "allow_resubmission", required: false, type: "boolean" },
      { field: "max_submissions", required: false, type: "number", min: 1, max: 10 },
      { field: "published", required: false, type: "boolean" }
    ];
    const validation = validateRequest(body, validationRules);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: validation.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: lesson } = await supabase.from("lessons").select("module_id, modules(course_id, courses(created_by))").eq("id", body.lesson_id).single();
    if (!lesson || !lesson.modules?.courses?.created_by || lesson.modules.courses.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "You do not have permission to create assignments for this lesson" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const assignmentData = {
      lesson_id: body.lesson_id,
      title: body.title,
      description: body.description || null,
      instructions: body.instructions || null,
      due_date: body.due_date || null,
      available_from: body.available_from || (/* @__PURE__ */ new Date()).toISOString(),
      available_until: body.available_until || null,
      max_points: body.max_points || 100,
      grading_rubric: body.grading_rubric || null,
      allowed_file_types: body.allowed_file_types || ["pdf", "doc", "docx", "txt", "zip"],
      max_file_size_mb: body.max_file_size_mb || 10,
      required_files: body.required_files || 1,
      allow_late_submissions: body.allow_late_submissions ?? false,
      late_penalty_percent: body.late_penalty_percent || 0,
      allow_resubmission: body.allow_resubmission ?? false,
      max_submissions: body.max_submissions || 1,
      is_published: body.is_published ?? false,
      created_by: user.id
    };
    const { data, error } = await supabase.from("assignments").insert([assignmentData]).select().single();
    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create assignment" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ success: true, data }),
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
const GET = async ({ request, url }) => {
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
    const lessonId = url.searchParams.get("lesson_id");
    if (!lessonId) {
      return new Response(
        JSON.stringify({ error: "lesson_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data, error } = await supabase.from("assignments").select("*").eq("lesson_id", lessonId).order("created_at", { ascending: false });
    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch assignments" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ success: true, data }),
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
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
