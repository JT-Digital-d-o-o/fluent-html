---
id: RFC-C-10
track: C
resolves: [#75]
api_surface:
  - "TailwindMaskEdge (type, src/core/tailwind-types.ts)"
  - "TailwindMaskStop (type, src/core/tailwind-types.ts)"
  - "TailwindMaskComposite (type, src/core/tailwind-types.ts)"
  - "TailwindMaskType (type, src/core/tailwind-types.ts)"
  - "FluentTailwindMethods.maskImage(value: \"none\" | `[${string}]`): this"
  - "FluentTailwindMethods.maskFrom(edge: TailwindMaskEdge, stop: TailwindMaskStop): this"
  - "FluentTailwindMethods.maskTo(edge: TailwindMaskEdge, stop: TailwindMaskStop): this"
  - "FluentTailwindMethods.maskComposite(mode: TailwindMaskComposite): this"
  - "FluentTailwindMethods.maskType(value: TailwindMaskType): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md — new \"Masks (v4.1)\" subsection in the Fluent Styling reference: maskImage reset/arbitrary, maskFrom/maskTo edge fades, maskComposite, maskType rows + a hero-fade recipe"
  - "fluent-html.md — mirror the Masks subsection in the styling reference"
  - "src/core/tailwind-methods.ts — JSDoc on all five mask methods (maskImage, edge fades, composite, maskType)"
  - "CHANGELOG.md — 6.2.0 entry under Added"
  - "../fluent-html-tailwind-extractor/README.md — note the new mask vocab rows are auto-consumed (vocab-driven; no per-method edit)"
  - "../fluent-html-eslint-plugin/README.md — note regenerated VOCAB_METHODS gains the five mask* methods"
impact: "Closes the most common Tailwind v4.1 mask-image gap with verified-functional classes: directional edge fades (the hero/scroll-edge bottom-fade case), mask-composite for stacked masks, the mask-image reset/arbitrary escape hatch, and the SVG mask-type knob — replacing the forbidden raw addClass(\"mask-…\") escape hatch with a typed, extractor-resolvable fluent surface. The gradient-TYPE roots (linear/radial/conic) are CUT from this RFC: they are non-functional without their own *-from-*/-to-* stops and must ship as a complete root+stops unit in a later RFC."
effort: M
depends_on: []
status: implemented
---

# RFC-C-10 — Tailwind v4.1 mask utilities (phased)

> ⚠️ **Adversary verdict: REJECT** — The draft's gradient-mask roots are non-functional as designed. `maskRadial()` emits a bare `mask-radial` class that **does not exist** in Tailwind v4.1 (radial masks are established by `mask-radial-from-*`/`mask-radial-to-*`, not a bare switch), violating §11.7. The lib-parity test only checks `render == vocab`, so the dead class would ship silently. Worse, the draft **defers** the gradient-type `*-from-*`/`*-to-*` stops that make `maskLinear`/`maskRadial`/`maskConic` mask anything, and mis-routes completion to `maskFrom`/`maskTo`, which emit the **incompatible EDGE family** (`mask-t-from-*`) — so the three roots would ship as primitives with no idiomatic completer (§11.6 CONVERGE). Worked examples #2 and #3 render nothing or mask incorrectly.
>
> **Redesign (this document):** CUT the three gradient-type roots and all their types/vocab/tests. Resubmit the **edge-fades + composite + type + image-reset** subset — the five methods independently verified functional and class-correct against the v4.1 spec. This narrowed surface still closes the single most common real mask use (hero / scroll-edge bottom fade) with classes that mask immediately. The gradient-type roots return only as a complete `root + from/to (+ via)` unit in a future RFC. Status is therefore **needs-redesign**, presenting that minimal surviving surface below.

## Problem

Tailwind v4.1 ships a first-class `mask-image` utility family. The library has **zero** mask
surface today:

```
$ grep -n mask src/core/tailwind-methods.ts src/core/tailwind-types.ts src/class-vocab/vocab.ts
# (no output)
```

The only `Mask` token anywhere in the public surface is the unrelated SVG `<mask>` **container
View** added in 6.0.0 (`CHANGELOG.md:382` — `LinearGradient`/`RadialGradient`/`Stop`,
`ClipPath`, **`Mask`**, `Filter`…). That builds the `<mask>` element; it cannot set
`mask-type`, and nothing can set a CSS `mask-image`. `CHANGELOG.md` (6.0.0 → 6.1.1) has no mask
Tailwind entry — 6.1.x shipped popover/native-dialog, anchor-positioning, `Form<T>`, and
relational state hooks, none of which touch masks.

The result is that **every** mask today is a raw class escape hatch — exactly what §11.6 and the
eslint plugin forbid:

```ts
// The only path that exists today (discovery c08-effects-filters.md:116):
Div().background("[url(/hero.jpg)]")
  .addClass("mask-b-from-50%").addClass("mask-b-to-90%")   // eslint-flagged, untyped
```

There is no type checking (a `mask-b-form-50%` typo ships), no extractor resolution guarantee,
and no convergent way to express a soft edge fade — the single most common real use of CSS masks
(hero-image bottom fade, scroll-edge gradients). This RFC adds the **core primitive gap** for
that case: a typed fluent surface that emits genuine, verified-functional first-class Tailwind
v4.1 mask classes.

### Scope & phasing (roadmap #75)

The v4.1 mask family is large; #75 phases it. The adversary review (V-RFC-C-10) demonstrated that
the gradient-TYPE roots cannot be shipped independently of their `*-from-*`/`-to-*` stops — they
emit either a non-existent class (`mask-radial`) or functionally-inert modifiers
(`mask-linear-65` masks nothing on its own). They are **cut from this RFC** and recorded for a
future complete unit. This RFC ships exactly the surface that is **individually functional and
class-correct against the v4.1 spec**:

| Phase | Surface | This RFC |
| --- | --- | --- |
| **Ships now** | `maskImage` (`mask-none` / `mask-[…]`); `maskFrom`, `maskTo` (edge fades — verified standalone-functional); `maskComposite`; **`maskType`** (SVG knob) | ✅ |
| **Deferred — gradient-type roots** | `maskLinear`, `maskRadial`, `maskConic` **together with** their `mask-{linear,radial,conic}-from-*`/`-to-*`/`-via-*` stops, shape/size/position modifiers — a single complete unit, never the bare root alone | ❌ (a future RFC; see Cut & deferred) |
| **Deferred — raster fine-grain (Phase B)** | `maskSize`, `maskPosition`, `maskRepeat` — raster-mask companions; need `custom()` dual-prefix emitters + inverse extractor paths | ❌ (signatures in Open questions) |
| **Deferred — box-model (Phase C, indefinite)** | `maskClip`, `maskOrigin` — no app caller | ❌ |

**Why the gradient-type roots are cut, not deferred-but-stubbed.** Tailwind v4.1 has **no** bare
`mask-radial` / `mask-linear` / `mask-conic` class (only `mask-none` is bare). A gradient-type
mask is established by its `mask-{type}-from-*` / `-to-*` color stops; the angle/shape/size/
position tokens are *modifiers* on that stop family and mask nothing on their own. Shipping the
modifiers without the stops would emit a dead class (`mask-radial`, §11.7 fail) plus inert classes
into the safelist, and would route callers to the **incompatible edge family** for completion
(`maskFrom`/`maskTo` emit `mask-{edge}-from-*`, a different utility group). That is precisely the
"primitive with no idiomatic caller" anti-pattern. The roots return only as a complete
`root + from/to (+ via)` unit.

**`maskVia` stays N/A for edges** (unchanged from the draft, and now the *only* via discussion in
scope): Tailwind v4.1 has **no** `mask-{edge}-via-*` class. A `via` stop exists **only** on the
gradient-TYPE masks (`mask-linear-via-*` etc.), which are cut here. Edge fades therefore ship
`maskFrom` + `maskTo` only.

**`maskType` ships in this phase**: it is a 2-member closed union, a single `pre()` row, and the
library already ships the `<mask>` container View that needs it. Shipping the edge/composite
surface while leaving the one SVG-mask knob behind `setClass("mask-type-luminance")` would be an
incomplete release.

## Proposed API (the contract)

### Types — `src/core/tailwind-types.ts`

Added in a new `// Masks (v4.1)` block in the effects/filters area. **No** radial shape/size/
position/options types (cut with the gradient roots):

```ts
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

`TailwindColor` (`tailwind-types.ts:80`) and `TailwindSpacing` (`:36`) already exist and carry
their own `[${string}]` arbitrary arm; `TailwindMaskStop` reuses them rather than re-deriving the
color/spacing scales.

### Interface — `src/core/tailwind-methods.ts`

Added to `FluentTailwindMethods`, in a new `// Masks (v4.1)` block. The matching type names join
the existing `import type { … } from "./tailwind-types"` block.

```ts
/**
 * v4.1 `mask-image`. `"none"` emits `mask-none` (reset); an arbitrary `[…]`
 * value (e.g. `[url(/fade.png)]`, `[linear-gradient(...)]`) emits `mask-[…]`.
 * For directional fades use {@link maskFrom}/{@link maskTo}. (Gradient-TYPE
 * masks — `mask-linear-*`/`mask-radial-*`/`mask-conic-*` — are not yet exposed;
 * use this arbitrary escape hatch in the interim.)
 * @example Div().maskImage("[url(/fade.png)]")   // mask-[url(/fade.png)]
 * @example Div().maskImage("none")               // mask-none
 */
maskImage(value: "none" | `[${string}]`): this;

/**
 * v4.1 directional mask fade — start stop. `edge` is the side(s) to fade
 * (`t|r|b|l|x|y`); `stop` is a `%`, spacing number, color, `(--var)`, or `[…]`.
 * Emits `mask-{edge}-from-{stop}`. Functional standalone (masks immediately);
 * pair with {@link maskTo} for the end stop.
 * @example Div().maskFrom("b", "50%")        // mask-b-from-50%
 * @example Div().maskFrom("x", "blue-500")   // mask-x-from-blue-500
 */
maskFrom(edge: TailwindMaskEdge, stop: TailwindMaskStop): this;

/**
 * v4.1 directional mask fade — end stop. Emits `mask-{edge}-to-{stop}`.
 * @example Div().maskFrom("b", "50%").maskTo("b", "90%")   // mask-b-from-50% mask-b-to-90%
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

In the `// Masks (v4.1)` impl block, after the gradient block (`:660-668`). The emitters **must**
match the vocab emitters byte-for-byte (the `class-vocab.test.ts` lib-parity test enforces this):

```ts
p.maskImage = function (value: string) {
  return value === "none" ? this.addClass("mask-none") : this.addClass(`mask-${value}`);
};
p.maskFrom = function (edge: string, stop: string) { return this.addClass(`mask-${edge}-from-${stop}`); };
p.maskTo   = function (edge: string, stop: string) { return this.addClass(`mask-${edge}-to-${stop}`); };
p.maskComposite = function (mode: string) { return this.addClass(`mask-${mode}`); };
p.maskType = function (value: string) { return this.addClass(`mask-type-${value}`); };
```

No `maskLinear`/`maskConic`/`maskRadial` impls — and no `signNeg` use here (the negative-angle
prefix flip belonged to the cut gradient roots; the surviving surface emits no signed classes).

### Emitted output

| Call | Class(es) |
| --- | --- |
| `.maskImage("none")` | `mask-none` |
| `.maskImage("[url(/fade.png)]")` | `mask-[url(/fade.png)]` |
| `.maskFrom("t","50%")` / `.maskTo("b","90%")` | `mask-t-from-50%` / `mask-b-to-90%` |
| `.maskFrom("x","70%")` / `.maskTo("y","95%")` | `mask-x-from-70%` / `mask-y-to-95%` |
| `.maskFrom("r","blue-500")` / `.maskFrom("l","4")` / `.maskFrom("t","[20px]")` | `mask-r-from-blue-500` / `mask-l-from-4` / `mask-t-from-[20px]` |
| `.maskComposite("add"\|"subtract"\|"intersect"\|"exclude")` | `mask-add` / `mask-subtract` / `mask-intersect` / `mask-exclude` |
| `.maskType("alpha"\|"luminance")` | `mask-type-alpha` / `mask-type-luminance` |

Every row above is a real, verified Tailwind v4.1 class. No bare `mask-radial`/`mask-linear`/
`mask-conic` is emitted anywhere.

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

### 2. Two-axis edge fade (scroll container)

```ts
// BEFORE — raw addClass calls:
Div().addClass("mask-y-from-90%").addClass("mask-x-from-95%");

// AFTER — typed:
Div().maskFrom("y", "90%").maskFrom("x", "95%");
// → class="mask-y-from-90% mask-x-from-95%"
```

### 3. Stacked corner fades, intersected (composite)

```ts
// Two edge fades combined with mask-composite:
Div().maskFrom("t", "30%").maskFrom("l", "30%").maskComposite("intersect");
// → class="mask-t-from-30% mask-l-from-30% mask-intersect"
```

### 4. SVG `<mask>` luminance type (the promoted `maskType`)

```ts
// BEFORE — raw setClass on the shipped <mask> container View:
Mask().setId("blob").addChild(Path(/* … */)).setClass("mask-type-luminance fill-gray-700/70");

// AFTER — typed:
Mask().setId("blob").addChild(Path(/* … */)).maskType("luminance").fill("gray-700/70");
// → mask-type-luminance (fill() lands via Track-C SVG item)
```

Every worked example here emits classes that mask immediately — there is no inert-class case left
after the gradient-root cut.

## Type-safety story

- **Closed keyword unions everywhere a finite set exists.** `TailwindMaskEdge` (6),
  `TailwindMaskComposite` (4), `TailwindMaskType` (2) are fully closed with **no** arbitrary tail
  — a typo is a compile error (`maskFrom("top", …)`, `maskComposite("overlay")`,
  `maskType("alfa")` all fail to compile). §11.4 satisfied.
- **`TailwindMaskStop` is a structured template-literal union.** `${number}%` for percentages,
  `TailwindColor`/`TailwindSpacing` for color/spacing-scale stops, `(${string})` for CSS vars, and
  `[${string}]` as the **last-resolving** explicit escape hatch (mirrors `TailwindGradientStop`'s
  breadth). A bad edge is caught; a malformed arbitrary inside `[…]` is the caller's opt-in (parity
  with every shipped arbitrary arm, not a new regression).
