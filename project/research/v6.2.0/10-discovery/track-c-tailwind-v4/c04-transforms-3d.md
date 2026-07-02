# Track C — Tailwind v4: 3D Transforms

Lens scope: 3D transform utilities — `rotate-x/y/z`, `scale-z` / `scale-3d`, `translate-z`, `perspective` + `perspective-origin`, `transform-style` (`transform-3d`/`transform-flat`), `backface-visibility`.

## Context: what exists today

`Prototype` exposes only the 2D transform subset (`src/core/tailwind-methods.ts:252-257`):

```ts
scale(value: TailwindScale): this;
rotate(value: TailwindRotate): this;
translate(direction: "x" | "y", value: TailwindTranslate): this;   // x|y only — no z
skewX(value: TailwindSkew): this;
skewY(value: TailwindSkew): this;
```

Implementations at `src/core/tailwind-methods.ts:623-629`; vocab rows at `src/class-vocab/vocab.ts:188-190`. There is **no** `rotate-x/y/z`, `scale-z`, `scale-3d`, `translate-z`, `perspective`, `perspective-origin`, `transform-style`, or `backface-visibility` anywhere. Grep of `vocab.ts` and `tailwind-types.ts` returns nothing for any 3D term; CHANGELOG 6.0.0→6.1.1 has no 3D transform entries. The entire 3D family (shipped in Tailwind **v4.0**, docs current as of 4.1/4.3) is unexposed.

Notes that shape the design:
- `translate(direction, value)` is already a 2-axis method; the cleanest extension is to widen the axis union to `"x" | "y" | "z"` rather than add a new method. Same for `rotate`/`scale` — but those are currently single-value (2D plane) methods, so axis-specific 3D rotation/scale need their own emit (`rotate-x-*` vs the bare `rotate-*`), so a discriminated overload or sibling methods are warranted.
- `signNeg` helper (used by `rotate`/`translate`/`skew`) already relocates a leading `-` to the front of the class — reuse it for the negative-capable 3D rows.
- Vocab must stay in lockstep with `../fluent-html-tailwind-extractor` (`extract.test.ts:84` shows `translate("x","2") → translate-x-2`) and the eslint plugin.

---

## Proposal 1 — `translate` z-axis (widen existing method)

**Problem/evidence.** `translate(direction: "x" | "y", …)` (`tailwind-methods.ts:255`) cannot emit `translate-z-*` / `-translate-z-*`, which is the core building block of every 3D scene (`transform-3d` example stacks children on the z-axis). MDN `translate` / CSS `translateZ()` — Baseline widely available; Tailwind `translate-z-*` shipped v4.0.

**Proposed API** — widen the axis union (no new method):
```ts
translate(direction: "x" | "y" | "z", value: TailwindTranslate): this;
```
Emit is unchanged in shape — `signNeg("translate-z", value)` → `translate-z-12`, `-translate-z-12`. The existing impl at `tailwind-methods.ts:625-627` already interpolates `direction`, so only the type + the vocab sample list change.

**Before/After.**
```ts
// Before — impossible; falls back to setClass escape hatch
Div().setClass("translate-z-12")
// After
Div().translate("z", "12")        // → translate-z-12
Div().translate("z", "-12")       // → -translate-z-12
```

**Already in lib?** No (`x|y` only).
**Value:** high — z-translation is the primitive the rest of the lens composes around.
**Effort:** small (one-line union widen + vocab sample).

---

## Proposal 2 — `rotateX` / `rotateY` / `rotateZ`

**Problem/evidence.** Bare `rotate()` (`tailwind-methods.ts:624`) emits 2D `rotate-*` only. v4 adds independent `rotate-x-*`, `rotate-y-*`, `rotate-z-*`, each writing a distinct CSS var (`rotateX(<n>deg) var(--tw-rotate-y)` etc.) so they compose. MDN `transform: rotateX/Y/Z()` — Baseline widely available; utilities shipped Tailwind v4.0.

**Proposed API** — sibling methods mirroring `skewX`/`skewY` (which already exist at `:256-257`/`:628-629`), reusing `signNeg`:
```ts
rotateX(value: TailwindRotate3d): this;   // signNeg("rotate-x", value)
rotateY(value: TailwindRotate3d): this;   // signNeg("rotate-y", value)
rotateZ(value: TailwindRotate3d): this;   // signNeg("rotate-z", value)
```
`TailwindRotate3d` = `TailwindRotate` reused (`0|1|2|3|6|12|45|90|180` ± + `[${string}]`); 3D rotation commonly wants finer degrees, so admit `(number)` plus the `[...]` escape hatch already present on `TailwindRotate`.

**Before/After.**
```ts
// Before
Img().setClass("rotate-x-50").setClass("rotate-z-45")
// After
Img().rotateX(50).rotateZ(45)        // → rotate-x-50 rotate-z-45
Card().rotateY(-30)                  // → -rotate-y-30
```

**Already in lib?** No.
**Value:** high — card-flip / cube / tilt UIs need axis-specific rotation; the `skewX/skewY` precedent makes the shape obvious.
**Effort:** small (3 methods, reuse `signNeg`, reuse `TailwindRotate`).

---

## Proposal 3 — `perspective` + `perspectiveOrigin`

**Problem/evidence.** No way to set the viewing distance, so every 3D rotation/translation renders flat unless authored on an ancestor via `setClass`. v4 ships named perspective ramps and a 9-way origin keyword set. CSS `perspective` / `perspective-origin` — Baseline widely available; utilities Tailwind v4.0.

