// ------------------------------------
// Type-Safe Route System for Fluent HTML
// ------------------------------------
//
// This module provides compile-time safety for HTMX endpoints and HTTP methods.
// It ensures that hx-get/post/etc. always reference valid routes with correct methods.
//
// Complementary to defineIds() which protects target selectors,
// defineRoutes() protects endpoint URLs and HTTP methods.
import { resolveSelector } from "./htmx.js";
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
/** Internal: serialize a query-params bag into a `?key=value&…` string. Skips nullish entries. */
function buildQueryString(query) {
    const parts = [];
    for (const [key, value] of Object.entries(query)) {
        if (value == null)
            continue;
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
    return parts.length > 0 ? `?${parts.join("&")}` : "";
}
/** Internal: build an HTMX object from a resolved path + method + options. */
function buildHtmxFromRoute(endpoint, method, options) {
    if (!options) {
        return { endpoint, method };
    }
    const { target, select, indicator, disable, include, query, ...rest } = options;
    const resolvedEndpoint = query ? endpoint + buildQueryString(query) : endpoint;
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
                let resolvedPath = fullPath;
                for (const [key, value] of Object.entries(params)) {
                    resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(value));
                }
                assertNoUnresolvedParams(resolvedPath, fullPath);
                return buildHtmxFromRoute(resolvedPath, method, options);
            }
            : function (options) {
                return buildHtmxFromRoute(fullPath, method, options);
            };
        const resolve = hasParams
            ? function (params, query) {
                let resolved = fullPath;
                for (const [key, value] of Object.entries(params)) {
                    resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
                }
                assertNoUnresolvedParams(resolved, fullPath);
                return query ? resolved + buildQueryString(query) : resolved;
            }
            : function (query) {
                return query ? fullPath + buildQueryString(query) : fullPath;
            };
        Object.defineProperty(routeFn, "method", { value: method, writable: false, enumerable: true });
        Object.defineProperty(routeFn, "path", { value: fullPath, writable: false, enumerable: true });
        Object.defineProperty(routeFn, "resolve", { value: resolve, writable: false, enumerable: true });
        registry[name] = routeFn;
    }
    return Object.freeze(registry);
}
//# sourceMappingURL=routes.js.map