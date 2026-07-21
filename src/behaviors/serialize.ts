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
export type OptionType =
  | "string"
  | "class"
  | "number"
  | "boolean"
  | "id"
  | "id-list"
  | "string-list"
  | "target"
  | "event"
  | { readonly enum: readonly string[]; readonly list?: boolean };

const KEBAB_RE = /[A-Z]/g;

/** camelCase → kebab-case for one path segment. */
export function kebab(segment: string): string {
  return segment.replace(KEBAB_RE, (c) => "-" + c.toLowerCase());
}

/**
 * The attribute prefix a verb owns: `toggleClass` → `toggle-class`,
 * `jt:listboxNav` → `jt--listbox-nav` (namespace joins with a double hyphen).
 */
export function verbPrefix(verb: string): string {
  const colon = verb.indexOf(":");
  return colon === -1 ? kebab(verb) : verb.slice(0, colon) + "--" + kebab(verb.slice(colon + 1));
}

/** Full option attribute name for `verb` + dotted `optionPath`. */
export function optionAttr(verb: string, optionPath: string): string {
  return "data-behavior-" + verbPrefix(verb) + "-" + optionPath.split(".").map(kebab).join("-");
}

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
export function decodeOptions(
  verb: string,
  options: Record<string, OptionType>,
  get: (attrName: string) => string | null,
): DecodedOptions {
  const out: DecodedOptions = {};
  for (const path of Object.keys(options)) {
    const raw = get(optionAttr(verb, path));
    if (raw === null) continue;
    const type = options[path]!;
    let value: unknown = raw;
    if (type === "number") value = Number(raw);
    else if (type === "boolean") value = raw === "true";
    else if (type === "id-list" || type === "string-list") value = raw.split(" ");
    else if (typeof type === "object" && type.list) value = raw.split(" ");
    // strings, ids, enums, events and targets ride as-is (targets are resolved later)
    const segments = path.split(".");
    let host = out;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i]!;
      host = (host[seg] ??= {}) as DecodedOptions;
    }
    host[segments[segments.length - 1]!] = value;
  }
  return out;
}
