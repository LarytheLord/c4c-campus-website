import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../renderers.mjs";
const $$ApplicationStatus = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Application Status - C4C Campus" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <!-- Header --> <div class="bg-surface border-b border-border"> <div class="container mx-auto px-4 py-4"> <div class="flex items-center justify-between"> <div> <h1 class="text-2xl font-bold">Application Status</h1> <p class="text-text-muted" id="welcome-text">Welcome!</p> </div> <button id="logout-btn" class="btn btn-ghost text-sm">
Sign Out
</button> </div> </div> </div> <!-- Loading State --> <div id="loading-state" class="container mx-auto px-4 py-12"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div> <p class="mt-4 text-text-muted">Loading your application...</p> </div> </div> <!-- Not Logged In --> <div id="not-logged-in" class="hidden container mx-auto px-4 py-12"> <div class="max-w-md mx-auto text-center"> <div class="card"> <h2 class="text-2xl font-bold mb-4">Please Sign In</h2> <p class="text-text-muted mb-6">You need to be logged in to view your application status.</p> <a href="/login" class="btn btn-primary">
Go to Login
</a> </div> </div> </div> <!-- No Application Found --> <div id="no-application" class="hidden container mx-auto px-4 py-12"> <div class="max-w-md mx-auto text-center"> <div class="card"> <h2 class="text-2xl font-bold mb-4">No Application Found</h2> <p class="text-text-muted mb-6">We couldn't find an application associated with your account.</p> <a href="/apply" class="btn btn-primary">
Submit Application
</a> </div> </div> </div> <!-- Application Status Content --> <div id="status-content" class="hidden container mx-auto px-4 py-8"> <div class="max-w-4xl mx-auto"> <!-- Pending Status --> <div id="status-pending" class="hidden"> <div class="card bg-yellow-50 border-yellow-200 mb-8"> <div class="flex items-start gap-4"> <div class="flex-shrink-0"> <svg class="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <div class="flex-1"> <h2 class="text-2xl font-bold text-yellow-900 mb-2">Application Under Review</h2> <p class="text-yellow-800 mb-4">
Thank you for applying to C4C Campus! We have received your application and our team is currently reviewing it. We'll notify you via email once a decision has been made.
</p> <div class="text-sm text-yellow-700"> <p><strong>Submitted:</strong> <span id="submitted-date">-</span></p> <p><strong>Program:</strong> <span id="program-name" class="capitalize">-</span></p> </div> </div> </div> </div> <!-- Application Details --> <div class="card mb-6"> <div class="flex items-center justify-between mb-6"> <h3 class="text-xl font-bold">Your Application</h3> <button id="edit-btn" class="btn btn-secondary">
Edit Application
</button> </div> <div id="application-details" class="space-y-6"> <!-- Details loaded dynamically --> </div> </div> <!-- What Happens Next --> <div class="card"> <h3 class="text-xl font-bold mb-4">What Happens Next?</h3> <ol class="space-y-4"> <li class="flex gap-3"> <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</span> <div> <strong>Review Process</strong> <p class="text-text-muted text-sm">Our team reviews all applications carefully. This typically takes 3-5 business days.</p> </div> </li> <li class="flex gap-3"> <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</span> <div> <strong>Decision Email</strong> <p class="text-text-muted text-sm">You'll receive an email at <span id="user-email" class="font-medium">-</span> with our decision.</p> </div> </li> <li class="flex gap-3"> <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">3</span> <div> <strong>Access to Platform</strong> <p class="text-text-muted text-sm">If approved, you'll gain access to the student dashboard, course materials, and all program resources.</p> </div> </li> </ol> </div> </div> <!-- Rejected Status --> <div id="status-rejected" class="hidden"> <div class="card bg-red-50 border-red-200"> <div class="flex items-start gap-4"> <div class="flex-shrink-0"> <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </div> <div class="flex-1"> <h2 class="text-2xl font-bold text-red-900 mb-2">Application Not Approved</h2> <p class="text-red-800 mb-4">
Thank you for your interest in C4C Campus. Unfortunately, we are unable to offer you a place in the program at this time.
</p> <p class="text-red-700 mb-4">
We receive many more applications than we have capacity for, and this decision does not reflect on your potential or commitment to our mission.
</p> <p class="text-red-700">
You are welcome to reapply in future cohorts. Keep building your skills and we hope to see your application again!
</p> </div> </div> </div> </div> <!-- Waitlisted Status --> <div id="status-waitlisted" class="hidden"> <div class="card bg-blue-50 border-blue-200"> <div class="flex items-start gap-4"> <div class="flex-shrink-0"> <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <div class="flex-1"> <h2 class="text-2xl font-bold text-blue-900 mb-2">You're on the Waitlist</h2> <p class="text-blue-800 mb-4">
Your application has been reviewed and we're impressed! While we don't have immediate capacity, you've been placed on our waitlist.
</p> <p class="text-blue-700">
If a spot opens up, we'll contact you via email. You'll also be prioritized for the next cohort.
</p> </div> </div> </div> </div> </div> </div> <!-- Edit Application Modal --> <div id="edit-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"> <div class="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"> <div class="p-6"> <div class="flex items-center justify-between mb-6"> <h2 class="text-2xl font-bold">Edit Application</h2> <button id="close-edit-modal" class="text-text-muted hover:text-text-primary"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path> </svg> </button> </div> <form id="edit-form" class="space-y-4"> <!-- Form fields loaded dynamically based on program --> <div id="edit-form-fields"></div> <div class="flex gap-3 pt-4"> <button type="submit" class="btn btn-primary flex-1">
Save Changes
</button> <button type="button" id="cancel-edit" class="btn btn-ghost flex-1">
Cancel
</button> </div> </form> </div> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/application-status.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/application-status.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/application-status.astro";
const $$url = "/application-status";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$ApplicationStatus,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
