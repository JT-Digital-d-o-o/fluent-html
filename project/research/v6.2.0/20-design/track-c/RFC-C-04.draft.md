---
id: RFC-C-04
track: C
resolves: [#13, #65, #62]
api_surface:
  - "Tag.dropShadow(value?: TailwindDropShadow): this"
  - "Tag.dropShadowColor(color: TailwindColor): this"
  - "Tag.insetShadow(value?: TailwindInsetShadow): this"
  - "Tag.insetShadowColor(color: TailwindColor): this"
  - "Tag.insetRing(value?: TailwindRingWidth): this"
  - "Tag.insetRingColor(color: TailwindColor): this"
  - "Tag.mixBlend(mode: TailwindMixBlendMode): this"
  - "Tag.bgBlend(mode: TailwindBgBlendMode): this"
  - "Tag.isolate(): this"
  - "Tag.isolation(value: TailwindIsolation): this"
  - "type TailwindDropShadow"
  - "type TailwindInsetShadow"
  - "type TailwindMixBlendMode"
  - "type TailwindBgBlendMode"
  - "type TailwindIsolation"
  - "interface FluentCustomDropShadow"
  - "interface FluentCustomInsetShadow"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — new Effects/filters/compositing section covering the 10 methods"
  - "fluent-html.md — Tailwind reference rows for drop-shadow / inset-shadow / inset-ring / blend / isolation"
  - "JSDoc on all 10 methods + the two FluentCustom* augmentation seams in src/core/tailwind-types.ts"
  - "../fluent-html-tailwind-extractor/README.md — note the new vocab rows are auto-resolved (no emitter change)"
  - "../fluent-html-eslint-plugin/README.md — note the regenerated method allowlist + setClass auto-fix entries"
impact: "Closes the v4 effects/filters/compositing parity gap (independent inner-shadow + inner-ring layering, drop-shadow filter with color, blend modes, and the isolation stacking-context guard). All net-new primitives; no call-site churn."
effort: M
depends_on: []
status: proposed
---

# RFC-C-04 — Shadows, filters & blending

Independent shadow/ring layers (`dropShadow` / `dropShadowColor` / `insetShadow` /
`insetShadowColor` / `insetRing` / `insetRingColor`), blend modes (`mixBlend` /
`bgBlend`), and the isolation stacking-context guard (`isolate` / `isolation`).

## Problem

Track C completes Tailwind v4 utility parity. The effects/filters/compositing
families are partially shipped and have visible holes:

- **Shadows are single-layer only.** `src/core/tailwind-methods.ts:187` exposes
  `shadow(value?: TailwindShadow)` (vocab `opt("shadow", "shadow")` at
  `src/class-vocab/vocab.ts:150`), whose union still carries the legacy
  `"inner"` slot (`tailwind-types.ts:111`). In v4 an inner shadow and an outer
  shadow are **separate, independently-composable layers**
  (`shadow-*` + `inset-shadow-*`), and the focus ring gained an inner sibling
  (`inset-ring-*`). With only `shadow("inner")` you cannot carry an outer drop
  shadow *and* an inner shadow on the same element, nor an independent inner
  ring. That forces the escape hatch `.setClass("inset-shadow-sm inset-ring-2")`
  — untyped and flagged by the eslint `no-known-modifiers-in-setclass` rule.
- **No `drop-shadow` filter.** Every other filter ships
  (`blur`/`brightness`/`contrast`/`grayscale`/`hueRotate`/`invert`/`saturate`/`sepia`
  and the full `backdrop*` mirror, `tailwind-methods.ts:303-318`,
  `vocab.ts:226-241`), but the SVG/PNG-aware `drop-shadow` filter — and its v4.1
  `drop-shadow-{color}` companion — are absent. A glowing logo today needs
  `.setClass("drop-shadow-lg drop-shadow-cyan-500/50")`.
- **No blend modes.** All `backdrop*` filters ship, but `mix-blend-*` and
  `bg-blend-*` — needed for duotone/overlay imagery and badges composited over
  photos — have no typed method.
- **No isolation guard.** `TailwindZIndex` ships (`tailwind-types.ts:134`) but
  the documented companion that stops a child's `z-index`/`mix-blend` from
  leaking past its parent — `isolation: isolate` — has no method. This is the
  canonical fix for stacking-context leaks and is the natural partner of the
  new `mixBlend`.

Verified **not shipped in 6.1.x**: grepping
`dropShadow|insetShadow|insetRing|mixBlend|bgBlend|isolat|mix-blend|bg-blend`
across `src/`, the extractor, the eslint plugin, and `CHANGELOG.md`
(6.0.0→6.1.1) returns zero hits. (`CHANGELOG.md` mentions "isolation" only in the
context-DI prose and an IIFE note — not the CSS utility.)

These are pure 1:1 fluent wrappers over native Tailwind utilities with no
component opinion — squarely an instruction-set gap, not `@jtdigital/ui`
territory. They map onto the existing emit shapes exactly: `opt` for the
optional-value setters, `pre` for the color/mode setters, `stat` for zero-arg
`isolate`.

## Proposed API

Ten methods on `Tag`, five new closed unions, two augmentation seams. All in
`src/core/tailwind-methods.ts` (interface near `shadow`/`ring`/filters) and
`src/core/tailwind-types.ts` (unions beside `TailwindShadow`/`TailwindRingWidth`).

### Types (`src/core/tailwind-types.ts`)

```typescript
// Drop-shadow filter (filter family). CLOSED (C-02 pattern): custom values from
// FluentCustomDropShadow; arbitrary `[…]`. Distinct slot set from TailwindShadow —
// drop-shadow has its own scale and NO `inner`/`inset` slot.
export type TailwindDropShadow =
  | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "none"
  | (keyof FluentCustomDropShadow & string) | `[${string}]`;

// Inset (inner) box-shadow. CLOSED. NOTE: v4 inset-shadow slots are 2xs|xs|sm|none
// ONLY — it deliberately does NOT mirror TailwindShadow's md|lg|xl|2xl|inner.
export type TailwindInsetShadow =
  | "2xs" | "xs" | "sm" | "none"
  | (keyof FluentCustomInsetShadow & string) | `[${string}]`;

// inset-ring reuses the existing width union (mirrors ring; bare inset-ring = 1px in v4).
// (TailwindRingWidth already exists at tailwind-types.ts:176 — not redeclared.)

// mix-blend-mode — full 18-mode union (includes the plus-* modes).
export type TailwindMixBlendMode =
  | "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten"
  | "color-dodge" | "color-burn" | "hard-light" | "soft-light"
  | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity"
  | "plus-darker" | "plus-lighter";

// background-blend-mode — 16 modes. DELIBERATELY OMITS plus-darker/plus-lighter:
// the CSS spec scopes plus-* to mix-blend-mode and Tailwind ships no bg-blend-plus-*.
export type TailwindBgBlendMode =
  | "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten"
  | "color-dodge" | "color-burn" | "hard-light" | "soft-light"
  | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";

// isolation — the reset value (isolation:auto). The `isolate` value gets its own
// zero-arg method (see isolate()), mirroring Tailwind's own utility split.
export type TailwindIsolation = "auto";

// Augmentation seams (mirror the existing FluentCustomShadow seam, tailwind-types.ts:26).
export interface FluentCustomDropShadow {}
export interface FluentCustomInsetShadow {}
```

### Methods (`src/core/tailwind-methods.ts` — interface)

```typescript
// Drop-shadow filter (beside the other filters, ~line 318)
/** v4 `drop-shadow-*` filter (SVG/PNG-aware). Bare call = the theme DEFAULT. */
dropShadow(value?: TailwindDropShadow): this;
/** v4.1+ `drop-shadow-{color}` (e.g. a glow). Inert on Tailwind < 4.1. */
dropShadowColor(color: TailwindColor): this;

// Inner shadow + inner ring (beside shadow/ring, ~line 187/249)
/** v4 `inset-shadow-*` — an inner box-shadow layered independently of `shadow`. */
insetShadow(value?: TailwindInsetShadow): this;
insetShadowColor(color: TailwindColor): this;
/** v4 `inset-ring-*` — an inner ring layered independently of `ring`. Bare = 1px. */
insetRing(value?: TailwindRingWidth): this;
insetRingColor(color: TailwindColor): this;

// Blend modes (beside the filters/opacity, ~line 318)
/** `mix-blend-*` — blend this element against what is behind it. */
mixBlend(mode: TailwindMixBlendMode): this;
/** `bg-blend-*` — blend this element's background layers against each other. */
bgBlend(mode: TailwindBgBlendMode): this;

// Isolation stacking-context guard (beside zIndex companions)
/** `isolation: isolate` — a new stacking context; stops a child's z-index/mix-blend
 *  from leaking past this element. The documented mix-blend / z-index-leak guard. */
isolate(): this;
/** `isolation: auto` — the reset. Distinct CSS value from `isolate()`
 *  (e.g. `.isolate().at("md", t => t.isolation("auto"))`). */
isolation(value: TailwindIsolation): this;
```

### Implementations (`src/core/tailwind-methods.ts` — prototype)

```typescript
p.dropShadow = function (value?: string) {
  return value === undefined ? this.addClass("drop-shadow") : this.addClass(`drop-shadow-${value}`);
};
p.dropShadowColor = function (color: string) { return this.addClass(`drop-shadow-${color}`); };
p.insetShadow = function (value?: string) {
  return value === undefined ? this.addClass("inset-shadow") : this.addClass(`inset-shadow-${value}`);
};
p.insetShadowColor = function (color: string) { return this.addClass(`inset-shadow-${color}`); };
p.insetRing = function (value?: string | number) {
  return value === undefined ? this.addClass("inset-ring") : this.addClass(`inset-ring-${value}`);
};
p.insetRingColor = function (color: string) { return this.addClass(`inset-ring-${color}`); };
p.mixBlend = function (mode: string) { return this.addClass(`mix-blend-${mode}`); };
p.bgBlend = function (mode: string) { return this.addClass(`bg-blend-${mode}`); };
p.isolate = function () { return this.addClass("isolate"); };
p.isolation = function (value: string) { return this.addClass(`isolation-${value}`); };
```

### Emitted output (the contract)

| Call | Class |
| --- | --- |
| `dropShadow()` | `drop-shadow` |
| `dropShadow("lg")` | `drop-shadow-lg` |
| `dropShadow("2xl")` | `drop-shadow-2xl` |
| `dropShadow("none")` | `drop-shadow-none` |
| `dropShadow("[0_4px_8px_#0008]")` | `drop-shadow-[0_4px_8px_#0008]` |
| `dropShadowColor("cyan-500")` | `drop-shadow-cyan-500` |
| `dropShadowColor("cyan-500/50")` | `drop-shadow-cyan-500/50` |
| `insetShadow()` | `inset-shadow` |
| `insetShadow("2xs")` | `inset-shadow-2xs` |
| `insetShadow("sm")` | `inset-shadow-sm` |
| `insetShadow("none")` | `inset-shadow-none` |
| `insetShadowColor("black/15")` | `inset-shadow-black/15` |
| `insetRing()` | `inset-ring` |
| `insetRing(2)` | `inset-ring-2` |
| `insetRingColor("blue-300")` | `inset-ring-blue-300` |
| `mixBlend("multiply")` | `mix-blend-multiply` |
| `mixBlend("plus-lighter")` | `mix-blend-plus-lighter` |
| `bgBlend("overlay")` | `bg-blend-overlay` |
| `isolate()` | `isolate` |
| `isolation("auto")` | `isolation-auto` |

## Worked examples

**Independent shadow + ring layers.**

```typescript
// Before — only the legacy single inner slot; cannot also carry an outer shadow
//          or an independent inner ring:
Div().shadow("inner");

// After — outer shadow + inner shadow + inner ring, all independent layers:
Div().shadow("md").insetShadow("sm").insetRing("2").insetRingColor("white/10");
// class="shadow-md inset-shadow-sm inset-ring-2 inset-ring-white/10"
```

**Logo glow (drop-shadow filter + color).**

```typescript
// Before — no typed method; escape hatch flagged by no-known-modifiers-in-setclass:
Img().setSrc(logo).setClass("drop-shadow-lg drop-shadow-cyan-500/50");

// After:
Img().setSrc(logo).dropShadow("lg").dropShadowColor("cyan-500/50");
// class="drop-shadow-lg drop-shadow-cyan-500/50"
```

**Card-over-photo with a blend + the isolation guard.**

```typescript
// Before — untyped, extractor-fragile escape hatch:
Div().setClass("isolate").addChild(
  Div().setClass("bg-blue-500 mix-blend-multiply"),
);

// After — fully typed, extractor-resolvable; isolate() keeps the child's
//          mix-blend from leaking past the parent stacking context:
Div().isolate().addChild(
  Div().background("blue-500").mixBlend("multiply"),
);
```

**`isolation("auto")` as a responsive reset** (distinct CSS value, not a duplicate of `isolate`):

```typescript
Div().isolate().at("md", t => t.isolation("auto"));
// class="isolate md:isolation-auto"
```

No call sites exist in `apps/template` — grepping `drop-shadow` / `inset-shadow`
/ `inset-ring` / `mix-blend` / `bg-blend` / `isolat` across `src` returns
nothing. These are net-new primitives; nothing to rewrite.

## Type-safety story

- **Closed literal unions, no bare `string`.** Every value is a literal slot, a
  custom-token key, or the `` `[${string}]` `` arbitrary arm. `dropShadow("lgg")`,
  `insetShadow("md")` (no `md` slot for inset!), `mixBlend("multipy")`, and
  `isolation("isolate")` are all **compile errors**.
- **Distinct unions, not aliases.** `TailwindInsetShadow` is intentionally
  *not* `TailwindShadow`: inset-shadow's v4 slot set is `2xs|xs|sm|none` only —
  copying `md|lg|xl|2xl|inner` would type-check classes Tailwind never
  generates. `TailwindBgBlendMode` is intentionally *not*
  `TailwindMixBlendMode`: `bg-blend-plus-*` does not exist, so the 16-mode union
  keeps the typo-is-a-compile-error guarantee tight.
- **Reuse where the shape is identical.** `insetRing` reuses the existing
  `TailwindRingWidth` (width-based, bare = 1px) to mirror `ring` and avoid a
  duplicate union. Color setters take the existing `TailwindColor`, so opacity
  (`cyan-500/50`), custom colors, and `[#…]` arbitrary all flow through
  unchanged.
- **Augmentation seams.** `FluentCustomDropShadow` / `FluentCustomInsetShadow`
  follow the established `FluentCustomShadow` pattern — empty interfaces an app
  augments to open the token union for `defineTheme` custom families.
- **Compile-only tests.** Add positive/negative `@ts-expect-error` rows to
  `test/types/*.test-d.ts` covering the closed slots (`insetShadow("md")` ✗,
  `bgBlend("plus-lighter")` ✗, `isolation("isolate")` ✗).

## Migration & compatibility

**Additive within v6.** No existing signature changes; no class output changes.
`shadow("inner")` remains valid (legacy slot retained) but docs name
`insetShadow` the **canonical** way to layer an inner shadow independently — the
CONVERGE story is "one inner-shadow concept, `insetShadow`; `shadow('inner')`
kept only as the legacy single-layer slot." v6 is greenfield, so there is no v5
back-compat surface to consider.

**Tailwind version floor (runtime, not a build break):**
- `drop-shadow-{color}` requires Tailwind ≥ 4.1; on 4.0 the class is **inert**
  (silent no-op), noted in `dropShadowColor`'s JSDoc.
- Bare `drop-shadow` / `inset-shadow` / `inset-ring` rely on the theme shipping a
  DEFAULT for that family — the same latent risk already accepted for bare
  `shadow` / `blur` / `ring`.

## Docs impact (§11.8)

1. **`README.md` (lib root)** — add an **"Effects, filters & compositing"**
   subsection under the Tailwind methods section:

   ```markdown
   ### Effects, filters & compositing

   Shadows layer independently — an outer `shadow`, an inner `insetShadow`, and
   an inner `insetRing`, each with its own color setter:

   ```typescript
   Div().shadow("md").insetShadow("sm").insetRing("2").insetRingColor("white/10");
   ```

   `dropShadow` is the SVG/PNG-aware filter (with a v4.1 color companion);
   `mixBlend` / `bgBlend` are blend modes; `isolate()` opens a new stacking
   context so a child's `z-index`/`mix-blend` can't leak past its parent:

   ```typescript
   Img().setSrc(logo).dropShadow("lg").dropShadowColor("cyan-500/50");
   Div().isolate().addChild(Div().background("blue-500").mixBlend("multiply"));
   ```
   ```

2. **`fluent-html.md`** — add reference rows to the Tailwind method table:
   `dropShadow`/`dropShadowColor`, `insetShadow`/`insetShadowColor`,
   `insetRing`/`insetRingColor`, `mixBlend`, `bgBlend`, `isolate`, `isolation`,
   each with its emitted class. Note `insetShadow` as canonical for independent
   inner layering and `isolate()` as the documented mix-blend/z-index-leak guard.

3. **JSDoc** — on all 10 methods (drafted above) plus the two `FluentCustom*`
   seams in `src/core/tailwind-types.ts`. Call out the version floor on
   `dropShadowColor`, the distinct slot set on `insetShadow`, and the
   `isolate()` vs `isolation("auto")` distinction.

4. **`../fluent-html-tailwind-extractor/README.md`** — note that the new vocab
   rows resolve automatically (the extractor imports `classVocab`/`emitClasses`
   directly; no emitter change). Add coverage to `extract.test.ts`.

5. **`../fluent-html-eslint-plugin/README.md`** — note the regenerated method
   allowlist (`vocab.generated.ts` via `npm run gen:vocab`) and the new
   `setClass` auto-fix entries (`drop-shadow-lg`→`dropShadow/lg`,
   `inset-shadow-2xs`→`insetShadow/2xs`, `inset-ring-2`→`insetRing/2`).

6. **`CHANGELOG.md`** — an "Added" entry under the next version heading.

### Lockstep (vocab + extractor + eslint)

- **`src/class-vocab/vocab.ts`** — 10 new rows, **no new emit kind**:
  - *Colors group* (beside `ringColor`/`shadowColor`, ~line 81):
    `pre("dropShadowColor", "drop-shadow")`, `pre("insetShadowColor", "inset-shadow")`,
    `pre("insetRingColor", "inset-ring")`.
  - *Effects & filters group* (beside `shadow`/`ring`/the filters, ~line 150/241):
    `opt("dropShadow", "drop-shadow")`, `opt("insetShadow", "inset-shadow")`,
    `opt("insetRing", "inset-ring")`, `pre("mixBlend", "mix-blend")`,
    `pre("bgBlend", "bg-blend")`, `stat("isolate", "isolate")`,
    `pre("isolation", "isolation")`.
  - The `class-vocab.test.ts` render-compare parity test must cover all 10 — the
    rows must equal the emitters.
- **Extractor** — no code change; add cases to `extract.test.ts`. *(Optional:*
  `src/theme.ts` `MANIFEST_PREFIXES.colors += "drop-shadow","inset-shadow","inset-ring"`
  *only if `defineTheme` custom color/shadow tokens should safelist these
  families; safe to skip for literal usage.)*
- **ESLint plugin** — `npm run gen:vocab` regenerates `src/vocab.generated.ts`
  (the 10 method names propagate automatically; append-style methods land in the
  addClass-clobber set) and refresh the `vocab-drift.mjs` pin. Hand-add mirrored
  entries to `no-known-modifiers-in-setclass.ts` (mirror the `shadow-*` block:
  `drop-shadow-lg`→`dropShadow/lg`, `inset-shadow-2xs`→`insetShadow/2xs`,
  `inset-ring-2`→`insetRing/2`, `mix-blend-multiply`→`mixBlend/multiply`,
  `isolate`→`isolate`) so `setClass` auto-fixes. In
  `no-conflicting-classes-in-setclass.ts`, add `"drop-shadow-"`,
  `"inset-shadow-"`, `"inset-ring-"` to the conflict-prefix list (beside the
  existing `"ring-"`, line 126) — **matched most-specific-first** so
  `inset-shadow-`/`inset-ring-` resolve before `inset-`.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; pure `addClass`.
- **§11.2 SSR-only / sync** — all 10 impls are synchronous `addClass` on render;
  no async.
- **§11.3 escape-by-default** — class tokens only; no attr/URL sink, no new XSS
  surface.
- **§11.4 type-safety** — five closed literal unions, no `any`, no bare `string`
  where literals are valid; arbitrary only via `` `[${string}]` ``; `insetShadow("md")`
  and `bgBlend("plus-lighter")` are compile errors.
- **§11.5 compat** — additive within v6; legacy `shadow("inner")` retained; no
  v5 back-compat needed.
- **§11.6 idioms** — consistent class-accumulator idiom (mirrors `shadow`/`ring`/
  filters); single optional/value arg (no options object needed for single-token
  utils); no inline JS; CONVERGE upheld — `insetShadow` is the canonical inner
  layer; `isolate()` vs `isolation("auto")` are *distinct CSS values*, not two
  ways to do one thing.
- **§11.7 class-string contract** — every emitted class is literal +
  extractor-resolvable; 10 vocab rows in lockstep with the extractor (auto-
  resolved) and eslint (regen + hand map); no new emit kind; no
  dynamic/interpolated classes.
- **§11.8 docs/guideline-sync** — lib README + `fluent-html.md` + JSDoc on all 10
  methods and the two seams + extractor/eslint READMEs + CHANGELOG, covering
  every symbol in `api_surface`.

## Alternatives considered

- **Alias `TailwindInsetShadow = TailwindShadow`** — rejected: would admit
  `inset-shadow-md`/`-lg`/`-xl`/`-2xl`/`-inner`, classes Tailwind never
  generates, breaking the typo-is-a-compile-error guarantee.
- **Alias `TailwindBgBlendMode = TailwindMixBlendMode`** — rejected:
  `bg-blend-plus-*` does not exist; the unions stay distinct so a future
  `bg-blend-plus-*` (low likelihood, CSS-spec-scoped to mix-blend) is a
  deliberate widening, not a silent dead class.
- **Fold `isolate` into `isolation("isolate")`** — rejected: Tailwind itself
  splits the bare `isolate` utility from `isolation-auto`; `isolate()` is the
  common case (zero-arg, like `htmxIndicator`) and `isolation("auto")` is the
  responsive reset. They are different CSS values, not duplicate APIs.
- **Drop `shadow("inner")`** — rejected for this RFC: it is a still-valid v4 slot;
  removing it is a separate convergence decision. Docs steer to `insetShadow`.
- **A new dedicated inset-ring width union** — rejected: identical to
  `TailwindRingWidth`; reusing it avoids a duplicate and matches `ring`.

## Open questions

1. **`shadow("inner")` deprecation timing.** Keep both indefinitely, or mark
   `"inner"` soft-deprecated in `TailwindShadow`'s JSDoc now and remove it in a
   later breaking pass once `insetShadow` is the documented path?
2. **Extractor `MANIFEST_PREFIXES` opt-in.** Ship the
   `drop-shadow`/`inset-shadow`/`inset-ring` color-prefix safelisting by default,
   or gate it behind theme-author opt-in to avoid over-safelisting for apps that
   only use literal values?
3. **`dropShadowColor` on Tailwind 4.0.** Silent-inert is consistent with other
   version-floored utilities — acceptable, or should the JSDoc/docs carry a
   stronger "requires ≥ 4.1" callout (or a lint note)?
