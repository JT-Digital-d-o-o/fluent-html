# Track A — App APIs · Page Shell & Layout Composition (a03)

Lens scope: page shell & layout composition — repeated wrappers, container/section scaffolds, responsive grids, `.apply()` mixin candidates, design-token style functions.

Mined apps: `/Users/tony/jt-digital/pm-gui` (v6 template) and `/Users/tony/jt-digital/planet-positive-sport` (v5).

---

## P1 — `.container(...)`: responsive centered page gutter (max-w + mx-auto + px-4 sm:px-6 lg:px-8)

**Problem / evidence.** The single most-repeated layout idiom in both apps is the centered, width-capped row with escalating horizontal gutters. The literal triple `padding("x","4") … at("sm", t => t.padding("x","6")) … at("lg", t => t.padding("x","8"))` appears in **49 files** across the two apps; the bare `at("sm", t => t.padding("x","6"))` gutter step alone occurs **48 times**.

Concrete refs (every one re-spells the same chain):
- pps Navbar — `app-layout.view.ts:242-246`: `.maxW("7xl").margin("x","auto").padding("x","3").padding("y","3").at("sm", t => t.padding("x","6").padding("y","4"))`
- pps Footer — `app-layout.view.ts:291-301`: `.maxW("7xl").margin("x","auto").padding("x","4").padding("y","8").at("sm", t => t.padding("x","6")).at("lg", t => t.padding("x","8"))`
- pps legacy layout Nav — `layout.view.ts:136-143` and Footer `:159-164`: identical `.maxW("7xl").margin("x","auto").padding("x","4").at("sm",…).at("lg",…)`
- pm-gui `contentContainer` mixin — `layout.view.ts:48-56`: `.margin("x","auto").padding("x","6").padding("y","8").at("lg", tt => tt.padding("x","10"))`

**Proposed API.**
```ts
// New tailwind method on Tag
container(maxW?: TailwindMaxWidth): this;
// Emits, in order:
//   "mx-auto px-4 sm:px-6 lg:px-8"   (the canonical responsive gutter)
//   + "max-w-{maxW}" when an arg is given (e.g. container("7xl") -> "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8")
```
Named `container` because that is exactly what this idiom is called in the Tailwind ecosystem; it is a single fluent method (all classes are static literals, so the extractor sees every class — no per-branch `.when()` switch needed). Width stays an optional closed-union arg.

**Before / after.**
```ts
// before (pps app-layout.view.ts:291-301)
Div(...).maxW("7xl").margin("x","auto").padding("x","4").padding("y","8")
  .at("sm", t => t.padding("x","6")).at("lg", t => t.padding("x","8"))
// after
Div(...).container("7xl").padding("y","8")
```

**Already in lib?** No. There is a `containerQuery()` method (`tailwind-methods.ts:678` — emits CSS `@container`, an unrelated v4 container-query marker). The actual Tailwind `container`/centered-gutter utility does **not** exist. Nothing in CHANGELOG 6.0.0→6.1.1.

**Value:** high (49-file footprint, both apps, kills a 5-call chain → 1 call, and removes the most common extractor-hostile dynamic-width workaround). **Effort:** small (one method emitting fixed literals + optional `max-w-*`).

---

## P2 — `.gridCols(cols, { at })` responsive overload (or `.responsiveGrid`)

**Problem / evidence.** Responsive grids are hand-rolled as `grid().gridCols("1").at("md", g => g.gridCols("2"))` everywhere — `gridCols` is called **107 times** in pps (excluding tests), and the "base cols + `.at(bp, g => g.gridCols(n))`" escalation is the dominant shape.

Concrete refs:
- `federation-landing.view.ts:70-71`: `.grid().gap("8").gridCols("1").at("md", tag => tag.gridCols("3"))`
- `loc/suppliers/views/total-card.view.ts:108-110`: `.gridCols("2").at("md", g => g.gridCols("3")).at("lg", g => g.gridCols("4"))`
- `loc/suppliers/views/per-contributor.view.ts:250-251`, `:480-481`; `loc/events/views/report-content.components.ts:188-189` — all the same base→md→lg pattern.

**Proposed API.** A responsive map overload on the existing `gridCols`:
```ts
gridCols(cols: TailwindGridCols): this;                                  // existing
gridCols(map: Partial<Record<"base" | TailwindBreakpoint, TailwindGridCols>>): this; // new
// gridCols({ base: 1, md: 2, lg: 4 }) -> "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```
Closed union keys keep type-safety and the literal class strings stay extractor-visible. Same overload shape generalizes nicely to `gridRows`. (`.grid()` and `.gap()` are already terse, so scope this to the cols escalation, which is the painful part.)

