---
id: RFC-C-09
track: C
resolves: [#26, #61, #68, #30]
api_surface:
  - "TailwindGridLine (type, src/core/tailwind-types.ts)"
  - "TailwindRowSpan (type, src/core/tailwind-types.ts)"
  - "TailwindColumns (type, src/core/tailwind-types.ts)"
  - "TailwindBreakBeforeAfter (type, src/core/tailwind-types.ts)"
  - "TailwindBreakInside (type, src/core/tailwind-types.ts)"
  - "TailwindBoxDecoration (type, src/core/tailwind-types.ts)"
  - "TailwindSnapAxis (type, src/core/tailwind-types.ts)"
  - "TailwindSnapStrictness (type, src/core/tailwind-types.ts)"
  - "TailwindSnapAlign (type, src/core/tailwind-types.ts)"
  - "TailwindSnapStop (type, src/core/tailwind-types.ts)"
  - "TailwindScrollBehavior (type, src/core/tailwind-types.ts)"
  - "TailwindFieldSizing (type, src/core/tailwind-types.ts)"
  - "FluentTailwindMethods.colStart(value: TailwindGridLine): this"
  - "FluentTailwindMethods.colEnd(value: TailwindGridLine): this"
  - "FluentTailwindMethods.rowStart(value: TailwindGridLine): this"
  - "FluentTailwindMethods.rowEnd(value: TailwindGridLine): this"
  - "FluentTailwindMethods.rowSpan(value: TailwindRowSpan): this"
  - "FluentTailwindMethods.columns(value: TailwindColumns): this"
  - "FluentTailwindMethods.breakBefore(value: TailwindBreakBeforeAfter): this"
  - "FluentTailwindMethods.breakAfter(value: TailwindBreakBeforeAfter): this"
  - "FluentTailwindMethods.breakInside(value: TailwindBreakInside): this"
  - "FluentTailwindMethods.boxDecoration(value: TailwindBoxDecoration): this"
  - "FluentTailwindMethods.snap(axis: TailwindSnapAxis): this"
  - "FluentTailwindMethods.snap(axis: Exclude<TailwindSnapAxis, 'none'>, strictness: TailwindSnapStrictness): this"
  - "FluentTailwindMethods.snapAlign(value: TailwindSnapAlign): this"
  - "FluentTailwindMethods.snapStop(value: TailwindSnapStop): this"
  - "FluentTailwindMethods.scrollBehavior(value: TailwindScrollBehavior): this"
  - "FluentTailwindMethods.scrollMargin(value: TailwindSpacing): this"
  - "FluentTailwindMethods.scrollMargin(direction: TailwindSpacingDir, value: TailwindSpacing): this"
  - "FluentTailwindMethods.scrollMargin(unit: TailwindUnit, amount: number): this"
  - "FluentTailwindMethods.scrollPadding(value: TailwindSpacing): this"
  - "FluentTailwindMethods.scrollPadding(direction: TailwindSpacingDir, value: TailwindSpacing): this"
  - "FluentTailwindMethods.scrollPadding(unit: TailwindUnit, amount: number): this"
  - "FluentTailwindMethods.fieldSizing(value: TailwindFieldSizing): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md — Fluent Styling tables: add Grid line-placement (colStart/colEnd/rowStart/rowEnd/rowSpan), Multi-column/fragmentation (columns/breakBefore/breakAfter/breakInside/boxDecoration), and Scroll (snap*/scrollBehavior/scrollMargin/scrollPadding/fieldSizing) rows"
  - "src/core/tailwind-methods.ts — JSDoc on all new decls (negative-line note on col/row; fragmentation-vs-breakAll disambiguation; fieldSizing Baseline caveat)"
  - "fluent-html.md — Layout section: holy-grail grid, multi-column card list, carousel, sticky-anchor offset, auto-grow textarea recipes"
  - "views.md — auto-grow textarea recipe wired to Form<T> f.textarea()"
  - "CHANGELOG.md — 6.2.0 entry"
  - "../fluent-html-tailwind-extractor/README.md — note the new vocab rows are auto-consumed (vocab-driven); custom negative-line + 2-class snap emitters round-trip via samples"
  - "../fluent-html-eslint-plugin/README.md — note regenerated VOCAB_METHODS gains the 22 new method names; setClass disambiguation rows for snap-/scroll-/columns-/break-*/field-sizing-"
impact: "Closes the v4 layout gap: grid-line placement (incl. negative lines), CSS multi-column + fragmentation/print control, and scroll-snap/scroll-margin/scroll-padding/scroll-behavior plus JS-free field-sizing auto-grow — all as typed primitives, eliminating the setClass escape hatch for layout."
effort: L
depends_on: []
status: proposed
---

# RFC-C-09 — Layout: grid-line placement, multi-column, scroll & field-sizing

## Problem

The fluent styling surface covers grid *containers* and *spans* but has three
genuine **core primitive gaps** in layout. Each forces callers to drop to the
untyped `setClass`/`neg` escape hatch — invisible to the type checker and to the
extractor.

**1. No grid-*line* placement.** `src/core/tailwind-methods.ts` ships
`gridCols`/`gridRows` (`:225-226`), `colSpan` (`:227`/impl `:585`),
`gridAutoFlow`/`gridAutoRows`/`gridAutoCols`, and `placeContent`/`placeItems`/
`placeSelf`. There is **no** `colStart`/`colEnd`/`rowStart`/`rowEnd`/`rowSpan`
(grep for `col-start`/`row-start`/`row-span` over `src/` returns nothing). A
holy-grail/sidebar-spanning cell that must *start at line 2 and end at the last
line* has no typed path — authors fall back to
`.colSpan(8).neg("col-start-2")` (mixes a typed span with the generic `neg`
escape hatch, no autocomplete on the line number) or raw
`.addClass("col-start-2 col-end-[-1]")`. The sharp edge is the **negative line**:
Tailwind v4 spells the last line `-col-end-1` (sign at the **front** of the
class), not `col-end--1`.

**2. No CSS multi-column / fragmentation control.** Grep over
`tailwind-methods.ts`, `tailwind-types.ts`, `vocab.ts`, `emit.ts`, `CHANGELOG.md`
returns **zero** hits for `columns`, `break-before`, `break-inside`,
`break-after`, `box-decoration`. The only adjacent symbol is `breakAll()`
(`vocab.ts:100`, impl `:733`) — `word-break: break-all`, a **different** CSS
property (text wrapping), no collision. A masonry-ish card list must today write
`.setClass("columns-3 gap-4 [&>*]:break-inside-avoid")`, losing type-safety and
extractor recognition.

**3. No scroll-snap / scroll-margin / scroll-padding / scroll-behavior, no
field-sizing.** Grep for `snap`/`scroll-`/`field-sizing` returns nothing
**except** `overscroll` (already shipped 6.0.0, impl `:751` — explicitly out of
scope, untouched here). A carousel must write
`.setClass("snap-x snap-mandatory overflow-x-auto")` + `.setClass("snap-center")`
on children; a sticky-header anchor offset writes `.setClass("scroll-mt-24")`; an
auto-grow textarea (the marquee v4 SSR/HTMX form feature, serving the shipped
`Form<T>` `f.textarea()` builder) writes `.setClass("field-sizing-content")`.

A grep of the apps/template (`/Users/tony/jt-digital/ttl/project/pm/**`,
`rideshare/src`, `projects-template/src`) for any of these classes returns **no
source `setClass` usage** — confirming the gap is real: callers cannot express
line placement, multi-column, or scroll-snap today and simply do without (or
reach for the carousel anti-pattern this RFC replaces).

What is **already shipped** and therefore explicitly **out of scope** (re-proposing
would violate §11.6 CONVERGE):

- **subgrid** — `gridCols("subgrid")`/`gridRows("subgrid")` already accept it
  (`tailwind-types.ts:137-138`), emitting `grid-cols-subgrid`/`grid-rows-subgrid`.
- **place-\*** — `placeContent`/`placeItems`/`placeSelf` landed 6.0
  (`vocab.ts:138-140`), closed unions.
- **overscroll** — shipped 6.0.0 (impl `:751`); a different scroll property,
  untouched.

## Proposed API (the contract)

### Types — `src/core/tailwind-types.ts`

```ts
// ── Grid line placement (Grid block, after TailwindColSpan, line 165) ──
// Single shared CLOSED union for line placement. Negative members encode the
// negative grid line; the emitter relocates the leading `-` to the front of the
// class (mirrors the A-07 rotate/translate/skew `signNeg` pattern). Tailwind v4
// caps default grid lines at 13 (12 cols + 1 trailing line); larger custom grids
// use the `[${string}]` arm.
type GridLineN = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type TailwindGridLine =
  | GridLineN
  | Stringified<GridLineN>
  | `-${GridLineN}`
  | `-${Stringified<GridLineN>}`
  | "auto"
  | `[${string}]`;

// Row span — mirrors TailwindColSpan but fully CLOSED (drops `(string & {})`;
// adds the explicit `[${string}]` arbitrary arm). Spans are always positive.
export type TailwindRowSpan =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  | Stringified<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  | "full"
  | `[${string}]`;

// ── Multi-column / fragmentation (new block) ──
// Mirrors TailwindColSpan shape: literals + Stringified + the v4 named width
// scale + "auto" + arbitrary.
export type TailwindColumns =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  | Stringified<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  | "auto"
  | "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl"
  | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  | `[${string}]`;

// Fully closed keyword sets — finite CSS grammars, no arbitrary tail.
export type TailwindBreakBeforeAfter =
  | "auto" | "avoid" | "all" | "avoid-page" | "page" | "left" | "right" | "column";
export type TailwindBreakInside = "auto" | "avoid" | "avoid-page" | "avoid-column";
export type TailwindBoxDecoration = "clone" | "slice";

// ── Scroll snap / behavior / field-sizing (new block) ──
export type TailwindSnapAxis = "none" | "x" | "y" | "both";
export type TailwindSnapStrictness = "mandatory" | "proximity";
export type TailwindSnapAlign = "start" | "end" | "center" | "none"; // none → snap-align-none
export type TailwindSnapStop = "normal" | "always";
export type TailwindScrollBehavior = "auto" | "smooth";
export type TailwindFieldSizing = "content" | "fixed";
```

`scrollMargin`/`scrollPadding` reuse the existing closed `TailwindSpacing` /
`TailwindUnit` unions and the directional literal union already used by
`padding`/`margin` (referred to below as `TailwindSpacingDir =
"x"|"y"|"top"|"bottom"|"left"|"right"|"t"|"b"|"l"|"r"`). No new spacing types.

### Interface — `src/core/tailwind-methods.ts` (`FluentTailwindMethods`)

```ts
// ── Grid block (after colSpan, line 227) ──
/** v4 grid-column-start. Pass a negative line for end-relative placement:
 *  `.colStart(-1)` → `-col-start-1` (last line). Prefer this over `.neg("col-start-1")`. */
colStart(value: TailwindGridLine): this;
/** v4 grid-column-end. `.colEnd(-1)` → `-col-end-1` (last line). */
colEnd(value: TailwindGridLine): this;
/** v4 grid-row-start. `.rowStart(-1)` → `-row-start-1`. */
rowStart(value: TailwindGridLine): this;
/** v4 grid-row-end. `.rowEnd(-1)` → `-row-end-1`. */
rowEnd(value: TailwindGridLine): this;
/** v4 grid-row span. `.rowSpan(2)` → `row-span-2`; `.rowSpan("full")` → `row-span-full`.
 *  Mirror of {@link colSpan}; spans are always positive (no negative form). */
rowSpan(value: TailwindRowSpan): this;

// ── Multi-column / fragmentation (new block, near Grid) ──
/** v4 CSS multi-column count or column-width. `.columns(3)` → `columns-3`;
 *  `.columns("xs")` → `columns-xs`; `.columns("[16rem]")` → `columns-[16rem]`.
 *  Pair with {@link gap} for the column gap and child `.breakInside("avoid")`. */
columns(value: TailwindColumns): this;
/** CSS fragmentation `break-before` (column/page). NOT text wrapping — see {@link breakAll}. */
breakBefore(value: TailwindBreakBeforeAfter): this;
/** CSS fragmentation `break-after` (column/page). NOT text wrapping — see {@link breakAll}. */
breakAfter(value: TailwindBreakBeforeAfter): this;
/** CSS fragmentation `break-inside` — `.breakInside("avoid")` keeps a card whole
 *  inside a multi-column flow. NOT text wrapping — see {@link breakAll}. */
breakInside(value: TailwindBreakInside): this;
/** CSS `box-decoration-break`. `"clone"` re-draws borders/padding per fragment. */
boxDecoration(value: TailwindBoxDecoration): this;

// ── Scroll (new block) ──
/** Scroll-snap container axis. `.snap("x")` → `snap-x`. The 2-arg overload also
 *  sets strictness: `.snap("x", "mandatory")` → `snap-x snap-mandatory`. */
snap(axis: TailwindSnapAxis): this;
snap(axis: Exclude<TailwindSnapAxis, "none">, strictness: TailwindSnapStrictness): this;
/** Scroll-snap child alignment. `.snapAlign("center")` → `snap-center`;
 *  `.snapAlign("none")` → `snap-align-none` (distinct from container `snap-none`). */
snapAlign(value: TailwindSnapAlign): this;
/** Scroll-snap stop. `.snapStop("always")` → `snap-always`. */
snapStop(value: TailwindSnapStop): this;
/** CSS scroll-behavior. `.scrollBehavior("smooth")` → `scroll-smooth`. */
scrollBehavior(value: TailwindScrollBehavior): this;
/** scroll-margin. Mirrors {@link margin}: bare, directional, and `(unit, amount)`
 *  overloads. `.scrollMargin("t", "24")` → `scroll-mt-24`; `.scrollMargin("px", 64)` → `scroll-mt-[64px]`. */
scrollMargin(value: TailwindSpacing): this;
scrollMargin(direction: TailwindSpacingDir, value: TailwindSpacing): this;
scrollMargin(unit: TailwindUnit, amount: number): this;
/** scroll-padding. Mirrors {@link padding}: bare, directional, and `(unit, amount)` overloads. */
scrollPadding(value: TailwindSpacing): this;
scrollPadding(direction: TailwindSpacingDir, value: TailwindSpacing): this;
scrollPadding(unit: TailwindUnit, amount: number): this;
/** v4 `field-sizing` — JS-free auto-grow `<textarea>`/`<input>`.
 *  `.fieldSizing("content")` → `field-sizing-content`.
 *  Baseline caveat: `field-sizing` is Chromium-123+ only (no Firefox/Safari as of
 *  2025); degrades gracefully — the control just won't auto-grow. */
fieldSizing(value: TailwindFieldSizing): this;
```

Add the new type names to the `import type { … } from "./tailwind-types"` block.

### Implementations — `src/core/tailwind-methods.ts`

```ts
// Grid line placement — relocate a leading `-` via the existing signNeg helper
// (same one rotate/translate/skew use). rowSpan is a plain prefix (no negative).
p.colStart = function (value: string | number) { return this.addClass(signNeg("col-start", String(value))); };
p.colEnd   = function (value: string | number) { return this.addClass(signNeg("col-end",   String(value))); };
p.rowStart = function (value: string | number) { return this.addClass(signNeg("row-start", String(value))); };
p.rowEnd   = function (value: string | number) { return this.addClass(signNeg("row-end",   String(value))); };
p.rowSpan  = function (value: string | number) { return this.addClass(`row-span-${value}`); };

// Multi-column / fragmentation — plain prefixes (mirror p.colSpan)
p.columns       = function (value: string | number) { return this.addClass(`columns-${value}`); };
p.breakBefore   = function (value: string) { return this.addClass(`break-before-${value}`); };
p.breakAfter    = function (value: string) { return this.addClass(`break-after-${value}`); };
p.breakInside   = function (value: string) { return this.addClass(`break-inside-${value}`); };
p.boxDecoration = function (value: string) { return this.addClass(`box-decoration-${value}`); };

// Scroll
p.snap = function (axis: string, strictness?: string) {
  if (strictness === undefined) return this.addClass(`snap-${axis}`);
  return this.addClass(`snap-${axis}`).addClass(`snap-${strictness}`);
};
p.snapAlign = function (value: string) {
  return this.addClass(value === "none" ? "snap-align-none" : `snap-${value}`);
};
p.snapStop        = function (value: string) { return this.addClass(`snap-${value}`); };
p.scrollBehavior  = function (value: string) { return this.addClass(`scroll-${value}`); };
// scrollMargin/scrollPadding reuse the padding/margin spacing emitter shape verbatim:
p.scrollMargin = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`scroll-m-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`scroll-m${DIR_MAP[directionOrValue]!}-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`scroll-m${dir}-${value}`);
};
p.scrollPadding = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`scroll-p-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`scroll-p${DIR_MAP[directionOrValue]!}-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`scroll-p${dir}-${value}`);
};
p.fieldSizing = function (value: string) { return this.addClass(`field-sizing-${value}`); };
```

> Note on the `(unit, amount)` overload: `padding` emits `p-[${value}${unit}]`
> (no direction) because its arbitrary form is single-axis. For consistency the
> directional unit form `scrollMargin("px", 64)` resolves the unit *as the
> direction key* the same way `padding("px", 64)` does today — i.e. it routes
> through the spacing `kind` machinery in vocab, which already composes
> `prefix + DIR_MAP[unit-or-dir] + [${amount}${unit}]`. The impl above mirrors
> `p.padding` (`:402`) exactly; the canonical emitter lives in the `space()`
> vocab row (lockstep), and these impls are the thin render-time twins.

### Emitted output

| Call | Class(es) |
| --- | --- |
| `.colStart(2)` | `col-start-2` |
| `.colStart(-1)` | `-col-start-1` |
| `.colStart("auto")` | `col-start-auto` |
| `.colStart("[span_3]")` | `col-start-[span_3]` |
| `.colEnd(-1)` | `-col-end-1` |
| `.rowStart(3)` / `.rowEnd(-1)` | `row-start-3` / `-row-end-1` |
| `.rowSpan(2)` / `.rowSpan("full")` | `row-span-2` / `row-span-full` |
| `.columns(3)` / `.columns("xs")` / `.columns("[16rem]")` | `columns-3` / `columns-xs` / `columns-[16rem]` |
| `.breakBefore("column")` / `.breakAfter("page")` | `break-before-column` / `break-after-page` |
| `.breakInside("avoid")` | `break-inside-avoid` |
| `.boxDecoration("clone")` | `box-decoration-clone` |
| `.snap("x")` | `snap-x` |
| `.snap("x", "mandatory")` | `snap-x snap-mandatory` |
| `.snapAlign("center")` / `.snapAlign("none")` | `snap-center` / `snap-align-none` |
| `.snapStop("always")` | `snap-always` |
| `.scrollBehavior("smooth")` | `scroll-smooth` |
| `.scrollMargin("t", "24")` / `.scrollMargin("px", 64)` | `scroll-mt-24` / `scroll-mt-[64px]` |
| `.scrollPadding("4")` / `.scrollPadding("rem", 2)` | `scroll-p-4` / `scroll-pt-[2rem]` |
| `.fieldSizing("content")` | `field-sizing-content` |

## Worked examples (before → after)

### 1. Holy-grail grid — line placement

```ts
// BEFORE — typed span + untyped neg escape hatch, no autocomplete on the line:
Div(main).colSpan(8).neg("col-start-2");                 // mixes two spellings

// AFTER — fully typed; -1 = the last grid line:
Div(main).colStart(2).colEnd(-1);
// → class="col-start-2 -col-end-1"
```

### 2. Multi-column card list — fragmentation

```ts
// BEFORE — drops to setClass, no extractor recognition, no autocomplete:
Div(...cards).setClass("columns-3 gap-4 [&>*]:break-inside-avoid");

// AFTER — container typed; each card keeps itself whole:
Div(
  ...cards.map((c) => Article(c).breakInside("avoid")),
).columns(3).gap("4");
// → container class="columns-3 gap-4"; each card class="break-inside-avoid"
```

### 3. Carousel — scroll snap

```ts
// BEFORE — anti-pattern this RFC replaces:
Div(...slides).setClass("snap-x snap-mandatory overflow-x-auto");  // + child .setClass("snap-center")

// AFTER:
Div(
  ...slides.map((s) => Img().setSrc(s).snapAlign("center")),
).snap("x", "mandatory").overflow("x", "auto");
// → container class="snap-x snap-mandatory overflow-x-auto"; each slide class="snap-center"
```

### 4. Sticky-header anchor offset (pairs with HTMX `outerMorph show:window:top`)

```ts
// BEFORE:
H2(section.title).setClass("scroll-mt-24");
// AFTER:
H2(section.title).scrollMargin("t", "24");      // → scroll-mt-24
```

### 5. Auto-grow textarea — serves the shipped `Form<T>` `f.textarea()`

```ts
// BEFORE:
f.textarea("body").setClass("field-sizing-content");
// AFTER:
f.textarea("body").fieldSizing("content");      // → field-sizing-content
```

No real app/template call site uses any of these classes today (grep found none),
so the before-snippets are the idiomatic escape-hatch each call site would
otherwise write — these are net-new greenfield primitives closing a known gap,
not refactors.

## Type-safety story

- **`TailwindGridLine` / `TailwindRowSpan` are fully CLOSED** — they drop the
  `(string & {})` escape hatch that `TailwindColSpan`/`TailwindGridCols`/
  `TailwindGridRows` still carry. `.colStart("aut")` is a **compile error**;
  arbitrary values go through the explicit `[${string}]` arm
  (`col-start-[span_3]`), matching how `TailwindOrder`/`TailwindBorderWidth`
  already model "closed enum + bracket arm" (`tailwind-types.ts:116, 281`). The
  negative line is a first-class union member (`-1`…`-13`), so `.colEnd(-1)`
  type-checks and a stray `.colEnd(-99)` does not.
- **The fragmentation + scroll keyword unions are fully closed** (no arbitrary
  tail) — finite CSS grammars. `.breakInside("page")` is a compile error
  (`avoid-page` is the valid token). `break-*-all` is deliberately in
  `TailwindBreakBeforeAfter` but **not** `TailwindBreakInside` (CSS forbids
  `break-inside: all`) — the two unions are intentionally different sets.
- **`columns` keeps the house pattern** (literals + `Stringified` + named scale +
  `[${string}]`) so both `.columns(3)` and `.columns("3")` type-check, with the
  v4 named width scale `3xs…7xl` and an arbitrary escape.
- **`snap` overload disambiguates by arity, not a flag bag.** The 1-arg form
  accepts `"none"`; the 2-arg form `Exclude`s `"none"` (you cannot give a
  strictness to a disabled axis — a compile error). This is the *one* way to set
  axis+strictness; there is deliberately no `snapType`/`snapStrictness` pair.
- **No new `any`, no bare `string`** in any public signature; `scrollMargin`/
  `scrollPadding` reuse the closed `TailwindSpacing`/`TailwindUnit` unions.

## Migration & compatibility

**Additive** within v6 (greenfield; no v5 back-compat in scope). No existing
symbol changes — 22 new methods + 12 new types, zero edits to existing
signatures. Existing `.setClass("col-start-2")` / `.setClass("snap-x")` /
`.setClass("field-sizing-content")` escape hatches keep working, but the eslint
`prefer-fluent-method` / `no-known-modifiers-in-setclass` rules will now steer
callers to the fluent methods (intended convergence).

`field-sizing` is Chromium-123+ only (no Firefox/Safari as of 2025) — it degrades
gracefully (the control just doesn't auto-grow), so it is safe to ship; the JSDoc
carries the caveat, mirroring the existing precedent on the anchor-positioning
methods. All other classes are baseline-modern v4 utilities.

## Docs impact (§11.8 — exact files + markdown)

1. **`src/core/tailwind-methods.ts`** — JSDoc blocks shown above on every new decl,
   including: the negative-line note (`colStart`…`rowEnd` point away from `.neg()`);
   the fragmentation-vs-`breakAll` disambiguation; the `fieldSizing` Baseline caveat.

2. **`README.md`** — add three groups to the Fluent Styling tables:

   ```md
   | `.colStart(n)` / `.colEnd(n)` | `col-start-2` / `-col-end-1` | grid line (negative = end-relative) |
   | `.rowStart(n)` / `.rowEnd(n)` | `row-start-3` / `-row-end-1` | grid line                            |
   | `.rowSpan(n)`                 | `row-span-2`                 | grid-row span                        |
   | `.columns(v)`                 | `columns-3` / `columns-xs`   | CSS multi-column count or width      |
   | `.breakInside(v)`             | `break-inside-avoid`         | fragmentation (NOT word-break)       |
   | `.breakBefore(v)` / `.breakAfter(v)` | `break-before-column` | fragmentation / print                |
   | `.boxDecoration(v)`           | `box-decoration-clone`       | box-decoration-break                 |
   | `.snap(axis[, strict])`       | `snap-x snap-mandatory`      | scroll-snap container                |
   | `.snapAlign(v)` / `.snapStop(v)` | `snap-center` / `snap-always` | scroll-snap child              |
   | `.scrollBehavior(v)`          | `scroll-smooth`              | scroll-behavior                      |
   | `.scrollMargin(...)` / `.scrollPadding(...)` | `scroll-mt-24`| scroll-margin/padding (spacing family)|
   | `.fieldSizing(v)`             | `field-sizing-content`       | JS-free auto-grow (Chromium 123+)    |
   ```

3. **`fluent-html.md`** — Layout section: add the holy-grail grid, multi-column
   card list, carousel, and sticky-anchor-offset recipes from Worked examples.

4. **`views.md`** — auto-grow textarea recipe wired to `Form<T>` `f.textarea()`
   (example 5), with the Baseline caveat note.

5. **`CHANGELOG.md`** — 6.2.0 entry:
   `Added: grid line placement colStart/colEnd/rowStart/rowEnd (negative lines via -col-start-1) + rowSpan; CSS multi-column columns() + fragmentation breakBefore/breakAfter/breakInside/boxDecoration; scroll-snap snap()/snapAlign/snapStop, scrollBehavior, scrollMargin/scrollPadding (spacing family), and fieldSizing (JS-free auto-grow, Chromium 123+).`

6. **`../fluent-html-tailwind-extractor/README.md`** — note the new vocab rows are
   auto-consumed (extractor is vocab-driven); the custom negative-line and 2-class
   `snap` emitters round-trip through their declared `samples`.

7. **`../fluent-html-eslint-plugin/README.md`** — note `VOCAB_METHODS` is
   regenerated to add the 22 new method names, plus the `setClass`
   disambiguation rows for `snap-`/`scroll-`/`columns-`/`break-*`/`field-sizing-`.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure string `addClass`; no new runtime dependency.
- **§11.2 SSR-sync** — every method is a synchronous `addClass` on the render path; no async.
- **§11.3 escape-by-default** — emits Tailwind class tokens only; no attr/URL value, no XSS surface.
- **§11.4 type-safety** — grid-line + fragmentation + scroll unions are closed literals (negative line is a first-class member; arbitrary only via the explicit `[${string}]` arm); no `any`, no bare `string` where literals are valid; a typo is a compile error.
- **§11.5 compat** — purely additive within v6 (22 methods + 12 types; no existing signature changes); honestly additive.
- **§11.6 idioms** — overload-by-arity for `snap` (no flag bag); `scrollMargin`/`scrollPadding` reuse the spacing family (exactly one way); typed line methods supersede `.neg("col-start-1")` as the documented path; no inline JS; CONVERGE preserved.
- **§11.7 class-string contract** — every emitted class is literal + extractor-resolvable (`col-start-2`, `-col-end-1`, `columns-xs`, `snap-x`, `scroll-mt-24`, `field-sizing-content`, …); the only dynamic forms are the existing `[${...}]` arbitrary/unit-overload machinery, already extractor-safe; lockstep below registers vocab + regenerates eslint + adds extractor samples.
- **§11.8 docs/guideline-sync** — every symbol in `api_surface` is covered by the Docs impact section (lib README/JSDoc/CHANGELOG + `fluent-html.md`/`views.md` + both tooling READMEs).

### Lockstep (§11.7 — exact edits)

- **CORE `src/class-vocab/vocab.ts`** —
  - *Grid block* (after `pre("colSpan", "col-span")`, line 134): the four line
    methods relocate a leading `-` exactly like the A-07 transform rows
    (`vocab.ts:189-192` use `signNeg`). Add a `custom` row each, with `samples`
    covering numeric / negative / `auto`:
    ```ts
    custom("colStart", (a) => [signNeg("col-start", a[0]!)], [["2"], ["-1"], ["auto"]]),
    custom("colEnd",   (a) => [signNeg("col-end",   a[0]!)], [["2"], ["-1"], ["auto"]]),
    custom("rowStart", (a) => [signNeg("row-start", a[0]!)], [["3"], ["-1"], ["auto"]]),
    custom("rowEnd",   (a) => [signNeg("row-end",   a[0]!)], [["3"], ["-1"], ["auto"]]),
    pre("rowSpan", "row-span"),   // positive-only → plain prefix, symmetric with colSpan
    ```
  - *New Multi-column block* (near Grid): all plain prefixes —
    ```ts
    pre("columns", "columns"),
    pre("breakBefore", "break-before"),
    pre("breakAfter", "break-after"),
    pre("breakInside", "break-inside"),
    pre("boxDecoration", "box-decoration"),
    ```
  - *New Scroll block*:
    ```ts
    custom("snap", (a) => (a.length <= 1 ? [`snap-${a[0] ?? "none"}`] : [`snap-${a[0]}`, `snap-${a[1]}`]),
           [["x"], ["both"], ["x", "mandatory"], ["y", "proximity"]]),
    custom("snapAlign", (a) => [a[0] === "none" ? "snap-align-none" : `snap-${a[0]}`],
           [["start"], ["center"], ["none"]]),
    pre("snapStop", "snap"),               // snap-normal | snap-always
    pre("scrollBehavior", "scroll"),       // scroll-auto | scroll-smooth
    space("scrollMargin", "scroll-m", "-", true, true),   // scroll-m-4 / scroll-mt-24 / scroll-mt-[64px]
    space("scrollPadding", "scroll-p", "-", true, true),  // scroll-p-4 / scroll-pt-16 / scroll-pt-[2rem]
    pre("fieldSizing", "field-sizing"),
    ```
  The `class-vocab.test.ts` lib-parity test renders each method and diffs against
  the emit; the `custom` rows carry `samples` for the round-trip safelist test
  (`types.ts:86`). No `emit.ts` change — `prefix`/`spacing`/`custom` kinds are
  already dispatched (`emit.ts` case `"custom"` → `shape.emit`).
- **EXTRACTOR `../fluent-html-tailwind-extractor`** — **no code change**:
  `extract.ts` imports `classVocab` + `emitClasses` directly (`:9, :11`), so all
  new rows are consumed automatically once published. Add `safelist.test.ts` /
  `extract.test.ts` recognition assertions for the negative-line samples
  (`-col-end-1`), the 2-class `snap` (`snap-x snap-mandatory`), the
  `snap-align-none` arm, and `scroll-mt-[64px]`.
- **ESLINT `../fluent-html-eslint-plugin`** —
  - **Regenerate** `src/vocab.generated.ts` (do not hand-edit) so the 22 names
    join `VOCAB_METHODS` (the file is auto-generated from `fluent-html/class-vocab`
    via `scripts/gen-vocab.mjs`, header line 1).
  - **`no-known-modifiers-in-setclass.ts`** — add exact-match disambiguation rows
    BEFORE the generic prefix rows (same precedent as `text-white` before `text-`):
    `snap-align-none → snapAlign("none")`; `snap-normal`/`snap-always → snapStop`;
    `snap-x`/`snap-y`/`snap-both`/`snap-none → snap`;
    `snap-mandatory`/`snap-proximity → snap` (2nd arg);
    `scroll-auto`/`scroll-smooth → scrollBehavior`; `field-sizing- → fieldSizing`;
    `columns- → columns`; `break-before-`/`break-after-`/`break-inside-`/
    `box-decoration- → breakBefore`/`breakAfter`/`breakInside`/`boxDecoration`;
    `col-start-`/`col-end-`/`row-start-`/`row-end-`/`row-span- → col/row methods`
    (incl. the `-col-start-1` negative spelling).

All emitted classes are literal + statically resolvable; the only dynamic forms
are the existing `[${...}]` arbitrary/unit-overload arms, already extractor-safe.

## Alternatives considered

- **A combined `col()`/`row()` grid-column shorthand** (`grid-column: 2 / -1`).
  Rejected: span-or-line ambiguous and would create a second way to place a line
  alongside `colStart`/`colEnd`/`colSpan` (§11.6 violation). If proposed, flag and
  reject.
- **Encode negative lines as a separate `colStartFromEnd()` method.** Rejected: a
  second spelling for one concept; the negative union member + `signNeg` emitter
  (the proven A-07 pattern) keeps `.colStart(-1)` reading naturally with one method.
- **Keep `(string & {})` on `TailwindGridLine`/`TailwindRowSpan` for parity with
  `colSpan`.** Rejected: closing the union catches typos (§11.4); the explicit
  `[${string}]` arm preserves the arbitrary escape. Recommend (separately,
  converge) tightening `TailwindColSpan` the same way — out of scope here.
- **Fold `snap` strictness into a single 2-class union value.** Rejected: the
  arity overload (`snap(axis)` vs `snap(axis, strictness)`) is clearer and the
  `Exclude<…, "none">` on the 2-arg form makes `snap("none", "mandatory")` a
  compile error; a single concatenated token cannot express that constraint.
- **`pre("snapAlign", "snap")`.** Rejected: it would mis-emit `snap-none` for the
  `"none"` arm — the child token is `snap-align-none`. The `custom` emitter maps it
  correctly (covered by an explicit `["none"]` parity sample).
- **Split into three RFCs (grid / multi-column / scroll).** Rejected: all three
  touch the same `vocab.ts` layout region and the same single eslint `VOCAB_METHODS`
  regen + `no-known-modifiers-in-setclass` table; landing together avoids a
  triple-conflicting generated diff. They are one coherent "layout" surface.

## Open questions

1. **Grid-line ceiling.** The union caps at line 13 (12 cols + 1 trailing line),
   matching `gridCols`' 1–12 ceiling; larger custom grids use `col-start-[15]`.
   Confirm no app needs a typed line > 13 before locking (none found in grep).
2. **`columns` named-width scale drift.** `columns-3xs…7xl` are v4 defaults; if an
   app's theme renames a width token the class won't resolve — identical risk to
   every other named-scale method (`textSize`, `maxW`). Keep as-is?
3. **Tighten `TailwindColSpan` to match the new closed grid-line shape** (drop its
   `(string & {})`) in the same release for convergence? Proposed: yes, as a
   follow-up note, but strictly a `colSpan` concern, out of this RFC's scope.
4. **`fieldSizing` Baseline.** Ship now with the JSDoc caveat (proposed), or gate
   behind a docs-only "experimental" tag? Precedent (anchor-positioning methods)
   says ship with the caveat.
