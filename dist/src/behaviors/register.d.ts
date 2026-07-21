/**
 * Server half of the behavior registry (ADR-07): DATA-ONLY specs. The client
 * handler is a real TS module calling `defineBehavior` (see
 * `fluent-html/behavior-runtime`), compiled by `buildBehaviorRuntime`.
 *
 * FRAMEWORK-LAYER-ONLY (ADR-07 amendment): apps never call `registerBehavior` —
 * new verbs enter via a framework PR + template bump. The eslint plugin flags
 * imports outside framework packages.
 *
 * @module
 */
import type { Id } from "../ids.js";
import { type OptionType } from "./serialize.js";
import type { BehaviorEvent, LifecycleEvent } from "./events.js";
import type { BehaviorTarget } from "./map.js";
import { type WireSpec } from "./specs.js";
/** TS value type for one declared option wire type. */
export type SpecOptionValue<T extends OptionType> = T extends "string" | "class" ? string : T extends "number" ? number : T extends "boolean" ? boolean : T extends "id" ? Id : T extends "id-list" ? Id | readonly Id[] : T extends "string-list" ? readonly string[] : T extends "target" ? BehaviorTarget : T extends "event" ? BehaviorEvent : T extends {
    readonly enum: infer E extends readonly string[];
    readonly list: true;
} ? readonly E[number][] : T extends {
    readonly enum: infer E extends readonly string[];
} ? E[number] : never;
/** A fixture: sample options satisfying the spec's wire schema (feeds `matrix()`, ADR-12). */
export type SpecOptions<O extends Record<string, OptionType>> = {
    readonly [K in keyof O]?: SpecOptionValue<O[K]>;
};
export type BehaviorSpec<O extends Record<string, OptionType> = Record<string, OptionType>> = {
    /** Wire schema: validated at emit, decoded in the runtime. Data only — no functions, no JSON blobs. */
    readonly options: O;
    /**
     * The live trigger set from the closed table — every declared event fires
     * the verb; an emitted `event` option override replaces the whole set.
     * List the canonical/default trigger first.
     */
    readonly events: readonly (BehaviorEvent | LifecycleEvent)[];
    readonly preventDefault?: boolean;
    /** Default consumption for the dispatch walk (ADR-04). */
    readonly consume?: boolean;
    /** MANDATORY ≥ 1 — a verb without acceptance coverage cannot register (ADR-12). */
    readonly fixtures: readonly [SpecOptions<O>, ...SpecOptions<O>[]];
};
/**
 * Register a framework-pack extension verb (e.g. `jt:listboxNav`). Throws on:
 * built-in override, missing/invalid namespace, duplicate, kebab-prefix
 * collision, missing fixtures, or any call after the registry sealed.
 *
 * Framework-layer-only — apps consume verbs, they never register them.
 */
export declare function registerBehavior(name: string, spec: BehaviorSpec): void;
/** Seal the registry — called by `buildBehaviorRuntime` (and tests). Late registration throws. */
export declare function sealBehaviorRegistry(): void;
/** @internal test-only escape hatch */
export declare function unsafeResetBehaviorRegistryForTests(): void;
/** The wire spec for a verb — built-in or registered extension — or undefined. */
export declare function getBehaviorSpec(name: string): WireSpec | undefined;
/** All verbs with their specs and fixtures — feeds the acceptance `matrix()`. */
export declare function allBehaviors(): {
    name: string;
    spec: WireSpec;
    fixtures: readonly Record<string, unknown>[];
}[];
/** Extension wire specs (schema only, no fixtures) — injected into the built runtime asset. */
export declare function extensionWireSpecs(): Record<string, WireSpec>;
/**
 * Content hash of the effective registry (names + option schemas + events +
 * flags). Embedded in the asset filename and the
 * `<html data-fluent-behaviors="<version>:<hash>">` stamp; the runtime asserts
 * the match so name/schema skew is loud, never silent (ADR-11).
 */
export declare function registryHash(): string;
//# sourceMappingURL=register.d.ts.map