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
  - "FluentTailwindMethods.scrollMargin(direction: \"x\"|\"y\"|\"top\"|\"bottom\"|\"left\"|\"right\"|\"t\"|\"b\"|\"l\"|\"r\", value: TailwindSpacing): this"
  - "FluentTailwindMethods.scrollMargin(unit: TailwindUnit, amount: number): this"
  - "FluentTailwindMethods.scrollPadding(value: TailwindSpacing): this"
  - "FluentTailwindMethods.scrollPadding(direction: \"x\"|\"y\"|\"top\"|\"bottom\"|\"left\"|\"right\"|\"t\"|\"b\"|\"l\"|\"r\", value: TailwindSpacing): this"
  - "FluentTailwindMethods.scrollPadding(unit: TailwindUnit, amount: number): this"
  - "FluentTailwindMethods.fieldSizing(value: TailwindFieldSizing): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md — Fluent Styling tables: add Grid line-placement (colStart/colEnd/rowStart/rowEnd/rowSpan), Multi-column/fragmentation (columns/breakBefore/breakAfter/breakInside/boxDecoration), and Scroll (snap*/scrollBehavior/scrollMargin/scrollPadding/fieldSizing) rows"
  - "src/core/tailwind-methods.ts — JSDoc on all new decls (negative-line note on col/row; fragmentation-vs-breakAll disambiguation; fieldSizing Baseline caveat; single-axis unit-overload note on scrollMargin/scrollPadding)"
  - "fluent-html.md — Layout section: holy-grail grid, multi-column card list, carousel, sticky-anchor offset, auto-grow textarea recipes"
  - "views.md — auto-grow textarea recipe wired to Form<T> f.textarea()"
  - "CHANGELOG.md — 6.2.0 entry"
  - "../fluent-html-tailwind-extractor/README.md — note the new vocab rows are auto-consumed (vocab-driven); custom negative-line + 2-class snap emitters + corrected scroll-spacing rows round-trip via samples"
  - "../fluent-html-eslint-plugin/README.md — note regenerated VOCAB_METHODS gains the 22 new method names; setClass disambiguation rows for snap-/scroll-/columns-/break-*/field-sizing-"
impact: "Closes the v4 layout gap: grid-line placement (incl. negative lines), CSS multi-column + fragmentation/print control, and scroll-snap/scroll-margin/scroll-padding/scroll-behavior plus JS-free field-sizing auto-grow — all as typed primitives, eliminating the setClass escape hatch for layout."
effort: L
depends_on: []
status: implemented
---

# RFC-C-09 — Layout: grid-line placement, multi-column, scroll & field-sizing

