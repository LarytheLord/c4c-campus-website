import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../renderers.mjs";
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Student Login - Code for Compassion Campus", "description": "Login portal for C4C Campus students, alumni, and accelerator participants." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-16"> <div class="max-w-md mx-auto"> <!-- Header --> <div class="text-center mb-8"> <h1 class="text-4xl font-black mb-4">Welcome Back</h1> <p class="text-text-muted">
Login to access your student portal
</p> </div> <!-- Login Card --> <div class="card p-8"> <form id="login-form" class="space-y-6"> <div> <label for="email" class="block text-sm font-semibold mb-2">Email Address</label> <input type="email" id="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors" placeholder="your.email@example.com"> </div> <div> <label for="password" class="block text-sm font-semibold mb-2">Password</label> <input type="password" id="password" name="password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors" placeholder="Enter your password"> </div> <button type="submit" class="btn btn-primary w-full">
Sign In
</button> <div id="error-message" class="hidden mt-4 p-4 rounded-lg text-sm bg-error/10 text-error border border-error/20"></div> </form> <div class="mt-6 pt-6 border-t border-gray-200 text-center"> <p class="text-sm text-text-muted mb-4">
Forgot your password? <a href="/forgot-password" class="text-primary hover:text-primary-dark font-medium">Reset it here</a> </p> <p class="text-sm text-text-muted">
Not a student yet? <a href="/apply" class="text-primary hover:text-primary-dark font-medium">Apply now</a> </p> </div> </div> <!-- Info Box --> <div class="mt-8 card bg-surface p-6"> <h3 class="font-bold mb-3">Student Portal Access</h3> <p class="text-sm text-text-muted mb-2">
The student portal is available for:
</p> <ul class="text-sm text-text-muted space-y-1"> <li>→ Current bootcamp students</li> <li>→ Accelerator participants</li> <li>→ Program alumni</li> </ul> <p class="text-sm text-text-muted mt-4">
You'll receive login credentials when you're accepted into a program.
</p> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/login.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/login.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/login.astro";
const $$url = "/login";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
