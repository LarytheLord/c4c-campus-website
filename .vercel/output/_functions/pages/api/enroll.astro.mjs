import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../renderers.mjs";
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const body = await request.json();
    const { courseId } = body;
    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "Course ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: course, error: courseError } = await supabase.from("courses").select("id, title, is_published").eq("id", courseId).single();
    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: "Course not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (!course.is_published) {
      return new Response(
        JSON.stringify({ error: "Course is not published" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: existingEnrollment } = await supabase.from("enrollments").select("id, status").eq("user_id", user.id).eq("course_id", courseId).single();
    if (existingEnrollment) {
      return new Response(
        JSON.stringify({
          error: "Already enrolled",
          enrollment: existingEnrollment
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: enrollment, error: enrollError } = await supabase.from("enrollments").insert([
      {
        user_id: user.id,
        course_id: courseId,
        status: "active"
      }
    ]).select().single();
    if (enrollError) {
      console.error("Enrollment error:", enrollError);
      return new Response(
        JSON.stringify({ error: "Failed to enroll: " + enrollError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        enrollment,
        message: `Successfully enrolled in ${course.title}`
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
