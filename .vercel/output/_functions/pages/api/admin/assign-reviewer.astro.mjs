import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../../renderers.mjs";
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseServiceKey = "***REMOVED***";
const prerender = false;
async function verifyAdminAccess(supabase, userId) {
  const { data: application } = await supabase.from("applications").select("role").eq("user_id", userId).single();
  return application && application.role === "admin";
}
const GET = async ({ request, url }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const cookies = request.headers.get("cookie") || "";
    const accessToken = cookies.split(";").find((c) => c.trim().startsWith("sb-access-token="))?.split("=")[1];
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isAdmin = await verifyAdminAccess(supabase, user.id);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const applicationId = url.searchParams.get("application_id");
    if (!applicationId) {
      return new Response(JSON.stringify({ error: "application_id parameter required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: application, error } = await supabase.from("applications").select("id, assigned_reviewer_id, assignment_date").eq("id", applicationId).single();
    if (error) throw error;
    if (!application) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    let reviewer = null;
    if (application.assigned_reviewer_id) {
      const { data: reviewerApp } = await supabase.from("applications").select("name, email, role").eq("user_id", application.assigned_reviewer_id).single();
      reviewer = reviewerApp;
    }
    return new Response(JSON.stringify({
      application_id: application.id,
      assigned_reviewer_id: application.assigned_reviewer_id,
      assignment_date: application.assignment_date,
      reviewer
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error getting assignment:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const cookies = request.headers.get("cookie") || "";
    const accessToken = cookies.split(";").find((c) => c.trim().startsWith("sb-access-token="))?.split("=")[1];
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const isAdmin = await verifyAdminAccess(supabase, user.id);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { application_ids, reviewer_id } = body;
    if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
      return new Response(JSON.stringify({ error: "application_ids array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const updateData = {
      assigned_reviewer_id: reviewer_id || null,
      assignment_date: reviewer_id ? (/* @__PURE__ */ new Date()).toISOString() : null
    };
    const { error } = await supabase.from("applications").update(updateData).in("id", application_ids);
    if (error) throw error;
    let reviewer = null;
    if (reviewer_id) {
      const { data: reviewerApp } = await supabase.from("applications").select("name, email, role").eq("user_id", reviewer_id).single();
      reviewer = reviewerApp;
    }
    return new Response(JSON.stringify({
      success: true,
      assigned_count: application_ids.length,
      reviewer,
      message: reviewer_id ? `Successfully assigned ${application_ids.length} application(s) to ${reviewer?.name || "reviewer"}` : `Successfully unassigned ${application_ids.length} application(s)`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error assigning reviewer:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
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
