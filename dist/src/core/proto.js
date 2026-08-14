/**
 * Set the readonly `_sk` schema-key array on a Tag-subclass prototype — the keys
 * whose values the renderer emits as attributes. Each entry is normalized to a
 * `[storage, attr]` pair with the `_` storage prefix applied once, here, so the
 * render loop never string-concatenates per attribute. @internal
 */
export function defineSchemaKeys(ctor, keys) {
    ctor.prototype._sk = keys.map((key) => typeof key === "string" ? [`_${key}`, key] : [`_${key[0]}`, key[1]]);
}
/**
 * Set the `_t` node discriminant on a node-class prototype (Tag = 1, RawString = 2, …),
 * driving the `isTag`/`isRawString` guards. @internal
 */
export function setDiscriminant(ctor, t) {
    ctor.prototype._t = t;
}
//# sourceMappingURL=proto.js.map