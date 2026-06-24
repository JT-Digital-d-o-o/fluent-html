import type { Tag } from "./tag.js";
/**
 * Typed prototype-write helpers — the ONE place the `_sk` schema-key array and the
 * `_t` node discriminant are written. Replaces ~53 scattered `(X.prototype as any)`
 * casts across `src/core` + `src/elements` with two typed calls and a single
 * internal cast, so adding an element no longer hand-suppresses `no-explicit-any`.
 * @module
 */
/**
 * A schema key the renderer emits as an attribute. Either a plain `string` (the JS
 * field name == the emitted attribute name), or a `[prop, attr]` tuple that decouples
 * them — so a camelCased field can emit a kebab/colon attribute name (e.g.
 * `['httpEquiv', 'http-equiv']`). @internal
 */
export type SchemaKey = string | readonly [prop: string, attr: string];
/**
 * Set the readonly `_sk` schema-key array on a Tag-subclass prototype — the keys
 * whose values the renderer emits as attributes. @internal
 */
export declare function defineSchemaKeys(ctor: abstract new (...args: never[]) => Tag, keys: readonly SchemaKey[]): void;
/**
 * Set the `_t` node discriminant on a node-class prototype (Tag = 1, RawString = 2, …),
 * driving the `isTag`/`isRawString` guards. @internal
 */
export declare function setDiscriminant(ctor: {
    prototype: object;
}, t: number): void;
//# sourceMappingURL=proto.d.ts.map