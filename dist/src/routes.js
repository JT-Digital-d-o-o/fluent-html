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
/** Internal: build an HTMX object from a resolved path + method + options. */
function buildHtmxFromRoute(endpoint, method, options) {
    if (!options) {
        return { endpoint, method };
    }
    const { target, select, indicator, disable, include, ...rest } = options;
    return {
        endpoint,
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
                return buildHtmxFromRoute(resolvedPath, method, options);
            }
            : function (options) {
                return buildHtmxFromRoute(fullPath, method, options);
            };
        const resolve = hasParams
            ? function (params) {
                let resolved = fullPath;
                for (const [key, value] of Object.entries(params)) {
                    resolved = resolved.replace(`:${key}`, encodeURIComponent(value));
                }
                return resolved;
            }
            : function () {
                return fullPath;
            };
        Object.defineProperty(routeFn, "method", { value: method, writable: false, enumerable: true });
        Object.defineProperty(routeFn, "path", { value: fullPath, writable: false, enumerable: true });
        Object.defineProperty(routeFn, "resolve", { value: resolve, writable: false, enumerable: true });
        registry[name] = routeFn;
    }
    return Object.freeze(registry);
}
//# sourceMappingURL=routes.js.map