- **`maskImage` is `"none" | \`[${string}]\`` only** — the same escape-hatch contract as
  `TailwindBlur` (`tailwind-types.ts:255`) and `.textSize("[13px]")`.
- **No overloads, no overload-ordering hazard.** The cut of `maskRadial` removes the
  `[${string}]`-vs-options overload pair the draft needed; every surviving method is a single
  signature, so there is exactly one way to express each thing (§11.6 CONVERGE).

## Migration & compatibility

**Additive** within v6 (greenfield; no v5 back-compat in scope). Five brand-new methods + four
new exported types; **no** existing signature changes. Existing `.setClass("mask-…")` /
`.addClass("mask-…")` escape hatches keep working, but the regenerated eslint `VOCAB_METHODS` will
now steer callers to the fluent methods (intended convergence). CSS `mask-image` /
`mask-composite` / `mask-type` are Baseline Widely-available; stacking + composite has minor Safari
quirks (noted in JSDoc) — but the library only emits classes (§11.2), so there is no runtime/SSR
concern: on an unsupporting engine the element renders unmasked, a graceful degrade.

## Docs impact (§11.8 — exact files + markdown)

1. **`src/core/tailwind-methods.ts`** — the five JSDoc blocks shown above on the method decls.

2. **`README.md`** — new **Masks (v4.1)** subsection in the Fluent Styling reference:

   ```md
   ### Masks (v4.1)

   | Method | Class | Notes |
   | --- | --- | --- |
   | `.maskImage("none" \| "[…]")`     | `mask-none` / `mask-[…]` | reset / arbitrary mask-image |
   | `.maskFrom(edge, stop)`           | `mask-b-from-50%` | edge fade — start stop |
   | `.maskTo(edge, stop)`             | `mask-b-to-90%`   | edge fade — end stop |
   | `.maskComposite(mode)`            | `mask-intersect`  | stacked-mask composite |
   | `.maskType("alpha"\|"luminance")` | `mask-type-luminance` | SVG `<mask>` interpretation |

   #### Recipe — hero image bottom fade
   ​```ts
   Div().background("[url(/hero.jpg)]").maskFrom("b", "50%").maskTo("b", "90%")
   ​```
   `maskFrom`/`maskTo` set directional fade stops on each edge (`t r b l x y`); combine with
   `maskComposite` to intersect/subtract stacked fades. Gradient-TYPE masks
   (`mask-linear-*`/`mask-radial-*`/`mask-conic-*`) are not yet exposed — use
   `.maskImage("[linear-gradient(...)]")` in the interim.
   ```

