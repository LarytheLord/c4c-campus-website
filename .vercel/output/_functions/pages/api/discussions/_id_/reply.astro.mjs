import { createClient } from "@supabase/supabase-js";
import DOMPurify from "isomorphic-dompurify";
import { renderers } from "../../../../renderers.mjs";
const prerender = false;
const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
const supabaseAnonKey = "***REMOVED***";
const POST = async ({ request, params }) => {
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
    const forumPostId = params.id;
    if (!forumPostId) {
      return new Response(
        JSON.stringify({ error: "Forum post ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const body = await request.json();
    const { content } = body;
    const errors = [];
    if (!content || typeof content !== "string") {
      errors.push("content is required and must be a string");
    } else if (content.trim().length === 0) {
      errors.push("content cannot be empty");
    } else if (content.length > 2e3) {
      errors.push("content must not exceed 2000 characters");
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
    const { data: forumPost, error: forumError } = await supabase.from("course_forums").select("id, cohort_id, is_locked, course_id").eq("id", forumPostId).single();
    if (forumError || !forumPost) {
      return new Response(
        JSON.stringify({ error: "Forum post not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (forumPost.is_locked) {
      return new Response(
        JSON.stringify({ error: "This forum post is locked and cannot receive new replies" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: enrollment, error: enrollmentError } = await supabase.from("cohort_enrollments").select("id, status").eq("cohort_id", forumPost.cohort_id).eq("user_id", user.id).single();
    if (enrollmentError || !enrollment || enrollment.status !== "active") {
      return new Response(
        JSON.stringify({ error: "You must be enrolled in this cohort to reply" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: course } = await supabase.from("courses").select("created_by").eq("id", forumPost.course_id).single();
    const isTeacher = course?.created_by === user.id;
    const sanitizedContent = DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS: [] });
    const replyData = {
      forum_post_id: forumPostId,
      user_id: user.id,
      content: sanitizedContent,
      is_teacher_response: isTeacher
    };
    const { data: reply, error: replyError } = await supabase.from("forum_replies").insert([replyData]).select().single();
    if (replyError) {
      console.error("Error creating reply:", replyError);
      return new Response(
        JSON.stringify({ error: "Failed to create reply: " + replyError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    await supabase.from("cohort_enrollments").update({ last_activity_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("cohort_id", forumPost.cohort_id).eq("user_id", user.id);
    return new Response(
      JSON.stringify({
        success: true,
        reply,
        message: "Reply created successfully"
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
const GET = async ({ request, params, url }) => {
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
    const forumPostId = params.id;
    if (!forumPostId) {
      return new Response(
        JSON.stringify({ error: "Forum post ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50;
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return new Response(
        JSON.stringify({ error: "Invalid pagination parameters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: forumPost, error: forumError } = await supabase.from("course_forums").select("id").eq("id", forumPostId).single();
    if (forumError || !forumPost) {
      return new Response(
        JSON.stringify({ error: "Forum post not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { data: replies, error: repliesError, count } = await supabase.from("forum_replies").select("*", { count: "exact" }).eq("forum_post_id", forumPostId).order("created_at", { ascending: true }).range(offset, offset + limit - 1);
    if (repliesError) {
      console.error("Error fetching replies:", repliesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch replies: " + repliesError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        replies,
        count,
        limit,
        offset
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
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