**Before / after.**
```ts
// before (total-card.view.ts:108-110)
.grid().gridCols("2").at("md", g => g.gridCols("3")).at("lg", g => g.gridCols("4"))
// after
.grid().gridCols({ base: 2, md: 3, lg: 4 })
```

**Already in lib?** No. `gridCols` (`tailwind-methods.ts:492`) only takes a single value; the responsive escalation is always manual `.at()`. Not in CHANGELOG.

**Value:** high (107 call sites in one app). **Effort:** small (one overload; build the class string from the map).

---

## P3 — `AppShell` column primitive: `.minH("screen").flex().flexDirection("col")`

**Problem / evidence.** Every top-level layout wraps content in the identical "full-height flex column" so the footer sticks to the bottom: `.minH("screen").flex().flexDirection("col").background("gray-50")`. Appears in all three layout files:
- pm-gui `layout.view.ts:113-116` (`MainContent`)
- pps `app-layout.view.ts:75-79` (`shell`)
- pps `layout.view.ts:66-70` (`Layout`)

Paired with `Main(children).flex("1")` and `Footer(...).margin("t","auto")` — the canonical sticky-footer shell.

**Proposed API.** A `.apply()` mixin shipped as a documented recipe, OR a tiny tag method:
```ts
// fluent mixin method on Tag
screenColumn(): this;   // -> "min-h-screen flex flex-col"
```
The `background` stays caller-controlled (it varies less but is app-specific). This is the highest-frequency "flex column" composite; `flex().flexDirection("col")` alone occurs **44 times** in pm-gui.

**Before / after.**
```ts
// before (pps app-layout.view.ts:75-79)
.setId(layoutIds.mainContent).minH("screen").flex().flexDirection("col").background("gray-50")
// after
.setId(layoutIds.mainContent).screenColumn().background("gray-50")
```

**Already in lib?** No such composite. `minH`, `flex`, `flexDirection` exist individually; no shell helper in CHANGELOG.

**Value:** medium (small chain, but universal — every page in every app). **Effort:** small.

---

## P4 — `.stack(gap?)` / `.row(gap?)`: the flex-column / flex-row-aligned shorthands

**Problem / evidence.** `flex().flexDirection("col")` (vertical stack) recurs **44 times** in pm-gui alone; `flex().alignItems("center")` (horizontal row) is pervasive in every navbar/toolbar (e.g. pps `app-layout.view.ts:124,131,178,196,240,246`; pm-gui `layout.view.ts:148,156,167,210,220,227`). These are the two most common flex shapes and are always spelled out long-hand, often with a trailing `.gap(n)`.

**Proposed API.**
```ts
stack(gap?: TailwindSpacing): this;  // -> "flex flex-col" (+ "gap-{n}")
row(gap?: TailwindSpacing): this;    // -> "flex flex-row items-center" (+ "gap-{n}")
```
Vertical stacks rarely need cross-axis alignment; horizontal rows almost always want `items-center` (toolbars, nav, badges-with-text) — the refs above bear this out, so `row` baking in `items-center` matches real usage. Both keep `.justifyContent`/`.alignItems` chainable for the exceptions.

**Before / after.**
```ts
// before (pm-gui layout.view.ts:148)
.flex().flexDirection("col").padding("x","2").margin("b","5")
// after
.stack().padding("x","2").margin("b","5")

// before (pps app-layout.view.ts:240)
.flex().alignItems("center").gap("2").at("sm", t => t.gap("4"))
// after
.row("2").at("sm", t => t.gap("4"))
```

**Already in lib?** No. Only the atomic `flex()`, `flexDirection()`, `alignItems()` exist. Not in CHANGELOG. (Note: this overlaps slightly with P3 — `screenColumn` is the page-shell special case; `stack`/`row` are the general primitives. Ship them together or pick `stack`/`row` and let `screenColumn = .stack().minH("screen")`.)

**Value:** medium-high (>44 sites for `stack` in one app; both idioms ubiquitous). **Effort:** small.

---

## Top picks
- **P1 `.container(maxW?)`** — highest footprint (49 files), collapses the 5-call responsive-gutter chain into one and removes the most common extractor-hostile dynamic-`maxW` workaround. Ship first.
- **P2 responsive `gridCols(map)`** — 107 call sites; tiny overload, big readability win.
- **P4 `.stack()` / `.row()`** — the two universal flex shapes; `screenColumn` (P3) folds in as `.stack().minH("screen")`.
