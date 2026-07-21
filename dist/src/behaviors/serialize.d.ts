/**
 * The wire grammar (ADR-01) — shared by the server emitter and the client
 * runtime so the two sides cannot drift. Frozen per major.
 *
 *  (1) `data-behavior` — ordered space-separated verb tokens.
 *  (2) Options: `data-behavior-<kebab(verb)>-<kebab(optionPath)>`; extension
 *      namespaces kebab with a double hyphen (`jt:listboxNav` →
 *      `data-behavior-jt--listbox-nav-*`); nested groups flatten
 *      (`feedback.durationMs` → `-feedback-duration-ms`).
 *  (3) Serialization table: string identity; Id → id string; lists →
 *      space-separated; boolean → "true"/"false"; number → decimal; enum →
 *      literal; target → `<id>` | `"@self"` | `"closest:<selector>"`.
 *
 * No escapeJs anywhere on this path — values get normal HTML-attribute
 * escaping at render like every other attribute.
 *
 * @module
 */
/** The data-only option wire types a behavior spec may declare (ADR-07).
 * `"class"` is a single CSS class token (non-empty, no whitespace) — a plain
 * string on the wire, but emit-validated so `classList` calls can never throw
 * at event time (a v2-style runtime-dead behavior). */
export type OptionType = "string" | "class" | "number" | "boolean" | "id" | "id-list" | "string-list" | "target" | "event" | {
    readonly enum: readonly string[];
    readonly list?: boolean;
};
/** camelCase → kebab-case for one path segment. */
export declare function kebab(segment: string): string;
/**
 * The attribute prefix a verb owns: `toggleClass` → `toggle-class`,
 * `jt:listboxNav` → `jt--listbox-nav` (namespace joins with a double hyphen).
 */
export declare function verbPrefix(verb: string): string;
/** Full option attribute name for `verb` + dotted `optionPath`. */
export declare function optionAttr(verb: string, optionPath: string): string;
/**
 * Decoded client-side option values. Targets stay in wire form
 * (`"@self"` / `"closest:…"` / id string) and are resolved by the runtime.
 */
export type DecodedOptions = Record<string, unknown>;
/**
 * DOM-free wire decode — the client runtime passes `(name) => el.getAttribute(name)`.
 * Unknown/absent attributes yield no key (skew degrade: unknown options are
 * simply never read). Dotted paths are reconstructed into nested objects so
 * handlers see the natural `BehaviorMap` shape.
 */
export declare function decodeOptions(verb: string, options: Record<string, OptionType>, get: (attrName: string) => string | null): DecodedOptions;
//# sourceMappingURL=serialize.d.ts.map