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
    const { target, ...rest } = options;
    return {
        endpoint,
        method,
        target: target ? ((0, ids_js_1.isId)(target) ? target.selector : target) : undefined,
        ...rest,
    };
}
/**
 * Define a type-safe route registry for a feature/controller.
 *
 * Each route becomes a callable function that returns an `HTMX` object,
 * ready to pass to `setHtmx()`. Path parameters (`:id`) are extracted
 * from the path string and required at call time.
 *
 * Routes also expose `.method` and `.path` for server-side registration.
 *
 * @param definitions - Object mapping route names to `{ method, path }` definitions
 * @returns A frozen registry where each key is a callable route
 *
 * @example
 * // Define per-feature routes
 * export const userRoutes = defineRoutes({
 *   list:   { method: "get",    path: "/users" },
 *   create: { method: "post",   path: "/users" },
 *   detail: { method: "get",    path: "/users/:id" },
 *   delete: { method: "delete", path: "/users/:id" },
 * } as const);
 *
 * // In views — type-safe HTMX
 * Button("Load").setHtmx(userRoutes.list())
 * Button("Delete").setHtmx(userRoutes.delete({ id: user.id }))
 * Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))
 *
 * // In controllers — single-sourced paths
 * server.get(userRoutes.list.path, handler)
 * server.delete(userRoutes.delete.path, handler)
 */
function defineRoutes(definitions) {
    const registry = {};
    for (const [name, def] of Object.entries(definitions)) {
        const { method, path } = def;
        const hasParams = path.includes(":");
        const routeFn = hasParams
            ? function (params, options) {
                let resolvedPath = path;
                for (const [key, value] of Object.entries(params)) {
                    resolvedPath = resolvedPath.replace(`:${key}`, encodeURIComponent(value));
                }
                return buildHtmxFromRoute(resolvedPath, method, options);
            }
            : function (options) {
                return buildHtmxFromRoute(path, method, options);
            };
        Object.defineProperty(routeFn, "method", { value: method, writable: false, enumerable: true });
        Object.defineProperty(routeFn, "path", { value: path, writable: false, enumerable: true });
        registry[name] = routeFn;
    }
    return Object.freeze(registry);
}
//# sourceMappingURL=routes.js.map