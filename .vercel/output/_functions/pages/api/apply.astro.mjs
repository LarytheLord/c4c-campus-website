import { createClient } from "@supabase/supabase-js";
import { i as isStrongPassword } from "../../assets/security.GL57UUuL.js";
import { s as sendApplicationReceivedEmail } from "../../assets/email-notifications.DkLxyaDX.js";
import { renderers } from "../../renderers.mjs";
function validatePassword(password) {
  const result = isStrongPassword(password);
  return {
    isValid: result.valid,
    errors: result.errors
  };
}
const prerender = false;
const supabaseAdmin = createClient(
  "https://auyysgeurtnpidppebqj.supabase.co",
  "***REMOVED***"
);
const POST = async ({ request }) => {
  try {
    console.log("[API /apply] Received POST request");
    console.log("[API /apply] Content-Type:", request.headers.get("content-type"));
    const formData = await request.json();
    console.log("[API /apply] Successfully parsed JSON");
    console.log("[API /apply] Email:", formData.email);
    console.log("[API /apply] Program:", formData.program);
    const { email, password, confirmPassword, program, ...applicationData } = formData;
    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: "Passwords do not match" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.warn("[API /apply] Weak password rejected:", passwordValidation.errors);
      return new Response(
        JSON.stringify({
          error: "Password does not meet security requirements",
          details: passwordValidation.errors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const supabaseClient = createClient(
      "https://auyysgeurtnpidppebqj.supabase.co",
      "***REMOVED***"
    );
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: applicationData.name,
          program,
          status: "pending"
        },
        emailRedirectTo: `${"https://codeforcompassion.com"}/login?verified=true`
      }
    });
    if (authError) {
      console.error("Supabase auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user account" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const { error: dbError } = await supabaseAdmin.from("applications").insert({
      user_id: authData.user.id,
      program,
      status: "pending",
      name: applicationData.name,
      email,
      whatsapp: applicationData.whatsapp,
      location: applicationData.location,
      discord: applicationData.discord,
      // Bootcamp specific fields
      interests: applicationData.interests,
      motivation: applicationData.motivation,
      technical_experience: applicationData.technicalExperience,
      commitment: applicationData.commitment,
      // Accelerator specific fields
      track: applicationData.track,
      project_name: applicationData.projectName,
      project_description: applicationData.projectDescription,
      prototype_link: applicationData.prototypeLink,
      tech_stack: applicationData.techStack,
      target_users: applicationData.targetUsers,
      production_needs: applicationData.productionNeeds,
      team_size: applicationData.teamSize ? parseInt(applicationData.teamSize) : null,
      current_stage: applicationData.currentStage,
      funding: applicationData.funding
    });
    if (dbError) {
      console.error("Supabase database error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Account created but failed to save application. Please contact info@codeforcompassion.com with your email to complete your application.",
          details: dbError.message
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    sendApplicationReceivedEmail({
      name: applicationData.name,
      email,
      program,
      location: applicationData.location,
      discord: applicationData.discord,
      motivation: applicationData.motivation,
      projectName: applicationData.projectName,
      projectDescription: applicationData.projectDescription
    }).catch((err) => console.error("Failed to send admin notification:", err));
    return new Response(
      JSON.stringify({
        success: true,
        message: "Application submitted successfully! Check your email to verify your account.",
        userId: authData.user.id
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Application error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit application" }),
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