3. **`fluent-html.md`** — mirror the same Masks subsection in the styling reference.

4. **`CHANGELOG.md`** — 6.2.0 entry under Added:
   `Added (Tailwind v4.1 masks): maskImage (mask-none / arbitrary mask-image), maskFrom/maskTo (directional edge fades), maskComposite, and maskType (SVG mask-type). Gradient-type roots (linear/radial/conic) and the raster fine-grain tail (size/position/repeat/clip/origin) are deferred — the gradient-type roots will ship as a complete root + from/to (+ via) unit in a later release.`

5. **`../fluent-html-tailwind-extractor/README.md`** — note the new mask vocab rows are
   auto-consumed (extractor is vocab-driven; no per-method edit).

6. **`../fluent-html-eslint-plugin/README.md`** — note `VOCAB_METHODS` is regenerated to include
   the five `mask*` methods.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure string `addClass`; no new runtime dependency. (No `signNeg` use — the
  signed-angle path was cut with the gradient roots.)
- **§11.2 SSR-sync** — every method is a synchronous `addClass` on the render path; no async.
- **§11.3 escape-by-default** — emits literal Tailwind class strings only; the sole HTML sink is the
  `class` attribute, already escaped; no attr/URL value interpolated into HTML (the `[url(/…)]` text
  lives inside a class token the caller owns).
