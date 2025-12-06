import { f as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from "../../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../../renderers.mjs";
const prerender = false;
const $$Attempts = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Quiz Attempts - C4C Campus", "hideHeader": true, "hideFooter": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <!-- Header --> <div class="sticky top-0 z-50 bg-surface border-b border-border"> <div class="container mx-auto px-4 py-4"> <div class="flex items-center justify-between gap-4"> <div class="flex items-center gap-4 flex-1"> <a href="/dashboard" class="flex-shrink-0"> <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg"> </a> <div> <h1 class="text-xl sm:text-2xl font-bold" id="quiz-title">Quiz Attempts</h1> <p class="text-text-muted text-sm" id="breadcrumb">Loading...</p> </div> </div> <div class="flex items-center gap-3"> <button id="back-btn" class="btn btn-ghost btn-sm">Back</button> <button id="logout-btn" class="btn btn-ghost text-sm">Sign Out</button> </div> </div> </div> </div> <!-- Loading State --> <div id="loading-state" class="container mx-auto px-4 py-12"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div> <p class="mt-4 text-text-muted">Loading attempts...</p> </div> </div> <!-- Attempts Content --> <div id="attempts-content" class="hidden container mx-auto px-4 py-8 max-w-4xl"> <!-- Quiz Info Card --> <div class="card mb-8"> <div class="flex items-start justify-between gap-4 mb-4"> <div class="flex-1"> <h2 class="text-2xl font-bold mb-2" id="quiz-title-display"></h2> <p class="text-text-muted" id="quiz-description"></p> </div> <button id="retry-btn" class="btn btn-primary hidden">
Take Quiz Again
</button> </div> <div class="flex flex-wrap gap-6 text-sm"> <div> <span class="text-text-muted">Passing Score:</span> <span class="font-medium ml-2" id="passing-score"></span> </div> <div> <span class="text-text-muted">Max Attempts:</span> <span class="font-medium ml-2" id="max-attempts"></span> </div> <div> <span class="text-text-muted">Your Best Score:</span> <span class="font-bold ml-2" id="best-score"></span> </div> </div> </div> <!-- Attempts List --> <div class="space-y-4"> <h3 class="text-xl font-bold mb-4">Your Attempts</h3> <div id="attempts-list"> <!-- Attempts will be rendered here --> </div> <div id="no-attempts" class="hidden card text-center py-12"> <svg class="w-16 h-16 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path> </svg> <h3 class="text-xl font-bold mb-2">No Attempts Yet</h3> <p class="text-text-muted mb-6">You haven't taken this quiz yet.</p> <button id="start-quiz-btn" class="btn btn-primary">
Take Quiz Now
</button> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/attempts.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/attempts.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/attempts.astro";
const $$url = "/quizzes/[id]/attempts";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Attempts,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
