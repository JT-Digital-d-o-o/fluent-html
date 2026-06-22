---
id: RFC-B-06
track: B
title: "Table.of() data-grid with typed columns, sortable headers, Pagination, and automatic sort/filter preservation"
resolves: [F-B-011, F-B-012, F-B-013, F-B-014]
api_surface: ["Table.of()", "tableState()", "Pagination()", "ThCell()", "TdCell()", "SortHeader()", "TableState<T>"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/htmx.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-06: Table.of() data-grid with typed columns, sortable headers, Pagination, and automatic sort/filter preservation

## Problem

Every app that renders a data table rebuilds the same four primitives by hand, with incompatible signatures that block cross-app sharing:

1. **`ThCell`/`TdCell`** — styled `<th>`/`<td>` wrappers, reimplemented in 5+ apps with the identical chain `.padding("3").textSize(...).textColor(...).textAlign(align)`, diverging only on the brand color token and on call convention (props-object vs positional). `jt-cut/src/shared/components/ui.components.ts:125` uses `ThCell({ text })`; `rideshare/src/analytics/analytics.components.ts:128` uses `ThCell("Time")`; `mngmt/src/analytics/analytics.view.ts:60` defines its own locally. (F-B-011)

2. **`Pagination`** — reimplemented in 5 apps, always forcing the caller to supply a `renderPageLink: (page, label) => View` callback that manually builds an HTMX anchor. `storysell-ai/src/shared/components/ui.data.components.ts:104` is copy-pasted verbatim into glimm and jt-cut; `rideshare/src/analytics/views/events.view.ts:153` doesn't even extract it — it inlines the three-part `Div(IfThen, Span, IfThen)`. (F-B-012)

3. **Sort/filter `vals` preservation** — when a table has both pagination and sortable columns, every page-link and every sort-link must re-carry the current value of *every other* parameter. There is no primitive, so each view hand-builds a `Record<string, string>`:
   ```ts
   // glimm/src/analytics/views/event-log.view.ts:169
   const vals: Record<string, string> = { page: String(page) };
   if (props.filters.event)    vals.event    = props.filters.event;
   if (props.filters.category) vals.category = props.filters.category;
   if (props.filters.userId)   vals.userId   = props.filters.userId;
   if (props.filters.sort)     vals.sort     = props.filters.sort;
   if (props.filters.dir)      vals.dir      = props.filters.dir;
   ```
   This block appears *twice* per table (once for the sort builder at `event-log.view.ts:65`, once for the pagination builder at `:169`) and is byte-identical across glimm, storysell, and jt-cut. **The risk is correctness**: add a filter to the query schema, forget one of the two manual blocks, and that filter silently resets on the next page-turn or sort-click. (F-B-013)

4. **`SortableThCell`/`SortHeader`** — reimplemented in 3 apps with *mutually incompatible* `buildHtmx` callback signatures: `jt-cut/src/shared/components/ui.components.ts:139` uses `(column: string, dir: SortDir) => HTMX`; `glimm/src/analytics/views/analytics.components.ts:5` uses `({ sort, dir }) => HTMX`. Every view must also define a `buildSortHtmx` closure and prop-drill `currentSort`/`currentDir`/`buildHtmx` into every column via `...sortProps` spread. Estimated ~80–120 lines of sort-infrastructure per analytics view. (F-B-014)

These four findings are one cluster: they appear in the **same** `event-log.view.ts` / `ui.data.components.ts` files, share the same filter object, and only compose correctly when designed together.

## Proposed API

A single data-grid builder, `Table.of(rows, options)`, plus a typed `TableState<T>` that single-sources page/sort/filter and serializes itself into HTMX `query` automatically. The low-level `ThCell`/`TdCell`/`SortHeader`/`Pagination` primitives are also exported for tables that need manual layout.

```ts
// ── Sort direction ───────────────────────────────────────────────────────────
export type SortDir = "asc" | "desc";

// ── TableState: single source of truth for page + sort + filters ─────────────
// T is the app's filter shape (the query-schema interface). `as const` on the
// keys keeps `field` literal-checked against sortable columns.
export type TableStateInput<T extends Record<string, unknown>> = {
  page?: number;            // 1-based; defaults to 1
  sort?: keyof T & string;  // active sort column (literal-union, not bare string)
  dir?: SortDir;
  filters?: Partial<T>;     // active non-empty filters
};

export interface TableState<T extends Record<string, unknown>> {
  readonly page: number;
  readonly sort?: keyof T & string;
  readonly dir?: SortDir;
  readonly filters: Partial<T>;
  /** Serialize all non-empty fields to a query bag. nullish/"" entries are skipped. */
  toQuery(overrides?: QueryParams): QueryParams;
  /** New state for a page change (filters + sort preserved). */
  withPage(page: number): TableState<T>;
  /** New state toggling/setting sort on `field` (filters + page preserved). */
  withSort(field: keyof T & string): TableState<T>;
}

export function tableState<const T extends Record<string, unknown>>(
  input: TableStateInput<T>,
): TableState<T>;

// ── Column descriptor (const-generic over the row type R) ────────────────────
export type ColumnAlign = "left" | "right" | "center";

export type Column<R, T extends Record<string, unknown> = Record<string, never>> = {
  /** Header label. */
  header: string;
  /** Cell renderer. Receives the typed row; returns a View or string. */
  cell: (row: R) => View | string;
  /** Text alignment for header + cells. Default "left". */
  align?: ColumnAlign;
  /** Make the column sortable. Value must be a key of the filter type T. */
  sortBy?: keyof T & string;
};

// ── Table.of: the data-grid builder ──────────────────────────────────────────
export type TableOptions<R, T extends Record<string, unknown>> = {
  columns: ReadonlyArray<Column<R, T>>;
  /** Route ref used to build sort + pagination links. Carries the swap target. */
  route: (options?: RouteHxOptions) => HTMX;
  /** Single source for page/sort/filters; preserved across all links. */
  state?: TableState<T>;
  /** Total page count — renders the footer pager when > 1. */
  totalPages?: number;
  /** HTMX options merged into every generated link (target/swap/pushUrl/indicator). */
  hx?: Omit<RouteHxOptions, "query">;
  /** Shown in place of <tbody> when `rows` is empty. */
  empty?: View | string;
};

export const Table: {
  (...children: View[]): Tag;                                    // unchanged element fn
  of<R, T extends Record<string, unknown> = Record<string, never>>(
    rows: ReadonlyArray<R>,
    options: TableOptions<R, T>,
  ): Tag;
};

// ── Low-level primitives (for hand-laid-out tables) ──────────────────────────
export function ThCell(label: string, align?: ColumnAlign): ThTag;
export function TdCell(content: View | string, align?: ColumnAlign): TdTag;

export function SortHeader<T extends Record<string, unknown>>(opts: {
  label: string;
  field: keyof T & string;
  state: TableState<T>;
  route: (options?: RouteHxOptions) => HTMX;
  align?: ColumnAlign;
  hx?: Omit<RouteHxOptions, "query">;
}): ThTag;

export function Pagination<T extends Record<string, unknown>>(opts: {
  state: TableState<T>;
  totalPages: number;
  route: (options?: RouteHxOptions) => HTMX;
  hx?: Omit<RouteHxOptions, "query">;
}): View;
```

Styling is themeable via a context so each brand keeps its tokens without per-app helpers:

```ts
export type TableTheme = {
  th: (t: ThTag) => ThTag;       // default: .padding("3").textSize("xs").fontWeight("medium").textColor("txt-muted").uppercase()
  td: (t: TdTag) => TdTag;       // default: .padding("3").textSize("sm").textColor("txt-secondary")
  sortActive: (t: Tag) => Tag;   // applied to the active sort header
};
export const TableThemeCtx: Context<TableTheme>;  // createContext(defaultTableTheme)
```

## Worked examples (before → after)

### Sort + pagination + filter preservation (the F-B-013 pain)

```ts
// before — glimm/src/analytics/views/event-log.view.ts:65 + :169 (TWO manual vals builders per table)
const buildSortHtmx = (vals: { sort: string; dir: SortDirection }) => {
  const extraVals: Record<string, string> = {};
  if (props.filters.event)    extraVals.event    = props.filters.event;
  if (props.filters.category) extraVals.category = props.filters.category;
  if (props.filters.userId)   extraVals.userId   = props.filters.userId;
  return analyticsRoutes.events({
    target: layoutIds.mainContent, swap: "outerMorph scroll:top",
    vals: { ...extraVals, sort: vals.sort, dir: vals.dir },
    pushUrl: true, indicator: layoutIds.globalLoading,
  });
};
// ...later, the pagination link rebuilds the SAME forwarding block plus sort/dir:
renderPageLink: (page, label) => {
  const vals: Record<string, string> = { page: String(page) };
  if (props.filters.event)    vals.event    = props.filters.event;
  if (props.filters.category) vals.category = props.filters.category;
  if (props.filters.userId)   vals.userId   = props.filters.userId;
  if (props.filters.sort)     vals.sort     = props.filters.sort;
  if (props.filters.dir)      vals.dir      = props.filters.dir;
  return A(label).setHtmx(analyticsRoutes.events({ /* target, swap, vals, pushUrl, indicator */ }))
    .textColor("primary").textSize("sm").on("hover", t => t.underline()).cursor("pointer");
},
// + SortHeader({ label, field, currentSort, currentDir, buildHtmx }) per column (analytics.components.ts:5)
// + the whole Pagination Div(IfThen, Span, IfThen) helper (ui.data.components.ts:102)
// + ThCell / TdCell helper definitions (ui.data.components.ts:80)
```

```ts
// after — RFC-B-06: one state object, declarative columns, zero manual vals
type EventFilters = { event?: string; category?: string; userId?: string };

const state = tableState<EventFilters>({
  page: props.filters.page,
  sort: props.filters.sort,
  dir:  props.filters.dir,
  filters: { event: props.filters.event, category: props.filters.category, userId: props.filters.userId },
});

Table.of(props.events, {
  route: analyticsRoutes.events,
  state,
  totalPages,
  hx: { target: layoutIds.mainContent, swap: "outerMorph scroll:top", pushUrl: true, indicator: layoutIds.globalLoading },
  empty: "No events match these filters.",
  columns: [
    { header: "Event",    cell: e => e.name,                      sortBy: "event" },
    { header: "Category", cell: e => Badge(e.category),           sortBy: "category" },
    { header: "User",     cell: e => e.userId,                    align: "right" },
    { header: "When",     cell: e => formatTime(e.at),            align: "right", sortBy: "userId" },
  ],
});
```

Filter preservation, sort-toggle, and the page footer are now derived from `state` — adding a filter field to `EventFilters` and to the `tableState({ filters })` call makes it flow through *both* the sort links and the page links automatically. The two divergent `Record<string,string>` builders, the `SortHeader`/`buildHtmx` callback, the `Pagination` helper, and the `ThCell`/`TdCell` definitions all disappear.

### Standalone pagination (the F-B-012 pain)

```ts
// before — rideshare/src/analytics/views/events.view.ts:153 (inlined, no helper)
IfThen(totalPages > 1, () =>
  Div(
    IfThen(props.filters.page > 1, () =>
      A("← Previous").setHtmx(analyticsRoutes.events({ query: { page: String(props.filters.page - 1) }, /* ...target, swap */ }))),
    Span(`Page ${props.filters.page} of ${totalPages}`).textSize("sm").textColor("body"),
    IfThen(props.filters.page < totalPages, () =>
      A("Next →").setHtmx(analyticsRoutes.events({ query: { page: String(props.filters.page + 1) }, /* ... */ }))),
  )...
)
```

```ts
// after — RFC-B-06
Pagination({
  state: tableState({ page: props.filters.page }),
  totalPages,
  route: analyticsRoutes.events,
  hx: { target: ids.mainContent, swap: "outerMorph scroll:top" },
})
```

### Low-level cells (the F-B-011 pain), for hand-laid tables

```ts
// before — jt-cut/src/shared/components/ui.components.ts:125 (redefined in 5 apps)
export function ThCell({ text, align = "left" }: ThCellProps) {
  return Th(text).textAlign(align).padding("3").textSize("xs").fontWeight("medium").textColor("txt-muted").uppercase();
}
export function TdCell({ content, align = "left" }: TdCellProps) {
  return Td(content).padding("3").textSize("sm").textColor("txt-secondary").textAlign(align);
}
```

```ts
// after — import from fluent-html, brand tokens come from TableThemeCtx
import { ThCell, TdCell } from "fluent-html";
Tr(ThCell("Path"), ThCell("Views", "right"));
Tr(TdCell(row.path), TdCell(String(row.views), "right"));
```

## Type-safety story

- **Const generic over the row type** — `Table.of<R, T>(rows, …)` infers `R` from `rows`, so `column.cell(row)` is fully typed; `cell: e => e.naem` is a compile error.
- **Literal-union sort keys** — `sortBy` and `SortHeader.field` are `keyof T & string`. With `tableState<const EventFilters>(…)`, `sortBy: "evnet"` is a compile error; only declared filter keys are sortable. This is the structural fix for F-B-014's incompatible callbacks: there is exactly one signature, and the column references the filter type by key.
- **Discriminated absence, not optional bags** — `totalPages?` controls whether the pager renders; `sortBy?` controls whether a header is sortable. No `currentSort`/`currentDir`/`buildHtmx` prop-drilling (F-B-014's `...sortProps`), because `TableState` carries them once.
- **`toQuery()` owns serialization** — callers never build `Record<string, string>`. Forgetting a filter is impossible: `withPage`/`withSort` return a *new* `TableState` that re-emits the full filter set, closing F-B-013's silent-reset bug class.
- **Reuses the typed route system** — `route` is the `defineRoutes` callable; the generated links go through the same `RouteHxOptions` (`target`/`swap`/`pushUrl`/`indicator` accept `Id`), so targets remain `defineIds`-checked. `query` is owned by `toQuery()`, never hand-concatenated.
- **Escape-by-default** — `header`/string cells and `toQuery()` values render through the normal escaping path; only explicit `Raw(...)` opts out. No new XSS surface.

## Migration & compatibility

**Additive.** `Table(...)` keeps its current call signature unchanged (`Table.of` is a static property added to the existing function; the element form is untouched). `ThCell`/`TdCell`/`SortHeader`/`Pagination`/`tableState`/`TableState` are new exports — no existing symbol changes.

- Apps adopt incrementally: drop their local `ThCell`/`TdCell`/`Pagination` and import the built-ins (the positional `ThCell(label, align?)` signature matches rideshare's; props-object callers do a one-line call-site change).
- No codemod required. An **optional** codemod could rewrite the two `Record<string,string>` forwarding blocks into a `tableState({ filters })` call, but the manual blocks keep working untouched.
- `breaking-changes.md`: no entry (additive).
- Class-string contract (§11.7): the default theme emits only classes already in the vocabulary (`padding`, `textSize`, `fontWeight`, `textColor`, `uppercase`, `textAlign`) — no new tokens, so no extractor/eslint change needed.

## Guidelines impact

New public surface → guideline edits are mandatory (§11.8). Patches three files.

### Index — `web-development/CLAUDE.md`

Insert under the existing "View Composition" / table area (after the Prisma block, before Fastify):

```md
## Data tables

**`Table.of(rows, { columns, route, state, totalPages })`** — the data-grid. Never hand-roll `ThCell`/`TdCell`/`Pagination`/sort headers, never build a `Record<string,string>` of vals:
```typescript
const state = tableState<EventFilters>({ page, sort, dir, filters });   // single source: page + sort + filters
Table.of(events, {
  route: analyticsRoutes.events,
  state, totalPages,
  hx: { target: ids.mainContent, swap: "outerMorph scroll:top", pushUrl: true },
  empty: "No events.",
  columns: [
    { header: "Event", cell: e => e.name,           sortBy: "event" },   // ✓ sortBy is keyof EventFilters
    { header: "Views", cell: e => String(e.views),  align: "right" },
  ],
})
```
✓ `state` preserves filters across page + sort changes automatically (`toQuery()` serializes — never reset by hand)
✓ `sortBy: "event"` is literal-checked against the filter type — `sortBy: "evnet"` is a compile error
✗ never `const vals: Record<string,string> = {}; if (filters.x) vals.x = filters.x` — that block is what `tableState` replaces
✗ never a `renderPageLink`/`buildHtmx` callback — pass `route` + `state`, links are built internally
✗ never per-app `ThCell`/`TdCell` — import from `fluent-html` (brand tokens via `TableThemeCtx`)
```

### Topic ref — `web-development/fluent-html.md`

Add a `## Data tables — Table.of` section after `## SVG Elements`:

```md
## Data tables — `Table.of`

Declarative data-grid: typed columns, sortable headers, pagination, and automatic filter preservation. Subsumes the per-app `ThCell`/`TdCell`/`SortHeader`/`Pagination` helpers.

```typescript
type EventFilters = { event?: string; category?: string; userId?: string };
const state = tableState<EventFilters>({ page, sort, dir, filters });

Table.of(events, {
  route: analyticsRoutes.events,         // a defineRoutes callable; carries swap target via `hx`
  state,                                  // page + sort + filters, single-sourced
  totalPages,                             // pager renders only when > 1
  hx: { target: ids.mainContent, swap: "outerMorph scroll:top", pushUrl: true, indicator: ids.globalLoading },
  empty: "No events match these filters.",
  columns: [
    { header: "Event",    cell: e => e.name,            sortBy: "event" },
    { header: "Category", cell: e => Badge(e.category), sortBy: "category" },
    { header: "User",     cell: e => e.userId,          align: "right" },
  ],
})
```

- `cell: (row) => View | string` — row is the inferred element type of `rows`; `e.naem` is a compile error.
- `sortBy: keyof T & string` — only declared filter keys are sortable; one signature, no `buildHtmx` callback.
- `align?: "left" | "right" | "center"` — applies to header + cells.

**State helpers** — never build vals by hand:
```typescript
state.toQuery()                 // { page, sort, dir, ...non-empty filters } — for setHtmx query
state.withPage(2)               // new state, filters + sort preserved
state.withSort("category")      // toggles asc/desc on category, filters + page preserved
```

**Low-level primitives** (hand-laid tables only):
```typescript
Tr(ThCell("Path"), ThCell("Views", "right"))         // ✓ styled <th>
Tr(TdCell(row.path), TdCell(String(row.views), "right"))
SortHeader({ label: "Views", field: "views", state, route: analyticsRoutes.events, align: "right" })
Pagination({ state, totalPages, route: analyticsRoutes.events, hx: { target: ids.mainContent } })
```
✗ never redefine `ThCell`/`TdCell` per app — import them; theme via `TableThemeCtx`.

**Theming** — set brand tokens once per app via context, not per-helper:
```typescript
using _ = TableThemeCtx.scope({
  th: t => t.padding("3").textSize("xs").fontWeight("medium").textColor("brand-muted").uppercase(),
  td: t => t.padding("3").textSize("sm").textColor("brand-body"),
  sortActive: t => t.textColor("brand-primary"),
});
```
```

### Topic ref — `web-development/htmx.md`

Add after `## Resolved URLs` (it teaches the route-ref → links contract for tables):

```md
## Tables: sort/filter preservation

`Table.of` / `Pagination` / `SortHeader` take a `defineRoutes` callable + a `TableState`; they build every sort and page link internally and forward filters via `state.toQuery()`. Never hand-forward params:
```typescript
// ✓ filters preserved across page + sort automatically
Table.of(rows, { route: r.events, state, totalPages, hx: { target: ids.mainContent, swap: "outerMorph scroll:top", pushUrl: true } })

// ✗ never two divergent vals builders (sort + page) that copy each filter by hand —
//   a forgotten field silently resets the filter on the next page-turn / sort-click
```
```

**Adoption note:** the old guidelines had `ThCell`/`Pagination` only as informal per-app helpers, and never addressed *combined* sort+pagination, so every app independently invented the `Record<string,string>` forwarding block (and got it subtly wrong — the F-B-013 silent-reset bug). The `TableState` single-source is the missing teaching that prevents it.

## Guardrail check

- §11.1 zero-deps: **pass** — pure TS over existing `Tag`/route primitives, no new dependency.
- §11.2 ssr-only / fast path: **pass** — synchronous render; no async/suspense introduced.
- §11.3 escape-by-default: **pass** — headers, string cells, and `toQuery()` values escape; only explicit `Raw` opts out.
- §11.4 type-safety: **pass** — const-generic row type, `keyof T & string` sort keys, literal `SortDir`/`ColumnAlign`, no `any`.
- §11.5 backward-compat: **pass** — additive; `Table()` element form unchanged; no `breaking-changes.md` entry.
- §11.6 idiom consistency: **pass** — variadic `Table(...)` preserved, `defineRoutes`/`defineIds` single-sourcing, `.on()`/`.at()` defaults, no inline JS.
- §11.7 class-string contract: **pass** — default theme emits only existing vocabulary classes; no extractor/eslint change.
- §11.8 guideline-sync: **pass** — Guidelines impact patches CLAUDE.md + fluent-html.md + htmx.md and covers every `api_surface` symbol (`Table.of`, `tableState`, `Pagination`, `ThCell`, `TdCell`, `SortHeader`, `TableState`).

## Alternatives considered

- **Ship only `ThCell`/`TdCell`/`Pagination` primitives, no `Table.of`.** Rejected: leaves F-B-013 (the highest-pain, correctness-risk finding) unsolved — apps would still hand-build the dual vals forwarders. The `TableState` single-source is the load-bearing piece; the cells are the easy part.
- **Keep the `renderPageLink`/`buildHtmx` callback, just standardize its signature.** Rejected: the callback *is* the boilerplate (F-B-012/F-B-014). A callback still forces every call site to re-pass route/target/swap and re-forward filters. Passing `route` + `state` removes the callback entirely.
- **`AsyncLocalStorage`/request context to carry filters implicitly.** Rejected: violates the "never AsyncLocalStorage for render-time data" guideline; `TableState` is an explicit, typed, testable value passed as a prop.
- **Generic `DataGrid` component decoupled from routes.** Rejected: the measured pain is specifically HTMX link generation with filter preservation; binding to the `defineRoutes` callable is the whole point and matches house idiom.

## Open questions

- **Theme defaults vs tokens.** Default theme uses semantic tokens (`txt-muted`, `txt-secondary`) seen in jt-cut/glimm, but rideshare uses `muted`/`body`. Ship neutral defaults and require apps to scope `TableThemeCtx`, or read from an app-level palette context? (Leaning: neutral defaults + `TableThemeCtx`.)
- **`withSort` toggle policy.** Confirm the asc/desc cycle: first click on a new column → `desc` (matches jt-cut `nextDir`), re-click toggles. Should a third state (clear sort) exist? (Leaning: two-state, matches all cited apps.)
- **Page-window rendering.** Cited apps render only prev/next + "Page X of Y". Should `Pagination` optionally render numbered page windows (1 … 4 5 6 … 20)? (Leaning: out of scope for v1; prev/next matches measured usage.)
