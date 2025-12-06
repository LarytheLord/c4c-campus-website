import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const supabaseServiceKey = "***REMOVED***";
createClient(supabaseUrl, supabaseServiceKey);
const GET = async ({ request, url }) => {
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
    let query = supabase.from("cohorts").select("*");
    const courseId = url.searchParams.get("course_id");
    if (courseId) {
      query = query.eq("course_id", parseInt(courseId));
    }
    const status = url.searchParams.get("status");
    if (status) {
      query = query.eq("status", status);
    }
    query = query.order("start_date", { ascending: false });
    const { data: cohorts, error: cohortsError } = await query;
    if (cohortsError) {
      console.error("Error fetching cohorts:", cohortsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cohorts: " + cohortsError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({ cohorts }),
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
    const { course_id, name, start_date, end_date, max_students, status } = body;
    const errors = [];
    if (!course_id) {
      errors.push("course_id is required");
    } else if (!Number.isInteger(course_id) || course_id < 0) {
      errors.push("course_id must be a positive integer");
    }
    if (!name) {
      errors.push("name is required");
    } else if (typeof name !== "string" || name.trim().length === 0) {
      errors.push("name must be a non-empty string");
    }
    if (!start_date) {
      errors.push("start_date is required");
    } else {
      const startDateObj = new Date(start_date);
      if (isNaN(startDateObj.getTime())) {
        errors.push("start_date must be a valid ISO date string");
      }
    }
    if (end_date) {
      const endDateObj = new Date(end_date);
      if (isNaN(endDateObj.getTime())) {
        errors.push("end_date must be a valid ISO date string");
      } else {
        const startDateObj = new Date(start_date);
        if (endDateObj <= startDateObj) {
          errors.push("end_date must be after start_date");
        }
      }
    }
    if (max_students !== void 0 && max_students !== null) {
      if (!Number.isInteger(max_students) || max_students < 1) {
        errors.push("max_students must be a positive integer");
      }
    }
    if (status) {
      const validStatuses = ["upcoming", "active", "completed", "archived"];
      if (!validStatuses.includes(status)) {
        errors.push("status must be one of: upcoming, active, completed, archived");
      }
    }
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: course, error: courseError } = await supabase.from("courses").select("id, created_by").eq("id", course_id).single();
    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: "Course not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (course.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Only course teachers can create cohorts" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: existingCohort } = await supabase.from("cohorts").select("id").eq("course_id", course_id).eq("name", name).single();
    if (existingCohort) {
      return new Response(
        JSON.stringify({ error: "A cohort with this name already exists for this course" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const cohortData = {
      course_id,
      name: name.trim(),
      start_date,
      end_date: end_date || null,
      max_students: max_students || 50,
      // Default to 50 if not provided
      status: status || "upcoming",
      created_by: user.id
    };
    const { data: cohort, error: cohortError } = await supabase.from("cohorts").insert([cohortData]).select().single();
    if (cohortError) {
      console.error("Error creating cohort:", cohortError);
      return new Response(
        JSON.stringify({ error: "Failed to create cohort: " + cohortError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        cohort,
        message: "Cohort created successfully"
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
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
