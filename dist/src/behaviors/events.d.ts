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
export declare const EVENT_TABLE: {
    readonly click: {
        readonly listen: "click";
    };
    readonly dblclick: {
        readonly listen: "dblclick";
    };
    readonly change: {
        readonly listen: "change";
    };
    readonly input: {
        readonly listen: "input";
    };
    readonly submit: {
        readonly listen: "submit";
    };
    readonly keydown: {
        readonly listen: "keydown";
    };
    readonly focus: {
        readonly listen: "focusin";
    };
    readonly blur: {
        readonly listen: "focusout";
    };
    readonly focusin: {
        readonly listen: "focusin";
    };
    readonly focusout: {
        readonly listen: "focusout";
    };
    readonly mouseenter: {
        readonly listen: "mouseover";
        readonly relatedGuard: true;
    };
    readonly mouseleave: {
        readonly listen: "mouseout";
        readonly relatedGuard: true;
    };
};
/** The closed union of author-facing trigger names — always equals listener capability. */
export type BehaviorEvent = keyof typeof EVENT_TABLE;
/** All author-facing event names (for emit-time validation + enum serialization). */
export declare const EVENT_NAMES: readonly BehaviorEvent[];
/**
 * The de-duplicated set of DOM events the runtime delegates at the document
 * (capture phase). Written as a literal so the client asset ships ~90 bytes
 * instead of the whole EVENT_TABLE (ADR-12 size budget); a unit test pins it
 * byte-exactly to the EVENT_TABLE derivation, so it cannot drift (ADR-10).
 */
export declare const LISTEN_SET: readonly string[];
/** Resolve an author-facing event name to its delegated listener name (emit-time remap). */
export declare function resolveEvent(name: BehaviorEvent): string;
/**
 * The only htmx literals in the entire behavior system (C4 quarantine).
 * A beta rename is a one-const edit re-verified by the pinned acceptance matrix.
 * Both listeners are registered unconditionally and are inert without htmx.
 */
export declare const HTMX_EVENTS: {
    readonly afterSwap: "htmx:after:swap";
    readonly afterRequest: "htmx:after:request";
};
export type LifecycleEvent = keyof typeof HTMX_EVENTS;
export declare const LIFECYCLE_NAMES: readonly LifecycleEvent[];
//# sourceMappingURL=events.d.ts.map