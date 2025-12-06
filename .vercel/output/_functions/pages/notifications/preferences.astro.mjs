import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, l as renderScript } from "../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../assets/BaseLayout.CfYIT7u8.js";
import { createClient } from "@supabase/supabase-js";
import { renderers } from "../../renderers.mjs";
const $$Astro = createAstro("https://c4ccampus.org");
const $$Preferences = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Preferences;
  const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
  const supabaseAnonKey = "***REMOVED***";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  const refreshToken = Astro2.cookies.get("sb-refresh-token")?.value;
  if (!accessToken || !refreshToken) {
    return Astro2.redirect("/login?redirect=/notifications/preferences");
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    return Astro2.redirect("/login?redirect=/notifications/preferences");
  }
  let preferences = null;
  let error = null;
  try {
    const response = await fetch(`${Astro2.url.origin}/api/notifications/preferences`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      preferences = data.preferences;
    } else {
      error = "Failed to load preferences";
    }
  } catch (err) {
    error = "Failed to load preferences";
    console.error("Error fetching preferences:", err);
  }
  const eventTypes = [
    { id: "enrollment", name: "Course Enrollment", description: "When you enroll in a new course", category: "Courses" },
    { id: "lesson_published", name: "New Lessons", description: "When new lessons are published", category: "Courses" },
    { id: "course_update", name: "Course Updates", description: "Important updates to your courses", category: "Courses" },
    { id: "assignment_due", name: "Assignment Reminders", description: "Reminders when assignments are due soon", category: "Assignments" },
    { id: "assignment_graded", name: "Assignment Grades", description: "When your assignments are graded", category: "Assignments" },
    { id: "quiz_available", name: "Quiz Available", description: "When new quizzes become available", category: "Assignments" },
    { id: "grade_received", name: "Grade Received", description: "When you receive any grade", category: "Assignments" },
    { id: "message", name: "Direct Messages", description: "When you receive a direct message", category: "Communication" },
    { id: "discussion_reply", name: "Discussion Replies", description: "Replies to your discussion posts", category: "Communication" },
    { id: "mention", name: "Mentions", description: "When someone mentions you", category: "Communication" },
    { id: "announcement", name: "Announcements", description: "Platform-wide announcements", category: "Communication" },
    { id: "certificate_issued", name: "Certificates", description: "When you earn a certificate", category: "Achievements" },
    { id: "progress_milestone", name: "Progress Milestones", description: "When you reach learning milestones", category: "Achievements" },
    { id: "cohort_update", name: "Cohort Updates", description: "Updates about your cohorts", category: "Admin" },
    { id: "application_update", name: "Application Status", description: "Updates on your applications", category: "Admin" }
  ];
  const categories = ["Courses", "Assignments", "Communication", "Achievements", "Admin"];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Notification Preferences" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-8"> <div class="mb-8"> <h1 class="text-3xl font-bold text-gray-900 mb-2">Notification Preferences</h1> <p class="text-gray-600">
