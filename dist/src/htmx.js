// ------------------------------------
// HTMX Type Definitions for Fluent HTML
// Compatible with HTMX 4.0+
// ------------------------------------
import { isId } from "./ids.js";
/**
 * Internal: append a query-params bag to a base endpoint, joining with `?` or `&` as
 * appropriate. Skips nullish entries; url-encodes keys and values. An empty or all-nullish
 * bag returns `base` unchanged (no stray separator). Shared by `hx()` and the route-callable
 * surface so both produce byte-identical query strings.
 */
export function buildQueryString(base, query) {
    const parts = [];
    for (const [key, value] of Object.entries(query)) {
        if (value == null)
            continue;
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
    if (parts.length === 0)
        return base;
    const sep = base.includes("?") ? "&" : "?";
    return base + sep + parts.join("&");
}
/**
 * Resolve a string or `Id` to its CSS selector string.
 *
 * @param value - A raw CSS selector string, an `Id` object, or undefined
 * @returns The resolved selector string, or undefined if falsy
 *
 * @example
 * resolveSelector(ids.userList) // "#user-list"
 * resolveSelector("#my-el")    // "#my-el"
 * resolveSelector(undefined)   // undefined
 */
export function resolveSelector(value) {
    if (!value)
        return undefined;
    return isId(value) ? value.selector : value;
}
/**
 * Create an HTMX configuration object for use with `.setHtmx()`.
 *
 * Resolves `Id` objects in target/select/indicator/disable/include to their selectors.
 * Defaults to `method: "get"` if not specified.
 *
 * @param endpoint - The URL endpoint for the HTMX request
 * @param options - HTMX options (method, target, swap, trigger, etc.)
 * @returns A fully resolved `HTMX` object
 *
 * @example
 * hx("/api/items")
 * hx("/api/save", { method: "post", target: ids.result, swap: "outerMorph" })
 * // Ad-hoc string endpoint (escape hatch) — folds query into the URL:
 * hx("/search", { query: { q: term, scope: "open" } })   // → hx-get="/search?q=…&scope=open"
 * // Join-aware: a base that already carries a query string joins with "&":
 * hx("/search?event=E", { query: { q: term } })           // → hx-get="/search?event=E&q=…"
 *
 * @remarks
 * PREFER a typed route callable (`taskRoutes.list({ query })`) whenever the route is modeled
 * by `defineRoutes` — it single-sources the path and types params. The `query` bag here is the
 * escape hatch for ad-hoc URLs not modeled by a route (e.g. a `searchUrl` component prop). It is
 * join-aware: if `endpoint` already contains a `?`, params are appended with `&`, so a
 * fully-resolved URL from `.resolve(params, query)` is safe to pass. `query` writes the request
 * URL and url-encodes its keys/values; it is DISTINCT from `vals` (hx-vals), which adds values to
 * the request body and is not url-encoded — never reach for `vals` to build a query string.
 */
export function hx(endpoint, options = {}) {
    const { method, target, select, indicator, disable, include, query, ...rest } = options;
    return {
        endpoint: query ? buildQueryString(endpoint, query) : endpoint,
        method: method ?? "get",
        target: resolveSelector(target),
        select: resolveSelector(select),
        indicator: resolveSelector(indicator),
        disable: resolveSelector(disable),
        include: resolveSelector(include),
        ...rest,
    };
}
/**
 * Create an ID selector for hx-target.
 *
 * @param elementId - The element ID (without `#`)
 * @returns The CSS ID selector string
 * @example hx("/api", { target: id("content") }) // hx-target="#content"
 */
export function id(elementId) {
    return `#${elementId}`;
}
/**
 * Create a class selector for hx-target.
 *
 * @param className - The class name (without `.`)
 * @returns The CSS class selector string
 * @example hx("/api", { target: clss("items") }) // hx-target=".items"
 */
export function clss(className) {
    return `.${className}`;
}
/**
 * Create a `closest` ancestor selector for hx-target.
 *
 * @param selector - CSS selector to match the closest ancestor
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: closest("tr") }) // hx-target="closest tr"
 */
export function closest(selector) {
    return `closest ${selector}`;
}
/**
 * Create a `find` descendant selector for hx-target.
 *
 * @param selector - CSS selector to find within descendants
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: find(".content") }) // hx-target="find .content"
 */
export function find(selector) {
    return `find ${selector}`;
}
/**
 * Create a `next` sibling selector for hx-target.
 *
 * @param selector - Optional CSS selector to match the next sibling
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: next("div") }) // hx-target="next div"
 */
export function next(selector) {
    return selector ? `next ${selector}` : 'next';
}
/**
 * Create a `previous` sibling selector for hx-target.
 *
 * @param selector - Optional CSS selector to match the previous sibling
 * @returns The HTMX extended selector string
 * @example hx("/api", { target: previous("div") }) // hx-target="previous div"
 */
export function previous(selector) {
    return selector ? `previous ${selector}` : 'previous';
}
//# sourceMappingURL=htmx.js.map