- **§11.4 type-safety** — closed literal unions for edge/composite/type; structured
  `TailwindMaskStop` template union; `[${string}]` is an explicit opt-in escape hatch only; no `any`,
  no bare `string` where keywords are valid; a typo is a compile error.
- **§11.5 compat** — purely additive within v6 (five new methods + four new types); no existing
  symbol changes; honestly additive.
- **§11.6 idioms** — single positional value for the single-value setters; two positionals for
  `maskFrom/maskTo` (mirrors gradient `from`/`to`); accumulating `mask*` methods correctly take no
  `set*` counterpart; no overloads; no inline JS; CONVERGE — every emitted class is functional and
  exactly one method owns each thing. No primitive-with-no-caller: each surviving method masks on its
  own (the gradient-type roots that lacked a completer are cut).
- **§11.7 class-string contract** — every emitted class is literal, extractor-resolvable, **and a
  real Tailwind v4.1 class** (verified against the v4.1 mask-image docs + launch blog). No bare
  `mask-radial`/`mask-linear`/`mask-conic`. The lockstep below registers vocab rows, regenerates the
  eslint mirror, the extractor auto-consumes, and a class-existence guard pins each row against a
  checked-in v4.1 mask allowlist (see Lockstep) so no future non-existent class can ship silently.
