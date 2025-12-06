import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, l as renderScript } from "../../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../../assets/BaseLayout.CfYIT7u8.js";
import { renderers } from "../../renderers.mjs";
const $$Users = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "User Management - Admin - C4C Campus", "hideHeader": true, "hideFooter": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-background"> <!-- Admin Header --> <div class="sticky top-0 z-50 bg-surface border-b border-border"> <div class="container mx-auto px-4 py-4"> <div class="flex items-center justify-between gap-4"> <div class="flex items-center gap-4 flex-1"> <a href="/admin/dashboard" class="flex-shrink-0"> <img src="/logo.jpeg" alt="C4C Campus" class="h-10 w-10 rounded-lg"> </a> <div> <h1 class="text-xl sm:text-2xl font-bold">User Management</h1> <p class="text-text-muted text-sm">Manage user roles and permissions</p> </div> </div> <div class="flex items-center gap-3"> <a href="/admin/dashboard" class="btn btn-ghost btn-sm">Dashboard</a> <a href="/admin/applications" class="btn btn-ghost btn-sm">Applications</a> <a href="/admin/analytics" class="btn btn-ghost btn-sm">Analytics</a> <button id="logout-btn" class="btn btn-ghost text-sm">Sign Out</button> </div> </div> </div> </div> <!-- Loading State --> <div id="loading-state" class="container mx-auto px-4 py-12"> <div class="text-center"> <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div> <p class="mt-4 text-text-muted">Loading users...</p> </div> </div> <!-- Access Denied State --> <div id="access-denied" class="hidden container mx-auto px-4 py-12"> <div class="max-w-md mx-auto text-center"> <div class="card"> <h2 class="text-2xl font-bold mb-4">Access Denied</h2> <p class="text-text-muted mb-6">You need admin privileges to access this page.</p> <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a> </div> </div> </div> <!-- User Management Content --> <div id="users-content" class="hidden"> <div class="container mx-auto px-4 py-8"> <!-- Filters and Bulk Actions --> <div class="card mb-6"> <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"> <div class="flex-1 flex gap-4"> <!-- Search --> <input type="text" id="search-input" placeholder="Search by name or email..." class="border border-border rounded-lg px-4 py-2 bg-background flex-1"> <!-- Role Filter --> <select id="role-filter" class="border border-border rounded-lg px-4 py-2 bg-background"> <option value="">All Roles</option> <option value="student">Students</option> <option value="teacher">Teachers</option> <option value="admin">Admins</option> </select> </div> <!-- Bulk Actions --> <div class="flex gap-2"> <button id="bulk-student-btn" class="btn btn-secondary btn-sm" disabled>
Make Students
</button> <button id="bulk-teacher-btn" class="btn btn-secondary btn-sm" disabled>
Make Teachers
</button> <button id="bulk-admin-btn" class="btn btn-secondary btn-sm" disabled>
Make Admins
</button> </div> </div> <p class="text-sm text-text-muted mt-2" id="selection-count">
0 users selected
</p> </div> <!-- Users Table --> <div class="card"> <div class="overflow-x-auto"> <table class="w-full"> <thead> <tr class="border-b border-border"> <th class="text-left p-4"> <input type="checkbox" id="select-all" class="rounded"> </th> <th class="text-left p-4">Name</th> <th class="text-left p-4">Email</th> <th class="text-left p-4">Role</th> <th class="text-left p-4">Status</th> <th class="text-left p-4">Joined</th> <th class="text-left p-4">Actions</th> </tr> </thead> <tbody id="users-table-body"> <tr> <td colspan="7" class="text-center py-8"> <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div> </td> </tr> </tbody> </table> </div> </div> </div> </div> </div>  <div id="role-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50"> <div class="card max-w-md mx-4"> <h3 class="text-xl font-bold mb-4">Confirm Role Change</h3> <p class="text-text-muted mb-6" id="role-modal-message">
Are you sure you want to change this user's role?
</p> <div class="flex gap-3 justify-end"> <button id="role-modal-cancel" class="btn btn-ghost">Cancel</button> <button id="role-modal-confirm" class="btn btn-primary">Confirm</button> </div> </div> </div> ${renderScript($$result2, "/Users/a0/Desktop/c4c-website/src/pages/admin/users.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/admin/users.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/admin/users.astro";
const $$url = "/admin/users";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Users,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
