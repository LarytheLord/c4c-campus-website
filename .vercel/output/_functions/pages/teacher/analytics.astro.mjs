import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript, h as addAttribute } from "../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../assets/BaseLayout.CfYIT7u8.js";
import { createClient } from "@supabase/supabase-js";
/* empty css                                       */
import { renderers } from "../../renderers.mjs";
const $$Astro = createAstro("https://c4ccampus.org");
const $$Analytics = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Analytics;
  const supabase = createClient(
    "https://auyysgeurtnpidppebqj.supabase.co",
    "***REMOVED***"
  );
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return Astro2.redirect("/login?redirect=/teacher/analytics");
  }
  const { data: cohorts } = await supabase.from("cohorts").select(`
    id,
    name,
    course_id,
    cohort_enrollments(count)
  `).eq("created_by", session.user.id).order("created_at", { ascending: false });
  const cohortsWithCounts = cohorts?.map((c) => ({
    ...c,
    student_count: c.cohort_enrollments?.[0]?.count || 0
  })) || [];
  const defaultCohort = cohortsWithCounts?.[0];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Teacher Analytics Dashboard", "data-astro-cid-hv6wktw6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-8" data-astro-cid-hv6wktw6> <div class="mb-8" data-astro-cid-hv6wktw6> <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-astro-cid-hv6wktw6>
Analytics Dashboard
</h1> <p class="text-lg text-gray-600 dark:text-gray-400" data-astro-cid-hv6wktw6>
Track student engagement, identify at-risk learners, and optimize your teaching
</p> </div> <!-- Cohort Selector --> <div class="mb-6" data-astro-cid-hv6wktw6> <label for="cohort-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" data-astro-cid-hv6wktw6>
Select Cohort
</label> <select id="cohort-select" class="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" data-astro-cid-hv6wktw6> ${cohortsWithCounts?.map((cohort) => renderTemplate`<option${addAttribute(cohort.id, "value")}${addAttribute(cohort.id === defaultCohort?.id, "selected")} data-astro-cid-hv6wktw6> ${cohort.name} (${cohort.student_count} students)
</option>`)} </select> </div> <!-- Date Range Selector --> <div id="date-range-container" class="mb-8" data-astro-cid-hv6wktw6></div> <!-- Key Metrics Cards --> <div id="metrics-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-astro-cid-hv6wktw6></div> <!-- Tabs for Different Analytics Views --> <div class="mb-6" data-astro-cid-hv6wktw6> <div class="border-b border-gray-200 dark:border-gray-700" data-astro-cid-hv6wktw6> <nav class="-mb-px flex space-x-8" data-astro-cid-hv6wktw6> <button class="tab-button active py-4 px-1 border-b-2 font-medium text-sm" data-tab="engagement" data-astro-cid-hv6wktw6>
Engagement Heat Map
</button> <button class="tab-button py-4 px-1 border-b-2 font-medium text-sm" data-tab="at-risk" data-astro-cid-hv6wktw6>
At-Risk Students
</button> <button class="tab-button py-4 px-1 border-b-2 font-medium text-sm" data-tab="lessons" data-astro-cid-hv6wktw6>
Lesson Effectiveness
</button> <button class="tab-button py-4 px-1 border-b-2 font-medium text-sm" data-tab="reports" data-astro-cid-hv6wktw6>
Custom Reports
</button> </nav> </div> </div> <!-- Tab Content --> <div class="tab-content" data-astro-cid-hv6wktw6> <!-- Engagement Heat Map Tab --> <div id="engagement-tab" class="tab-panel active" data-astro-cid-hv6wktw6> <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6" data-astro-cid-hv6wktw6> <div class="flex justify-between items-center mb-4" data-astro-cid-hv6wktw6> <h2 class="text-2xl font-bold text-gray-900 dark:text-white" data-astro-cid-hv6wktw6>
Student Engagement Heat Map
</h2> <div id="heatmap-export" data-astro-cid-hv6wktw6></div> </div> <p class="text-gray-600 dark:text-gray-400 mb-6" data-astro-cid-hv6wktw6>
Visualize when your students are most active throughout the week
</p> <div id="heatmap-container" class="min-h-[400px]" data-astro-cid-hv6wktw6></div> </div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" data-astro-cid-hv6wktw6> <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-astro-cid-hv6wktw6> <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4" data-astro-cid-hv6wktw6>
Peak Activity Times
</h3> <div id="peak-times" class="space-y-3" data-astro-cid-hv6wktw6></div> </div> <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-astro-cid-hv6wktw6> <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4" data-astro-cid-hv6wktw6>
Activity Trends
</h3> <canvas id="activity-trend-chart" data-astro-cid-hv6wktw6></canvas> </div> </div> </div> <!-- At-Risk Students Tab --> <div id="at-risk-tab" class="tab-panel hidden" data-astro-cid-hv6wktw6> <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6" data-astro-cid-hv6wktw6> <div class="flex justify-between items-center mb-4" data-astro-cid-hv6wktw6> <h2 class="text-2xl font-bold text-gray-900 dark:text-white" data-astro-cid-hv6wktw6>
Dropout Risk Analysis
</h2> <button id="recalculate-risk" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-astro-cid-hv6wktw6>
Recalculate
</button> </div> <p class="text-gray-600 dark:text-gray-400 mb-6" data-astro-cid-hv6wktw6>
Identify students who need support and take proactive action
</p> <!-- Risk Level Filters --> <div class="flex space-x-2 mb-6" data-astro-cid-hv6wktw6> <button class="risk-filter active px-4 py-2 rounded-lg" data-level="all" data-astro-cid-hv6wktw6>
All Students
</button> <button class="risk-filter px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400" data-level="critical" data-astro-cid-hv6wktw6>
Critical
</button> <button class="risk-filter px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400" data-level="high" data-astro-cid-hv6wktw6>
High
</button> <button class="risk-filter px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" data-level="medium" data-astro-cid-hv6wktw6>
Medium
</button> <button class="risk-filter px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" data-level="low" data-astro-cid-hv6wktw6>
Low
</button> </div> <div id="at-risk-container" data-astro-cid-hv6wktw6></div> </div> </div> <!-- Lesson Effectiveness Tab --> <div id="lessons-tab" class="tab-panel hidden" data-astro-cid-hv6wktw6> <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-astro-cid-hv6wktw6> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4" data-astro-cid-hv6wktw6>
Lesson Performance
</h2> <p class="text-gray-600 dark:text-gray-400 mb-6" data-astro-cid-hv6wktw6>
Analyze completion rates and engagement for each lesson
</p> <div id="lessons-container" data-astro-cid-hv6wktw6></div> </div> </div> <!-- Custom Reports Tab --> <div id="reports-tab" class="tab-panel hidden" data-astro-cid-hv6wktw6> <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" data-astro-cid-hv6wktw6> <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4" data-astro-cid-hv6wktw6>
Custom Report Builder
</h2> <p class="text-gray-600 dark:text-gray-400 mb-6" data-astro-cid-hv6wktw6>
Create and export custom analytics reports
</p> <div class="text-center py-12" data-astro-cid-hv6wktw6> <p class="text-gray-500 dark:text-gray-400 mb-4" data-astro-cid-hv6wktw6>
Report builder coming soon!
</p> <p class="text-sm text-gray-400" data-astro-cid-hv6wktw6>
Export current view data using the export buttons above each section
</p> </div> </div> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/teacher/analytics.astro?astro&type=script&index=0&lang.ts")}  ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/teacher/analytics.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/teacher/analytics.astro";
const $$url = "/teacher/analytics";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Analytics,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
