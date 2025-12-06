import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const GET = async ({ request, params }) => {
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
    const { data: cohort, error: cohortError } = await supabase.from("cohorts").select("id").eq("id", id).single();
    if (cohortError || !cohort) {
      return new Response(
        JSON.stringify({ error: "Cohort not found or access denied" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: schedule, error: scheduleError } = await supabase.from("cohort_schedules").select("*, modules(id, name, order_index)").eq("cohort_id", id).order("unlock_date", { ascending: true });
    if (scheduleError) {
      console.error("Error fetching schedule:", scheduleError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch schedule: " + scheduleError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({ schedule: schedule || [] }),
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
const POST = async ({ request, params }) => {
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
    const { data: cohort, error: cohortError } = await supabase.from("cohorts").select("*, courses!inner(created_by, id)").eq("id", id).single();
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
        JSON.stringify({ error: "Unauthorized: Only course teachers can manage schedules" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const body = await request.json();
    const { module_id, unlock_date, lock_date } = body;
    const errors = [];
    if (!module_id) {
      errors.push("module_id is required");
    } else if (!Number.isInteger(module_id) || module_id < 0) {
      errors.push("module_id must be a positive integer");
    }
    if (!unlock_date) {
      errors.push("unlock_date is required");
    } else {
      const unlockDateObj = new Date(unlock_date);
      if (isNaN(unlockDateObj.getTime())) {
        errors.push("unlock_date must be a valid ISO date string");
      }
    }
    if (lock_date) {
      const lockDateObj = new Date(lock_date);
      if (isNaN(lockDateObj.getTime())) {
        errors.push("lock_date must be a valid ISO date string");
      } else {
        const unlockDateObj = new Date(unlock_date);
        if (lockDateObj <= unlockDateObj) {
          errors.push("lock_date must be after unlock_date");
        }
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
    const { data: module, error: moduleError } = await supabase.from("modules").select("id, course_id").eq("id", module_id).single();
    if (moduleError || !module) {
      return new Response(
        JSON.stringify({ error: "Module not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (module.course_id !== cohort.courses.id) {
      return new Response(
        JSON.stringify({ error: "Module does not belong to this cohort's course" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: existingSchedule } = await supabase.from("cohort_schedules").select("id").eq("cohort_id", id).eq("module_id", module_id).single();
    let result;
    if (existingSchedule) {
      const { data, error } = await supabase.from("cohort_schedules").update({
        unlock_date,
        lock_date: lock_date || null
      }).eq("id", existingSchedule.id).select().single();
      result = { data, error };
    } else {
      const { data, error } = await supabase.from("cohort_schedules").insert([{
        cohort_id: parseInt(id),
        module_id,
        unlock_date,
        lock_date: lock_date || null
      }]).select().single();
      result = { data, error };
    }
    if (result.error) {
      console.error("Error creating/updating schedule:", result.error);
      return new Response(
        JSON.stringify({ error: "Failed to manage schedule: " + result.error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        schedule: result.data,
        message: existingSchedule ? "Schedule updated successfully" : "Schedule created successfully"
      }),
      {
        status: existingSchedule ? 200 : 201,
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
const DELETE = async ({ request, params, url }) => {
  try {
    const { id } = params;
    const moduleId = url.searchParams.get("module_id");
    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({ error: "Invalid cohort ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (!moduleId || isNaN(Number(moduleId))) {
      return new Response(
        JSON.stringify({ error: "module_id query parameter is required and must be a number" }),
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
        JSON.stringify({ error: "Unauthorized: Only course teachers can manage schedules" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { error: deleteError } = await supabase.from("cohort_schedules").delete().eq("cohort_id", id).eq("module_id", moduleId);
    if (deleteError) {
      console.error("Error deleting schedule:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete schedule: " + deleteError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Schedule entry deleted successfully"
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
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
