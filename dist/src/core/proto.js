/**
 * Set the readonly `_sk` schema-key array on a Tag-subclass prototype — the keys
 * whose values the renderer emits as attributes. @internal
 */
export function defineSchemaKeys(ctor, keys) {
    ctor.prototype._sk = keys;
}
/**
 * Set the `_t` node discriminant on a node-class prototype (Tag = 1, RawString = 2, …),
 * driving the `isTag`/`isRawString` guards. @internal
 */
export function setDiscriminant(ctor, t) {
    ctor.prototype._t = t;
}
//# sourceMappingURL=proto.js.map