> Adversary verdict: **survives-with-changes** (confidence 0.78). Killer objection:
> the `scrollMargin`/`scrollPadding` emit spec was internally inconsistent and
> shipped broken classes — the vocab row used `sep="-"` (→ `scroll-m-t-24`), the
> hand-written twin indexed `DIR_MAP["px"]` on the unit branch (→
> `scroll-mundefined-[64px]`), and the output table claimed a third value
> (`scroll-mt-[64px]`), a guaranteed §11.7 lockstep / round-trip failure. **All five
> required changes are folded in below** (sep="", single source of truth twin
> verbatim-copying `p.padding`, corrected single-axis unit output, phantom
> `TailwindSpacingDir` removed in favour of the inlined directional union, pinned
> extractor/parity samples). See **Adversary review & resolutions** at the end.

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
`TailwindUnit` unions **and the directional literal union inlined verbatim by the
existing `padding`/`margin` decls** (`tailwind-methods.ts:116, 119`):
`"x"|"y"|"top"|"bottom"|"left"|"right"|"t"|"b"|"l"|"r"`. **No new spacing types,
and no `TailwindSpacingDir` symbol is introduced** — the directional union is
inlined exactly as padding/margin already do it, so this RFC adds zero spacing
types and stays converged with the shipped precedent. (Promoting that literal
union to a named `TailwindSpacingDir` and migrating padding/margin/border onto it
is a separate convergence cleanup — see Open Questions — and is deliberately *not*
in this RFC's surface.)

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
/** scroll-margin. Mirrors {@link margin} exactly: bare, directional, and
 *  `(unit, amount)` overloads. `.scrollMargin("t", "24")` → `scroll-mt-24`
 *  (directional). The `(unit, amount)` arbitrary form is **single-axis** (no
 *  direction), identical to `padding`/`margin`: `.scrollMargin("px", 64)` →
 *  `scroll-m-[64px]`. */
scrollMargin(value: TailwindSpacing): this;
scrollMargin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
scrollMargin(unit: TailwindUnit, amount: number): this;
/** scroll-padding. Mirrors {@link padding} exactly: bare, directional, and
 *  single-axis `(unit, amount)` overloads. `.scrollPadding("rem", 2)` →
 *  `scroll-p-[2rem]` (single-axis, no direction). */
scrollPadding(value: TailwindSpacing): this;
scrollPadding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
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

// scrollMargin/scrollPadding are a VERBATIM copy of p.margin / p.padding
// (tailwind-methods.ts:402-419) with the prefix swapped — the SINGLE source of
// truth that the `space("scrollMargin","scroll-m","",true,true)` vocab row mirrors.
//   • bare        → scroll-m-${dir-or-value}
//   • (unit,amt)  → scroll-m-[${amount}${unit}]   ← SINGLE-AXIS, no direction
//   • (dir,value) → scroll-m${DIR_MAP[dir]||dir}-${value}
p.scrollMargin = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`scroll-m-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`scroll-m-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`scroll-m${dir}-${value}`);
};
p.scrollPadding = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`scroll-p-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`scroll-p-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`scroll-p${dir}-${value}`);
};
p.fieldSizing = function (value: string) { return this.addClass(`field-sizing-${value}`); };
```

> **Single-axis unit overload (corrected).** The canonical `p.padding`/`p.margin`
> twins emit `p-[${value}${unit}]` / `m-[${value}${unit}]` on the `(unit, amount)`
> branch — **no direction** (the arbitrary form is single-axis). The scroll twins
> copy that branch verbatim, so `.scrollMargin("px", 64)` → `scroll-m-[64px]` and
> `.scrollPadding("rem", 2)` → `scroll-p-[2rem]`. This matches the canonical
> `space(...,"",true,true)` vocab emitter (`emit.ts:18`,
> `units && UNITS.has(a) → [${prefix}-[${b}${a}]]`) exactly. The earlier draft's
> bespoke `scroll-m${DIR_MAP["px"]}-…` (which indexed a *unit* as a direction key →
> `undefined`) is removed; there is now exactly one emit rule per branch, identical
> across the twin and the vocab row.

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
| `.scrollMargin("t", "24")` (directional) | `scroll-mt-24` |
| `.scrollMargin("px", 64)` (unit, **single-axis**) | `scroll-m-[64px]` |
| `.scrollPadding("4")` (bare) / `.scrollPadding("t", "16")` (dir) | `scroll-p-4` / `scroll-pt-16` |
| `.scrollPadding("rem", 2)` (unit, **single-axis**) | `scroll-p-[2rem]` |
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
- **No new `any`, no bare `string`** in any public signature. `scrollMargin`/
  `scrollPadding` reuse the closed `TailwindSpacing`/`TailwindUnit` unions and
  **inline the same directional literal union padding/margin already use** — no
  phantom `TailwindSpacingDir` type is referenced; the directional overload is
  spelled out verbatim (`"x"|"y"|"top"|"bottom"|"left"|"right"|"t"|"b"|"l"|"r"`),
  so the `api_surface` promises exactly the symbols that ship.

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
   the fragmentation-vs-`breakAll` disambiguation; the `fieldSizing` Baseline caveat;
   and the **single-axis unit-overload note** on `scrollMargin`/`scrollPadding`
   (`(unit, amount)` → `scroll-m-[64px]`, no direction).

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
   | `.scrollMargin("t","24")` / `.scrollMargin("px",64)` | `scroll-mt-24` / `scroll-m-[64px]` | scroll-margin (spacing family; unit form single-axis) |
   | `.scrollPadding(...)`         | `scroll-pt-16` / `scroll-p-[2rem]` | scroll-padding (spacing family)|
   | `.fieldSizing(v)`             | `field-sizing-content`       | JS-free auto-grow (Chromium 123+)    |
   ```

