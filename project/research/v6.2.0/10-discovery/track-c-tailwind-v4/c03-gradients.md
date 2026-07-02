# Track C — Tailwind v4 gradients (lens c03)

Lens scope: v4 gradient surface — `bg-linear-*` with angles, `bg-conic-*`, `bg-radial-*`, color interpolation (`/oklch`, `/srgb`, `/longer hue`), and `from/via/to` color **stop positions**.

## Current state in fluent-html (6.1.x)

`src/core/tailwind-methods.ts` (lines 283–290, 658–668) + `src/class-vocab/vocab.ts` (209–213) expose:

```ts
gradient(from, to, direction?)   // bg-linear-{dir} from-{from} to-{to}
gradientTo(direction)            // bg-linear-{dir}
gradientRadial()                 // bg-radial   (bare, no angle/position)
gradientConic()                  // bg-conic     (bare, no angle)
from(color) / via(color) / to(color)   // color only
```

`TailwindGradientDirection` (`tailwind-types.ts:247`) = the eight `to-*` keywords + `(string & {})`.
`TailwindGradientStop = TailwindColor` (`tailwind-types.ts:252`).

So linear-by-keyword + simple color stops are **already covered**. Three v4 capabilities are **missing**: angle-based linear/conic, stop **positions**, and **color-space interpolation** modifiers.

---

## Proposal 1 — Angle-based linear & conic (`bg-linear-<angle>`, `bg-conic-<angle>`)

**Problem/evidence.** v4 added arbitrary-angle linear gradients (`bg-linear-45`, `-bg-linear-65`) and `from <angle>` conic gradients (`bg-conic-180`) — Tailwind docs (background-image, v4.0). Today `gradientTo` only accepts the eight `to-*` keyword directions in `TailwindGradientDirection`; `gradientConic()` emits a bare `bg-conic` with no angle. There is no typed path to `bg-linear-45` or `bg-conic-180` except dropping to `setClass`/`addClass`.

**Proposed API.**
```ts
// linear: keep the keyword overload, add a numeric-angle overload
gradientLinear(angle: number): this;                 // bg-linear-{angle} | -bg-linear-{-angle}
// conic: angle arg on the existing method
gradientConic(angle?: number): this;                 // bg-conic | bg-conic-{angle}
```
- `gradientLinear(45)` → `bg-linear-45`; `gradientLinear(-65)` → `-bg-linear-65` (negative-sign hoist, mirrors existing `signNeg` in `class-vocab/types.ts`).
- `gradientConic(180)` → `bg-conic-180`; `gradientConic()` → `bg-conic` (unchanged).

**Before/After.**
```ts
// before
Div().setClass("bg-linear-45 from-pink-500 to-orange-400")
Div().setClass("bg-conic-180 from-blue-600 to-cyan-400")
// after
Div().gradientLinear(45).from("pink-500").to("orange-400")
Div().gradientConic(180).from("blue-600").to("cyan-400")
```

**Already in lib?** No — keyword-direction linear and bare conic exist; angle variants do not.
**Value:** medium. **Effort:** small (two prototype methods + extractor/eslint vocab entries).

---

## Proposal 2 — Gradient stop positions (`from-10%`, `via-30%`, `to-90%`)

**Problem/evidence.** v4 (and v3.3+) supports positioned color stops: `from-10%`, `via-30%`, `to-90%` (Tailwind docs background-image example). fluent-html's `from`/`via`/`to` take only a `TailwindGradientStop` (= `TailwindColor`, `tailwind-types.ts:252`), so there is no typed way to emit a stop position — you must `addClass("from-10%")` by hand. Positions are the difference between an even fade and a deliberate stop placement; common in hero/banner styling.

**Proposed API.** Second optional position arg (percentage stop):
```ts
type TailwindGradientPosition = `${number}%` | `[${string}]`;
from(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
via(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
to(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
```
- `from("indigo-500", "10%")` → `from-indigo-500 from-10%`
- `to("emerald-500", "90%")` → `to-emerald-500 to-90%`

**Before/After.**
```ts
// before
Div().gradient("indigo-500", "emerald-500").via("sky-500")
     .addClass("from-10%").addClass("via-30%").addClass("to-90%")
// after
Div().gradientTo("to-r")
     .from("indigo-500", "10%").via("sky-500", "30%").to("emerald-500", "90%")
```

**Already in lib?** No — `from/via/to` are color-only.
**Value:** high (the canonical v4 gradient example uses positioned stops; no typed path today). **Effort:** small (widen three signatures, conditional second `addClass`).

---

## Proposal 3 — Color-space interpolation modifier (`/oklch`, `/srgb`, `/longer`)

**Problem/evidence.** v4 lets you set the gradient color-interpolation space and hue method as a slash modifier on the gradient base class: `bg-linear-to-r/oklch`, `bg-conic/decreasing`, `bg-radial/longer` (Tailwind docs background-image; oklab is the v4 default). fluent-html has **no** way to emit this modifier — the slash is part of the `bg-linear-*`/`bg-conic-*`/`bg-radial-*` token itself, so `gradientTo`/`gradientLinear`/`gradientConic`/`gradientRadial` need to accept it. Today this requires `setClass`.

**Proposed API.** Optional interpolation arg on each gradient-base method:
```ts
type TailwindGradientInterpolation =
  | "srgb" | "hsl" | "oklab" | "oklch"
  | "longer" | "shorter" | "increasing" | "decreasing";

gradientTo(direction: TailwindGradientDirection, interpolation?: TailwindGradientInterpolation): this;
gradientLinear(angle: number, interpolation?: TailwindGradientInterpolation): this;
gradientConic(angle?: number, interpolation?: TailwindGradientInterpolation): this;
gradientRadial(interpolation?: TailwindGradientInterpolation): this;
```
- `gradientTo("to-r", "oklch")` → `bg-linear-to-r/oklch`
- `gradientConic(undefined, "decreasing")` → `bg-conic/decreasing`
- `gradientRadial("longer")` → `bg-radial/longer`

**Before/After.**
```ts
// before
Div().setClass("bg-linear-to-r/oklch from-indigo-500 to-teal-400")
// after
Div().gradientTo("to-r", "oklch").from("indigo-500").to("teal-400")
```

**Already in lib?** No — no interpolation modifier path exists.
**Value:** medium (oklab default is usually fine; the win is opting into `/longer`/`/oklch` for vivid hue arcs, esp. conic). **Effort:** small–medium (append `/{interp}` when present across four methods + keep `gradient()` shorthand in sync; update extractor/eslint).

---

## Top picks
- **Proposal 2 — stop positions on `from/via/to`** (high value, small effort; the canonical v4 example is currently un-typed).
- **Proposal 1 — angle-based `gradientLinear(n)` / `gradientConic(n)`** (small, fills the obvious v4 gap).
- **Proposal 3 — interpolation modifier** (rounds out the surface; pairs naturally with conic `/longer`).