**Proposed API** — closed unions:
```ts
type TailwindPerspective =
  | "dramatic" | "near" | "normal" | "midrange" | "distant" | "none"
  | `[${string}]`;            // perspective-[750px]
type TailwindPerspectiveOrigin =
  | "center" | "top" | "top-right" | "right" | "bottom-right"
  | "bottom" | "bottom-left" | "left" | "top-left"
  | `[${string}]`;

perspective(value: TailwindPerspective): this;            // perspective-${value}
perspectiveOrigin(value: TailwindPerspectiveOrigin): this; // perspective-origin-${value}
```
Both are plain `pre(...)` vocab rows.

**Before/After.**
```ts
// Before
Div().setClass("perspective-distant").setClass("perspective-origin-bottom-left")
// After
Stage().perspective("distant").perspectiveOrigin("bottom-left")
// → perspective-distant perspective-origin-bottom-left
Stage().perspective("[750px]")     // → perspective-[750px]
```

**Already in lib?** No.
**Value:** high — perspective is mandatory for any of the above to look 3D; the named ramp is the most-reached-for v4 ergonomic.
**Effort:** small (2 `pre` rows + 2 unions).

---

## Proposal 4 — `transformStyle` (`transform-3d` / `transform-flat`) + `backfaceVisibility`

**Problem/evidence.** Nested 3D (a parent whose children live in shared 3D space — cubes, flip cards) requires `transform-style: preserve-3d`; v4 exposes it as `transform-3d` / `transform-flat`. `backface-visibility` (`backface-hidden`/`backface-visible`) hides the reverse face on flip cards. Neither is in the lib. MDN `transform-style` / `backface-visibility` — Baseline widely available; utilities Tailwind v4.0.

**Proposed API** — keyword methods (no args; matches `srOnly()`/`outlineHidden()` arg-less precedent at `:273`/`:278`):
```ts
transformStyle(value: "3d" | "flat"): this;        // transform-${value}  → transform-3d | transform-flat
backfaceVisibility(value: "visible" | "hidden"): this; // backface-${value}
```
Emit via `pre("transformStyle", "transform")` and `pre("backfaceVisibility", "backface")`. (Single-method-with-union keeps surface small vs. four arg-less methods; both are closed 2-value unions.)

**Before/After.**
```ts
// Before
Div(faces).setClass("transform-3d")
face.setClass("backface-hidden")
// After
Cube(faces).transformStyle("3d")       // → transform-3d
Face().backfaceVisibility("hidden")    // → backface-hidden
```

**Already in lib?** No.
**Value:** medium-high — required for nested 3D scenes; without `transform-3d` the children flatten. Slightly lower reach than perspective/rotate since flat single-element tilts don't need it.
**Effort:** small (2 `pre` rows + inline unions).

---

## Proposal 5 — `scaleZ` / `scale3d` / `scaleX` / `scaleY`

**Problem/evidence.** `scale(value)` (`tailwind-methods.ts:623`) emits only uniform `scale-*`. v4 adds per-axis `scale-x-*`, `scale-y-*`, `scale-z-*`, plus `scale-3d` (drives all three from CSS vars). z-scale is needed when depth-scaling extruded faces. CSS `scale` / `transform: scaleZ()` — Baseline widely available; utilities Tailwind v4.0.

**Proposed API** — axis sibling + the var-driven combinator, reusing `TailwindScale` and `signNeg` for negatives:
```ts
scaleX(value: TailwindScale): this;   // signNeg("scale-x", value)
scaleY(value: TailwindScale): this;   // signNeg("scale-y", value)
scaleZ(value: TailwindScale): this;   // signNeg("scale-z", value)
scale3d(): this;                      // scale-3d (arg-less)
```

**Before/After.**
```ts
// Before
Div().setClass("scale-z-150").setClass("scale-3d")
// After
Div().scaleZ("150").scale3d()         // → scale-z-150 scale-3d
Div().scaleX("75")                    // → -scale-x-75 via scaleX("-75")
```

**Already in lib?** No (only uniform `scale`).
**Value:** medium — `scaleX/scaleY` are common even in 2D (flip without rotate); `scaleZ`/`scale3d` are niche 3D. Bundling them is cheap once the file is open.
**Effort:** small (4 methods, reuse `TailwindScale` + `signNeg`).

---

## Lockstep note

Every row above must be mirrored in `../fluent-html-tailwind-extractor` (extractor maps method→class for the Tailwind safelist; see `extract.test.ts` patterns like `translate("x","2") → translate-x-2`) and validated by `../fluent-html-eslint-plugin`. The `translate` z-axis widening (Prop 1) needs the extractor's `translate` custom row to accept `"z"`; all others are straightforward `pre`/`signNeg` rows.

## Top picks

- **Proposal 3 — `perspective` / `perspectiveOrigin`**: prerequisite for any 3D to render; named ramp is the highest-ergonomic v4 win. (high / small)
- **Proposal 2 — `rotateX/Y/Z`**: the workhorse of card-flip/cube/tilt UIs; `skewX/skewY` precedent makes the shape obvious. (high / small)
- **Proposal 1 — `translate` z-axis**: one-line union widen unlocks z-depth stacking; the core 3D primitive. (high / small)
- **Proposal 4 — `transformStyle` + `backfaceVisibility`**: required for nested 3D scenes (preserve-3d) and clean flip cards. (med-high / small)