3. **`fluent-html.md`** — Layout section: add the holy-grail grid, multi-column
   card list, carousel, and sticky-anchor-offset recipes from Worked examples.

4. **`views.md`** — auto-grow textarea recipe wired to `Form<T>` `f.textarea()`
   (example 5), with the Baseline caveat note.

5. **`CHANGELOG.md`** — 6.2.0 entry:
   `Added: grid line placement colStart/colEnd/rowStart/rowEnd (negative lines via -col-start-1) + rowSpan; CSS multi-column columns() + fragmentation breakBefore/breakAfter/breakInside/boxDecoration; scroll-snap snap()/snapAlign/snapStop, scrollBehavior, scrollMargin/scrollPadding (spacing family — directional scroll-mt-24, single-axis unit scroll-m-[64px]), and fieldSizing (JS-free auto-grow, Chromium 123+).`

6. **`../fluent-html-tailwind-extractor/README.md`** — note the new vocab rows are
   auto-consumed (extractor is vocab-driven); the custom negative-line and 2-class
   `snap` emitters, and the corrected `scroll-m`/`scroll-p` spacing rows, round-trip
   through their declared `samples`.

7. **`../fluent-html-eslint-plugin/README.md`** — note `VOCAB_METHODS` is
   regenerated to add the 22 new method names, plus the `setClass`
   disambiguation rows for `snap-`/`scroll-`/`columns-`/`break-*`/`field-sizing-`.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure string `addClass`; no new runtime dependency.
- **§11.2 SSR-sync** — every method is a synchronous `addClass` on the render path; no async.
- **§11.3 escape-by-default** — emits Tailwind class tokens only; no attr/URL value, no XSS surface.
- **§11.4 type-safety** — grid-line + fragmentation + scroll unions are closed literals (negative line is a first-class member; arbitrary only via the explicit `[${string}]` arm); `scrollMargin`/`scrollPadding` reuse closed `TailwindSpacing`/`TailwindUnit` + the inlined directional literal union (no phantom type); no `any`, no bare `string` where literals are valid; a typo is a compile error.
- **§11.5 compat** — purely additive within v6 (22 methods + 12 types; no existing signature changes); honestly additive.
- **§11.6 idioms** — overload-by-arity for `snap` (no flag bag); `scrollMargin`/`scrollPadding` reuse the spacing family with a **single source of truth** (the twin is a verbatim copy of `p.padding`/`p.margin`; the vocab row is the canonical `space(...,"",true,true)` emitter — no second divergent emitter); typed line methods supersede `.neg("col-start-1")` as the documented path; no inline JS; CONVERGE preserved.
- **§11.7 class-string contract** — every emitted class is literal + extractor-resolvable (`col-start-2`, `-col-end-1`, `columns-xs`, `snap-x`, `scroll-mt-24`, `scroll-m-[64px]`, `field-sizing-content`, …); the twin and the vocab row now produce **identical** output on every branch (bare / directional / single-axis unit), matched by pinned round-trip samples; the only dynamic forms are the existing `[${...}]` arbitrary/unit-overload machinery, already extractor-safe; lockstep below registers vocab + regenerates eslint + adds extractor samples.
- **§11.8 docs/guideline-sync** — every symbol in `api_surface` is covered by the Docs impact section (lib README/JSDoc/CHANGELOG + `fluent-html.md`/`views.md` + both tooling READMEs); the corrected single-axis unit output is reflected in the README table, the emitted-output table, and the JSDoc.

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
  - *New Scroll block* — **note `sep=""` on the two `space` rows, matching
    `padding`/`margin` (`vocab.ts:71-72`), NOT `sep="-"`**:
    ```ts
    custom("snap", (a) => (a.length <= 1 ? [`snap-${a[0] ?? "none"}`] : [`snap-${a[0]}`, `snap-${a[1]}`]),
           [["x"], ["both"], ["x", "mandatory"], ["y", "proximity"]]),
    custom("snapAlign", (a) => [a[0] === "none" ? "snap-align-none" : `snap-${a[0]}`],
           [["start"], ["center"], ["none"]]),
    pre("snapStop", "snap"),               // snap-normal | snap-always
    pre("scrollBehavior", "scroll"),       // scroll-auto | scroll-smooth
    space("scrollMargin", "scroll-m", "", true, true),   // bare scroll-m-4 / dir scroll-mt-24 / unit scroll-m-[64px]
    space("scrollPadding", "scroll-p", "", true, true),  // bare scroll-p-4 / dir scroll-pt-16 / unit scroll-p-[2rem]
    pre("fieldSizing", "field-sizing"),
    ```
    With `sep=""` and `abbrev=true`, `emitSpacing` (`emit.ts:13-23`) returns:
    - `["4"]` → `scroll-m-4` (bare, single arg)
    - `["t","24"]` → `${"scroll-m"}${""}${DIR_MAP["t"]}-24` = `scroll-mt-24` (directional)
    - `["px","64"]` → `units && UNITS.has("px")` → `scroll-m-[64px]` (single-axis unit)

    This is byte-identical to the twin `p.scrollMargin`/`p.scrollPadding` above on
    all three branches — the single source of truth the verdict demanded.
  - **`samples` to pin the corrected outputs** (so the broken `sep="-"` / bracket
    direction can never silently re-appear): the `space` rows are exercised by the
    parity harness against the args `["4"]`, `["t","24"]`, `["px","64"]` for
    `scrollMargin` and `["4"]`, `["t","16"]`, `["rem","2"]` for `scrollPadding`,
    asserting `scroll-m-4`/`scroll-mt-24`/`scroll-m-[64px]` and
    `scroll-p-4`/`scroll-pt-16`/`scroll-p-[2rem]` respectively.

  The `class-vocab.test.ts` lib-parity test renders each method and diffs against
  the emit; the `custom` rows carry `samples` for the round-trip safelist test
  (`types.ts:86`). No `emit.ts` change — `prefix`/`spacing`/`custom` kinds are
  already dispatched (`emit.ts` case `"custom"` → `shape.emit`; case `"spacing"` →
  `emitSpacing`).