- **§11.8 docs/guideline-sync** — every symbol in `api_surface` is covered by the Docs impact section
  (lib README + fluent-html.md + JSDoc + CHANGELOG + both tooling READMEs).

### Lockstep (§11.7 — exact edits)

- **CORE `src/class-vocab/vocab.ts`** — new `// Masks (v4.1)` section after the Gradients block
  (~line 213). All custom-emit rows except `maskType` (a clean `pre`). Each emitter **matches
  `tailwind-methods.ts` byte-for-byte**, with `samples` so the lib-parity test and extractor
  safelist round-trip:
  ```ts
  // Masks (v4.1)
  custom("maskImage",  (a) => (a[0] === "none" ? ["mask-none"] : [`mask-${a[0]}`]),
    [["none"], ["[url(/x.png)]"]]),
  custom("maskFrom", (a) => (a.length === 2 ? [`mask-${a[0]}-from-${a[1]}`] : []),
    [["t", "50%"], ["x", "70%"], ["r", "blue-500"], ["l", "4"], ["t", "[20px]"]]),
  custom("maskTo",   (a) => (a.length === 2 ? [`mask-${a[0]}-to-${a[1]}`]   : []),
    [["b", "90%"], ["y", "95%"]]),
  custom("maskComposite", (a) => [`mask-${a[0]}`],
    [["add"], ["subtract"], ["intersect"], ["exclude"]]),
  pre("maskType", "mask-type"),   // mask-type-alpha | mask-type-luminance
  ```
  No new emit `kind` — the existing `custom` + `pre` paths cover everything. **No `signNeg` import
  addition needed** for masks (the signed-angle roots are cut).
  **Prefix-ownership (now asserted, not prose).** Of the surviving rows, `maskImage` and
  `maskComposite` both emit `mask-…` classes with **no stable own-prefix** beyond the shared
  `mask` token, so both stay `custom` (never `pre`) and neither is registered in
  `PREFIX_BY_METHOD`. `maskType` is the only mask method owning a stable prefix (`mask-type`).
  Add an explicit class-vocab integrity assertion in `class-vocab.test.ts` — **no two rows claim
  the `mask` prefix** (and exactly one claims `mask-type`) — replacing the draft's prose note.
