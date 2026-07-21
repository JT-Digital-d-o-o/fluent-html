/**
 * Behavior event surface — the SINGLE SOURCE (ADR-10) for:
 *  - the `BehaviorEvent` TS union (derived via `typeof`/`satisfies`),
 *  - the runtime's delegated listener set (derived from the `listen` values),
 *  - the acceptance matrix's mechanical enumeration.
 *
 * The set is closed. `focus`/`blur`/`mouseenter`/`mouseleave` are emit-time
 * aliases: `.behavior(v, { event })` resolves them to their delegatable
 * `listen` name at emit, so the client runtime has no remap table. Delegated
 * `mouseover`/`mouseout` always apply the relatedTarget containment guard
 * (enter/leave emulation).
 *
 * @module
 */

export type EventBinding = {
  /** The delegatable DOM event actually listened for at the document. */
  readonly listen: string;
  /** Apply the relatedTarget containment guard (mouseenter/mouseleave emulation). */
  readonly relatedGuard?: true;
};

export const EVENT_TABLE = {
  click: { listen: "click" },
  dblclick: { listen: "dblclick" },
  change: { listen: "change" },
  input: { listen: "input" },
  submit: { listen: "submit" },
  keydown: { listen: "keydown" },
  focus: { listen: "focusin" },
  blur: { listen: "focusout" },
  focusin: { listen: "focusin" },
  focusout: { listen: "focusout" },
  mouseenter: { listen: "mouseover", relatedGuard: true },
  mouseleave: { listen: "mouseout", relatedGuard: true },
} as const satisfies Record<string, EventBinding>;

/** The closed union of author-facing trigger names — always equals listener capability. */
export type BehaviorEvent = keyof typeof EVENT_TABLE;

/** All author-facing event names (for emit-time validation + enum serialization). */
export const EVENT_NAMES = /* @__PURE__ */ Object.keys(EVENT_TABLE) as readonly BehaviorEvent[];

/**
 * The de-duplicated set of DOM events the runtime delegates at the document
 * (capture phase). Written as a literal so the client asset ships ~90 bytes
 * instead of the whole EVENT_TABLE (ADR-12 size budget); a unit test pins it
 * byte-exactly to the EVENT_TABLE derivation, so it cannot drift (ADR-10).
 */
export const LISTEN_SET: readonly string[] = [
  "click", "dblclick", "change", "input", "submit", "keydown", "focusin", "focusout", "mouseover", "mouseout",
];

/** Resolve an author-facing event name to its delegated listener name (emit-time remap). */
export function resolveEvent(name: BehaviorEvent): string {
  return EVENT_TABLE[name].listen;
}

/**
 * The only htmx literals in the entire behavior system (C4 quarantine).
 * A beta rename is a one-const edit re-verified by the pinned acceptance matrix.
 * Both listeners are registered unconditionally and are inert without htmx.
 */
export const HTMX_EVENTS = {
  afterSwap: "htmx:after:swap",
  afterRequest: "htmx:after:request",
} as const;

export type LifecycleEvent = keyof typeof HTMX_EVENTS;

export const LIFECYCLE_NAMES = /* @__PURE__ */ Object.keys(HTMX_EVENTS) as readonly LifecycleEvent[];