Customize how and when you receive notifications across all channels.
</p> </div> ${error && renderTemplate`<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"> <p class="text-red-800">${error}</p> </div>`} <form id="preferences-form" class="space-y-8"> <!-- Global Channel Settings --> <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h2 class="text-xl font-semibold text-gray-900 mb-4">Global Settings</h2> <p class="text-sm text-gray-600 mb-6">
Enable or disable notification channels globally. You can fine-tune per-event settings below.
</p> <div class="space-y-4"> <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"> <div class="flex items-center gap-3"> <span class="text-2xl">📱</span> <div> <p class="font-medium text-gray-900">In-App Notifications</p> <p class="text-sm text-gray-600">Show notifications in the notification bell</p> </div> </div> <input type="checkbox" name="inapp_enabled"${addAttribute(preferences?.inapp_enabled !== false, "checked")} class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"> </label> <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"> <div class="flex items-center gap-3"> <span class="text-2xl">📧</span> <div> <p class="font-medium text-gray-900">Email Notifications</p> <p class="text-sm text-gray-600">Send notifications to your email</p> </div> </div> <input type="checkbox" name="email_enabled"${addAttribute(preferences?.email_enabled !== false, "checked")} class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"> </label> <label class="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"> <div class="flex items-center gap-3"> <span class="text-2xl">🔔</span> <div> <p class="font-medium text-gray-900">Push Notifications</p> <p class="text-sm text-gray-600">Browser push notifications (coming soon)</p> </div> </div> <input type="checkbox" name="push_enabled"${addAttribute(preferences?.push_enabled === true, "checked")} disabled class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"> </label> </div> </section> <!-- Email Digest Settings --> <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h2 class="text-xl font-semibold text-gray-900 mb-4">Email Digest</h2> <p class="text-sm text-gray-600 mb-6">
Instead of individual emails, receive a summary of notifications at scheduled intervals.
</p> <div class="space-y-4"> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Digest Frequency</label> <select name="digest_mode" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> <option value="off"${addAttribute(preferences?.digest_mode === "off", "selected")}>Off - Send emails immediately</option> <option value="realtime"${addAttribute(preferences?.digest_mode === "realtime" || !preferences?.digest_mode, "selected")}>Realtime - Send emails immediately</option> <option value="hourly"${addAttribute(preferences?.digest_mode === "hourly", "selected")}>Hourly - Every hour</option> <option value="daily"${addAttribute(preferences?.digest_mode === "daily", "selected")}>Daily - Once per day</option> <option value="weekly"${addAttribute(preferences?.digest_mode === "weekly", "selected")}>Weekly - Once per week</option> </select> </div> <div id="digest-time-container" class="hidden"> <label class="block text-sm font-medium text-gray-700 mb-2">Digest Time</label> <input type="time" name="digest_time"${addAttribute(preferences?.digest_time || "09:00:00", "value")} class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> <p class="text-xs text-gray-500 mt-1">Time of day to send digest (in your local timezone)</p> </div> </div> </section> <!-- Quiet Hours --> <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h2 class="text-xl font-semibold text-gray-900 mb-4">Quiet Hours</h2> <p class="text-sm text-gray-600 mb-6">
Don't send notifications during specific hours (e.g., while sleeping).
</p> <div class="space-y-4"> <label class="flex items-center gap-3"> <input type="checkbox" name="quiet_hours_enabled" id="quiet-hours-enabled"${addAttribute(preferences?.quiet_hours_enabled === true, "checked")} class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"> <span class="font-medium text-gray-900">Enable Quiet Hours</span> </label> <div id="quiet-hours-settings" class="hidden pl-8 space-y-3 border-l-2 border-gray-200"> <div class="flex gap-4"> <div class="flex-1"> <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label> <input type="time" name="quiet_hours_start"${addAttribute(preferences?.quiet_hours_start || "22:00:00", "value")} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> </div> <div class="flex-1"> <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label> <input type="time" name="quiet_hours_end"${addAttribute(preferences?.quiet_hours_end || "08:00:00", "value")} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> </div> </div> <p class="text-xs text-gray-500">No notifications will be sent during these hours</p> </div> </div> </section> <!-- Per-Event Preferences --> <section class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h2 class="text-xl font-semibold text-gray-900 mb-4">Event Preferences</h2> <p class="text-sm text-gray-600 mb-6">
Fine-tune which events trigger notifications on each channel.
</p> <div class="space-y-6"> ${categories.map((category) => renderTemplate`<div> <h3 class="text-lg font-medium text-gray-900 mb-3">${category}</h3> <div class="space-y-2"> ${eventTypes.filter((event) => event.category === category).map((event) => renderTemplate`<div class="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"> <div class="flex-1"> <p class="font-medium text-gray-900">${event.name}</p> <p class="text-sm text-gray-600">${event.description}</p> </div> <div class="flex items-center gap-3"> <label class="flex items-center gap-1 cursor-pointer" title="In-App"> <span class="text-sm text-gray-600">📱</span> <input type="checkbox"${addAttribute(`event_${event.id}_inapp`, "name")}${addAttribute(preferences?.event_preferences?.[event.id]?.inapp !== false, "checked")} class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"> </label> <label class="flex items-center gap-1 cursor-pointer" title="Email"> <span class="text-sm text-gray-600">📧</span> <input type="checkbox"${addAttribute(`event_${event.id}_email`, "name")}${addAttribute(preferences?.event_preferences?.[event.id]?.email !== false, "checked")} class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"> </label> </div> </div>`)} </div> </div>`)} </div> </section> <!-- Save Button --> <div class="flex items-center justify-between"> <button type="button" id="test-notification-btn" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
Send Test Notification
</button> <button type="submit" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
Save Preferences
</button> </div> </form> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/notifications/preferences.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/notifications/preferences.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/notifications/preferences.astro";
const $$url = "/notifications/preferences";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Preferences,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
