import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../renderers.mjs";
const $$Astro = createAstro("https://c4ccampus.org");
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Assignment - Code4Change" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-50 py-12"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Loading State --> <div id="loading" class="text-center py-12"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div> <p class="mt-4 text-gray-600">Loading assignment...</p> </div> <!-- Error State --> <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"></div> <!-- Main Content --> <div id="content" class="hidden"> <!-- Back Button --> <a href="/assignments" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"> <span class="mr-2">←</span>
Back to Assignments
</a> <!-- Assignment Header --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6"> <div class="flex items-start justify-between gap-4 mb-4"> <div class="flex-1"> <h1 id="assignment-title" class="text-4xl font-bold mb-2"></h1> <p id="assignment-meta" class="text-gray-600 text-sm"></p> </div> <div id="status-badge"></div> </div> <p id="assignment-description" class="text-gray-700 text-lg"></p> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"> <!-- Main Content Column --> <div class="lg:col-span-2 space-y-6"> <!-- Instructions --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h2 class="text-2xl font-bold mb-4">Instructions</h2> <div id="assignment-instructions" class="prose prose-sm max-w-none"></div> </div> <!-- Grading Rubric --> <div id="rubric-container"></div> <!-- Submission Form --> <div id="submission-form-container"></div> <!-- Submission History --> <div id="history-container"></div> </div> <!-- Sidebar --> <div class="space-y-6"> <!-- Countdown Timer --> <div id="countdown-container"></div> <!-- Submission Status --> <div id="submission-status-container"></div> <!-- Assignment Details --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h3 class="text-lg font-semibold mb-4">Assignment Details</h3> <div id="assignment-details" class="space-y-3 text-sm"></div> </div> </div> </div> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/assignments/[id].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/assignments/[id].astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/assignments/[id].astro";
const $$url = "/assignments/[id]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
