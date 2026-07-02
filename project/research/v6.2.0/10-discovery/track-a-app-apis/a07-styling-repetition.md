# Track A — App APIs: Styling Repetition (v6.2.0 discovery)

Lens: Tailwind styling repetition across views in two real consumer apps (`planet-positive-sport`, v5; `pm-gui`, v6) — identical class chains, button/input variants, flex/spacing clusters — and what new fluent methods or composition primitives would collapse them.

Apps mined:
- `/Users/tony/jt-digital/planet-positive-sport` (fluent-html v5)
- `/Users/tony/jt-digital/pm-gui` (fluent-html v6 template)

All counts below are `grep`/`perl` measured over `*/src/**/*.ts` in both apps (June 2026).

---

## 1. `paddingXY` / two-value `padding`+`margin` overload

### Problem / evidence
`padding("x", a).padding("y", b)` is the single most repeated chain fragment in both apps. **412 of 592** `padding("x", …)` calls are immediately followed by `padding("y", …)` (perl slurp across newlines, both apps). Every button helper hand-writes it:

- `planet-positive-sport/src/shared/components/forms/buttons.ts:11-12` (`PrimaryButton`), `:31-32` (`Danger`), `:52-53` (`Secondary`) — `.padding("x", "6").padding("y", "3")` three times in one file.
- `planet-positive-sport/src/shared/components/forms/form.ts:48-49`, `:85-86` — `.padding("x", "4").padding("y", "3")` in `inputStyle` and `StyledSelect`.
- `planet-positive-sport/src/loc/assessment/assessment.components.ts:899`, `:911` — `PrimaryActionButton`/`SecondaryActionButton`.

`padding` today (`fluent-html/src/core/tailwind-methods.ts:115-117`) accepts a single value, a single direction, or `(unit, amount)` — there is **no** way to set x and y in one call. `spaceX`/`spaceY` exist as siblings (`:597-598`) but padding/margin have no axis pair.

### Proposed API
Add an axis-pair overload to `padding` and `margin`:

```ts
padding(axes: { x?: TailwindSpacing; y?: TailwindSpacing }): this;
margin(axes:  { x?: TailwindSpacing; y?: TailwindSpacing }): this;
```

Emits the same `px-*`/`py-*` (resp. `mx-*`/`my-*`) classes the extractor already understands — `.padding({ x: "6", y: "3" })` → `px-6 py-3`. Statically resolvable (literal keys), no vocab change beyond the existing `px-`/`py-` entries.

### Before / After
```ts
// before  (buttons.ts:11-13)
Button(label).background("primary").textColor("white")
  .padding("x", "6").padding("y", "3").rounded("lg")

// after
Button(label).background("primary").textColor("white")
  .padding({ x: "6", y: "3" }).rounded("lg")
```

### Already in lib?
No. `padding` has value / single-direction / `(unit, amount)` overloads only; no axis-object form. Not in CHANGELOG 6.0.0→6.1.1.

### Value: high  ·  Effort: small
One overload + emitter branch on `padding`/`margin`; 400+ call sites simplified.

---

## 2. `size(value)` — collapse `w(n).h(n)` to Tailwind v4 `size-*`

### Problem / evidence
Equal width+height (`w("N").h("N")`) appears **54 times** in `planet-positive-sport` alone (perl back-reference match). Top values: `size-5`/`size-4`/`size-7`/`size-2` — overwhelmingly icon/avatar boxes:
- `planet-positive-sport/src/shared/components/forms/buttons.ts:67` — `Span(icon).w("5").h("5")` in `IconButton`.
- `planet-positive-sport/src/shared/components/forms/form.ts:106`, `:131` — `Input().w("4").h("4")` in `Checkbox`/`RadioButton`.

Tailwind v4 has a first-class `size-*` utility (`size-4` ⇒ `width:1rem;height:1rem`; stable since TW 3.4, well past Baseline). fluent-html has no `size()` method (`tailwind-methods.ts` has `resize` but not `size`).

