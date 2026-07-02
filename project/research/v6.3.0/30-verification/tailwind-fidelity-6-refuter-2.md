# Verification: tailwind-fidelity-6 (refuter-2)

**Finding:** `TailwindOutline` missing `"solid"` and all outline widths — `outline-2` / `outline-solid` inexpressible; no `outlineColor()` / `outlineOffset()` companions.

**Verdict: CONFIRMED — not refuted.** Mode: refute-by-reproduction. The defect reproduced on both sides (fluent type surface and Tailwind v4 utility set).

## Evidence

### 1. Source and dist match the claimed union exactly

- `src/core/tailwind-types.ts:204` — `export type TailwindOutline = "none" | "dashed" | "dotted" | "double";`
- `dist/src/core/tailwind-types.d.ts:63` — identical union in the shipped declarations (package `fluent-html@6.2.0`, `types: dist/src/index.d.ts`).
- `src/core/tailwind-methods.ts:316` — `outline(value: TailwindOutline): this;` is the only outline arm (plus `outlineHidden()`); impl at line 778 is `addClass(\`outline-${value}\`)`.
- Grep across `src/` and `dist/` for `outlineColor`, `outlineOffset`, `outline-offset`: **zero hits**. No companions exist.
- `src/class-vocab/vocab.ts:211-212` — vocab only has `pre("outline", "outline")` + `stat("outlineHidden", "outline-hidden")`; no color/offset entries.

### 2. Compile probe against dist (repo's own tsc, exit 0)

Probe at `scratchpad/outline-probe/probe.ts`, resolved via `paths` to `/Users/tony/jt-digital/fluent-html/dist/src/index.d.ts`. All five gaps hold — each line compiles **only** under `@ts-expect-error` (a stale suppression would itself be an error, so this is a positive confirmation):

```typescript
// @ts-expect-error — no width arm
Div().outline(2);
// @ts-expect-error — "solid" rejected
Div().outline("solid");
// @ts-expect-error — no bracket hatch (closed union, no `[${string}]`)
Div().outline("[3px]");
// @ts-expect-error — method does not exist
Div().outlineColor("blue-500");
// @ts-expect-error — method does not exist
Div().outlineOffset("2");

// Only these pass: "none" | "dashed" | "dotted" | "double"
Div().outline("none").outline("dashed").outline("dotted").outline("double");
```

`tsc` exit 0 with all suppressions consumed. The standard v4 focus treatment `outline-2 outline-offset-2 outline-blue-500` is therefore inexpressible through the typed fluent surface (only via raw `addClass`, which also bypasses the vocab/safelist path).

### 3. Tailwind v4 side re-verified independently (tailwindcss@4.3.2 CLI)

Fresh install in scratchpad; `@source inline("outline-solid outline-1 outline-2 outline-4 outline-8 outline-offset-2 outline-blue-500")` built with `@tailwindcss/cli`. Output CSS contains all seven rules:

```
.outline-1 { … } .outline-2 { … } .outline-4 { … } .outline-8 { … }
.outline-offset-2 { … } .outline-blue-500 { … } .outline-solid { … }
```

So every utility the finding says is missing is a real, compiling Tailwind 4.3.2 utility.

## Notes

- The finding's evidence anchor, quoted union, and version claim ("verified … compile in 4.3.2") are all accurate as stated.
- The proposal (widen the union to `"none" | "solid" | "dashed" | "dotted" | "double" | 0|1|2|4|8 | bracket hatch` + add `outlineColor()`/`outlineOffset()`) matches the existing ring-family pattern (`TailwindRingWidth` + `ringColor`) and is consistent with the observed gap.
