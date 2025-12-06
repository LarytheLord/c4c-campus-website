import { d as defineMiddleware, s as sequence } from "./assets/index.D6QOgjfN.js";
import { createClient } from "@supabase/supabase-js";
import "es-module-lexer";
import "./assets/astro-designed-error-pages.CM3F-1rV.js";
import "./assets/astro/server.B91yieF7.js";
import "clsx";
import "cookie";
function getCacheHeaders(maxAge, staleWhileRevalidate) {
  return {
    "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    "Vary": "Accept, Accept-Encoding",
    "CDN-Cache-Control": `max-age=${maxAge * 2}`
  };
}
function getNoCacheHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Vary": "Accept, Accept-Encoding"
  };
}
const CACHE_CONFIG = {
  // Public, static data - long cache
  public: {
    maxAge: 3600,
    // 1 hour
    staleWhileRevalidate: 7200
    // 2 hours
  },
  // User-specific data - short cache
  private: {
    maxAge: 300,
    // 5 minutes
    staleWhileRevalidate: 600
    // 10 minutes
  },
  // Real-time data - minimal cache
  realtime: {
    maxAge: 30,
    // 30 seconds
    staleWhileRevalidate: 60
    // 1 minute
  },
  // No cache for sensitive operations
  noCache: {}
};
function getCacheStrategy(url) {
  const path = url.pathname;
  if (path.includes("/apply") || path.includes("/enroll") || path.includes("/update")) {
    return "noCache";
  }
  if (path.includes("/dashboard") || path.includes("/progress") || path.includes("/admin")) {
    return "private";
  }
  if (path.includes("/discussions") || path.includes("/analytics")) {
    return "realtime";
  }
  return "public";
}
function generateETag(data) {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `"${hash.toString(36)}"`;
}
const cacheMiddleware = async (context, next) => {
  const { request, url } = context;
  if (!url.pathname.startsWith("/api/")) {
    return next();
  }
  const strategy = getCacheStrategy(url);
  const response = await next();
  if (!response.ok) {
    return response;
  }
  if (strategy === "noCache") {
    const headers = new Headers(response.headers);
    Object.entries(getNoCacheHeaders()).forEach(([key, value]) => {
      headers.set(key, value);
    });
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  if (request.method === "GET") {
    const config = CACHE_CONFIG[strategy];
    const headers = new Headers(response.headers);
    Object.entries(getCacheHeaders(config.maxAge, config.staleWhileRevalidate)).forEach(([key, value]) => {
      headers.set(key, value);
    });
    try {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      const etag = generateETag(data);
      headers.set("ETag", etag);
      const ifNoneMatch = request.headers.get("If-None-Match");
      if (ifNoneMatch === etag) {
        return new Response(null, {
          status: 304,
          statusText: "Not Modified",
          headers
        });
      }
    } catch (e) {
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  return response;
};
const compressionMiddleware = async (context, next) => {
  const response = await next();
  context.request.headers.get("Accept-Encoding") || "";
  if (response.headers.has("Content-Encoding")) {
    return response;
  }
  if (!response.headers.has("Content-Type")) {
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "application/json");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  return response;
};
const corsMiddleware = async (context, next) => {
  const { request, url } = context;
  if (!url.pathname.startsWith("/api/")) {
    return next();
  }
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
function formatLog(level, message, meta) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}
function log(level, message, meta) {
  const formatted = formatLog(level, message, meta);
  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}
const logger = {
  /** Log debug message (development only) */
  debug: (message, meta) => log("debug", message, meta),
  /** Log informational message */
  info: (message, meta) => log("info", message, meta),
  /** Log warning message */
  warn: (message, meta) => log("warn", message, meta),
  /** Log error message */
  error: (message, meta) => log("error", message, meta)
};
function logSecurityEvent(eventType, data) {
  const securityData = {
    eventType,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...data
  };
  logger.warn(`SECURITY_EVENT: ${eventType}`, securityData);
}
const ADMIN_ROUTES = /^\/admin(\/.*)?$/;
const TEACHER_ROUTES = /^\/teacher(\/.*)?$/;
const AUTH_REQUIRED_ROUTES = /^\/dashboard$/;
const onRequest$2 = defineMiddleware(async (context, next) => {
  const { request, redirect, locals } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname.startsWith("/api/") || pathname.startsWith("/_astro/") || pathname.startsWith("/login") || pathname.startsWith("/apply") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password") || pathname === "/" || pathname.startsWith("/programs") || pathname.startsWith("/about") || pathname.startsWith("/faq") || pathname.startsWith("/framework") || pathname.startsWith("/contact") || pathname.startsWith("/courses") || pathname.startsWith("/pricing") || pathname.startsWith("/tracks") || pathname.startsWith("/application-status")) {
    return next();
  }
  const supabaseUrl = "https://auyysgeurtnpidppebqj.supabase.co";
  const supabaseAnonKey = "***REMOVED***";
  const cookies = request.headers.get("cookie") || "";
  const authTokenMatch = cookies.match(/sb-[^=]+-auth-token=([^;]+)/);
  if (!authTokenMatch) {
    logger.debug("No auth token found", { pathname });
    return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: cookies
      }
    }
  });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    logger.debug("Invalid session", { pathname, error: sessionError?.message });
    return redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }
  const user = session.user;
  logger.debug("User accessing route", { email: user.email, pathname });
  if (ADMIN_ROUTES.test(pathname)) {
    const { data: application, error: appError } = await supabase.from("applications").select("role").eq("user_id", user.id).single();
    if (appError || !application || application.role !== "admin") {
      logSecurityEvent("UNAUTHORIZED_ADMIN_ACCESS", {
        user_id: user.id,
        email: user.email,
        path: pathname,
        role: application?.role || "none"
      });
      return redirect("/dashboard?error=unauthorized");
    }
    logger.info("Admin access granted", { email: user.email, pathname });
    locals.user = user;
    locals.role = "admin";
    return next();
  }
  if (TEACHER_ROUTES.test(pathname)) {
    const { data: application, error: appError } = await supabase.from("applications").select("role").eq("user_id", user.id).single();
    const hasAccess = application && (application.role === "teacher" || application.role === "admin");
    if (appError || !hasAccess) {
      logSecurityEvent("UNAUTHORIZED_TEACHER_ACCESS", {
        user_id: user.id,
        email: user.email,
        path: pathname,
        role: application?.role || "none"
      });
      return redirect("/dashboard?error=unauthorized");
    }
    logger.info("Teacher access granted", { email: user.email, pathname, role: application.role });
    locals.user = user;
    locals.role = application.role;
    return next();
  }
  if (AUTH_REQUIRED_ROUTES.test(pathname)) {
    logger.debug("Authenticated access granted", { email: user.email, pathname });
    locals.user = user;
    return next();
  }
  return next();
});
const securityMiddleware = defineMiddleware(async (context, next) => {
  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.google.com https://*.googleapis.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://*.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://*.google.com; frame-src 'self' https://www.google.com https://maps.google.com; frame-ancestors 'self';"
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});
const performanceMiddleware = defineMiddleware(async (context, next) => {
  const startTime = Date.now();
  const response = await next();
  const endTime = Date.now();
  const duration = endTime - startTime;
  const headers = new Headers(response.headers);
  headers.set("Server-Timing", `total;dur=${duration}`);
  if (duration > 1e3) {
    console.warn(`[Performance] Slow request: ${context.url.pathname} took ${duration}ms`);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
});
const staticAssetMiddleware = defineMiddleware(async (context, next) => {
  const { url } = context;
  const isStaticAsset = url.pathname.startsWith("/_astro/") || url.pathname.match(/\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/);
  if (isStaticAsset) {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  return next();
});
const onRequest$1 = sequence(
  performanceMiddleware,
  corsMiddleware,
  onRequest$2,
  staticAssetMiddleware,
  cacheMiddleware,
  compressionMiddleware,
  securityMiddleware
);
const onRequest = sequence(
  onRequest$1
);
export {
  onRequest
};
