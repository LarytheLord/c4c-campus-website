import { f as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead } from "../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../renderers.mjs";
const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Lesson - C4C Campus", "hideHeader": true, "hideFooter": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <!-- Header --> <div class="sticky top-0 z-50 bg-surface border-b border-border"> <div class="container mx-auto px-4 py-4"> <div class="flex items-center justify-between gap-4"> <div class="flex items-center gap-4 flex-1"> <a href="/dashboard" class="flex-shrink-0"> <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg"> </a> <div> <h1 class="text-xl sm:text-2xl font-bold" id="lesson-title">Lesson</h1> <p class="text-text-muted text-sm" id="breadcrumb">Loading...</p> </div> </div> <div class="flex items-center gap-3"> <button id="back-btn" class="btn btn-ghost btn-sm">Back to Course</button> <button id="logout-btn" class="btn btn-ghost text-sm">Sign Out</button> </div> </div> </div> </div> <!-- Loading State --> <div id="loading-state" class="container mx-auto px-4 py-12"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div> <p class="mt-4 text-text-muted">Loading lesson...</p> </div> </div> <!-- Lesson Content --> <div id="lesson-content" class="hidden"> <div class="container mx-auto px-4 py-8 max-w-6xl"> <!-- Video Player --> <div id="video-container" class="mb-8"> <div class="bg-black rounded-lg overflow-hidden shadow-lg aspect-video"> <video id="lesson-video" class="w-full h-full" controls controlsList="nodownload"> <source id="video-source" src="" type="video/mp4">
Your browser does not support the video tag.
</video> </div> <div class="mt-4 flex items-center justify-between"> <div> <button id="mark-complete-btn" class="btn btn-primary">
Mark as Complete
</button> </div> <div class="flex gap-2"> <button id="prev-lesson-btn" class="btn btn-ghost btn-sm" style="display: none;">
← Previous
</button> <button id="next-lesson-btn" class="btn btn-ghost btn-sm" style="display: none;">
Next →
</button> </div> </div> </div> <!-- Lesson Text Content --> <div id="text-content-container" class="hidden mb-8 card"> <div class="prose prose-sm sm:prose max-w-none" id="text-content"> <!-- Markdown content will be rendered here --> </div> </div> <!-- Resources --> <div id="resources-container" class="hidden mb-8 card"> <h3 class="text-lg font-bold mb-4">Resources</h3> <div id="resources-list" class="space-y-2"> <!-- Resources will be listed here --> </div> </div> <!-- Assignments --> <div id="assignments-container" class="hidden mb-8 card"> <h3 class="text-lg font-bold mb-4">Assignments</h3> <div id="assignments-list" class="space-y-3"> <!-- Assignments will be listed here --> </div> </div> <!-- Quiz Section --> <div id="quiz-container" class="hidden mb-8"> <div id="quiz-root"></div> </div> <!-- Discussion Section --> <div id="discussion-container" class="card"> <div id="discussion-root"></div> </div> </div> </div> </div> ` })} ${renderScript($$result, "/Users/a0/Desktop/c4c-website/src/pages/lessons/[slug].astro?astro&type=script&index=0&lang.ts")} `;
}, "/Users/a0/Desktop/c4c-website/src/pages/lessons/[slug].astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/lessons/[slug].astro";
const $$url = "/lessons/[slug]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
