/**
 * Variant-object key derivation (llm-styling/object-variants) — the single
 * source for which object keys exist in `VariantStyleObject`, which vocab row
 * each emits through, and which fixed leading args it carries.
 *
 * Consumed by the library runtime (`applyVariantObject` builds its key→emit
 * map here), by the types emitter (`scripts/gen-vocab/emit-variant-object.ts`
 * renders `StyleProps` from the same specs), and by the ESLint plugin's
 * derived tables — one derivation, three artifacts, no drift.
 *
 * Mechanical rules (rows without an explicit `variantObject` spec):
 *  - every row contributes its method name as a key (`bg`, `truncate`, `ring`);
 *  - `spacing` rows additionally expand their directional forms into flat keys
 *    named after the emitted class prefix (`gap` → `gapX`/`gapY`, `scrollM` →
 *    `scrollMx`…`scrollMr`), skipping keys another row already owns (`p`'s
 *    `px` expansion yields to the real `px` row).
 * Non-mechanical rows (multi-arg customs, positional flattening like
 * `translate` → `translateX`) declare `variantObject.keys` on the vocab row.
 *
 * @module
 */
import { classVocab } from "./vocab.js";
import type { EmitShape, UtilityDef } from "./types.js";

/**
 * Tier-1 variant methods/nested keys → the Tailwind variant prefix each emits.
 * `xl2` is the one divergent spelling (`2xl` is not an identifier — see the
 * 2026-08-01 decision record); `.variant("2xl", …)` keeps the exact spelling.
 */
export const DIRECT_VARIANTS = {
  hover: "hover",
  focus: "focus",
  focusVisible: "focus-visible",
  focusWithin: "focus-within",
  active: "active",
  disabled: "disabled",
  checked: "checked",
  dark: "dark",
  first: "first",
  last: "last",
  odd: "odd",
  even: "even",
  groupHover: "group-hover",
  peerChecked: "peer-checked",
  before: "before",
  after: "after",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
  xl2: "2xl",
} as const;

/** Tier-1 variant member names (`hover` | … | `xl2`). */
export type DirectVariant = keyof typeof DIRECT_VARIANTS;

/** One `VariantStyleObject` style key: where it emits and what it prepends. */
export type VariantKeySpec = {
  /** The object key (`px`, `translateY`, `gapX`). */
  readonly key: string;
  /** The owning vocab row. */
  readonly def: UtilityDef;
  /** The row's emit shape (denormalized for direct `emitClasses` calls). */
  readonly emit: EmitShape;
  /** Fixed leading args prepended before the value's own args. */
  readonly pre: readonly string[];
  /** Explicit TS value-type expression (emitter-only; derived when absent). */
  readonly type?: string;
};

/** Directional expansions per spacing row: abbrev rows get all six, plain rows the two axes. */
const ABBREV_DIRS = ["x", "y", "t", "b", "l", "r"] as const;
const AXIS_DIRS = ["x", "y"] as const;

/** `scroll-mx` → `scrollMx` — the canonical camelCase of a class prefix. */
function camelCase(clsPrefix: string): string {
  return clsPrefix
    .split("-")
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

function buildSpecs(): readonly VariantKeySpec[] {
  const specs: VariantKeySpec[] = [];
  const taken = new Set<string>();
  const push = (spec: VariantKeySpec): void => {
    if (taken.has(spec.key)) throw new Error(`variant-keys: duplicate object key "${spec.key}"`);
    if (spec.key in DIRECT_VARIANTS) throw new Error(`variant-keys: style key "${spec.key}" collides with a variant name`);
    taken.add(spec.key);
    specs.push(spec);
  };

  // Pass 1 — every row's own key (method name or explicit variantObject keys).
  for (const def of classVocab) {
    const vo = def.variantObject;
    if (vo && "skip" in vo) continue;
    if (vo) {
      for (const k of vo.keys) {
        push({ key: k.key ?? def.method, def, emit: def.emit, pre: k.pre ?? [], ...(k.type !== undefined ? { type: k.type } : {}) });
      }
    } else {
      push({ key: def.method, def, emit: def.emit, pre: [] });
    }
  }

  // Pass 2 — spacing-row directional expansions, yielding to keys real rows own.
  for (const def of classVocab) {
    if (def.emit.kind !== "spacing" || def.variantObject) continue;
    const { prefix, sep, abbrev } = def.emit;
    for (const dir of abbrev ? ABBREV_DIRS : AXIS_DIRS) {
      const key = camelCase(`${prefix}${sep === "" ? "" : sep}${dir}`);
      if (taken.has(key)) continue;
      taken.add(key);
      specs.push({ key, def, emit: def.emit, pre: [dir] });
    }
  }

  return specs;
}

/** All `VariantStyleObject` style keys, in vocab order (base keys, then expansions). */
export const variantKeySpecs: readonly VariantKeySpec[] = buildSpecs();
