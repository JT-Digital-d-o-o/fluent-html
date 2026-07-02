---
id: RFC-C-06
track: C
resolves: [#8, #66]
api_surface:
  - TailwindGradientPosition       # type (stop position)
  - TailwindGradientAngle          # type (linear/conic angle)
  - TailwindGradientOrigin         # type (radial origin/position)
  - TailwindGradientColorSpace     # type
  - TailwindGradientHueInterpolation # type
  - TailwindGradientInterpolation  # type (color-space ∪ hue)
  - "FluentTailwindMethods.from"          # widened: optional 2nd position arg
  - "FluentTailwindMethods.via"           # widened: optional 2nd position arg
  - "FluentTailwindMethods.to"            # widened: optional 2nd position arg
  - "FluentTailwindMethods.gradient"      # widened: optional 4th interpolation arg
  - "FluentTailwindMethods.gradientTo"    # widened: optional 2nd interpolation arg
  - "FluentTailwindMethods.gradientLinear" # NEW: angle linear gradient
  - "FluentTailwindMethods.gradientConic"  # widened: optional angle + interpolation
  - "FluentTailwindMethods.gradientRadial" # widened: optional origin + interpolation
breaking: additive
guardrails_checked:
  - "§11.1 zero-deps"
  - "§11.2 SSR-only/sync-render"
  - "§11.3 escape-by-default"
  - "§11.4 type-safety"
  - "§11.5 compat (additive within v6)"
  - "§11.6 idioms/converge"
  - "§11.7 class-string contract (vocab lockstep)"
  - "§11.8 docs/guideline-sync"
guideline_updates:
  - "fluent-html/README.md — Tailwind methods table (Gradient rows: stop positions, gradientLinear, conic angle, radial origin, interpolation)"
  - "fluent-html/fluent-html.md — Gradient section (full worked examples)"
  - "src/core/tailwind-methods.ts — JSDoc on from/via/to + the four gradient-type methods + gradientLinear"
  - "../fluent-html-tailwind-extractor/README.md — supported-methods list + example.ts (2-arg stops, angle, interpolation)"
  - "../fluent-html-eslint-plugin/README.md — method list + no-known-modifiers/no-conflicting notes"
  - "CHANGELOG.md — 6.2.0 additive entry (Tailwind v4 gradients)"
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-C-06 — Tailwind v4 gradients (stop positions, angles, conic/radial, color interpolation)

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
     (`gradientTo("-65")` emits the invalid `bg-linear--65`).
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
| Gradient **direction keyword** (`to-r`) | `gradientTo` | — |
| Linear **angle** (`bg-linear-45`) | `gradientLinear` (distinct method; keyword vs angle are different value spaces) | `gradientTo` (never via `string & {}`) |
| Conic **angle** (`bg-conic-180`) | `gradientConic` (optional 1st arg) | — |
| Radial **origin** (`bg-radial-[at_top_left]`) | `gradientRadial` (optional 1st arg) | — |
| **Color interpolation** (`/oklch`, `/longer`) | the gradient-*type* methods `gradientTo`/`gradient`/`gradientConic`/`gradientRadial` (optional trailing arg) | `from`/`via`/`to` (Tailwind puts the slash on the type token, never on a stop) |

### Types — `src/core/tailwind-types.ts` (after `TailwindGradientDirection`, `:249`)

```typescript
// Gradient stop position (from-10% / via-30% / to-90%). CLOSED: a percentage
// literal or the arbitrary `[…]` escape hatch. No bare string — a typo is a
// compile error. 0–100% is the meaningful range (Tailwind only generates a
// class for values it sees; fractional/out-of-range literals are passed through
// but emit no useful class — see Open Questions).
export type TailwindGradientPosition = `${number}%` | `[${string}]`;

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

`TailwindGradientDirection` is left **unchanged** (still carries `(string & {})`); see *Alternatives*
for why removing the escape is a separate breaking change, deliberately out of scope.

### Methods — `FluentTailwindMethods` interface (Gradient block, `:283-290`)

```typescript
// Gradients (v4: bg-linear-* / bg-radial-* / bg-conic-*)

/**
 * Linear gradient with a direction keyword (`bg-linear-to-r`), plus the two
 * color stops and (optionally) a direction + color interpolation.
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
 * For an ANGLE (bg-linear-45) use `gradientLinear` — keyword and angle are
 * distinct value spaces, kept as two methods so neither leaks into the other.
 */
gradientTo(direction: TailwindGradientDirection, interpolation?: TailwindGradientInterpolation): this;

/**
 * Linear gradient ANGLE. `gradientLinear(45)` → `bg-linear-45`;
 * `gradientLinear(-65)` → `-bg-linear-65` (the leading `-` is relocated by
 * signNeg); `gradientLinear("[0.25turn]")` → `bg-linear-[0.25turn]`.
 * The angle counterpart to keyword `gradientTo`.
 */
gradientLinear(angle: TailwindGradientAngle): this;

/**
 * Radial gradient. Zero-arg `gradientRadial()` → `bg-radial`; an origin maps to
 * the v4 arbitrary form `gradientRadial("top-left")` → `bg-radial-[at_top_left]`;
 * a color interpolation may be passed: `gradientRadial("srgb")` → `bg-radial/srgb`.
 * The first arg is EITHER an origin OR an interpolation (disjoint unions); pass
 * the origin when you need positioning.
 */
gradientRadial(origin?: TailwindGradientOrigin, interpolation?: TailwindGradientInterpolation): this;

/**
 * Conic gradient. Zero-arg `gradientConic()` → `bg-conic`; an angle →
 * `gradientConic(180)` → `bg-conic-180` (`-90` → `-bg-conic-90`); a color
 * interpolation → `gradientConic(undefined, "longer")` → `bg-conic/longer`.
 */
gradientConic(angle?: TailwindGradientAngle, interpolation?: TailwindGradientInterpolation): this;

/**
 * Gradient stop color, with an OPTIONAL stop position:
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

Every emitted class is a compile-time-known literal — concatenation over a closed union, the
`signNeg` relocation, or a static `[at_…]` form (never interpolated from a color/runtime value), so
all are extractor-resolvable (§11.7).

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
}, [[], [ "top-left" ], [ "[at_top_left]" ], [ "srgb" ]]),
custom("gradientConic", (a) => [interp(a[0] === undefined ? "bg-conic" : signNeg("bg-conic", a[0]), a[1])],
  [[], [ "180" ], [ "-90" ], [ "undefined", "longer" ]]),
stop("from", "from"),
stop("via", "via"),
stop("to", "to"),
```

> **`gradientRadial` first-arg ambiguity in vocab samples.** The emitter can't tell an origin
> (`"srgb"` is *not* a valid origin) from an interpolation by type at runtime, but it doesn't need
> to: `"srgb"` doesn't start with `[`, so it maps to `bg-radial-[at_srgb]` *as a sample-class*. The
> typed surface forbids that call (the first arg is `TailwindGradientOrigin`, the second is
> interpolation), so the only real interpolation-without-origin call is `gradientRadial(undefined,
> "srgb")` → `bg-radial/srgb`, which the `undefined`-first sample covers. The sample list documents
> the *real* emitted classes; the type forbids the nonsensical ones.

## Worked examples (before → after)

**Positioned linear stops (#8):**
```typescript
// before — untyped, extractor-invisible
Div().gradient("indigo-500", "emerald-500").via("sky-500")
  .addClass("from-10%").addClass("via-30%").addClass("to-90%")
// after — typed, lintable, extractor-resolvable
Div().gradientTo("to-r")
  .from("indigo-500", "10%").via("sky-500", "30%").to("emerald-500", "90%")
// → bg-linear-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%
```

**Linear angle (#66):**
```typescript
Div().setClass("bg-linear-45")           // before
Div().gradientLinear(45)                  // after → bg-linear-45
Div().gradientLinear(-65)                 //       → -bg-linear-65 (signNeg relocates the '-')
Div().gradientLinear("[0.25turn]")        //       → bg-linear-[0.25turn]
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
  `gradientTo("to-r", "oklhc")`, `gradientRadial("middle")` are all **compile errors** (§11.4). The
  only open-ended slots are the constrained `` `[${string}]` `` arbitrary forms, mirroring the
  library-wide `textSize("[13px]")` idiom.
- **Keyword vs angle stay type-distinct.** `gradientTo` takes the keyword union; `gradientLinear`
  takes `number | [..]`. Authors can no longer smuggle an angle through `gradientTo("45")` and get a
  silently-untyped `bg-linear-45` with broken negatives — the angle path is now first-class and
  `signNeg`-correct.
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

**Purely additive within v6** (§11.5). Every change is an optional, trailing argument or a brand-new
method:

- `from`/`via`/`to` — color-only 1-arg calls compile and emit **byte-identically**; the position is
  the optional 2nd arg.
- `gradientTo`/`gradient` — gain an optional trailing `interpolation`; all existing 1-/3-arg calls
  unchanged.
- `gradientConic`/`gradientRadial` — gain optional args; zero-arg `bg-conic`/`bg-radial` unchanged.
- `gradientLinear` — net-new method.

Nothing is removed or renamed; `TailwindGradientDirection` keeps its `(string & {})` escape (tightening
it is a separate breaking RFC). v6 is greenfield — no v5 surface involved.

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

1. `src/core/tailwind-methods.ts` — JSDoc on `from`/`via`/`to` (optional position), `gradientTo`
   (keyword + interpolation), `gradientLinear` (NEW), `gradientConic` (angle + interpolation),
   `gradientRadial` (origin + interpolation), `gradient` (interpolation) — exactly as in *Proposed
   API*, including the 0–100% range note, the negative-angle `signNeg` note, and the
   keyword-vs-angle distinction.
2. `README.md` — Tailwind methods table, Gradient section. Add/replace rows:
   ```markdown
   | `from(color, position?)` | `from-{color}` `from-{position}` | Optional stop position, e.g. `from("indigo-500","10%")`. |
   | `via(color, position?)`  | `via-{color}` `via-{position}`   | — |
   | `to(color, position?)`   | `to-{color}` `to-{position}`     | — |
   | `gradientLinear(angle)`  | `bg-linear-{angle}`              | Angle (`45`, `-65`, `"[0.25turn]"`). Negatives relocate the `-`. |
   | `gradientTo(direction, interpolation?)` | `bg-linear-{dir}/{interp}?` | Keyword direction + optional color interpolation. |
   | `gradientConic(angle?, interpolation?)` | `bg-conic[-{angle}][/{interp}]` | — |
   | `gradientRadial(origin?, interpolation?)` | `bg-radial[-[at_{origin}]][/{interp}]` | Named origin → `[at_…]`. |
   | `gradient(from, to, direction?, interpolation?)` | `bg-linear-{dir}/{interp}? from-… to-…` | — |
   ```
3. `fluent-html.md` — Gradient section: the worked examples above (stops, angle, radial origin,
   interpolation).
4. `CHANGELOG.md` — 6.2.0 additive entry:
   ```markdown
   - feat(tailwind): Tailwind v4 gradients (#8, #66) — optional stop positions on
     `from`/`via`/`to`; new `gradientLinear(angle)`; `gradientConic`/`gradientRadial`
     gain angle/origin; color interpolation modifier (`oklch`/`longer`/…) on
     `gradient`/`gradientTo`/`gradientConic`/`gradientRadial`. All additive.
   ```

**Class-vocab lockstep (§11.7) — all required, in lockstep:**

5. `src/class-vocab/vocab.ts` — the 8 rows above (6 `custom` + the `stop`-helper trio), replacing
   the 7 rows at `:210-216`.
6. `../fluent-html-tailwind-extractor` — **no manual vocab edit** (it imports `classVocab`/`emitClasses`
   from `fluent-html/class-vocab`, so the new `custom` rows propagate). Add `extract.test.ts`
   assertions mirroring `extract.test.ts:131-132` for the new emitted classes
   (`from-indigo-500 from-10%`, `bg-linear-45`, `-bg-linear-65`, `bg-linear-to-r/oklch`,
   `bg-radial-[at_top_left]`, `bg-conic-180`), rebuild `dist`, and update the README supported-methods
   list + `example.ts`.
7. `../fluent-html-eslint-plugin/src/vocab.generated.ts` — **regenerate** `VOCAB_METHODS` (run the
   codegen, do not hand-edit) to insert `"gradientLinear"`. The other method names are unchanged.
   None are unit methods, so `UNIT_METHODS` is unchanged.
8. `../fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts` — the existing
   `{ pattern: "bg-linear-", methodName: "gradientTo" }` already catches `bg-linear-45` and
   `bg-linear-to-r/oklch` by substring; **add** `{ pattern: "bg-radial/", methodName: "gradientRadial" }`
   and `{ pattern: "bg-conic/", methodName: "gradientConic" }` so the slash-interpolation forms are
   caught, plus `{ pattern: "from-", methodName: "from" }`-style rows already cover positioned stops.
9. `../fluent-html-eslint-plugin/src/rules/no-conflicting-classes-in-setclass.ts` — widen
   `GRADIENT_TYPE_RE` from `/^bg-(?:gradient|linear|radial|conic)(?:-|$)/` to
   `/^bg-(?:gradient|linear|radial|conic)(?:[-/]|$)/` so `bg-radial/srgb` / `bg-conic/longer` still
   collapse into the single gradient-type conflict group.
10. `../fluent-html-eslint-plugin/README.md` — note `gradientLinear` in the method list and the two
    new interpolation patterns.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure `addClass` string methods reusing the existing `signNeg`; no new runtime
  dependency.
- **§11.2 SSR-only / sync render** — class accumulation only; no async on the render path.
- **§11.3 escape-by-default** — class-only; the `[at_…]` / `[0.25turn]` forms are static literals,
  never built from attribute/URL/color runtime values; no XSS surface.
- **§11.4 type-safety** — closed `TailwindGradientPosition`/`Angle`/`Origin`/`Interpolation` unions
  (+ constrained `[…]` slots); no `any`, no bare `string`; angle through `gradientLinear` is `number`,
  not the old `string & {}` escape; a typo is a compile error.
- **§11.5 compat** — additive within v6: 2 widened stop methods (×3), 1 widened `gradient`, 1 widened
  `gradientTo`, 2 widened zero-arg methods, 1 new method, 6 new types; every existing call emits
  byte-identically.
- **§11.6 idioms / converge** — positional scalars matching the existing positional `direction` arg
  (no options object for single scalars); exactly one place per concept (stop-position on stops, angle
  on `gradientLinear`, interpolation on the type token); the `addClass("from-10%")` /
  `setClass("bg-linear-45")` / `background("[radial-gradient…]")` workarounds are all retired.
- **§11.7 class-string contract** — every class is a compile-time literal, extractor-resolvable,
  registered in `vocab.ts`; the **mandatory `pre`/`stat` → `custom` conversion** keeps the extractor's
  `arityOk` from silently dropping multi-arg calls; lockstepped to the extractor (auto via `classVocab`
  import + test rows) and eslint (`vocab.generated.ts` regen + 2 rule edits + 1 regex widen).
- **§11.8 docs/guideline-sync** — library README + `fluent-html.md` + JSDoc + CHANGELOG, plus extractor
  and eslint READMEs/examples, covering every symbol in `api_surface`.

## Alternatives considered

- **Overload `gradientTo` with angles (drop `gradientLinear`).** Rejected: mixing a `number` angle
  into a method whose union is keyword strings reintroduces the `string & {}` ambiguity this RFC
  closes, and makes negative-angle relocation conditional on arg shape. Two type-distinct methods is
  the converged shape (§11.6).
- **Tighten `TailwindGradientDirection` by removing `(string & {})`.** Tempting (it would make
  `gradientTo("45")` a compile error and force the typed `gradientLinear` path), but it is a **breaking**
  narrowing of an existing public union — out of this additive scope. Flagged as a follow-up RFC, not
  bundled.
- **Conic origin arg (`bg-conic-[from_…]`).** v4 only exposes it as an arbitrary `[from_…]` form and it
  is rarely used; deferred to keep the surface converged. If needed, widen `gradientConic`'s first arg
  to `TailwindGradientAngle | TailwindGradientOrigin` and branch in the emitter — additive follow-up.
- **A separate `gradientInterpolation()` mutator method** (c01's original shape). Rejected for §11.6
  convergence: the slash modifier is baked into the base type token at emit time, so there is exactly
  one way to set it — the trailing arg — and no post-hoc class mutation.
- **Position as a second `gradient(...)`-style bulk arg.** Rejected: stops are placed *per stop*
  (`from-10%`), so the position belongs on `from`/`via`/`to`, not on the bulk `gradient(from, to)`
  helper.
- **Trim the interpolation union to `oklch|oklab|srgb|hsl` + 4 hue methods.** All 8 spaces are kept for
  completeness; the union is closed and typo-safe, so the only cost is mild autocomplete noise. See
  Open Questions.

## Open questions

1. **Fractional / out-of-range stop positions.** `` `${number}%` `` permits `-5%` / `150%` /
   `33.3%`, for which Tailwind generates no class. Acceptable (matches the existing arbitrary-overload
   looseness) and JSDoc-noted as "0–100% is the meaningful range" — or should we narrow to a literal
   `0%|5%|10%|…|100%` ladder? **Proposed: keep `` `${number}%` `` + JSDoc note.**
2. **Interpolation union breadth.** Ship all 8 color spaces (incl. rare `lch`/`hwb`/`srgb-linear`) or
   trim to the common four + 4 hue methods? **Proposed: ship all 8** (closed + typo-safe; cost is only
   autocomplete noise).
3. **Radial named-origin → `[at_…]` mapping** assumes v4 has no first-class `bg-radial-{origin}`
   utility. Verify against current `tailwindcss.com/docs/background-image` before shipping; if v4 adds
   bare origin utilities later, only the emitter changes — the typed surface stays stable.
4. **Conic interpolation-without-angle ergonomics.** `gradientConic(undefined, "longer")` requires an
   explicit `undefined` placeholder. Acceptable, or worth a tiny convenience (e.g. accepting an
   interpolation as the first arg when it's not an angle)? **Proposed: keep the explicit-`undefined`
   form** — it preserves one unambiguous arg order and avoids re-introducing union ambiguity.
