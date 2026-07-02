# Lens: tailwind-fidelity — v4 class-string fidelity of the fluent emitters

All findings were verified empirically by compiling candidate class strings with **tailwindcss 4.3.2** (`compile()` from the real package, scratchpad install) — "produces CSS" vs "produces zero CSS" below is measured, not assumed. The good news: the big v3→v4 renames are handled correctly (`bg-linear-*`, `outline-hidden`, `shadow-2xs/xs`, `ring-3`, masks, 3D transforms all compile), and feared regressions like `shadow-inner` and `max-w-screen-*` turn out to still be shipped by v4 as compat utilities. The real defects are two emitters that produce class strings v4 rejects outright (`bg-radial-[…]/<interp>`, `only-child:`) — both fail *silently* as missing styles — plus a cluster of value unions that are stuck on the v3 discrete scales and reject classes v4 actually ships (positive `translate-x-full`/fractions, `aspect-3/2`, `p-13`, `border-3`, `outline-solid`, `max-sm:` variants). Because the unions are deliberately closed (C-02), every missing member is a hard compile error for the user, so union completeness *is* the fidelity story for this library.

---

## tailwind-fidelity-1: `gradientRadial(origin, interpolation)` emits a class Tailwind v4 rejects — zero CSS

- **Kind:** bug
- **Severity:** high

**Evidence:** `src/core/tailwind-methods.ts:787-800`

```typescript
const interp = (cls: string, i?: string) => (i ? `${cls}/${i}` : cls);
const radialOrigin = (o: string) =>
  o.startsWith("[") ? `bg-radial-${o}` : `bg-radial-[at_${o.replace(/-/g, "_")}]`;
…
p.gradientRadial = function (origin?: string, interpolation?: string) {
  return this.addClass(interp(origin ? radialOrigin(origin) : "bg-radial", interpolation));
};
```

and the public signature at `src/core/tailwind-methods.ts:332`:

```typescript
gradientRadial(origin?: TailwindGradientOrigin, interpolation?: TailwindGradientInterpolation): this;
```

**Explanation:** When both arguments are given, the emitter produces e.g. `.gradientRadial("top-right", "oklch")` → `bg-radial-[at_top_right]/oklch`. Tailwind v4 does **not** support the interpolation modifier on the arbitrary-value form of `bg-radial-[…]`. Measured against tailwindcss 4.3.2:

| class | CSS emitted |
|---|---|
| `bg-radial-[at_top_right]` | ✅ `--tw-gradient-position: at top right` |
| `bg-radial/oklch` | ✅ `--tw-gradient-position: in oklch` |
| `bg-radial-[at_top_right]/oklch` | ❌ **zero CSS** |
| `bg-radial-[at_top_right_in_oklch]` | ✅ `--tw-gradient-position: at top right in oklch` |

So the combination silently drops the entire gradient position + interpolation — no compile error, no runtime error, just a missing style. (The `interp` helper is fine for `gradientTo`/`gradientLinear`/`gradientConic`: `bg-linear-to-r/oklch`, `bg-linear-45/oklch`, `bg-conic-45/oklch`, `-bg-conic-45/oklch` all compile.)

**Fix:** When `origin` is present, fold the interpolation into the arbitrary value instead of appending a modifier:

```typescript
p.gradientRadial = function (origin?: string, interpolation?: string) {
  if (!origin) return this.addClass(interp("bg-radial", interpolation));
  if (!interpolation) return this.addClass(radialOrigin(origin));
  // hue keywords expand the way Tailwind's own modifier does: /longer → "in oklch longer hue"
  const HUES = new Set(["shorter", "longer", "increasing", "decreasing"]);
  const tail = HUES.has(interpolation) ? `in_oklch_${interpolation}_hue` : `in_${interpolation}`;
  const inner = origin.startsWith("[") ? origin.slice(1, -1) : `at_${origin.replace(/-/g, "_")}`;
  return this.addClass(`bg-radial-[${inner}_${tail}]`);
};
```