- **EXTRACTOR `../fluent-html-tailwind-extractor`** — **no source edit.** `extract.ts` imports
  `classVocab` + `emitClasses` directly (`extract.ts:9,11`), so all five rows are picked up
  automatically (custom rows run their own `emit`; `maskType`'s `pre` round-trips via the generic
  prefix handler). Confirm the arg-count allowlist for `custom` permits 2-arg rows (`maskFrom`/
  `maskTo`); add `extract.test.ts` fixtures for one row per method and re-run the class→method
  round-trip suite.
- **ESLINT `../fluent-html-eslint-plugin`** — regenerate `src/vocab.generated.ts` (header:
  *Do NOT edit by hand — run `npm run gen:vocab`*) so `VOCAB_METHODS` gains `maskImage`,
  `maskFrom`, `maskTo`, `maskComposite`, `maskType`; the `mask*` accumulators also join the append
  set. Update the `test/vocab-drift.mjs` snapshot in the same commit.
- **CLASS-EXISTENCE GUARD (new — closes the lib-parity blind spot).** The lib-parity test only
  asserts `render == emitClasses` and would have passed the dead `mask-radial`. Add a checked-in
  `test/fixtures/tailwind-v4.1-mask-allowlist.ts` enumerating the real v4.1 mask class **shapes**
  (`mask-none`, `mask-[…]`, `mask-{edge}-from-*`, `mask-{edge}-to-*`,
  `mask-{add|subtract|intersect|exclude}`, `mask-type-{alpha|luminance}`) and assert every sample
  row in the mask vocab block matches one shape. This makes a future non-existent mask class
  (`mask-radial`, were the roots ever re-added incorrectly) a test failure rather than a silent
  ship.
