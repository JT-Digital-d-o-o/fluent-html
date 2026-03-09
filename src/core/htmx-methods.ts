/**
 * HTMX integration methods for Tag — extracted as a mixin.
 * Adds setHtmx, hxGet/Post/Put/Patch/Delete to Tag.prototype
 * via declaration merging.
 *
 * @module
 */
import { Tag } from "./tag.js";
import type { HTMX, HxOptions} from "../htmx.js";
import { hx } from "../htmx.js";

// ── Declaration merging ─────────────────────────────────────────────

declare module "./tag.js" {
  interface Tag {
    setHtmx(htmx?: HTMX): this;
    setHtmx(endpoint: string, options?: HxOptions): this;
    hxGet(endpoint: string, options?: Omit<HxOptions, "method">): this;
    hxPost(endpoint: string, options?: Omit<HxOptions, "method">): this;
    hxPut(endpoint: string, options?: Omit<HxOptions, "method">): this;
    hxPatch(endpoint: string, options?: Omit<HxOptions, "method">): this;
    hxDelete(endpoint: string, options?: Omit<HxOptions, "method">): this;
  }
}

// ── Prototype implementations ───────────────────────────────────────

const p = Tag.prototype;

p.setHtmx = function (endpointOrHtmx?: string | HTMX, options?: HxOptions) {
  this.htmx = typeof endpointOrHtmx === "string"
    ? hx(endpointOrHtmx, options)
    : endpointOrHtmx;
  return this;
};

p.hxGet = function (endpoint: string, options?: Omit<HxOptions, "method">) {
  this.htmx = hx(endpoint, { ...options, method: "get" });
  return this;
};

p.hxPost = function (endpoint: string, options?: Omit<HxOptions, "method">) {
  this.htmx = hx(endpoint, { ...options, method: "post" });
  return this;
};

p.hxPut = function (endpoint: string, options?: Omit<HxOptions, "method">) {
  this.htmx = hx(endpoint, { ...options, method: "put" });
  return this;
};

p.hxPatch = function (endpoint: string, options?: Omit<HxOptions, "method">) {
  this.htmx = hx(endpoint, { ...options, method: "patch" });
  return this;
};

p.hxDelete = function (endpoint: string, options?: Omit<HxOptions, "method">) {
  this.htmx = hx(endpoint, { ...options, method: "delete" });
  return this;
};
