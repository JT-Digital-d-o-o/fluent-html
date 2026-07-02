---
id: RFC-C-10
track: C
resolves: [#75]
api_surface:
  - "TailwindMaskRadialShape (type, src/core/tailwind-types.ts)"
  - "TailwindMaskRadialSize (type, src/core/tailwind-types.ts)"
  - "TailwindMaskRadialPosition (type, src/core/tailwind-types.ts)"
  - "TailwindMaskRadialOptions (type, src/core/tailwind-types.ts)"
  - "TailwindMaskEdge (type, src/core/tailwind-types.ts)"
  - "TailwindMaskStop (type, src/core/tailwind-types.ts)"
  - "TailwindMaskComposite (type, src/core/tailwind-types.ts)"
  - "TailwindMaskType (type, src/core/tailwind-types.ts)"
  - "FluentTailwindMethods.maskImage(value: \"none\" | `[${string}]`): this"
  - "FluentTailwindMethods.maskLinear(angle: number): this"
  - "FluentTailwindMethods.maskConic(angle: number): this"
  - "FluentTailwindMethods.maskRadial(value: `[${string}]`): this"
  - "FluentTailwindMethods.maskRadial(options?: TailwindMaskRadialOptions): this"
  - "FluentTailwindMethods.maskFrom(edge: TailwindMaskEdge, stop: TailwindMaskStop): this"
  - "FluentTailwindMethods.maskTo(edge: TailwindMaskEdge, stop: TailwindMaskStop): this"
  - "FluentTailwindMethods.maskComposite(mode: TailwindMaskComposite): this"
  - "FluentTailwindMethods.maskType(value: TailwindMaskType): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md — new \"Masks (v4.1)\" subsection in the Fluent Styling reference: maskImage/maskLinear/maskConic/maskRadial roots, maskFrom/maskTo edge fades, maskComposite, maskType rows + a hero-fade recipe"
  - "fluent-html.md — mirror the Masks subsection in the styling reference"
  - "src/core/tailwind-methods.ts — JSDoc on all eight mask methods (the gradient-mask roots, edge fades, composite, and maskType)"
  - "CHANGELOG.md — 6.2.0 entry under Added"
  - "../fluent-html-tailwind-extractor/README.md — note the new mask vocab rows are auto-consumed (vocab-driven; no per-method edit)"
  - "../fluent-html-eslint-plugin/README.md — note regenerated VOCAB_METHODS gains the eight mask* methods"
impact: "Closes the Tailwind v4.1 mask-image gap: gradient-mask roots (image/linear/radial/conic), directional edge fades, mask-composite, and the SVG mask-type knob — replacing the forbidden raw addClass(\"mask-…\") escape hatch with a typed, extractor-resolvable fluent surface. Phases the raster fine-grain tail (size/position/repeat/clip/origin) out to a later release behind an in-lib image-mask producer."
effort: L
depends_on: []
status: proposed
---

# RFC-C-10 — Tailwind v4.1 mask utilities (phased)

## Problem

Tailwind v4.1 ships a first-class `mask-image` utility family (gradient-mask roots,
directional edge fades, `mask-composite`, plus the SVG `mask-type` knob). The library
has **zero** mask surface today:

```
$ grep -n mask src/core/tailwind-methods.ts src/core/tailwind-types.ts src/class-vocab/vocab.ts
# (no output)
```

The only `Mask` token anywhere in the public surface is the unrelated SVG `<mask>`
**container View** added in 6.0.0 (`CHANGELOG.md:382` —
`LinearGradient`/`RadialGradient`/`Stop`, `ClipPath`, **`Mask`**, `Filter`…). That builds
the `<mask>` element; it cannot set `mask-type`, and nothing can set a CSS `mask-image`.
`CHANGELOG.md` (6.0.0 → 6.1.1) has no mask Tailwind entry — 6.1.x shipped
popover/native-dialog, anchor-positioning, `Form<T>`, and relational state hooks, none of
which touch masks.

The result is that **every** mask today is a raw class escape hatch — exactly what §11.6
and the eslint plugin forbid:

```ts
// The only path that exists today (discovery c08-effects-filters.md:116):
Div().background("[url(/hero.jpg)]")
  .addClass("mask-radial").addClass("mask-radial-closest-side")   // eslint-flagged, untyped
```

There is no type checking (a `mask-radail` typo ships), no extractor resolution guarantee,
and no convergent way to express a soft edge fade — the single most common real use of CSS
masks (hero-image bottom fade, scroll-edge gradients). This RFC adds the **core primitive
gap**: a typed fluent mask surface that emits genuine first-class Tailwind v4.1 mask
classes.

### Scope & phasing (roadmap #75)

The v4.1 mask family is large; #75 phases it. This RFC ships the **convergent core** —
everything that has an idiomatic caller today — and explicitly **defers** the raster
fine-grain tail behind a future in-lib image-mask producer:

| Phase | Surface | This RFC |
| --- | --- | --- |
| **Ships now** | `maskImage`, `maskLinear`, `maskConic`, `maskRadial` (gradient-mask roots); `maskFrom`, `maskTo` (edge fades); `maskComposite`; **`maskType`** (SVG knob) | ✅ |
| **Deferred (Phase B)** | `maskSize`, `maskPosition`, `maskRepeat` — raster-mask companions; need `custom()` dual-prefix emitters + inverse extractor paths | ❌ (signatures recorded in Open questions) |
| **Deferred (Phase C, indefinite)** | `maskClip`, `maskOrigin` — box-model masking, no app caller | ❌ |

Two title items are **deliberately dropped**, not forgotten:

- **`maskVia` is N/A for edges.** Tailwind v4.1 has **no** `mask-{edge}-via-*` class. A `via`
  stop exists **only** on the gradient-TYPE masks (`mask-linear-via-*` etc.). Emitting
  `mask-t-via-50%` would produce a non-existent, extractor-unresolvable class (violates
  §11.7). Edge fades therefore ship `maskFrom` + `maskTo` only; a gradient-type `via` stop
  is left to Open questions.
- **The raster five** govern a raster `mask-image` (from a `url()`/preset) that Phase A does
  not yet *produce* in-lib, so they would be primitives with no idiomatic caller — an
  anti-pattern per §11.6 CONVERGE. Deferred until an image-mask producer lands.

**`maskType` is promoted into this phase** (it was mis-bucketed in the L tail): it is a
2-member closed union, a single `pre()` row, and the library already ships the `<mask>`
container View that needs it. Shipping gradient-mask roots while leaving the one SVG-mask
knob behind `setClass("mask-type-luminance")` would be an incomplete release.

## Proposed API (the contract)

### Types — `src/core/tailwind-types.ts`

Added in a new `// Masks (v4.1)` block in the effects/filters area:

```ts
// ── Gradient-mask roots ──
export type TailwindMaskRadialShape = "circle" | "ellipse";
export type TailwindMaskRadialSize =
  | "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner";
export type TailwindMaskRadialPosition =
  | "at-top-left" | "at-top" | "at-top-right"
  | "at-left"     | "at-center" | "at-right"
  | "at-bottom-left" | "at-bottom" | "at-bottom-right";
export type TailwindMaskRadialOptions = {
  shape?: TailwindMaskRadialShape;
  size?: TailwindMaskRadialSize;
  position?: TailwindMaskRadialPosition;
};

// ── Edge fades ──
export type TailwindMaskEdge = "t" | "r" | "b" | "l" | "x" | "y";
// A mask stop: percentage | spacing-scale number | color | CSS-var | arbitrary.
// Mirrors TailwindGradientStop's breadth; the `[${string}]` arm resolves LAST.
export type TailwindMaskStop =
  | `${number}%`
  | TailwindColor
  | TailwindSpacing
  | `(${string})`     // (--my-var)
  | `[${string}]`;    // arbitrary escape hatch

// ── Composite & SVG type ──
export type TailwindMaskComposite = "add" | "subtract" | "intersect" | "exclude";
export type TailwindMaskType = "alpha" | "luminance";
```

`TailwindColor` (`tailwind-types.ts:80`) and `TailwindSpacing` (`:36`) already exist and
carry their own `[${string}]` arbitrary arm; `TailwindMaskStop` reuses them rather than
re-deriving the color/spacing scales.

### Interface — `src/core/tailwind-methods.ts`

Added to `FluentTailwindMethods`, in a new `// Masks (v4.1)` block. The matching type names
join the existing `import type { … } from "./tailwind-types"` block.

```ts
/**
 * v4.1 `mask-image`. `"none"` emits `mask-none` (reset); an arbitrary `[…]`
 * value (e.g. `[url(/fade.png)]`, `[linear-gradient(...)]`) emits `mask-[…]`.
 * For gradient-type masks use {@link maskLinear}/{@link maskRadial}/{@link maskConic}.
 * @example Div().maskImage("[url(/fade.png)]")   // mask-[url(/fade.png)]
 */
maskImage(value: "none" | `[${string}]`): this;

/**
 * v4.1 linear gradient-mask root. `angle` is the gradient angle in degrees;
 * a negative angle flips to the `-mask-linear-*` prefix. This sets the gradient
 * TYPE/angle only — compose with {@link maskFrom}/{@link maskTo} for the fade stops.
 * @example Div().maskLinear(65)    // mask-linear-65
 * @example Div().maskLinear(-65)   // -mask-linear-65
 */
maskLinear(angle: number): this;

/**
 * v4.1 conic gradient-mask root. Like {@link maskLinear} but conic; `angle` in degrees,
 * negative flips the prefix. Compose with {@link maskFrom}/{@link maskTo} for stops.
 * @example Div().maskConic(45)   // mask-conic-45
 */
maskConic(angle: number): this;

/**
 * v4.1 radial gradient-mask root. Bare `maskRadial()` emits just `mask-radial`
 * (the gradient-type switch); pass an options object to add shape/size/position.
 * The `[${string}]` overload is the arbitrary escape hatch
 * (`mask-radial-[circle_farthest-side]`). Compose with {@link maskFrom}/{@link maskTo}.
 * @example Div().maskRadial()                                   // mask-radial
 * @example Div().maskRadial({ shape: "circle", size: "closest-side", position: "at-center" })
 * @example Div().maskRadial("[circle_farthest-side]")           // mask-radial-[circle_farthest-side]
 */
maskRadial(value: `[${string}]`): this;          // overload 1 — MUST precede overload 2
maskRadial(options?: TailwindMaskRadialOptions): this;  // overload 2

/**
 * v4.1 directional mask fade — start stop. `edge` is the side(s) to fade
 * (`t|r|b|l|x|y`); `stop` is a `%`, spacing number, color, `(--var)`, or `[…]`.
 * Emits `mask-{edge}-from-{stop}`. Pair with {@link maskTo} for the end stop.
 * @example Div().maskFrom("b", "50%")        // mask-b-from-50%
 * @example Div().maskFrom("x", "blue-500")   // mask-x-from-blue-500
 */
maskFrom(edge: TailwindMaskEdge, stop: TailwindMaskStop): this;

/**
 * v4.1 directional mask fade — end stop. Emits `mask-{edge}-to-{stop}`.
 * @example Div().maskTo("b", "90%")   // mask-b-to-90%
 */
maskTo(edge: TailwindMaskEdge, stop: TailwindMaskStop): this;

/**
 * v4.1 `mask-composite` for stacked masks. Emits `mask-{mode}`.
 * @example Div().maskFrom("t", "30%").maskFrom("l", "30%").maskComposite("intersect")
 */
maskComposite(mode: TailwindMaskComposite): this;

/**
 * v4.1 `mask-type` for an SVG `<mask>` element — `"alpha"` (default) vs
 * `"luminance"`. Emits `mask-type-{value}`. Inert on non-`<mask>` elements.
 * @example Mask().setId("blob").maskType("luminance")   // mask-type-luminance
 */
maskType(value: TailwindMaskType): this;
```

### Implementations — `src/core/tailwind-methods.ts`

In the `// Masks (v4.1)` impl block, after the gradient block (`:660-668`). The emitters
**must** match the vocab emitters byte-for-byte (the `class-vocab.test.ts` lib-parity test
enforces this), including `signNeg` (`src/class-vocab/types.ts:44`) for negative angles:

```ts
p.maskImage = function (value: string) {
  return value === "none" ? this.addClass("mask-none") : this.addClass(`mask-${value}`);
};
p.maskLinear = function (angle: number) { return this.addClass(signNeg("mask-linear", String(angle))); };
p.maskConic  = function (angle: number) { return this.addClass(signNeg("mask-conic",  String(angle))); };
p.maskRadial = function (arg?: string | TailwindMaskRadialOptions) {
  if (typeof arg === "string") return this.addClass(`mask-radial-${arg}`);   // arbitrary [...]
  let t = this.addClass("mask-radial");
  if (arg?.shape)    t = t.addClass(`mask-${arg.shape}`);                     // mask-circle | mask-ellipse
  if (arg?.size)     t = t.addClass(`mask-radial-${arg.size}`);
  if (arg?.position) t = t.addClass(`mask-radial-${arg.position}`);
  return t;
};
p.maskFrom = function (edge: string, stop: string) { return this.addClass(`mask-${edge}-from-${stop}`); };
p.maskTo   = function (edge: string, stop: string) { return this.addClass(`mask-${edge}-to-${stop}`); };
p.maskComposite = function (mode: string) { return this.addClass(`mask-${mode}`); };
p.maskType = function (value: string) { return this.addClass(`mask-type-${value}`); };
```

Note the radial shape arm: `mask-circle` / `mask-ellipse` are **not** `mask-radial-*`
prefixed, but `size`/`position` **are** (`mask-radial-closest-side`, `mask-radial-at-center`).

### Emitted output

| Call | Class(es) |
| --- | --- |
| `.maskImage("none")` | `mask-none` |
| `.maskImage("[url(/fade.png)]")` | `mask-[url(/fade.png)]` |
| `.maskLinear(65)` / `.maskLinear(-65)` | `mask-linear-65` / `-mask-linear-65` |
| `.maskConic(45)` / `.maskConic(-45)` | `mask-conic-45` / `-mask-conic-45` |
| `.maskRadial()` | `mask-radial` |
| `.maskRadial({ shape:"circle", size:"closest-side", position:"at-center" })` | `mask-radial mask-circle mask-radial-closest-side mask-radial-at-center` |
| `.maskRadial("[circle_farthest-side]")` | `mask-radial-[circle_farthest-side]` |
| `.maskFrom("t","50%")` / `.maskTo("b","90%")` | `mask-t-from-50%` / `mask-b-to-90%` |
| `.maskFrom("x","70%")` / `.maskTo("y","95%")` | `mask-x-from-70%` / `mask-y-to-95%` |
| `.maskFrom("r","blue-500")` / `.maskFrom("l","4")` / `.maskFrom("t","[20px]")` | `mask-r-from-blue-500` / `mask-l-from-4` / `mask-t-from-[20px]` |
| `.maskComposite("add"\|"subtract"\|"intersect"\|"exclude")` | `mask-add` / `mask-subtract` / `mask-intersect` / `mask-exclude` |
| `.maskType("alpha"\|"luminance")` | `mask-type-alpha` / `mask-type-luminance` |

## Worked examples (before → after)

No app/template call site uses masks today (grep `mask` over `ttl`, `rideshare`,
`projects-template`, `fluent-html-demos` returns only `netmask` lockfile noise) — this is a
greenfield v4.1 capability, so the "before" is the forbidden raw escape hatch.

### 1. Hero photo, soft bottom fade (the canonical case)

```ts
// BEFORE — raw addClass chain, eslint-flagged, no type safety:
Div().background("[url(/hero.jpg)]").addClass("mask-b-from-50% mask-b-to-90%");

// AFTER — fluent, typed, extractor-resolvable:
Div().background("[url(/hero.jpg)]")
  .maskFrom("b", "50%").maskTo("b", "90%");
// → class="bg-[url(/hero.jpg)] mask-b-from-50% mask-b-to-90%"
```

### 2. Radial spotlight mask

```ts
// BEFORE — two raw addClass calls:
Div().background("[url(/hero.jpg)]")
  .addClass("mask-radial").addClass("mask-radial-closest-side");

// AFTER — one typed call:
Div().background("[url(/hero.jpg)]").maskRadial({ size: "closest-side" });
// → class="bg-[url(/hero.jpg)] mask-radial mask-radial-closest-side"
```

### 3. Linear gradient-type root + stops + composite

```ts
// Two stacked corner fades, intersected:
Div().maskFrom("t", "30%").maskFrom("l", "30%").maskComposite("intersect");
// → class="mask-t-from-30% mask-l-from-30% mask-intersect"

// Angled linear root with explicit stops:
Div().maskLinear(65).maskFrom("t", "0%").maskTo("t", "60%");
// → class="mask-linear-65 mask-t-from-0% mask-t-to-60%"
```

### 4. SVG `<mask>` luminance type (the promoted `maskType`)

```ts
// BEFORE — raw setClass on the shipped <mask> container View:
Mask().setId("blob").addChild(Path(/* … */)).setClass("mask-type-luminance fill-gray-700/70");

// AFTER — typed:
Mask().setId("blob").addChild(Path(/* … */)).maskType("luminance").fill("gray-700/70");
// → mask-type-luminance (fill() lands via Track-C SVG item)
```

## Type-safety story

- **Closed keyword unions everywhere a finite set exists.** `TailwindMaskRadialShape`
  (2), `…Size` (4), `…Position` (9), `TailwindMaskEdge` (6), `TailwindMaskComposite` (4),
  `TailwindMaskType` (2) are fully closed with **no** arbitrary tail — a typo is a compile
  error (`maskFrom("top", …)`, `maskComposite("overlay")`, `maskType("alfa")` all fail to
  compile). §11.4 satisfied.
- **Angles are `number`, not string.** `maskLinear`/`maskConic` take a numeric degree; the
  negative sign drives `signNeg`'s prefix flip — no bare-string ambiguity.
- **`TailwindMaskStop` is a structured template-literal union.** `${number}%` for
  percentages, `TailwindColor`/`TailwindSpacing` for color/spacing-scale stops, `(${string})`
  for CSS vars, and `[${string}]` as the **last-resolving** explicit escape hatch (mirrors
  `TailwindGradientStop`'s breadth). A bad edge is caught; a malformed arbitrary inside `[…]`
  is the caller's opt-in (parity with every shipped arbitrary arm, not a new regression).
- **Overload ordering is load-bearing.** `maskRadial(value: \`[${string}]\`)` is declared
  **before** `maskRadial(options?)` so a bracketed string literal binds the arbitrary
  overload rather than structurally matching the all-optional options object. Documented in
  the JSDoc and pinned by `test/types/mask.test-d.ts`.
- **`maskImage` is `"none" | \`[${string}]\`` only** — the same escape-hatch contract as
  `TailwindBlur` (`tailwind-types.ts:255`) and `.textSize("[13px]")`. Gradient-type masks are
  routed to the dedicated `maskLinear/Radial/Conic` methods, so there is exactly one way to
  express each thing (§11.6 CONVERGE).

## Migration & compatibility

**Additive** within v6 (greenfield; no v5 back-compat in scope). Eight brand-new methods +
eight new exported types; **no** existing signature changes. Existing
`.setClass("mask-…")` / `.addClass("mask-…")` escape hatches keep working, but the
regenerated eslint `VOCAB_METHODS` will now steer callers to the fluent methods (intended
convergence). CSS `mask-image` / `mask-composite` / `mask-type` are Baseline
Widely-available; stacking + composite has minor Safari quirks (noted in JSDoc) — but the
library only emits classes (§11.2), so there is no runtime/SSR concern: on an unsupporting
engine the element renders unmasked, a graceful degrade.

## Docs impact (§11.8 — exact files + markdown)

1. **`src/core/tailwind-methods.ts`** — the eight JSDoc blocks shown above on the method
   decls.

2. **`README.md`** — new **Masks (v4.1)** subsection in the Fluent Styling reference:

   ```md
   ### Masks (v4.1)

   | Method | Class | Notes |
   | --- | --- | --- |
   | `.maskImage("none" \| "[…]")`   | `mask-none` / `mask-[…]` | reset / arbitrary mask-image |
   | `.maskLinear(n)`                | `mask-linear-65` (`-…` if negative) | gradient-type root |
   | `.maskConic(n)`                 | `mask-conic-45` | gradient-type root |
   | `.maskRadial(opts?)`            | `mask-radial mask-radial-closest-side …` | gradient-type root |
   | `.maskFrom(edge, stop)`         | `mask-b-from-50%` | edge fade — start stop |
   | `.maskTo(edge, stop)`           | `mask-b-to-90%`   | edge fade — end stop |
   | `.maskComposite(mode)`          | `mask-intersect`  | stacked-mask composite |
   | `.maskType("alpha"\|"luminance")` | `mask-type-luminance` | SVG `<mask>` interpretation |

   #### Recipe — hero image bottom fade
   ​```ts
   Div().background("[url(/hero.jpg)]").maskFrom("b", "50%").maskTo("b", "90%")
   ​```
   The gradient-type roots (`maskLinear`/`maskRadial`/`maskConic`) set the gradient
   shape/angle; `maskFrom`/`maskTo` set the fade stops; compose them.
   ```

3. **`fluent-html.md`** — mirror the same Masks subsection in the styling reference.

4. **`CHANGELOG.md`** — 6.2.0 entry under Added:
   `Added (Tailwind v4.1 masks): maskImage, maskLinear, maskConic, maskRadial (gradient-mask roots), maskFrom/maskTo (directional edge fades), maskComposite, and maskType (SVG mask-type). Raster fine-grain (size/position/repeat/clip/origin) and gradient-type via stops deferred.`

5. **`../fluent-html-tailwind-extractor/README.md`** — note the new mask vocab rows are
   auto-consumed (extractor is vocab-driven; no per-method edit).

6. **`../fluent-html-eslint-plugin/README.md`** — note `VOCAB_METHODS` is regenerated to
   include the eight `mask*` methods.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure string `addClass`; reuses the existing `signNeg` helper; no new runtime dependency.
- **§11.2 SSR-sync** — every method is a synchronous `addClass` on the render path; no async.
- **§11.3 escape-by-default** — emits literal Tailwind class strings only; the sole HTML sink is the `class` attribute, already escaped; no attr/URL value interpolated into HTML (the `[url(/…)]` text lives inside a class token the caller owns).
- **§11.4 type-safety** — closed literal unions for shape/size/position/edge/composite/type; `number` angles; structured `TailwindMaskStop` template union; `[${string}]` is an explicit opt-in escape hatch only; no `any`, no bare `string` where keywords are valid; a typo is a compile error.
- **§11.5 compat** — purely additive within v6 (eight new methods + eight new types); no existing symbol changes; honestly additive.
- **§11.6 idioms** — options object for `maskRadial`; single positional value for the single-value setters; two positionals for `maskFrom/maskTo` (mirrors gradient `from`/`to`); accumulating `mask*` methods correctly take no `set*` counterpart; no inline JS; CONVERGE — one method owns each thing (`maskImage` for the image, the roots for gradient type, `maskFrom/maskTo` for stops, `via` deliberately not double-spelled).
- **§11.7 class-string contract** — every emitted class is literal + extractor-resolvable; lockstep below registers vocab rows, regenerates the eslint mirror, and the extractor auto-consumes; no dynamic/interpolated classes.
- **§11.8 docs/guideline-sync** — every symbol in `api_surface` is covered by the Docs impact section (lib README + fluent-html.md + JSDoc + CHANGELOG + both tooling READMEs).

### Lockstep (§11.7 — exact edits)

- **CORE `src/class-vocab/vocab.ts`** — new `// Masks (v4.1)` section after the Gradients
  block (~line 213). All custom-emit rows except `maskType` (a clean `pre`). Each emitter
  **matches `tailwind-methods.ts` byte-for-byte**, with `samples` so the lib-parity test and
  extractor safelist round-trip:
  ```ts
  // Masks (v4.1)
  custom("maskImage",  (a) => (a[0] === "none" ? ["mask-none"] : [`mask-${a[0]}`]),
    [["none"], ["[url(/x.png)]"]]),
  custom("maskLinear", (a) => [signNeg("mask-linear", a[0])], [["65"], ["-65"]]),
  custom("maskConic",  (a) => [signNeg("mask-conic",  a[0])], [["45"], ["-45"]]),
  custom("maskRadial", (a) => {
    if (a[0]?.startsWith("[")) return [`mask-radial-${a[0]}`];
    const out = ["mask-radial"];
    if (a[0]) out.push(`mask-${a[0]}`);          // shape
    if (a[1]) out.push(`mask-radial-${a[1]}`);   // size
    if (a[2]) out.push(`mask-radial-${a[2]}`);   // position
    return out;
  }, [[], ["circle", "closest-side", "at-center"], ["[circle_farthest-side]"]]),
  custom("maskFrom", (a) => (a.length === 2 ? [`mask-${a[0]}-from-${a[1]}`] : []),
    [["t", "50%"], ["x", "70%"], ["r", "blue-500"]]),
  custom("maskTo",   (a) => (a.length === 2 ? [`mask-${a[0]}-to-${a[1]}`]   : []),
    [["b", "90%"], ["y", "95%"]]),
  custom("maskComposite", (a) => [`mask-${a[0]}`],
    [["add"], ["subtract"], ["intersect"], ["exclude"]]),
  pre("maskType", "mask-type"),   // mask-type-alpha | mask-type-luminance
  ```
  No new emit `kind` — the existing `custom` + `pre` paths cover everything (identical to how
  `gradient` already emits multiple classes). `signNeg` is already imported by `vocab.ts`.
  **Prefix-ownership note:** `maskComposite` emits `mask-{mode}` (no stable prefix beyond
  `mask`); keep it a `custom` row (not `pre`) so it never contends with `maskImage`/`maskRadial`
  for the `mask` prefix in `PREFIX_BY_METHOD`. `maskType` is the only mask method owning a
  stable prefix (`mask-type`).
- **EXTRACTOR `../fluent-html-tailwind-extractor`** — **no source edit.** `extract.ts`
  imports `classVocab` + `emitClasses` directly (`extract.ts:9,11`), so all eight rows are
  picked up automatically (custom rows run their own `emit`; `maskType`'s `pre` round-trips
  via the generic prefix handler). Confirm the arg-count allowlist for `custom` permits 2-arg
  rows (`maskFrom`/`maskTo`); add `extract.test.ts` fixtures for one row per method and re-run
  the class→method round-trip suite.
- **ESLINT `../fluent-html-eslint-plugin`** — regenerate `src/vocab.generated.ts`
  (header: *Do NOT edit by hand — run `npm run gen:vocab`*) so `VOCAB_METHODS` gains
  `maskImage`, `maskLinear`, `maskConic`, `maskRadial`, `maskFrom`, `maskTo`,
  `maskComposite`, `maskType`; the `mask*` accumulators also join the append set. Update the
  `test/vocab-drift.mjs` snapshot in the same commit.
- **TYPE TESTS** — `test/types/mask.test-d.ts`: assert `maskFrom("top", …)`,
  `maskComposite("overlay")`, `maskType("alfa")` are compile errors; assert
  `maskFrom("t", "50%")`, `maskFrom("x", "blue-500")`, `maskFrom("t", "[20px]")`,
  `maskRadial("[circle_farthest-side]")` (binds overload 1), and `maskRadial({ size: "closest-side" })`
  (binds overload 2) type-check. `class-vocab.test.ts` lib-parity auto-covers render == vocab.

## Alternatives considered

- **Fold the `from`/`to` stops into the gradient roots** (`maskLinear(65, { from, to })`).
  Rejected: stops are shared by linear/radial/conic AND by edge fades; one method owning stops
  (`maskFrom`/`maskTo`) keeps CONVERGE (§11.6) and matches the existing gradient `from`/`to`
  split. Roots stay stop-free.
- **Emit `maskImage` as inline style** (like 6.1.x `anchorName`/`positionArea`). Rejected: that
  choice was *forced* because Tailwind lacked those utilities. Tailwind v4.1 *does* ship
  `mask-*` utilities, so class emission is correct and keeps masks in the extractor/safelist
  pipeline.
- **Implement `maskVia` as an edge method.** Rejected: no `mask-{edge}-via-*` class exists in
  v4.1; it would emit an unresolvable class (§11.7). The gradient-type `via` stop is deferred to
  Open questions.
- **Ship the raster five (`maskSize`/`Position`/`Repeat`/`Clip`/`Origin`) now.** Rejected: no
  in-lib image-mask producer consumes them in Phase A → primitives with no idiomatic caller
  (§11.6). They also carry dual-prefix emit hazards needing `custom()` emitters + inverse
  extractor paths (see Open questions). Deferred.
- **Keep `maskType` in the deferred L tail.** Rejected: it is a 2-member closed union, a single
  `pre` row, with an in-lib consumer (the `<mask>` container View) — promote it so the SVG-mask
  knob isn't stranded behind `setClass`.

## Open questions

1. **Gradient-type `via` stop.** `mask-linear-via-*` / `mask-radial-via-*` / `mask-conic-via-*`
   exist in v4.1 but are *not* edge fades. Should they be a per-root `via?` option
   (`maskLinear(65, { via: "50%" })`) or a `maskVia(type, stop)` method? Deferred from this
   RFC; resolve when a concrete tri-stop gradient mask appears.
2. **Phase-B raster companions.** When an in-lib image-mask producer lands, `maskSize` /
   `maskPosition` / `maskRepeat` each need a `custom()` emitter (dual-prefix:
   `mask-cover` keyword vs `mask-size-[…]` arbitrary; `mask-center` vs `mask-position-[…]`;
   `mask-no-repeat` vs `mask-repeat-x`) **and** a matching inverse extractor path. Recorded
   signatures (for the future RFC, not shipped here):
   ```ts
   maskSize(value: "auto" | "cover" | "contain" | `[${string}]`): this;
   maskSize(unit: "px" | "rem" | "em" | "%" | "vh" | "vw", amount: number): this;
   maskPosition(value: TailwindMaskPosition): this;     // top-left … center | [center_top_1rem]
   maskRepeat(value: "repeat" | "no-repeat" | "x" | "y" | "space" | "round"): this;
   ```
3. **`maskClip` / `maskOrigin` (Phase C).** Box-model masking of a raster mask-image — defer
   indefinitely until a concrete view needs them (do not pre-ship primitives nobody consumes).
4. **`TailwindMaskStop` union breadth.** Combining `${number}%` | `TailwindColor` |
   `TailwindSpacing` is wide (mirrors `TailwindGradientStop`). Verify TS autocomplete perf and
   that the `[${string}]` arm still resolves last; tighten only if it degrades.
