/**
 * Built-in behavior system — type-safe client-side interactions via hx-on:* attributes.
 * No client-side runtime needed. The library owns the JS snippets.
 *
 * @module
 */
import { Tag, EMPTY_ATTRS } from "./tag.js";
import { isId, type Id } from "../ids.js";
import { escapeJs } from "../render/escape.js";

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
  back:       void;
  formResetOnSwap: void;
  dismissOnEscape: void;
};

type BehaviorName = keyof BehaviorMap;

/** Events accepted by `.hxOn(event, js)` — standard DOM events plus any `htmx:*` event. */
export type HxOnEvent =
  | "click" | "dblclick" | "change" | "input" | "submit" | "reset"
  | "keydown" | "keyup" | "keypress"
  | "focus" | "blur" | "focusin" | "focusout"
  | "mouseenter" | "mouseleave" | "mouseover" | "mouseout" | "mousedown" | "mouseup"
  | "load" | "scroll"
  | `htmx:${string}`
  | (string & {});

// A safe hx-on event name (it becomes part of the `hx-on:<event>` attribute NAME, so a
// malformed value would be attribute-name injection — the typed union guards typed callers).
const HX_ON_EVENT_RE = /^[a-zA-Z][a-zA-Z0-9:_-]*$/;

// ── Declaration merging on Tag ───────────────────────────────────
declare module "./tag.js" {
  interface Tag {
    behavior<K extends BehaviorName>(
      name: K,
      ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]
    ): this;
    /**
     * Attach raw JS to an `hx-on:<event>` handler (typed event, concatenated with
     * `;` if called more than once, HTML-attribute-escaped at render). Prefer
     * `.behavior()` for the built-ins; reach for `.hxOn()` only for one-offs.
     *
     * @example
     * Button("Count").hxOn("click", "this.dataset.n = (+this.dataset.n||0)+1")
     */
    hxOn(event: HxOnEvent, js: string): this;
  }
}

// ── Behavior renderers — each returns [event, js] ────────────────
type BehaviorRenderer = (options: Record<string, unknown>) => [event: string, js: string];

function resolveId(value: unknown): string {
  return isId(value) ? (value as Id).id : String(value);
}

function el(value: unknown): string {
  return `document.getElementById('${escapeJs(resolveId(value))}')`;
}

const renderers: Record<BehaviorName, BehaviorRenderer> = {
  toggle: (opts) => [
    "click",
    `${el(opts.target)}.classList.toggle('hidden')`,
  ],
  toggleClass: (opts) => [
    "click",
    `${el(opts.target)}.classList.toggle('${escapeJs(String(opts.class))}')`,
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
  back: () => [
    "click",
    "history.back()",
  ],
  formResetOnSwap: () => [
    "htmx:after-swap",
    "this.reset()",
  ],
  dismissOnEscape: () => [
    "keyup",
    "if(event.key==='Escape')this.remove()",
  ],
};

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

// ── .hxOn(event, js) ─────────────────────────────────────────────
// The js is author-authored and stored verbatim; the renderer HTML-attribute-escapes
// it, so it can't break out of the `hx-on:<event>="…"` attribute. The event name is
// validated (it becomes part of the attribute name).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
(Tag.prototype as any).hxOn = function (event: string, js: string) {
  if (!HX_ON_EVENT_RE.test(event)) {
    throw new Error(`Invalid hx-on event: "${event}" — expected an event name (letters, digits, ':' '-' '_').`);
  }
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;
  const attr = `hx-on:${event}`;
  const existing = this.attributes[attr];
  this.attributes[attr] = existing ? existing + ";" + js : js;
  return this;
};
