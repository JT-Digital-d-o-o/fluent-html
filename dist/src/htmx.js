"use strict";
// ------------------------------------
// HTMX Type Definitions for Fluent HTML
// Compatible with HTMX 2.0+
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.hx = hx;
exports.id = id;
exports.clss = clss;
exports.closest = closest;
exports.find = find;
exports.next = next;
exports.previous = previous;
const ids_js_1 = require("./ids.js");
function hx(endpoint, options = {}) {
    const { method, target, ...rest } = options;
    return {
        endpoint,
        method: method ?? "get",
        target: target ? ((0, ids_js_1.isId)(target) ? target.selector : target) : undefined,
        ...rest,
    };
}
/**
 * Create an ID selector for hx-target
 * @example hx("/api", { target: id("content") }) // hx-target="#content"
 */
function id(elementId) {
    return `#${elementId}`;
}
/**
 * Create a class selector for hx-target
 * @example hx("/api", { target: clss("items") }) // hx-target=".items"
 */
function clss(className) {
    return `.${className}`;
}
/**
 * Create a 'closest' selector for hx-target
 * @example hx("/api", { target: closest("tr") }) // hx-target="closest tr"
 */
function closest(selector) {
    return `closest ${selector}`;
}
/**
 * Create a 'find' selector for hx-target
 * @example hx("/api", { target: find(".content") }) // hx-target="find .content"
 */
function find(selector) {
    return `find ${selector}`;
}
/**
 * Create a 'next' selector for hx-target
 * @example hx("/api", { target: next("div") }) // hx-target="next div"
 */
function next(selector) {
    return selector ? `next ${selector}` : 'next';
}
/**
 * Create a 'previous' selector for hx-target
 * @example hx("/api", { target: previous("div") }) // hx-target="previous div"
 */
function previous(selector) {
    return selector ? `previous ${selector}` : 'previous';
}
//# sourceMappingURL=htmx.js.map