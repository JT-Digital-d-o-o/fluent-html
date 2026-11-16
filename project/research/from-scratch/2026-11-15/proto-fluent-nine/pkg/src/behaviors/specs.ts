/**
 * Built-in wire specs — the schema half shared by the server emitter (option
 * validation at emit) and the client runtime (option decode). DOM-free and
 * fixture-free: fixtures live server-side in `fixtures.ts` so they never cost
 * asset bytes.
 *
 * @module
 */
import type { OptionType } from "./serialize.js";
import { HTMX_EVENTS, type BehaviorEvent, type LifecycleEvent } from "./events.js";

export type WireSpec = {
  readonly options: Record<string, OptionType>;
  /**
   * The live trigger set — EVERY declared event fires the verb (resetOnSuccess
   * listens on both lifecycle events); an emitted `event` option override
   * replaces the whole set. List the canonical/default trigger first.
   */
  readonly events: readonly (BehaviorEvent | LifecycleEvent)[];
  /** Call `preventDefault()` when the verb runs (e.g. `back` on an `<a>`). */
  readonly preventDefault?: boolean;
  /**
   * Default consumption for the dispatch walk (ADR-04) when the handler
   * returns void. Click-triggered built-ins consume; keyboard verbs consume
   * conditionally via their handler's return value.
   */
  readonly consume?: boolean;
  /** Emit-time check: at least one option of each group must be provided. */
  readonly requireOneOf?: readonly (readonly string[])[];
};

const CLOSE_ON = ["escape", "backdrop", "nav"] as const;

export const BUILTIN_SPECS: Record<string, WireSpec> = {
  toggle: {
    options: { target: "id-list", force: "boolean", display: "string", event: "event" },
    events: ["click"],
    consume: true,
  },
  toggleClass: {
    options: { target: "id-list", class: "class", force: "boolean", event: "event" },
    events: ["click"],
    consume: true,
  },
  remove: {
    options: { target: "target", animateOut: "class", animateOutTimeoutMs: "number", event: "event" },
    events: ["click"],
    consume: true,
  },
  clipboard: {
    options: {
      value: "string",
      path: "string",
      "feedback.target": "target",
      "feedback.mode": { enum: ["text", "class"] },
      "feedback.text": "string",
      "feedback.class": "class",
      "feedback.durationMs": "number",
    },
    events: ["click"],
    consume: true,
    requireOneOf: [["value", "path"]],
  },
  drawer: {
    options: {
      target: "id",
      class: "class",
      backdrop: "id",
      bodyClass: "class",
      closeOn: { enum: CLOSE_ON, list: true },
      trapFocus: "boolean",
      focusFirst: "boolean",
    },
    events: ["click"],
    consume: true,
  },
  onEscape: {
    options: {
      action: { enum: ["click", "remove", "hide"] },
      target: "target",
      scope: { enum: ["self", "document"] },
    },
    events: ["keydown"],
  },
  onClickOutside: {
    options: { action: { enum: ["hide", "remove", "click"] }, target: "target" },
    events: ["click"],
  },
  resetOnSuccess: {
    options: {},
    events: ["afterRequest", "afterSwap"],
  },
  back: {
    options: {},
    events: ["click"],
    consume: true,
    preventDefault: true,
  },
  focus: {
    options: { target: "id" },
    events: ["click"],
    consume: true,
  },
};

export const BUILTIN_NAMES: readonly string[] = /* @__PURE__ */ Object.keys(BUILTIN_SPECS);

/**
 * Compact dispatch metadata for the client runtime:
 * `verb → [space-separated listen-level triggers, consume, preventDefault]`.
 *
 * This is a size-budget projection of BUILTIN_SPECS (ADR-12, gate in
 * scripts/build-behaviors.mjs) — built-in handlers read their own attributes
 * directly, so the full option schemas never ship to the browser.
 * A unit test pins every entry against BUILTIN_SPECS + EVENT_TABLE, so the
 * two cannot drift (the ADR-10 failure class stays untestable-free).
 */
export type BuiltinMeta = readonly [triggers: string, consume: 0 | 1, preventDefault?: 0 | 1];

const CLICK_CONSUME: BuiltinMeta = ["click", 1];

// Null prototype: verb names come from DOM attributes, so a lookup like
// BUILTIN_META["constructor"] must miss, not return Object.prototype members.
export const BUILTIN_META: Record<string, BuiltinMeta | undefined> = Object.assign(Object.create(null) as Record<string, BuiltinMeta>, {
  toggle: CLICK_CONSUME,
  toggleClass: CLICK_CONSUME,
  remove: CLICK_CONSUME,
  clipboard: CLICK_CONSUME,
  drawer: CLICK_CONSUME,
  focus: CLICK_CONSUME,
  back: ["click", 1, 1] as BuiltinMeta,
  onEscape: ["keydown", 0] as BuiltinMeta,
  onClickOutside: ["click", 0] as BuiltinMeta,
  resetOnSuccess: [HTMX_EVENTS.afterRequest + " " + HTMX_EVENTS.afterSwap, 0] as BuiltinMeta,
});
