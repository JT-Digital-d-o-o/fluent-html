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
import { verbPrefix, type OptionType } from "./serialize.js";
import type { BehaviorEvent, LifecycleEvent } from "./events.js";
import { EVENT_TABLE, HTMX_EVENTS } from "./events.js";
import type { BehaviorTarget } from "./map.js";
import { BUILTIN_SPECS, type WireSpec } from "./specs.js";
import { BUILTIN_FIXTURES } from "./fixtures.js";

/** TS value type for one declared option wire type. */
export type SpecOptionValue<T extends OptionType> = T extends "string" | "class"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "id"
        ? Id
        : T extends "id-list"
          ? Id | readonly Id[]
          : T extends "string-list"
            ? readonly string[]
            : T extends "target"
              ? BehaviorTarget
              : T extends "event"
                ? BehaviorEvent
                : T extends { readonly enum: infer E extends readonly string[]; readonly list: true }
                  ? readonly E[number][]
                  : T extends { readonly enum: infer E extends readonly string[] }
                    ? E[number]
                    : never;

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

/** Extension names are namespaced: `<ns>:<verb>`, ns ≥ 2 lowercase chars (ADR-07). */
const EXTENSION_NAME_RE = /^[a-z]{2,}:[a-zA-Z][a-zA-Z0-9]*$/;

const extensions = new Map<string, BehaviorSpec>();
let sealed = false;

function knownPrefixes(): Map<string, string> {
  const prefixes = new Map<string, string>();
  for (const name of Object.keys(BUILTIN_SPECS)) prefixes.set(verbPrefix(name), name);
  for (const name of extensions.keys()) prefixes.set(verbPrefix(name), name);
  return prefixes;
}

/**
 * Register a framework-pack extension verb (e.g. `jt:listboxNav`). Throws on:
 * built-in override, missing/invalid namespace, duplicate, kebab-prefix
 * collision, missing fixtures, or any call after the registry sealed.
 *
 * Framework-layer-only — apps consume verbs, they never register them.
 */
export function registerBehavior(name: string, spec: BehaviorSpec): void {
  if (sealed) {
    throw new Error(`registerBehavior("${name}"): the behavior registry is sealed (asset already built) — register before buildBehaviorRuntime().`);
  }
  if (Object.prototype.hasOwnProperty.call(BUILTIN_SPECS, name)) {
    throw new Error(`registerBehavior("${name}"): built-in verbs cannot be overridden.`);
  }
  if (!EXTENSION_NAME_RE.test(name)) {
    throw new Error(`registerBehavior("${name}"): extension verbs must be namespaced "<ns>:<verb>" with a lowercase namespace of ≥ 2 chars (e.g. "jt:listboxNav").`);
  }
  if (extensions.has(name)) {
    throw new Error(`registerBehavior("${name}"): duplicate registration.`);
  }
  const prefix = verbPrefix(name);
  // A prefix that equals — or extends/truncates by whole segments — an existing
  // verb's prefix makes option attributes ambiguous on the wire (e.g.
  // "jt:listbox" + "jt:listboxNav" both own data-behavior-jt--listbox-…).
  for (const [existing, owner] of knownPrefixes()) {
    if (prefix === existing || prefix.startsWith(existing + "-") || existing.startsWith(prefix + "-")) {
      throw new Error(`registerBehavior("${name}"): attribute prefix "data-behavior-${prefix}-*" collides with "${owner}".`);
    }
  }
  if (!Array.isArray(spec.fixtures) || spec.fixtures.length < 1) {
    throw new Error(`registerBehavior("${name}"): at least one fixture is mandatory — a verb without acceptance coverage cannot register (ADR-12).`);
  }
  const hasOwn = Object.prototype.hasOwnProperty;
  for (const event of spec.events) {
    // own-property checks: "constructor" etc. must not resolve via the prototype
    if (!hasOwn.call(EVENT_TABLE, event) && !hasOwn.call(HTMX_EVENTS, event)) {
      throw new Error(`registerBehavior("${name}"): unknown event "${event}" — events come from the closed EVENT_TABLE/HTMX_EVENTS set.`);
    }
  }
  extensions.set(name, spec);
}

/** Seal the registry — called by `buildBehaviorRuntime` (and tests). Late registration throws. */
export function sealBehaviorRegistry(): void {
  sealed = true;
}

/** @internal test-only escape hatch */
export function unsafeResetBehaviorRegistryForTests(): void {
  extensions.clear();
  sealed = false;
}

/** The wire spec for a verb — built-in or registered extension — or undefined. */
export function getBehaviorSpec(name: string): WireSpec | undefined {
  // own-property check: "constructor" etc. must miss, not surface Object.prototype
  if (Object.prototype.hasOwnProperty.call(BUILTIN_SPECS, name)) return BUILTIN_SPECS[name];
  return extensions.get(name);
}

/** All verbs with their specs and fixtures — feeds the acceptance `matrix()`. */
export function allBehaviors(): { name: string; spec: WireSpec; fixtures: readonly Record<string, unknown>[] }[] {
  const rows: { name: string; spec: WireSpec; fixtures: readonly Record<string, unknown>[] }[] = [];
  for (const [name, spec] of Object.entries(BUILTIN_SPECS)) {
    rows.push({ name, spec, fixtures: BUILTIN_FIXTURES[name] ?? [] });
  }
  for (const [name, spec] of extensions.entries()) {
    rows.push({ name, spec, fixtures: spec.fixtures });
  }
  return rows;
}

/** Extension wire specs (schema only, no fixtures) — injected into the built runtime asset. */
export function extensionWireSpecs(): Record<string, WireSpec> {
  const out: Record<string, WireSpec> = {};
  for (const [name, spec] of extensions.entries()) {
    out[name] = { options: spec.options, events: spec.events, preventDefault: spec.preventDefault, consume: spec.consume };
  }
  return out;
}

function stableTypeRepr(type: OptionType): string {
  return typeof type === "string" ? type : `enum(${type.enum.join("|")})${type.list ? "[]" : ""}`;
}

/**
 * Content hash of the effective registry (names + option schemas + events +
 * flags). Embedded in the asset filename and the
 * `<html data-fluent-behaviors="<version>:<hash>">` stamp; the runtime asserts
 * the match so name/schema skew is loud, never silent (ADR-11).
 */
export function registryHash(): string {
  const names = [...Object.keys(BUILTIN_SPECS), ...extensions.keys()].sort();
  let repr = "";
  for (const name of names) {
    const spec = getBehaviorSpec(name)!;
    const options = Object.keys(spec.options)
      .sort()
      .map((k) => `${k}:${stableTypeRepr(spec.options[k]!)}`)
      .join(",");
    repr += `${name}{${options}}[${spec.events.join(",")}]${spec.preventDefault ? "p" : ""}${spec.consume ? "c" : ""};`;
  }
  // FNV-1a 32-bit — dependency-free, deterministic across platforms.
  let hash = 0x811c9dc5;
  for (let i = 0; i < repr.length; i++) {
    hash ^= repr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
