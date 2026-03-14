/**
 * Behavior system — type-safe bridge between server-rendered HTML and client-side JS.
 * Ships an empty `BehaviorMap` interface that users augment via declaration merging.
 *
 * @module
 */
import { Tag, EMPTY_ATTRS } from "./tag.js";
import { isId } from "../ids.js";

// ── Public interface — users augment this ────────────────────────
export interface BehaviorMap {}

// ── Declaration merging on Tag ───────────────────────────────────
declare module "./tag.js" {
  interface Tag {
    behavior<K extends keyof BehaviorMap>(
      name: K,
      ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]
    ): this;
  }
}

// ── Implementation ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
(Tag.prototype as any).behavior = function (name: string, options?: Record<string, unknown>) {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;

  // Append to data-behavior (space-separated for multiple)
  const existing = this.attributes["data-behavior"];
  this.attributes["data-behavior"] = existing ? existing + " " + name : name;

  // Serialize options as data-{behavior}-{key} attributes
  if (options) {
    const prefix = "data-" + camelToKebab(name) + "-";
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null) {
        const resolved = isId(value) ? value.selector : String(value);
        this.attributes[prefix + camelToKebab(key)] = resolved;
      }
    }
  }

  return this;
};

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase());
}
