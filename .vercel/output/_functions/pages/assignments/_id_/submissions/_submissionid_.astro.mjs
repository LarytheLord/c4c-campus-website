import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../../../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../../../renderers.mjs";
const $$Astro = createAstro("https://c4ccampus.org");
const prerender = false;
const $$submissionId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$submissionId;
  const { id, submissionId } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Submission Details - Code4Change" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-50 py-12"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Loading State --> <div id="loading" class="text-center py-12"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div> <p class="mt-4 text-gray-600">Loading submission...</p> </div> <!-- Error State --> <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"></div> <!-- Main Content --> <div id="content" class="hidden"> <!-- Back Button --> <a id="back-link" href="#" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"> <span class="mr-2">←</span>
Back to Assignment
</a> <!-- Submission Header --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6"> <div class="flex items-start justify-between gap-4 mb-4"> <div class="flex-1"> <h1 id="submission-title" class="text-3xl font-bold mb-2"></h1> <p id="submission-meta" class="text-gray-600"></p> </div> <div id="status-badge"></div> </div> </div> <!-- Submission Details --> <div class="space-y-6"> <!-- File Information --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h2 class="text-xl font-semibold mb-4">Submitted File</h2> <div id="file-info" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"></div> </div> <!-- Grade & Feedback --> <div id="grade-container"></div> <!-- Submission History --> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <h2 class="text-xl font-semibold mb-4">Submission Timeline</h2> <div id="timeline" class="space-y-4"></div> </div> <!-- Actions --> <div class="flex gap-3"> <button id="download-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
Download Submission
</button> <button id="resubmit-btn" class="hidden px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
Submit New Version
</button> </div> </div> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/assignments/[id]/submissions/[submissionId].astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/assignments/[id]/submissions/[submissionId].astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/assignments/[id]/submissions/[submissionId].astro";
const $$url = "/assignments/[id]/submissions/[submissionId]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$submissionId,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
