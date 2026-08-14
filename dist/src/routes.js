// ------------------------------------
// Type-Safe Route System for Fluent HTML
// ------------------------------------
//
// This module provides compile-time safety for HTMX endpoints and HTTP methods.
// It ensures that hx-get/post/etc. always reference valid routes with correct methods.
//
// Complementary to defineIds() which protects target selectors,
// defineRoutes() protects endpoint URLs and HTTP methods.
import { resolveSelector, buildQueryString } from "./htmx.js";
// ------------------------------------
// Runtime Implementation
// ------------------------------------
/** Internal: throw if any `:param` placeholders remain after substitution. */
function assertNoUnresolvedParams(resolved, template) {
    const match = resolved.match(/:([a-zA-Z_]\w*)/);
    if (match) {
        throw new Error(`Unresolved route param ":${match[1]}" in "${template}"`);
    }
}
/** Internal: escape RegExp metacharacters in a literal param name (names are normally identifiers). */
function escapeRegExp(literal) {
    return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Internal: matches a trailing splat segment — `/​*` or `/​*name` at the end of a path. */
const SPLAT_RE = /\/\*([A-Za-z_]\w*)?$/;
/** Internal: encode a splat value while preserving its `/` separators (catch-all semantics). */
function encodeSplat(value) {
    return String(value).split("/").map(encodeURIComponent).join("/");
}
/**
 * Internal: reject a numeric param value that can't form a valid URL segment — `NaN`,
 * `±Infinity`, or a magnitude that serializes to exponential (`1e21` → `"1e+21"`). These
 * are always programmer errors (a derived id that went wrong); throwing at resolve time
 * beats silently emitting `/users/NaN`. Finite integers/decimals in the normal range pass.
 */
function assertUrlSafeNumber(key, value, template) {
    if (typeof value !== "number")
        return;
    const s = String(value);
    if (!Number.isFinite(value) || s.includes("e") || s.includes("E")) {
        throw new Error(`Route param "${key}" (${value}) can't form a valid URL segment in "${template}" — pass a finite integer.`);
    }
}
/**
 * Internal: substitute every `:name` placeholder with its encoded value. Boundary-aware
 * (`:id` never matches inside `:idCard`) and replaces all occurrences; the trailing
 * lookahead mirrors the identifier grammar used by `assertNoUnresolvedParams`.
 */
function substituteParams(template, params) {
    // Split any trailing splat off the TEMPLATE first. Deciding splat-ness from the template
    // (not from the already-substituted output) means a `:param` value that happens to start
    // with `*` — a realistic wildcard search term — can no longer re-trigger the splat branch
    // and throw / mis-substitute on a route that has no splat.
    const splatMatch = SPLAT_RE.exec(template);
    let out = splatMatch ? template.slice(0, template.length - splatMatch[0].length) : template;
    for (const [key, value] of Object.entries(params)) {
        assertUrlSafeNumber(key, value, template);
        const pattern = new RegExp(`:${escapeRegExp(key)}(?![A-Za-z0-9_])`, "g");
        out = out.replace(pattern, encodeURIComponent(String(value)));
    }
    if (splatMatch) {
        const key = splatMatch[1] ?? "splat";
        const value = params[key];
        if (value == null) {
            throw new Error(`Unresolved route splat "*${splatMatch[1] ?? ""}" in "${template}"`);
        }
        assertUrlSafeNumber(key, value, template);
        out += "/" + encodeSplat(value);
    }
    return out;
}
/** Internal: build an HTMX object from a resolved path + method + options. */
function buildHtmxFromRoute(endpoint, method, options) {
    if (!options) {
        return { endpoint: endpoint, method };
    }
    const { target, select, indicator, disable, include, query, ...rest } = options;
    const resolvedEndpoint = query ? buildQueryString(endpoint, query) : endpoint;
    return {
        endpoint: resolvedEndpoint,
        method,
        target: resolveSelector(target),
        select: resolveSelector(select),
        indicator: resolveSelector(indicator),
        disable: resolveSelector(disable),
        include: resolveSelector(include),
        ...rest,
    };
}
export function defineRoutes(prefixOrDefinitions, maybeDefinitions) {
    const prefix = typeof prefixOrDefinitions === "string" ? prefixOrDefinitions : "";
    const definitions = typeof prefixOrDefinitions === "string" ? maybeDefinitions : prefixOrDefinitions;
    const registry = {};
    for (const [name, def] of Object.entries(definitions)) {
        const method = def.method ?? "get";
        const fullPath = prefix && def.path === "/" ? prefix : prefix + def.path;
        // Only a trailing `/*` or `/*name` splat is supported. A `*` anywhere else (the type
        // rejects it, but the runtime would otherwise register the route as paramless and serve
        // a literal `*seg`) is a broken route — fail at definition time, not at click time.
        if (fullPath.replace(SPLAT_RE, "").includes("*")) {
            throw new Error(`Route "${name}" path "${fullPath}" has a mid-path wildcard — only a trailing "/*" or "/*name" splat is supported.`);
        }
        const hasParams = fullPath.includes(":") || SPLAT_RE.test(fullPath);
        // Mirror the compile-time AllowedStance rules for JS callers.
        if (def.sitemap !== undefined) {
            if (method !== "get") {
                throw new Error(`Route "${name}" is a ${method.toUpperCase()} route — only GET routes may declare a sitemap stance.`);
            }
            if (def.sitemap === true && hasParams) {
                throw new Error(`Route "${name}" has path params — a param'd route can't be a single sitemap entry; use sitemap: "dynamic" (with a provider) or "exclude".`);
            }
            if (def.sitemap === "dynamic" && !hasParams) {
                throw new Error(`Route "${name}" has no path params — a paramless route is one URL; use sitemap: true instead of "dynamic".`);
            }
        }
        const routeFn = hasParams
            ? function (params, options) {
                const resolvedPath = substituteParams(fullPath, params);
                assertNoUnresolvedParams(resolvedPath, fullPath);
                return buildHtmxFromRoute(resolvedPath, method, options);
            }
            : function (options) {
                return buildHtmxFromRoute(fullPath, method, options);
            };
        const resolve = hasParams
            ? function (params, query) {
                const resolved = substituteParams(fullPath, params);
                assertNoUnresolvedParams(resolved, fullPath);
                return query ? buildQueryString(resolved, query) : resolved;
            }
            : function (query) {
                return query ? buildQueryString(fullPath, query) : fullPath;
            };
        Object.defineProperty(routeFn, "method", { value: method, writable: false, enumerable: true });
        Object.defineProperty(routeFn, "path", { value: fullPath, writable: false, enumerable: true });
        Object.defineProperty(routeFn, "resolve", { value: resolve, writable: false, enumerable: true });
        // Carry the declared def data through to runtime so server-side helpers can emit
        // coercing validation schemas and perform sitemap registration from the callable alone.
        if (def.params !== undefined) {
            Object.defineProperty(routeFn, "params", { value: def.params, writable: false, enumerable: true });
        }
        if (def.query !== undefined) {
            Object.defineProperty(routeFn, "query", { value: def.query, writable: false, enumerable: true });
        }
        if (def.sitemap !== undefined) {
            Object.defineProperty(routeFn, "sitemap", { value: def.sitemap, writable: false, enumerable: true });
        }
        registry[name] = routeFn;
    }
    return Object.freeze(registry);
}
//# sourceMappingURL=routes.js.map