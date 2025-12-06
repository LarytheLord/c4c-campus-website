import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../renderers.mjs";
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "My Assignments - Code4Change" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-50 py-12"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Header --> <div class="mb-8"> <h1 class="text-4xl font-bold mb-2">My Assignments</h1> <p class="text-gray-600">View and submit your course assignments</p> </div> <!-- Quick Stats --> <div id="stats-container" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"> <!-- Will be populated by JavaScript --> </div> <!-- Filters --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"> <h2 class="text-lg font-semibold mb-4">Filter Assignments</h2> <div class="flex flex-wrap gap-4"> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Status</label> <select id="status-filter" class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> <option value="all">All Assignments</option> <option value="not_submitted">Not Submitted</option> <option value="submitted">Submitted</option> <option value="graded">Graded</option> <option value="overdue">Overdue</option> </select> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label> <select id="sort-filter" class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> <option value="due_date_asc">Due Date (Nearest First)</option> <option value="due_date_desc">Due Date (Latest First)</option> <option value="created_desc">Recently Created</option> <option value="title_asc">Title (A-Z)</option> </select> </div> <div> <label class="block text-sm font-medium text-gray-700 mb-2">Course</label> <select id="course-filter" class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"> <option value="all">All Courses</option> <!-- Will be populated by JavaScript --> </select> </div> </div> </div> <!-- Assignments List --> <div id="assignments-container" class="space-y-4"> <!-- Loading State --> <div id="loading" class="text-center py-12"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div> <p class="mt-4 text-gray-600">Loading assignments...</p> </div> <!-- Error State --> <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"></div> <!-- Empty State --> <div id="empty" class="hidden text-center py-12 bg-white rounded-lg border border-gray-200"> <div class="text-6xl mb-4">📝</div> <h3 class="text-xl font-semibold mb-2">No Assignments Found</h3> <p class="text-gray-600">You don't have any assignments yet or none match your filters.</p> </div> <!-- Assignments will be rendered here --> <div id="assignments-list"></div> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/assignments/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/assignments/index.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/assignments/index.astro";
const $$url = "/assignments";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
