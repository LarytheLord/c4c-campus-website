import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, ak as Fragment$1 } from "../assets/astro/server.B91yieF7.js";
import { $ as $$BaseLayout } from "../assets/BaseLayout.CfYIT7u8.js";
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { renderers } from "../renderers.mjs";
function CertificateCard({ certificate }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const certData = certificate.certificate_data || {};
  const courseName = certificate.course_title || certData.course_name || "Course";
  const completionDate = new Date(certificate.completion_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(certificate.download_url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate-${certificate.certificate_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  const handleShare = () => {
    const verificationUrl = `${window.location.origin}/verify/${certificate.verification_code}`;
    if (navigator.share) {
      navigator.share({
        title: `${courseName} Certificate`,
        text: `I completed ${courseName} at C4C Campus!`,
        url: verificationUrl
      }).catch((err) => console.log("Share failed:", err));
    } else {
      navigator.clipboard.writeText(verificationUrl).then(() => {
        alert("Verification link copied to clipboard!");
      });
    }
  };
  const handleCopyVerificationCode = () => {
    navigator.clipboard.writeText(certificate.verification_code).then(() => {
      alert("Verification code copied to clipboard!");
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-green-50 to-white p-8 border-b border-gray-200", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-block p-4 bg-white rounded-full shadow-sm mb-4", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "w-12 h-12 text-green-600",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            }
          )
        }
      ) }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: courseName }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600", children: "Certificate of Completion" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Certificate Code:" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold text-gray-900", children: certificate.certificate_code })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Completion Date:" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900", children: completionDate })
        ] }),
        certData.hours && /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Course Hours:" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-gray-900", children: [
            certData.hours,
            " hours"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start text-sm pt-2 border-t border-gray-100", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Verification Code:" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleCopyVerificationCode,
              className: "font-mono text-xs text-blue-600 hover:text-blue-800 underline text-right break-all max-w-[200px]",
              title: "Click to copy",
              children: [
                certificate.verification_code.substring(0, 16),
                "..."
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-3", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDownload,
            disabled: isDownloading,
            className: "flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            children: isDownloading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    className: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "4",
                    fill: "none"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "path",
                  {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  }
                )
              ] }),
              "Downloading..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "w-4 h-4",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    }
                  )
                }
              ),
              "Download PDF"
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleShare,
            className: "px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2",
            title: "Share certificate",
            children: [
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "w-4 h-4",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: 2,
                      d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Share" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: `/verify/${certificate.verification_code}`,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1",
          children: [
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: "w-4 h-4",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  }
                )
              }
            ),
            "Verify Certificate Authenticity"
          ]
        }
      ) })
    ] })
  ] });
}
const $$Astro = createAstro("https://c4ccampus.org");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const accessToken = Astro2.cookies.get("sb-access-token")?.value;
  const refreshToken = Astro2.cookies.get("sb-refresh-token")?.value;
  if (!accessToken) {
    return Astro2.redirect("/login?redirect=/certificates");
  }
  let certificates = [];
  let error = null;
  try {
    const apiUrl = new URL("/api/certificates", Astro2.url.origin);
    const response = await fetch(apiUrl.toString(), {
      headers: {
        "Cookie": `sb-access-token=${accessToken}; sb-refresh-token=${refreshToken}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      certificates = data.certificates || [];
    } else {
      error = "Failed to load certificates";
    }
  } catch (err) {
    console.error("Error fetching certificates:", err);
    error = "Failed to load certificates";
  }
  const pageTitle = "My Certificates";
  const pageDescription = "View and download your course completion certificates";
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": pageTitle, "description": pageDescription }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-50 py-12"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Header --> <div class="mb-8"> <div class="flex items-center gap-3 mb-4"> <a href="/dashboard" class="text-gray-600 hover:text-gray-900 transition-colors"> <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round"${addAttribute(2, "stroke-width")} d="M15 19l-7-7 7-7"></path> </svg> </a> <h1 class="text-3xl font-bold text-gray-900">My Certificates</h1> </div> <p class="text-gray-600">
View, download, and share your course completion certificates
</p> </div> ${error && renderTemplate`<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"> <p class="font-medium">${error}</p> <p class="text-sm mt-1">
Please try refreshing the page or contact support if the problem persists.
</p> </div>`} ${!error && certificates.length === 0 && renderTemplate`<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"> <div class="inline-block p-6 bg-gray-100 rounded-full mb-6"> <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round"${addAttribute(2, "stroke-width")} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path> </svg> </div> <h2 class="text-2xl font-bold text-gray-900 mb-2">
No Certificates Yet
</h2> <p class="text-gray-600 mb-6">
Complete your first course to earn a certificate!
</p> <a href="/courses" class="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
Browse Courses
</a> </div>`} ${!error && certificates.length > 0 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment$1, {}, { "default": async ($$result3) => renderTemplate`  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex items-center gap-4"> <div class="p-3 bg-green-100 rounded-lg"> <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round"${addAttribute(2, "stroke-width")} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path> </svg> </div> <div> <p class="text-2xl font-bold text-gray-900">${certificates.length}</p> <p class="text-sm text-gray-600">Certificates Earned</p> </div> </div> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex items-center gap-4"> <div class="p-3 bg-blue-100 rounded-lg"> <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round"${addAttribute(2, "stroke-width")} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path> </svg> </div> <div> <p class="text-2xl font-bold text-gray-900"> ${certificates.reduce((sum, cert) => {
    const hours = cert.certificate_data?.hours || 0;
    return sum + hours;
  }, 0)} </p> <p class="text-sm text-gray-600">Total Course Hours</p> </div> </div> </div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> <div class="flex items-center gap-4"> <div class="p-3 bg-purple-100 rounded-lg"> <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path stroke-linecap="round" stroke-linejoin="round"${addAttribute(2, "stroke-width")} d="M13 10V3L4 14h7v7l9-11h-7z"></path> </svg> </div> <div> <p class="text-2xl font-bold text-gray-900"> ${new Date(certificates[0].completion_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} </p> <p class="text-sm text-gray-600">Latest Certificate</p> </div> </div> </div> </div>  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${certificates.map((certificate) => renderTemplate`${renderComponent($$result3, "CertificateCard", CertificateCard, { "certificate": certificate, "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/a0/Desktop/c4c-website/src/components/certificates/CertificateCard", "client:component-export": "default" })}`)} </div> ` })}`} <!-- Help Section --> <div class="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6"> <h3 class="text-lg font-semibold text-gray-900 mb-3">
About Your Certificates
</h3> <ul class="space-y-2 text-sm text-gray-700"> <li class="flex items-start gap-2"> <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> <span>Certificates are automatically generated when you complete all lessons in a course</span> </li> <li class="flex items-start gap-2"> <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> <span>Each certificate includes a unique verification code for authenticity</span> </li> <li class="flex items-start gap-2"> <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> <span>Share your achievements on LinkedIn or add certificates to your portfolio</span> </li> <li class="flex items-start gap-2"> <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path> </svg> <span>Download PDF copies for your records or to share with employers</span> </li> </ul> </div> </div> </div> ` })}`;
}, "/Users/a0/Desktop/c4c-website/src/pages/certificates/index.astro", void 0);
const $$file = "/Users/a0/Desktop/c4c-website/src/pages/certificates/index.astro";
const $$url = "/certificates";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page,
  renderers
};
