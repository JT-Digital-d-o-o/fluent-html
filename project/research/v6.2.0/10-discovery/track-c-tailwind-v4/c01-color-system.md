# Track C — Tailwind v4 color system: fluent method gaps

Lens scope: v4 color utilities (oklch palette, color-mix/opacity, SVG + form + text-decoration colors, gradient interpolation, color-scheme) that fluent-html's styling layer does not yet expose.

## State of the art (what's already covered)

`TailwindColor` (`src/core/tailwind-types.ts:76-85`) is **closed and complete** for the core palette concern:
- named `${TailwindColorName}-${TailwindShade}`, `inherit`/`current`/`transparent`/`black`/`white`
- opacity modifier baked in: `` `${BaseColor}/${number}` `` → `blue-500/50` (already covered — do not re-propose `bg-x/50`)
- arbitrary color via `` `[${string}]` `` → `[#1a2b3c]`, `[oklch(...)]`, `[color-mix(...)]` (already covered — arbitrary oklch/color-mix ride this arm)
- custom theme tokens via `FluentCustomColors` (`defineTheme`, shipped 6.x)

Color methods present (`tailwind-methods.ts`): `background`, `textColor`, `borderColor`, `ringColor`, `shadowColor`, `from`/`via`/`to` (gradient stops), `gradient`/`gradientRadial`/`gradientConic`. The oklch palette itself is a Tailwind-runtime concern (the `@theme` default palette is oklch in v4) — fluent emits the same class names, so **no method change is needed for oklch per se**. Gaps below are *missing color surfaces*, not palette representation.

---

## Proposal 1 — `fill(color)` / `stroke(color)` (SVG colors)

**Problem/evidence.** No `fill`/`stroke` method anywhere: `grep -iE "fill|stroke" tailwind-methods.ts` → only `TailwindObjectFit`'s `"fill"` value. Inline SVG icons (extremely common in SSR/HTMX UIs for buttons/badges) currently force `.setClass("fill-current stroke-red-500")`, defeating the type-safe layer. `fill-*`/`stroke-*` are core Tailwind utilities and accept the full color scale incl `fill-none`/`stroke-none`.

**Proposed API.**
```ts
fill(color: TailwindColor | "none"): this;    // → fill-current, fill-red-500, fill-none
stroke(color: TailwindColor | "none"): this;  // → stroke-current, stroke-blue-500/50
strokeWidth(value: 0 | 1 | 2 | `[${string}]`): this; // → stroke-2 (companion, non-color but pairs with stroke)
```
`p.fill = function (c) { return this.addClass(`fill-${c}`); }` etc.

**Before/After.**
```ts
Svg(Path(...)).setClass("fill-current stroke-2 stroke-blue-500")   // before
Svg(Path(...)).fill("current").stroke("blue-500").strokeWidth(2)   // after
```

**Already in lib?** No.
**Value:** high (icons are ubiquitous; `fill-current` is the canonical inherit-color pattern).
**Effort:** small.

---

## Proposal 2 — `accentColor(color)` / `caretColor(color)` (form-control colors)

