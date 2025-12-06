import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../renderers.mjs";
const $$ForgotPassword = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Reset Password - Code for Compassion Campus", "description": "Reset your C4C Campus account password." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-16"> <div class="max-w-md mx-auto"> <!-- Header --> <div class="text-center mb-8"> <h1 class="text-4xl font-black mb-4">Reset Password</h1> <p class="text-text-muted">
Enter your email address and we'll send you a link to reset your password.
</p> </div> <!-- Reset Password Card --> <div class="card p-8"> <form id="forgot-password-form" class="space-y-6"> <div> <label for="email" class="block text-sm font-semibold mb-2">Email Address</label> <input type="email" id="email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors" placeholder="your.email@example.com"> </div> <button type="submit" class="btn btn-primary w-full">
Send Reset Link
</button> <div id="error-message" class="hidden mt-4 p-4 rounded-lg text-sm bg-error/10 text-error border border-error/20"></div> <div id="success-message" class="hidden mt-4 p-4 rounded-lg text-sm bg-success/10 text-success border border-success/20"></div> </form> <div class="mt-6 pt-6 border-t border-gray-200 text-center"> <p class="text-sm text-text-muted">
Remember your password? <a href="/login" class="text-primary hover:text-primary-dark font-medium">Sign in</a> </p> </div> </div> <!-- Info Box --> <div class="mt-8 card bg-surface p-6"> <h3 class="font-bold mb-3">Need Help?</h3> <p class="text-sm text-text-muted mb-2">
If you're having trouble resetting your password or don't have access to your email, please contact us:
</p> <p class="text-sm text-text-muted"> <a href="mailto:info@codeforcompassion.com" class="text-primary hover:text-primary-dark font-medium">info@codeforcompassion.com</a> </p> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/forgot-password.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/forgot-password.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/forgot-password.astro";
const $$url = "/forgot-password";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$ForgotPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
