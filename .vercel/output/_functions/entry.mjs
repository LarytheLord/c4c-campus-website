import { renderers } from "./renderers.mjs";
import { c as createExports, s as serverEntrypointModule } from "./assets/_@astrojs-ssr-adapter.Dg9L7p4u.js";
import { manifest } from "./manifest_CTsTfub2.mjs";
const serverIslandMap = /* @__PURE__ */ new Map();
;
const _page0 = () => import("./pages/_image.astro.mjs");
const _page1 = () => import("./pages/about.astro.mjs");
const _page2 = () => import("./pages/admin/analytics.astro.mjs");
const _page3 = () => import("./pages/admin/applications.astro.mjs");
const _page4 = () => import("./pages/admin/applications-review.astro.mjs");
const _page5 = () => import("./pages/admin/cohorts.astro.mjs");
const _page6 = () => import("./pages/admin/dashboard.astro.mjs");
const _page7 = () => import("./pages/admin/search-analytics.astro.mjs");
const _page8 = () => import("./pages/admin/settings/branding.astro.mjs");
const _page9 = () => import("./pages/admin/settings.astro.mjs");
const _page10 = () => import("./pages/admin/users.astro.mjs");
const _page11 = () => import("./pages/api/admin/assign-reviewer.astro.mjs");
const _page12 = () => import("./pages/api/admin/reviewers.astro.mjs");
const _page13 = () => import("./pages/api/apply.astro.mjs");
const _page14 = () => import("./pages/api/assignments/_id_/grade.astro.mjs");
const _page15 = () => import("./pages/api/assignments/_id_/submissions.astro.mjs");
const _page16 = () => import("./pages/api/assignments/_id_/submit.astro.mjs");
const _page17 = () => import("./pages/api/assignments/_id_.astro.mjs");
const _page18 = () => import("./pages/api/assignments.astro.mjs");
const _page19 = () => import("./pages/api/cohorts/_id_/enroll.astro.mjs");
const _page20 = () => import("./pages/api/cohorts/_id_/schedule.astro.mjs");
const _page21 = () => import("./pages/api/cohorts/_id_.astro.mjs");
const _page22 = () => import("./pages/api/cohorts.astro.mjs");
const _page23 = () => import("./pages/api/contact.astro.mjs");
const _page24 = () => import("./pages/api/content/media.astro.mjs");
const _page25 = () => import("./pages/api/discussions/_id_/moderate.astro.mjs");
const _page26 = () => import("./pages/api/discussions/_id_/reply.astro.mjs");
const _page27 = () => import("./pages/api/discussions.astro.mjs");
const _page28 = () => import("./pages/api/enroll.astro.mjs");
const _page29 = () => import("./pages/api/enroll-cohort.astro.mjs");
const _page30 = () => import("./pages/api/quizzes/_id_/attempts/_attemptid_/save.astro.mjs");
const _page31 = () => import("./pages/api/quizzes/_id_/attempts/_attemptid_/submit.astro.mjs");
const _page32 = () => import("./pages/api/quizzes/_id_/attempts/_attemptid_.astro.mjs");
const _page33 = () => import("./pages/api/quizzes/_id_/start.astro.mjs");
const _page34 = () => import("./pages/api/quizzes/_id_.astro.mjs");
const _page35 = () => import("./pages/api/quizzes.astro.mjs");
const _page36 = () => import("./pages/api/submissions/_id_/download.astro.mjs");
const _page37 = () => import("./pages/api/supabase-webhook.astro.mjs");
const _page38 = () => import("./pages/api/teacher/cohort-analytics.astro.mjs");
const _page39 = () => import("./pages/api/users/search.astro.mjs");
const _page40 = () => import("./pages/application-status.astro.mjs");
const _page41 = () => import("./pages/apply.astro.mjs");
const _page42 = () => import("./pages/assignments/_id_/submissions/_submissionid_.astro.mjs");
const _page43 = () => import("./pages/assignments/_id_.astro.mjs");
const _page44 = () => import("./pages/assignments.astro.mjs");
const _page45 = () => import("./pages/certificates.astro.mjs");
const _page46 = () => import("./pages/contact.astro.mjs");
const _page47 = () => import("./pages/courses/_slug_.astro.mjs");
const _page48 = () => import("./pages/courses.astro.mjs");
const _page49 = () => import("./pages/dashboard.astro.mjs");
const _page50 = () => import("./pages/faq.astro.mjs");
const _page51 = () => import("./pages/forgot-password.astro.mjs");
const _page52 = () => import("./pages/framework.astro.mjs");
const _page53 = () => import("./pages/lessons/_slug_.astro.mjs");
const _page54 = () => import("./pages/login.astro.mjs");
const _page55 = () => import("./pages/notifications/preferences.astro.mjs");
const _page56 = () => import("./pages/payment/canceled.astro.mjs");
const _page57 = () => import("./pages/payment/success.astro.mjs");
const _page58 = () => import("./pages/pricing.astro.mjs");
const _page59 = () => import("./pages/programs.astro.mjs");
const _page60 = () => import("./pages/quizzes/_id_/attempts.astro.mjs");
const _page61 = () => import("./pages/quizzes/_id_/results/_attemptid_.astro.mjs");
const _page62 = () => import("./pages/quizzes/_id_/take.astro.mjs");
const _page63 = () => import("./pages/reset-password.astro.mjs");
const _page64 = () => import("./pages/teacher/analytics.astro.mjs");
const _page65 = () => import("./pages/teacher/cohorts/_id_.astro.mjs");
const _page66 = () => import("./pages/teacher/courses.astro.mjs");
const _page67 = () => import("./pages/teacher/progress.astro.mjs");
const _page68 = () => import("./pages/tracks.astro.mjs");
const _page69 = () => import("./pages/verify/_code_.astro.mjs");
const _page70 = () => import("./pages/index.astro.mjs");
const pageMap = /* @__PURE__ */ new Map([
  ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
  ["src/pages/about.astro", _page1],
  ["src/pages/admin/analytics.astro", _page2],
  ["src/pages/admin/applications.astro", _page3],
  ["src/pages/admin/applications-review.astro", _page4],
  ["src/pages/admin/cohorts.astro", _page5],
  ["src/pages/admin/dashboard.astro", _page6],
  ["src/pages/admin/search-analytics.astro", _page7],
  ["src/pages/admin/settings/branding.astro", _page8],
  ["src/pages/admin/settings.astro", _page9],
  ["src/pages/admin/users.astro", _page10],
  ["src/pages/api/admin/assign-reviewer.ts", _page11],
  ["src/pages/api/admin/reviewers.ts", _page12],
  ["src/pages/api/apply.ts", _page13],
  ["src/pages/api/assignments/[id]/grade.ts", _page14],
  ["src/pages/api/assignments/[id]/submissions.ts", _page15],
  ["src/pages/api/assignments/[id]/submit.ts", _page16],
  ["src/pages/api/assignments/[id].ts", _page17],
  ["src/pages/api/assignments/index.ts", _page18],
  ["src/pages/api/cohorts/[id]/enroll.ts", _page19],
  ["src/pages/api/cohorts/[id]/schedule.ts", _page20],
  ["src/pages/api/cohorts/[id].ts", _page21],
  ["src/pages/api/cohorts.ts", _page22],
  ["src/pages/api/contact.ts", _page23],
  ["src/pages/api/content/media.ts", _page24],
  ["src/pages/api/discussions/[id]/moderate.ts", _page25],
  ["src/pages/api/discussions/[id]/reply.ts", _page26],
  ["src/pages/api/discussions.ts", _page27],
  ["src/pages/api/enroll.ts", _page28],
  ["src/pages/api/enroll-cohort.ts", _page29],
  ["src/pages/api/quizzes/[id]/attempts/[attemptId]/save.ts", _page30],
  ["src/pages/api/quizzes/[id]/attempts/[attemptId]/submit.ts", _page31],
  ["src/pages/api/quizzes/[id]/attempts/[attemptId]/index.ts", _page32],
  ["src/pages/api/quizzes/[id]/start.ts", _page33],
  ["src/pages/api/quizzes/[id]/index.ts", _page34],
  ["src/pages/api/quizzes/index.ts", _page35],
  ["src/pages/api/submissions/[id]/download.ts", _page36],
  ["src/pages/api/supabase-webhook.ts", _page37],
  ["src/pages/api/teacher/cohort-analytics.ts", _page38],
  ["src/pages/api/users/search.ts", _page39],
  ["src/pages/application-status.astro", _page40],
  ["src/pages/apply.astro", _page41],
  ["src/pages/assignments/[id]/submissions/[submissionId].astro", _page42],
  ["src/pages/assignments/[id].astro", _page43],
  ["src/pages/assignments/index.astro", _page44],
  ["src/pages/certificates/index.astro", _page45],
  ["src/pages/contact.astro", _page46],
  ["src/pages/courses/[slug].astro", _page47],
  ["src/pages/courses.astro", _page48],
  ["src/pages/dashboard.astro", _page49],
  ["src/pages/faq.astro", _page50],
  ["src/pages/forgot-password.astro", _page51],
  ["src/pages/framework.astro", _page52],
  ["src/pages/lessons/[slug].astro", _page53],
  ["src/pages/login.astro", _page54],
  ["src/pages/notifications/preferences.astro", _page55],
  ["src/pages/payment/canceled.astro", _page56],
  ["src/pages/payment/success.astro", _page57],
  ["src/pages/pricing.astro", _page58],
  ["src/pages/programs.astro", _page59],
  ["src/pages/quizzes/[id]/attempts.astro", _page60],
  ["src/pages/quizzes/[id]/results/[attemptId].astro", _page61],
  ["src/pages/quizzes/[id]/take.astro", _page62],
  ["src/pages/reset-password.astro", _page63],
  ["src/pages/teacher/analytics.astro", _page64],
  ["src/pages/teacher/cohorts/[id].astro", _page65],
  ["src/pages/teacher/courses.astro", _page66],
  ["src/pages/teacher/progress.astro", _page67],
  ["src/pages/tracks.astro", _page68],
  ["src/pages/verify/[code].astro", _page69],
  ["src/pages/index.astro", _page70]
]);
const _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  actions: () => import("./noop-entrypoint.mjs"),
  middleware: () => import("./_astro-internal_middleware.mjs")
});
const _args = {
  "middlewareSecret": "de3a8fb1-68be-4afb-9232-ef79055dcbcc",
  "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = "start";
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
