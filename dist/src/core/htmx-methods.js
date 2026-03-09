/**
 * HTMX integration methods for Tag — extracted as a mixin.
 * Adds setHtmx, hxGet/Post/Put/Patch/Delete to Tag.prototype
 * via declaration merging.
 *
 * @module
 */
import { Tag } from "./tag.js";
import { hx } from "../htmx.js";
// ── Prototype implementations ───────────────────────────────────────
const p = Tag.prototype;
p.setHtmx = function (endpointOrHtmx, options) {
    this.htmx = typeof endpointOrHtmx === "string"
        ? hx(endpointOrHtmx, options)
        : endpointOrHtmx;
    return this;
};
p.hxGet = function (endpoint, options) {
    this.htmx = hx(endpoint, { ...options, method: "get" });
    return this;
};
p.hxPost = function (endpoint, options) {
    this.htmx = hx(endpoint, { ...options, method: "post" });
    return this;
};
p.hxPut = function (endpoint, options) {
    this.htmx = hx(endpoint, { ...options, method: "put" });
    return this;
};
p.hxPatch = function (endpoint, options) {
    this.htmx = hx(endpoint, { ...options, method: "patch" });
    return this;
};
p.hxDelete = function (endpoint, options) {
    this.htmx = hx(endpoint, { ...options, method: "delete" });
    return this;
};
//# sourceMappingURL=htmx-methods.js.map