/**
 * Built-in wire specs — the schema half shared by the server emitter (option
 * validation at emit) and the client runtime (option decode). DOM-free and
 * fixture-free: fixtures live server-side in `fixtures.ts` so they never cost
 * asset bytes.
 *
 * @module
 */
import type { OptionType } from "./serialize.js";
import { type BehaviorEvent, type LifecycleEvent } from "./events.js";
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
export declare const BUILTIN_SPECS: Record<string, WireSpec>;
export declare const BUILTIN_NAMES: readonly string[];
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
export declare const BUILTIN_META: Record<string, BuiltinMeta | undefined>;
//# sourceMappingURL=specs.d.ts.map