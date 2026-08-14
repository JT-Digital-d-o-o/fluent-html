/**
 * HTMX integration methods for Tag — extracted as a mixin.
 * Adds setHtmx and hxGet/hxPost to Tag.prototype via declaration merging.
 * (hxPut/hxPatch/hxDelete were pruned in 8.0.0 — zero fleet use; a
 * non-GET/POST verb goes through `setHtmx(hx(endpoint, { method }))`.)
 *
 * @module
 */
import { Tag } from "./tag.js";
import type { HTMX, HxOptions, ResolvedRoute, ExternalHref } from "../htmx.js";
import { hx } from "../htmx.js";

// ── Declaration merging ─────────────────────────────────────────────

declare module "./tag.js" {
  interface Tag {
    setHtmx(htmx?: HTMX): this;
    setHtmx(endpoint: ResolvedRoute | ExternalHref, options?: HxOptions): this;
    hxGet(endpoint: ResolvedRoute | ExternalHref, options?: Omit<HxOptions, "method">): this;
    hxPost(endpoint: ResolvedRoute | ExternalHref, options?: Omit<HxOptions, "method">): this;
    /**
     * Mark this element as an htmx loading indicator — adds the library-known
     * `htmx-indicator` class (shown only while a request targeting it is in flight).
     * Sanctioned so the Tailwind extractor/ESLint accept the class, unlike a raw
     * `.setClass("htmx-indicator")`.
     */
    htmxIndicator(): this;
  }
}

// ── Prototype implementations ───────────────────────────────────────

const p = Tag.prototype;

p.setHtmx = function (endpointOrHtmx?: ResolvedRoute | ExternalHref | HTMX, options?: HxOptions) {
  return this._setHx(
    typeof endpointOrHtmx === "string" ? hx(endpointOrHtmx, options) : endpointOrHtmx,
    "setHtmx",
  );
};

p.htmxIndicator = function () { return this.addClass("htmx-indicator"); };

p.hxGet = function (endpoint: ResolvedRoute | ExternalHref, options?: Omit<HxOptions, "method">) {
  return this._setHx(hx(endpoint, { ...options, method: "get" }), "hxGet");
};

p.hxPost = function (endpoint: ResolvedRoute | ExternalHref, options?: Omit<HxOptions, "method">) {
  return this._setHx(hx(endpoint, { ...options, method: "post" }), "hxPost");
};
