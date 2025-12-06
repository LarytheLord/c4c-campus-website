import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const POST = async ({ request, params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Invalid cohort ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
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
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
    }
    let targetUserId = user.id;
    let isTeacherEnrolling = false;
    if (body.user_id && body.user_id !== user.id) {
      const { data: cohort2, error: cohortError2 } = await supabase.from("cohorts").select("*, courses!inner(created_by)").eq("id", id).single();
      if (cohortError2 || !cohort2) {
        return new Response(
          JSON.stringify({ error: "Cohort not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      if (cohort2.courses.created_by !== user.id) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Only course teachers can enroll other users" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      targetUserId = body.user_id;
      isTeacherEnrolling = true;
    }
    const { data: cohort, error: cohortError } = await supabase.from("cohorts").select("*").eq("id", id).single();
    if (cohortError || !cohort) {
      return new Response(
        JSON.stringify({ error: "Cohort not found or access denied" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (cohort.status === "archived") {
      return new Response(
        JSON.stringify({ error: "Cannot enroll in archived cohort" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: existingEnrollment } = await supabase.from("cohort_enrollments").select("id, status").eq("cohort_id", id).eq("user_id", targetUserId).single();
    if (existingEnrollment) {
      return new Response(
        JSON.stringify({
          error: "Already enrolled in this cohort",
          enrollment: existingEnrollment
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (cohort.max_students !== null) {
      const { count: currentEnrollments } = await supabase.from("cohort_enrollments").select("*", { count: "exact", head: true }).eq("cohort_id", id).in("status", ["active", "paused"]);
      if (currentEnrollments !== null && currentEnrollments >= cohort.max_students) {
        return new Response(
          JSON.stringify({
            error: "Cohort is full",
            max_students: cohort.max_students,
            current_enrollments: currentEnrollments
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }
    const enrollmentData = {
      cohort_id: id,
      // UUID string
      user_id: targetUserId,
      status: "active",
      completed_lessons: 0
    };
    const { data: enrollment, error: enrollError } = await supabase.from("cohort_enrollments").insert([enrollmentData]).select().single();
    if (enrollError) {
      console.error("Error creating enrollment:", enrollError);
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
        message: isTeacherEnrolling ? "User enrolled successfully" : "Successfully enrolled in cohort"
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
const DELETE = async ({ request, params }) => {
  try {
    const { id } = params;
    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({ error: "Invalid cohort ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
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
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (e) {
    }
    let targetUserId = user.id;
    let isTeacherUnenrolling = false;
    if (body.user_id && body.user_id !== user.id) {
      const { data: cohort, error: cohortError } = await supabase.from("cohorts").select("*, courses!inner(created_by)").eq("id", id).single();
      if (cohortError || !cohort) {
        return new Response(
          JSON.stringify({ error: "Cohort not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      if (cohort.courses.created_by !== user.id) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Only course teachers can unenroll other users" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
      targetUserId = body.user_id;
      isTeacherUnenrolling = true;
    }
    const { data: enrollment, error: updateError } = await supabase.from("cohort_enrollments").update({ status: "dropped" }).eq("cohort_id", id).eq("user_id", targetUserId).select().single();
    if (updateError) {
      console.error("Error updating enrollment:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to unenroll: " + updateError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (!enrollment) {
      return new Response(
        JSON.stringify({ error: "Enrollment not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        enrollment,
        message: isTeacherUnenrolling ? "User unenrolled successfully" : "Successfully unenrolled from cohort"
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
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DELETE,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