- **EXTRACTOR `../fluent-html-tailwind-extractor`** — **no code change**:
  `extract.ts` imports `classVocab` + `emitClasses` directly (`:9, :11`), so all
  new rows are consumed automatically once published. Add `safelist.test.ts` /
  `extract.test.ts` recognition assertions for the negative-line samples
  (`-col-end-1`), the 2-class `snap` (`snap-x snap-mandatory`), the
  `snap-align-none` arm, and **both scroll-spacing branches: the directional
  `scroll-mt-24` and the single-axis unit `scroll-m-[64px]`** (plus
  `scroll-pt-16` / `scroll-p-[2rem]`). These are the guard required-change 5
  mandates — without them the original `sep="-"` regression would pass unnoticed.
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
    (incl. the `-col-start-1` negative spelling); `scroll-m-`/`scroll-p- →
    scrollMargin`/`scrollPadding`.

All emitted classes are literal + statically resolvable; the twin and the vocab
row agree on every branch; the only dynamic forms are the existing `[${...}]`
arbitrary/unit-overload arms, already extractor-safe.

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
- **A bespoke `p.scrollMargin`/`p.scrollPadding` emitter** (the original draft's
  hand-rolled twin that hard-coded `scroll-m${DIR_MAP[dir]}` and added a direction
  on the unit branch). **Rejected — it was the verdict's killer**: it diverged from
  the canonical `space` emitter (a §11.7 lockstep break), and indexed a *unit* as a
  direction on the `(unit, amount)` branch → `scroll-mundefined-[64px]`. The shipped
  twin is now a verbatim copy of `p.padding`/`p.margin` so there is one emit rule.
- **A directional unit overload `scrollMargin("px", 64) → scroll-mt-[64px]`.**
  Rejected: padding/margin's `(unit, amount)` form is **single-axis** (`p-[64px]`,
  no direction) — adding a direction here would be a *third* spelling diverging from
  the family. Single-axis `scroll-m-[64px]` is the only correct, converged output.
