/**
 * `fluent-html/behavior-runtime` — the CLIENT half of the extension surface
 * (ADR-07): a real TypeScript module compiled by `buildBehaviorRuntime`
 * (esbuild, browser target) — never `fn.toString()`, never inline source
 * strings.
 *
 * FRAMEWORK-LAYER-ONLY (ADR-07 amendment): apps never call `defineBehavior`;
 * framework packs (the `jt:` namespace) pair a server `registerBehavior` spec
 * with a `defineBehavior` handler here.
 *
 * @module
 */
import type { Id } from "../../ids.js";
import type { BehaviorMap } from "../map.js";
/** Wire form of a target on the client: an id string, `"@self"`, or `"closest:<selector>"`. */
export type WireTarget = string;
/** Server option shapes mapped to their decoded client forms (Ids arrive as strings). */
export type Wire<T> = T extends void ? Record<string, never> : {
    [K in keyof T]: WireValue<T[K]>;
};
type WireValue<V> = [V] extends [Id] ? WireTarget : [V] extends [Id | readonly Id[]] ? string[] : [V] extends [Id | "@self" | {
    closest: string;
}] ? WireTarget : V extends readonly (infer E extends string)[] ? E[] : V extends object ? Wire<V> : V;
/**
 * The C6 fence — the mediated, DOM-verbs-only context handed to handlers.
 * No store, no fetch, no observers, no pub/sub, no fire/dispatch (ADR-08).
 */
export type FxCtx = {
    event: Event;
    /** Defensive htmx detail read (lifecycle triggers only) — undefined otherwise. */
    status(): number | undefined;
    /** The only query API: resolve a wire target from `from` (default: the carrier). */
    resolve(target: WireTarget, from?: Element): Element[];
    /** Token-guarded transient effect — a newer invocation cancels the pending revert. */
    transient(el: Element, apply: () => void, revert: () => void, ms: number): void;
    /** Element-scoped timeout: a no-op once the carrier left the document. */
    after(ms: number, f: () => void): void;
};
export type BehaviorHandler = (el: Element, opts: any, fx: FxCtx) => boolean | void;
/** @internal the dispatcher's handler table — built-ins land here at boot, before any extension module evaluates. */
export declare const handlers: Record<string, BehaviorHandler>;
/**
 * Attach the client handler for a verb. Returning `true` consumes the event
 * (halts the dispatch walk, ADR-04); returning nothing defers to the verb
 * spec's `consume` default. Duplicate registration throws — built-ins are
 * non-overridable (they register first at boot).
 */
export declare function defineBehavior<K extends keyof BehaviorMap>(name: K, handler: (el: Element, opts: Wire<BehaviorMap[K]>, fx: FxCtx) => boolean | void): void;
export {};
//# sourceMappingURL=define.d.ts.map