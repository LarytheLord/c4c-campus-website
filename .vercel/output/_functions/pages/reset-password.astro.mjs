import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../renderers.mjs";
const $$ResetPassword = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Set New Password - Code for Compassion Campus", "description": "Set a new password for your C4C Campus account." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto px-4 py-16"> <div class="max-w-md mx-auto"> <!-- Header --> <div class="text-center mb-8"> <h1 class="text-4xl font-black mb-4">Set New Password</h1> <p class="text-text-muted">
Enter your new password below.
</p> </div> <!-- Reset Password Card --> <div class="card p-8"> <!-- Loading state while verifying token --> <div id="loading-state" class="text-center py-8"> <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4"></div> <p class="text-text-muted">Verifying your reset link...</p> </div> <!-- Error state for invalid/expired token --> <div id="error-state" class="hidden text-center py-8"> <div class="text-5xl mb-4">⚠️</div> <h2 class="text-xl font-bold mb-2 text-error">Invalid or Expired Link</h2> <p class="text-text-muted mb-6">
This password reset link is invalid or has expired. Please request a new one.
</p> <a href="/forgot-password" class="btn btn-primary">
Request New Link
</a> </div> <!-- Form state for valid token --> <form id="reset-password-form" class="hidden space-y-6"> <div> <label for="password" class="block text-sm font-semibold mb-2">New Password</label> <input type="password" id="password" name="password" required minlength="12" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{12,}$" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors" placeholder="Min 12 chars: Aa1!@#"> <p class="text-xs text-text-muted mt-1">Must include: uppercase (A-Z), lowercase (a-z), number (0-9), special char (!@#$%^&* etc.)</p> </div> <div> <label for="confirmPassword" class="block text-sm font-semibold mb-2">Confirm New Password</label> <input type="password" id="confirmPassword" name="confirmPassword" required minlength="12" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors" placeholder="Re-enter your new password"> </div> <button type="submit" class="btn btn-primary w-full">
Update Password
</button> <div id="form-error-message" class="hidden mt-4 p-4 rounded-lg text-sm bg-error/10 text-error border border-error/20"></div> </form> <!-- Success state --> <div id="success-state" class="hidden text-center py-8"> <div class="text-5xl mb-4">✓</div> <h2 class="text-xl font-bold mb-2 text-success">Password Updated!</h2> <p class="text-text-muted mb-6">
Your password has been successfully updated. You can now sign in with your new password.
</p> <a href="/login" class="btn btn-primary">
Sign In
</a> </div> </div> <!-- Info Box --> <div class="mt-8 card bg-surface p-6"> <h3 class="font-bold mb-3">Password Requirements</h3> <ul class="text-sm text-text-muted space-y-1"> <li>→ At least 12 characters long</li> <li>→ Contains uppercase letter (A-Z)</li> <li>→ Contains lowercase letter (a-z)</li> <li>→ Contains a number (0-9)</li> <li>→ Contains a special character (!@#$%^&* etc.)</li> </ul> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/reset-password.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/reset-password.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/reset-password.astro";
const $$url = "/reset-password";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$ResetPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