### Proposed API
```ts
size(value: TailwindWidth): this;      // closed union, mirrors w()/h()
size(unit: TailwindUnit, amount: number): this;   // size("px", 18) → size-[18px]
```
Emits `size-<value>` (and `size-[…]` for the unit/bracket arm). Register in class-vocab so extractor + eslint stay in lockstep; add a `prefer-size` autofix that rewrites adjacent `w(n).h(n)` → `size(n)` (same family as `prefer-unit-overload`).

### Before / After
```ts
// before  (buttons.ts:67)
Button(Span(icon).w("5").h("5").display("block"))
// after
Button(Span(icon).size("5").display("block"))
```

### Already in lib?
No. No `size` method in source; `size-*` not mentioned in CHANGELOG. (The closed sizing unions shipped in 6.1.1 are for `w/h/min*/max*` only.)

### Value: high  ·  Effort: small

---

## 3. Flex cluster shortcuts: `.row()` / `.col()` / axis-aligned flex

### Problem / evidence
`flex().…alignItems("center")` is the most repeated layout pattern in the codebase: **325 occurrences** of `flex()` chained into `alignItems("center")` in `planet-positive-sport`, plus **40** in `pm-gui`. The dominant exact shapes:
- `flex().alignItems("center").gap("2")` — 64×, `.gap("3")` — 42×, `.gap("1.5")` — 37× (PPS).
- `alignItems("center").justifyContent("between")` — 37× (toolbar rows).
- `alignItems("center").justifyContent("center")` — 45× (centered boxes).

`Label` wrappers repeat the exact `.display("inline-flex").alignItems("center").gap("2").cursor("pointer")` cluster verbatim in three components (`form.ts:114-117` Checkbox, `:138-141` RadioButton, and the Toggle below them). Today this needs `display("flex").alignItems(...).justifyContent(...)` — 3 chained calls for the commonest layout primitive.

### Proposed API
Direction + axis shortcuts that compose the flex container in one call:

```ts
row(opts?: { align?: TailwindAlignItems; justify?: TailwindJustifyContent; gap?: TailwindSpacing; inline?: boolean }): this;
col(opts?: { align?: TailwindAlignItems; justify?: TailwindJustifyContent; gap?: TailwindSpacing; inline?: boolean }): this;
```
`row()` ⇒ `flex` (+ `flex-row` implicit); `col()` ⇒ `flex flex-col`. Options emit `items-*`, `justify-*`, `gap-*`, and `inline-flex` when `inline`. All tokens are existing closed unions → fully extractor-resolvable. Bare `.row()` is just `flex`.

### Before / After
```ts
// before  (form.ts:114-117, repeated 3×)
Label(input, Span(label)…).display("inline-flex").alignItems("center").gap("2").cursor("pointer")
// after
Label(input, Span(label)…).row({ align: "center", gap: "2", inline: true }).cursor("pointer")

// before  (toolbar, ×37)
Div(…).flex().alignItems("center").justifyContent("between")
// after
Div(…).row({ align: "center", justify: "between" })
```

### Already in lib?
No. `flex()`, `inlineFlex()`, `alignItems()`, `justifyContent()` exist as atoms (`tailwind-methods.ts:160,207,481-482`) but there is no direction/axis cluster shortcut. Not in CHANGELOG. (This is a *convergent ergonomic shortcut*, not a new opinionated component — consistent with the "ship primitives" memory.)

### Value: high  ·  Effort: medium

---

## 4. `stylers()` map helper — promote app-local pattern into the lib

### Problem / evidence
`pm-gui` hand-rolled a generic helper in `pm-gui/src/shared/stylers.ts` because the pattern was missing from the lib. Its own JSDoc states the motivation: build a typed key→Styler map "without the per-value `<T extends Tag>(t: T) => T` boilerplate … Prefer this over `.addClass(MatchValue(...))` / `.addClass(record[var])`: the fluent methods are typed AND statically visible to the Tailwind extractor." It is consumed **41×** via `.apply(...)`/`stylers<…>` in `pm-gui/src`. The exact source:

