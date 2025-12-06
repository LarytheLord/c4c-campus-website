var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _manifest, _manifestData, _logger, _baseWithoutTrailingSlash, _pipeline, _adapterLogger, _App_instances, createPipeline_fn, getPathnameFromRequest_fn, computePathnameFromDomain_fn, redirectTrailingSlash_fn, renderError_fn, mergeResponses_fn, getDefaultStatusCode_fn;
import { a0 as ROUTE_TYPE_HEADER, v as REROUTE_DIRECTIVE_HEADER, D as DEFAULT_404_COMPONENT, A as AstroError, X as ActionNotFoundError, a7 as clientAddressSymbol, am as LocalsNotAnObject, an as REROUTABLE_STATUS_CODES, ab as responseSentSymbol, ao as nodeRequestAbortControllerCleanupSymbol } from "./astro/server.B91yieF7.js";
import "clsx";
import "cookie";
import { D as DEFAULT_404_ROUTE, c as default404Instance, e as ensure404Route } from "./astro-designed-error-pages.CM3F-1rV.js";
import "es-module-lexer";
import buffer from "node:buffer";
import crypto$1 from "node:crypto";
import { Http2ServerResponse } from "node:http2";
import { f as fileExtension, j as joinPaths, s as slash, p as prependForwardSlash, r as removeTrailingForwardSlash, a as appendForwardSlash, b as isInternalPath, c as collapseDuplicateTrailingSlashes, h as hasFileExtension } from "./path.DD7MkukS.js";
import { m as matchPattern } from "./index.B9B7JtJn.js";
import { r as requestIs404Or500, i as isRequestServerIsland, n as notFound, a as redirectToFallback, b as redirectToDefaultLocale, c as requestHasLocale, e as normalizeTheLocale, d as defineMiddleware, S as SERVER_ISLAND_COMPONENT, f as SERVER_ISLAND_ROUTE, g as createEndpoint, R as RouteCache, s as sequence, h as findRouteToRewrite, m as matchRoute, j as RenderContext, P as PERSIST_SYMBOL, k as getSetCookiesFromResponse } from "./index.D6QOgjfN.js";
import colors from "picocolors";
import { N as NOOP_MIDDLEWARE_FN } from "./noop-middleware.fpeQugq4.js";
import "@vercel/routing-utils";
import "deterministic-object-hash";
import nodePath from "node:path";
import { builtinModules } from "node:module";
function createI18nMiddleware(i18n, base, trailingSlash, format) {
  if (!i18n) return (_, next) => next();
  const payload = {
    ...i18n,
    trailingSlash,
    base,
    format
  };
  const _redirectToDefaultLocale = redirectToDefaultLocale(payload);
  const _noFoundForNonLocaleRoute = notFound(payload);
  const _requestHasLocale = requestHasLocale(payload.locales);
  const _redirectToFallback = redirectToFallback(payload);
  const prefixAlways = (context, response) => {
    const url = context.url;
    if (url.pathname === base + "/" || url.pathname === base) {
      return _redirectToDefaultLocale(context);
    } else if (!_requestHasLocale(context)) {
      return _noFoundForNonLocaleRoute(context, response);
    }
    return void 0;
  };
  const prefixOtherLocales = (context, response) => {
    let pathnameContainsDefaultLocale = false;
    const url = context.url;
    for (const segment of url.pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, "");
      response.headers.set("Location", newLocation);
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  };
  return async (context, next) => {
    const response = await next();
    const type = response.headers.get(ROUTE_TYPE_HEADER);
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (type !== "page" && type !== "fallback") {
      return response;
    }
    if (requestIs404Or500(context.request, base)) {
      return response;
    }
    if (isRequestServerIsland(context.request, base)) {
      return response;
    }
    const { currentLocale } = context;
    switch (i18n.strategy) {
      // NOTE: theoretically, we should never hit this code path
      case "manual": {
        return response;
      }
      case "domains-prefix-other-locales": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixOtherLocales(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-other-locales": {
        const result = prefixOtherLocales(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always-no-redirect": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = _noFoundForNonLocaleRoute(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-always-no-redirect": {
        const result = _noFoundForNonLocaleRoute(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "pathname-prefix-always": {
        const result = prefixAlways(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlways(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
    }
    return _redirectToFallback(context, response);
  };
}
function localeHasntDomain(i18n, currentLocale) {
  for (const domainLocale of Object.values(i18n.domainLookupTable)) {
    if (domainLocale === currentLocale) {
      return false;
    }
  }
  return true;
}
const NOOP_ACTIONS_MOD = {
  server: {}
};
const FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url, isPrerendered } = context;
    if (isPrerendered) {
      return next();
    }
    if (SAFE_METHODS.includes(request.method)) {
      return next();
    }
    const isSameOrigin = request.headers.get("origin") === url.origin;
    const hasContentType = request.headers.has("content-type");
    if (hasContentType) {
      const formLikeHeader = hasFormLikeHeader(request.headers.get("content-type"));
      if (formLikeHeader && !isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    } else {
      if (!isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    }
    return next();
  });
}
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}
function createDefaultRoutes(manifest) {
  const root = new URL(manifest.hrefRoot);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT
    },
    {
      instance: createEndpoint(manifest),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT
    }
  ];
}
class Pipeline {
  constructor(logger, manifest, runtimeMode, renderers, resolve, serverLike, streaming, adapterName = manifest.adapterName, clientDirectives = manifest.clientDirectives, inlinedScripts = manifest.inlinedScripts, compressHTML = manifest.compressHTML, i18n = manifest.i18n, middleware = manifest.middleware, routeCache = new RouteCache(logger, runtimeMode), site = manifest.site ? new URL(manifest.site) : void 0, defaultRoutes = createDefaultRoutes(manifest), actions = manifest.actions) {
    __publicField(this, "internalMiddleware");
    __publicField(this, "resolvedMiddleware");
    __publicField(this, "resolvedActions");
    this.logger = logger;
    this.manifest = manifest;
    this.runtimeMode = runtimeMode;
    this.renderers = renderers;
    this.resolve = resolve;
    this.serverLike = serverLike;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.actions = actions;
    this.internalMiddleware = [];
    if (i18n?.strategy !== "manual") {
      this.internalMiddleware.push(
        createI18nMiddleware(i18n, manifest.base, manifest.trailingSlash, manifest.buildFormat)
      );
    }
  }
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    } else if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      const internalMiddlewares = [onRequest];
      if (this.manifest.checkOrigin) {
        internalMiddlewares.unshift(createOriginCheckMiddleware());
      }
      this.resolvedMiddleware = sequence(...internalMiddlewares);
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
  setActions(actions) {
    this.resolvedActions = actions;
  }
  async getActions() {
    if (this.resolvedActions) {
      return this.resolvedActions;
    } else if (this.actions) {
      return await this.actions();
    }
    return NOOP_ACTIONS_MOD;
  }
  async getAction(path) {
    const pathKeys = path.split(".").map((key) => decodeURIComponent(key));
    let { server } = await this.getActions();
    if (!server || !(typeof server === "object")) {
      throw new TypeError(
        `Expected \`server\` export in actions file to be an object. Received ${typeof server}.`
      );
    }
    for (const key of pathKeys) {
      if (!(key in server)) {
        throw new AstroError({
          ...ActionNotFoundError,
          message: ActionNotFoundError.message(pathKeys.join("."))
        });
      }
      server = server[key];
    }
    if (typeof server !== "function") {
      throw new TypeError(
        `Expected handler for action ${pathKeys.join(".")} to be a function. Received ${typeof server}.`
      );
    }
    return server;
  }
}
const RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
  renderers: []
};
const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(colors.bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return colors.red(prefix.join(" "));
  }
  if (level === "warn") {
    return colors.yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return colors.dim(prefix[0]);
  }
  return colors.dim(prefix[0]) + " " + colors.blue(prefix.splice(1).join(" "));
}
class Logger {
  constructor(options) {
    __publicField(this, "options");
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  constructor(logging, label) {
    __publicField(this, "options");
    __publicField(this, "label");
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}
const consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) {
      dest = console.info;
    }
    if (event.label === "SKIP_FORMAT") {
      dest(event.message);
    } else {
      dest(getEventPrefix(event) + " " + event.message);
    }
    return true;
  }
};
function getAssetsPrefix(fileExtension2, assetsPrefix) {
  let prefix = "";
  if (!assetsPrefix) {
    prefix = "";
  } else if (typeof assetsPrefix === "string") {
    prefix = assetsPrefix;
  } else {
    const dotLessFileExtension = fileExtension2.slice(1);
    prefix = assetsPrefix[dotLessFileExtension] || assetsPrefix.fallback;
  }
  return prefix;
}
function createAssetLink(href, base, assetsPrefix, queryParams) {
  let url = "";
  if (assetsPrefix) {
    const pf = getAssetsPrefix(fileExtension(href), assetsPrefix);
    url = joinPaths(pf, slash(href));
  } else if (base) {
    url = prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    url = href;
  }
  return url;
}
function createStylesheetElement(stylesheet, base, assetsPrefix, queryParams) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix, queryParams) {
  return new Set(
    stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix))
  );
}
function createModuleScriptElement(script, base, assetsPrefix, queryParams) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix, queryParams) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}
function redirectTemplate({
  status,
  absoluteLocation,
  relativeLocation,
  from
}) {
  const delay = status === 302 ? 2 : 0;
  return `<!doctype html>
<title>Redirecting to: ${relativeLocation}</title>
<meta http-equiv="refresh" content="${delay};url=${relativeLocation}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${absoluteLocation}">
<body>
	<a href="${relativeLocation}">Redirecting ${from ? `from <code>${from}</code> ` : ""}to <code>${relativeLocation}</code></a>
</body>`;
}
class AppPipeline extends Pipeline {
  static create({
    logger,
    manifest,
    runtimeMode,
    renderers,
    resolve,
    serverLike,
    streaming,
    defaultRoutes
  }) {
    const pipeline = new AppPipeline(
      logger,
      manifest,
      runtimeMode,
      renderers,
      resolve,
      serverLike,
      streaming,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      defaultRoutes
    );
    return pipeline;
  }
  headElements(routeData) {
    const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? []);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {
  }
  async getComponentByRoute(routeData) {
    const module = await this.getModuleForRoute(routeData);
    return module.page();
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base,
      outDir: this.serverLike ? this.manifest.buildClientDir : this.manifest.outDir
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { newUrl, pathname, componentInstance, routeData };
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance),
          renderers: []
        };
      }
    }
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        return await importComponentInstance();
      } else if (this.manifest.pageModule) {
        return this.manifest.pageModule;
      }
      throw new Error(
        "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
      );
    }
  }
}
const _App = class _App {
  constructor(manifest, streaming = true) {
    __privateAdd(this, _App_instances);
    __privateAdd(this, _manifest);
    __privateAdd(this, _manifestData);
    __privateAdd(this, _logger, new Logger({
      dest: consoleLogDestination,
      level: "info"
    }));
    __privateAdd(this, _baseWithoutTrailingSlash);
    __privateAdd(this, _pipeline);
    __privateAdd(this, _adapterLogger);
    __privateSet(this, _manifest, manifest);
    __privateSet(this, _manifestData, {
      routes: manifest.routes.map((route) => route.routeData)
    });
    ensure404Route(__privateGet(this, _manifestData));
    __privateSet(this, _baseWithoutTrailingSlash, removeTrailingForwardSlash(__privateGet(this, _manifest).base));
    __privateSet(this, _pipeline, __privateMethod(this, _App_instances, createPipeline_fn).call(this, streaming));
    __privateSet(this, _adapterLogger, new AstroIntegrationLogger(
      __privateGet(this, _logger).options,
      __privateGet(this, _manifest).adapterName
    ));
  }
  getAdapterLogger() {
    return __privateGet(this, _adapterLogger);
  }
  getAllowedDomains() {
    return __privateGet(this, _manifest).allowedDomains;
  }
  get manifest() {
    return __privateGet(this, _manifest);
  }
  set manifest(value) {
    __privateSet(this, _manifest, value);
  }
  matchesAllowedDomains(forwardedHost, protocol) {
    return _App.validateForwardedHost(forwardedHost, __privateGet(this, _manifest).allowedDomains, protocol);
  }
  static validateForwardedHost(forwardedHost, allowedDomains, protocol) {
    if (!allowedDomains || allowedDomains.length === 0) {
      return false;
    }
    try {
      const testUrl = new URL(`${protocol || "https"}://${forwardedHost}`);
      return allowedDomains.some((pattern) => {
        return matchPattern(testUrl, pattern);
      });
    } catch {
      return false;
    }
  }
  /**
   * Validate a hostname by rejecting any with path separators.
   * Prevents path injection attacks. Invalid hostnames return undefined.
   */
  static sanitizeHost(hostname) {
    if (!hostname) return void 0;
    if (/[/\\]/.test(hostname)) return void 0;
    return hostname;
  }
  /**
   * Validate forwarded headers (proto, host, port) against allowedDomains.
   * Returns validated values or undefined for rejected headers.
   * Uses strict defaults: http/https only for proto, rejects port if not in allowedDomains.
   */
  static validateForwardedHeaders(forwardedProtocol, forwardedHost, forwardedPort, allowedDomains) {
    const result = {};
    if (forwardedProtocol) {
      if (allowedDomains && allowedDomains.length > 0) {
        const hasProtocolPatterns = allowedDomains.some(
          (pattern) => pattern.protocol !== void 0
        );
        if (hasProtocolPatterns) {
          try {
            const testUrl = new URL(`${forwardedProtocol}://example.com`);
            const isAllowed = allowedDomains.some((pattern) => matchPattern(testUrl, pattern));
            if (isAllowed) {
              result.protocol = forwardedProtocol;
            }
          } catch {
          }
        } else if (/^https?$/.test(forwardedProtocol)) {
          result.protocol = forwardedProtocol;
        }
      } else if (/^https?$/.test(forwardedProtocol)) {
        result.protocol = forwardedProtocol;
      }
    }
    if (forwardedPort && allowedDomains && allowedDomains.length > 0) {
      const hasPortPatterns = allowedDomains.some((pattern) => pattern.port !== void 0);
      if (hasPortPatterns) {
        const isAllowed = allowedDomains.some((pattern) => pattern.port === forwardedPort);
        if (isAllowed) {
          result.port = forwardedPort;
        }
      }
    }
    if (forwardedHost && forwardedHost.length > 0 && allowedDomains && allowedDomains.length > 0) {
      const protoForValidation = result.protocol || "https";
      const sanitized = _App.sanitizeHost(forwardedHost);
      if (sanitized) {
        try {
          const hostnameOnly = sanitized.split(":")[0];
          const portFromHost = sanitized.includes(":") ? sanitized.split(":")[1] : void 0;
          const portForValidation = result.port || portFromHost;
          const hostWithPort = portForValidation ? `${hostnameOnly}:${portForValidation}` : hostnameOnly;
          const testUrl = new URL(`${protoForValidation}://${hostWithPort}`);
          const isAllowed = allowedDomains.some((pattern) => matchPattern(testUrl, pattern));
          if (isAllowed) {
            result.host = sanitized;
          }
        } catch {
        }
      }
    }
    return result;
  }
  set setManifestData(newManifestData) {
    __privateSet(this, _manifestData, newManifestData);
  }
  removeBase(pathname) {
    if (pathname.startsWith(__privateGet(this, _manifest).base)) {
      return pathname.slice(__privateGet(this, _baseWithoutTrailingSlash).length + 1);
    }
    return pathname;
  }
  /**
   * Given a `Request`, it returns the `RouteData` that matches its `pathname`. By default, prerendered
   * routes aren't returned, even if they are matched.
   *
   * When `allowPrerenderedRoutes` is `true`, the function returns matched prerendered routes too.
   * @param request
   * @param allowPrerenderedRoutes
   */
  match(request, allowPrerenderedRoutes = false) {
    const url = new URL(request.url);
    if (__privateGet(this, _manifest).assets.has(url.pathname)) return void 0;
    let pathname = __privateMethod(this, _App_instances, computePathnameFromDomain_fn).call(this, request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    let routeData = matchRoute(decodeURI(pathname), __privateGet(this, _manifestData));
    if (!routeData) return void 0;
    if (allowPrerenderedRoutes) {
      return routeData;
    } else if (routeData.prerender) {
      return void 0;
    }
    return routeData;
  }
  async render(request, renderOptions) {
    let routeData;
    let locals;
    let clientAddress;
    let addCookieHeader;
    const url = new URL(request.url);
    const redirect = __privateMethod(this, _App_instances, redirectTrailingSlash_fn).call(this, url.pathname);
    const prerenderedErrorPageFetch = renderOptions?.prerenderedErrorPageFetch ?? fetch;
    if (redirect !== url.pathname) {
      const status = request.method === "GET" ? 301 : 308;
      return new Response(
        redirectTemplate({
          status,
          relativeLocation: url.pathname,
          absoluteLocation: redirect,
          from: request.url
        }),
        {
          status,
          headers: {
            location: redirect + url.search
          }
        }
      );
    }
    addCookieHeader = renderOptions?.addCookieHeader;
    clientAddress = renderOptions?.clientAddress ?? Reflect.get(request, clientAddressSymbol);
    routeData = renderOptions?.routeData;
    locals = renderOptions?.locals;
    if (routeData) {
      __privateGet(this, _logger).debug(
        "router",
        "The adapter " + __privateGet(this, _manifest).adapterName + " provided a custom RouteData for ",
        request.url
      );
      __privateGet(this, _logger).debug("router", "RouteData:\n" + routeData);
    }
    if (locals) {
      if (typeof locals !== "object") {
        const error2 = new AstroError(LocalsNotAnObject);
        __privateGet(this, _logger).error(null, error2.stack);
        return __privateMethod(this, _App_instances, renderError_fn).call(this, request, {
          status: 500,
          error: error2,
          clientAddress,
          prerenderedErrorPageFetch
        });
      }
    }
    if (!routeData) {
      routeData = this.match(request);
      __privateGet(this, _logger).debug("router", "Astro matched the following route for " + request.url);
      __privateGet(this, _logger).debug("router", "RouteData:\n" + routeData);
    }
    if (!routeData) {
      routeData = __privateGet(this, _manifestData).routes.find(
        (route) => route.component === "404.astro" || route.component === DEFAULT_404_COMPONENT
      );
    }
    if (!routeData) {
      __privateGet(this, _logger).debug("router", "Astro hasn't found routes that match " + request.url);
      __privateGet(this, _logger).debug("router", "Here's the available routes:\n", __privateGet(this, _manifestData));
      return __privateMethod(this, _App_instances, renderError_fn).call(this, request, {
        locals,
        status: 404,
        clientAddress,
        prerenderedErrorPageFetch
      });
    }
    const pathname = __privateMethod(this, _App_instances, getPathnameFromRequest_fn).call(this, request);
    const defaultStatus = __privateMethod(this, _App_instances, getDefaultStatusCode_fn).call(this, routeData, pathname);
    let response;
    let session;
    try {
      const mod = await __privateGet(this, _pipeline).getModuleForRoute(routeData);
      const renderContext = await RenderContext.create({
        pipeline: __privateGet(this, _pipeline),
        locals,
        pathname,
        request,
        routeData,
        status: defaultStatus,
        clientAddress
      });
      session = renderContext.session;
      response = await renderContext.render(await mod.page());
    } catch (err) {
      __privateGet(this, _logger).error(null, err.stack || err.message || String(err));
      return __privateMethod(this, _App_instances, renderError_fn).call(this, request, {
        locals,
        status: 500,
        error: err,
        clientAddress,
        prerenderedErrorPageFetch
      });
    } finally {
      await session?.[PERSIST_SYMBOL]();
    }
    if (REROUTABLE_STATUS_CODES.includes(response.status) && response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no") {
      return __privateMethod(this, _App_instances, renderError_fn).call(this, request, {
        locals,
        response,
        status: response.status,
        // We don't have an error to report here. Passing null means we pass nothing intentionally
        // while undefined means there's no error
        error: response.status === 500 ? null : void 0,
        clientAddress,
        prerenderedErrorPageFetch
      });
    }
    if (response.headers.has(REROUTE_DIRECTIVE_HEADER)) {
      response.headers.delete(REROUTE_DIRECTIVE_HEADER);
    }
    if (addCookieHeader) {
      for (const setCookieHeaderValue of _App.getSetCookieFromResponse(response)) {
        response.headers.append("set-cookie", setCookieHeaderValue);
      }
    }
    Reflect.set(response, responseSentSymbol, true);
    return response;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
};
_manifest = new WeakMap();
_manifestData = new WeakMap();
_logger = new WeakMap();
_baseWithoutTrailingSlash = new WeakMap();
_pipeline = new WeakMap();
_adapterLogger = new WeakMap();
_App_instances = new WeakSet();
/**
 * Creates a pipeline by reading the stored manifest
 *
 * @param streaming
 * @private
 */
createPipeline_fn = function(streaming = false) {
  return AppPipeline.create({
    logger: __privateGet(this, _logger),
    manifest: __privateGet(this, _manifest),
    runtimeMode: "production",
    renderers: __privateGet(this, _manifest).renderers,
    defaultRoutes: createDefaultRoutes(__privateGet(this, _manifest)),
    resolve: async (specifier) => {
      if (!(specifier in __privateGet(this, _manifest).entryModules)) {
        throw new Error(`Unable to resolve [${specifier}]`);
      }
      const bundlePath = __privateGet(this, _manifest).entryModules[specifier];
      if (bundlePath.startsWith("data:") || bundlePath.length === 0) {
        return bundlePath;
      } else {
        return createAssetLink(bundlePath, __privateGet(this, _manifest).base, __privateGet(this, _manifest).assetsPrefix);
      }
    },
    serverLike: true,
    streaming
  });
};
/**
 * It removes the base from the request URL, prepends it with a forward slash and attempts to decoded it.
 *
 * If the decoding fails, it logs the error and return the pathname as is.
 * @param request
 * @private
 */
getPathnameFromRequest_fn = function(request) {
  const url = new URL(request.url);
  const pathname = prependForwardSlash(this.removeBase(url.pathname));
  try {
    return decodeURI(pathname);
  } catch (e) {
    this.getAdapterLogger().error(e.toString());
    return pathname;
  }
};
computePathnameFromDomain_fn = function(request) {
  let pathname = void 0;
  const url = new URL(request.url);
  if (__privateGet(this, _manifest).i18n && (__privateGet(this, _manifest).i18n.strategy === "domains-prefix-always" || __privateGet(this, _manifest).i18n.strategy === "domains-prefix-other-locales" || __privateGet(this, _manifest).i18n.strategy === "domains-prefix-always-no-redirect")) {
    const validated = _App.validateForwardedHeaders(
      request.headers.get("X-Forwarded-Proto") ?? void 0,
      request.headers.get("X-Forwarded-Host") ?? void 0,
      request.headers.get("X-Forwarded-Port") ?? void 0,
      __privateGet(this, _manifest).allowedDomains
    );
    let protocol = validated.protocol ? validated.protocol + ":" : url.protocol;
    let host = validated.host ?? request.headers.get("Host");
    if (host && protocol) {
      host = host.split(":")[0];
      try {
        let locale;
        const hostAsUrl = new URL(`${protocol}//${host}`);
        for (const [domainKey, localeValue] of Object.entries(
          __privateGet(this, _manifest).i18n.domainLookupTable
        )) {
          const domainKeyAsUrl = new URL(domainKey);
          if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
            locale = localeValue;
            break;
          }
        }
        if (locale) {
          pathname = prependForwardSlash(
            joinPaths(normalizeTheLocale(locale), this.removeBase(url.pathname))
          );
          if (url.pathname.endsWith("/")) {
            pathname = appendForwardSlash(pathname);
          }
        }
      } catch (e) {
        __privateGet(this, _logger).error(
          "router",
          `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`
        );
        __privateGet(this, _logger).error("router", `Error: ${e}`);
      }
    }
  }
  return pathname;
};
redirectTrailingSlash_fn = function(pathname) {
  const { trailingSlash } = __privateGet(this, _manifest);
  if (pathname === "/" || isInternalPath(pathname)) {
    return pathname;
  }
  const path = collapseDuplicateTrailingSlashes(pathname, trailingSlash !== "never");
  if (path !== pathname) {
    return path;
  }
  if (trailingSlash === "ignore") {
    return pathname;
  }
  if (trailingSlash === "always" && !hasFileExtension(pathname)) {
    return appendForwardSlash(pathname);
  }
  if (trailingSlash === "never") {
    return removeTrailingForwardSlash(pathname);
  }
  return pathname;
};
renderError_fn = async function(request, {
  locals,
  status,
  response: originalResponse,
  skipMiddleware = false,
  error: error2,
  clientAddress,
  prerenderedErrorPageFetch
}) {
  const errorRoutePath = `/${status}${__privateGet(this, _manifest).trailingSlash === "always" ? "/" : ""}`;
  const errorRouteData = matchRoute(errorRoutePath, __privateGet(this, _manifestData));
  const url = new URL(request.url);
  if (errorRouteData) {
    if (errorRouteData.prerender) {
      const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
      const statusURL = new URL(
        `${__privateGet(this, _baseWithoutTrailingSlash)}/${status}${maybeDotHtml}`,
        url
      );
      if (statusURL.toString() !== request.url) {
        const response2 = await prerenderedErrorPageFetch(statusURL.toString());
        const override = { status, removeContentEncodingHeaders: true };
        return __privateMethod(this, _App_instances, mergeResponses_fn).call(this, response2, originalResponse, override);
      }
    }
    const mod = await __privateGet(this, _pipeline).getModuleForRoute(errorRouteData);
    let session;
    try {
      const renderContext = await RenderContext.create({
        locals,
        pipeline: __privateGet(this, _pipeline),
        middleware: skipMiddleware ? NOOP_MIDDLEWARE_FN : void 0,
        pathname: __privateMethod(this, _App_instances, getPathnameFromRequest_fn).call(this, request),
        request,
        routeData: errorRouteData,
        status,
        props: { error: error2 },
        clientAddress
      });
      session = renderContext.session;
      const response2 = await renderContext.render(await mod.page());
      return __privateMethod(this, _App_instances, mergeResponses_fn).call(this, response2, originalResponse);
    } catch {
      if (skipMiddleware === false) {
        return __privateMethod(this, _App_instances, renderError_fn).call(this, request, {
          locals,
          status,
          response: originalResponse,
          skipMiddleware: true,
          clientAddress,
          prerenderedErrorPageFetch
        });
      }
    } finally {
      await session?.[PERSIST_SYMBOL]();
    }
  }
  const response = __privateMethod(this, _App_instances, mergeResponses_fn).call(this, new Response(null, { status }), originalResponse);
  Reflect.set(response, responseSentSymbol, true);
  return response;
};
mergeResponses_fn = function(newResponse, originalResponse, override) {
  let newResponseHeaders = newResponse.headers;
  if (override?.removeContentEncodingHeaders) {
    newResponseHeaders = new Headers(newResponseHeaders);
    newResponseHeaders.delete("Content-Encoding");
    newResponseHeaders.delete("Content-Length");
  }
  if (!originalResponse) {
    if (override !== void 0) {
      return new Response(newResponse.body, {
        status: override.status,
        statusText: newResponse.statusText,
        headers: newResponseHeaders
      });
    }
    return newResponse;
  }
  const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
  try {
    originalResponse.headers.delete("Content-type");
  } catch {
  }
  const mergedHeaders = new Map([
    ...Array.from(newResponseHeaders),
    ...Array.from(originalResponse.headers)
  ]);
  const newHeaders = new Headers();
  for (const [name, value] of mergedHeaders) {
    newHeaders.set(name, value);
  }
  return new Response(newResponse.body, {
    status,
    statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
    // If you're looking at here for possible bugs, it means that it's not a bug.
    // With the middleware, users can meddle with headers, and we should pass to the 404/500.
    // If users see something weird, it's because they are setting some headers they should not.
    //
    // Although, we don't want it to replace the content-type, because the error page must return `text/html`
    headers: newHeaders
  });
};
getDefaultStatusCode_fn = function(routeData, pathname) {
  if (!routeData.pattern.test(pathname)) {
    for (const fallbackRoute of routeData.fallbackRoutes) {
      if (fallbackRoute.pattern.test(pathname)) {
        return 302;
      }
    }
  }
  const route = removeTrailingForwardSlash(routeData.route);
  if (route.endsWith("/404")) return 404;
  if (route.endsWith("/500")) return 500;
  return 200;
};
/**
 * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
 * For example,
 * ```ts
 * for (const cookie_ of App.getSetCookieFromResponse(response)) {
 *     const cookie: string = cookie_
 * }
 * ```
 * @param response The response to read cookies from.
 * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
 */
__publicField(_App, "getSetCookieFromResponse", getSetCookiesFromResponse);
let App = _App;
const createOutgoingHttpHeaders = (headers) => {
  if (!headers) {
    return void 0;
  }
  const nodeHeaders = Object.fromEntries(headers.entries());
  if (Object.keys(nodeHeaders).length === 0) {
    return void 0;
  }
  if (headers.has("set-cookie")) {
    const cookieHeaders = headers.getSetCookie();
    if (cookieHeaders.length > 1) {
      nodeHeaders["set-cookie"] = cookieHeaders;
    }
  }
  return nodeHeaders;
};
function apply() {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", {
      value: crypto$1.webcrypto
    });
  }
  if (!globalThis.File) {
    Object.defineProperty(globalThis, "File", {
      value: buffer.File
    });
  }
}
class NodeApp extends App {
  constructor() {
    super(...arguments);
    __publicField(this, "headersMap");
  }
  setHeadersMap(headers) {
    this.headersMap = headers;
  }
  match(req, allowPrerenderedRoutes = false) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req, {
        skipBody: true,
        allowedDomains: this.manifest.allowedDomains
      });
    }
    return super.match(req, allowPrerenderedRoutes);
  }
  render(req, routeDataOrOptions, maybeLocals) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req, {
        allowedDomains: this.manifest.allowedDomains
      });
    }
    return super.render(req, routeDataOrOptions, maybeLocals);
  }
  /**
   * Converts a NodeJS IncomingMessage into a web standard Request.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   */
  static createRequest(req, {
    skipBody = false,
    allowedDomains = []
  } = {}) {
    const controller = new AbortController();
    const isEncrypted = "encrypted" in req.socket && req.socket.encrypted;
    const getFirstForwardedValue = (multiValueHeader) => {
      return multiValueHeader?.toString()?.split(",").map((e) => e.trim())?.[0];
    };
    const providedProtocol = isEncrypted ? "https" : "http";
    const providedHostname = req.headers.host ?? req.headers[":authority"];
    const validated = App.validateForwardedHeaders(
      getFirstForwardedValue(req.headers["x-forwarded-proto"]),
      getFirstForwardedValue(req.headers["x-forwarded-host"]),
      getFirstForwardedValue(req.headers["x-forwarded-port"]),
      allowedDomains
    );
    const protocol = validated.protocol ?? providedProtocol;
    const sanitizedProvidedHostname = App.sanitizeHost(
      typeof providedHostname === "string" ? providedHostname : void 0
    );
    const hostname = validated.host ?? sanitizedProvidedHostname;
    const port = validated.port;
    let url;
    try {
      const hostnamePort = getHostnamePort(hostname, port);
      url = new URL(`${protocol}://${hostnamePort}${req.url}`);
    } catch {
      const hostnamePort = getHostnamePort(providedHostname, port);
      url = new URL(`${providedProtocol}://${hostnamePort}`);
    }
    const options = {
      method: req.method || "GET",
      headers: makeRequestHeaders(req),
      signal: controller.signal
    };
    const bodyAllowed = options.method !== "HEAD" && options.method !== "GET" && skipBody === false;
    if (bodyAllowed) {
      Object.assign(options, makeRequestBody(req));
    }
    const request = new Request(url, options);
    const socket = getRequestSocket(req);
    if (socket && typeof socket.on === "function") {
      const existingCleanup = getAbortControllerCleanup(req);
      if (existingCleanup) {
        existingCleanup();
      }
      let cleanedUp = false;
      const removeSocketListener = () => {
        if (typeof socket.off === "function") {
          socket.off("close", onSocketClose);
        } else if (typeof socket.removeListener === "function") {
          socket.removeListener("close", onSocketClose);
        }
      };
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        removeSocketListener();
        controller.signal.removeEventListener("abort", cleanup);
        Reflect.deleteProperty(req, nodeRequestAbortControllerCleanupSymbol);
      };
      const onSocketClose = () => {
        cleanup();
        if (!controller.signal.aborted) {
          controller.abort();
        }
      };
      socket.on("close", onSocketClose);
      controller.signal.addEventListener("abort", cleanup, { once: true });
      Reflect.set(req, nodeRequestAbortControllerCleanupSymbol, cleanup);
      if (socket.destroyed) {
        onSocketClose();
      }
    }
    const forwardedClientIp = getFirstForwardedValue(req.headers["x-forwarded-for"]);
    const clientIp = forwardedClientIp || req.socket?.remoteAddress;
    if (clientIp) {
      Reflect.set(request, clientAddressSymbol, clientIp);
    }
    return request;
  }
  /**
   * Streams a web-standard Response into a NodeJS Server Response.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   * @param source WhatWG Response
   * @param destination NodeJS ServerResponse
   */
  static async writeResponse(source, destination) {
    const { status, headers, body, statusText } = source;
    if (!(destination instanceof Http2ServerResponse)) {
      destination.statusMessage = statusText;
    }
    destination.writeHead(status, createOutgoingHttpHeaders(headers));
    const cleanupAbortFromDestination = getAbortControllerCleanup(
      destination.req ?? void 0
    );
    if (cleanupAbortFromDestination) {
      const runCleanup = () => {
        cleanupAbortFromDestination();
        if (typeof destination.off === "function") {
          destination.off("finish", runCleanup);
          destination.off("close", runCleanup);
        } else {
          destination.removeListener?.("finish", runCleanup);
          destination.removeListener?.("close", runCleanup);
        }
      };
      destination.on("finish", runCleanup);
      destination.on("close", runCleanup);
    }
    if (!body) return destination.end();
    try {
      const reader = body.getReader();
      destination.on("close", () => {
        reader.cancel().catch((err) => {
          console.error(
            `There was an uncaught error in the middle of the stream while rendering ${destination.req.url}.`,
            err
          );
        });
      });
      let result = await reader.read();
      while (!result.done) {
        destination.write(result.value);
        result = await reader.read();
      }
      destination.end();
    } catch (err) {
      destination.write("Internal server error", () => {
        err instanceof Error ? destination.destroy(err) : destination.destroy();
      });
    }
  }
}
function getHostnamePort(hostname, port) {
  const portInHostname = typeof hostname === "string" && /:\d+$/.test(hostname);
  const hostnamePort = portInHostname ? hostname : `${hostname}${port ? `:${port}` : ""}`;
  return hostnamePort;
}
function makeRequestHeaders(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === void 0) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.append(name, value);
    }
  }
  return headers;
}
function makeRequestBody(req) {
  if (req.body !== void 0) {
    if (typeof req.body === "string" && req.body.length > 0) {
      return { body: Buffer.from(req.body) };
    }
    if (typeof req.body === "object" && req.body !== null && Object.keys(req.body).length > 0) {
      return { body: Buffer.from(JSON.stringify(req.body)) };
    }
    if (typeof req.body === "object" && req.body !== null && typeof req.body[Symbol.asyncIterator] !== "undefined") {
      return asyncIterableToBodyProps(req.body);
    }
  }
  return asyncIterableToBodyProps(req);
}
function asyncIterableToBodyProps(iterable) {
  return {
    // Node uses undici for the Request implementation. Undici accepts
    // a non-standard async iterable for the body.
    // @ts-expect-error
    body: iterable,
    // The duplex property is required when using a ReadableStream or async
    // iterable for the body. The type definitions do not include the duplex
    // property because they are not up-to-date.
    duplex: "half"
  };
}
function getAbortControllerCleanup(req) {
  if (!req) return void 0;
  const cleanup = Reflect.get(req, nodeRequestAbortControllerCleanupSymbol);
  return typeof cleanup === "function" ? cleanup : void 0;
}
function getRequestSocket(req) {
  if (req.socket && typeof req.socket.on === "function") {
    return req.socket;
  }
  const http2Socket = req.stream?.session?.socket;
  if (http2Socket && typeof http2Socket.on === "function") {
    return http2Socket;
  }
  return void 0;
}
apply();
nodePath.posix.join;
new RegExp(
  builtinModules.map((mod) => `(^${mod}$|^node:${mod}$)`).join("|")
);
const ASTRO_PATH_HEADER = "x-astro-path";
const ASTRO_PATH_PARAM = "x_astro_path";
const ASTRO_LOCALS_HEADER = "x-astro-locals";
const ASTRO_MIDDLEWARE_SECRET_HEADER = "x-astro-middleware-secret";
const createExports = (manifest, {
  middlewareSecret,
  skewProtection
}) => {
  const app = new NodeApp(manifest);
  const handler = async (req, res) => {
    const url = new URL(`https://example.com${req.url}`);
    const clientAddress = req.headers["x-forwarded-for"];
    const localsHeader = req.headers[ASTRO_LOCALS_HEADER];
    const middlewareSecretHeader = req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
    const realPath = req.headers[ASTRO_PATH_HEADER] ?? url.searchParams.get(ASTRO_PATH_PARAM);
    if (typeof realPath === "string") {
      req.url = realPath;
    }
    let locals = {};
    if (localsHeader) {
      if (middlewareSecretHeader !== middlewareSecret) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }
      locals = typeof localsHeader === "string" ? JSON.parse(localsHeader) : JSON.parse(localsHeader[0]);
    }
    delete req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
    if (skewProtection && process.env.VERCEL_SKEW_PROTECTION_ENABLED === "1") {
      req.headers["x-deployment-id"] = process.env.VERCEL_DEPLOYMENT_ID;
    }
    const webResponse = await app.render(req, {
      addCookieHeader: true,
      clientAddress,
      locals
    });
    await NodeApp.writeResponse(webResponse, res);
  };
  return {
    default: handler
  };
};
function start() {
}
const serverEntrypointModule = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createExports,
  start
}, Symbol.toStringTag, { value: "Module" }));
export {
  start as a,
  createExports as c,
  serverEntrypointModule as s
};
