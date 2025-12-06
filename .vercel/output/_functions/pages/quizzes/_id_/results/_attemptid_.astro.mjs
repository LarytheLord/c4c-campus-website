import { f as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from "../../../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../../../renderers.mjs";
const prerender = false;
const $$attemptId = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Quiz Results - C4C Campus", "hideHeader": true, "hideFooter": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <!-- Header --> <div class="sticky top-0 z-50 bg-surface border-b border-border"> <div class="container mx-auto px-4 py-4"> <div class="flex items-center justify-between gap-4"> <div class="flex items-center gap-4 flex-1"> <a href="/dashboard" class="flex-shrink-0"> <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg"> </a> <div> <h1 class="text-xl sm:text-2xl font-bold" id="quiz-title">Quiz Results</h1> <p class="text-text-muted text-sm" id="breadcrumb">Loading...</p> </div> </div> <div class="flex items-center gap-3"> <button id="back-btn" class="btn btn-ghost btn-sm">Back to Quiz</button> <button id="logout-btn" class="btn btn-ghost text-sm">Sign Out</button> </div> </div> </div> </div> <!-- Loading State --> <div id="loading-state" class="container mx-auto px-4 py-12"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div> <p class="mt-4 text-text-muted">Loading results...</p> </div> </div> <!-- Results Content --> <div id="results-content" class="hidden container mx-auto px-4 py-8"> <!-- Results Summary (React Component) --> <div id="results-summary" class="mb-8"></div> <!-- Question Review --> <div id="review-container" class="hidden space-y-6"> <div class="flex items-center justify-between mb-6"> <h2 class="text-2xl font-bold">Review Your Answers</h2> <button id="hide-review-btn" class="btn btn-ghost btn-sm">
Hide Review
</button> </div> <div id="questions-review"></div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/results/[attemptId].astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/results/[attemptId].astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/results/[attemptId].astro";
const $$url = "/quizzes/[id]/results/[attemptId]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$attemptId,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