- **Introduce a named `TailwindSpacingDir` type for the directional union.**
  Deferred: padding/margin/border inline the literal union today; introducing the
  named type *and migrating those* is a separate convergence cleanup (Open
  Questions). This RFC inlines the same union verbatim so it adds zero spacing
  types and references no symbol it doesn't ship.
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
4. **Promote the inlined directional union to a named `TailwindSpacingDir`** and
   migrate `padding`/`margin`/`border`/`scrollMargin`/`scrollPadding` onto it for
   convergence? Proposed: yes, as a separate cleanup RFC — not folded here so this
   RFC stays additive and ships no symbol it cannot deliver.
5. **`fieldSizing` Baseline.** Ship now with the JSDoc caveat (proposed), or gate
   behind a docs-only "experimental" tag? Precedent (anchor-positioning methods)
   says ship with the caveat.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.78). All five required changes
are blocking and all are resolved:

1. **FIX the `scrollMargin`/`scrollPadding` vocab rows to `sep=""`.** ✅ Resolved.
   The Lockstep block now specifies `space("scrollMargin","scroll-m","",true,true)`
   and `space("scrollPadding","scroll-p","",true,true)` — matching
   `space("padding","p","",true,true)` (`vocab.ts:71`). With `sep=""` and
   `abbrev=true`, `emitSpacing` returns `scroll-m` + `""` + `DIR_MAP["t"]` + `-24`
   = `scroll-mt-24`. The Lockstep section spells out all three branch outputs
   inline and a comment flags the `sep=""` choice explicitly.

2. **DELETE the bespoke hand-written twin; one source of truth.** ✅ Resolved. The
   Implementations block's `p.scrollMargin`/`p.scrollPadding` are now a **verbatim
   copy of `p.padding`/`p.margin`** (`tailwind-methods.ts:402-419`) with the prefix
   swapped: bare → `scroll-m-${dir-or-value}`; `(unit, amount)` →
   `scroll-m-[${value}${unit}]` (single-axis, no direction); `(dir, value)` →
   `scroll-m${DIR_MAP[dir]||dir}-${value}`. This is byte-identical to the `space`
   vocab emitter on every branch (twin == vocab, §11.7). A note documents the
   change and an "Alternatives" entry records why the old bespoke emitter was wrong.

3. **CORRECT the emitted-output table + JSDoc to single-axis unit output.** ✅
   Resolved. The table now reads `.scrollMargin("px", 64)` → `scroll-m-[64px]`
   (single-axis, no `t`) and `.scrollPadding("rem", 2)` → `scroll-p-[2rem]`; the
   directional row is split out (`scrollMargin("t","24")` → `scroll-mt-24`). The
   `scrollMargin`/`scrollPadding` JSDoc, the README table, and the CHANGELOG line
   all state the single-axis unit rule consistently.

4. **REMOVE the fictional `TailwindSpacingDir` from `api_surface`.** ✅ Resolved.
   The two directional overloads in `api_surface` and in the interface now inline
   the literal union `"x"|"y"|"top"|"bottom"|"left"|"right"|"t"|"b"|"l"|"r"`
   verbatim (exactly as `padding`/`margin` do, `tailwind-methods.ts:116, 119`).
   No `TailwindSpacingDir` symbol is referenced anywhere. Promoting that union to a
   named type + migrating the spacing family is recorded as a separate convergence
   cleanup (Open Question 4 / Alternatives), so this RFC ships exactly the symbols
   it lists.

5. **ADD extractor round-trip + lib-parity samples pinning the corrected output.**
   ✅ Resolved. The Lockstep block specifies parity assertions for `scroll-m-4` /
   `scroll-mt-24` / `scroll-m-[64px]` and `scroll-p-4` / `scroll-pt-16` /
   `scroll-p-[2rem]`, and the extractor section adds `safelist.test.ts` /
   `extract.test.ts` recognition for the directional `scroll-mt-24` and single-axis
   `scroll-m-[64px]` (plus `scroll-pt-16` / `scroll-p-[2rem]`) — the guard that
   makes a future `sep="-"` regression a hard test failure.
