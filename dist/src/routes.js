"use strict";
// ------------------------------------
// Type-Safe Route System for Fluent HTML
// ------------------------------------
//
// This module provides compile-time safety for HTMX endpoints and HTTP methods.
// It ensures that hx-get/post/etc. always reference valid routes with correct methods.
//
// Complementary to defineIds() which protects target selectors,
// defineRoutes() protects endpoint URLs and HTTP methods.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineRoutes = defineRoutes;
const ids_js_1 = require("./ids.js");
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
        target: target ? ((0, ids_js_1.isId)(target) ? target.selector : target) : undefined,
        select: select ? ((0, ids_js_1.isId)(select) ? select.selector : select) : undefined,
        indicator: indicator ? ((0, ids_js_1.isId)(indicator) ? indicator.selector : indicator) : undefined,
        disable: disable ? ((0, ids_js_1.isId)(disable) ? disable.selector : disable) : undefined,
        include: include ? ((0, ids_js_1.isId)(include) ? include.selector : include) : undefined,
        ...rest,
    };
}
function defineRoutes(prefixOrDefinitions, maybeDefinitions) {
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