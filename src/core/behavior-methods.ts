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
  toggle:     { target: Id; event?: HxOnEvent; force?: boolean };
  toggleClass:{ target: Id; class: string; event?: HxOnEvent; force?: boolean };
  remove:     { target: Id; event?: HxOnEvent; animateOut?: string };
  clipboard:  { value: string };
  disable:    void;
  focus:      { target: Id };
  scrollTo:   { target: Id };
  selectAll:  void;
  back:       void;
  formResetOnSwap: void;
  dismissOnEscape: void;
  openDialog:  { target: Id };
  closeDialog: { target: Id };
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

/** The trigger event for an option-widened behavior (`event?`), defaulting to `fallback`. */
function ev(opts: Record<string, unknown>, fallback: string): string {
  return typeof opts.event === "string" ? opts.event : fallback;
}

/** The optional second `classList.toggle(cls, force)` argument (` , true`/` , false`), or empty. */
function forceArg(opts: Record<string, unknown>): string {
  return opts.force !== undefined ? (opts.force ? ", true" : ", false") : "";
}

const renderers: Record<BehaviorName, BehaviorRenderer> = {
  toggle: (opts) => [
    ev(opts, "click"),
    `${el(opts.target)}.classList.toggle('hidden'${forceArg(opts)})`,
  ],
  toggleClass: (opts) => [
    ev(opts, "click"),
    `${el(opts.target)}.classList.toggle('${escapeJs(String(opts.class))}'${forceArg(opts)})`,
  ],
  remove: (opts) => {
    const target = el(opts.target);
    if (opts.animateOut !== undefined) {
      const cls = escapeJs(String(opts.animateOut));
      return [ev(opts, "click"), `${target}.classList.add('${cls}');${target}.addEventListener('transitionend',()=>${target}.remove(),{once:true})`];
    }
    return [ev(opts, "click"), `${target}.remove()`];
  },
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
    // htmx 4 lifecycle events are colon-separated (htmx:after:swap); the htmx 1/2
    // kebab alias (htmx:after-swap) is never dispatched, so the listener no-ops.
    "htmx:after:swap",
    "this.reset()",
  ],
  dismissOnEscape: () => [
    "keyup",
    "if(event.key==='Escape')this.remove()",
  ],
  openDialog: (opts) => [
    "click",
    `${el(opts.target)}.showModal()`,
  ],
  closeDialog: (opts) => [
    "click",
    `${el(opts.target)}.close()`,
  ],
};

// ── Implementation ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
(Tag.prototype as any).behavior = function (name: string, options?: Record<string, unknown>) {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null) as Record<string, string>;

  const renderer = renderers[name as BehaviorName];
  const [event, js] = renderer(options ?? {});

  // `event` may now come from a user `event?` option, so it becomes part of the
  // attribute NAME — validate it the same way `.hxOn()` does.
  if (!HX_ON_EVENT_RE.test(event)) {
    throw new Error(`Invalid behavior event: "${event}" — expected an event name (letters, digits, ':' '-' '_').`);
  }

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