- **TYPE TESTS** — `test/types/mask.test-d.ts`: assert `maskFrom("top", …)`,
  `maskComposite("overlay")`, `maskType("alfa")` are compile errors; assert `maskFrom("t", "50%")`,
  `maskFrom("x", "blue-500")`, `maskFrom("t", "[20px]")`, `maskTo("b", "90%")`,
  `maskComposite("intersect")`, `maskType("luminance")`, and `maskImage("none")` /
  `maskImage("[url(/x.png)]")` type-check. `class-vocab.test.ts` lib-parity auto-covers
  render == vocab; the class-existence guard covers render == real-Tailwind-class.

## Cut & deferred

- **Gradient-type roots — `maskLinear` / `maskRadial` / `maskConic` (CUT).** Removed from
  `api_surface`, types (`TailwindMaskRadialShape/Size/Position/Options` deleted), vocab, eslint,
  and type tests. They cannot be made functional without their own `mask-{type}-from-*`/`-to-*`
  (and `-via-*`) color stops, plus the shape/size/position modifiers, which together form one
  unit. A future RFC must ship the root **with** those stops and present worked examples that mask
  visibly. The bare `mask-radial`/`mask-linear`/`mask-conic` class must **never** be emitted (it
  does not exist in v4.1).
- **Raster five (Phase B/C).** `maskSize`/`maskPosition`/`maskRepeat` (dual-prefix `custom`
  emitters + inverse extractor paths) and `maskClip`/`maskOrigin` (box-model) remain deferred —
  no in-lib image-mask producer consumes them yet, so they would be primitives with no idiomatic
  caller. Recorded signatures in Open questions.

## Alternatives considered

