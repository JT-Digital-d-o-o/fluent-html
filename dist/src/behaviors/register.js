import { verbPrefix } from "./serialize.js";
import { EVENT_TABLE, HTMX_EVENTS } from "./events.js";
import { BUILTIN_SPECS } from "./specs.js";
import { BUILTIN_FIXTURES } from "./fixtures.js";
/** Extension names are namespaced: `<ns>:<verb>`, ns ≥ 2 lowercase chars (ADR-07). */
const EXTENSION_NAME_RE = /^[a-z]{2,}:[a-zA-Z][a-zA-Z0-9]*$/;
const extensions = new Map();
let sealed = false;
function knownPrefixes() {
    const prefixes = new Map();
    for (const name of Object.keys(BUILTIN_SPECS))
        prefixes.set(verbPrefix(name), name);
    for (const name of extensions.keys())
        prefixes.set(verbPrefix(name), name);
    return prefixes;
}
/**
 * Register a framework-pack extension verb (e.g. `jt:listboxNav`). Throws on:
 * built-in override, missing/invalid namespace, duplicate, kebab-prefix
 * collision, missing fixtures, or any call after the registry sealed.
 *
 * Framework-layer-only — apps consume verbs, they never register them.
 */
export function registerBehavior(name, spec) {
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
export function sealBehaviorRegistry() {
    sealed = true;
}
/** @internal test-only escape hatch */
export function unsafeResetBehaviorRegistryForTests() {
    extensions.clear();
    sealed = false;
}
/** The wire spec for a verb — built-in or registered extension — or undefined. */
export function getBehaviorSpec(name) {
    // own-property check: "constructor" etc. must miss, not surface Object.prototype
    if (Object.prototype.hasOwnProperty.call(BUILTIN_SPECS, name))
        return BUILTIN_SPECS[name];
    return extensions.get(name);
}
/** All verbs with their specs and fixtures — feeds the acceptance `matrix()`. */
export function allBehaviors() {
    const rows = [];
    for (const [name, spec] of Object.entries(BUILTIN_SPECS)) {
        rows.push({ name, spec, fixtures: BUILTIN_FIXTURES[name] ?? [] });
    }
    for (const [name, spec] of extensions.entries()) {
        rows.push({ name, spec, fixtures: spec.fixtures });
    }
    return rows;
}
/** Extension wire specs (schema only, no fixtures) — injected into the built runtime asset. */
export function extensionWireSpecs() {
    const out = {};
    for (const [name, spec] of extensions.entries()) {
        out[name] = { options: spec.options, events: spec.events, preventDefault: spec.preventDefault, consume: spec.consume };
    }
    return out;
}
function stableTypeRepr(type) {
    return typeof type === "string" ? type : `enum(${type.enum.join("|")})${type.list ? "[]" : ""}`;
}
/**
 * Content hash of the effective registry (names + option schemas + events +
 * flags). Embedded in the asset filename and the
 * `<html data-fluent-behaviors="<version>:<hash>">` stamp; the runtime asserts
 * the match so name/schema skew is loud, never silent (ADR-11).
 */
export function registryHash() {
    const names = [...Object.keys(BUILTIN_SPECS), ...extensions.keys()].sort();
    let repr = "";
    for (const name of names) {
        const spec = getBehaviorSpec(name);
        const options = Object.keys(spec.options)
            .sort()
            .map((k) => `${k}:${stableTypeRepr(spec.options[k])}`)
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
//# sourceMappingURL=register.js.map