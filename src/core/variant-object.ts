/**
 * Object-form variants (llm-styling/object-variants) — the typed style-object
 * surface behind `.hover({…})`, `.md({…})`, and the generic `.variant(name, {…})`.
 *
 * A variant object maps canonical style keys (the same names as the fluent
 * methods) to values; nested tier-1 variant names stack prefixes
 * (`.md({ hover: { bg: "blue-700" } })` → `md:hover:bg-blue-700`). `false` and
 * `undefined` values are skipped, so conditionals are plain expressions —
 * no lambda, no wrong-receiver hazard, and a misplaced key is a compile error.
 *
 * @module
 */
import type { Tag } from "./tag.js";
import { emitClasses, variantKeySpecs, DIRECT_VARIANTS } from "../class-vocab/index.js";
import type { VariantKeySpec } from "../class-vocab/index.js";
import type { StyleProps } from "./variant-object.gen.js";

export type { StyleProps } from "./variant-object.gen.js";
export type { DirectVariant } from "../class-vocab/index.js";

/** Nested tier-1 variant keys — each stacks its prefix onto the enclosing one. */
export type NestedVariants = {
  [K in keyof typeof DIRECT_VARIANTS]?: VariantStyleObject | undefined;
};

/**
 * A variant's style object: canonical style keys ({@link StyleProps}) plus
 * nested tier-1 variant names ({@link NestedVariants}). Excess-property
 * checking spell-checks keys and values two levels deep at every literal use;
 * an extracted const should be pinned with `satisfies VariantStyleObject`.
 */
export interface VariantStyleObject extends StyleProps, NestedVariants {}

/** key → emit spec, built once from the shared class-vocab derivation. */
const KEY_EMIT: ReadonlyMap<string, VariantKeySpec> = new Map(
  variantKeySpecs.map((spec) => [spec.key, spec]),
);

/** variant name → Tailwind prefix (own-property lookup so "toString" etc. miss). */
const VARIANT_PREFIX: ReadonlyMap<string, string> = new Map(Object.entries(DIRECT_VARIANTS));

/**
 * A style value → the emit-args it contributes (after the spec's fixed `pre`
 * args). Trailing `undefined` tuple members are trimmed; a mid-tuple
 * `undefined` (gradient's optional direction before an interpolation) is
 * passed through positionally — the custom emitters `??`-default it.
 */
function valueArgs(value: unknown): readonly string[] {
  if (value === true) return [];
  if (Array.isArray(value)) {
    let end = value.length;
    while (end > 0 && value[end - 1] === undefined) end--;
    return value.slice(0, end).map((a) => (a === undefined ? a : String(a))) as readonly string[];
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
export function applyVariantObject(tag: Tag, prefix: string, obj: VariantStyleObject): Tag {
  const outer = tag._variantPrefix;
  tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
  try {
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === false) continue;
      const nested = VARIANT_PREFIX.get(key);
      if (nested !== undefined) {
        applyVariantObject(tag, nested, value as VariantStyleObject);
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
  } finally {
    tag._variantPrefix = outer;
  }
  return tag;
}
