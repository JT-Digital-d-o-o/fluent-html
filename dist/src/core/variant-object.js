import { emitClasses, variantKeySpecs, DIRECT_VARIANTS } from "../class-vocab/index.js";
/** key → emit spec, built once from the shared class-vocab derivation. */
const KEY_EMIT = new Map(variantKeySpecs.map((spec) => [spec.key, spec]));
/** variant name → Tailwind prefix (own-property lookup so "toString" etc. miss). */
const VARIANT_PREFIX = new Map(Object.entries(DIRECT_VARIANTS));
/**
 * A style value → the emit-args it contributes (after the spec's fixed `pre`
 * args). Trailing `undefined` tuple members are trimmed; a mid-tuple
 * `undefined` (gradient's optional direction before an interpolation) is
 * passed through positionally — the custom emitters `??`-default it.
 */
function valueArgs(value) {
    if (value === true)
        return [];
    if (Array.isArray(value)) {
        let end = value.length;
        while (end > 0 && value[end - 1] === undefined)
            end--;
        return value.slice(0, end).map((a) => (a === undefined ? a : String(a)));
    }
    return [String(value)];
}
/**
 * Apply a variant object under `prefix` — the runtime behind the tier-1
 * variant methods and `.variant()`. Pushes the prefix onto the tag's variant
 * stack, emits each key through the shared vocab emitters, recurses into
 * nested variant keys, and restores the outer prefix in a `finally` so a
 * throw can never leak a prefix onto later classes of a reused tag.
 */
export function applyVariantObject(tag, prefix, obj) {
    const outer = tag._variantPrefix;
    tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
    try {
        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined || value === false)
                continue;
            const nested = VARIANT_PREFIX.get(key);
            if (nested !== undefined) {
                applyVariantObject(tag, nested, value);
                continue;
            }
            const spec = KEY_EMIT.get(key);
            if (spec === undefined) {
                // Type-checked call sites can't reach this; a loud throw beats
                // silently emitting nothing for a casted/dynamic object.
                throw new Error(`variant object: unknown style key "${key}"`);
            }
            for (const cls of emitClasses(spec.emit, [...spec.pre, ...valueArgs(value)])) {
                tag.addClass(cls);
            }
        }
    }
    finally {
        tag._variantPrefix = outer;
    }
    return tag;
}
//# sourceMappingURL=variant-object.js.map