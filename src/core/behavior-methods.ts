/**
 * Built-in behavior system — type-safe client-side interactions via hx-on:* attributes.
 * No client-side runtime needed. The library owns the JS snippets.
 *
 * @module
 */
import { Tag, EMPTY_ATTRS } from "./tag.js";
import { isId, type Id } from "../ids.js";

// ── Built-in behavior definitions ───────────────────────────────
export type BehaviorMap = {
  toggle:     { target: Id };
  toggleClass:{ target: Id; class: string };
  remove:     { target: Id };
  clipboard:  { value: string };
  disable:    void;
  focus:      { target: Id };
  scrollTo:   { target: Id };
  selectAll:  void;
};

type BehaviorName = keyof BehaviorMap;

// ── Declaration merging on Tag ───────────────────────────────────
declare module "./tag.js" {
  interface Tag {
    behavior<K extends BehaviorName>(
      name: K,
      ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]
    ): this;
  }
}

// ── Behavior renderers — each returns [event, js] ────────────────
type BehaviorRenderer = (options: Record<string, unknown>) => [event: string, js: string];

function resolveId(value: unknown): string {
  return isId(value) ? (value as Id).id : String(value);
}

function el(value: unknown): string {
  return `document.getElementById('${resolveId(value)}')`;
}

const renderers: Record<BehaviorName, BehaviorRenderer> = {
  toggle: (opts) => [
    "click",
    `${el(opts.target)}.classList.toggle('hidden')`,
  ],
  toggleClass: (opts) => [
    "click",
    `${el(opts.target)}.classList.toggle('${String(opts.class)}')`,
  ],
  remove: (opts) => [
    "click",
    `${el(opts.target)}.remove()`,
  ],
  clipboard: (opts) => [
    "click",
    `navigator.clipboard.writeText('${escapeJs(String(opts.value))}')`,
  ],
  disable: () => [
    "click",
    "this.disabled=true",
  ],
  focus: (opts) => [
    "click",
    `${el(opts.target)}.focus()`,
  ],
  scrollTo: (opts) => [
    "click",
    `${el(opts.target)}.scrollIntoView({behavior:'smooth'})`,
  ],
  selectAll: () => [
    "focus",
    "this.select()",
  ],
};

function escapeJs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// ── Implementation ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
(Tag.prototype as any).behavior = function (name: string, options?: Record<string, unknown>) {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;

  const renderer = renderers[name as BehaviorName];
  const [event, js] = renderer(options ?? {});

  const attr = `hx-on:${event}`;
  const existing = this.attributes[attr];
  this.attributes[attr] = existing ? existing + ";" + js : js;

  return this;
};