(Verified: `bg-radial/longer` in v4 compiles to `--tw-gradient-position: in oklch longer hue`, so the hue expansion above matches Tailwind's own modifier semantics.)

---

## tailwind-fidelity-2: `"only-child"` in `TailwindState` emits `only-child:` — not a Tailwind variant

- **Kind:** bug
- **Severity:** medium

**Evidence:** `src/core/tailwind-types.ts:223`

```typescript
| "first-of-type" | "last-of-type" | "only-child"
```

**Explanation:** Tailwind's variant for `:only-child` is `only:` (and `only-of-type:` for `:only-of-type`) — there is no `only-child:` variant in any Tailwind version. Measured against 4.3.2: `only-child:mt-2` → **zero CSS**; `only:mt-2` and `only-of-type:mt-2` → ✅. So `.on("only-child", t => t.margin("t","2"))` type-checks, renders `only-child:mt-2` into the HTML, gets safelisted by the extractor, and produces no style — a silent no-op. Note `ExtraPseudoState` (`src/core/tailwind-types.ts:431`) already correctly contains `"only"` and `"only-of-type"`, so the working spellings exist; `"only-child"` is a broken duplicate.

**Fix:** Delete `"only-child"` from the union at `tailwind-types.ts:223`. (If back-compat for existing call sites matters, instead remap it in `p.on` — `state === "only-child" ? "only" : state` — but since the unions are closed and this string never worked, deletion is the honest fix.)

---

## tailwind-fidelity-3: `TailwindTranslate` rejects positive `full` and fractions — `translate-x-full` / `translate-x-1/2` are untypeable

- **Kind:** issue
- **Severity:** medium

**Evidence:** `src/core/tailwind-types.ts:187`

```typescript
export type TailwindTranslate = TailwindSpacing | `-${number}` | `-${number}/${number}` | "-full" | "-px";
```

**Explanation:** The union admits the *negative* forms `-full` and `-{n}/{n}` but not their positive counterparts. `TailwindSpacing` contributes only the numeric ladder + `px` + `[…]`, so:

- `.translate("x", "full")` → **compile error**, yet `translate-x-full` ✅ compiles in v4 (the standard slide-out-drawer idiom);
- `.translate("x", "1/2")` → **compile error**, yet `translate-x-1/2` ✅ compiles (the centering idiom's positive half);
- `.translate("x", "-full")` and `.translate("x", "-1/2")` are both accepted.

The asymmetry forces users into the `[${string}]` hatch (`.translate("x", "[100%]")`) for classes Tailwind ships natively.

**Fix:** widen the union symmetrically:

```typescript
export type TailwindTranslate =
  | TailwindSpacing | "full" | `${number}/${number}`
  | `-${number}` | `-${number}/${number}` | "-full" | "-px";
```

(`signNeg` at `src/class-vocab/types.ts:44-46` already relocates the leading `-` correctly, so no emitter change is needed.)

---

## tailwind-fidelity-4: `TailwindAspect` is closed to 3 keywords — no ratio form, and no `[…]` escape hatch at all

- **Kind:** issue
- **Severity:** medium

**Evidence:** `src/core/tailwind-types.ts:168` and the method at `src/core/tailwind-methods.ts:267,713`

```typescript
export type TailwindAspect = "auto" | "square" | "video";
…
aspect(value: TailwindAspect): this;
p.aspect = function (value: string) { return this.addClass(`aspect-${value}`); };
```

**Explanation:** Tailwind v4 supports bare-ratio aspect utilities (`aspect-3/2`, `aspect-16/9` — both ✅ verified against 4.3.2) and arbitrary `aspect-[4/3]` (✅ verified). The fluent union offers neither: it's the only value family in the file with *no* `[${string}]` arm, so there is no way to express any aspect ratio other than square/video — not even through the escape hatch that every other closed union provides (`.textSize("[13px]")` contract). `.aspect("3/2")` and `.aspect("[4/3]")` are both compile errors.

**Fix:**

```typescript
export type TailwindAspect = "auto" | "square" | "video" | `${number}/${number}` | `[${string}]`;
```

---

## tailwind-fidelity-5: closed v3 spacing ladder + `TailwindBorderWidth` reject values Tailwind v4 ships dynamically

- **Kind:** issue
- **Severity:** medium

**Evidence:** `src/core/tailwind-types.ts:33-36` and `:116`

```typescript
type BaseSpacing =
  | "0" | "px" | "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "3.5" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "11" | "12" | "14" | "16" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96";
…
export type TailwindBorderWidth = 0 | 2 | 4 | 8 | Stringified<0 | 2 | 4 | 8> | `[${string}]`;
```

**Explanation:** `BaseSpacing` reproduces v3's *discrete* spacing scale, but v4 derives spacing utilities dynamically from `--spacing` — **every** numeric multiple is valid. Verified against 4.3.2: `p-13` ✅, `w-17` ✅, `w-13` ✅, `min-w-4` ✅. Likewise v4 border widths accept any number: `border-3` ✅ compiles, but `TailwindBorderWidth` only admits `0|2|4|8`, so `.border(3)` / `.divideX(3)` are compile errors. Because these unions are closed (C-02, no `(string & {})` tail), users hit hard compile errors on classes that are first-class in v4 and must detour through `[…]` brackets (`p-[3.25rem]`) — which also changes the emitted CSS from theme-derived (`calc(var(--spacing) * 13)`) to hardcoded.

**Fix:** Two options, in preference order: (a) since v4 spacing is `number × --spacing`, admit `${number}` (and `-` where applicable) alongside the named steps — typo-safety for spacing was always numeric anyway, so an open numeric arm costs nothing: `type BaseSpacing = "px" | \`${number}\` | …`; or (b) minimally, extend the ladder with the common inter-step values (13, 15, 17, 18, …) and add `1 | 3` etc. to `TailwindBorderWidth`. Option (a) is the one that actually tracks v4 semantics.

---

## tailwind-fidelity-6: `TailwindOutline` is missing `solid` and all outline widths

- **Kind:** issue
- **Severity:** low

**Evidence:** `src/core/tailwind-types.ts:204` and `src/core/tailwind-methods.ts:316,778`

```typescript
export type TailwindOutline = "none" | "dashed" | "dotted" | "double";
…
outline(value: TailwindOutline): this;
p.outline = function (value: string) { return this.addClass(`outline-${value}`); };
```

**Explanation:** Tailwind v4 ships `outline-solid` (✅ verified — and it matters in v4, where a bare `outline` sets `outline-style: solid`) and numeric widths `outline-1` / `outline-2` / `outline-4` / `outline-8` (✅ `outline-1`, `outline-2` verified). The fluent surface can express neither: no `"solid"` member, no width arm, and no `[…]` hatch — so a focus treatment like `outline-2 outline-offset-2 outline-blue-500` cannot be written with `.outline()` at all (there is also no `outlineColor`/`outlineOffset` method, while the analogous `ring` family has `.ring()`/`.ringColor()`).

**Fix:** `export type TailwindOutline = "none" | "solid" | "dashed" | "dotted" | "double" | 0 | 1 | 2 | 4 | 8 | Stringified<0|1|2|4|8> | \`[${string}]\`;` — and consider companion `outlineColor(color: TailwindColor)` / `outlineOffset(value)` methods for parity with the ring family.

---

## tailwind-fidelity-7: variant unions omit v4's named `in-*` states and `max-*` breakpoints

- **Kind:** issue
- **Severity:** low

**Evidence:** `src/core/tailwind-types.ts:232` and `:252`

```typescript
| `has-[${string}]` | `group-has-[${string}]` | `peer-has-[${string}]` | `in-[${string}]`
…
export type TailwindBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl" | TailwindContainerBreakpoint;
```

**Explanation:** Two v4 variant families are only half-covered:

1. The `in-*` implicit-ancestor variant is admitted **only** in its arbitrary-selector form `in-[…]`, but v4's primary usage is the named form — `in-focus:opacity-100` ✅ and `in-hover:flex` ✅ both verified against 4.3.2. `.on("in-focus", …)` is a compile error while the rarer `.on("in-[.sidebar]", …)` type-checks.
2. `TailwindBreakpoint` covers `@max-*` for **container** queries (`tailwind-types.ts:247`) but not the responsive `max-*` variants — `max-sm:flex`, `max-md:mt-2` ✅ verified — so `.at("max-sm", …)` (the standard v4 way to write mobile-only styles without a desktop override) is untypeable.

**Fix:** add `` | `in-${GroupPeerState}` `` to `TailwindState` (reusing the existing `GroupPeerState` union at `tailwind-types.ts:426`, which is exactly the set of states `in-*` composes with), and `` | `max-${"sm" | "md" | "lg" | "xl" | "2xl"}` `` to `TailwindBreakpoint`.

---

## tailwind-fidelity-8: `TailwindMaxWidth`/`TailwindMinWidth` drifted from the v4 container scale

- **Kind:** issue
- **Severity:** low

**Evidence:** `src/core/tailwind-types.ts:51-57`

```typescript
export type TailwindMaxWidth =
  | "0" | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  | "full" | "min" | "max" | "fit" | "prose" | "screen-sm" | "screen-md" | "screen-lg" | "screen-xl" | "screen-2xl"
  | `[${string}]`;
…
export type TailwindMinWidth = "0" | "full" | "min" | "max" | "fit" | `[${string}]`;
```

**Explanation:** v4 rebuilt these on the `--container-*` scale and the dynamic spacing scale, and both unions miss the additions (all ✅ verified against 4.3.2):

- `max-w-3xs` / `max-w-2xs` (new v4 container steps) — missing;
- `max-w-dvw` (and the v4 viewport-unit family) — missing;
- `min-w` in v4 accepts the **full** container scale plus spacing: `min-w-xs` ✅, `min-w-sm` ✅, `min-w-4` ✅, `min-w-screen` ✅ — the union admits none of them (5 keywords + brackets), making `.minW()` nearly useless without the bracket hatch.

Note: the v3-era `"screen-sm"…"screen-2xl"` and `"prose"` members were *suspects* but are **not** defects — 4.3.2 still ships them as compat utilities (`max-w-screen-sm` → `max-width: var(--breakpoint-sm)` ✅, `max-w-prose` → `65ch` ✅). Worth a deprecation note in the JSDoc, not removal.

**Fix:** add `"3xs" | "2xs" | "dvw" | "svw" | "lvw" | "screen"` to `TailwindMaxWidth`; redefine `TailwindMinWidth` to mirror `TailwindMaxWidth`'s shape (container scale + `TailwindSpacing` + `"screen"` + `[…]`), matching what v4 actually generates.
