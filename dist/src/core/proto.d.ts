import type { Tag } from "./tag.js";
/**
 * Set the readonly `_sk` schema-key array on a Tag-subclass prototype — the keys
 * whose values the renderer emits as attributes. @internal
 */
export declare function defineSchemaKeys(ctor: abstract new (...args: never[]) => Tag, keys: readonly string[]): void;
/**
 * Set the `_t` node discriminant on a node-class prototype (Tag = 1, RawString = 2, …),
 * driving the `isTag`/`isRawString` guards. @internal
 */
export declare function setDiscriminant(ctor: {
    prototype: object;
}, t: number): void;
//# sourceMappingURL=proto.d.ts.map