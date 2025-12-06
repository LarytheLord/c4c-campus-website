import { f as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from "../../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../../renderers.mjs";
const prerender = false;
const $$Take = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Take Quiz - C4C Campus", "hideHeader": true, "hideFooter": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <!-- Header --> <div class="sticky top-0 z-50 bg-surface border-b border-border shadow-md"> <div class="container mx-auto px-4 py-4"> <div class="flex items-center justify-between gap-4"> <div class="flex items-center gap-4 flex-1"> <a href="/dashboard" class="flex-shrink-0"> <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg"> </a> <div> <h1 class="text-xl sm:text-2xl font-bold" id="quiz-title">Quiz</h1> <p class="text-text-muted text-sm" id="quiz-info">Loading...</p> </div> </div> <!-- Timer (shown when quiz has time limit) --> <div id="timer-container" class="hidden"></div> </div> </div> </div> <!-- Loading State --> <div id="loading-state" class="container mx-auto px-4 py-12"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div> <p class="mt-4 text-text-muted">Loading quiz...</p> </div> </div> <!-- Instructions Modal (shown before quiz starts) --> <div id="instructions-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"> <div class="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"> <div class="p-6"> <h2 class="text-2xl font-bold mb-4">Quiz Instructions</h2> <div id="instructions-content" class="prose prose-sm mb-6"></div> <div class="space-y-3 mb-6"> <div class="flex items-center gap-3 text-sm"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span id="passing-score-text"></span> </div> <div class="flex items-center gap-3 text-sm" id="time-limit-info"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span id="time-limit-text"></span> </div> <div class="flex items-center gap-3 text-sm"> <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> <span id="questions-count-text"></span> </div> </div> <div class="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6"> <div class="flex items-start gap-3"> <svg class="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path> </svg> <div class="text-sm text-warning"> <strong>Important:</strong> Once you start, you cannot pause the quiz. Make sure you have enough time to complete it.
</div> </div> </div> <div class="flex gap-3"> <button id="start-quiz-btn" class="btn btn-primary flex-1">
Start Quiz
</button> <a href="#" id="cancel-btn" class="btn btn-ghost">
Cancel
</a> </div> </div> </div> </div> <!-- Quiz Content --> <div id="quiz-content" class="hidden container mx-auto px-4 py-8 max-w-4xl"> <!-- Progress Bar --> <div id="progress-container" class="mb-6"></div> <!-- Question Container --> <div id="question-container" class="mb-6"></div> <!-- Navigation --> <div class="flex items-center justify-between gap-4 pb-8"> <button id="prev-question-btn" class="btn btn-ghost" disabled> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path> </svg>
Previous
</button> <div class="flex gap-3"> <button id="save-draft-btn" class="btn btn-ghost"> <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path> </svg>
Save Draft
</button> </div> <button id="next-question-btn" class="btn btn-primary">
Next
<svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path> </svg> </button> <button id="submit-quiz-btn" class="btn btn-success hidden">
Submit Quiz
</button> </div> </div> <!-- Submit Confirmation Modal --> <div id="submit-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"> <div class="bg-surface rounded-lg max-w-md w-full p-6"> <h3 class="text-xl font-bold mb-4">Submit Quiz?</h3> <p class="text-text-muted mb-6">
Are you sure you want to submit your quiz? You have answered <span id="answered-count"></span> out of <span id="total-count"></span> questions.
</p> <div class="flex gap-3"> <button id="confirm-submit-btn" class="btn btn-success flex-1">
Yes, Submit
</button> <button id="cancel-submit-btn" class="btn btn-ghost flex-1">
Cancel
</button> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/take.astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/take.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/quizzes/[id]/take.astro";
const $$url = "/quizzes/[id]/take";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Take,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
