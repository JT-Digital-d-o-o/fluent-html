// ------------------------------------
// HTMX Type Definitions for Fluent HTML
// Compatible with HTMX 4.0+
// ------------------------------------
import { isId } from "./ids.js";
/** Resolve a string or Id to its selector string, or undefined if falsy. */
export function resolveSelector(value) {
    if (!value)
        return undefined;
    return isId(value) ? value.selector : value;
}
export function hx(endpoint, options = {}) {
    const { method, target, select, indicator, disable, include, ...rest } = options;
    return {
        endpoint,
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
 * Create an ID selector for hx-target
 * @example hx("/api", { target: id("content") }) // hx-target="#content"
 */
export function id(elementId) {
    return `#${elementId}`;
}
/**
 * Create a class selector for hx-target
 * @example hx("/api", { target: clss("items") }) // hx-target=".items"
 */
export function clss(className) {
    return `.${className}`;
}
/**
 * Create a 'closest' selector for hx-target
 * @example hx("/api", { target: closest("tr") }) // hx-target="closest tr"
 */
export function closest(selector) {
    return `closest ${selector}`;
}
/**
 * Create a 'find' selector for hx-target
 * @example hx("/api", { target: find(".content") }) // hx-target="find .content"
 */
export function find(selector) {
    return `find ${selector}`;
}
/**
 * Create a 'next' selector for hx-target
 * @example hx("/api", { target: next("div") }) // hx-target="next div"
 */
export function next(selector) {
    return selector ? `next ${selector}` : 'next';
}
/**
 * Create a 'previous' selector for hx-target
 * @example hx("/api", { target: previous("div") }) // hx-target="previous div"
 */
export function previous(selector) {
    return selector ? `previous ${selector}` : 'previous';
}
//# sourceMappingURL=htmx.js.map