**Problem/evidence.** No `accent-*` or `caret-*` method (grep: none). `accent-color` styles native checkboxes/radios/range/progress; `caret-color` styles the text-input caret. Both are core v4 color utilities taking the full scale. In an SSR forms-heavy stack (the project's `Form<T>` builder), styling a checkbox accent today needs `.setClass("accent-blue-600")`.

**Proposed API.**
```ts
accentColor(color: TailwindColor): this;  // → accent-blue-600, accent-current
caretColor(color: TailwindColor): this;   // → caret-pink-500
```

**Before/After.**
```ts
f.checkbox("notify").setClass("accent-blue-600")   // before
f.checkbox("notify").accentColor("blue-600")       // after
Input().caretColor("pink-500")
```

**Already in lib?** No.
**Value:** high (direct fit with the typed `Form<T>` story; native form theming).
**Effort:** small.

---

## Proposal 3 — `decorationColor(color)` (text-decoration-color)

**Problem/evidence.** `underline()`/`lineThrough()`/`underlineOffset()` exist (`tailwind-methods.ts:434-436,729`) but there is **no color for the decoration**. `decoration-*` is the core v4 utility for `text-decoration-color` and takes the full color scale (`decoration-red-500`, `decoration-current`). A styled underline (e.g. branded link underline) currently needs `.setClass("decoration-red-500")`.

**Proposed API.**
```ts
decorationColor(color: TailwindColor): this;  // → decoration-red-500, decoration-blue-500/50
```
Optional companion (non-color, completes the family): `decorationStyle("solid"|"dotted"|"dashed"|"wavy"|"double")` → `decoration-dotted`, `decorationThickness(0|1|2|4|"auto"|"from-font"|`[${string}]`)` → `decoration-2`.

**Before/After.**
```ts
A("Docs").underline().setClass("decoration-2 decoration-wavy decoration-amber-500")   // before
A("Docs").underline().decorationThickness(2).decorationStyle("wavy").decorationColor("amber-500") // after
```

**Already in lib?** No (only `underline`/`underlineOffset`).
**Value:** medium (branded link styling; rounds out the existing underline family).
**Effort:** small.

---

## Proposal 4 — gradient interpolation modifier (`oklch`/`oklab`/`srgb`/`hsl`)

**Problem/evidence.** `gradient(from,to,dir)` and `gradientTo(dir)` emit `bg-linear-<dir>` (`tailwind-methods.ts:660-665`) but there is **no way to set the v4 interpolation color space**. v4 supports a modifier on the gradient utility — `bg-linear-to-r/oklch`, `/oklab` (default), `/srgb`, `/hsl` ([Tailwind v4 docs](https://tailwindcss.com/docs/background-image)) — which dramatically affects mid-tone vibrancy for far-apart stops. Today the only escape is a raw `.setClass("bg-linear-to-r/oklch")` that *also* duplicates what `.gradient()` emits.

**Proposed API.** Optional 4th arg + a typed interpolation union; applied as a `/space` suffix on the emitted `bg-linear-*`/`bg-radial`/`bg-conic` class.
```ts
type TailwindColorInterpolation = "srgb" | "oklab" | "oklch" | "hsl" | "longer-hue" | "shorter-hue";
gradient(from: TailwindColor, to: TailwindColor, direction?: TailwindGradientDirection, interpolation?: TailwindColorInterpolation): this;
// or a chainable form that mutates the already-emitted gradient class:
gradientInterpolation(space: TailwindColorInterpolation): this; // bg-linear-to-r → bg-linear-to-r/oklch
```
Chainable form is preferred (composes with `gradientRadial()`/`gradientConic()` too): `bg-radial` → `bg-radial/oklch`.

**Before/After.**
```ts
Div().gradient("indigo-500","pink-500","to-r").setClass("bg-linear-to-r/oklch") // before (and now two bg-linear classes!)
Div().gradient("indigo-500","pink-500","to-r").gradientInterpolation("oklch")   // after
```

**Already in lib?** No (gradients shipped v4-native, but interpolation space is missing).
**Value:** medium (this is *the* headline v4 gradient feature; far-apart stops look muddy without it).
**Effort:** medium (chainable form must rewrite the existing `bg-linear-*`/`bg-radial`/`bg-conic` class rather than append a new one — needs a class-mutating helper, not plain `addClass`).

---

## Proposal 5 — `colorScheme(value)` (v4.1 `scheme-*`)

**Problem/evidence.** Tailwind v4.1 added `scheme-*` utilities for the CSS `color-scheme` property (`scheme-light`, `scheme-dark`, `scheme-light-dark`, `scheme-normal`, plus `scheme-only-*`). These make native widgets (scrollbars, form controls, `<input type=date>`) honor light/dark — important for the project's `dark:` variant usage. No method exists (grep: none). `color-scheme` is [Baseline widely available](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme); the Tailwind utility is v4.1.

**Proposed API.**
```ts
type TailwindColorSchemeUtility =
  | "normal" | "light" | "dark" | "light-dark"
  | "only-light" | "only-dark";
colorScheme(value: TailwindColorSchemeUtility): this; // → scheme-light-dark, scheme-only-dark
```

**Before/After.**
```ts
Html().setClass("scheme-light-dark")        // before
Html().colorScheme("light-dark")            // after
```

**Already in lib?** No.
**Value:** medium (native-widget dark mode; small surface, real correctness win for SSR dark themes).
**Effort:** small.

---

## Proposal 6 — `placeholderColor(color)` (placeholder text color)

**Problem/evidence.** `placeholder` exists only as a **variant** in `TailwindState` (`tailwind-types.ts:224`), usable via `.on("placeholder", t => t.textColor(...))`. But the dedicated `placeholder-*` color utility (`placeholder-gray-400`) is shorter and is the idiomatic Tailwind way; it has no method. Note: `.on("placeholder", t => t.textColor("gray-400"))` emits `placeholder:text-gray-400` which is **valid but more verbose** than `placeholder-gray-400`.

**Proposed API.**
```ts
placeholderColor(color: TailwindColor): this; // → placeholder-gray-400
```

**Before/After.**
```ts
Input().on("placeholder", t => t.textColor("gray-400"))  // before (works, verbose)
Input().placeholderColor("gray-400")                     // after
```

**Already in lib?** Partially — achievable via `.on("placeholder", …)`, so this is **convenience, not capability**. Lower signal.
**Value:** low.
**Effort:** small.

---

## Lockstep note
All new methods/types must be mirrored in `../fluent-html-tailwind-extractor` (vocab `pre()`/`custom()`/`stat()` entries — see `src/class-vocab/vocab.ts` patterns at lines 209-213 for the gradient family) and surfaced in `../fluent-html-eslint-plugin` (so `setClass("fill-current")` is flagged in favor of `.fill("current")`). Proposal 4's chainable interpolation needs a class-mutating vocab entry, not a plain prefix.

## Top picks
- **`fill`/`stroke` (+`strokeWidth`)** — high value, small effort; icons are everywhere and `setClass` is the current crutch.
- **`accentColor`/`caretColor`** — high value, small effort; direct fit with the typed `Form<T>` forms story.
- **`decorationColor` (+`decorationStyle`/`decorationThickness`)** — completes the existing underline family.
- **gradient interpolation (`oklch`/`oklab`/`srgb`/`hsl`)** — the headline v4 gradient feature, currently unreachable except by a duplicate `setClass`.
