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
/**
 * Internal: substitute every `:name` placeholder with its encoded value. Boundary-aware
 * (`:id` never matches inside `:idCard`) and replaces all occurrences; the trailing
 * lookahead mirrors the identifier grammar used by `assertNoUnresolvedParams`.
 */
function substituteParams(template, params) {
    let out = template;
    for (const [key, value] of Object.entries(params)) {
        const pattern = new RegExp(`:${escapeRegExp(key)}(?![A-Za-z0-9_])`, "g");
        out = out.replace(pattern, encodeURIComponent(String(value)));
    }
    return out;
}
/** Internal: build an HTMX object from a resolved path + method + options. */
function buildHtmxFromRoute(endpoint, method, options) {
    if (!options) {
        return { endpoint, method };
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
        const { method } = def;
        const fullPath = prefix && def.path === "/" ? prefix : prefix + def.path;
        const hasParams = fullPath.includes(":");
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
        registry[name] = routeFn;
    }
    return Object.freeze(registry);
}
//# sourceMappingURL=routes.js.map