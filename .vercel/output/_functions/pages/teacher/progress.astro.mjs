import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../renderers.mjs";
const $$Progress = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Progress Dashboard - Teacher - C4C Campus", "hideHeader": true, "hideFooter": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <!-- Teacher Header --> <div class="sticky top-0 z-50 bg-surface border-b border-border"> <div class="container mx-auto px-4 py-4"> <div class="flex items-center justify-between gap-4"> <div class="flex items-center gap-4 flex-1"> <a href="/teacher/courses" class="flex-shrink-0"> <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg"> </a> <div> <h1 class="text-xl sm:text-2xl font-bold">Progress Dashboard</h1> <p class="text-text-muted text-sm" id="subtitle">Track student progress and engagement</p> </div> </div> <div class="flex items-center gap-3"> <button id="refresh-btn" class="btn btn-ghost btn-sm" title="Refresh data"> <span id="refresh-icon">🔄</span> Refresh
</button> <button id="export-btn" class="hidden btn btn-secondary btn-sm" title="Export to CSV">
📊 Export CSV
</button> <a href="/teacher/courses" class="btn btn-ghost btn-sm">
Back to Dashboard
</a> <button id="logout-btn" class="btn btn-ghost text-sm">
Sign Out
</button> </div> </div> </div> </div> <!-- Loading State --> <div id="loading-state" class="container mx-auto px-4 py-12"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div> <p class="mt-4 text-text-muted">Loading dashboard...</p> </div> </div> <!-- Access Denied --> <div id="access-denied" class="hidden container mx-auto px-4 py-12"> <div class="max-w-md mx-auto text-center"> <div class="card"> <h2 class="text-2xl font-bold mb-4">Access Denied</h2> <p class="text-text-muted mb-6">You need teacher or admin privileges to access this page.</p> <a href="/dashboard" class="btn btn-primary">
Go to Dashboard
</a> </div> </div> </div> <!-- Main Content --> <div id="main-content" class="hidden container mx-auto px-4 py-8"> <!-- Breadcrumbs --> <nav class="mb-6 text-sm text-text-muted"> <a href="/dashboard" class="hover:text-primary transition-colors">Dashboard</a> <span class="mx-2">/</span> <a href="/teacher/courses" class="hover:text-primary transition-colors">Teacher</a> <span class="mx-2">/</span> <span>Progress Dashboard</span> </nav> <!-- Cohort Selector --> <div class="card mb-8"> <div class="flex items-center justify-between gap-4"> <div class="flex-1"> <label class="block text-sm font-medium mb-2">Select Cohort</label> <select id="cohort-selector" class="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 bg-white"> <option value="">Loading cohorts...</option> </select> </div> <div class="text-right"> <p class="text-sm text-text-muted">Last updated</p> <p class="text-sm font-medium" id="last-updated">Just now</p> </div> </div> </div> <!-- Dashboard Widgets Container --> <div id="dashboard-widgets"> <!-- CohortStats Component --> <div id="cohort-stats-container"></div> <!-- Grid Layout for Charts and Alerts --> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"> <!-- Progress Charts (2 columns) --> <div class="lg:col-span-2"> <div id="progress-chart-container"></div> </div> <!-- Struggling Students (1 column) --> <div class="lg:col-span-1"> <div id="struggling-students-container"></div> </div> </div> <!-- Leaderboard --> <div id="leaderboard-container"></div> </div> <!-- No Cohort Selected --> <div id="no-cohort" class="hidden text-center py-12"> <div class="text-6xl mb-4">📊</div> <h3 class="text-xl font-semibold mb-2">Select a Cohort</h3> <p class="text-text-muted mb-4">Choose a cohort from the dropdown above to view progress analytics.</p> </div> <!-- No Data --> <div id="no-data" class="hidden text-center py-12"> <div class="text-6xl mb-4">📭</div> <h3 class="text-xl font-semibold mb-2">No Data Available</h3> <p class="text-text-muted mb-4">This cohort doesn't have any student data yet.</p> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/teacher/progress.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/teacher/progress.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/teacher/progress.astro";
const $$url = "/teacher/progress";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Progress,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
