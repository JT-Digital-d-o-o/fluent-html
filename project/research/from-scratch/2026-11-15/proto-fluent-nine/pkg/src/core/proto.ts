import type { Tag } from "./tag.js";

/**
 * Typed prototype-write helpers — the ONE place the `_sk` schema-key array and the
 * `_t` node discriminant are written. Replaces ~53 scattered `(X.prototype as any)`
 * casts across `src/core` + `src/elements` with two typed calls and a single
 * internal cast, so adding an element no longer hand-suppresses `no-explicit-any`.
 * @module
 */

/**
 * A schema key the renderer emits as an attribute. Either a plain `string` (the
 * declared name == the emitted attribute name), or a `[prop, attr]` tuple that
 * decouples them — so a camelCased name can emit a kebab/colon attribute name
 * (e.g. `['httpEquiv', 'http-equiv']`). Storage fields are private and
 * `_`-prefixed (privatized so no public field shadows its setter); the prefix is
 * applied here at definition time, so schema keys stay spelled as the attribute
 * grammar. @internal
 */
export type SchemaKey = string | readonly [prop: string, attr: string];

/** @internal A normalized schema entry: the private storage key + the emitted attribute name. */
export type ResolvedSchemaKey = readonly [storage: string, attr: string];

/** @internal The shape we write onto node prototypes. */
interface NodeProto {
  _t?: number;
  _sk?: readonly ResolvedSchemaKey[];
}

/**
 * Set the readonly `_sk` schema-key array on a Tag-subclass prototype — the keys
 * whose values the renderer emits as attributes. Each entry is normalized to a
 * `[storage, attr]` pair with the `_` storage prefix applied once, here, so the
 * render loop never string-concatenates per attribute. @internal
 */
export function defineSchemaKeys(ctor: abstract new (...args: never[]) => Tag, keys: readonly SchemaKey[]): void {
  (ctor.prototype as unknown as NodeProto)._sk = keys.map((key): ResolvedSchemaKey =>
    typeof key === "string" ? [`_${key}`, key] : [`_${key[0]}`, key[1]],
  );
}

/**
 * Set the `_t` node discriminant on a node-class prototype (Tag = 1, RawString = 2, …),
 * driving the `isTag`/`isRawString` guards. @internal
 */
export function setDiscriminant(ctor: { prototype: object }, t: number): void {
  (ctor.prototype as unknown as NodeProto)._t = t;
}