- **Ship the gradient-type roots stop-free now (the draft's approach).** Rejected by adversary
  review and confirmed here: emits the non-existent `mask-radial` (§11.7) and inert
  `mask-linear-65`/`mask-circle`/… modifiers with no working completer (§11.6). Cut.
- **Route gradient-root completion through `maskFrom`/`maskTo`.** Rejected: those emit the EDGE
  family (`mask-t-from-*`), a different, incompatible utility group from the gradient-type stops
  (`mask-linear-from-*`). They do not compose into one gradient-type mask.
- **Emit `maskImage` as inline style** (like 6.1.x `anchorName`/`positionArea`). Rejected: that
  choice was *forced* because Tailwind lacked those utilities. Tailwind v4.1 *does* ship `mask-*`
  utilities, so class emission is correct and keeps masks in the extractor/safelist pipeline.
- **Implement `maskVia` as an edge method.** Rejected: no `mask-{edge}-via-*` class exists in
  v4.1; it would emit an unresolvable class (§11.7). The gradient-type `via` stop ships with the
  cut roots' future RFC.
- **Keep `maskType` in the deferred tail.** Rejected: 2-member closed union, single `pre` row, with
  an in-lib consumer (the `<mask>` container View) — promote it so the SVG-mask knob isn't stranded
  behind `setClass`.

## Open questions

1. **Gradient-type roots, complete unit.** A future RFC ships `maskLinear`/`maskRadial`/`maskConic`
   **with** their stops. Open shape: do stops attach as a per-root options object
   (`maskLinear(65, { from: "0%", to: "60%", via: "50%" })`) or as dedicated
   `maskLinearFrom`/`maskLinearTo`/… methods? Resolve when that RFC is drafted; whichever wins must
   emit real `mask-{type}-from-*`/`-to-*`/`-via-*` classes and must never emit a bare
   `mask-{type}`.
2. **Phase-B raster companions.** When an in-lib image-mask producer lands, `maskSize` /
   `maskPosition` / `maskRepeat` each need a `custom()` emitter (dual-prefix: `mask-cover` keyword
   vs `mask-size-[…]` arbitrary; `mask-center` vs `mask-position-[…]`; `mask-no-repeat` vs
   `mask-repeat-x`) **and** a matching inverse extractor path. Recorded signatures (for the future
   RFC, not shipped here):
   ```ts
   maskSize(value: "auto" | "cover" | "contain" | `[${string}]`): this;
   maskSize(unit: "px" | "rem" | "em" | "%" | "vh" | "vw", amount: number): this;
   maskPosition(value: TailwindMaskPosition): this;     // top-left … center | [center_top_1rem]
   maskRepeat(value: "repeat" | "no-repeat" | "x" | "y" | "space" | "round"): this;
   ```
3. **`maskClip` / `maskOrigin` (Phase C).** Box-model masking of a raster mask-image — defer
   indefinitely until a concrete view needs them.
4. **`TailwindMaskStop` union breadth.** Combining `${number}%` | `TailwindColor` |
   `TailwindSpacing` is wide (mirrors `TailwindGradientStop`). Verify TS autocomplete perf and that
   the `[${string}]` arm still resolves last; tighten only if it degrades.

## Adversary review & resolutions

The adversary verdict (V-RFC-C-10, verdict=**reject**, confidence 0.86) listed six required
changes. Each is folded into the contract above:

1. **"DROP maskRadial / maskLinear / maskConic from this phase entirely."** — **Resolved (applied).**
   All three are cut from `api_surface`, types, the proposed API, vocab, eslint, and type tests.
   See *Cut & deferred*. They return only as a complete `root + from/to (+ via)` unit in a future
   RFC.
2. **"REMOVE the bare `mask-radial` emit … there is no bare `mask-radial`/`mask-linear`/`mask-conic`
   class."** — **Resolved (applied).** No bare gradient-type class is emitted anywhere; the emitted
   output table and impl contain only `mask-none`, `mask-[…]`, `mask-{edge}-from/-to-*`,
   `mask-{composite}`, and `mask-type-*` — all verified real v4.1 classes.
3. **"FIX worked example #3 and the maskLinear JSDoc."** — **Resolved (replaced).** The old
   examples #2/#3 and the maskLinear JSDoc are deleted with the roots. The new worked examples
   (#1 bottom fade, #2 two-axis fade, #3 stacked composite, #4 maskType) all emit classes that mask
   immediately; no example mixes a gradient root with edge stops.
4. **"NARROW the surviving scope to the four [five] functional methods."** — **Resolved (applied).**
   Scope is exactly `maskImage`, `maskFrom`, `maskTo`, `maskComposite`, `maskType`. `effort`
   lowered L→M, `status` set to `needs-redesign` with this redesign presented.
5. **"RESOLVE the maskComposite prefix-ownership claim concretely … add an explicit class-vocab
   integrity assertion (no two rows claim prefix `mask`) rather than a prose note."** — **Resolved
   (applied).** The Lockstep now states `maskImage` and `maskComposite` stay `custom` and are absent
   from `PREFIX_BY_METHOD`; `maskType` is the sole `mask-type`-prefix owner; and an explicit
   `class-vocab.test.ts` integrity assertion (no two rows claim `mask`; exactly one claims
   `mask-type`) replaces the prose note.
6. **"ADD a real Tailwind-class-existence guard or fixture."** — **Resolved (applied).** A new
   checked-in `test/fixtures/tailwind-v4.1-mask-allowlist.ts` enumerates the real v4.1 mask class
   shapes; the Lockstep's class-existence guard asserts every mask vocab sample matches a shape, so
   a future non-existent class (the very `mask-radial` failure) becomes a test failure rather than a
   silent safelist entry — closing the lib-parity blind spot the verdict identified.
