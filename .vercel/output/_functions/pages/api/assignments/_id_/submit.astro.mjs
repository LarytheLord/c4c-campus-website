import { createClient } from "@supabase/supabase-js";
import { r as rateLimit, R as RateLimitPresets } from "../../../../assets/rate-limiter.2jfgRwga.js";
import { v as validateFile, u as uploadFile } from "../../../../assets/file-upload.CTMOKnGT.js";
import { b as sendAssignmentSubmittedEmail } from "../../../../assets/email-notifications.DkLxyaDX.js";
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
    if (!assignmentId) {
      return new Response(
        JSON.stringify({ error: "Assignment ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: assignment, error: assignmentError } = await supabase.from("assignments").select(`
        *,
        lessons(
          id, name, module_id,
          modules(
            id, name, course_id,
            courses(id, name, created_by)
          )
        )
      `).eq("id", assignmentId).single();
    if (assignmentError || !assignment) {
      return new Response(
        JSON.stringify({ error: "Assignment not found or access denied" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: canSubmit, error: checkError } = await supabase.rpc("can_user_submit", {
      assignment_id_param: parseInt(assignmentId),
      user_id_param: user.id
    });
    if (checkError || !canSubmit) {
      return new Response(
        JSON.stringify({ error: "You cannot submit to this assignment at this time" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(
        JSON.stringify({ error: "File is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const validation = validateFile(file, {
      maxSizeMB: assignment.max_file_size_mb,
      allowedTypes: assignment.allowed_file_types
    });
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const uploadResult = await uploadFile(
      file,
      user.id,
      assignmentId,
      token
    );
    if (!uploadResult.success) {
      return new Response(
        JSON.stringify({ error: uploadResult.error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: existingSubmissions } = await supabase.from("assignment_submissions").select("submission_number").eq("assignment_id", assignmentId).eq("user_id", user.id).order("submission_number", { ascending: false }).limit(1);
    const submissionNumber = existingSubmissions && existingSubmissions.length > 0 ? existingSubmissions[0].submission_number + 1 : 1;
    const submissionData = {
      assignment_id: parseInt(assignmentId),
      user_id: user.id,
      file_url: uploadResult.path,
      file_name: file.name,
      file_size_bytes: file.size,
      file_type: validation.fileExtension,
      submission_number: submissionNumber,
      submitted_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const { data: submission, error: submissionError } = await supabase.from("assignment_submissions").insert([submissionData]).select().single();
    if (submissionError) {
      console.error("Submission error:", submissionError);
      return new Response(
        JSON.stringify({ error: "Failed to create submission record" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single();
    const teacherEmail = assignment.lessons?.modules?.courses?.created_by;
    if (teacherEmail && profile) {
      const { data: teacherProfile } = await supabase.from("profiles").select("email").eq("id", teacherEmail).single();
      if (teacherProfile?.email) {
        await sendAssignmentSubmittedEmail(teacherProfile.email, {
          studentName: profile.full_name || "Student",
          studentEmail: profile.email || user.email,
          assignmentTitle: assignment.title,
          courseName: assignment.lessons?.modules?.courses?.name || "Course",
          submittedAt: (/* @__PURE__ */ new Date()).toLocaleString(),
          isLate: submission.is_late
        });
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: submission
      }),
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
