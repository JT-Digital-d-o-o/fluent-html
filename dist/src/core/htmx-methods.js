/**
 * HTMX integration methods for Tag — extracted as a mixin.
 * Adds setHtmx and hxGet/hxPost to Tag.prototype via declaration merging.
 * (hxPut/hxPatch/hxDelete were pruned in 8.0.0 — zero fleet use; a
 * non-GET/POST verb goes through `setHtmx(hx(endpoint, { method }))`.)
 *
 * @module
 */
import { Tag } from "./tag.js";
import { hx } from "../htmx.js";
// ── Prototype implementations ───────────────────────────────────────
const p = Tag.prototype;
p.setHtmx = function (endpointOrHtmx, options) {
    return this._setHx(typeof endpointOrHtmx === "string" ? hx(endpointOrHtmx, options) : endpointOrHtmx, "setHtmx");
};
p.htmxIndicator = function () { return this.addClass("htmx-indicator"); };
p.hxGet = function (endpoint, options) {
    return this._setHx(hx(endpoint, { ...options, method: "get" }), "hxGet");
};
p.hxPost = function (endpoint, options) {
    return this._setHx(hx(endpoint, { ...options, method: "post" }), "hxPost");
};
//# sourceMappingURL=htmx-methods.js.map