---
id: RFC-C-06
track: C
resolves: [#8, #66]
api_surface:
  - TailwindGradientPosition       # type (stop position) — CLOSED 0–100% ladder ∪ [..]
  - TailwindGradientAngle          # type (linear/conic angle)
  - TailwindGradientOrigin         # type (radial origin/position)
  - TailwindGradientColorSpace     # type
  - TailwindGradientHueInterpolation # type
  - TailwindGradientInterpolation  # type (color-space ∪ hue)
  - TailwindGradientDirection      # CHANGED: `(string & {})` arm removed (type-narrow)
  - "FluentTailwindMethods.from"          # widened: optional 2nd position arg
  - "FluentTailwindMethods.via"           # widened: optional 2nd position arg
  - "FluentTailwindMethods.to"            # widened: optional 2nd position arg
  - "FluentTailwindMethods.gradient"      # widened: optional 4th interpolation arg
  - "FluentTailwindMethods.gradientTo"    # widened: optional 2nd interpolation arg
  - "FluentTailwindMethods.gradientLinear" # NEW: angle linear gradient
  - "FluentTailwindMethods.gradientConic"  # widened: optional angle + interpolation
  - "FluentTailwindMethods.gradientRadial" # widened: optional origin + interpolation
breaking: "additive + 1 type-narrow (TailwindGradientDirection)"
guardrails_checked:
  - "§11.1 zero-deps"
  - "§11.2 SSR-only/sync-render"
  - "§11.3 escape-by-default"
  - "§11.4 type-safety"
  - "§11.5 compat (additive + 1 honest type-narrow within greenfield v6)"
  - "§11.6 idioms/converge"
  - "§11.7 class-string contract (vocab lockstep)"
  - "§11.8 docs/guideline-sync"
guideline_updates:
  - "fluent-html/README.md — Tailwind methods table (Gradient rows: stop positions, gradientLinear, conic angle, radial origin, interpolation) + note the closed direction union"
  - "fluent-html/fluent-html.md — Gradient section (full worked examples)"
  - "src/core/tailwind-methods.ts — JSDoc on from/via/to + the four gradient-type methods + gradientLinear"
  - "src/core/tailwind-types.ts — TailwindGradientDirection closed (drop `(string & {})`) + 6 new gradient types"
  - "../fluent-html-tailwind-extractor/README.md — supported-methods list + example.ts (2-arg stops, angle, interpolation)"
  - "../fluent-html-eslint-plugin/README.md — method list + no-known-modifiers/no-conflicting notes"
  - "CHANGELOG.md — 6.2.0 entry (Tailwind v4 gradients; flags the TailwindGradientDirection narrow)"
impact: high
effort: L
depends_on: []
status: implemented
---

# RFC-C-06 — Tailwind v4 gradients (stop positions, angles, conic/radial, color interpolation)

> **Adversary verdict: SURVIVES-WITH-CHANGES.** Killer objection (resolved below): *adding
> `gradientLinear(angle)` while leaving `TailwindGradientDirection`'s `(string & {})` escape in
> place left THREE compiling ways to emit `bg-linear-45` (`gradientLinear` / `gradientTo("45")` /
> `gradient(_,_,"45")`) — a §11.6 convergence regression and the §11.4 hole the Problem section
> itself flagged. Deferring the union-close was unjustified under §11.5 (greenfield, zero published
> consumers, so the narrow is free).* This final RFC **closes `TailwindGradientDirection` in-scope**
> (re-labeled the type-narrow it is), fixes the eslint base-class patterns for bare
> `bg-radial`/`bg-conic`, and **narrows `TailwindGradientPosition` to a closed `0%…100%` ladder** so
> no dead, extractor-unresolvable class can be emitted. See *Adversary review & resolutions*.

## Problem

The gradient family shipped in v6.0.0 (`CHANGELOG.md:460`) is **keyword/zero-arg only** — it
exposes the *shape* of a gradient but none of the three knobs Tailwind v4 added on top of
linear-to-keyword: **stop positions**, **angles / conic / radial origin**, and **color
interpolation**. Every one of those is reachable today only through the untyped
`setClass`/`addClass`/`background("[…]")` escape hatch, so authoring them is untyped (a typo is a
runtime miss, not a compile error) and they evade the eslint `no-known-modifiers-in-setclass` /
`no-conflicting-classes-in-setclass` guards.

Concrete gaps, cited against current source:

1. **Stop positions — `from-10%` / `via-30%` / `to-90%` (#8).** `from`/`via`/`to` are **color-only**:
   `src/core/tailwind-methods.ts:666-668` emit `from-${color}` / `via-${color}` / `to-${color}` with
   no position slot; the stop type `TailwindGradientStop = TailwindColor`
   (`src/core/tailwind-types.ts:252`) carries no position. Placing a stop requires the untyped
   `.addClass("from-10%")` workaround.

2. **Linear angle / conic angle / radial origin (#66).**
   - `gradientTo(direction)` (`tailwind-methods.ts:663`, vocab `pre("gradientTo","bg-linear")` at
     `vocab.ts:211`) takes `TailwindGradientDirection` which is the 8 `to-*` keywords **plus
     `(string & {})`** (`tailwind-types.ts:247-249`). So `gradientTo("45")` *does* compile to
     `bg-linear-45` today — but **only through the untyped `string & {}` escape**: angles are
     undiscoverable, not `number`-typed, §11.4 is violated, and negatives are not relocated
     (`gradientTo("-65")` emits the invalid `bg-linear--65`). **This RFC closes that escape** (see
     *Proposed API*), so the angle has exactly one home.
   - `gradientConic()` / `gradientRadial()` are **zero-arg** (`tailwind-methods.ts:664-665`, vocab
     `stat(...)` at `vocab.ts:212-213`) emitting bare `bg-conic` / `bg-radial`. Conic **angle** and
     radial **origin** are unreachable except via `background("[…]")`.

3. **Color interpolation — `bg-linear-to-r/oklch`, `bg-conic/longer`, `bg-radial/srgb`.** None of the
   gradient-type emitters carry the `/{interpolation}` slash modifier
   (`tailwind-methods.ts:660-665` emit bare `bg-linear-${dir}` / `bg-radial` / `bg-conic`); no
   interpolation union exists in `tailwind-types.ts`.

**Verify-not-shipped:** a grep of `tailwind-methods.ts`, `tailwind-types.ts`, `vocab.ts`,
`emit.ts`, and `CHANGELOG.md` (6.0.0 → 6.1.1) returns **zero** hits for a position arg on
`from/via/to`, for `gradientLinear`, for a conic/radial argument, or for any interpolation token.
The 6.x gradient line is exactly `gradientTo(direction), from(color), via(color), to(color)` plus
the zero-arg `gradientRadial()/gradientConic()`. **`alreadyShipped = false`** for everything below.
(Verified at `tailwind-methods.ts:660-668` and `tailwind-types.ts:247-252`.)

**Real call sites.** A grep of the apps found *no* typed-path gradient placement, but it did find the
escape-hatch radial usage this RFC retires: `rideshare/src/landing/views/landing.view.ts:85` (and
`:87`, `impact.view.ts:27`):
```typescript
Div().position("absolute").rounded("full").w("px", 800).h("px", 800)
  .background("[radial-gradient(circle,rgba(82,183,136,0.15),transparent_70%)]")
```
No typed `.from(`/`.via(`-with-position usage exists yet — so the stop-position and angle/interpolation
work is net-new capability, and the radial example is a live escape-hatch we can converge onto a
typed primitive.

## Proposed API (the contract)

One convergent rule governs the whole surface, so there is **exactly one way to do each thing**
(§11.6):

| Concept | Lives on | NOT on |
|---|---|---|
| Stop **position** (`from-10%`) | `from` / `via` / `to` (optional 2nd arg) | the gradient-type methods |
| Gradient **direction keyword** (`to-r`) | `gradientTo` (closed 8-keyword union) | — |
| Linear **angle** (`bg-linear-45`) | `gradientLinear` (distinct method) — and **only** here, now that `gradientTo`/`gradient`'s direction union is closed | `gradientTo` / `gradient` (the angle can no longer be smuggled through them) |
| Conic **angle** (`bg-conic-180`) | `gradientConic` (optional 1st arg) | — |
| Radial **origin** (`bg-radial-[at_top_left]`) | `gradientRadial` (optional 1st arg) | — |
| **Color interpolation** (`/oklch`, `/longer`) | the gradient-*type* methods `gradientTo`/`gradient`/`gradientConic`/`gradientRadial` (optional trailing arg) | `from`/`via`/`to` (Tailwind puts the slash on the type token, never on a stop) |

The "angle lives on `gradientLinear`, NOT on `gradientTo`/`gradient`" row is now **enforced by the
type system**, not aspirational: closing `TailwindGradientDirection` (below) makes `gradientTo("45")`
and `gradient(_, _, "45")` **compile errors**.

### Types — `src/core/tailwind-types.ts`

**(a) CLOSE `TailwindGradientDirection` (`:247-249`) — REQUIRED type-narrow (Adversary change 1).**
Remove the `| (string & {})` arm so the union is exactly the 8 `to-*` keywords. This is the change
that makes the convergence table TRUE — without it the angle has three homes. §11.5 permits the
narrow: v6 is greenfield with **zero published consumers**, so the narrow is free. Marked
`breaking: type-narrow` honestly in frontmatter.

```typescript
// Gradient direction — CLOSED (C-06): the `(string & {})` escape is removed so an
// ANGLE can no longer be smuggled through gradientTo/gradient. Angles live on
// gradientLinear; only the 8 keywords are valid here. A typo (to-rr) is now a
// compile error.
export type TailwindGradientDirection =
  | "to-t" | "to-tr" | "to-r" | "to-br" | "to-b" | "to-bl" | "to-l" | "to-tl";
```

**(b) Six new gradient types** (after `TailwindGradientDirection`):

```typescript
// Gradient stop position (from-10% / via-30% / to-90%). CLOSED: a 0–100% ladder
// in 5% steps OR the arbitrary `[…]` escape hatch. NO bare `${number}%` — that
// admits -5% / 150% / 33.3% / NaN%, none of which Tailwind generates a class for,
// so they would emit a dead, extractor-UNRESOLVABLE class (a §11.7 break). The
// closed ladder guarantees every emitted `from-N%` class is real and resolvable;
// any in-between/out-of-range value goes through the explicit `[12px]`/`[33.3%]`
// arbitrary form. (Adversary change 5.)
export type TailwindGradientPosition =
  | "0%" | "5%" | "10%" | "15%" | "20%" | "25%" | "30%" | "35%" | "40%" | "45%"
  | "50%" | "55%" | "60%" | "65%" | "70%" | "75%" | "80%" | "85%" | "90%" | "95%"
  | "100%"
  | `[${string}]`;

// Linear / conic angle (bg-linear-45 / bg-conic-180). A bare integer degree, or
// the arbitrary `[…]` escape hatch for turn/grad/var units. Negatives relocate
// the leading `-` to a class-level prefix via signNeg (-65 → -bg-linear-65).
export type TailwindGradientAngle = number | `[${string}]`;

// Radial gradient origin (bg-radial-[at_top_left]). v4 has NO bare
// bg-radial-{keyword} utility — named origins compile to the arbitrary
// `[at_{token}]` form; the closed union keeps it discoverable + typo-safe while
// the EMITTED class stays a literal, extractor-resolvable string.
export type TailwindGradientOrigin =
  | "top" | "top-right" | "right" | "bottom-right"
  | "bottom" | "bottom-left" | "left" | "top-left" | "center"
  | `[${string}]`;

// Gradient color interpolation (the `/{space}` slash modifier). CLOSED:
// 8 color spaces ∪ 4 hue-interpolation methods. A typo (/oklhc, /lnger) is a
// compile error.
export type TailwindGradientColorSpace =
  | "oklch" | "oklab" | "srgb" | "srgb-linear" | "hsl" | "hwb" | "lab" | "lch";
export type TailwindGradientHueInterpolation =
  | "shorter" | "longer" | "increasing" | "decreasing";
export type TailwindGradientInterpolation =
  TailwindGradientColorSpace | TailwindGradientHueInterpolation;
```

### Methods — `FluentTailwindMethods` interface (Gradient block, `:283-290`)

```typescript
// Gradients (v4: bg-linear-* / bg-radial-* / bg-conic-*)

/**
 * Linear gradient with a direction KEYWORD (`bg-linear-to-r`), plus the two
 * color stops and (optionally) a direction + color interpolation. The direction
 * union is closed to the 8 `to-*` keywords — for an ANGLE use `gradientLinear`.
 *   gradient("indigo-500", "purple-500")                       → bg-linear-to-r from-indigo-500 to-purple-500
 *   gradient("indigo-500", "purple-500", "to-br", "oklab")     → bg-linear-to-br/oklab from-indigo-500 to-purple-500
 */
gradient(
  from: TailwindColor,
  to: TailwindColor,
  direction?: TailwindGradientDirection,
  interpolation?: TailwindGradientInterpolation,
): this;

/**
 * Linear gradient DIRECTION (keyword). `bg-linear-to-r`, optionally with a color
 * interpolation modifier: `gradientTo("to-r", "oklch")` → `bg-linear-to-r/oklch`.
 * The direction union is CLOSED to the 8 `to-*` keywords; an ANGLE (bg-linear-45)
 * is a compile error here — use `gradientLinear`. Keyword and angle are distinct
 * value spaces, kept as two methods so neither leaks into the other.
 */
gradientTo(direction: TailwindGradientDirection, interpolation?: TailwindGradientInterpolation): this;

/**
 * Linear gradient ANGLE. `gradientLinear(45)` → `bg-linear-45`;
 * `gradientLinear(-65)` → `-bg-linear-65` (the leading `-` is relocated by
 * signNeg); `gradientLinear("[0.25turn]")` → `bg-linear-[0.25turn]`.
 * The angle counterpart to keyword `gradientTo`; the ONLY way to emit a linear
 * angle now that gradientTo/gradient's direction union is closed.
 */
gradientLinear(angle: TailwindGradientAngle): this;

/**
 * Radial gradient. Zero-arg `gradientRadial()` → `bg-radial`; an origin maps to
 * the v4 arbitrary form `gradientRadial("top-left")` → `bg-radial-[at_top_left]`;
 * a color interpolation may be passed: `gradientRadial("top-left", "srgb")` →
 * `bg-radial-[at_top_left]/srgb`. The first arg is an origin (disjoint from
 * interpolation); for interpolation-without-origin pass `gradientRadial(undefined,
 * "srgb")` → `bg-radial/srgb`.
 */
gradientRadial(origin?: TailwindGradientOrigin, interpolation?: TailwindGradientInterpolation): this;

/**
 * Conic gradient. Zero-arg `gradientConic()` → `bg-conic`; an angle →
 * `gradientConic(180)` → `bg-conic-180` (`-90` → `-bg-conic-90`); a color
 * interpolation → `gradientConic(undefined, "longer")` → `bg-conic/longer`.
 */
gradientConic(angle?: TailwindGradientAngle, interpolation?: TailwindGradientInterpolation): this;

/**
 * Gradient stop color, with an OPTIONAL stop position drawn from a closed
 * 0–100% (5% step) ladder or an arbitrary `[…]` value:
 *   from("indigo-500")        → from-indigo-500
 *   from("indigo-500", "10%") → from-indigo-500 from-10%
 *   from("pink-500", "[12px]")→ from-pink-500 from-[12px]
 */
from(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
via(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
to(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
```

> **Reconciliation note (gradientRadial / gradientConic signatures).** The three sub-area drafts
> proposed these methods with one optional arg each (origin *or* angle in #66; interpolation in the
> modifier draft). They are merged here into a single `(positional?, interpolation?)` shape so the
> two knobs compose — `gradientRadial("top-left", "oklch")` → `bg-radial-[at_top_left]/oklch`,
> `gradientConic(180, "longer")` → `bg-conic-180/longer`. This is the convergent superset; each
> argument is independently optional and trailing, so every existing call still compiles.

### Implementations — `src/core/tailwind-methods.ts` (`:660-668`)

`signNeg` is already imported into core at `tailwind-methods.ts:11`
(`import { DIR_MAP, ROUNDED_CORNERS, signNeg } from "../class-vocab/types.js";`) and is the same
helper `rotate`/`translate` use at `:624-626` — no new import, no inline sign logic.

```typescript
const interp = (cls: string, i?: string) => (i ? `${cls}/${i}` : cls);
const radialOrigin = (o: string) =>
  o.startsWith("[") ? `bg-radial-${o}` : `bg-radial-[at_${o.replace(/-/g, "_")}]`;

p.gradient = function (from: string, to: string, direction: string = "to-r", interpolation?: string) {
  return this
    .addClass(interp(`bg-linear-${direction}`, interpolation))
    .addClass(`from-${from}`).addClass(`to-${to}`);
};
p.gradientTo     = function (direction: string, interpolation?: string) { return this.addClass(interp(`bg-linear-${direction}`, interpolation)); };
p.gradientLinear = function (angle: string | number) { return this.addClass(signNeg("bg-linear", String(angle))); };
p.gradientRadial = function (origin?: string, interpolation?: string) {
  return this.addClass(interp(origin ? radialOrigin(origin) : "bg-radial", interpolation));
};
p.gradientConic  = function (angle?: string | number, interpolation?: string) {
  return this.addClass(interp(angle === undefined ? "bg-conic" : signNeg("bg-conic", String(angle)), interpolation));
};
p.from = function (color: string, position?: string) { this.addClass(`from-${color}`); return position ? this.addClass(`from-${position}`) : this; };
p.via  = function (color: string, position?: string) { this.addClass(`via-${color}`);  return position ? this.addClass(`via-${position}`)  : this; };
p.to   = function (color: string, position?: string) { this.addClass(`to-${color}`);   return position ? this.addClass(`to-${position}`)   : this; };
```

Every emitted class is a compile-time-known literal — concatenation over a closed union (now
including the closed direction *and* the closed 0–100% position ladder), the `signNeg` relocation,
or a static `[at_…]` form (never interpolated from a color/runtime value), so all are
extractor-resolvable (§11.7).

### Class-vocab — `src/class-vocab/vocab.ts` (gradient block, `:210-216`)

All gradient rows that grow a variadic/optional slot MUST become `custom` — see *Type-safety story*
for why a type-only widen on a `pre`/`stat` row is a **silent extractor miss**. `signNeg` is already
imported (`vocab.ts:11`). Replace `:210-216` with:

```typescript
const interp = (cls: string, i?: string) => (i ? `${cls}/${i}` : cls);
const stop = (m: string, prefix: string) =>
  custom(m, (a) => a.length >= 2 ? [`${prefix}-${a[0]}`, `${prefix}-${a[1]}`]
                : a.length === 1 ? [`${prefix}-${a[0]}`] : [],
    [[ "red-500" ], [ "red-500", "10%" ]]);

// Gradients (v4-native: bg-linear-* / bg-radial-* / bg-conic-*)
custom("gradient", (a) => (a.length >= 2
  ? [interp(`bg-linear-${a[2] ?? "to-r"}`, a[3]), `from-${a[0]}`, `to-${a[1]}`] : []),
  [[ "red-500", "blue-500" ], [ "red-500", "blue-500", "to-br" ], [ "red-500", "blue-500", "to-br", "oklab" ]]),
custom("gradientTo", (a) => (a.length >= 1 ? [interp(`bg-linear-${a[0]}`, a[1])] : []),
  [[ "to-r" ], [ "to-r", "oklch" ], [ "to-tr", "longer" ]]),
custom("gradientLinear", (a) => [signNeg("bg-linear", a[0]!)],
  [[ "45" ], [ "-65" ], [ "[0.25turn]" ]]),
custom("gradientRadial", (a) => {
  const origin = a[0]
    ? (a[0].startsWith("[") ? `bg-radial-${a[0]}` : `bg-radial-[at_${a[0].replace(/-/g, "_")}]`)
    : "bg-radial";
  return [interp(origin, a[1])];
}, [[], [ "top-left" ], [ "[at_top_left]" ], [ "undefined", "srgb" ]]),
custom("gradientConic", (a) => [interp(a[0] === undefined ? "bg-conic" : signNeg("bg-conic", a[0]), a[1])],
  [[], [ "180" ], [ "-90" ], [ "undefined", "longer" ]]),
stop("from", "from"),
stop("via", "via"),
stop("to", "to"),
```

> **`gradientRadial` first-arg disambiguation in vocab samples.** The typed surface forbids passing
> an interpolation as the first arg (the first arg is `TailwindGradientOrigin`, the second is
> interpolation), so the only real interpolation-without-origin call is
> `gradientRadial(undefined, "srgb")` → `bg-radial/srgb`. The vocab sample uses the explicit
> `["undefined", "srgb"]` form to document exactly that emitted class, matching the typed call shape;
> no `[at_srgb]` sample is generated because the type forbids that call.

## Worked examples (before → after)

**Positioned linear stops (#8):**
```typescript
// before — untyped, extractor-invisible
Div().gradient("indigo-500", "emerald-500").via("sky-500")
  .addClass("from-10%").addClass("via-30%").addClass("to-90%")
// after — typed, lintable, extractor-resolvable (positions from the closed ladder)
Div().gradientTo("to-r")
  .from("indigo-500", "10%").via("sky-500", "30%").to("emerald-500", "90%")
// → bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%
// off-ladder / fractional: explicit arbitrary form
Div().from("indigo-500", "[33.3%]")        // from-indigo-500 from-[33.3%]
```

**Linear angle (#66) — now the ONLY compiling path:**
```typescript
Div().setClass("bg-linear-45")           // before
Div().gradientLinear(45)                  // after → bg-linear-45
Div().gradientLinear(-65)                 //       → -bg-linear-65 (signNeg relocates the '-')
Div().gradientLinear("[0.25turn]")        //       → bg-linear-[0.25turn]
Div().gradientTo("45")                    // ✗ compile error — direction union is closed
Div().gradient("a", "b", "45")            // ✗ compile error — direction union is closed
```

**Radial origin, retiring the live escape hatch (`rideshare/.../landing.view.ts:85`):**
```typescript
// before — untyped CSS-in-class
Div().w("px", 800).h("px", 800)
  .background("[radial-gradient(circle,rgba(82,183,136,0.15),transparent_70%)]")
// after
Div().w("px", 800).h("px", 800)
  .gradientRadial().from("[#52b788]/15").to("transparent")   // bg-radial from-[#52b788]/15 to-transparent
Div().gradientRadial("top-left")                              // bg-radial-[at_top_left]
```

**Conic angle:**
```typescript
Div().gradientConic()        // bg-conic (unchanged)
Div().gradientConic(180)     // bg-conic-180
Div().gradientConic(-90)     // -bg-conic-90
```

**Color interpolation (#66 modifier) — collapses a `setClass` duplicate:**
```typescript
// before — raw class duplicates the typed one; eslint no-conflicting flags it
Div().gradientTo("to-r").from("indigo-500").to("purple-500").setClass("bg-linear-to-r/oklch")
// after
Div().gradientTo("to-r", "oklch").from("indigo-500").to("purple-500")
// → bg-linear-to-r/oklch from-indigo-500 to-purple-500
Div().gradient("indigo-500", "purple-500", "to-br", "oklab")  // bg-linear-to-br/oklab from-… to-…
Div().gradientRadial("top-left", "srgb")                      // bg-radial-[at_top_left]/srgb
Div().gradientConic(undefined, "longer")                      // bg-conic/longer
```

## Type-safety story

- **Closed unions, no bare `string`.** `from("indigo-500", "ten")`, `gradientLinear("fast")`,
  `gradientTo("to-r", "oklhc")`, `gradientRadial("middle")`, **and now `gradientTo("45")` /
  `gradient(_,_,"45")`** are all **compile errors** (§11.4). The only open-ended slots are the
  constrained `` `[${string}]` `` arbitrary forms, mirroring the library-wide `textSize("[13px]")`
  idiom.
- **Linear angle has exactly ONE home.** Closing `TailwindGradientDirection` removes the
  `(string & {})` escape, so an angle can no longer be smuggled through `gradientTo`/`gradient`.
  `gradientLinear` (`number | [..]`) is the single, `signNeg`-correct path — no broken
  `bg-linear--65`, no three-ways-to-do-one-thing convergence regression.
- **Stop positions can't emit dead classes.** `TailwindGradientPosition` is a closed
  `0%…100%` ladder (plus the explicit `[…]` arbitrary form), so every `from-N%` / `via-N%` / `to-N%`
  the surface can emit is a real, extractor-resolvable Tailwind class. Off-ladder / fractional values
  go through the deliberate `[33.3%]` escape — never through a silently-dead `${number}%`.
- **Interpolation lives on one axis.** A single `TailwindGradientInterpolation` (8 spaces ∪ 4 hue
  methods) is the *only* way to set interpolation, and it sits on the gradient-type token exactly as
  Tailwind emits it — never duplicated onto `from`/`via`/`to`.
- **THE LOAD-BEARING LOCKSTEP FINDING (§11.7).** A TS-signature widen **alone** silently breaks the
  extractor. The extractor's `arityOk` (`../fluent-html-tailwind-extractor/.../extract.ts:113-126`)
  requires a `prefix` row to be **exactly 1 arg** and a `static` row to be **exactly 0 args**; a
  2-arg `.from("indigo-500","10%")` against a `pre("from","from")` row, or a 1-arg
  `.gradientConic(180)` against a `stat("gradientConic","bg-conic")` row, is classified as a **name
  collision and DROPPED** (silent miss). `custom` arity is unguarded (`extract.ts:120-121`) and its
  emit fn runs in *both* the render path (`tailwind-methods.ts`) and the extractor/eslint path (via
  `emitClasses` → `shape.emit`). Therefore **`from`/`via`/`to` (now `custom` via the `stop` helper),
  `gradientTo`, `gradientConic`, `gradientRadial` MUST all convert from `pre`/`stat` to `custom`**;
  `gradientLinear` is `custom` from birth; `gradient` is already `custom`. The `class-vocab.test.ts`
  lib-parity test renders each method and asserts byte-equality with the emitters, so any
  vocab/emitter divergence fails loudly.

## Migration & compatibility

**Additive + one honest type-narrow within v6** (§11.5). v6 is greenfield (no v5 surface, zero
published consumers), so the narrow is free.

- **`TailwindGradientDirection` — type-narrow (breaking in principle, free in practice).** Drops the
  `(string & {})` arm. The only calls this breaks are exactly the ones this RFC means to break —
  `gradientTo("45")` / `gradient(_,_,"45")` smuggling an angle through the keyword union. Keyword
  calls (`gradientTo("to-r")`, `gradient("a","b","to-br")`) are unaffected. Honestly marked
  `breaking: additive + 1 type-narrow` in frontmatter.
- `from`/`via`/`to` — color-only 1-arg calls compile and emit **byte-identically**; the position is
  the optional 2nd arg.
- `gradientTo`/`gradient` — gain an optional trailing `interpolation`; all existing keyword 1-/3-arg
  calls unchanged.
- `gradientConic`/`gradientRadial` — gain optional args; zero-arg `bg-conic`/`bg-radial` unchanged.
- `gradientLinear` — net-new method.

**`prefixOf` regression watch.** Converting `gradientTo`/`gradientConic`/`gradientRadial` from
`pre`/`stat` to `custom` drops them from `PREFIX_BY_METHOD` (`emit.ts:63-83` only indexes
`static`/`prefix`/`optional`/`spacing`/`sizing`), so `prefixOf("gradientTo")` would start throwing.
**Verified: no core or eslint code path calls `prefixOf` on any gradient method** — the already-`custom`
`gradient` row sets the precedent (it has never had a stable prefix). Grep `prefixOf("gradient` before
merge as a belt-and-braces check.

**Three packages ship together.** The extractor and eslint vocab are *generated from `classVocab`*, so
the vocab rows propagate automatically — but the lib-parity test couples them, so all three packages
must land in one PR.

## Docs impact (§11.8 — exact files + patches)

**Library (this repo):**

1. `src/core/tailwind-types.ts` — close `TailwindGradientDirection` (drop `(string & {})`) + add the
   6 new gradient types (incl. the closed `TailwindGradientPosition` ladder).
2. `src/core/tailwind-methods.ts` — JSDoc on `from`/`via`/`to` (optional position), `gradientTo`
   (keyword-only + interpolation; angle is a compile error), `gradientLinear` (NEW, the sole angle
   path), `gradientConic` (angle + interpolation), `gradientRadial` (origin + interpolation),
   `gradient` (closed direction + interpolation) — exactly as in *Proposed API*, including the closed
   0–100% ladder note, the negative-angle `signNeg` note, and the keyword-vs-angle distinction.
3. `README.md` — Tailwind methods table, Gradient section. Add/replace rows + note the closed
   direction union:
   ```markdown
   | `from(color, position?)` | `from-{color}` `from-{position}` | Optional stop position from a 0–100% ladder, e.g. `from("indigo-500","10%")`; off-ladder via `from(_,"[33.3%]")`. |
   | `via(color, position?)`  | `via-{color}` `via-{position}`   | — |
   | `to(color, position?)`   | `to-{color}` `to-{position}`     | — |
   | `gradientLinear(angle)`  | `bg-linear-{angle}`              | The ONLY angle path (`45`, `-65`, `"[0.25turn]"`). Negatives relocate the `-`. |
   | `gradientTo(direction, interpolation?)` | `bg-linear-{dir}/{interp}?` | Keyword direction (closed 8-union; an angle is a compile error) + optional color interpolation. |
   | `gradientConic(angle?, interpolation?)` | `bg-conic[-{angle}][/{interp}]` | — |
   | `gradientRadial(origin?, interpolation?)` | `bg-radial[-[at_{origin}]][/{interp}]` | Named origin → `[at_…]`. |
   | `gradient(from, to, direction?, interpolation?)` | `bg-linear-{dir}/{interp}? from-… to-…` | Direction is the closed keyword union. |
   ```
4. `fluent-html.md` — Gradient section: the worked examples above (stops, angle, radial origin,
   interpolation), including the now-illegal `gradientTo("45")` callout.
5. `CHANGELOG.md` — 6.2.0 entry (additive + 1 narrow, flagged):
   ```markdown
   - feat(tailwind): Tailwind v4 gradients (#8, #66) — optional stop positions on
     `from`/`via`/`to` (closed 0–100% ladder); new `gradientLinear(angle)` as the
     sole linear-angle path; `gradientConic`/`gradientRadial` gain angle/origin;
     color interpolation modifier (`oklch`/`longer`/…) on
     `gradient`/`gradientTo`/`gradientConic`/`gradientRadial`.
   - **type-narrow** `TailwindGradientDirection` no longer carries `(string & {})`:
     an angle can no longer be passed to `gradientTo`/`gradient` (use
     `gradientLinear`). Greenfield-safe; converges the linear-angle path.
   ```

**Class-vocab lockstep (§11.7) — all required, in lockstep:**

6. `src/class-vocab/vocab.ts` — the 8 rows above (6 `custom` + the `stop`-helper trio), replacing
   the 7 rows at `:210-216`.
7. `../fluent-html-tailwind-extractor` — **no manual vocab edit** (it imports `classVocab`/`emitClasses`
   from `fluent-html/class-vocab`, so the new `custom` rows propagate). Add `extract.test.ts`
   assertions mirroring `extract.test.ts:131-132` for the new emitted classes
   (`from-indigo-500 from-10%`, `bg-linear-45`, `-bg-linear-65`, `bg-linear-to-r/oklch`,
   `bg-radial-[at_top_left]`, `bg-conic-180`), rebuild `dist`, and update the README supported-methods
   list + `example.ts`.
8. `../fluent-html-eslint-plugin/src/vocab.generated.ts` — **regenerate** `VOCAB_METHODS` (run the
   codegen, do not hand-edit) to insert `"gradientLinear"`. The other method names are unchanged.
   None are unit methods, so `UNIT_METHODS` is unchanged.
9. `../fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts` — the existing
   `{ pattern: "bg-linear-", methodName: "gradientTo" }` (`:385`) already catches `bg-linear-45` and
   `bg-linear-to-r/oklch` by substring. **Bare `bg-radial`/`bg-conic` have NO entry today** (only
   `bg-linear-`/`bg-gradient-`/`from-`/`via-`/`to-` exist at `:385-389`), so `setClass("bg-radial")`
   is currently un-flagged. **Add the base-class rows** `{ pattern: "bg-radial", methodName:
   "gradientRadial" }` and `{ pattern: "bg-conic", methodName: "gradientConic" }` — the slash forms
   (`bg-radial/srgb`, `bg-conic/longer`) are then caught by substring of the base pattern, so a
   single row per type covers both the bare and interpolation forms and the guard is consistent
   (Adversary change 4). Positioned stops are already covered by the existing `from-`/`via-`/`to-`
   rows.
10. `../fluent-html-eslint-plugin/src/rules/no-conflicting-classes-in-setclass.ts` — widen
    `GRADIENT_TYPE_RE` from `/^bg-(?:gradient|linear|radial|conic)(?:-|$)/` to
    `/^bg-(?:gradient|linear|radial|conic)(?:[-/]|$)/` so `bg-radial/srgb` / `bg-conic/longer` still
    collapse into the single gradient-type conflict group.
11. `../fluent-html-eslint-plugin/README.md` — note `gradientLinear` in the method list, the two new
    base-class patterns, and the closed direction union.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure `addClass` string methods reusing the existing `signNeg`; no new runtime
  dependency.
- **§11.2 SSR-only / sync render** — class accumulation only; no async on the render path.
- **§11.3 escape-by-default** — class-only; the `[at_…]` / `[0.25turn]` forms are static literals,
  never built from attribute/URL/color runtime values; no XSS surface.
- **§11.4 type-safety** — closed `TailwindGradientPosition` (0–100% ladder, no dead-class
  `${number}%`), `Angle`, `Origin`, `Interpolation` unions (+ constrained `[…]` slots); **and the
  `TailwindGradientDirection` `(string & {})` escape is removed**, so `gradientTo("45")` /
  `gradient(_,_,"45")` are compile errors and the angle lives solely on `gradientLinear` (`number`,
  `signNeg`-correct). No `any`, no bare `string`; a typo is a compile error.
- **§11.5 compat** — additive **+ one honest type-narrow** within greenfield v6: 2 widened stop
  methods (×3), 1 widened `gradient`, 1 widened `gradientTo`, 2 widened zero-arg methods, 1 new
  method, 6 new types, 1 narrowed union (`TailwindGradientDirection`). The narrow breaks only the
  angle-smuggling calls this RFC intends to break; greenfield ⇒ zero published consumers ⇒ free.
- **§11.6 idioms / converge** — positional scalars matching the existing positional `direction` arg
  (no options object for single scalars); **exactly one place per concept** — stop-position on stops,
  linear angle on `gradientLinear` (now enforced by the closed direction union, not just convention),
  interpolation on the type token; the `addClass("from-10%")` / `setClass("bg-linear-45")` /
  `background("[radial-gradient…]")` workarounds are all retired. No three-ways regression.
- **§11.7 class-string contract** — every class is a compile-time literal, extractor-resolvable,
  registered in `vocab.ts`; the **mandatory `pre`/`stat` → `custom` conversion** keeps the extractor's
  `arityOk` from silently dropping multi-arg calls; the closed `TailwindGradientPosition` ladder
  removes the residual dead-class hole (no `from-150%`/`from-NaN%` can be emitted); lockstepped to the
  extractor (auto via `classVocab` import + test rows) and eslint (`vocab.generated.ts` regen + base
  `bg-radial`/`bg-conic` rows + 1 regex widen).
- **§11.8 docs/guideline-sync** — library README + `fluent-html.md` + JSDoc + CHANGELOG (flagging the
  narrow), plus extractor and eslint READMEs/examples, covering every symbol in `api_surface`
  (including the changed `TailwindGradientDirection`).

## Alternatives considered

- **Overload `gradientTo` with angles (drop `gradientLinear`).** Rejected: mixing a `number` angle
  into a method whose union is keyword strings reintroduces the `string & {}` ambiguity this RFC
  closes, and makes negative-angle relocation conditional on arg shape. Two type-distinct methods is
  the converged shape (§11.6).
- **Keep `TailwindGradientDirection`'s `(string & {})` escape (defer the close to a follow-up RFC).**
  **Rejected per adversary (was the killer objection).** Leaving it open means `gradientTo("45")` and
  `gradient(_,_,"45")` still emit `bg-linear-45`, i.e. three compiling ways to do one thing — a §11.6
  regression and the §11.4 hole this RFC's Problem section flags. §11.5 (greenfield, zero consumers)
  makes the narrow free, so it is done **in this RFC**, not deferred.
- **Conic origin arg (`bg-conic-[from_…]`).** v4 only exposes it as an arbitrary `[from_…]` form and it
  is rarely used; deferred to keep the surface converged. If needed, widen `gradientConic`'s first arg
  to `TailwindGradientAngle | TailwindGradientOrigin` and branch in the emitter — additive follow-up.
- **A separate `gradientInterpolation()` mutator method** (c01's original shape). Rejected for §11.6
  convergence: the slash modifier is baked into the base type token at emit time, so there is exactly
  one way to set it — the trailing arg — and no post-hoc class mutation.
- **Position as a second `gradient(...)`-style bulk arg.** Rejected: stops are placed *per stop*
  (`from-10%`), so the position belongs on `from`/`via`/`to`, not on the bulk `gradient(from, to)`
  helper.
- **Keep `TailwindGradientPosition = `${number}%``.** Rejected per adversary: it admits
  `-5%`/`150%`/`33.3%`/`NaN%`, all of which emit a dead, extractor-unresolvable class (§11.7 break).
  The closed `0%…100%` (5% step) ladder + the explicit `[…]` arbitrary form for off-ladder values is
  the §11.4/§11.7-clean shape.
- **Trim the interpolation union to `oklch|oklab|srgb|hsl` + 4 hue methods.** All 8 spaces are kept for
  completeness; the union is closed and typo-safe, so the only cost is mild autocomplete noise.

## Open questions

1. **Interpolation union breadth.** Ship all 8 color spaces (incl. rare `lch`/`hwb`/`srgb-linear`) or
   trim to the common four + 4 hue methods? **Proposed: ship all 8** (closed + typo-safe; cost is only
   autocomplete noise).
2. **Stop-position ladder granularity.** The closed ladder is 5% steps (`0%…100%`). Finer granularity
   (1% steps) is 101 members and noisier autocomplete; coarser loses common stops. **Proposed: 5%
   steps**, with the `[…]` escape for any exact value (`from(_,"[33.3%]")`). Revisit only if real call
   sites demand a denser ladder.
3. **Radial named-origin → `[at_…]` mapping** assumes v4 has no first-class `bg-radial-{origin}`
   utility. **Adversary-verified against the live v4 `background-image` docs: confirmed — radial is
   arbitrary-only, `[at_top_left]` is the only correct emission.** If v4 adds bare origin utilities
   later, only the emitter changes — the typed surface stays stable.
4. **Conic interpolation-without-angle ergonomics.** `gradientConic(undefined, "longer")` requires an
   explicit `undefined` placeholder. **Proposed: keep the explicit-`undefined` form** — it preserves
   one unambiguous arg order and avoids re-introducing union ambiguity.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.72). All five required changes folded into the
contract above.

1. **Close `TailwindGradientDirection` in this RFC (remove `| (string & {})`).** **Resolved.**
   `tailwind-types.ts:247-249` is narrowed to exactly the 8 `to-*` keywords (*Types (a)*). This makes
   the convergence-table row "linear angle lives on `gradientLinear`, never on `gradientTo`" TRUE and
   enforced by the compiler: `gradientTo("45")` / `gradient(_,_,"45")` are now compile errors. Added
   to `api_surface`; documented in JSDoc, README, `fluent-html.md`, and CHANGELOG.

2. **Re-label frontmatter `breaking:` honestly (not `additive`).** **Resolved.** `breaking:` is now
   `"additive + 1 type-narrow (TailwindGradientDirection)"`; §11.5 guardrail line and *Migration &
   compatibility* both call out the narrow and justify it (greenfield, zero published consumers).

3. **Drop/rewrite the Alternatives bullet that deferred the union-close.** **Resolved.** The "defer
   to a follow-up RFC" bullet is rewritten to "**Rejected per adversary** — done in this RFC, not
   deferred," with the convergence/type rationale.

4. **eslint: add base-class `bg-radial` / `bg-conic` patterns, not just the slash forms.**
   **Resolved.** Confirmed via `no-known-modifiers-in-setclass.ts:384-389` that bare
   `bg-radial`/`bg-conic` have no entry today. Docs-impact item 9 now adds
   `{ pattern: "bg-radial", methodName: "gradientRadial" }` and
   `{ pattern: "bg-conic", methodName: "gradientConic" }`; the slash forms are caught by substring of
   the base pattern, so the guard is consistent (bare and interpolation forms both redirected).

5. **Resolve Open Question 1: narrow `TailwindGradientPosition` off bare `${number}%`.**
   **Resolved (option a).** `TailwindGradientPosition` is now a closed `0%…100%` (5% step) ladder ∪
   `[${string}]`; the dead-class hole (`-5%`/`150%`/`33.3%`/`NaN%`) is closed at the type level.
   Off-ladder/fractional stops go through the explicit `[33.3%]` arbitrary form. §11.4 and §11.7
   guardrail lines and the *Type-safety story* reflect this; the old "keep `${number}%` + JSDoc note"
   proposal is moved to *Alternatives → Rejected*.