```ts
export type Styler = <T extends Tag>(t: T) => T;
export const stylers = <K extends string | number>(
  map: Record<K, (t: Tag) => Tag>,
): Record<K, Styler> => map as Record<K, Styler>;
```

This is the canonical, extractor-safe way to do tone/variant→style mapping (badge tones, status colors). Every consuming app re-invents it.

### Proposed API
Ship `Styler` type + `stylers()` from the barrel:

```ts
export type Styler = <T extends Tag>(t: T) => T;
export function stylers<K extends string | number>(map: Record<K, Styler>): Record<K, Styler>;
```
Pure type/identity helper — zero runtime, no emitter. Pairs with the 6.1.1 change that made `apply`/`when`/`whenElse` accept base-`Tag` modifiers on subclasses.

### Before / After
```ts
// before — app copies stylers.ts into every project
import { stylers } from "../shared/stylers";
// after
import { stylers, type Styler } from "fluent-html";
const tone = stylers<"ok" | "warn">({
  ok:   (t) => t.background("green-100").textColor("green-700"),
  warn: (t) => t.background("amber-100").textColor("amber-700"),
});
Span("x").apply(tone[level]);
```

### Already in lib?
No. The lib exposes `apply`/`when` but not the typed-map builder; the app file exists *because* it's absent. Not in CHANGELOG.

### Value: medium  ·  Effort: small

---

## 5. `.focusRing()` and `.disabledStyle()` interaction-state mixins

### Problem / evidence
The focus-ring block `ring("2").ringColor(…).outline("none")` is copy-pasted **32×**; `on("focus", …)` appears **53×** total across both apps. The disabled block `opacity("50").cursor("not-allowed")` (usually with `.toggle("disabled")`) repeats across **all six** button helpers in `buttons.ts` (`:18, :39, :59, :75, :110`) and elsewhere. In `buttons.ts` every single button ends with the identical two lines:

```ts
.on("focus", t => t.ring("2").ringColor("primary/50").outline("none"))
.when(disabled, t => t.opacity("50").cursor("not-allowed").toggle("disabled"));
```

### Proposed API
Two small composable mixins (shipped as exported `Styler`s, usable via `.apply()`):

```ts
focusRing(opts?: { width?: TailwindRingWidth; color?: TailwindColor }): this;  // → focus:outline-none focus:ring-2 focus:ring-<color>
disabledStyle(): this;   // → disabled:opacity-50 disabled:cursor-not-allowed
```
Both emit `focus:`/`disabled:` variant classes directly (so they work without a `.when()` boolean — the native `:disabled` variant fires off the real attribute), all extractor-resolvable.

### Before / After
```ts
// before  (buttons.ts:17-18)
.on("focus", t => t.ring("2").ringColor("primary/50").outline("none"))
.when(disabled, t => t.opacity("50").cursor("not-allowed").toggle("disabled"));
// after
.focusRing({ color: "primary/50" })
.disabledStyle().when(disabled, t => t.toggle("disabled"));
```

### Already in lib?
No method-level helper exists; `ring`/`ringColor`/`outline`/`opacity`/`cursor` are atoms and `.on("focus", …)` is the only path today. Not in CHANGELOG. (Lower confidence than 1-3: this edges toward opinionated defaults — recommend the *unstyled-token* form, e.g. `focusRing` takes explicit color, so it stays a primitive.)

### Value: medium  ·  Effort: small

---

## Top picks
- **#1 `padding`/`margin` axis-pair overload** — 412 collapsible call sites, smallest possible change, zero opinion.
- **#2 `size(value)`** — maps directly onto Tailwind's native `size-*`; 54 sites; trivial + eslint autofix.
- **#3 `.row()` / `.col()` flex cluster shortcuts** — the 325× `flex().alignItems("center")` pattern is the biggest single repetition in the corpus.
- **#4 ship `stylers()`** — the app literally hand-rolled it (`pm-gui/src/shared/stylers.ts`) and uses it 41×; near-zero cost to upstream.
