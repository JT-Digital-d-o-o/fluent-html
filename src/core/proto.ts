import type { Tag } from "./tag.js";

/**
 * Typed prototype-write helpers — the ONE place the `_sk` schema-key array and the
 * `_t` node discriminant are written. Replaces ~53 scattered `(X.prototype as any)`
 * casts across `src/core` + `src/elements` with two typed calls and a single
 * internal cast, so adding an element no longer hand-suppresses `no-explicit-any`.
 * @module
 */

/** @internal The shape we write onto node prototypes. */
interface NodeProto {
  _t?: number;
  _sk?: readonly string[];
}

/**
 * Set the readonly `_sk` schema-key array on a Tag-subclass prototype — the keys
 * whose values the renderer emits as attributes. @internal
 */
export function defineSchemaKeys(ctor: abstract new (...args: never[]) => Tag, keys: readonly string[]): void {
  (ctor.prototype as unknown as NodeProto)._sk = keys;
}

/**
 * Set the `_t` node discriminant on a node-class prototype (Tag = 1, RawString = 2, …),
 * driving the `isTag`/`isRawString` guards. @internal
 */
export function setDiscriminant(ctor: { prototype: object }, t: number): void {
  (ctor.prototype as unknown as NodeProto)._t = t;
}
